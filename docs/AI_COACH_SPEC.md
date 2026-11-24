# AI Coach Specification
## Personal Running Coach

## 1. Purpose

AI Coach membantu pengguna memahami data latihan, mengevaluasi progres, dan mempertimbangkan penyesuaian program. AI bukan training engine, bukan sumber kebenaran data, dan bukan tenaga kesehatan.

## 2. Capabilities

- Weekly training review.
- Activity/performance interpretation.
- Recovery context interpretation.
- Goal progress summary.
- Training plan adjustment proposal.
- Conversational Q&A grounded in user data.

## 3. Non-capabilities

AI must not:
- Diagnose injuries or medical conditions.
- Guarantee race outcomes or injury prevention.
- Invent missing activities, metrics, PRs, or recovery inputs.
- Directly modify database records.
- Change active plan without explicit approval.
- Override deterministic validation.
- Treat a single readiness/load score as definitive.

## 4. Workflow

```mermaid
sequenceDiagram
    participant User
    participant App as Next.js Server
    participant Engine as Domain Engines
    participant AI as OpenRouter
    participant DB as Supabase

    User->>App: Request weekly review
    App->>DB: Load plan, activities, recovery
    App->>Engine: Calculate metrics and flags
    Engine-->>App: Structured analysis
    App->>AI: Minimized context + output schema (via OpenRouter adapter)
    AI-->>App: Model response; parse + Zod validate
    App->>App: Validate schema and business rules
    App->>DB: Save session and recommendation
    App-->>User: Show review and proposal
    User->>App: Accept or reject
    App->>Engine: Revalidate proposal and plan version
    Engine-->>App: Validated adjustment
    App->>DB: Apply transaction + audit
    App-->>User: Updated plan
```

## 5. Input context contract

Server constructs a minimal context object, for example:

```json
{
  "period": {
    "start_date": "YYYY-MM-DD",
    "end_date": "YYYY-MM-DD",
    "timezone": "Asia/Jakarta"
  },
  "runner": {
    "experience_level": "advanced",
    "primary_goal": "10k",
    "target_date": null,
    "baseline_completeness": 0.82
  },
  "plan": {
    "id": "uuid",
    "version": 3,
    "phase": "threshold",
    "guardrails": {
      "min_hard_session_gap_hours": 48,
      "long_run_share_cap": 0.35
    },
    "planned_workouts": []
  },
  "actual_training": {
    "activities": [],
    "weekly_distance_m": null,
    "completed_sessions": 0,
    "missed_sessions_derived": 0,
    "intensity_distribution": null,
    "training_load": {
      "weekly_total_au": null,
      "acute_load": null,
      "chronic_load": null,
      "methods_used": ["srpe", "hr_trimp_estimate", "duration_estimate"],
      "estimated_share": 0.5,
      "completeness": 0.85
    }
  },
  "recovery": {
    "check_ins": [],
    "missing_days": []
  },
  "engine_analysis": {
    "load_trend": null,
    "flags": [],
    "data_limitations": []
  }
}
```

Values shown are illustrative. Use actual data and explicit nulls. Context must explicitly surface training-load calculation methods (`srpe` vs. `hr_trimp_estimate` vs. `duration_estimate`), completeness, and baseline/methodology guardrails so the AI never treats a `duration_estimate` proxy as equivalent to user-reported `srpe` or measured HR-TRIMP.

## 6. Output schema

### 6.1 Weekly review & adjustment proposal schema

Recommended logical response:

```json
{
  "summary": "string",
  "highlights": [
    {
      "title": "string",
      "observation": "string",
      "evidence_refs": ["activity-or-metric-id"]
    }
  ],
  "concerns": [
    {
      "level": "info|caution|high_caution",
      "description": "string",
      "evidence_refs": []
    }
  ],
  "recommendations": [
    {
      "type": "insight|recovery|plan_adjustment",
      "title": "string",
      "rationale": "string",
      "confidence": 0.0,
      "limitations": []
    }
  ],
  "plan_adjustment": {
    "proposed": false,
    "based_on_plan_version": 3,
    "changes": [],
    "expected_tradeoffs": []
  },
  "follow_up_questions": []
}
```

Production schema must use strict enums, bounds, and Zod validation. `evidence_refs` must resolve to records/metrics in the supplied context. AI cannot invent IDs.

### 6.2 Conversational Q&A (`chat`) schema
For `session_type = 'chat'`, enforce a bounded structured JSON response (`{ answer: string, evidence_refs: string[], data_limitations: string[], safety_notice: string | null }`) validated via Zod, capping multi-turn conversation history (e.g., last 6-10 turns + summarized context snapshot) to stay within free-model token budgets.

## 7. Proposal requirements

Every plan adjustment proposal must include:
- Reason and supporting evidence.
- `training_plan_id` and `based_on_plan_version` used to generate it.
- Affected workout IDs.
- Before/after values.
- Expected benefit and trade-off.
- Confidence level and limitations (including whether underlying training-load inputs relied on `duration_estimate` or sparse recovery data).
- Expiry/staleness condition (`expires_at`: default 7 days from creation, or immediately `superseded` if `training_plans.plan_version` advances via manual calendar edits or another accepted adjustment).

Allowed proposal operations should be narrow and explicit, such as:
- Change workout date.
- Change workout type within approved set.
- Reduce/adjust target distance or duration.
- Replace a hard session with an easy/recovery session.
- Remove a session from the current week.
- Suggest rest.

AI must not create arbitrary SQL, arbitrary code, or unsupported workout types.

## 8. Provider integration contract

- Production provider: OpenRouter, called only from trusted server-side code.
- Use the OpenAI-compatible Chat Completions API at `https://openrouter.ai/api/v1` through a server-side provider adapter (or the official OpenRouter SDK after dependency review).
- API key is stored only in Vercel/Supabase server secrets. Never expose it through `NEXT_PUBLIC_*`, client bundles, logs, or error messages.
- Model ID is configuration (`OPENROUTER_MODEL`), not embedded in domain logic. Maintain a tested allowlist of models that satisfy the application output contract.
- Optional fallback model is configured separately. Retry only transient/provider availability errors, rate limits with bounded backoff, and timeout classes; do not blindly retry invalid requests.
- The adapter normalizes provider response metadata and errors into an internal contract. AI Coach domain services must not import provider SDK types.
- Structured output / JSON-schema mode is used only when the selected model explicitly supports it and has passed contract tests. Otherwise request JSON and validate with Zod; malformed output is rejected, not repaired into a plan mutation.
- Persist provider, model ID, request ID (if supplied), prompt version, schema version, latency, and usage metadata where available. Never persist API keys or full sensitive provider headers.
- OpenRouter’s free model catalogue and limits can change. Model selection must be replaceable without a schema or domain rewrite.

## 9. Deterministic validation

Before presenting/applying a proposal, validate:
- User owns plan and workouts.
- Plan is still active and version matches.
- Workout dates are within valid plan range.
- No duplicate/conflicting workout.
- Weekly frequency and volume remain within configured guardrails.
- Hard-session spacing rules are respected.
- Rest days and user availability are respected.
- No invalid target values or malformed workout steps.
- Safety flags do not conflict with proposed intensity.
- Proposal has not expired or already been applied.

If validation fails, reject or request regeneration. Never silently coerce an unsafe proposal.

## 10. Approval lifecycle

`pending → accepted | rejected | expired | superseded`

On accept:
1. Recheck ownership and plan version.
2. Re-run deterministic validation.
3. Apply changes in a transaction.
4. Increment plan version.
5. Store before/after snapshots.
6. Mark recommendation accepted.
7. Create audit record.

On reject:
- Store decision and optional reason.
- Leave plan unchanged.

## 11. Prompt design principles

System instruction should establish:
- You are a running training assistant, not a clinician.
- Use only provided facts.
- Explicitly identify missing/uncertain data.
- Do not fabricate evidence.
- Be conservative when data is incomplete or recovery is concerning.
- Explain the rationale in clear language.
- Return only the required structured format.
- Do not claim an adjustment has been applied.
- Do not diagnose or prescribe treatment.

## 12. Example system prompt

```text
You are the Personal Running Coach assistant.
Analyze only the structured runner context provided to you.
Do not invent missing values, activities, personal records, or health information.
Distinguish measured data, derived metrics, and estimates.
Treat training-load and readiness indicators as imperfect signals, not diagnoses.
Do not recommend training through severe or worsening pain or concerning symptoms.
You may propose a plan adjustment, but you cannot apply it.
Every proposal must reference supplied evidence and the supplied plan version.
If the data is insufficient, say so and ask for the most important missing information.
Return a response that conforms exactly to the supplied JSON schema.
```

## 13. Cost and reliability controls

- Generate weekly review on demand; scheduled generation is optional and must respect free-tier quotas.
- Cache/store results against a context/version fingerprint.
- Avoid resending raw streams or full activity history.
- Set token budgets and request timeouts.
- Validate and store model metadata.
- Provide deterministic fallback summaries if AI is unavailable.
- Prioritize eligible free models, but never assume a free model is continuously available or has stable output quality.
- Apply per-user request budgets and cache results using context/version fingerprints.
- Avoid sending direct identifiers, precise GPS traces, Strava tokens, or unnecessary injury notes to the model provider.
- Do not repeatedly call the model for identical unchanged context.
