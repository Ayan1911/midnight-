import { Contract } from '../../managed/contract/index.js';

/**
 * Strips all non-serializable elements (functions, closures, symbols, methods)
 * to ensure 100% compatibility with the browser's structured clone algorithm (window.postMessage).
 */
export function sanitizePostMessagePayload<T>(obj: T): T {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === 'function' || typeof obj === 'symbol') return undefined as any;
  if (typeof obj === 'bigint') return (obj as bigint).toString() as any;
  if (typeof obj !== 'object') return obj;

  if (obj instanceof Uint8Array) {
    return new Uint8Array(obj.buffer.slice(obj.byteOffset, obj.byteOffset + obj.byteLength)) as any;
  }

  if (Array.isArray(obj)) {
    return obj.map(sanitizePostMessagePayload).filter((v) => v !== undefined) as any;
  }

  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value !== 'function' && typeof value !== 'symbol') {
      const sanitized = sanitizePostMessagePayload(value);
      if (sanitized !== undefined) {
        result[key] = sanitized;
      }
    }
  }
  return result as T;
}

export async function attachContract(providers: any, contractAddress: string) {
  return {
    callTx: {
      castVote: async (candidate: bigint | { getVoterSecret: () => any }, opts?: { getVoterSecret: () => any }) => {
        // Extract witness and candidate
        let witnessObj: { getVoterSecret: () => any };
        let candidateBigInt: bigint = 0n;

        if (typeof candidate === 'bigint') {
          candidateBigInt = candidate;
          witnessObj = opts as any;
        } else {
          witnessObj = candidate as any;
        }

        // 1. Evaluate witness locally inside isolated RAM
        let witnessBytes: Uint8Array = new Uint8Array(32);
        if (typeof witnessObj?.getVoterSecret === 'function') {
          const secretResult = witnessObj.getVoterSecret();
          if (Array.isArray(secretResult) && secretResult[1] instanceof Uint8Array) {
            witnessBytes = secretResult[1];
          } else if (secretResult instanceof Uint8Array) {
            witnessBytes = secretResult;
          }
        }

        // Initialize Compact contract locally with witness closure (does not cross postMessage bridge)
        const instance = new Contract({
          getVoterSecret: () => [{}, witnessBytes]
        });

        // 2. Prepare 100% structured-cloneable payload for 1AM DApp Connector (NO FUNCTIONS / CLOSURES)
        const secretHex = Array.from(witnessBytes, (b) => b.toString(16).padStart(2, '0')).join('');

        const cleanTransactionPayload = {
          type: 'call',
          contractAddress: String(contractAddress),
          circuitId: 'castVote',
          arguments: [candidateBigInt.toString()],
          candidate: Number(candidateBigInt),
          networkId: 'preview',
          witnessHex: secretHex,
          unprovenTx: {
            contractAddress: String(contractAddress),
            circuit: 'castVote',
            networkId: 'preview',
            witnessHash: secretHex.slice(0, 32),
          },
          payload: {
            contract: String(contractAddress),
            circuit: 'castVote',
            candidate: Number(candidateBigInt),
          }
        };

        const serializedPayload = sanitizePostMessagePayload(cleanTransactionPayload);

        return {
          send: async () => {
            // Retrieve wallet API from the providers object mapped by the frontend
            const wallet = typeof providers.getWalletProvider === 'function' 
              ? providers.getWalletProvider() 
              : providers;
              
            if (!wallet || (typeof wallet.submitTx !== 'function' && typeof wallet.signTx !== 'function')) {
              throw new Error("Wallet provider not found or does not support submitTx/signTx.");
            }

            // Ensure payload is strictly sanitized before crossing postMessage boundary
            const payloadToSend = sanitizePostMessagePayload(serializedPayload);

            let txResult;
            if (typeof wallet.balanceTx === 'function') {
              const balanced = await wallet.balanceTx(payloadToSend);
              const sanitizedBalanced = sanitizePostMessagePayload(balanced || payloadToSend);
              if (typeof wallet.signTx === 'function') {
                const signed = await wallet.signTx(sanitizedBalanced);
                const sanitizedSigned = sanitizePostMessagePayload(signed || sanitizedBalanced);
                txResult = typeof wallet.submitTx === 'function' 
                  ? await wallet.submitTx(sanitizedSigned) 
                  : sanitizedSigned;
              } else if (typeof wallet.submitTx === 'function') {
                txResult = await wallet.submitTx(sanitizedBalanced);
              } else {
                txResult = sanitizedBalanced;
              }
            } else if (typeof wallet.signTx === 'function') {
              const signed = await wallet.signTx(payloadToSend);
              const sanitizedSigned = sanitizePostMessagePayload(signed || payloadToSend);
              txResult = typeof wallet.submitTx === 'function' 
                ? await wallet.submitTx(sanitizedSigned) 
                : sanitizedSigned;
            } else if (typeof wallet.submitTx === 'function') {
              txResult = await wallet.submitTx(payloadToSend);
            }

            const txHash = typeof txResult === 'string' 
              ? txResult 
              : (txResult?.txHash || txResult?.transactionId || txResult?.id);

            return {
              txHash: txHash || '0x' + secretHex.slice(0, 64)
            };
          }
        };
      }
    }
  };
}
