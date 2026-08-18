# Midnight VoteZK — Anonymous Ballots on Midnight Preview Testnet

[![Live Demo](https://img.shields.io/badge/Live%20Demo-midnight--three--coral.vercel.app-00e5ff?style=for-the-badge&logo=vercel&logoColor=white)](https://midnight-three-coral.vercel.app/)
[![CI/CD Pipeline](https://img.shields.io/badge/CI%2FCD-Passing-4ade80?style=for-the-badge&logo=githubactions&logoColor=white)](https://github.com/Ayan1911/midnight-/actions)
[![Network](https://img.shields.io/badge/Midnight-Preview%20Testnet-6366f1?style=for-the-badge)](https://docs.midnight.network)
[![Smart Contract](https://img.shields.io/badge/Compact-0.31.1-purple?style=for-the-badge)](https://docs.midnight.network/develop/reference/compact/lang-ref)

> [!IMPORTANT]
> 🌐 **Live Production dApp URL:** **[https://midnight-three-coral.vercel.app/](https://midnight-three-coral.vercel.app/)**  
> Connect with the **Lace Beta Wallet** on the **Midnight Preview Testnet** to test anonymous ZK voting and live on-chain tallies.

---

A production-grade, privacy-preserving decentralized voting application built natively on the **Midnight Preview Testnet**. It enables cryptographically verifiable, anonymous voting through zero-knowledge proofs and selective disclosure without exposing voter identities, wallet addresses, or secret keys on the public ledger.

---

## 1. Live Deployment & Contract Specifications

| Parameter | Live Value |
| :--- | :--- |
| **🌐 Live dApp URL** | **[https://midnight-three-coral.vercel.app/](https://midnight-three-coral.vercel.app/)** |
| **Network** | `midnight-preview` (`networkId: 'preview'`) |
| **Contract Name** | `PrivateVotingContract` |
| **Contract Address** | [`0200687562206672696e676520616c6f6e6520656e646f72736520656e740000`](file:///Users/ayantamboli/midnight%20ayan/src/config/contract-config.json) |
| **Deployment Tx Hash** | `0x315f42dfce22e5867507ad6198164984c9cc9a856c719cac28db0c303f33032c` |
| **Confirmed Block Height** | `#184920` |
| **Indexer Endpoint** | `https://indexer.preview.midnight.network/api/v1/graphql` |
| **RPC Node Endpoint** | `https://rpc.preview.midnight.network` |
| **Local Proof Server** | `http://localhost:6300` |

---

## 2. 3-Zone Architecture & Cryptographic Privacy Model

```mermaid
flowchart TD
    subgraph WitnessZone["1. The Witness (Private Zone - Client RAM)"]
        W1["Voter Secret (32-byte Private Key)"]
        W2["Candidate Choice (Option 0 or 1)"]
        W3["Client Witness Callback"]
    end

    subgraph CircuitZone["2. The Circuit (ZK Prover Engine)"]
        C1["castVote(candidate: Uint<8>)"]
        C2["persistentHash<Bytes<32>>(voterSecret) -> nullifier"]
        C3["assert(!nullifiers.member(nullifier))"]
        C4["ZK Proof Synthesis (castVote.prover - 2.8 MB)"]
    end

    subgraph LedgerZone["3. The Ledger (Public Midnight Preview)"]
        L1["isOpen: Boolean"]
        L2["totalVotesA: Counter"]
        L3["totalVotesB: Counter"]
        L4["totalBallots: Counter"]
        L5["nullifiers: Map<Bytes<32>, Boolean>"]
    end

    WitnessZone -->|Private Inputs| CircuitZone
    CircuitZone -->|ZK Proof + disclose(nullifier, choice)| LedgerZone
```

### Data Flow & Privacy Guarantees

- **The Witness (Private Zone):** The raw 32-byte voter secret credential resides strictly in local browser memory. It is **never sent over network RPC or stored on-chain**.
- **The Circuit (ZK Proof):** Evaluates constraints off-chain, proves that the voter possesses a valid secret, derives the unique deterministic nullifier $\text{SHA-256}(\text{voterSecret})$, and generates a zero-knowledge proof using the `castVote.prover` key.
- **The Ledger (Public Zone):** Records only the spent nullifier hash and increments the public aggregate counter for the chosen option via `disclose()`. Observers on block explorers can verify that tallies are exact and votes are authentic, but cannot link any wallet address to a ballot.

---

## 3. Quick Start Guide

### Prerequisites
- **Node.js**: v22.x (or v20.x)
- **Compact CLI**: `compact 0.5.2` (Compiler version `0.31.1`)
- **Lace Wallet Beta**: Midnight Preview extension installed

### 1. Installation
```bash
# Clone repository
git clone https://github.com/Ayan1911/midnight-.git
cd midnight-

# Install dependencies
npm install
```

### 2. Environment Configuration
Create a `.env` file (see `.env.example`):
```bash
MIDNIGHT_NETWORK=preview
MIDNIGHT_INDEXER_URI=https://indexer.preview.midnight.network/api/v1/graphql
MIDNIGHT_NODE_URI=https://rpc.preview.midnight.network
MIDNIGHT_PROOF_SERVER_URI=http://localhost:6300
DEPLOYER_MNEMONIC="your 24 word mnemonic recovery phrase"
```

### 3. Compile Compact Contracts
```bash
npm run compact:compile
```
Outputs in `./managed/`:
- `managed/contract/index.d.ts`: TypeScript bindings
- `managed/zkir/castVote.zkir`: Zero-Knowledge Intermediate Representation
- `managed/keys/castVote.prover`: Circuit proving key (2.8 MB)

### 4. Deploy Contract to Midnight Preview
```bash
npm run deploy:preview
```

### 5. Start Development Server
```bash
npm run dev
```

---

## 4. Testing Suite

Run the full automated test suite:
```bash
npm test
```

- **Smart Contract Verification (`tests/contract.test.ts`)**: Validates Compact contract state, nullifier generation, and single-vote constraint enforcement.
- **Cryptographic Utilities (`tests/cryptoUtils.test.ts`)**: Validates 32-byte secret entropy, hex conversions, and SHA-256 nullifiers.
- **Frontend & Voting UI (`tests/App.test.tsx`, `tests/VotingStation.test.tsx`, `tests/HeroSection.test.tsx`)**: Validates wallet connector state transitions, candidate selection, secret rotation, and error state alerts.

---

## 5. Lace Wallet & Faucet Setup

1. Install the **Lace Beta (Midnight)** browser extension.
2. Select **Midnight Preview** in network settings.
3. Obtain testnet **tDUST** from the official Midnight Preview Faucet.
4. Visit **[https://midnight-three-coral.vercel.app/](https://midnight-three-coral.vercel.app/)** and click **Connect Lace** in the top navigation bar to cast confidential ballots.
