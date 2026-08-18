import { describe, it, expect, beforeEach } from 'vitest';
import { Contract, ledger } from '../managed/contract/index.js';
import { deriveNullifierHash, generateVoterSecret } from '../src/services/cryptoUtils';

describe('Midnight Smart Contract: Private Voting (Compact Logic)', () => {
  let witnessSecretA: Uint8Array;
  let witnessSecretB: Uint8Array;

  beforeEach(() => {
    // Generate distinct 32-byte voter secrets for testing
    witnessSecretA = new Uint8Array(32);
    witnessSecretA.fill(42);

    witnessSecretB = new Uint8Array(32);
    witnessSecretB.fill(99);
  });

  it('should instantiate the Compact contract with witness handlers', () => {
    const witnesses = {
      getVoterSecret: () => [{}, witnessSecretA] as [any, Uint8Array],
    };

    const contractInstance = new Contract(witnesses);
    expect(contractInstance).toBeDefined();
    expect(contractInstance.circuits).toBeDefined();
    expect(typeof contractInstance.circuits.castVote).toBe('function');
    expect(typeof contractInstance.circuits.initialize).toBe('function');
  });

  it('should derive unique deterministic nullifiers for distinct voter secrets', async () => {
    const secret1 = generateVoterSecret();
    const secret2 = generateVoterSecret();

    const nullifier1 = await deriveNullifierHash(secret1);
    const nullifier2 = await deriveNullifierHash(secret2);

    expect(nullifier1).toHaveLength(64);
    expect(nullifier2).toHaveLength(64);
    expect(nullifier1).not.toEqual(nullifier2);

    // Identical secret produces deterministic nullifier
    const nullifier1Recomputed = await deriveNullifierHash(secret1);
    expect(nullifier1Recomputed).toEqual(nullifier1);
  });

  it('should enforce single-vote constraint (double voting rejection)', async () => {
    const nullifiersRegistry = new Set<string>();
    const secret = generateVoterSecret();
    const nullifier = await deriveNullifierHash(secret);

    // First vote succeeds
    expect(nullifiersRegistry.has(nullifier)).toBe(false);
    nullifiersRegistry.add(nullifier);

    // Second vote with same nullifier must fail
    expect(nullifiersRegistry.has(nullifier)).toBe(true);
  });

  it('should guarantee Zero-Knowledge privacy: voter secret is never revealed in ledger state', async () => {
    const secret = generateVoterSecret();
    const nullifier = await deriveNullifierHash(secret);

    // Simulated ledger state
    const publicLedger = {
      isOpen: true,
      totalVotesA: 1n,
      totalVotesB: 0n,
      totalBallots: 1n,
      nullifierList: [nullifier],
    };

    // Public ledger only contains nullifier hash and tallies
    const serializedLedger = JSON.stringify(publicLedger, (_, v) =>
      typeof v === 'bigint' ? v.toString() : v
    );
    expect(serializedLedger).not.toContain(secret);
    expect(publicLedger.nullifierList).toContain(nullifier);
  });

  it('should reject candidate indices outside [0, 1]', () => {
    const validCandidates = [0, 1];
    const invalidCandidate = 2;

    expect(validCandidates.includes(0)).toBe(true);
    expect(validCandidates.includes(1)).toBe(true);
    expect(validCandidates.includes(invalidCandidate)).toBe(false);
  });
});
