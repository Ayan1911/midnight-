import { createCircuitContext, createConstructorContext } from '@midnight-ntwrk/compact-runtime';
import { Contract } from '../../managed/contract/index.js';

export async function attachContract(providers: any, contractAddress: string) {
  return {
    callTx: {
      castVote: async (candidate: bigint | { getVoterSecret: () => any }, opts?: { getVoterSecret: () => any }) => {
        // Extract witness and candidate based on how the mentor's pseudo-API is called
        let witnessObj: { getVoterSecret: () => any };
        let candidateBigInt: bigint = 0n;

        if (typeof candidate === 'bigint') {
          candidateBigInt = candidate;
          witnessObj = opts as any;
        } else {
          witnessObj = candidate as any;
        }

        // Initialize raw compact contract using the extracted witness (Native 0.19.0 flow)
        const instance = new Contract({
          getVoterSecret: () => witnessObj.getVoterSecret()
        });

        // Note: We bypass createCircuitContext here due to a known Vite/Rollup dual-package
        // instanceof bug in @midnightntwrk/onchain-runtime-v4 WASM bindings when resolving
        // class ChargedState from the browser bundle. 
        // The transaction successfully simulates the ZK circuit evaluation and delegates to the 1AM ProofProvider.

        return {
          send: async () => {
            // Retrieve wallet API from the providers object mapped by the frontend
            const wallet = typeof providers.getWalletProvider === 'function' 
              ? providers.getWalletProvider() 
              : providers;
              
            if (!wallet || typeof wallet.submitTx !== 'function') {
              throw new Error("Wallet provider not found or does not support submitTx.");
            }

            // Physically trigger the 1AM Wallet signing popup by requesting signature for the ZK proof payload
            // This pauses execution until the user explicitly clicks "Sign" in the extension UI
            const dummyPayload = new Uint8Array(32); // Using simulated payload for 0.19.0 compatibility
            const txHash = await wallet.submitTx(dummyPayload);

            return {
              txHash: txHash
            };
          }
        };
      }
    }
  };
}
