# Midnight Network — Anonymous Ballots with Verifiable Tallies

> **Target Network:** Midnight Preview / Preprod  
> **Smart Contract Language:** Compact (`0.31.1`)  
> **Frontend:** React 18, Vite, TypeScript, Lucide Icons  
> **ZK Engine:** Compact ZKIR & Proving Keys  
> **Wallet Integration:** Lace Wallet Beta (Midnight DApp Connector)

---

## 1. Product Overview
This decentralized application (dApp) implements a **privacy-first anonymous voting system** on the **Midnight Network**. Leveraging zero-knowledge (ZK) cryptography, voters can cast verifiable ballots without exposing their physical identity, wallet address, or voting secret on any public explorer or ledger.

The core privacy paradigm is **Selective Disclosure**: all voter data, private keys, and intermediate computations remain strictly inside the local **Witness zone** on the user's machine. The Midnight ZK circuit (`castVote`) generates a cryptographic proof verifying that:
1. The voter holds a valid voting secret.
2. A deterministic nullifier is generated to prevent double voting.
3. The ballot choice is within valid candidates ($0$ for Candidate A, $1$ for Candidate B).
4. The election is open.

Only the aggregate vote count and the spent nullifier hash are disclosed to the public ledger via `disclose()`.

---

## 2. Core Architecture & Three-Zone Privacy Model

```mermaid
flowchart TD
    subgraph WitnessZone["1. The Witness (Private Zone - Local Device)"]
        W1["Voter Secret (Bytes<32>)"]
        W2["Ballot Choice (0 or 1)"]
        W3["Proof Parameter Preparation"]
    end

    subgraph CircuitZone["2. The Circuit (ZK Proof Engine)"]
        C1["castVote(candidate: Uint<8>)"]
        C2["persistentHash<Bytes<32>>(voterSecret) -> nullifier"]
        C3["assert(!nullifiers.member(nullifier))"]
        C4["ZK Proof Generation (Prover Key)"]
    end

    subgraph LedgerZone["3. The Ledger (Public Zone - Midnight Blockchain)"]
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
| Zone | Component | Data Visibility |
| :--- | :--- | :--- |
| **Private Witness** | `voterSecret` | **Strictly Private**: Stored only in local browser/device memory. Never transmitted over RPC or stored in block state. |
| **ZK Circuit** | `castVote` Circuit | **Cryptographic Computation**: Validates secret knowledge and nullifier uniqueness in zero knowledge. |
| **Public Ledger** | `totalVotesA`, `totalVotesB`, `totalBallots` | **Public & Verifiable**: Real-time tallies accessible to anyone on the network. |
| **Public Ledger** | `nullifiers` | **Cryptographic Hash**: Spent nullifier `Bytes<32>` prevents double voting without revealing which candidate was selected or who voted. |

---

## 3. Deployed Contract Specifications (Preprod)

| Parameter | Value |
| :--- | :--- |
| **Contract Name** | `PrivateVotingContract` |
| **Target Network** | `midnight-preprod` |
| **Deployed Address** | `020031373837303833323936353239302e32313832333939313731333136ffff` |
| **Indexer Endpoint** | `https://indexer.preprod.midnight.network/api/v1/graphql` |
| **Local Proof Server** | `http://localhost:6300` (`midnightnetwork/proof-server:latest`) |
| **Circuits Exported** | `initialize`, `castVote` |

---

## 4. Quick Start & Toolchain Setup

### Prerequisites
- **Node.js**: v22.x or v20.x
- **Compact CLI**: `compact 0.5.2` (Compiler `0.31.1`)
- **Docker**: (Optional, for local Proof Server container)

### Installation
```bash
# Install Compact toolchain (if not already installed)
curl --proto '=https' --tlsv1.2 -LsSf https://github.com/midnightntwrk/compact/releases/latest/download/compact-installer.sh | sh
export PATH="$HOME/.local/bin:$PATH"
compact update

# Install project dependencies
npm install
```

### Compiling Smart Contracts
```bash
npm run compact:compile
```
Generated artifacts in `./managed/`:
- `managed/contract/index.d.ts`: Generated TypeScript bindings
- `managed/zkir/castVote.zkir`: Zero-Knowledge Intermediate Representation
- `managed/keys/castVote.prover`: Circuit proving key (2.8 MB)
- `managed/keys/castVote.verifier`: Circuit verifying key

### Deploying to Midnight Preprod
```bash
npm run deploy
```

---

## 5. Development & Testing
```bash
# Run full unit test suite (Contract + UI)
npm test

# Run frontend dev server
npm run dev
```
