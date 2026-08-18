import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { VotingStation } from '../src/components/VotingStation';
import { WalletState } from '../src/services/walletConnector';

const mockWallet: WalletState = {
  connected: true,
  address: '0xMid9...88F1a',
  network: 'preview',
  isMock: true,
};

describe('VotingStation Component', () => {
  it('renders candidates and handles candidate selection', () => {
    const handleCastVote = vi.fn().mockResolvedValue(undefined);
    render(
      <VotingStation
        wallet={mockWallet}
        onCastVote={handleCastVote}
        isProving={false}
      />
    );

    expect(screen.getByText('Candidate Alpha')).toBeInTheDocument();
    expect(screen.getByText('Candidate Beta')).toBeInTheDocument();

    const candidateB = screen.getByText('Candidate Beta');
    fireEvent.click(candidateB);

    const voteButton = screen.getByText('Cast Private Vote');
    fireEvent.click(voteButton);
    expect(handleCastVote).toHaveBeenCalledWith(2, expect.any(String));
  });

  it('rotates voter secret on button click', () => {
    render(
      <VotingStation
        wallet={mockWallet}
        onCastVote={vi.fn()}
        isProving={false}
      />
    );

    const rotateButton = screen.getByText('↻ Regenerate');
    fireEvent.click(rotateButton);
    expect(rotateButton).toBeInTheDocument();
  });

  it('disables voting when wallet is disconnected', () => {
    render(
      <VotingStation
        wallet={{ ...mockWallet, connected: false }}
        onCastVote={vi.fn()}
        isProving={false}
      />
    );

    expect(screen.getByText('Connect Lace Wallet to Vote')).toBeDisabled();
  });
});
