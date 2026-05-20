import { NextResponse } from "next/server";
import { z } from "zod";
import { isAdminRequest } from "@/lib/admin";
import { embedText } from "@/lib/embeddings";
import { errorResponse } from "@/lib/errors";
import { generateAnswer } from "@/lib/generation";
import { selectModel } from "@/lib/models";
import { retrieveChunks, toCitationPayload } from "@/lib/rag";
import { getSupabaseAdmin } from "@/lib/supabase";
import { getSupabaseServer } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const maxDuration = 60;

const chatSchema = z.object({
  question: z.string().min(1).max(1200),
  sport: z.string().min(2).max(32).default("nba").transform((value) => value.toLowerCase()),
  modelId: z.string().min(1).max(120).optional(),
  session_id: z.string().uuid().optional(),
});

export async function POST(request: Request) {
  const startedAt = Date.now();

  try {
    const serverClient = await getSupabaseServer();
    const { data: { user } } = await serverClient.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const input = chatSchema.parse(await request.json());
    const supabase = getSupabaseAdmin();

    // Rate limit: 30 requests per user per hour (DB-based, no extra infra needed)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { count } = await supabase
      .from("queries")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .gte("created_at", oneHourAgo);

    if ((count ?? 0) >= 30) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Maximum 30 questions per hour." },
        { status: 429 },
      );
    }
    const admin = isAdminRequest(request);
    const model = await selectModel(supabase, input.modelId, admin);
    const { embedding } = await embedText(input.question);
    const chunks = await retrieveChunks(supabase, embedding, input.sport);
    const citations = chunks.map(toCitationPayload);
    const generated = await generateAnswer(input.question, chunks, model);
    const latencyMs = Date.now() - startedAt;

    if (input.session_id) {
      // Verify the session belongs to this user before mutating
      const { data: existingSession } = await supabase
        .from("chat_sessions")
        .select("user_id")
        .eq("id", input.session_id)
        .maybeSingle();

      if (existingSession && existingSession.user_id !== user.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }

      await supabase.from("chat_sessions").upsert({
        id: input.session_id,
        user_id: user.id,
        sport: input.sport,
        title: input.question.slice(0, 120),
        updated_at: new Date().toISOString(),
      }, { onConflict: "id" });
    }

    const { data: query, error: queryError } = await supabase
      .from("queries")
      .insert({
        user_id: user.id,
        sport: input.sport,
        session_id: input.session_id ?? null,
        question: input.question,
        answer: generated.answer,
        latency_ms: latencyMs,
        model_id: model.id,
        provider: model.provider,
        input_tokens: generated.usage.inputTokens,
        output_tokens: generated.usage.outputTokens,
        total_tokens: generated.usage.totalTokens,
        ...generated.costFields,
        retrieved_chunks: citations,
      })
      .select("id")
      .single();

    if (queryError) throw queryError;

    if (citations.length > 0) {
      const { error: citationError } = await supabase.from("citations").insert(
        citations.map((citation) => ({
          query_id: query.id,
          document_id: citation.documentId,
          chunk_id: citation.chunkId,
          page_number: citation.pageNumber,
          snippet: citation.snippet,
          score: citation.score,
        })),
      );

      if (citationError) throw citationError;
    }

    return NextResponse.json({
      queryId: query.id,
      answer: generated.answer,
      citations,
      model: {
        modelId: model.id,
        provider: model.provider,
      },
      usage: generated.usage,
      latencyMs,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid chat request", details: error.flatten() }, { status: 400 });
    }

    return errorResponse(error);
  }
}
