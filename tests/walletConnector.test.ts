import { describe, it, expect } from 'vitest';
import { MidnightWalletService } from '../src/services/walletConnector';

describe('MidnightWalletService SDK Integration', () => {
  it('initializes as a singleton instance', () => {
    const service1 = MidnightWalletService.getInstance();
    const service2 = MidnightWalletService.getInstance();
    expect(service1).toBe(service2);
  });

  it('rejects connection if Lace is not present', async () => {
    const service = MidnightWalletService.getInstance();
    const result = await service.connect();
    expect(result.connected).toBe(false);
    expect(result.error).toBe('LACE_NOT_FOUND');
  });
});
