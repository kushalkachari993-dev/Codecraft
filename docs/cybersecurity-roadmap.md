# Cybersecurity Engineering track roadmap

## Goal and fit

Teach learners to identify security risks, design controls, verify that legitimate use still works, and respond to incidents using evidence. The track should extend CodeCraft's existing Python, SQL, Frontend, Backend, Cloud, Data, and GenAI paths without repeating their general programming lessons.

Use the established CodeCraft format: **three paths, 21 lessons per path, 63 lessons total**. Each path has four worlds of 5, 5, 5, and 6 lessons. Lessons 5, 10, 15, and 21 are integrated world projects, with lesson 21 serving as that path's capstone. Learners can enter at the path matching their experience; the beginner path should not assume prior security knowledge.

Every lesson needs a concrete scenario, a clear explanation of the security principle and its limits, an example, a plausible mistake, an exercise with observable outcomes, and feedback that explains *why* a decision works. Each world project should include 3–4 scenario questions and an artifact that can be reviewed independently. Favor several valid solutions where the scenario permits them; avoid exact-string grading as a proxy for security reasoning.

All exercises use fictional applications, synthetic data, and local simulations or static validation. They must not require scanning outside systems, real credentials, cloud accounts, or new learning platforms.

## Beginner: Security Foundations

Outcome: review and protect a small web application, distinguish preventive controls from detection and recovery, and explain the evidence behind a fix.

### World 1 — Trust Map (lessons 1–5)

1. **Assets and adversaries:** identify the data, service, users, and likely abuse goals in a fictional product.
2. **Security properties:** reason about confidentiality, integrity, availability, and the trade-offs between them.
3. **Follow a network request:** trace DNS, TLS, HTTP, and the boundaries between browser, gateway, API, and database.
4. **Find the trust boundary:** mark where untrusted data or identity claims enter a system.
5. **Project — Map the attack surface:** annotate a supplied architecture and request trace; prioritize three risks and defend the ranking.

### World 2 — Identity Gate (lessons 6–10)

6. **Authentication versus authorization:** decide who is calling and what that caller may do.
7. **Sessions and MFA:** choose cookie and session settings; handle expiry, logout, and step-up verification.
8. **Input validation:** reject malformed requests while preserving legitimate input and useful errors.
9. **Output encoding and browser defenses:** prevent a simulated script-injection outcome using context-aware output handling and a bounded CSP.
10. **Project — Secure a request flow:** repair login and profile-edit decisions, then test allowed access, denied access, and session expiry.

### World 3 — Data Vault (lessons 11–15)

11. **Parameterized queries:** distinguish data from SQL syntax and repair a query built from untrusted input.
12. **Password storage and secrets:** identify when hashing, encryption, and a secret reference each apply; respond to an exposed secret.
13. **Object-level access control:** prevent one user from viewing or editing another user's record.
14. **Dependencies and configuration:** assess a vulnerable package advisory and an unsafe deployment setting without assuming every alert is exploitable.
15. **Project — Repair a vulnerable API:** review a small service for injection, authorization, and secret-handling flaws; document tests and residual risk.

### World 4 — Response Harbor (lessons 16–21)

16. **Useful security logs:** record actors, outcomes, and request IDs while excluding credentials and sensitive payloads.
17. **Alert triage:** distinguish a real access anomaly from expected application activity using sample metrics and logs.
18. **Incident timelines:** reconstruct what happened, what remains uncertain, and which evidence supports each claim.
19. **Containment and recovery:** choose a sequence that limits damage while preserving service and evidence.
20. **Clear communication:** write a concise incident update and remediation note without overstating certainty.
21. **Capstone — Protect the Relay:** review a fictional web app, implement defensive changes in safe training artifacts, test normal and malicious scenarios, and produce a short incident response plan.

## Intermediate: Secure Delivery

Outcome: integrate security into a service and its delivery pipeline, then investigate a production-style incident.

### World 1 — Threat Workshop (lessons 1–5)

1. **Model a feature's threats:** identify assets, entry points, trust boundaries, and credible misuse cases.
2. **Prioritize controls:** compare likelihood, impact, exploit prerequisites, and operational cost.
3. **Web sessions and CSRF:** select protections appropriate to cookie-based and token-based flows.
4. **API authorization and abuse limits:** address object-level authorization, excessive data exposure, and bounded rate limits.
5. **Project — Review a new feature:** create a threat model and tests for a document-sharing feature, including permitted and denied paths.

### World 2 — Cloud Shield (lessons 6–10)

6. **IAM least privilege:** scope actions, resources, and role assumption to an application task.
7. **Storage and network boundaries:** keep sensitive objects private and allow only necessary service paths.
8. **Containers and runtime controls:** review image provenance, runtime identity, capabilities, and workload configuration.
9. **Infrastructure policy:** inspect a Terraform plan and a Kubernetes manifest for risky changes and configuration drift.
10. **Project — Harden a deployment:** repair nested IAM, Terraform, and Kubernetes artifacts; demonstrate the intended access path and blocked alternatives.

### World 3 — Trusted Pipeline (lessons 11–15)

11. **Triage dependency findings:** connect an advisory to the actual package, version, reachable use, and fix options.
12. **Inventory and provenance:** interpret an SBOM and verify what a build attestation can and cannot establish.
13. **CI/CD permissions:** constrain workflow tokens, secrets, protected branches, and artifact promotion.
14. **Security tests in delivery:** choose meaningful static, dependency, integration, and authorization checks; handle false positives.
15. **Project — Protect the release path:** fix a vulnerable workflow and dependency change, then show a reviewable build and rollback decision.

### World 4 — Incident Observatory (lessons 16–21)

16. **Correlate logs and traces:** join synthetic request IDs, identity events, and service errors into a defensible timeline.
17. **Detect account abuse:** distinguish suspicious sign-in and access patterns from travel or normal automation.
18. **Contain without blind spots:** revoke affected credentials, preserve evidence, and assess blast radius.
19. **Investigate safely:** state what the available records prove, what they cannot prove, and what to collect next.
20. **Post-incident improvement:** choose controls, owners, deadlines, and measurements tied to the failure mode.
21. **Capstone — Secure and recover a service:** threat-model a supplied API, harden its deployment and pipeline, investigate a staged incident, and present tested remediation.

## Expert: Security Architecture and Detection

Outcome: lead security design across multiple services, validate controls under failure, and make risk and response decisions that another engineer can audit.

### World 1 — Architecture Council (lessons 1–5)

1. **Risk decisions under uncertainty:** compare impact, exposure, confidence, and the cost of a control.
2. **Architecture review:** trace cross-service data flows, privileged operations, and shared dependencies.
3. **Zero-trust service access:** authenticate and authorize each service call while planning rotation and failure behavior.
4. **Tenant isolation:** protect identity, data, queues, caches, and telemetry across tenant boundaries.
5. **Project — Review a shared platform:** produce a threat model, trust-boundary diagram, control plan, and test evidence for a multi-tenant service.

### World 2 — Identity and Supply Chain (lessons 6–10)

6. **Federated identity:** reason through OAuth/OIDC roles, token audience, scopes, expiry, and common trust mistakes.
7. **Key and secret lifecycle:** design issuance, storage, rotation, revocation, and recovery without exposing values.
8. **Build trust:** review source-to-artifact provenance, signed releases, and dependency exceptions.
9. **AI application boundaries:** constrain retrieved content, tool permissions, data flow, and prompt-injection effects in a fictional assistant.
10. **Project — Secure an AI feature:** review a retrieval-and-tools workflow, add scoped permissions and tests, and explain remaining limits.

### World 3 — Detection Studio (lessons 11–15)

11. **Detection design:** choose signals, a hypothesis, expected baseline, and false-positive budget.
12. **Investigate telemetry:** examine synthetic identity, application, and cloud-control events for linked behavior.
13. **Cloud control-plane incident:** trace a role change and suspicious access through an event timeline.
14. **Response automation:** gate automated containment by confidence, blast radius, and an escape hatch.
15. **Project — Build a detection pack:** create three linked detections, tune them against normal activity, and document response playbooks.

### World 4 — Resilience Command (lessons 16–21)

16. **Privacy and retention:** limit collected data, access, and retention while keeping investigations possible.
17. **Vulnerability management:** rank a mixed backlog using exploitability, exposure, dependencies, and compensating controls.
18. **Exceptions and ownership:** make time-bound risk decisions with an owner, evidence, and revisit trigger.
19. **Adversarial exercise:** run a contained tabletop on a synthetic environment and test whether defenses detect each stage.
20. **Recovery design:** coordinate identity recovery, service rollback, data validation, and communication across teams.
21. **Capstone — Defend the CodeCraft Platform:** review a fictional multi-tenant learning service, prioritize risks, harden its architecture and pipeline, correlate a staged incident, and present a recovery and follow-up plan.

## Exercise and content standard

- **Scenario checkpoints:** 3–4 questions at each world boundary. Include at least one ambiguous case that requires the learner to weigh evidence and explain a trade-off. Provide tailored explanations for every answer.
- **Artifacts:** use synthetic HTTP exchanges, session and IAM policies, SQL queries, Terraform plans, Kubernetes manifests, CI workflows, SBOM excerpts, logs, traces, and incident timelines. Validate structure and meaningful security properties locally; do not grade only one literal spelling of a correct solution.
- **Positive and negative tests:** a secure solution must still permit legitimate use. Every project should verify an intended action, at least one denied action, and a failure or recovery path.
- **Depth:** concepts should explain mechanism, context, limitations, and a common failure mode. Examples should differ from final missions so learners transfer the idea rather than copy a pattern.
- **Portfolio evidence:** each capstone should produce a threat model, changed artifact, test results, decision record, and concise summary that can be attached to the existing portfolio workbench. Private notes and sensitive simulation data remain private when a learner shares a showcase.
- **Accessibility:** all exercises work with keyboard and screen readers, expose text alternatives to visual traces, and do not rely on color alone for pass/fail feedback.

## Implementation order and acceptance

1. Register the track, three paths, world metadata, navigation, and progress keys. Confirm existing learners' progress is unaffected.
2. Author the beginner path and its four projects. Review technical accuracy before using its lessons as templates.
3. Add intermediate and expert lessons, checkpoints, and realistic static artifacts. Keep the evaluator local and deterministic.
4. Integrate the final capstones with the existing portfolio flow, including evidence export and privacy-safe sharing.
5. Verify route loading, resume and sync behavior, lesson grading, artifact validation, mobile layout, keyboard use, build, and regression tests before release.

The track is ready to publish when all 63 lessons have meaningful exercises, all 12 world projects have scenario checkpoints and reviewable artifacts, all three capstones produce portfolio evidence, and the existing tracks continue to pass their checks.
