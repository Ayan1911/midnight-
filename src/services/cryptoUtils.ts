/**
 * Cryptographic & hashing utilities for Midnight Private Voting
 */

// Generate a random 32-byte hex voter secret
export function generateVoterSecret(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

// Converts hex string to Uint8Array
export function hexToBytes(hex: string): Uint8Array {
  const cleanHex = hex.startsWith('0x') ? hex.slice(2) : hex;
  const bytes = new Uint8Array(cleanHex.length / 2);
  for (let i = 0; i < cleanHex.length; i += 2) {
    bytes[i / 2] = parseInt(cleanHex.substring(i, i + 2), 16);
  }
  return bytes;
}

// Converts Uint8Array to hex string
export function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Deterministic nullifier derivation simulating Compact's persistentHash<Bytes<32>>(voterSecret)
 * Uses browser SubtleCrypto SHA-256 as native standard simulation
 */
export async function deriveNullifierHash(voterSecretHex: string): Promise<string> {
  const secretBytes = hexToBytes(voterSecretHex);
  // Domain separator prefix for voting nullifier
  const prefix = new TextEncoder().encode('midnight:voting:nullifier:v1:');
  const buffer = new Uint8Array(prefix.length + secretBytes.length);
  buffer.set(prefix);
  buffer.set(secretBytes, prefix.length);

  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  return bytesToHex(new Uint8Array(hashBuffer));
}

// Formats long hashes/addresses for clean UI presentation
export function truncateHash(hash: string, startChars = 6, endChars = 4): string {
  if (!hash) return '';
  if (hash.length <= startChars + endChars) return hash;
  return `${hash.slice(0, startChars)}...${hash.slice(-endChars)}`;
}
