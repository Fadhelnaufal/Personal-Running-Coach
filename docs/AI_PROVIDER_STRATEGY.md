# AI Provider Strategy — OpenRouter Primary
## Personal Running Coach

**Decision status:** Accepted (2026-11-24)
**Production provider:** OpenRouter
**Cost preference:** Free model variants first
**Direct Gemini integration:** Not in MVP baseline
**9Router:** Not required in production

## 1. Goals

- Use one server-side gateway to access multiple model families.
- Keep model/provider changes outside domain logic.
- Prefer $0 model variants while respecting rate limits and availability.
- Keep training calculations and safety validation deterministic.
- Fail safely when the model is unavailable or returns invalid output.

## 2. Integration contract

- Base URL: `https://openrouter.ai/api/v1`
- Chat endpoint: `/chat/completions`
- Authentication: `Authorization: Bearer <OPENROUTER_API_KEY>`
- Request model: configured model slug (not hard-coded in feature logic).
- Client: OpenAI-compatible TypeScript SDK or official OpenRouter SDK, selected after a small proof of concept.
- Optional attribution headers such as `HTTP-Referer` and `X-Title` may be configured for the deployed application.

Suggested environment variables:

```env
OPENROUTER_API_KEY=
OPENROUTER_MODEL=
OPENROUTER_FALLBACK_MODEL=
OPENROUTER_SITE_URL=
OPENROUTER_APP_NAME=Personal Running Coach
AI_REQUEST_TIMEOUT_MS=20000
AI_MAX_REQUESTS_PER_DAY=
AI_MAX_TOKENS=
```

Never expose any of these secrets/configuration values through `NEXT_PUBLIC_*`. `OPENROUTER_MODEL` is not a secret but should remain server-controlled.

## 3. Model selection policy

1. Maintain a small allowlist of models tested against the app's prompts and response schema.
2. Prefer a currently available free variant when it meets quality, context-window, latency, and output-format requirements.
3. Pin the selected model ID in deployment configuration to make behavior reproducible.
4. Configure a fallback model only after it passes the same tests.
5. Re-evaluate the model catalogue periodically; do not assume a model slug, free availability, or provider route is permanent.
6. The `openrouter/free` dynamic router can be tested as an alternative, but it may select different models over time. Persist the actual returned model metadata when available.

Free model variants with `:free` have historically documented rate limits of 20 requests/minute and 50 requests/day without $10+ lifetime purchased credits (1,000 requests/day once $10+ lifetime credits have been purchased); limits and catalogue can change. Other zero-priced models may have different conditions. Verify the current OpenRouter limits and ZDR/prompt-training routing settings before release. Failed attempts due to upstream errors typically do not deduct from daily caps, though a negative credit balance blocks free models.

## 4. Task policy

MVP uses one configured model for all AI Coach tasks to reduce complexity. Later, task-based routing may be introduced:
- Weekly review: balanced instruction-following and structured output.
- Conversational coaching: low-latency model with reliable context handling.
- Plan adjustment proposal: strongest validated reasoning model, but still only a proposal.

Do not route a task to a model solely based on marketing labels. Maintain a benchmark set of representative running-coach prompts and validate outputs.

## 5. Request lifecycle

1. Authenticated user requests a coach action.
2. Server loads only authorized and relevant records.
3. Deterministic domain engines calculate metrics and safety flags.
4. Context builder removes unnecessary identifiers and raw GPS/stream data.
5. Provider adapter sends the prompt and supported response-format constraints to OpenRouter.
6. Adapter normalizes the response, provider errors, model metadata, and usage.
7. Zod validates the output; evidence references are checked against the supplied context.
8. Training engine validates any proposed workout changes.
9. Recommendation is persisted as pending; user explicitly accepts or rejects.

## 6. Structured output compatibility

- Prefer JSON Schema/structured output only when the selected model and route support the required mode.
- Maintain a compatibility test for required keys, enums, numeric bounds, evidence references, and nullability.
- If structured output is unsupported, request JSON in the prompt and parse/validate strictly.
- Never use regex or heuristic repair to turn malformed model output into an executable plan change.
- Invalid output is discarded and surfaced as a recoverable AI error.

## 7. Reliability and quota policy

- Enforce an application-level per-user request budget and daily cap.
- Cache weekly reviews using a fingerprint of plan version, activity range, recovery records, prompt version, and model ID.
- Use request timeout and bounded retries with jitter for transient failures only.
- Respect 429/rate-limit signals and any retry guidance. Do not retry indefinitely.
- Fallback to configured model only for eligible transient/model availability errors, not for invalid user input or business-rule rejection.
- Provide deterministic analytics summaries when AI is unavailable.
- Do not automatically switch to a paid model. Paid inference requires an explicit configuration change and cost review.

## 8. Privacy and security

Running activity, heart-rate, recovery, and injury notes can be sensitive. Before sending context:
- Minimize to aggregated values and the specific activity fields required.
- Do not send Strava access/refresh tokens, account credentials, precise GPS coordinates, or unnecessary direct identifiers.
- Avoid sending detailed injury/medical notes unless necessary for the requested analysis; if included, send only the minimal user-authored context.
- Review OpenRouter privacy controls and the selected upstream provider's data handling/retention terms. Do not assume gateway terms automatically override upstream provider terms.
- Keep API key in Vercel server environment; rotate it if exposed.
- Redact prompts/responses from routine logs; store only minimized context snapshots when needed for audit.

## 9. Observability

Capture where available:
- Provider and actual model ID.
- Provider request ID.
- Prompt and schema version.
- Latency and token usage.
- HTTP status/error category and retry count.
- Validation success/failure.

Never log API keys, authorization headers, raw sensitive data, or full user context by default.

## 10. Acceptance criteria

- No AI request originates from browser code.
- No secret appears in client bundle or logs.
- Model can be changed via server environment without changing domain logic.
- At least one selected model passes the coach response contract tests.
- Invalid/malformed output cannot modify a plan.
- 429, timeout, unavailable model, and malformed output each produce a safe fallback state.
- The app never silently falls back to paid inference.

## 11. Official references

- OpenRouter developer platform: https://openrouter.ai/developers
- OpenRouter API documentation: https://openrouter.ai/docs
- Free model collection and limits: https://openrouter.ai/collections/free-models/
- OpenRouter pricing: https://openrouter.ai/pricing
