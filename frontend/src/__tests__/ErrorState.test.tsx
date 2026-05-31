import { render, screen, fireEvent } from "./test-utils";
import { ErrorState } from "@/components/ErrorState";
import { RewardList } from "@/components/RewardList";

describe("ErrorState component", () => {
  test("renders message and Try again button", () => {
    render(<ErrorState message="Something went wrong" onRetry={() => {}} />);
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Try again" })).toBeInTheDocument();
  });

  test("has role=alert for accessibility", () => {
    render(<ErrorState message="Error" onRetry={() => {}} />);
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  test("calls onRetry when Try again is clicked", () => {
    const onRetry = jest.fn();
    render(<ErrorState message="Error" onRetry={onRetry} />);
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});

describe("RewardList error state", () => {
  test("renders ErrorState when error prop is set", () => {
    render(<RewardList rewards={[]} error="Failed to load rewards" onRetry={() => {}} />);
    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText("Failed to load rewards")).toBeInTheDocument();
  });

  test("calls onRetry when Try again is clicked in RewardList error state", () => {
    const onRetry = jest.fn();
    render(<RewardList rewards={[]} error="Network error" onRetry={onRetry} />);
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  test("does not render ErrorState when error is null", () => {
    render(<RewardList rewards={[]} error={null} />);
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});
