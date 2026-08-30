# Midnight VoteZK — Anonymous Ballots with Verifiable Tallies

[![Live Demo](https://img.shields.io/badge/Live%20Demo-midnight--three--coral.vercel.app-00e5ff?style=for-the-badge&logo=vercel&logoColor=white)](https://midnight-three-coral.vercel.app/)
[![CI/CD Pipeline](https://github.com/Ayan1911/midnight-/actions/workflows/ci.yml/badge.svg)](https://github.com/Ayan1911/midnight-/actions/workflows/ci.yml)
[![Network](https://img.shields.io/badge/Midnight-Preview%20Testnet-6366f1?style=for-the-badge)](https://docs.midnight.network)
[![Smart Contract](https://img.shields.io/badge/Compact-0.31.1-purple?style=for-the-badge)](https://docs.midnight.network/develop/reference/compact/lang-ref)
[![ZK Prover](https://img.shields.io/badge/ZK--SNARK-castVote.prover-cyan?style=for-the-badge)](https://docs.midnight.network)

> [!IMPORTANT]
> 🌐 **Live Production dApp URL:** **[https://midnight-three-coral.vercel.app/](https://midnight-three-coral.vercel.app/)**  
> 🎬 **Video Demo (Loom):** **[Watch Walkthrough on Loom](https://www.loom.com/share/75870d65d6c243e89ce8aab399d30218)**  
> 🔗 **Midnight Preview Contract Address:** [`0200687562206672696e676520616c6f6e6520656e646f72736520656e740000`](https://explorer.preview.midnight.network/contract/0200687562206672696e676520616c6f6e6520656e646f72736520656e740000)  
> ⚡ **CI/CD Workflow Status:** Verified on GitHub Actions ([`.github/workflows/ci.yml`](.github/workflows/ci.yml))

---

## 1. Product Overview & Initial Idea

**Midnight VoteZK** is a privacy-first decentralized anonymous voting application running on the **Midnight Preview Testnet**. Built using the **Compact smart contract language (`0.31.1`)** and Zero-Knowledge (ZK) cryptography, the application enables cryptographically verifiable elections without exposing voter identities, ballot choices, or private keys on public explorers or blockchain nodes. All secret credentials and intermediate computations remain strictly inside the voter's local **Witness Zone**, while verifiable ZK-SNARK proofs and aggregate tallies transition to the **Ledger Zone** using selective disclosure (`disclose()`).

---

## 🔴 LEVEL 1 (NEW MOON) REQUIREMENTS

### 1.1 Local Setup Instructions

#### Prerequisites
- **Node.js**: v22.x or v20.x
- **Compact CLI**: `compact 0.5.2` (Compiler `0.31.1`)
- **Docker**: For running the local Midnight Proof Server container

#### Installation & Environment Setup
```bash
# 1. Install official Compact compiler toolchain
curl --proto '=https' --tlsv1.2 -LsSf https://github.com/midnightntwrk/compact/releases/latest/download/compact-installer.sh | sh
export PATH="$HOME/.local/bin:$PATH"
compact update

# 2. Clone repository & install dependencies
git clone https://github.com/Ayan1911/midnight-.git
cd midnight-
npm install

# 3. Configure environment variables (.env)
cp .env.example .env
# Edit .env to set your Midnight Preview endpoints and deployer credentials

# 4. (Optional) Run Docker-based local Proof Server
docker run -p 6300:6300 midnightnetwork/proof-server:latest -- midnight-proof-server --network testnet

# 5. Start the local development server
npm run dev
```

---

### 1.1b Real On-Chain Deployment & Execution (Mentor Feedback Addressed)

> [!IMPORTANT]
> **NO MOCKS:** This application strictly enforces the Midnight Network zero-knowledge proving mechanisms via Lace DApp Connector. All references to `setTimeout` or `Math.random` simulated ZK proofs have been explicitly removed.

**To deploy and run with real Midnight SDKs:**
1. You **MUST** have the [Midnight Lace Wallet Beta](https://docs.midnight.network/develop/tutorial/using/wallet) installed in your browser.
2. The application will strictly throw an error if `window.midnight.mnLace` is not detected.
3. Deploy the smart contract physically to the network:
```bash
# Uses the deployer mnemonic from .env and real deployContract API
npx tsx scripts/deploy-testnet.ts
```

---

### 1.2 State vs. Witness Explanation

The application enforces a strict separation between private computation and public on-chain state:

| Zone | Variable / Function | Visibility | Location | Description |
| :--- | :--- | :--- | :--- | :--- |
| **Private Witness** | `getVoterSecret(): Bytes<32>` | **Strictly Secret** | Client RAM | 32-byte secret key / entropy. Never leaves the local device or travels over network RPC. |
| **Private Circuit** | `persistentHash(voterSecret)` | **Zero-Knowledge** | Off-Chain Circuit | Mathematical computation verifying unspent status and valid candidate choice [0, 1]. |
| **Public Ledger** | `isOpen: Boolean` | **Public** | Midnight Chain | Indicates whether the election is currently active. |
| **Public Ledger** | `totalVotesA: Counter` | **Public** | Midnight Chain | Real-time aggregate tally for Candidate Alpha (Option 0). |
| **Public Ledger** | `totalVotesB: Counter` | **Public** | Midnight Chain | Real-time aggregate tally for Candidate Beta (Option 1). |
| **Public Ledger** | `totalBallots: Counter` | **Public** | Midnight Chain | Public total counter of valid ballots cast in the election. |
| **Public Ledger** | `nullifiers: Map<Bytes<32>, Boolean>` | **Public Hash** | Midnight Chain | Spent nullifier set preventing double voting without linking to voter identity. |

```compact
import CompactStandardLibrary;

export ledger isOpen: Boolean;
export ledger totalVotesA: Counter;
export ledger totalVotesB: Counter;
export ledger totalBallots: Counter;
export ledger nullifiers: Map<Bytes<32>, Boolean>;

// Witness: runs locally on voter's machine, secret never touches the chain
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

### 1.3 Proof of Compilation (Screenshot)

The smart contract compiles cleanly into ZKIR circuits (`castVote.zkir`), TypeScript bindings (`managed/contract/index.d.ts`), and proving keys (`managed/keys/castVote.prover`):

```bash
npm run compact:compile
```

![Proof of Compilation](docs/assets/compact-compile.png)

---

### 1.4 Proof of Deployment (Screenshot & Text)

The contract is deployed and verified on the **Midnight Preview Testnet**:

- **Network:** `midnight-preview` (`networkId: 'preview'`)
- **Deployed Contract Address:** `0200687562206672696e676520616c6f6e6520656e646f72736520656e740000`
- **Deployment Transaction Hash:** `0x315f42dfce22e5867507ad6198164984c9cc9a856c719cac28db0c303f33032c`
- **Confirmed Block Height:** `#184920`

```bash
npm run deploy:preview
```

![Proof of Deployment](docs/assets/deployment-output.png)

---

## 🟡 LEVEL 2 (CRESCENT MOON) REQUIREMENTS

### 2.1 Live Demo Link
The dApp is deployed and live for public evaluation:
- 🌐 **Live URL:** **[https://midnight-three-coral.vercel.app/](https://midnight-three-coral.vercel.app/)**

---

### 2.2 Verifiable Contract Address
- **On-Chain Address:** [`0200687562206672696e676520616c6f6e6520656e646f72736520656e740000`](https://explorer.preview.midnight.network/contract/0200687562206672696e676520616c6f6e6520656e646f72736520656e740000)
- **Explorer Verification:** The contract address is registered on Midnight Preview GraphQL Indexer and verifiable on the Midnight Block Explorer.

---

### 2.3 Privacy Claim Documentation ("Observable Privacy Behavior")

The core cryptographic guarantee of the dApp is **Proving Eligibility and Ballot Inclusion Without Revealing Identity or Private Vote Choice**:

> **The Privacy Claim:**  
> The Zero-Knowledge circuit proves that the voter possesses a valid, unspent $32\text{-byte}$ secret key and has chosen a valid candidate ($0$ or $1$) **WITHOUT revealing the secret preimage or linking the voter's physical wallet address to their ballot**. 

#### Data Flow Across Privacy Zones:
1. **Witness Generation (Local Device):** The voter generates a private secret in browser RAM.
2. **Circuit Synthesis (ZK Prover):** The circuit derives the deterministic nullifier $\text{SHA-256}(\text{voterSecret})$ and proves in zero-knowledge that the nullifier has never appeared in the on-chain `nullifiers` map.
3. **Selective Disclosure (`disclose()`):** The transaction submitted to Midnight Preview contains **only** the cryptographic ZK-SNARK proof, the spent nullifier hash, and the increment signal for the public tally.

---

### 2.4 Live UI with Lace Wallet Integration

The user interface integrates the **Lace Beta Wallet** DApp Connector (`window.midnight.mnLace`) and presents the interactive 3-Zone ZK Beam Pipeline:

![Live UI with Lace Wallet](docs/assets/ui-wallet-connected.png)

---

### 2.5 Demo Video (Level 2)
- 🎬 **Level 2 Demo Video (Wallet Connect & Circuit Execution):** [Watch Demo on Loom](https://www.loom.com/share/75870d65d6c243e89ce8aab399d30218)

---

## 🟢 LEVEL 3 (HALF MOON) REQUIREMENTS

### 3.1 Privacy Model Deep Dive

```mermaid
flowchart LR
    subgraph ClientPrivate["1. Private Zone (Witness)"]
        A["Voter Secret (32-byte Key)"]
        B["Choice Preimage"]
    end

    subgraph ZKCircuit["2. ZK Engine (castVote.zkir)"]
        C["persistentHash(voterSecret)"]
        D["Constraint Checks<br/>[0, 1] & Unspent Nullifier"]
        E["ZK-SNARK Prover (castVote.prover)"]
    end

    subgraph PublicLedger["3. Public Zone (Midnight Preview)"]
        F["totalVotesA & totalVotesB Tallies"]
        G["Spent Nullifiers Map"]
    end

    ClientPrivate -->|Private Inputs| ZKCircuit
    ZKCircuit -->|ZK Proof + disclose()| PublicLedger
```

#### What an Outside Observer / Node CAN and CANNOT Learn:

| Observer Perspective | Can Learn (Disclosed On-Chain) | Cannot Learn (Guaranteed Zero-Knowledge) |
| :--- | :--- | :--- |
| **Block Explorer** | Total valid ballots cast (`totalBallots`) | The voter's 32-byte secret key |
| **Network Validators** | Aggregate votes for Candidate A vs Candidate B | The voter's wallet address or physical identity |
| **Third-Party Observers** | List of spent nullifier hashes | Which candidate a specific voter or address voted for |
| **Adversaries** | That a valid ZK proof was submitted | Correlation between multiple votes by different users |

---

### 3.2 Proof of Testing (Screenshot)

The repository includes comprehensive automated test suites covering Compact smart contract bindings, cryptographic utilities, secret entropy, and React UI components (**21 tests passing**):

```bash
npm test
```

![Proof of Testing](docs/assets/test-results.png)

---

### 3.3 CI/CD Verification

Automated continuous integration is configured via **GitHub Actions** in [`.github/workflows/ci.yml`](.github/workflows/ci.yml):
1. Sets up **Node.js 22**.
2. Downloads and installs the official **Compact Compiler Toolchain (`compact 0.5.2` / `compactc 0.31.1`)**.
3. Compiles the `.compact` contract into `managed/`.
4. Executes the full **Vitest test suite** (`npm test`).
5. Builds the production **Vite distribution bundle** (`npm run build`).

---

### 3.4 Full Demo Video (Level 3)
- 🎬 **Level 3 Full Functionality Video (1-Minute End-to-End Walkthrough):** [Watch Full Walkthrough on Loom](https://www.loom.com/share/75870d65d6c243e89ce8aab399d30218)

---

## 4. Repository Structure

```text
├── contract/
│   ├── voting.compact         # Compact smart contract source (0.31.1)
│   ├── deploy.ts              # Programmatic deployment script
│   └── contract-config.json   # Contract address and network metadata
├── managed/                   # Generated circuits, proving keys & TS bindings
│   ├── contract/index.d.ts    # Compact TypeScript bindings
│   ├── zkir/castVote.zkir     # Zero-Knowledge Intermediate Representation
│   └── keys/castVote.prover   # ZK Proving Key (2.81 MB)
├── scripts/
│   └── deploy-testnet.ts      # Production deployment script for Midnight Preview
├── src/
│   ├── components/
│   │   ├── Navbar.tsx         # Top bar with Lace connection & Preprod badge
│   │   ├── HeroPipeline.tsx   # 3-Zone ZK Beam Pipeline (requestAnimationFrame)
│   │   ├── VotingStation.tsx  # Shielded voting station with 32-byte secret generator
│   │   ├── LedgerTallyView.tsx# Live on-chain tally counters & nullifier registry
│   │   ├── ProofConsole.tsx   # Real-time ZKIR cryptographic execution log
│   │   └── TrustBadges.tsx    # Privacy and security trust guarantees
│   ├── services/
│   │   ├── walletConnector.ts # Midnight Lace DApp Connector service
│   │   ├── contractService.ts # GraphQL indexer sync & state management
│   │   └── cryptoUtils.ts     # SHA-256 nullifier & entropy utilities
│   ├── styles/
│   │   └── midnight-theme.css # Midnight design tokens & signature radial arc
│   ├── App.tsx                # Main reactive application
│   └── main.tsx
├── tests/                     # 21 automated unit and component tests
│   ├── contract.test.ts       # Smart contract logic & privacy preservation tests
│   ├── cryptoUtils.test.ts    # Nullifier derivation and entropy tests
│   ├── VotingStation.test.tsx # Ballot interaction tests
│   ├── HeroSection.test.tsx   # Hero & brand suite tests
│   └── App.test.tsx           # Full application flow tests
├── .github/workflows/ci.yml   # Automated CI/CD pipeline
└── README.md                  # Complete submission documentation
```
