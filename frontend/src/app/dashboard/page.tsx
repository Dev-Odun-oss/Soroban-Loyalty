"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useWallet } from "@/context/WalletContext";
import { useI18n } from "@/context/I18nContext";
import { api, Campaign, Reward } from "@/lib/api";
import { claimReward, redeemReward } from "@/lib/soroban";
import { CampaignCard } from "@/components/CampaignCard";
import { RewardList } from "@/components/RewardList";
import { NetworkBanner } from "@/components/NetworkBanner";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { useToast } from "@/context/ToastContext";
import Link from "next/link";

const PAGE_SIZE = 20;

export default function DashboardPage() {
  const { publicKey, refreshBalance } = useWallet();
  const { t } = useI18n();
  const { health } = useNetworkStatus();
  const { toast } = useToast();

  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [campaignError, setCampaignError] = useState<string | null>(null);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [rewardError, setRewardError] = useState<string | null>(null);
  const [claimingId, setClaimingId] = useState<number | null>(null);
  const [redeemingId, setRedeemingId] = useState<string | null>(null);
  const [optimisticClaimed, setOptimisticClaimed] = useState<Set<number>>(new Set());
  const [offset, setOffset] = useState(0);
  const [total, setTotal] = useState<number | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const networkDisabled = health.status === "unreachable";

  const loadCampaigns = useCallback(
    async (nextOffset: number, replace = false) => {
      if (replace) setLoadingCampaigns(true);
      setLoadingMore(true);
      setCampaignError(null);
      try {
        const response = await api.getCampaigns(PAGE_SIZE, nextOffset);
        setCampaigns((prev) => (replace ? response.campaigns : [...prev, ...response.campaigns]));
        setOffset(nextOffset + response.campaigns.length);
        setTotal(response.total);
      } catch (err) {
        setCampaignError(err instanceof Error ? err.message : "Failed to load campaigns");
      } finally {
        setLoadingMore(false);
        if (replace) setLoadingCampaigns(false);
      }
    },
    []
  );

  const loadRewards = useCallback(async () => {
    if (!publicKey) return;
    setRewardError(null);
    try {
      const r = await api.getUserRewards(publicKey);
      setRewards(r.rewards);
      const claimedIds = r.rewards.filter((rw) => !rw.redeemed).map((rw) => rw.campaign_id);
      setOptimisticClaimed(new Set(claimedIds));
    } catch (err) {
      setRewardError(err instanceof Error ? err.message : "Failed to load rewards");
    }
  }, [publicKey]);

  useEffect(() => {
    loadCampaigns(0, true);
  }, [loadCampaigns]);

  useEffect(() => {
    loadRewards();
  }, [loadRewards]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loadingMore && total !== null && offset < total) {
          loadCampaigns(offset);
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadingMore, offset, total, loadCampaigns]);

  const handleClaim = async (campaignId: number) => {
    if (!publicKey) {
      toast("Please connect your wallet first", "error");
      return;
    }
    if (networkDisabled) {
      toast("Network is unreachable. Please try again later.", "error");
      return;
    }
    setClaimingId(campaignId);
    try {
      await claimReward(publicKey, campaignId);
      setOptimisticClaimed((prev) => new Set(prev).add(campaignId));
      toast("Reward claimed successfully!", "success");
      const r = await api.getUserRewards(publicKey);
      setRewards(r.rewards);
      await refreshBalance();
    } catch (err: unknown) {
      toast(err instanceof Error ? err.message : t("messages.claimFailed"), "error");
    } finally {
      setClaimingId(null);
    }
  };

  const handleRedeem = async (rewardId: string, amount: number) => {
    if (!publicKey) {
      toast("Please connect your wallet first", "error");
      return;
    }
    if (networkDisabled) {
      toast("Network is unreachable. Please try again later.", "error");
      return;
    }
    setRedeemingId(rewardId);
    try {
      await redeemReward(publicKey, BigInt(amount));
      toast("Reward redeemed successfully!", "success");
      const r = await api.getUserRewards(publicKey);
      setRewards(r.rewards);
      await refreshBalance();
    } catch (err: unknown) {
      toast(err instanceof Error ? err.message : t("messages.redeemFailed"), "error");
    } finally {
      setRedeemingId(null);
    }
  };

  if (!publicKey) {
    return (
      <div className="container">
        <NetworkBanner />
        <div className="alert alert-warning" style={{ marginTop: "2rem" }}>
          Please connect your Freighter wallet to view campaigns and rewards.
        </div>
      </div>
    );
  }

  const hasMore = total !== null && offset < total;

  return (
    <div className="container">
      <NetworkBanner />

      <section style={{ marginBottom: "2rem" }}>
        <h1 className="page-title">Active Campaigns</h1>
        {campaignError ? (
          <ErrorState message={campaignError} onRetry={() => loadCampaigns(0, true)} />
        ) : campaigns.length === 0 && !loadingMore ? (
          <EmptyState
            illustration="campaigns"
            title="No active campaigns"
            description="Check back later for new loyalty campaigns."
          />
        ) : (
          <div className="campaign-grid">
            {campaigns.map((campaign) => (
              <CampaignCard
                key={campaign.id}
                campaign={campaign}
                isClaimed={optimisticClaimed.has(campaign.id)}
                isClaiming={claimingId === campaign.id}
                onClaim={() => handleClaim(campaign.id)}
                disabled={networkDisabled}
              />
            ))}
          </div>
        )}
      </section>

      <section style={{ marginTop: 40 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <h2 className="section-title" style={{ marginBottom: 0 }}>{t("rewards.title")}</h2>
          <Link href="/dashboard/history" className="btn btn-outline" style={{ fontSize: "0.8rem", padding: "4px 12px" }}>
            View History
          </Link>
        </div>
        <RewardList
          rewards={rewards}
          onRedeem={networkDisabled ? undefined : handleRedeem}
          redeeming={redeemingId}
          error={rewardError}
          onRetry={loadRewards}
        />
      </section>

      {hasMore && <div ref={sentinelRef} style={{ height: 1 }} aria-hidden="true" />}
    </div>
  );
}
