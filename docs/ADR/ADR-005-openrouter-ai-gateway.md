# ADR-005: OpenRouter as Primary AI Gateway

- Status: Accepted
- Decision: OpenRouter is the primary and only production AI gateway for the MVP. Gemini Direct is not part of the production integration baseline.

## Context
The project prioritizes a free-first deployment and wants the flexibility to evaluate multiple model providers without coupling product/domain logic to one vendor.

## Decision
- Use OpenRouter's OpenAI-compatible API at `https://openrouter.ai/api/v1`.
- Keep the API key and model selection in server-only environment variables.
- Prioritize model variants currently offered at $0, while recognizing free model limits and availability can change.
- Pin a tested model ID for stable behavior; optionally configure a tested fallback. The `openrouter/free` dynamic router may be evaluated, but must not be assumed to meet the product's output/latency contract until tested.
- Use a provider adapter and normalized internal response type.
- Validate model output with Zod and deterministic training/business rules.
- Keep AI non-authoritative: no direct DB writes, no autonomous plan changes, user approval required.

## Alternatives considered
- Gemini Direct: simpler single-provider integration, but less model/provider flexibility. Not selected for the current baseline.
- 9Router: useful for local experimentation and self-hosted routing, but not required in free-cloud production.
- Multiple direct provider SDKs: rejected for MVP due to additional integration and maintenance overhead.

## Consequences
- Model switching is easier and domain logic remains provider-agnostic.
- Free model variants (`:free`) enforce rate limits (20 RPM and 50 RPD without $10+ purchased credits, or 1,000 RPD with $10+ lifetime credits; subject to change), variable latency, queueing, and inconsistent structured-output support.
- OpenRouter defaults to zero prompt storage when logging/training opt-ins are off, while upstream provider ZDR/retention policies must be filtered/verified before sending personal running/recovery data.
- The app needs rate-limit handling, request budgets, context-fingerprint caching, timeouts (`20s` default to fit serverless budgets), fallbacks, and a deterministic non-AI fallback.
