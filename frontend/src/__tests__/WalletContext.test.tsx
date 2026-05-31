import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WalletProvider, useWallet } from '@/context/WalletContext';
import * as freighter from '@/lib/freighter';
import { api } from '@/lib/api';

jest.mock('@/lib/freighter');
jest.mock('@/lib/api');
jest.mock('@/context/ToastContext', () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}));

const mockFreighter = freighter as jest.Mocked<typeof freighter>;
const mockApi = api as jest.Mocked<typeof api>;

function TestComponent() {
  const { publicKey, connecting, connect, disconnect, lytBalance, mounted } = useWallet();
  
  if (!mounted) return <div>Loading...</div>;
  
  return (
    <div>
      <div data-testid="public-key">{publicKey || 'Not connected'}</div>
      <div data-testid="balance">{lytBalance}</div>
      <div data-testid="connecting">{connecting ? 'Connecting' : 'Not connecting'}</div>
      <button onClick={connect} data-testid="connect-btn">Connect</button>
      <button onClick={disconnect} data-testid="disconnect-btn">Disconnect</button>
    </div>
  );
}

describe('WalletContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    mockFreighter.getPublicKey.mockResolvedValue(null);
    mockApi.getUserRewards.mockResolvedValue({ rewards: [] });
  });

  describe('connect()', () => {
    it('updates address state with Freighter-returned address', async () => {
      const testAddress = 'GBUQWP3BOUZX34ULNQG23RQ6F4YUSXHTQSXUSMIQ375YQRDX5TWUC4G';
      mockFreighter.connectWallet.mockResolvedValue(testAddress);

      render(
        <WalletProvider>
          <TestComponent />
        </WalletProvider>
      );

      await waitFor(() => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      });

      const connectBtn = screen.getByTestId('connect-btn');
      await act(async () => {
        await userEvent.click(connectBtn);
      });

      await waitFor(() => {
        expect(screen.getByTestId('public-key')).toHaveTextContent(testAddress);
      });
    });

    it('stores address in localStorage', async () => {
      const testAddress = 'GBUQWP3BOUZX34ULNQG23RQ6F4YUSXHTQSXUSMIQ375YQRDX5TWUC4G';
      mockFreighter.connectWallet.mockResolvedValue(testAddress);

      render(
        <WalletProvider>
          <TestComponent />
        </WalletProvider>
      );

      await waitFor(() => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      });

      const connectBtn = screen.getByTestId('connect-btn');
      await act(async () => {
        await userEvent.click(connectBtn);
      });

      await waitFor(() => {
        expect(localStorage.getItem('soroban_wallet_public_key')).toBe(testAddress);
      });
    });
  });

  describe('disconnect()', () => {
    it('clears address state', async () => {
      const testAddress = 'GBUQWP3BOUZX34ULNQG23RQ6F4YUSXHTQSXUSMIQ375YQRDX5TWUC4G';
      mockFreighter.connectWallet.mockResolvedValue(testAddress);

      render(
        <WalletProvider>
          <TestComponent />
        </WalletProvider>
      );

      await waitFor(() => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      });

      const connectBtn = screen.getByTestId('connect-btn');
      await act(async () => {
        await userEvent.click(connectBtn);
      });

      await waitFor(() => {
        expect(screen.getByTestId('public-key')).toHaveTextContent(testAddress);
      });

      const disconnectBtn = screen.getByTestId('disconnect-btn');
      await act(async () => {
        await userEvent.click(disconnectBtn);
      });

      await waitFor(() => {
        expect(screen.getByTestId('public-key')).toHaveTextContent('Not connected');
      });
    });

    it('removes address from localStorage', async () => {
      const testAddress = 'GBUQWP3BOUZX34ULNQG23RQ6F4YUSXHTQSXUSMIQ375YQRDX5TWUC4G';
      mockFreighter.connectWallet.mockResolvedValue(testAddress);

      render(
        <WalletProvider>
          <TestComponent />
        </WalletProvider>
      );

      await waitFor(() => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      });

      const connectBtn = screen.getByTestId('connect-btn');
      await act(async () => {
        await userEvent.click(connectBtn);
      });

      await waitFor(() => {
        expect(localStorage.getItem('soroban_wallet_public_key')).toBe(testAddress);
      });

      const disconnectBtn = screen.getByTestId('disconnect-btn');
      await act(async () => {
        await userEvent.click(disconnectBtn);
      });

      await waitFor(() => {
        expect(localStorage.getItem('soroban_wallet_public_key')).toBeNull();
      });
    });
  });

  describe('address state changes', () => {
    it('components consuming context re-render when address changes', async () => {
      const testAddress = 'GBUQWP3BOUZX34ULNQG23RQ6F4YUSXHTQSXUSMIQ375YQRDX5TWUC4G';
      mockFreighter.connectWallet.mockResolvedValue(testAddress);

      render(
        <WalletProvider>
          <TestComponent />
        </WalletProvider>
      );

      await waitFor(() => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      });

      const connectBtn = screen.getByTestId('connect-btn');
      await act(async () => {
        await userEvent.click(connectBtn);
      });

      await waitFor(() => {
        expect(screen.getByTestId('public-key')).toHaveTextContent(testAddress);
      });
    });
  });

  describe('Freighter API mocking', () => {
    it('uses mocked Freighter API (no real wallet required)', async () => {
      const testAddress = 'GBUQWP3BOUZX34ULNQG23RQ6F4YUSXHTQSXUSMIQ375YQRDX5TWUC4G';
      mockFreighter.connectWallet.mockResolvedValue(testAddress);

      render(
        <WalletProvider>
          <TestComponent />
        </WalletProvider>
      );

      await waitFor(() => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      });

      const connectBtn = screen.getByTestId('connect-btn');
      await act(async () => {
        await userEvent.click(connectBtn);
      });

      await waitFor(() => {
        expect(mockFreighter.connectWallet).toHaveBeenCalled();
      });
    });

    it('handles connection errors gracefully', async () => {
      mockFreighter.connectWallet.mockRejectedValue(new Error('User rejected'));

      render(
        <WalletProvider>
          <TestComponent />
        </WalletProvider>
      );

      await waitFor(() => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      });

      const connectBtn = screen.getByTestId('connect-btn');
      await act(async () => {
        await userEvent.click(connectBtn);
      });

      await waitFor(() => {
        expect(screen.getByTestId('public-key')).toHaveTextContent('Not connected');
      });
    });
  });

  describe('branch coverage', () => {
    it('initializes with mounted state false then true', async () => {
      mockFreighter.connectWallet.mockResolvedValue('GBUQWP3BOUZX34ULNQG23RQ6F4YUSXHTQSXUSMIQ375YQRDX5TWUC4G');

      render(
        <WalletProvider>
          <TestComponent />
        </WalletProvider>
      );

      await waitFor(() => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      });

      expect(screen.getByTestId('public-key')).toBeInTheDocument();
    });

    it('handles localStorage retrieval on mount', async () => {
      const testAddress = 'GBUQWP3BOUZX34ULNQG23RQ6F4YUSXHTQSXUSMIQ375YQRDX5TWUC4G';
      localStorage.setItem('soroban_wallet_public_key', testAddress);
      mockFreighter.getPublicKey.mockResolvedValue(testAddress);

      render(
        <WalletProvider>
          <TestComponent />
        </WalletProvider>
      );

      await waitFor(() => {
        expect(mockFreighter.getPublicKey).toHaveBeenCalled();
      });
    });

    it('handles storage events for cross-tab sync', async () => {
      const testAddress = 'GBUQWP3BOUZX34ULNQG23RQ6F4YUSXHTQSXUSMIQ375YQRDX5TWUC4G';

      render(
        <WalletProvider>
          <TestComponent />
        </WalletProvider>
      );

      await waitFor(() => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      });

      act(() => {
        const event = new StorageEvent('storage', {
          key: 'soroban_wallet_public_key',
          newValue: testAddress,
        });
        window.dispatchEvent(event);
      });

      await waitFor(() => {
        expect(screen.getByTestId('public-key')).toHaveTextContent(testAddress);
      });
    });
  });
});
