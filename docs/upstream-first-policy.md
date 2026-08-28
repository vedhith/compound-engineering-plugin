# Upstream-first universal workflow

This fork makes external prior art a precondition for feature implementation. It does not claim a new lifecycle methodology.

## Upstream basis

- **Forked base:** [EveryInc/compound-engineering-plugin](https://github.com/EveryInc/compound-engineering-plugin), revision `cbd329132d4fffcb621d4e9e71ab74733b8cacc6`, MIT. The fork retains its cross-agent converters, skill packaging, research/plan/work/review lifecycle, artifact-root configuration, and test suite.
- **Adopted lifecycle discipline:** [Microsoft HVE Core RPI](https://github.com/microsoft/hve-core), revision `8692fe38cc0415ff8d21aa1b5d8198f008cd4038`, MIT. RPI supplies the research-before-plan-before-implementation boundary, evidence artifacts, stable task continuity, and review/follow-up sequence.
- **Adopted feature-discovery rule:** Compound Engineering's existing landscape and prior-art research routes remain the discovery mechanism. This fork strengthens their condition from optional to mandatory for feature work.

The fork-specific delta is limited to three policy seams:

1. A feature plan must select a maintained, license-compatible system to adopt or fork. Rejecting all candidates cannot authorize greenfield implementation.
2. `ce-work` fails closed when feature evidence is absent and routes bare feature prompts back through planning.
3. Implementation uses one lead and at most one explicitly authorized worker; durable handoffs live under the configured artifact root.

## Candidate record

| Candidate | Evidence considered | Decision |
|---|---|---|
| Every Compound Engineering | Broad host support, active maintenance, MIT license, existing research/plan/work/review skills and tests | Forked base |
| Microsoft HVE Core RPI | Explicit evidence-led Research → Plan → Implement → Review → Follow-up lifecycle and durable tracking | Adopted discipline |
| GitHub Spec Kit | Mature specification workflow and broad adoption, but less complete as a universal execution/drop-off system | Rejected as primary base; useful compatible input |
| BMAD Method | Broad agent workflow, but licensing metadata and multi-agent emphasis do not fit this fork's least-context default | Rejected |
| Superpowers 6.3.0 (`b36e0829c6d0140e93cfef2ca599b1b07d4a7797`) | MIT and broad host packaging, but its session hook injects a large bootstrap prompt and its implementation path defaults to subagent-driven development; its pre-commit automation only validates its own eval sources | Rejected for runtime; no mini-prompt import |
| Superpowers Evals / Quorum (`114f7258272b1d606c59203abea5e566b894080f`) | Strong real-CLI black-box isolation, deterministic post-checks, provenance, cleanup, and cost accounting across many coding agents | Methodology only: the repository declares no license, so its code cannot be copied or forked |

## Mechanical invariants

For feature work, let `B` mean that the implementation-ready plan contains a selected upstream basis with a canonical URL and revision or release, and let `I` mean implementation may begin. The enforced safety property is:

```text
I ⇒ B
B ∈ {adopted, forked}
greenfield ∉ B
active_implementation_workers ≤ 1
```

The contract suite checks both positive and bypass paths in `tests/upstream-first-contract.test.ts`. These tests prove the repository's stated routing strings and guards are present and non-contradictory; they do not prove that a language model will obey every instruction or that an upstream project is defect-free. Prompt compliance is therefore not an enforcement boundary. Release requires an automated artifact validator plus black-box evaluations across supported model families; the tests must attempt bypasses and inspect filesystem, process, and artifact state rather than grade only the model's prose.

The automated black-box case `ce-work/bare-feature-requires-upstream-basis` in `tests/skill-eval-cell/catalog.ts` runs the same bare feature request through the installed Claude and Codex CLIs in separate disposable workspaces. It requires both hosts to route to `ce-plan`, name adopt/fork as the only valid basis, deny a greenfield exception, dispatch no worker, and leave Git clean. Run it with:

```sh
bun tests/skill-eval-cell/pack.ts --id ce-work/bare-feature-requires-upstream-basis --arm post --hosts claude,codex
```

## Updating the fork

Keep `upstream` pointed at `https://github.com/EveryInc/compound-engineering-plugin.git`. Rebase or merge upstream changes in a dedicated update branch, rerun the complete upstream test and validation suites, and review conflicts specifically against the four mechanical invariants above. Do not copy features out of upstream into a second local orchestration layer.
