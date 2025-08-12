import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "../../../lib/supabaseAdmin";
import { openai, EMBEDDINGS_MODEL } from "../../../lib/openai";
import { chunkText } from "../../../utils/chunk";
import { extractTextFromPDF } from "../../../utils/parsePdf";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get("file") as File | null;
    const title = (form.get("title") as string) || (file?.name ?? "Documento");
    if (!file) return NextResponse.json({ error: "Falta el PDF" }, { status: 400 });

    const arrayBuffer = await file.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    const path = `${crypto.randomUUID()}-${file.name}`;

    const { error: upErr } = await supabaseAdmin.storage
      .from(process.env.SUPABASE_DOCS_BUCKET || "docs")
      .upload(path, bytes, { contentType: "application/pdf" });
    if (upErr) throw upErr;

    const { data: docInserted, error: docErr } = await supabaseAdmin
      .from("documents")
      .insert({ title, file_path: path })
      .select("id")
      .single();
    if (docErr) throw docErr;

    const text = await extractTextFromPDF(Buffer.from(bytes));
    const chunks = chunkText(text, 1200);
    const embeddings: number[][] = [];
    for (let i = 0; i < chunks.length; i += 50) {
      const batch = chunks.slice(i, i + 50);
      const e = await openai.embeddings.create({ model: EMBEDDINGS_MODEL, input: batch });
      embeddings.push(...e.data.map(d => d.embedding));
    }

    const rows = chunks.map((content, i) => ({
      document_id: docInserted.id,
      doc_title: title,
      page: null,
      content,
      metadata: { source: path },
      embedding: embeddings[i],
    }));

    for (let i = 0; i < rows.length; i += 200) {
      const slice = rows.slice(i, i + 200);
      const { error } = await supabaseAdmin.from("chunks").insert(slice as any);
      if (error) throw error;
    }

    return NextResponse.json({ ok: true, document_id: docInserted.id, chunks: rows.length });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: String(err.message || err) }, { status: 500 });
  }
}
