# Learning-quality audit — 9 September 2026

## Scope and limits

This is a targeted sample audit, not a claim that the entire curriculum was
reviewed. It covers the first two beginner lessons in each of the five tracks:
10 lessons and 30 revised checkpoint questions. Intermediate, expert and later
beginner lessons retain their existing material. No topics or external platforms
were added. Learner outcomes have not yet been measured.

## Findings and changes

| Track and lessons | Gap addressed | New evidence of understanding |
| --- | --- | --- |
| Python: Environment; Variables | Definitions alone did not expose interpreter mismatch, working-directory assumptions or binding versus a live formula. | Compare executable paths, diagnose a stale kernel, trace rebinding and recomputation. |
| GenAI: AI/ML basics; Neural network basics | Aggregate accuracy and “learning from examples” can conceal minority-class failure and the difference between gradients and updates. | Inspect a 95% baseline that misses all urgent tickets; explain backward versus optimizer step and validation-loss divergence. |
| SQL: Database basics; Tables/rows/columns | Naming tables does not prove understanding of concurrent writes, transaction boundaries or stable identity. | Diagnose a duplicate-check race, choose atomic writes, use keys and explain why output order must be explicit. |
| Cloud: Who owns the problem?; Regions and failure zones | Responsibility depends on the service, and replica count alone does not prove availability. | Assign image versus host patch ownership; trace a surviving app's failed single-zone database dependency. |
| Backend: HTTP Request Lifecycle; REST Resources and Methods | A status code alone cannot identify root cause; idempotency is often confused with identical responses. | Trace an end-to-end deadline, investigate pool waiting, reason about lost responses, safe methods and deduplication. |

Each sample now includes an explicit worked scenario, an explanation of why the
result follows, a primary-source reading link and three reasoning questions.
Question answers are not all in the same position. Review options rotate so
learners cannot rely only on remembering a position.

## Primary references checked

- [Python environments](https://docs.python.org/3/tutorial/venv.html) and
  [assignment and values](https://docs.python.org/3/tutorial/introduction.html).
- [Google: overfitting and held-out evaluation](https://developers.google.com/machine-learning/crash-course/overfitting/overfitting)
  and [PyTorch optimization loop](https://docs.pytorch.org/tutorials/beginner/basics/optimization_tutorial.html).
- [PostgreSQL constraints](https://www.postgresql.org/docs/current/ddl-constraints.html)
  and [queries and explicit ordering](https://www.postgresql.org/docs/current/tutorial-select.html).
- [AWS shared responsibility](https://aws.amazon.com/compliance/shared-responsibility-model/)
  and [multi-zone reliability](https://docs.aws.amazon.com/wellarchitected/latest/reliability-pillar/rel_fault_isolation_multiaz_region_system.html).
- [MDN HTTP overview](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Overview)
  and [idempotency](https://developer.mozilla.org/en-US/docs/Glossary/Idempotent).

The request timings and ticket counts are authored teaching examples, not
production defaults or empirical performance claims.

## Returning learners

- Continue learning targets the first unfinished requirement on the most recently
  visited path, including a required world project after its checkpoint passes.
- Completed checkpoint titles and verified project counts show demonstrated
  practice, explicitly not a certification of mastery.
- Missed quiz and investigation questions enter a browser-local review queue,
  prioritizing repeated misses. A correct review removes the question from the
  pending queue; another later miss reopens it.
- Reviews do not grant XP, mark lessons complete or bypass project gates.
- The last visit and review queue remain on the current browser/device. Existing
  signed-in progress synchronization is unchanged. No cross-device review sync
  is claimed. Old mistakes cannot be reconstructed; capture begins with this release.

## Next audit boundary

## Verification

- Production build succeeded; targeted lint passed.
- 166 unit tests passed, including review persistence, corrupt/blocked storage,
  project-aware resumption and preservation of original lesson walkthroughs.
- All 9 existing browser tests passed on the final build. An early-click
  onboarding failure was reproduced under parallel testing and fixed by keeping
  pace-selection controls disabled until client event handlers are ready.
- Browser smoke checks covered all 10 revised lessons at 390px width, with no
  horizontal overflow, plus actual Python/Cloud missed-answer capture, review
  completion and reload, unchanged XP/progress, and resuming Python's unfinished
  first world project.
- Full TypeScript checking still reports the 44 pre-existing diagnostics in the
  repository. The baseline comparison exposed one new caller mismatch, which was
  fixed; no new diagnostics remain. This is not a clean full-project typecheck.
- Authenticated cross-device review sync was not tested or added. Clerk still
  uses the existing development configuration; this release does not resolve it.

## Next audit boundary

Sample one applied intermediate lesson and one advanced project per track next.
Use observed misconceptions and failed exercises to select subsequent edits,
not a target topic count. The current queue repeats missed questions; novel
transfer exercises and spaced scheduling remain future improvements.
