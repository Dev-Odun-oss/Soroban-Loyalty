"use client";

import { useEffect, useState } from "react";
import { useWallet } from "@/context/WalletContext";
import { api, Campaign } from "@/lib/api";
import { createCampaign } from "@/lib/soroban";
import { CampaignCard } from "@/components/CampaignCard";

export default function MerchantPage() {
  const { publicKey } = useWallet();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [rewardAmount, setRewardAmount] = useState("");
  const [expirationDays, setExpirationDays] = useState("30");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const loadCampaigns = async () => {
    // Fetch all merchant campaigns (up to 100) for the merchant portal
    const r = await api.getCampaigns(100, 0);
    if (publicKey) {
      setCampaigns(r.campaigns.filter((c) => c.merchant === publicKey));
    } else {
      setCampaigns(r.campaigns);
    }
  };

  useEffect(() => {
    loadCampaigns().catch(console.error);
  }, [publicKey]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!publicKey) return setMessage({ type: "error", text: "Connect wallet first" });
    const amount = parseInt(rewardAmount, 10);
    if (isNaN(amount) || amount <= 0) return setMessage({ type: "error", text: "Invalid reward amount" });
    const days = parseInt(expirationDays, 10);
    if (isNaN(days) || days <= 0) return setMessage({ type: "error", text: "Invalid expiration" });

    const expiration = Math.floor(Date.now() / 1000) + days * 86400;
    setSubmitting(true);
    setMessage(null);
    try {
      await createCampaign(publicKey, BigInt(amount), expiration);
      setMessage({ type: "success", text: "Campaign created successfully!" });
      setRewardAmount("");
      await loadCampaigns();
    } catch (err: unknown) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Failed to create campaign" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h1 className="page-title">Merchant Portal</h1>

      {message && <div className={`alert alert-${message.type}`}>{message.text}</div>}

      {!publicKey && (
        <div className="alert alert-error">Connect your Freighter wallet to create campaigns.</div>
      )}

      <section style={{ maxWidth: 480, marginBottom: 48 }}>
        <h2 className="section-title">Create Campaign</h2>
        <form onSubmit={handleCreate}>
          <div className="form-group">
            <label htmlFor="reward-amount">Reward Amount (LYT)</label>
            <input
              id="reward-amount"
              type="number"
              min="1"
              value={rewardAmount}
              onChange={(e) => setRewardAmount(e.target.value)}
              placeholder="e.g. 100"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="expiration-days">Duration (days)</label>
            <input
              id="expiration-days"
              type="number"
              min="1"
              value={expirationDays}
              onChange={(e) => setExpirationDays(e.target.value)}
              placeholder="30"
              required
            />
          </div>
          <button type="submit" disabled={submitting || !publicKey} className="btn btn-primary">
            {submitting ? "Creating…" : "Create Campaign"}
          </button>
        </form>
      </section>

      <section>
        <h2 className="section-title">My Campaigns</h2>
        {campaigns.length === 0 ? (
          <p className="empty-state">No campaigns yet.</p>
        ) : (
          <div className="grid">
            {campaigns.map((c) => (
              <CampaignCard key={c.id} campaign={c} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
