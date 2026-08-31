declare module '@midnight-ntwrk/dapp-connector-api' {
  export interface DAppConnectorWalletAPI {
    enable(): Promise<DAppConnectorWalletAPI>;
    getChangeAddress(): Promise<string>;
    getNetworkId(): Promise<string>;
    submitTx(txData: Uint8Array | string): Promise<string>;
  }

  export interface MidnightDAppConnector {
    mn1am: {
      enable(): Promise<DAppConnectorWalletAPI>;
      isEnabled(): Promise<boolean>;
    };
  }
}

declare module '@midnight-ntwrk/dapp-connector-proof-provider' {
  export interface ProofProvider {
    prove(circuitId: string, witnessInputs: Record<string, unknown>): Promise<Uint8Array>;
    verify(circuitId: string, proof: Uint8Array): Promise<boolean>;
  }

  export function createProofProvider(endpoint?: string): ProofProvider;
}

declare module '@midnight-ntwrk/midnight-js-network-provider' {
  export interface MidnightProvider {
    indexerEndpoint: string;
    proofServerEndpoint: string;
    submitTx(tx: unknown): Promise<string>;
    getContractState(contractAddress: string): Promise<unknown>;
  }

  export function createNetworkProvider(config: {
    indexerUrl: string;
    indexerWsUrl?: string;
  }): MidnightProvider;
}

declare module '@midnight-ntwrk/midnight-js-compact' {
  export interface CompactCircuitBinding {
    zkirPath: string;
    proverPath: string;
  }
}

declare module '@midnight-ntwrk/midnight-js-contracts' {
  export interface ContractConfig {
    contractAddress: string;
    networkId: string;
  }
}

interface Window {
  midnight?: {
    mn1am?: {
      enable(): Promise<import('@midnight-ntwrk/dapp-connector-api').DAppConnectorWalletAPI>;
      isEnabled(): Promise<boolean>;
    };
  };
}
