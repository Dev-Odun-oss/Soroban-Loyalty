"use client";

import { useState } from "react";
import { createCampaign } from "@/lib/soroban";

interface Props {
  publicKey: string;
  onSuccess: () => void;
}

interface FormFields {
  name: string;
  rewardAmount: string;
  expiresAt: string;
}

type Step = "input" | "confirm" | "success";

const EXPLORER_BASE = "https://stellar.expert/explorer/testnet/tx";

const today = () => new Date().toISOString().split("T")[0];

function validate(f: FormFields): Partial<FormFields> {
  const errors: Partial<FormFields> = {};
  if (!f.name.trim()) errors.name = "Campaign name is required";
  const amount = parseInt(f.rewardAmount, 10);
  if (isNaN(amount) || amount <= 0) errors.rewardAmount = "Enter a positive reward amount";
  if (!f.expiresAt) {
    errors.expiresAt = "Expiration date is required";
  } else if (f.expiresAt <= today()) {
    errors.expiresAt = "Expiration must be in the future";
  }
  return errors;
}

export function CreateCampaignForm({ publicKey, onSuccess }: Props) {
  const [fields, setFields] = useState<FormFields>({ name: "", rewardAmount: "", expiresAt: "" });
  const [errors, setErrors] = useState<Partial<FormFields>>({});
  const [step, setStep] = useState<Step>("input");
  const [loading, setLoading] = useState(false);
  const [txError, setTxError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  const set = (key: keyof FormFields) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFields((f) => ({ ...f, [key]: e.target.value }));
    // Clear the error for this field as soon as the user starts correcting it
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const handleReview = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate(fields);
    setErrors(errs);
    if (Object.keys(errs).length === 0) setStep("confirm");
  };

  const handleConfirm = async () => {
    setLoading(true);
    setTxError(null);
    try {
      const expiration = Math.floor(new Date(fields.expiresAt).getTime() / 1000);
      const result = await createCampaign(publicKey, BigInt(parseInt(fields.rewardAmount, 10)), expiration);
      setTxHash(result.txHash);
      setStep("success");
      onSuccess();
    } catch (err: unknown) {
      setTxError(err instanceof Error ? err.message : "Transaction failed");
      setStep("input");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFields({ name: "", rewardAmount: "", expiresAt: "" });
    setErrors({});
    setTxHash(null);
    setTxError(null);
    setStep("input");
  };

  if (step === "success") {
    return (
      <div className="card" style={{ maxWidth: 480 }}>
        <div className="card-body">
          <div className="alert alert-success">Campaign created successfully!</div>
          <p style={{ fontSize: "0.85rem", color: "#94a3b8", wordBreak: "break-all" }}>
            <strong>Transaction hash:</strong> {txHash}
          </p>
          <a
            href={`${EXPLORER_BASE}/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-outline"
            style={{ display: "inline-block", marginBottom: 12 }}
          >
            View on Stellar Explorer ↗
          </a>
          <br />
          <button className="btn btn-primary" onClick={handleReset}>
            Create Another Campaign
          </button>
        </div>
      </div>
    );
  }

  if (step === "confirm") {
    return (
      <div className="card" style={{ maxWidth: 480 }}>
        <div className="card-body">
          <h3 style={{ marginBottom: 16 }}>Confirm Campaign</h3>
          <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 20, fontSize: "0.9rem" }}>
            <tbody>
              {[
                ["Name", fields.name],
                ["Reward Amount", `${parseInt(fields.rewardAmount, 10).toLocaleString()} LYT`],
                ["Expires", fields.expiresAt],
              ].map(([label, value]) => (
                <tr key={label}>
                  <td style={{ padding: "6px 0", color: "#94a3b8", width: "40%" }}>{label}</td>
                  <td style={{ padding: "6px 0", fontWeight: 600 }}>{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {txError && <div className="alert alert-error">{txError}</div>}
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn btn-outline" onClick={() => setStep("input")} disabled={loading} style={{ flex: 1 }}>
              Back
            </button>
            <button className="btn btn-primary" onClick={handleConfirm} disabled={loading} style={{ flex: 1 }}>
              {loading ? "Submitting…" : "Confirm & Submit"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleReview} style={{ maxWidth: 480 }} noValidate>
      {txError && <div className="alert alert-error">{txError}</div>}

      <div className="form-group">
        <label htmlFor="ccf-name">Campaign Name</label>
        <input
          id="ccf-name"
          type="text"
          value={fields.name}
          onChange={set("name")}
          placeholder="e.g. Summer Rewards"
          aria-describedby={errors.name ? "ccf-name-err" : undefined}
        />
        {errors.name && <span id="ccf-name-err" style={{ fontSize: "0.8rem", color: "#f87171" }}>{errors.name}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="ccf-amount">Reward Amount (LYT)</label>
        <input
          id="ccf-amount"
          type="number"
          min="1"
          value={fields.rewardAmount}
          onChange={set("rewardAmount")}
          placeholder="e.g. 100"
          aria-describedby={errors.rewardAmount ? "ccf-amount-err" : undefined}
        />
        {errors.rewardAmount && <span id="ccf-amount-err" style={{ fontSize: "0.8rem", color: "#f87171" }}>{errors.rewardAmount}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="ccf-expires">Expiration Date</label>
        <input
          id="ccf-expires"
          type="date"
          min={today()}
          value={fields.expiresAt}
          onChange={set("expiresAt")}
          aria-describedby={errors.expiresAt ? "ccf-expires-err" : undefined}
        />
        {errors.expiresAt && <span id="ccf-expires-err" style={{ fontSize: "0.8rem", color: "#f87171" }}>{errors.expiresAt}</span>}
      </div>

      <button type="submit" className="btn btn-primary" disabled={Object.keys(errors).length > 0}>
        Review Campaign
      </button>
    </form>
  );
}
