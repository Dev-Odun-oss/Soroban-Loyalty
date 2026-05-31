import { render, screen, fireEvent } from "./test-utils";
import { RewardList } from "@/components/RewardList";
import { Reward } from "@/lib/api";

const reward: Reward = {
  id: "r1",
  user_address: "GABC",
  campaign_id: 1,
  amount: 100,
  redeemed: false,
  redeemed_amount: 0,
  claimed_at: new Date().toISOString(),
};

describe("RewardList Component", () => {
  describe("Empty State", () => {
    test("shows empty state when no rewards", () => {
      render(<RewardList rewards={[]} />);
      expect(screen.getByText(/no rewards yet/i)).toBeInTheDocument();
    });

    test("empty state has CTA link to dashboard", () => {
      render(<RewardList rewards={[]} />);
      const link = screen.getByRole("link", { name: /claim your first reward/i });
      expect(link).toHaveAttribute("href", "/dashboard");
    });
  });

  describe("Populated State", () => {
    test("renders reward items with correct data", () => {
      render(<RewardList rewards={[reward]} />);
      expect(screen.getByText(/Campaign #1/)).toBeInTheDocument();
      expect(screen.getByText(/100/)).toBeInTheDocument();
      expect(screen.getByText(/Available/i)).toBeInTheDocument();
    });

    test("renders multiple rewards", () => {
      const r2 = { ...reward, id: "r2", campaign_id: 2, amount: 200 };
      render(<RewardList rewards={[reward, r2]} />);
      expect(screen.getByText(/Campaign #1/)).toBeInTheDocument();
      expect(screen.getByText(/Campaign #2/)).toBeInTheDocument();
    });

    test("displays claim date for each reward", () => {
      const date = new Date("2026-05-30");
      const rewardWithDate = { ...reward, claimed_at: date.toISOString() };
      render(<RewardList rewards={[rewardWithDate]} />);
      expect(screen.getByText(date.toLocaleDateString())).toBeInTheDocument();
    });

    test("shows redeemed status with amount", () => {
      render(<RewardList rewards={[{ ...reward, redeemed: true, redeemed_amount: 100 }]} />);
      expect(screen.getByText(/Redeemed 100 LYT/i)).toBeInTheDocument();
    });

    test("hides redeem button for redeemed rewards", () => {
      render(<RewardList rewards={[{ ...reward, redeemed: true, redeemed_amount: 100 }]} />);
      expect(screen.queryByRole("button", { name: /redeem/i })).not.toBeInTheDocument();
    });
  });

  describe("Claim Button Interaction", () => {
    test("renders redeem button for unredeemed rewards", () => {
      render(<RewardList rewards={[reward]} onRedeem={() => {}} />);
      expect(screen.getByRole("button", { name: /redeem/i })).toBeInTheDocument();
    });

    test("triggers onClaim callback with correct reward ID", () => {
      const onRedeem = jest.fn();
      render(<RewardList rewards={[reward]} onRedeem={onRedeem} />);
      const button = screen.getByRole("button", { name: /redeem/i });
      fireEvent.click(button);
      expect(onRedeem).toHaveBeenCalledWith(reward);
    });

    test("disables redeem button when redeeming", () => {
      render(<RewardList rewards={[reward]} onRedeem={() => {}} redeeming={reward.id} />);
      const button = screen.getByRole("button", { name: /redeeming/i });
      expect(button).toBeDisabled();
    });

    test("shows redeeming state text", () => {
      render(<RewardList rewards={[reward]} onRedeem={() => {}} redeeming={reward.id} />);
      expect(screen.getByText(/Redeeming/i)).toBeInTheDocument();
    });

    test("does not disable button for other rewards while redeeming", () => {
      const r2 = { ...reward, id: "r2", campaign_id: 2 };
      render(<RewardList rewards={[reward, r2]} onRedeem={() => {}} redeeming={reward.id} />);
      const buttons = screen.getAllByRole("button", { name: /redeem/i });
      expect(buttons[0]).toBeDisabled();
      expect(buttons[1]).not.toBeDisabled();
    });

    test("has accessible aria-label on redeem button", () => {
      render(<RewardList rewards={[reward]} onRedeem={() => {}} />);
      const button = screen.getByRole("button", { name: /redeem 100 lyt from campaign 1/i });
      expect(button).toBeInTheDocument();
    });
  });

  describe("Multiple Rewards", () => {
    test("renders one row per reward", () => {
      const rewards = [
        reward,
        { ...reward, id: "r2", campaign_id: 2, amount: 200 },
        { ...reward, id: "r3", campaign_id: 3, amount: 300 },
      ];
      render(<RewardList rewards={rewards} />);
      const items = screen.getAllByRole("listitem");
      expect(items).toHaveLength(3);
    });

    test("handles mixed redeemed and unredeemed rewards", () => {
      const rewards = [
        reward,
        { ...reward, id: "r2", campaign_id: 2, redeemed: true, redeemed_amount: 100 },
      ];
      render(<RewardList rewards={rewards} onRedeem={() => {}} />);
      expect(screen.getByText(/Available/i)).toBeInTheDocument();
      expect(screen.getByText(/Redeemed 100 LYT/i)).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /redeem/i })).toBeInTheDocument();
    });
  });
});
