import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { VotingStation } from '../src/components/VotingStation';
import { Candidate, VoterState } from '../src/types';

const mockCandidates: Candidate[] = [
  {
    id: 0,
    name: 'Option 0: ZK Privacy Standard',
    tagline: 'Mandatory Zero-Knowledge Proofs',
    description: 'Implements standard zk-SNARK validation',
    color: 'cyan',
    avatarIcon: '0',
  },
  {
    id: 1,
    name: 'Option 1: Shielded DeFi AMM',
    tagline: 'Private Automated Market Maker',
    description: 'Confidential liquidity pools',
    color: 'emerald',
    avatarIcon: '1',
  },
];

const mockVoterState: VoterState = {
  voterSecret: 'a1b2c3d4e5f60718293a4b5c6d7e8f90a1b2c3d4e5f60718293a4b5c6d7e8f90',
  nullifierHash: 'f0e1d2c3b4a5968778695a4b3c2d1e0ff0e1d2c3b4a5968778695a4b3c2d1e0f',
  hasVoted: false,
};

describe('VotingStation Component', () => {
  it('renders candidates and handles candidate selection', () => {
    const handleSelect = vi.fn();
    render(
      <VotingStation
        candidates={mockCandidates}
        voterState={mockVoterState}
        selectedCandidate={0}
        isSubmitting={false}
        isWalletConnected={true}
        onSelectCandidate={handleSelect}
        onGenerateNewSecret={vi.fn()}
        onCastBallot={vi.fn()}
      />
    );

    const candidateB = screen.getByText('Option 1: Shielded DeFi AMM');
    fireEvent.click(candidateB);
    expect(handleSelect).toHaveBeenCalledWith(1);
  });

  it('toggles secret visibility', () => {
    render(
      <VotingStation
        candidates={mockCandidates}
        voterState={mockVoterState}
        selectedCandidate={0}
        isSubmitting={false}
        isWalletConnected={true}
        onSelectCandidate={vi.fn()}
        onGenerateNewSecret={vi.fn()}
        onCastBallot={vi.fn()}
      />
    );

    const toggleButton = screen.getByText('Reveal');
    fireEvent.click(toggleButton);

    expect(screen.getByText('Hide')).toBeInTheDocument();
    expect(screen.getByText(mockVoterState.voterSecret)).toBeInTheDocument();
  });

  it('calls onGenerateNewSecret when rotate secret key is clicked', () => {
    const handleRotate = vi.fn();
    render(
      <VotingStation
        candidates={mockCandidates}
        voterState={mockVoterState}
        selectedCandidate={0}
        isSubmitting={false}
        isWalletConnected={true}
        onSelectCandidate={vi.fn()}
        onGenerateNewSecret={handleRotate}
        onCastBallot={vi.fn()}
      />
    );

    const rotateButton = screen.getByTitle('Generate new voter secret');
    fireEvent.click(rotateButton);
    expect(handleRotate).toHaveBeenCalled();
  });

  it('displays warning when already voted with current nullifier', () => {
    render(
      <VotingStation
        candidates={mockCandidates}
        voterState={{ ...mockVoterState, hasVoted: true }}
        selectedCandidate={0}
        isSubmitting={false}
        isWalletConnected={true}
        onSelectCandidate={vi.fn()}
        onGenerateNewSecret={vi.fn()}
        onCastBallot={vi.fn()}
      />
    );

    expect(
      screen.getByText(/This nullifier has already voted/i)
    ).toBeInTheDocument();
  });
});
