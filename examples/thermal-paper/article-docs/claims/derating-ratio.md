# derating-ratio — sustained throughput is a fixed fraction of burst throughput

Invented example content.

**The claim:** across passively cooled modules, sustained throughput settles at a fraction
of burst throughput that depends on the thermal design rather than on the workload.

**Why it matters:** if it holds, a one-minute burst benchmark plus one thermal constant
predicts steady-state performance, and nobody needs a thermal chamber to size a deployment.

**Evidence today:** three of four modules measured, in `experiments/sustained-throughput.md`.
The fourth is still running. Three points is not enough to claim workload independence, and
the text currently says "suggests", which is the strongest the evidence supports.

**What would falsify it:** a workload whose ratio differs from the same module's ratio on
another workload by more than the run-to-run spread. Two workloads are measured per module
precisely so this can be checked.

## Decisions

- **[#d-0003]** date: 2026-06-28 · status: accepted · author: dana
  **State the claim as workload-independent only if all four modules show it on both workloads.**
  The temptation is to generalise from the first two modules, which agree closely. Rejected,
  because the two are from the same vendor and share a cooling design, so their agreement is
  the weakest possible evidence for the claim. This costs a stronger abstract sentence.

## Todos

- **[#t-0003]** status: open · author: dana — Module D unmeasured; the claim stays hedged until it lands.
