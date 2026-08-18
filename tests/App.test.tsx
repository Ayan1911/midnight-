import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import App from '../src/App';

describe('Midnight Private Voting dApp (App Component)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders navbar brand with Preprod badge', () => {
    render(<App />);
    expect(screen.getByText('Midnight Voting')).toBeInTheDocument();
    expect(screen.getByText('Preprod')).toBeInTheDocument();
    expect(screen.getByText('Connect Lace Wallet')).toBeInTheDocument();
  });

  it('renders hero title and subtitle', () => {
    render(<App />);
    expect(screen.getByText(/Private Ballots/i)).toBeInTheDocument();
    expect(screen.getByText(/Verifiable On-Chain Tallies/i)).toBeInTheDocument();
  });

  it('renders candidate options in VotingStation', () => {
    render(<App />);
    const alphaElements = screen.getAllByText('Candidate Alpha');
    const betaElements = screen.getAllByText('Candidate Beta');
    expect(alphaElements.length).toBeGreaterThan(0);
    expect(betaElements.length).toBeGreaterThan(0);
  });

  it('connects Lace wallet and displays address pill', async () => {
    render(<App />);
    const connectButton = screen.getByText('Connect Lace Wallet');
    fireEvent.click(connectButton);

    await waitFor(() => {
      const addressElements = screen.getAllByText(/0xMid9/i);
      expect(addressElements.length).toBeGreaterThan(0);
    });
  });

  it('renders trust badges', () => {
    render(<App />);
    expect(screen.getByText('Zero-Knowledge Proofs')).toBeInTheDocument();
    expect(screen.getByText('Selective Disclosure')).toBeInTheDocument();
    expect(screen.getByText('Midnight Preprod')).toBeInTheDocument();
    expect(screen.getByText('Lace Beta Wallet')).toBeInTheDocument();
  });
});
