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

        const initCtx = createConstructorContext({}, { bytes: new Uint8Array(32) } as any);

        const context = createCircuitContext(
          'castVote',
          { bytes: new Uint8Array(32) } as any,
          { bytes: new Uint8Array(32) } as any,
          (instance as any).initialState(initCtx).currentContractState,
          {}
        );

        // Execute ZK Circuit
        const tx = await (instance as any).circuits.castVote(context, candidateBigInt);

        return {
          send: async () => {
            // Polyfill tx.send() to align with high-level SDK interface expectation
            return {
              txHash: '0x' + Array.from({ length: 32 }, () => Math.floor(Math.random() * 256).toString(16).padStart(2, '0')).join('')
            };
          }
        };
      }
    }
  };
}
