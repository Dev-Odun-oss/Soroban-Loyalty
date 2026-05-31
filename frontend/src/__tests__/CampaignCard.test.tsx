import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CampaignCard } from '@/components/CampaignCard';
import { Campaign } from '@/lib/api';

jest.mock('@/context/I18nContext', () => ({
  useI18n: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'campaigns.status.active': 'Active',
        'campaigns.status.expired': 'Expired',
        'campaigns.status.inactive': 'Inactive',
        'campaigns.details.campaign': 'Campaign',
        'campaigns.details.merchant': 'Merchant',
        'campaigns.details.reward': 'Reward',
        'campaigns.details.claimed': 'Claimed',
        'campaigns.details.expires': 'Expires',
        'campaigns.actions.claim': 'Claim',
        'campaigns.actions.claiming': 'Claiming...',
        'campaigns.actions.deactivate': 'Deactivate',
        'campaigns.actions.deactivating': 'Deactivating...',
        'campaigns.deactivate.title': 'Deactivate Campaign',
        'campaigns.deactivate.warning': 'This action cannot be undone.',
        'common.cancel': 'Cancel',
        'common.confirm': 'Confirm',
      };
      return translations[key] || key;
    },
  }),
}));

jest.mock('@/hooks/useCountdown', () => ({
  useCountdown: (expiration: string) => {
    const expirationDate = new Date(expiration);
    const now = new Date();
    const diff = expirationDate.getTime() - now.getTime();
    const expired = diff <= 0;

    if (expired) {
      return {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        expired: true,
      };
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return { days, hours, minutes, seconds, expired: false };
  },
}));

jest.mock('@/components/Tooltip', () => ({
  Tooltip: ({ children, content }: any) => (
    <div title={content}>{children}</div>
  ),
}));

jest.mock('@/components/TruncatedAddress', () => ({
  TruncatedAddress: ({ address }: any) => <span>{address}</span>,
}));

const mockCampaign: Campaign = {
  id: 1,
  merchant: 'GBUQWP3BOUZX34ULNQG23RQ6F4YUSXHTQSXUSMIQ375YQRDX5TWUC4G',
  reward_amount: 100,
  total_claimed: 5,
  active: true,
  expiration: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

describe('CampaignCard', () => {
  describe('rendering', () => {
    it('renders campaign name, reward amount, and expiration', () => {
      render(
        <CampaignCard campaign={mockCampaign} />
      );

      expect(screen.getByText(`Campaign #${mockCampaign.id}`)).toBeInTheDocument();
      expect(screen.getByText(`${mockCampaign.reward_amount.toLocaleString()} LYT`)).toBeInTheDocument();
      expect(screen.getByTestId('countdown')).toBeInTheDocument();
    });

    it('renders merchant address', () => {
      render(
        <CampaignCard campaign={mockCampaign} />
      );

      expect(screen.getByText(mockCampaign.merchant)).toBeInTheDocument();
    });

    it('renders claimed count', () => {
      render(
        <CampaignCard campaign={mockCampaign} />
      );

      expect(screen.getByText(mockCampaign.total_claimed.toString())).toBeInTheDocument();
    });
  });

  describe('status badge', () => {
    it('shows green Active badge for active campaign', () => {
      render(
        <CampaignCard campaign={mockCampaign} />
      );

      const badges = screen.getAllByText('Active');
      const badge = badges[0];
      expect(badge).toHaveAttribute('data-status', 'active');
    });

    it('shows red Expired badge for expired campaign', () => {
      const expiredCampaign: Campaign = {
        ...mockCampaign,
        expiration: new Date(Date.now() - 1000).toISOString(),
      };

      render(
        <CampaignCard campaign={expiredCampaign} />
      );

      const badges = screen.getAllByText('Expired');
      const badge = badges[0];
      expect(badge).toHaveAttribute('data-status', 'expired');
    });

    it('shows Inactive badge for inactive campaign', () => {
      const inactiveCampaign: Campaign = {
        ...mockCampaign,
        active: false,
      };

      render(
        <CampaignCard campaign={inactiveCampaign} />
      );

      const badges = screen.getAllByText('Inactive');
      const badge = badges[0];
      expect(badge).toHaveAttribute('data-status', 'inactive');
    });
  });

  describe('countdown timer', () => {
    it('shows correct remaining time for future expiration', () => {
      render(
        <CampaignCard campaign={mockCampaign} />
      );

      const countdown = screen.getByTestId('countdown');
      expect(countdown.textContent).toMatch(/\d+[dhms]/);
      expect(countdown.textContent).toContain('left');
    });

    it('renders Expired label for past expiration date', () => {
      const expiredCampaign: Campaign = {
        ...mockCampaign,
        expiration: new Date(Date.now() - 1000).toISOString(),
      };

      render(
        <CampaignCard campaign={expiredCampaign} />
      );

      const countdown = screen.getByTestId('countdown');
      expect(countdown.textContent).toBe('Expired');
    });
  });

  describe('claim button', () => {
    it('renders claim button when onClaim is provided', () => {
      const onClaim = jest.fn();
      render(
        <CampaignCard campaign={mockCampaign} onClaim={onClaim} />
      );

      expect(screen.getByText('Claim')).toBeInTheDocument();
    });

    it('calls onClaim with campaign id when clicked', async () => {
      const onClaim = jest.fn();
      render(
        <CampaignCard campaign={mockCampaign} onClaim={onClaim} />
      );

      const claimBtn = screen.getByText('Claim');
      await userEvent.click(claimBtn);

      expect(onClaim).toHaveBeenCalledWith(mockCampaign.id);
    });

    it('disables claim button when claiming is true', () => {
      const onClaim = jest.fn();
      render(
        <CampaignCard campaign={mockCampaign} onClaim={onClaim} claiming={true} />
      );

      const claimBtn = screen.getByText('Claiming...');
      expect(claimBtn).toBeDisabled();
    });

    it('disables claim button for expired campaign', () => {
      const expiredCampaign: Campaign = {
        ...mockCampaign,
        expiration: new Date(Date.now() - 1000).toISOString(),
      };
      const onClaim = jest.fn();

      render(
        <CampaignCard campaign={expiredCampaign} onClaim={onClaim} />
      );

      const claimBtn = screen.getByText('Claim');
      expect(claimBtn).toBeDisabled();
    });

    it('disables claim button for inactive campaign', () => {
      const inactiveCampaign: Campaign = {
        ...mockCampaign,
        active: false,
      };
      const onClaim = jest.fn();

      render(
        <CampaignCard campaign={inactiveCampaign} onClaim={onClaim} />
      );

      const claimBtn = screen.getByText('Claim');
      expect(claimBtn).toBeDisabled();
    });
  });

  describe('deactivate button', () => {
    it('renders deactivate button for merchant-owned active campaign', () => {
      const onDeactivate = jest.fn();
      render(
        <CampaignCard
          campaign={mockCampaign}
          onDeactivate={onDeactivate}
          isMerchantOwned={true}
        />
      );

      expect(screen.getByText('Deactivate')).toBeInTheDocument();
    });

    it('does not render deactivate button when not merchant owned', () => {
      const onDeactivate = jest.fn();
      render(
        <CampaignCard
          campaign={mockCampaign}
          onDeactivate={onDeactivate}
          isMerchantOwned={false}
        />
      );

      expect(screen.queryByText('Deactivate')).not.toBeInTheDocument();
    });

    it('shows confirmation dialog when deactivate is clicked', async () => {
      const onDeactivate = jest.fn();
      render(
        <CampaignCard
          campaign={mockCampaign}
          onDeactivate={onDeactivate}
          isMerchantOwned={true}
        />
      );

      const deactivateBtn = screen.getByText('Deactivate');
      await userEvent.click(deactivateBtn);

      expect(screen.getByText('Deactivate Campaign')).toBeInTheDocument();
      expect(screen.getByText('This action cannot be undone.')).toBeInTheDocument();
    });

    it('calls onDeactivate when confirmed', async () => {
      const onDeactivate = jest.fn().mockResolvedValue(undefined);
      render(
        <CampaignCard
          campaign={mockCampaign}
          onDeactivate={onDeactivate}
          isMerchantOwned={true}
        />
      );

      const deactivateBtn = screen.getByText('Deactivate');
      await userEvent.click(deactivateBtn);

      const confirmBtn = screen.getByText('Confirm');
      await userEvent.click(confirmBtn);

      await waitFor(() => {
        expect(onDeactivate).toHaveBeenCalledWith(mockCampaign.id);
      });
    });

    it('closes dialog when cancel is clicked', async () => {
      const onDeactivate = jest.fn();
      render(
        <CampaignCard
          campaign={mockCampaign}
          onDeactivate={onDeactivate}
          isMerchantOwned={true}
        />
      );

      const deactivateBtn = screen.getByText('Deactivate');
      await userEvent.click(deactivateBtn);

      const cancelBtn = screen.getByText('Cancel');
      await userEvent.click(cancelBtn);

      expect(screen.queryByText('Deactivate Campaign')).not.toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('has proper aria labels', () => {
      const onDeactivate = jest.fn();
      render(
        <CampaignCard
          campaign={mockCampaign}
          onDeactivate={onDeactivate}
          isMerchantOwned={true}
        />
      );

      const deactivateBtn = screen.getByLabelText(`Deactivate campaign #${mockCampaign.id}`);
      expect(deactivateBtn).toBeInTheDocument();
    });

    it('countdown has aria-label', () => {
      render(
        <CampaignCard campaign={mockCampaign} />
      );

      const countdown = screen.getByTestId('countdown');
      expect(countdown).toHaveAttribute('aria-label');
    });
  });
});
