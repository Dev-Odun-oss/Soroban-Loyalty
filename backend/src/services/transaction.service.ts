import { pool } from "../db";
import type { TransactionRecord } from "../types";

export type { TransactionRecord };

/**
 * Lists indexed on-chain transactions for a user with campaign context.
 *
 * @param address - Stellar public key of the user.
 * @param limit - Maximum rows per page (default 20).
 * @param offset - Rows to skip for pagination (default 0).
 * @returns Transaction rows (newest first) and the total matching count.
 * @throws Propagates database errors from the list or count queries.
 */
export async function getTransactionsByUser(
  address: string,
  limit: number = 20,
  offset: number = 0
): Promise<{ transactions: TransactionRecord[]; total: number }> {
  const transactionsQuery = `
    SELECT 
      t.tx_hash, 
      t.type, 
      t.user_address, 
      t.campaign_id, 
      c.merchant as campaign_name, -- using merchant address as name if no actual name field
      t.amount, 
      t.ledger, 
      t.created_at
    FROM transactions t
    LEFT JOIN campaigns c ON c.id = t.campaign_id
    WHERE t.user_address = $1
    ORDER BY t.created_at DESC
    LIMIT $2 OFFSET $3
  `;

  const countQuery = `
    SELECT COUNT(*) as total FROM transactions WHERE user_address = $1
  `;

  const [txResult, countResult] = await Promise.all([
    pool.query<TransactionRecord>(transactionsQuery, [address, limit, offset]),
    pool.query<{ total: string }>(countQuery, [address])
  ]);

  return {
    transactions: txResult.rows,
    total: parseInt(countResult.rows[0].total, 10)
  };
}
