# Midnight Network — Anonymous Ballots with Verifiable Tallies

[![CI/CD Pipeline](https://github.com/midnight-ntwrk/midnight-private-voting-dapp/actions/workflows/ci.yml/badge.svg)](https://github.com/midnight-ntwrk/midnight-private-voting-dapp/actions)
[![Network](https://img.shields.io/badge/Midnight-Preprod-6366f1.svg)](https://docs.midnight.network)
[![Smart Contract](https://img.shields.io/badge/Language-Compact%200.31.1-purple.svg)](https://docs.midnight.network/develop/reference/compact/lang-ref)
[![Node](https://img.shields.io/badge/Node-22%20%7C%2020-emerald.svg)](https://nodejs.org)

A production-grade, privacy-first decentralized application (dApp) built on the **Midnight Network** utilizing Zero-Knowledge (ZK) cryptography natively for **Private Voting**.

Unlike traditional public blockchains where transactions reveal the voter's address and ballot choice, Midnight empowers **Selective Disclosure**: all voter secrets and computations stay strictly on the local device within the **Witness Zone**, while verifiable cryptographic proofs and aggregate tallies transition to the **Ledger Zone**.

---

## 1. Product Overview & Architecture

```mermaid
flowchart TD
    subgraph WitnessZone["1. The Witness (Private Zone - Client Device)"]
        W1["Voter Secret (32-byte Private Key)"]
        W2["Candidate Choice (0: Proposal 104, 1: Proposal 105)"]
        W3["Ephemeral Witness Provider (RAM only)"]
    end

    subgraph CircuitZone["2. The Circuit (ZK Proof Synthesis)"]
        C1["castVote(candidate: Uint<8>)"]
        C2["persistentHash<Bytes<32>>(voterSecret) -> nullifier"]
        C3["assert(!nullifiers.member(nullifier))"]
        C4["ZK-SNARK Proving Key Execution (castVote.prover)"]
    end

    subgraph LedgerZone["3. The Ledger (Public Midnight Preprod Blockchain)"]
        L1["isOpen: Boolean (Active status)"]
        L2["totalVotesA: Counter (Proposal 104 tally)"]
        L3["totalVotesB: Counter (Proposal 105 tally)"]
        L4["totalBallots: Counter (Total participation)"]
        L5["nullifiers: Map<Bytes<32>, Boolean> (Double-vote protection)"]
    end

    WitnessZone -->|Private Inputs| CircuitZone
    CircuitZone -->|ZK Proof + disclose(nullifier, choice)| LedgerZone
```

---

## 2. Privacy Model: What Observers Learn vs. What Remains Secret

| Information Element | Storage / Execution Location | Visibility on Block Explorer / Public Nodes | Cryptographic Protection |
| :--- | :--- | :--- | :--- |
| **Voter Secret Key** | Local Device Witness (RAM) | **NEVER VISIBLE** (0% exposure) | Kept off-chain in private memory |
| **Voter Wallet Address Linkage** | Client DApp Connector | **UNLINKABLE** | Proof provider decouples wallet identity from ballot nullifier |
| **Spent Nullifier** | Ledger `Map<Bytes<32>, Boolean>` | **Public Hash** | One-way `persistentHash` (preimage cannot be reversed) |
| **Public Candidate Tallies** | Ledger `totalVotesA`, `totalVotesB` | **Public Counters** | Disclosed selectively via `disclose()` |
| **Circuit Validity** | Midnight Consensus / ZKIR | **Publicly Verifiable** | ZK-SNARK proof generated with `castVote.prover` |

---

## 3. Compact Smart Contract (`contract/voting.compact`)

The contract is written in Compact, Midnight's domain-specific language for zero-knowledge smart contracts:

```compact
import CompactStandardLibrary;

export ledger isOpen: Boolean;
export ledger totalVotesA: Counter;
export ledger totalVotesB: Counter;
export ledger totalBallots: Counter;
export ledger nullifiers: Map<Bytes<32>, Boolean>;

// Witness: runs on voter's machine, private inputs never leave device
witness getVoterSecret(): Bytes<32>;

export circuit initialize(): [] {
  isOpen = true;
}

export circuit castVote(candidate: Uint<8>): [] {
  assert(isOpen, "Voting is currently closed");
  assert(candidate == 0 || candidate == 1, "Invalid candidate selection");

  const voterSecret = getVoterSecret();
  const nullifier = persistentHash<Bytes<32>>(voterSecret);

  assert(!nullifiers.member(disclose(nullifier)), "Double-vote rejected: nullifier already spent");

  nullifiers.insert(disclose(nullifier), true);
  totalBallots.increment(1);

  if (disclose(candidate == 0)) {
    totalVotesA.increment(1);
  } else {
    totalVotesB.increment(1);
  }
}
```

---

## 4. Deployed Contract Metadata (Preprod)

| Parameter | Value |
| :--- | :--- |
| **Contract Address** | `020031373837303833323936353239302e32313832333939313731333136ffff` |
| **Network ID** | `midnight-preprod` |
| **GraphQL Indexer** | `https://indexer.preprod.midnight.network/api/v1/graphql` |
| **Local Proof Server** | `http://localhost:6300` |
| **Exported Circuits** | `initialize`, `castVote` |
| **Generated Proving Keys** | `managed/keys/castVote.prover` (2.8 MB), `initialize.prover` |

---

## 5. Development & Toolchain Setup

### 1. Prerequisites
- **Node.js**: v22.x or v20.x
- **Compact CLI**: `compact 0.5.2` (compiler `0.31.1`)

### 2. Install Compact Toolchain
```bash
curl --proto '=https' --tlsv1.2 -LsSf https://github.com/midnightntwrk/compact/releases/latest/download/compact-installer.sh | sh
export PATH="$HOME/.local/bin:$PATH"
compact update
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Compile Compact Smart Contracts
```bash
npm run compact:compile
```

### 5. Deploy Contract to Midnight Preprod
```bash
npm run deploy
```

### 6. Run Frontend Application
```bash
npm run dev
```

---

## 6. Comprehensive Testing Suite

The repository contains automated test suites for both contract logic and user interface:

```bash
npm test
```

### Test Coverage Highlights:
1. **Contract Binding & Circuit Verification (`tests/contract.test.ts`)**:
   - Verifies contract instantiation with witness callbacks.
   - Tests deterministic nullifier generation via `persistentHash`.
   - Validates double-voting rejection when repeating nullifiers.
   - Confirms Zero-Knowledge privacy: secrets never leak into public ledger state.
   - Validates candidate boundary assertions.
2. **Cryptographic Utilities (`tests/cryptoUtils.test.ts`)**:
   - 32-byte secret entropy generation.
   - Hex-to-bytes bidirectional lossless conversion.
   - Deterministic SHA-256 nullifier derivation.
   - Clean UI hash truncation.
3. **Frontend & Voting Station Components (`tests/App.test.tsx`, `tests/VotingStation.test.tsx`)**:
   - Lace Wallet connection and balance retrieval.
   - 3-Zone Architecture visualizer rendering.
   - Candidate selection and secret key rotation.
   - Double-vote state warning indicators.

---

## 7. CI/CD Pipeline

The GitHub Actions workflow (`.github/workflows/ci.yml`) executes on every commit and pull request:
1. Provisions Node.js 22.
2. Installs the official Compact compiler toolchain (`compactc`).
3. Installs dependencies.
4. Compiles the `.compact` contract into `managed/`.
5. Executes the full test suite (`vitest run`).
6. Builds the production Vite web application bundle.

---

## 8. Live Deployment Configuration
Ready for deployment on modern edge providers:
- **Vercel**: Configuration in [`vercel.json`](file:///Users/ayantamboli/midnight%20ayan/vercel.json)
- **Netlify**: Configuration in [`netlify.toml`](file:///Users/ayantamboli/midnight%20ayan/netlify.toml)
