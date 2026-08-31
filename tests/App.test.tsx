import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';
import App from '../src/App';

describe('Midnight Private Voting dApp (App Component)', () => {
  beforeEach(() => {
    localStorage.clear();
  });
  afterEach(() => cleanup());

  it('renders navbar brand with Preprod badge', async () => {
    render(<App />);
    expect(screen.getByText('Midnight Voting')).toBeInTheDocument();
    expect(screen.getByText('Preprod')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText('Lace Wallet Not Detected')).toBeInTheDocument();
    });
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

  it('renders headless resilience fallback when Lace is missing', async () => {
    render(<App />);
    await waitFor(() => {
      expect(screen.getByText('Lace Wallet Not Detected')).toBeInTheDocument();
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
