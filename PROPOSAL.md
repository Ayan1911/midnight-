# Project Proposal: Midnight VoteZK

## Privacy-Preserving Decentralized Voting on the Midnight Network

---

### 1. Product and Users

#### 1.1 Product Vision
**Midnight VoteZK** is a privacy-first decentralized voting platform architected specifically for the **Midnight Network Preview Testnet**. Built natively with the **Compact smart contract language (`0.31.1`)**, the application allows governance participants to cast shielded ballots in Zero-Knowledge without exposing their private identities, voting choices, or cryptographic preimages to public node validators, block explorers, or adversarial observers.

#### 1.2 Target Users
- **Decentralized Autonomous Organizations (DAOs):** Tokenholder communities seeking un-coerced governance where large stakeholders cannot be targeted or influenced during active voting windows.
- **Corporate Boards & Shareholder Meetings:** Enterprises requiring auditable, mathematically verified tallies without publicly disclosing confidential strategic decisions or individual voting stances.
- **Protocol Governance Committees:** Multi-sig signers and core contributors executing high-stakes protocol parameter updates and treasury allocations free from social engineering pressure.
- **Academic & Public Sector Institutions:** Civic bodies conducting verifiable secret-ballot elections with instant, decentralized mathematical auditability.

---

### 2. Why Midnight

#### 2.1 The Problem with Traditional Blockchains
On transparent public blockchains (e.g., Ethereum, Solana), all state changes, transaction calldata, and account balances are permanently visible on public ledgers. This transparency creates critical systemic failures for governance:
1. **Voter Coercion & Bribery ("Dark Forest" Governance):** Because an observer can monitor a wallet's live on-chain votes in real-time, malicious actors can easily verify and reward bribes or execute punitive retaliation against specific voters.
2. **Bandwagon & Herd Effects:** Early transparent vote distributions disproportionately sway later voters, corrupting organic consensus.
3. **Front-Running & Last-Look Advantage:** Adversarial participants can front-run governance thresholds by observing pending mempool transactions.

#### 2.2 How Midnight Solves This with Zero-Knowledge Cryptography
The Midnight Network introduces a dual-zone computing paradigm that fundamentally solves these vulnerabilities:
- **Off-Chain Witness Zone (Local Browser Execution):** The voter’s 32-byte secret salt and candidate selection are evaluated strictly inside their local device's client runtime. The secret key never traverses network RPC or touches on-chain state.
- **Off-Chain ZK-SNARK Prover (`castVote.zkir`):** The local prover synthesizes a cryptographic proof demonstrating:
  1. The voter possesses a valid 32-byte secret key.
  2. The candidate selection is within the valid domain $[0, 1]$.
  3. The resulting deterministic nullifier $\text{persistentHash}(voterSecret)$ has not been previously spent.
- **Zero-Leakage On-Chain Ledger Verification:** The on-chain Midnight validator verifies the ZK proof in constant time and atomically records the spent nullifier hash and tally increment without ever learning who cast the ballot or which private key was utilized.

---

### 3. Data Model

The application enforces an explicit architectural separation between private off-chain computations and public on-chain ledger records:

```mermaid
flowchart LR
    subgraph PrivateWitness["Private Witness (Client Device RAM)"]
        W1["voterSecret: Bytes<32>"]
        W2["candidate: Uint<8>"]
    end

    subgraph ZKProofEngine["ZK Prover Engine (Off-Chain Circuit)"]
        C1["persistentHash(voterSecret)"]
        C2["assert(!nullifiers.member(nullifier))"]
        C3["assert(candidate == 0 || candidate == 1)"]
    end

    subgraph PublicLedger["Public Ledger State (Midnight Preview Testnet)"]
        L1["isOpen: Boolean"]
        L2["totalVotesA: Counter"]
        L3["totalVotesB: Counter"]
        L4["totalBallots: Counter"]
        L5["nullifiers: Map<Bytes<32>, Boolean>"]
    end

    PrivateWitness -->|Private Inputs| ZKProofEngine
    ZKProofEngine -->|disclose(nullifier) + disclose(candidate == 0)| PublicLedger
```

#### 3.1 Public Ledger State
- `isOpen: Boolean` — Public boolean flag signaling whether election transactions are accepted by the smart contract.
- `totalVotesA: Counter` — Aggregated public ballot counter for Candidate Alpha (Option 0).
- `totalVotesB: Counter` — Aggregated public ballot counter for Candidate Beta (Option 1).
- `totalBallots: Counter` — Public on-chain accumulator tracking the total volume of verified ballots cast.
- `nullifiers: Map<Bytes<32>, Boolean>` — Public set of spent cryptographic nullifiers preventing double-voting attacks without exposing voter identity.

#### 3.2 Private Witness State
- `getVoterSecret(): Bytes<32>` — Cryptographically generated 256-bit entropy stored strictly in local browser memory. Never rendered to DOM elements, never written to persistent disk unencrypted, and never passed across network boundaries.
- `candidate: Uint<8>` — Private candidate selection $[0, 1]$ chosen locally by the user.

#### 3.3 State Transition via Selective Disclosure (`disclose()`)
Compact uses explicit `disclose()` primitives to bridge the private witness and the public ledger:
1. `disclose(nullifier)`: Publishes the 32-byte nullifier hash to the public `nullifiers` mapping to permanently prevent replay or double-vote attempts.
2. `disclose(candidate == 0)`: Selectively discloses only the target counter increment flag without disclosing the voter's address, signature, or private secret preimage.

---

### 4. Mainnet-Feasibility (Level 6 Production Scope)

To transition Midnight VoteZK from Preview Testnet to Mainnet production maturity, the following engineering roadmap will be implemented:

1. **Shielded Token-Weighted Voting & Merkle Tree Whitelists:**
   - Integrate Midnight native private asset balances (NIGHT/DUST) to weight votes proportional to shielded token holdings snapshot at a designated block height.
   - Utilize Sparse Merkle Trees (SMT) with zero-knowledge membership proofs for decentralized voter registry eligibility.

2. **Multi-Candidate Scalability & Ranked-Choice Balloting:**
   - Extend the Compact circuit to support arbitrary $N$-candidate elections and Quadratic/Ranked-Choice voting algorithms with fixed-size ZKIR proof constraints.

3. **Time-Locked Encrypted Tallying:**
   - Implement verifiable threshold encryption where individual tally increments remain blinded on-chain until the election epoch closes, completely eliminating early-trend bias.

4. **Security Audits & Formal Verification:**
   - Formal verification of Compact circuit constraints using automated SMT-solvers and differential fuzz testing.
   - Comprehensive external smart contract audit covering zero-knowledge soundness, completeness, and nullifier collision resistance.
