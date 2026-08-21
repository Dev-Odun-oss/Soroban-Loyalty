"use client";

import { useState } from "react";
import { useSorobanTransaction } from "@/hooks/useSorobanTransaction";
import { SorobanErrorBoundary } from "./SorobanErrorBoundary";
import { ConfirmDialog } from "./ConfirmDialog";
import { Input } from "@/components/Input";

interface Props {
  balance: number;
  onRedeem: (amount: number) => Promise<void>;
}

function RedeemFormContent({ balance, onRedeem }: Props) {
  const [amount, setAmount] = useState("");
  const [confirming, setConfirming] = useState(false);
  const { execute, loading, error, clearError } = useSorobanTransaction({
    showToast: true,
    onSuccess: () => {
      setAmount("");
      setConfirming(false);
      clearError();
    }
  });

  const parsed = parseFloat(amount);
  const isValid = !isNaN(parsed) && parsed > 0 && parsed <= balance;

  const handleConfirm = async () => {
    if (!isValid) return;
    await execute(async () => {
      await onRedeem(parsed);
    });
  };

  return (
    <div className="card" style={{ maxWidth: 420 }}>
      <div className="card-body">
        <div style={{ marginBottom: 12 }}>
          <span style={{ fontSize: "0.8rem", color: "#64748b" }}>Current Balance</span>
          <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "#7c6af7" }}>
            {balance.toLocaleString()} LYT
          </div>
        </div>

        {error && (
          <div className="alert alert-error" style={{ marginBottom: "1rem" }}>
            {error.userMessage}
            {error.shouldShowRetry && (
              <button
                onClick={handleConfirm}
                style={{ marginLeft: "0.5rem", textDecoration: "underline" }}
              >
                Retry
              </button>
            )}
          </div>
        )}

        <Input
          id="redeem-amount"
          label="Amount to Redeem (LYT)"
          type="number"
          min="1"
          max={balance}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder={`Max ${balance.toLocaleString()}`}
          disabled={loading}
          error={amount && !isValid
            ? (parsed > balance ? "Exceeds balance" : "Enter a valid amount")
            : undefined}
        />

        <button
          className="btn btn-primary"
          disabled={!isValid || loading}
          onClick={() => setConfirming(true)}
          style={{ width: "100%" }}
        >
          Redeem LYT
        </button>

        <ConfirmDialog
          open={confirming}
          title="Burn LYT tokens?"
          description={`You are about to permanently burn ${isValid ? parsed.toLocaleString() : "0"} LYT. This action cannot be undone.`}
          confirmLabel="Confirm & Burn"
          loading={loading}
          onConfirm={handleConfirm}
          onCancel={() => setConfirming(false)}
        />
      </div>
    </div>
  );
}

export function RedeemForm(props: Props) {
  return (
    <SorobanErrorBoundary>
      <RedeemFormContent {...props} />
    </SorobanErrorBoundary>
  );
}
