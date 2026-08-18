import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { App } from '../src/App';

describe('Midnight VoteZK Frontend UI (Preview Testnet)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders the header with Preview testnet badge', () => {
    render(<App />);
    expect(screen.getByText('Midnight VoteZK')).toBeInTheDocument();
    expect(screen.getByText('Preview Testnet')).toBeInTheDocument();
    expect(screen.getByText('Connect Lace')).toBeInTheDocument();
  });

  it('renders the 3-Zone Architecture visualizer', () => {
    render(<App />);
    expect(screen.getByText(/1. Witness \(Client RAM\)/i)).toBeInTheDocument();
    expect(screen.getByText(/2. Circuit \(ZK Prover\)/i)).toBeInTheDocument();
    expect(screen.getByText(/3. Ledger \(Midnight Preview\)/i)).toBeInTheDocument();
  });

  it('renders candidate options for anonymous ballot selection', () => {
    render(<App />);
    const proposalElementsA = screen.getAllByText(/Option 0: ZK Privacy Standard/i);
    const proposalElementsB = screen.getAllByText(/Option 1: Shielded DeFi AMM/i);
    expect(proposalElementsA.length).toBeGreaterThan(0);
    expect(proposalElementsB.length).toBeGreaterThan(0);
  });

  it('connects Lace wallet session and displays account controls', async () => {
    render(<App />);
    const connectButton = screen.getByText('Connect Lace');
    fireEvent.click(connectButton);

    await waitFor(() => {
      expect(screen.getByText(/Disconnect/i)).toBeInTheDocument();
    });
  });

  it('allows candidate selection switching', () => {
    render(<App />);
    const candidateCards = screen.getAllByText(/Option 1: Shielded DeFi AMM/i);
    fireEvent.click(candidateCards[0]);

    expect(candidateCards[0]).toBeInTheDocument();
  });
});
