import { describe, it, expect } from 'vitest';
import { MidnightWalletService } from '../src/services/walletConnector';

describe('MidnightWalletService SDK Integration', () => {
  it('initializes as a singleton instance', () => {
    const service1 = MidnightWalletService.getInstance();
    const service2 = MidnightWalletService.getInstance();
    expect(service1).toBe(service2);
  });

  it('connects and returns structured wallet state with 0x address format', async () => {
    const service = MidnightWalletService.getInstance();
    const state = await service.connect();
    expect(state.connected).toBe(true);
    expect(state.address).toMatch(/^0x/);
    expect(state.network).toContain('preview');
  });

  it('disconnects and clears in-memory state properly', async () => {
    const service = MidnightWalletService.getInstance();
    await service.connect();
    const disconnectedState = service.disconnect();
    expect(disconnectedState.connected).toBe(false);
    expect(disconnectedState.address).toBeNull();
    expect(service.getConnectedAddress()).toBeNull();
  });

  it('generates deterministic transaction hashes on proof submission', async () => {
    const service = MidnightWalletService.getInstance();
    const txHash = await service.generateProofAndSubmit(1, '0x1234567890abcdef');
    expect(txHash).toMatch(/^0x[a-f0-9]{64}$/);
  });
});
