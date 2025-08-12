import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { openai, CHAT_MODEL, EMBEDDINGS_MODEL } from "@/lib/openai";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { question } = await req.json();
    if (!question) return NextResponse.json({ error: "Falta la pregunta" }, { status: 400 });

    const e = await openai.embeddings.create({ model: EMBEDDINGS_MODEL, input: question });
    const qvec = e.data[0].embedding as number[];

    const { data, error } = await supabaseAdmin.rpc("match_chunks", {
      query_embedding: qvec,
      match_count: 8,
      similarity_threshold: 0.75,
    });
    if (error) throw error;

    const hits = (data || []) as Array<{ doc_title: string; page: number | null; content: string; metadata: any; }>;
    const contextBlocks = hits.map((h) => {
      const pag = h.page ? `, pág ${h.page}` : "";
      return `[${h.doc_title}${pag}]\n${h.content}`;
    });

    const messages: any[] = [
      { role: "system", content: "Responde SOLO con información encontrada en el contexto. Cita siempre [Título, pág X]. Si no hay evidencia, di: 'No se encuentra evidencia en los documentos'." },
      { role: "user", content: `Pregunta: ${question}\n\nContexto:\n${contextBlocks.join("\n\n---\n\n")}` },
    ];

    const chat = await openai.chat.completions.create({ model: CHAT_MODEL, messages, temperature: 0.2 });
    const answer = chat.choices[0]?.message?.content || "(sin respuesta)";

    return NextResponse.json({ answer, hits });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: String(err.message || err) }, { status: 500 });
  }
}
