# sustained-throughput — the steady-state campaign

Invented example content.

**Question:** what throughput does each module sustain once the die temperature stops
rising, and how does that compare to the first 60 seconds?

**Setup:** four modules, two workloads each, 40-minute runs, ambient held at 23 °C ± 1.
Throughput sampled every 5 s; die temperature read from the on-board sensor in the same
loop. The first 90 seconds of each run are discarded — that is the burst window, measured
separately.

**Data provenance:** raw logs in `data/raw/`, one CSV per run, named
`<module>-<workload>-<run>.csv`. `scripts/aggregate.py` produces `data/runs.csv`, which is
the only file the manuscript reads. Never edit `data/runs.csv` by hand; regenerate it.

**Run-to-run spread** is what makes the claim falsifiable, so every cell is five runs and
the spread is reported, not hidden in a mean.

## Decisions

- **[#d-0004]** date: 2026-06-15 · status: accepted · author: dana
  **Hold ambient temperature rather than logging it as a covariate.**
  Logging it and regressing it out was the cheaper option and was rejected: with four
  modules and two workloads there are not enough runs to fit ambient as a covariate
  without the fit absorbing the effect the paper is measuring. This costs external
  validity — nothing here says what happens at 40 °C ambient, and the limitations
  paragraph says so.

## Todos

- **[#t-0004]** status: open · author: dana — Module D, both workloads: 10 runs still to do.
- **[#t-0005]** status: open · author: dana — The thermal sensor's calibration was never checked against an external probe. If a reviewer asks, there is no answer.
