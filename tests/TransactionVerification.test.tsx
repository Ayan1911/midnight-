import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';
import { TransactionVerification } from '../src/components/TransactionVerification';
import { sanitizePostMessagePayload } from '../src/services/midnight-polyfill';

describe('TransactionVerification Component', () => {
  it('renders verified transaction when txHash is provided', () => {
    render(
      <TransactionVerification
        txHash="0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"
        status="confirmed"
      />
    );

    expect(screen.getByText('Transaction Verification')).toBeInTheDocument();
    expect(screen.getByText(/0x1234567890abcdef/i)).toBeInTheDocument();
    expect(screen.getByText(/✓ Confirmed/i)).toBeInTheDocument();
    expect(screen.getByText('Verify on Midnight Explorer')).toBeInTheDocument();
  });

  it('renders defensive popup blocker alert when isPopupBlocked is true', () => {
    const handleRetry = vi.fn();
    render(
      <TransactionVerification
        txHash={null}
        status="pending"
        isPopupBlocked={true}
        errorMessage="Wallet UI disconnected: Signature prompt was closed or suppressed"
        onRetry={handleRetry}
      />
    );

    expect(screen.getByText(/1AM Wallet Signature Suppressed or Disconnected/i)).toBeInTheDocument();
    expect(screen.getByText(/Disable Popup Blockers for this site/i)).toBeInTheDocument();
    expect(screen.getByText(/Check for hidden background windows/i)).toBeInTheDocument();

    const retryBtn = screen.getByText('↻ Retry Signature with 1AM Wallet');
    expect(retryBtn).toBeInTheDocument();
    fireEvent.click(retryBtn);
    expect(handleRetry).toHaveBeenCalledTimes(1);
  });

  it('sanitizes objects so they are 100% structured-cloneable without DataCloneError', () => {
    const rawPayload = {
      type: 'call',
      contractAddress: '0x1234',
      circuitId: 'castVote',
      candidate: 1n,
      witness: new Uint8Array([1, 2, 3]),
      callback: () => 'leak',
      serialize: () => new Uint8Array([1, 2, 3]),
      nested: {
        method: function () {},
        val: 42,
      },
    };

    const clean = sanitizePostMessagePayload(rawPayload);

    // Verify functions were stripped
    expect(clean.callback).toBeUndefined();
    expect(clean.serialize).toBeUndefined();
    expect(clean.nested.method).toBeUndefined();
    expect(clean.nested.val).toBe(42);
    expect(clean.candidate).toBe('1'); // BigInt converted to string

    // Verify structuredClone succeeds with 0 errors
    expect(() => structuredClone(clean)).not.toThrow();
  });
});
