"use client";

import { Reward } from "@/lib/api";
import { useI18n } from "@/context/I18nContext";

interface Props {
  rewards: Reward[];
  onRedeem?: (reward: Reward) => void;
  redeeming?: string | null; // reward id being redeemed
}

export function RewardList({ rewards, onRedeem, redeeming }: Props) {
  const { t } = useI18n();

  if (rewards.length === 0) {
    return <p className="empty-state">{t('rewards.noRewards')}</p>;
  }

  return (
    <ul className="reward-list">
      {rewards.map((r) => (
        <li key={r.id} className="reward-item">
          <div>
            <strong>{t('campaigns.details.campaign')} #{r.campaign_id}</strong>
            <span className="reward-amount">{r.amount.toLocaleString()} LYT</span>
          </div>
          <div className="reward-meta">
            <span>{r.redeemed ? t('rewards.redeemed', { amount: r.redeemed_amount.toString() }) : t('rewards.available')}</span>
            <span>{new Date(r.claimed_at).toLocaleDateString()}</span>
          </div>
          {onRedeem && !r.redeemed && (
            <button
              onClick={() => onRedeem(r)}
              disabled={redeeming === r.id}
              className="btn btn-secondary"
              aria-label={`${redeeming === r.id ? t('rewards.actions.redeeming') : t('rewards.actions.redeem')} ${r.amount.toLocaleString()} LYT from campaign #${r.campaign_id}`}
            >
              {redeeming === r.id ? t('rewards.actions.redeeming') : t('rewards.actions.redeem')}
            </button>
          )}
        </li>
      ))}
    </ul>
  );
}
