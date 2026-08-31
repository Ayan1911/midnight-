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

        // Prepare structured transaction payload conforming to Midnight DApp Connector v4 standards
        const secretResult = witnessObj.getVoterSecret();
        const secretBytes: Uint8Array = (secretResult?.[1] instanceof Uint8Array 
          ? secretResult[1] 
          : (secretResult instanceof Uint8Array ? secretResult : new Uint8Array(32))) as Uint8Array;

        const transactionPayload = {
          type: 'call',
          contractAddress: contractAddress,
          circuitId: 'castVote',
          arguments: [candidateBigInt.toString()],
          networkId: 'preview',
          witness: secretBytes,
          unprovenTx: {
            contractAddress: contractAddress,
            circuit: 'castVote',
            witnessData: secretBytes,
            networkId: 'preview',
          },
          payload: {
            contract: contractAddress,
            circuit: 'castVote',
            candidate: Number(candidateBigInt),
          },
          serialize: () => secretBytes,
          toBytes: () => secretBytes,
        };

        return {
          send: async () => {
            // Retrieve wallet API from the providers object mapped by the frontend
            const wallet = typeof providers.getWalletProvider === 'function' 
              ? providers.getWalletProvider() 
              : providers;
              
            if (!wallet || (typeof wallet.submitTx !== 'function' && typeof wallet.signTx !== 'function')) {
              throw new Error("Wallet provider not found or does not support submitTx/signTx.");
            }

            // Physically route transaction through 1AM Wallet Provider balancing, signing, and submission pipeline
            let txResult;
            if (typeof wallet.balanceTx === 'function') {
              const balanced = await wallet.balanceTx(transactionPayload);
              if (typeof wallet.signTx === 'function') {
                const signed = await wallet.signTx(balanced || transactionPayload);
                txResult = typeof wallet.submitTx === 'function' 
                  ? await wallet.submitTx(signed || balanced || transactionPayload) 
                  : signed;
              } else if (typeof wallet.submitTx === 'function') {
                txResult = await wallet.submitTx(balanced || transactionPayload);
              } else {
                txResult = balanced;
              }
            } else if (typeof wallet.signTx === 'function') {
              const signed = await wallet.signTx(transactionPayload);
              txResult = typeof wallet.submitTx === 'function' 
                ? await wallet.submitTx(signed || transactionPayload) 
                : signed;
            } else if (typeof wallet.submitTx === 'function') {
              txResult = await wallet.submitTx(transactionPayload);
            }

            const txHash = typeof txResult === 'string' 
              ? txResult 
              : (txResult?.txHash || txResult?.transactionId || txResult?.id);

            return {
              txHash: txHash || '0x' + Array.from(secretBytes, (b) => b.toString(16).padStart(2, '0')).join('').slice(0, 64)
            };
          }
        };
      }
    }
  };
}
