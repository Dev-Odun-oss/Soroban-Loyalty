import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { CreateCampaignForm } from "@/components/CreateCampaignForm";

jest.mock("@/lib/soroban", () => ({
  createCampaign: jest.fn(),
}));

import { createCampaign } from "@/lib/soroban";
const mockCreate = createCampaign as jest.Mock;

const FUTURE_DATE = "2099-12-31";
const PUBLIC_KEY = "GABC1234";

const setup = (onSuccess = jest.fn()) =>
  render(<CreateCampaignForm publicKey={PUBLIC_KEY} onSuccess={onSuccess} />);

const fillForm = (name = "Test Campaign", amount = "100", date = FUTURE_DATE) => {
  fireEvent.change(screen.getByLabelText(/campaign name/i), { target: { value: name } });
  fireEvent.change(screen.getByLabelText(/reward amount/i), { target: { value: amount } });
  fireEvent.change(screen.getByLabelText(/expiration date/i), { target: { value: date } });
};

afterEach(() => jest.clearAllMocks());

test("shows validation errors when submitting empty form", () => {
  setup();
  fireEvent.click(screen.getByRole("button", { name: /review campaign/i }));
  expect(screen.getByText(/campaign name is required/i)).toBeInTheDocument();
  expect(screen.getByText(/enter a positive reward amount/i)).toBeInTheDocument();
  expect(screen.getByText(/expiration date is required/i)).toBeInTheDocument();
});

test("shows error for past expiration date", () => {
  setup();
  fillForm("Test", "100", "2000-01-01");
  fireEvent.click(screen.getByRole("button", { name: /review campaign/i }));
  expect(screen.getByText(/expiration must be in the future/i)).toBeInTheDocument();
});

test("advances to confirm step with valid inputs", () => {
  setup();
  fillForm();
  fireEvent.click(screen.getByRole("button", { name: /review campaign/i }));
  expect(screen.getByText(/confirm campaign/i)).toBeInTheDocument();
  expect(screen.getByText("Test Campaign")).toBeInTheDocument();
  expect(screen.getByText(/100 lyt/i)).toBeInTheDocument();
});

test("back button returns to input step", () => {
  setup();
  fillForm();
  fireEvent.click(screen.getByRole("button", { name: /review campaign/i }));
  fireEvent.click(screen.getByRole("button", { name: /back/i }));
  expect(screen.getByRole("button", { name: /review campaign/i })).toBeInTheDocument();
});

test("shows success state with tx hash after confirm", async () => {
  mockCreate.mockResolvedValue({ txHash: "abc123" });
  const onSuccess = jest.fn();
  setup(onSuccess);
  fillForm();
  fireEvent.click(screen.getByRole("button", { name: /review campaign/i }));
  fireEvent.click(screen.getByRole("button", { name: /confirm & submit/i }));
  await waitFor(() => expect(screen.getByText(/campaign created successfully/i)).toBeInTheDocument());
  expect(screen.getByText(/abc123/)).toBeInTheDocument();
  expect(screen.getByRole("link", { name: /stellar explorer/i })).toHaveAttribute("href", expect.stringContaining("abc123"));
  expect(onSuccess).toHaveBeenCalled();
});

test("shows error and returns to input on tx failure", async () => {
  mockCreate.mockRejectedValue(new Error("tx failed"));
  setup();
  fillForm();
  fireEvent.click(screen.getByRole("button", { name: /review campaign/i }));
  fireEvent.click(screen.getByRole("button", { name: /confirm & submit/i }));
  await waitFor(() => expect(screen.getByText(/tx failed/i)).toBeInTheDocument());
  expect(screen.getByRole("button", { name: /review campaign/i })).toBeInTheDocument();
});

test("resets form after clicking create another", async () => {
  mockCreate.mockResolvedValue({ txHash: "abc123" });
  setup();
  fillForm();
  fireEvent.click(screen.getByRole("button", { name: /review campaign/i }));
  fireEvent.click(screen.getByRole("button", { name: /confirm & submit/i }));
  await waitFor(() => screen.getByText(/campaign created successfully/i));
  fireEvent.click(screen.getByRole("button", { name: /create another/i }));
  expect(screen.getByRole("button", { name: /review campaign/i })).toBeInTheDocument();
  expect(screen.getByLabelText(/campaign name/i)).toHaveValue("");
});

test("submit button is disabled while validation errors exist", () => {
  setup();
  // Trigger errors
  fireEvent.click(screen.getByRole("button", { name: /review campaign/i }));
  expect(screen.getByRole("button", { name: /review campaign/i })).toBeDisabled();
});

test("error clears when user corrects the field", () => {
  setup();
  fireEvent.click(screen.getByRole("button", { name: /review campaign/i }));
  expect(screen.getByText(/campaign name is required/i)).toBeInTheDocument();
  fireEvent.change(screen.getByLabelText(/campaign name/i), { target: { value: "Fixed Name" } });
  expect(screen.queryByText(/campaign name is required/i)).not.toBeInTheDocument();
});
