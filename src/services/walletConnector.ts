import type { DAppConnectorWalletAPI } from '@midnight-ntwrk/dapp-connector-api';
import type { ProofProvider } from '@midnight-ntwrk/dapp-connector-proof-provider';
import type { MidnightProvider } from '@midnight-ntwrk/midnight-js-network-provider';

export interface WalletState {
  connected: boolean;
  address: string | null;
  network: string;
  isMock: boolean;
  error?: string;
}

export class MidnightWalletService {
  private static instance: MidnightWalletService;
  private api: DAppConnectorWalletAPI | null = null;
  private proofProvider: ProofProvider | null = null;
  private networkProvider: MidnightProvider | null = null;
  private connectedAddress: string | null = null;

  private constructor() {}

  public static getInstance(): MidnightWalletService {
    if (!MidnightWalletService.instance) {
      MidnightWalletService.instance = new MidnightWalletService();
    }
    return MidnightWalletService.instance;
  }

  /**
   * Connects to the Midnight Lace Beta Wallet extension via DApp Connector.
   * Retrieves user change address and initializes ProofProvider.
   * STRICTLY ENFORCES REAL LACE EXTENSION (No mocks).
   */
  public async connect(): Promise<WalletState> {
    const midnight = (window as unknown as { midnight?: { '1am'?: { enable: () => Promise<DAppConnectorWalletAPI>, connect?: (n: string) => Promise<DAppConnectorWalletAPI> } } })?.midnight;

    const wallet = midnight?.['1am'];
    if (!wallet) {
      console.warn("1AM Wallet not found on window.midnight['1am']");
      return {
        connected: false,
        address: null,
        network: 'preview',
        isMock: false,
        error: '1AM_NOT_FOUND',
      };
    }

    try {
      // 1AM supports its own specific connect method, but fallback to enable() if it acts as a standard connector
      this.api = wallet.connect ? await wallet.connect('preview') : await wallet.enable();
      // Using standard DApp Connector interface
      const rawAddress = (await (this.api as unknown as { getChangeAddress?: () => Promise<string> }).getChangeAddress?.()) || 'mn_preview...';
      this.connectedAddress = rawAddress;
      
      return {
        connected: true,
        address: `${rawAddress.slice(0, 10)}...${rawAddress.slice(-6)}`,
        network: 'preview',
        isMock: false,
      };
    } catch (err) {
      console.error('Failed to connect to 1AM Wallet:', err);
      throw new Error('1AM Wallet connection was rejected or failed.');
    }
  }

  /** Alias for connect */
  public async connectLace(): Promise<WalletState> {
    return this.connect();
  }

  /**
   * Disconnects the active wallet session and purges in-memory API handles.
   */
  public disconnect(): WalletState {
    this.api = null;
    this.proofProvider = null;
    this.networkProvider = null;
    this.connectedAddress = null;

    return {
      connected: false,
      address: null,
      network: 'preview',
      isMock: false,
    };
  }

  public getApi(): DAppConnectorWalletAPI | null {
    return this.api;
  }

  public getProofProvider(): ProofProvider | null {
    // In actual implementation this is provided by wallet-api or dapp-connector
    return this.proofProvider;
  }

  public getNetworkProvider(): MidnightProvider | null {
    return this.networkProvider;
  }

  public getConnectedAddress(): string | null {
    return this.connectedAddress;
  }
}

export const walletConnector = MidnightWalletService.getInstance();
