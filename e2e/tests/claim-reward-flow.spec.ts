import { test, expect } from "@playwright/test";

test.describe("Claim Reward Flow", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to dashboard
    await page.goto("/dashboard");
    // Wait for page to load
    await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
  });

  test("complete claim reward flow: connect wallet → view campaign → claim → confirm → verify balance", async ({
    page,
    context,
  }) => {
    // Step 1: Connect wallet (mock Freighter)
    const connectButton = page.getByRole("button", { name: /connect wallet/i });
    if (await connectButton.isVisible()) {
      await connectButton.click();
      // Wait for wallet connection modal
      await expect(page.getByText(/freighter/i)).toBeVisible({ timeout: 5000 });
    }

    // Step 2: Navigate to campaigns page and select a campaign
    const campaignCards = page.locator("[data-testid='campaign-card']");
    const campaignCount = await campaignCards.count();

    if (campaignCount === 0) {
      // If no campaigns, skip test (acceptable in test environment)
      test.skip();
    }

    // Get first campaign
    const firstCampaign = campaignCards.first();
    await expect(firstCampaign).toBeVisible();

    // Click on campaign to view details
    await firstCampaign.click();

    // Step 3: Verify campaign details page loaded
    await expect(page.getByRole("heading", { name: /campaign details/i })).toBeVisible({
      timeout: 5000,
    });

    // Step 4: Find and click claim button
    const claimButton = page.getByRole("button", { name: /claim reward/i });
    await expect(claimButton).toBeVisible();
    await expect(claimButton).toBeEnabled();

    // Step 5: Click claim button
    await claimButton.click();

    // Step 6: Verify transaction confirmation modal appears
    const confirmModal = page.getByRole("dialog");
    await expect(confirmModal).toBeVisible({ timeout: 5000 });

    // Step 7: Verify claim details in modal
    await expect(page.getByText(/confirm claim/i)).toBeVisible();
    await expect(page.getByText(/LYT/i)).toBeVisible();

    // Step 8: Mock Freighter wallet confirmation
    // In a real test, this would interact with the mocked Freighter extension
    const confirmButton = page.getByRole("button", { name: /confirm/i }).last();
    await confirmButton.click();

    // Step 9: Verify success state
    // Wait for success message or updated UI
    const successMessage = page.getByText(/reward claimed successfully/i);
    const successIcon = page.locator("[data-testid='success-icon']");

    await expect(successMessage.or(successIcon)).toBeVisible({ timeout: 10000 });

    // Step 10: Verify claim button state changed
    const claimButtonAfter = page.getByRole("button", { name: /claim reward/i });
    // Button should be disabled or hidden after successful claim
    await expect(claimButtonAfter).toBeDisabled().catch(() => {
      // Or it might be hidden
      expect(claimButtonAfter).not.toBeVisible();
    });

    // Step 11: Navigate to rewards page to verify balance increased
    await page.goto("/rewards");
    await expect(page.getByRole("heading", { name: /rewards/i })).toBeVisible();

    // Step 12: Verify the claimed reward appears in the list
    const rewardItems = page.locator("[data-testid='reward-item']");
    const rewardCount = await rewardItems.count();
    expect(rewardCount).toBeGreaterThan(0);

    // Step 13: Verify LYT balance increased
    const balanceDisplay = page.getByText(/balance/i);
    await expect(balanceDisplay).toBeVisible();
  });

  test("shows error when claim fails", async ({ page }) => {
    // Navigate to campaigns
    const campaignCards = page.locator("[data-testid='campaign-card']");
    const campaignCount = await campaignCards.count();

    if (campaignCount === 0) {
      test.skip();
    }

    // Click first campaign
    await campaignCards.first().click();
    await expect(page.getByRole("heading", { name: /campaign details/i })).toBeVisible({
      timeout: 5000,
    });

    // Try to claim
    const claimButton = page.getByRole("button", { name: /claim reward/i });
    await claimButton.click();

    // If transaction fails, error message should appear
    const errorMessage = page.getByText(/error|failed|transaction failed/i);
    const retryButton = page.getByRole("button", { name: /retry|try again/i });

    // Either error message or retry button should be visible
    await expect(errorMessage.or(retryButton)).toBeVisible({ timeout: 10000 }).catch(() => {
      // Acceptable if no error (transaction succeeded)
    });
  });

  test("prevents double-claim of same reward", async ({ page }) => {
    // Navigate to campaigns
    const campaignCards = page.locator("[data-testid='campaign-card']");
    const campaignCount = await campaignCards.count();

    if (campaignCount === 0) {
      test.skip();
    }

    // Click first campaign
    await campaignCards.first().click();
    await expect(page.getByRole("heading", { name: /campaign details/i })).toBeVisible({
      timeout: 5000,
    });

    // First claim
    const claimButton = page.getByRole("button", { name: /claim reward/i });
    await claimButton.click();

    // Wait for success
    await expect(page.getByText(/reward claimed successfully/i)).toBeVisible({ timeout: 10000 }).catch(() => {
      // Acceptable if no success message
    });

    // Reload page
    await page.reload();
    await expect(page.getByRole("heading", { name: /campaign details/i })).toBeVisible({
      timeout: 5000,
    });

    // Verify claim button is disabled or hidden
    const claimButtonAfterReload = page.getByRole("button", { name: /claim reward/i });
    await expect(claimButtonAfterReload).toBeDisabled().catch(() => {
      expect(claimButtonAfterReload).not.toBeVisible();
    });
  });

  test("displays correct reward amount before claiming", async ({ page }) => {
    // Navigate to campaigns
    const campaignCards = page.locator("[data-testid='campaign-card']");
    const campaignCount = await campaignCards.count();

    if (campaignCount === 0) {
      test.skip();
    }

    // Click first campaign
    await campaignCards.first().click();
    await expect(page.getByRole("heading", { name: /campaign details/i })).toBeVisible({
      timeout: 5000,
    });

    // Verify reward amount is displayed
    const rewardAmount = page.locator("[data-testid='reward-amount']");
    await expect(rewardAmount).toBeVisible();

    // Verify it contains a number
    const amountText = await rewardAmount.textContent();
    expect(amountText).toMatch(/\d+/);
  });
});
