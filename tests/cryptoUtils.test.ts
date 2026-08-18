import { describe, it, expect } from 'vitest';
import {
  generateVoterSecret,
  hexToBytes,
  bytesToHex,
  deriveNullifierHash,
  truncateHash,
} from '../src/services/cryptoUtils';

describe('Crypto Utilities', () => {
  it('should generate 32-byte (64 hex characters) random voter secrets', () => {
    const secret1 = generateVoterSecret();
    const secret2 = generateVoterSecret();

    expect(secret1).toHaveLength(64);
    expect(secret2).toHaveLength(64);
    expect(secret1).not.toEqual(secret2);
    expect(/^[0-9a-f]{64}$/i.test(secret1)).toBe(true);
  });

  it('should convert hex strings to byte arrays and back losslessly', () => {
    const originalHex = '0123456789abcdef0123456789abcdef';
    const bytes = hexToBytes(originalHex);
    const convertedHex = bytesToHex(bytes);

    expect(convertedHex).toEqual(originalHex);
  });

  it('should compute deterministic SHA-256 nullifier hashes', async () => {
    const secret = 'a'.repeat(64);
    const nullifier1 = await deriveNullifierHash(secret);
    const nullifier2 = await deriveNullifierHash(secret);

    expect(nullifier1).toEqual(nullifier2);
    expect(nullifier1).toHaveLength(64);
  });

  it('should truncate hashes cleanly for UI presentation', () => {
    const fullHash = '020031373837303833323936353239302e32313832333939313731333136ffff';
    const truncated = truncateHash(fullHash, 6, 4);

    expect(truncated).toEqual('020031...ffff');
    expect(truncateHash('')).toEqual('');
  });
});
