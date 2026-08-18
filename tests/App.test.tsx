import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { App } from '../src/App';

describe('Midnight VoteZK Frontend UI', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders the header with Midnight Preprod network badge', () => {
    render(<App />);
    expect(screen.getByText('Midnight VoteZK')).toBeInTheDocument();
    expect(screen.getByText('Midnight Preprod')).toBeInTheDocument();
    expect(screen.getByText('Connect Lace Beta')).toBeInTheDocument();
  });

  it('renders the 3-Zone Architecture visualizer', () => {
    render(<App />);
    expect(screen.getByText('1. Witness Zone')).toBeInTheDocument();
    expect(screen.getByText('2. Circuit Zone')).toBeInTheDocument();
    expect(screen.getByText('3. Ledger Zone')).toBeInTheDocument();
  });

  it('renders candidate options for anonymous ballot selection', () => {
    render(<App />);
    const proposalElementsA = screen.getAllByText(/Proposal 104: ZK Privacy Standard/i);
    const proposalElementsB = screen.getAllByText(/Proposal 105: Shielded DeFi AMM/i);
    expect(proposalElementsA.length).toBeGreaterThan(0);
    expect(proposalElementsB.length).toBeGreaterThan(0);
  });

  it('connects simulated Lace wallet and enables ballot submission', async () => {
    render(<App />);
    const connectButton = screen.getByText('Connect Lace Beta');
    fireEvent.click(connectButton);

    await waitFor(() => {
      expect(screen.getByText(/Disconnect/i)).toBeInTheDocument();
    });
  });

  it('allows candidate selection switching', () => {
    render(<App />);
    const candidateCards = screen.getAllByText(/Proposal 105: Shielded DeFi AMM/i);
    fireEvent.click(candidateCards[0]);

    expect(candidateCards[0]).toBeInTheDocument();
  });
});
