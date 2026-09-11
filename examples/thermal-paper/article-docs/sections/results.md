# results — what the measurements show

Invented example content.

§IV of the manuscript. Reports the burst and sustained throughput for each of the four
modules, then the derating ratio that the paper is actually about. The table is generated
from `data/runs.csv` by `scripts/table4.py`; do not edit it by hand in the `.tex`.

The section carries the paper's whole empirical weight, and it has to do it in two pages.
The figures were cut to one because of that.

## Decisions

- **[#d-0001]** date: 2026-07-02 · status: accepted · author: dana
  **Report the derating ratio rather than absolute throughput as the headline number.**
  Absolute figures are dominated by the board's clock and memory configuration, which
  differ across the four modules and are not what the paper is about. The ratio cancels
  them. The alternative — reporting absolute throughput and normalising in the text —
  was rejected because every reviewer would have to redo the normalisation to compare
  modules. This gives up the ability to state a headline number in tokens per second,
  which some readers will want; the absolute figures stay in the appendix table.

- **[#d-0002]** date: 2026-07-19 · status: proposed · author: dana
  **Cut the per-layer breakdown figure to fit the page limit.**
  It was the clearest figure in the draft, but it supports a secondary claim and costs
  most of a page. Rejected alternative: cutting the related-work paragraph on cooling
  design, which a reviewer from that community would notice immediately. This gives up
  the explanation of *where* the derating lands, which is the obvious follow-up question.

## Todos

- **[#t-0001]** status: open · author: dana — Six cells of Table IV are empty pending the sustained-throughput campaign. The paper cannot be submitted with them empty.
- **[#t-0002]** status: open · author: dana — The caption of Fig. 2 still claims four modules; it shows three since the cut.
