/** Server-only Deep Research proxy (dev/Vite transport adapter).
 * Prompts, depth scaling and validation live in `deepResearchShared.ts` so
 * this stays in lockstep with `supabase/functions/deep-research/core.ts`. */
import {
  errorMessage,
  researchInstructions,
  depthScale,
  validateResearchPayload,
  type ResearchPayload,
} from "./deepResearchShared";

const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/responses";
const RESEARCH_MODEL = "openai/gpt-5.5";

export async function streamDeepResearch(
  payload: ResearchPayload,
  request?: Request,
): Promise<Response> {
  const apiKey = process.env.LOVABLE_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: "Deep Research is not configured: missing LOVABLE_API_KEY.", missingEnv: "LOVABLE_API_KEY" },
      { status: 500 },
    );
  }

  const validated = validateResearchPayload(payload);
  if (validated.ok !== true) {
    return Response.json({ error: validated.error }, { status: validated.status });
  }
  const { query, context, depth } = validated.value;

  const scale = depthScale(depth);

  const priorRunId = request?.headers.get("X-Lovable-AIG-Run-ID");
  const input = context
    ? `${query}\n\nConversation context for disambiguation only:\n${context}`
    : query;

  const upstream = await fetch(GATEWAY_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Lovable-API-Key": apiKey,
      "X-Lovable-AIG-SDK": "fetch",
      ...(priorRunId ? { "X-Lovable-AIG-Run-ID": priorRunId } : {}),
    },
    body: JSON.stringify({
      model: RESEARCH_MODEL,
      stream: true,
      instructions: researchInstructions(query, depth),
      input,
      tools: [{ type: "web_search_preview" }],
      reasoning: { effort: scale.effort, summary: "auto" },
      include: ["reasoning.encrypted_content"],
      store: false,
      max_output_tokens: scale.maxOutputTokens,
    }),
    signal: request?.signal,
  });

  if (!upstream.ok || !upstream.body) {
    const data = await upstream.json().catch(() => null);
    const message = errorMessage(data, `Deep Research failed (${upstream.status}).`);
    return Response.json(
      { error: message, retryable: upstream.status === 429 || upstream.status >= 500 },
      {
        status: upstream.status,
        headers: upstream.headers.get("Retry-After")
          ? { "Retry-After": String(upstream.headers.get("Retry-After")) }
          : undefined,
      },
    );
  }

  const runId = upstream.headers.get("X-Lovable-AIG-Run-ID") ?? priorRunId;
  return new Response(upstream.body, {
    status: 200,
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      "X-Accel-Buffering": "no",
      ...(runId ? { "X-Lovable-AIG-Run-ID": runId } : {}),
    },
  });
}
