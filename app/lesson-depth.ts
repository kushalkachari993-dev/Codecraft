import type { ReviewQuestion } from "./learning-memory";
export type LessonDepth = { track: string; title: string; explanation: string; example: string; reasoning: string; source: string; questions: ReviewQuestion[] };
export const LESSON_DEPTH: LessonDepth[] = [
  {
    "track": "python",
    "title": "Environment",
    "explanation": "A terminal and an editor can launch different Python installations. A successful install proves only that one environment has a package. Inspect the executable before reinstalling anything.",
    "example": "import sys\nprint(sys.executable)\n# Run in both the editor and terminal.\n# In the terminal, inspect pip for the selected interpreter:\n# python -m pip --version",
    "reasoning": "Compare executable paths. Matching version numbers alone do not prove that two processes use the same environment. A running notebook kernel also keeps its interpreter when another shell activates an environment.",
    "source": "https://docs.python.org/3/tutorial/venv.html",
    "questions": [
      {
        "question": "The terminal imports a package; the editor cannot. Both report Python 3.14. What should you compare?",
        "options": [
          "sys.executable in both processes",
          "Only the package version in the terminal",
          "Only the matching version strings"
        ],
        "answer": 0,
        "explanation": "Different installations can share a version but have separate packages. Compare paths, then select the intended interpreter."
      },
      {
        "question": "A new terminal activates your environment, but an old notebook kernel still cannot import the package. What should change?",
        "options": [
          "Activate another terminal without changing the kernel",
          "Select or restart the notebook kernel in that environment",
          "Reinstall into the already working terminal environment"
        ],
        "answer": 1,
        "explanation": "Activating a shell does not replace an already running kernel's interpreter."
      },
      {
        "question": "A script opens data/input.csv when launched from /project but fails from /tmp. Why?",
        "options": [
          "Relative paths always start at the script file",
          "An activated environment chooses the data directory",
          "Relative data paths follow the working directory"
        ],
        "answer": 2,
        "explanation": "The relative path starts from the process working directory, not automatically from the script's directory."
      }
    ]
  },
  {
    "track": "python",
    "title": "Variables",
    "explanation": "Assignment binds a name to the value computed now. It does not create a spreadsheet formula that updates other names later. Trace each statement before predicting output.",
    "example": "energy = 8\nreserve = energy\nenergy = energy + 3\nprint(energy, reserve)\n# Output: 11 8",
    "reasoning": "reserve retains the original integer value. Rebinding energy does not change reserve. These are immutable integers; two names pointing to a mutable list can observe the same in-place mutation.",
    "source": "https://docs.python.org/3/tutorial/introduction.html",
    "questions": [
      {
        "question": "After count = 4; saved = count; count = 9, what does saved contain?",
        "options": [
          "9, because it follows count",
          "4, from the earlier binding",
          "An undefined value"
        ],
        "answer": 1,
        "explanation": "Assignment establishes a binding, not a live formula. saved still refers to 4."
      },
      {
        "question": "A counter is 10 and three items arrive. Which statement adds them to the existing count?",
        "options": [
          "count = 3",
          "count == count + 3",
          "count = count + 3"
        ],
        "answer": 2,
        "explanation": "The right side reads 10 and computes 13 before rebinding count. Equality comparison does not update state."
      },
      {
        "question": "total = subtotal + tax ran before tax changed. How does total reflect the new tax?",
        "options": [
          "Recompute and assign total",
          "Read total without assigning it",
          "Rename tax to current_tax"
        ],
        "answer": 0,
        "explanation": "The old total is a value already computed. Re-evaluating the expression produces the updated total."
      }
    ]
  },
  {
    "track": "genai",
    "title": "AI/ML basics",
    "explanation": "Compare a learned model with a baseline on held-out examples. Aggregate accuracy can hide costly failures on rare cases; choose metrics that reflect the product's actual goal.",
    "example": "Held-out tickets: 1,000\nUrgent tickets: 50\nAlways predict routine: 950 correct = 95% accuracy\nUrgent tickets detected: 0 of 50",
    "reasoning": "This baseline scores 95% yet misses every urgent ticket. Measure urgent-case recall and false alarms as well as overall accuracy. Keep evaluation examples separate from training.",
    "source": "https://developers.google.com/machine-learning/crash-course/overfitting/overfitting",
    "questions": [
      {
        "question": "A classifier is 95% accurate when 95% of tickets are routine. What must you inspect?",
        "options": [
          "Model size compared with the old model",
          "Accuracy on training examples only",
          "Urgent-case misses and false alarms on held-out tickets"
        ],
        "answer": 2,
        "explanation": "Always predicting routine already achieves 95%. Class-specific errors test whether the important minority is handled."
      },
      {
        "question": "A fully specified policy requires review for orders above 100. Which baseline should you test first?",
        "options": [
          "A deterministic implementation of the policy",
          "A classifier trained on past decisions",
          "A generated explanation used as the decision"
        ],
        "answer": 0,
        "explanation": "An explicit rule can be implemented and tested directly; old decisions may contain errors or reflect an older policy."
      },
      {
        "question": "Accuracy improves from 90% to 92%, but urgent misses double. What should determine release?",
        "options": [
          "Higher overall accuracy alone",
          "Agreed costs and thresholds for each error type",
          "The number of parameters"
        ],
        "answer": 1,
        "explanation": "A gain on common cases may not compensate for critical misses. Evaluate against the workflow's requirements."
      }
    ]
  },
  {
    "track": "genai",
    "title": "Neural network basics",
    "explanation": "A forward pass predicts, loss measures error, gradients describe local sensitivity, and an optimizer updates parameters. Computing gradients alone does not update the model.",
    "example": "# Training pseudocode, with model and optimizer configured\noptimizer.zero_grad()\nprediction = model(features)\nloss = loss_fn(prediction, target)\nloss.backward()\noptimizer.step()",
    "reasoning": "zero_grad clears accumulated gradients; backward computes them; step applies an update. Falling training loss alone does not demonstrate generalization: compare behavior on separate validation examples.",
    "source": "https://docs.pytorch.org/tutorials/beginner/basics/optimization_tutorial.html",
    "questions": [
      {
        "question": "A training loop calls loss.backward() but never optimizer.step(). Why can predictions stay unchanged?",
        "options": [
          "backward updates parameters only in evaluation mode",
          "Gradients exist but no parameter update was applied",
          "zero_grad already applies the update before backward"
        ],
        "answer": 1,
        "explanation": "Differentiation computes gradients; the optimizer applies them to parameters."
      },
      {
        "question": "Training loss falls while validation loss rises over several epochs. What concern is supported?",
        "options": [
          "Overfitting despite improved training fit",
          "Validation data must be moved into training before reporting results",
          "More layers are necessarily needed"
        ],
        "answer": 0,
        "explanation": "The divergence suggests poorer generalization. Preserve the evaluation split while investigating."
      },
      {
        "question": "A service classifies new tickets with fixed learned weights. What is this?",
        "options": [
          "Training because inputs are new",
          "Backpropagation because predictions are produced",
          "Inference using learned parameters"
        ],
        "answer": 2,
        "explanation": "New input does not imply training. Ordinary inference applies learned parameters without optimizing them."
      }
    ]
  },
  {
    "track": "sql",
    "title": "Database basics",
    "explanation": "A database enforces the rules you actually define. Checking for a duplicate in application code can race with another writer. Enforce uniqueness at the write boundary and handle a rejected write.",
    "example": "CREATE TABLE signups (\n  signup_id integer PRIMARY KEY,\n  email text NOT NULL UNIQUE\n);\n-- Concurrent inserts of the same email cannot both succeed.",
    "reasoning": "The application must handle a constraint violation. UNIQUE applies to the stored value under its comparison rules; normalization and case-insensitive identity require an explicit policy. Transactions group related writes into one commit or rollback.",
    "source": "https://www.postgresql.org/docs/current/ddl-constraints.html",
    "questions": [
      {
        "question": "Two requests both find no email, then insert it. What closes the race for exact stored duplicates?",
        "options": [
          "A faster SELECT before INSERT",
          "A UNIQUE constraint and handling the rejected insert",
          "A cache of addresses checked earlier"
        ],
        "answer": 1,
        "explanation": "Both reads can precede either write. A database constraint arbitrates the conflict."
      },
      {
        "question": "A transfer debits one account and credits another. How can their database changes commit together?",
        "options": [
          "Order two separately committed statements",
          "Read both balances before issuing separate commits",
          "Place both writes in one transaction"
        ],
        "answer": 2,
        "explanation": "A transaction groups the changes. Source-code order does not make separate commits atomic."
      },
      {
        "question": "A case-sensitive UNIQUE column permits Nova and nova, but the product treats them as one identity. What is missing?",
        "options": [
          "An explicit normalization or case-insensitive uniqueness policy",
          "A second ordinary index",
          "More read retries"
        ],
        "answer": 0,
        "explanation": "The database enforces defined semantics, not an unstated business rule."
      }
    ]
  },
  {
    "track": "sql",
    "title": "Tables/rows/columns",
    "explanation": "Define what one row represents. Display names can repeat or change, so stable keys identify entities and relationships should reference those keys.",
    "example": "CREATE TABLE relays (relay_id integer PRIMARY KEY, name text NOT NULL);\nINSERT INTO relays VALUES (1, 'North'), (2, 'North');\nSELECT relay_id, name FROM relays ORDER BY relay_id;\n-- Result: (1, North), (2, North)",
    "reasoning": "Two physical relays can have the same display name. Their IDs keep them distinct. ORDER BY makes output order explicit; insertion order is not a query guarantee.",
    "source": "https://www.postgresql.org/docs/current/ddl-constraints.html",
    "questions": [
      {
        "question": "Two physical relays are named North. Which design preserves their separate identities?",
        "options": [
          "Use name as the primary key",
          "Keep only the latest North row",
          "Give each a distinct relay_id"
        ],
        "answer": 2,
        "explanation": "A stable key identifies the entity independently of a repeated display name."
      },
      {
        "question": "A maintenance record belongs to one relay. Which reference is most reliable?",
        "options": [
          "relay_id enforced by a foreign key",
          "Its current name without a constraint",
          "Its position in yesterday's result"
        ],
        "answer": 0,
        "explanation": "A foreign key relates the record to a valid stable identity."
      },
      {
        "question": "A query happens to return insertion order, but the UI requires ascending relay_id. What should you add?",
        "options": [
          "An insertion-order comment",
          "ORDER BY relay_id",
          "Longer column names"
        ],
        "answer": 1,
        "explanation": "An explicit ordering clause is needed; observed storage or insertion order is not a promise."
      }
    ]
  },
  {
    "track": "cloud",
    "title": "Who owns the problem?",
    "explanation": "Ownership depends on the service. In this managed-container scenario the provider operates hosts; the team owns its image and access policy. Self-managed VMs add guest operating-system work.",
    "example": "Host hypervisor patch → provider\nOverly broad app role → application team\nVulnerable library inside our image → application team",
    "reasoning": "Host maintenance does not rebuild your application image or revoke public data access. Check each service's responsibility boundary before applying the split elsewhere.",
    "source": "https://aws.amazon.com/compliance/shared-responsibility-model/",
    "questions": [
      {
        "question": "The provider patches a managed-container host, but your image has a vulnerable library. Who fixes it?",
        "options": [
          "The team rebuilds and deploys its image",
          "The host patch necessarily updates the image",
          "The team only restarts the unchanged image on a patched host"
        ],
        "answer": 0,
        "explanation": "The image is customer-controlled. Host maintenance does not rebuild application dependencies."
      },
      {
        "question": "Managed containers are replaced with self-managed VMs. Which work commonly moves to the team?",
        "options": [
          "Physical facility access controls",
          "Guest operating-system patching",
          "Replacing physical disks"
        ],
        "answer": 1,
        "explanation": "Guest OS management normally belongs to the self-managed VM customer; physical infrastructure remains with the provider."
      },
      {
        "question": "Encrypted storage is anonymously readable through a team-defined policy. What addresses the exposure?",
        "options": [
          "Rotate only the encryption key",
          "Move the same policy to another encrypted bucket",
          "Correct the policy and verify anonymous reads are denied"
        ],
        "answer": 2,
        "explanation": "Encryption at rest does not revoke access granted by policy. Test the denied path after the repair."
      }
    ]
  },
  {
    "track": "cloud",
    "title": "Regions and failure zones",
    "explanation": "Count independent failure domains, then inspect dependencies. Two app replicas do not guarantee zone resilience when both need a database in the failed zone.",
    "example": "Zone A: app replica 1 + only database\nZone B: app replica 2\nZone A fails\nReplica 2 runs; database-backed requests still fail.",
    "reasoning": "A surviving process is not a working service. Routing, capacity and dependent services must also survive or recover. Verify a complete user request during a failure drill.",
    "source": "https://docs.aws.amazon.com/wellarchitected/latest/reliability-pillar/rel_fault_isolation_multiaz_region_system.html",
    "questions": [
      {
        "question": "Apps span zones A and B; their only database is in A. What can happen when A fails?",
        "options": [
          "The surviving app retains all database behavior",
          "The surviving app loses database-backed functionality",
          "The region label automatically relocates the database"
        ],
        "answer": 1,
        "explanation": "The shared database is still a single-zone dependency. A healthy app process cannot complete requests that require the unavailable database."
      },
      {
        "question": "Replicas are on separate hosts in one zone. Which failure remains shared?",
        "options": [
          "Only a single process crash",
          "Only one host's failure",
          "A zone-wide outage"
        ],
        "answer": 2,
        "explanation": "Different hosts reduce host-level coupling, not the shared zone-level failure domain."
      },
      {
        "question": "A drill proves one replica survived. What else supports a service availability claim?",
        "options": [
          "A successful request through routing and critical dependencies",
          "Only the process count",
          "Only the zone labels"
        ],
        "answer": 0,
        "explanation": "Availability is an end-to-end outcome, including capacity and dependent systems."
      }
    ]
  },
  {
    "track": "backend",
    "title": "HTTP Request Lifecycle",
    "explanation": "Separate the symptom from the earliest failing boundary. Correlated timings can show whether routing, the handler, pool waiting or a dependency consumed the request deadline.",
    "example": "Sequential request budget: 400 ms\nRouting: 20 ms\nHandler: 30 ms\nPool wait: 320 ms\nDependency still needs: 80 ms\nTotal needed: 450 ms → deadline exceeded",
    "reasoning": "Only 30 ms remain after waiting, less than the 80 ms dependency work needs. Investigate saturation and bound waiting; a fresh deadline at each hop defeats the end-to-end budget. These numbers are teaching constraints, not universal production defaults.",
    "source": "https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Overview",
    "questions": [
      {
        "question": "A 500 ms request budget has spent 420 ms. Ignoring overhead, how much remains for downstream work?",
        "options": [
          "500 ms for the new hop",
          "920 ms including elapsed time",
          "80 ms shared by remaining work"
        ],
        "answer": 2,
        "explanation": "500 minus 420 leaves 80 ms for all remaining work. Granting the next hop another 500 ms resets rather than preserves the client's total budget."
      },
      {
        "question": "A gateway returns 502; the trace shows most time in a database pool. What should you investigate first?",
        "options": [
          "Pool saturation and held connections along that path",
          "Replace the edge because it emitted the status",
          "Increase all deadlines equally"
        ],
        "answer": 0,
        "explanation": "The edge reports the symptom. The trace supports investigating pool saturation and long-held connections; it does not prove that replacing the edge will help."
      },
      {
        "question": "A client times out after creating an order. Why can blindly retrying duplicate it?",
        "options": [
          "The request could not have reached the server",
          "The write may have committed before its response was lost",
          "HTTP prevents a second identical request"
        ],
        "answer": 1,
        "explanation": "A timeout leaves an uncertain outcome. Use stable operation identity and defined server deduplication before repeating a side effect."
      }
    ]
  },
  {
    "track": "backend",
    "title": "REST Resources and Methods",
    "explanation": "Idempotency concerns the intended server effect of repetition, not identical response codes. Method semantics guide clients, but applications must implement them correctly.",
    "example": "PUT /profiles/42\n{ \"displayName\": \"Nova\" }\nRepeated desired state → still Nova\n\nPOST /orders\n{ \"item\": \"relay\" }\nWithout deduplication, repetition may create two orders.",
    "reasoning": "A repeated DELETE may return 404 after removal while remaining idempotent. POST can use an application-level idempotency key, but the method alone does not guarantee deduplication.",
    "source": "https://developer.mozilla.org/en-US/docs/Glossary/Idempotent",
    "questions": [
      {
        "question": "DELETE succeeds once and returns 404 when repeated. Is the changed status enough to prove non-idempotency?",
        "options": [
          "Yes, responses must match",
          "No, compare the intended server effect",
          "Yes, a repeated DELETE must return success to be idempotent"
        ],
        "answer": 1,
        "explanation": "The resource remains absent across repetitions despite different status codes. Idempotency concerns the intended effect, not response equality."
      },
      {
        "question": "A client retries POST /orders after a lost response. Which contract best avoids another order?",
        "options": [
          "A new identity for each attempt",
          "Assume POST is inherently idempotent",
          "Reuse one key with defined server-side deduplication"
        ],
        "answer": 2,
        "explanation": "Stable operation identity lets the server associate retries with one effect and reject conflicting reuse."
      },
      {
        "question": "GET /orders/42 sends a confirmation email on every request. Why is this unsafe for ordinary clients?",
        "options": [
          "Clients may prefetch or retry GET expecting safe semantics",
          "It is safe if the response is cacheable",
          "It is safe if repeated emails have the same content"
        ],
        "answer": 0,
        "explanation": "An intentional email side effect violates safe-method expectations. Prefetching or retrying a GET could send messages the user did not intend, regardless of URL naming."
      }
    ]
  }
];
export function getLessonDepth(track: string, pace: string, title: string) {
  return pace === "beginner" ? LESSON_DEPTH.find(d => d.track === track && d.title === title) : undefined;
}
