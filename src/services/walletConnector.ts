/**
 * Midnight DApp Connector & Lace Beta Wallet Integration
 */

export interface MidnightLaceAPI {
  apiVersion: string;
  name: string;
  icon: string;
  isEnabled: () => Promise<boolean>;
  enable: () => Promise<{
    getAddress: () => Promise<string>;
    getNetworkId: () => Promise<string>;
    getBalance: () => Promise<bigint>;
    getProofProvider?: () => any;
    signTransaction?: (tx: any) => Promise<any>;
    submitTransaction?: (tx: any) => Promise<string>;
  }>;
}

declare global {
  interface Window {
    midnight?: {
      mnLace?: MidnightLaceAPI;
    };
  }
}

export class WalletConnectorService {
  private connectedAPI: any = null;
  private currentAddress: string | null = null;
  private isSimulated: boolean = false;

  public async isLaceAvailable(): Promise<boolean> {
    return typeof window !== 'undefined' && !!window.midnight?.mnLace;
  }

  public async connectLace(): Promise<{
    address: string;
    networkId: string;
    balanceTdust: number;
    isSimulated: boolean;
  }> {
    try {
      if (typeof window !== 'undefined' && window.midnight?.mnLace) {
        console.log('🔗 Connecting to Lace Beta Wallet extension...');
        const api = await window.midnight.mnLace.enable();
        this.connectedAPI = api;
        this.isSimulated = false;

        const address = await api.getAddress();
        const networkId = (await api.getNetworkId?.()) || 'midnight-preprod';
        const balanceBigInt = (await api.getBalance?.()) || 100000000n;
        const balanceTdust = Number(balanceBigInt) / 1_000_000;

        this.currentAddress = address;
        return {
          address,
          networkId,
          balanceTdust,
          isSimulated: false,
        };
      } else {
        // Simulated Lace Wallet connection for dev & testnet preview
        console.log('⚡ Lace Wallet not detected in window. Initializing simulated Midnight Preprod session...');
        this.isSimulated = true;
        
        // Load or create deterministic test wallet
        const savedAddress = localStorage.getItem('midnight_sim_address');
        const address = savedAddress || 'mn_preprod1q9x393gvhw5yq298r8s4t90gjh2q7w8x3p9h7k2m9l';
        if (!savedAddress) localStorage.setItem('midnight_sim_address', address);

        this.currentAddress = address;
        return {
          address,
          networkId: 'midnight-preprod',
          balanceTdust: 250.0,
          isSimulated: true,
        };
      }
    } catch (err: any) {
      console.error('Wallet connection failed:', err);
      throw new Error(err?.message || 'Failed to connect Lace wallet');
    }
  }

  public disconnect(): void {
    this.connectedAPI = null;
    this.currentAddress = null;
    this.isSimulated = false;
  }

  public getAddress(): string | null {
    return this.currentAddress;
  }

  public isSimulatedSession(): boolean {
    return this.isSimulated;
  }
}

export const walletConnector = new WalletConnectorService();
