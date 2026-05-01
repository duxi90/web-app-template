# Bootstrap flowchart

Human-facing audit of the interview tree. The agent treats `questions.yaml` as
the source of truth — this diagram just helps you see the shape.

```mermaid
flowchart TD
  Start([User pastes seed URL]) --> Negotiate[Negotiate target dir, project name, shell, --blank]
  Negotiate --> Q1{render_mode?}
  Q1 -->|static| Q2
  Q1 -->|ssr| Q2
  Q1 -->|both| Q2
  Q2{backend_worker?} --> Q3
  Q3{content_engine?} --> Q4
  Q4{ui_layer?} --> Q5
  Q5{deploy_target?} -->|cloudflare| Q6
  Q5 -->|vercel| Q8
  Q5 -->|none| Q8
  Q6{terraform_scope?} -->|any picked| Q7
  Q6 -->|none| Q8
  Q7{ci_terraform?} --> Q8
  Q8{r2_runtime_client?} --> Q9
  Q9{lint_strictness?} --> Q10
  Q10{spell_check?} --> Q11
  Q11{i18n?} --> Q12
  Q12{temporal_dates?} --> Q13
  Q13{scripts_automation?} --> Q14
  Q14{db_stub?} --> Q15
  Q15{ci_strictness?} --> Confirm[Print summary, ask for confirmation]
  Confirm -->|yes| Apply[Apply recipes per _index.yaml]
  Confirm -->|no| Q1
  Apply --> Finalize[Run init/finalize.md]
  Finalize --> Done([Single chore: bootstrap commit])
```

Skipped questions (when `depends_on` is unmet) collapse silently — the agent
moves to the next. There is no fallback path or "back" button; if the user
wants to change an earlier answer, they restart the interview.
