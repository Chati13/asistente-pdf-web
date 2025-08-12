\"use client\";
import { useState } from "react";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [q, setQ] = useState("");
  const [answer, setAnswer] = useState("");
  const [hits, setHits] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const ingest = async () => {
    if (!file) return alert("Selecciona un PDF");
    setLoading(true);
    const fd = new FormData();
    fd.append("file", file);
    if (title) fd.append("title", title);
    const r = await fetch("/api/ingest", { method: "POST", body: fd });
    const j = await r.json();
    setLoading(false);
    alert(j.ok ? `Ingestado: ${j.chunks} fragmentos` : `Error: ${j.error}`);
  };

  const ask = async () => {
    if (!q) return;
    setLoading(true);
    const r = await fetch("/api/query", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ question: q }) });
    const j = await r.json();
    setLoading(false);
    setAnswer(j.answer || "");
    setHits(j.hits || []);
  };

  return (
    <main style={{ maxWidth: 800, margin: "40px auto", fontFamily: "system-ui, sans-serif" }}>
      <h1>Asistente IA con PDFs e Imágenes</h1>
      <p>1) Sube un PDF y pulsa Ingerir. 2) Escribe una pregunta y pulsa Consultar.</p>

      <section style={{ padding: 16, border: "1px solid #ddd", borderRadius: 8, marginBottom: 24 }}>
        <h2>1) Ingesta</h2>
        <input type="file" accept="application/pdf" onChange={e => setFile(e.target.files?.[0] || null)} />
        <div style={{ marginTop: 8 }}>
          <input placeholder="Título (opcional)" value={title} onChange={e => setTitle(e.target.value)} />
        </div>
        <button onClick={ingest} disabled={loading} style={{ marginTop: 8 }}>Ingerir</button>
      </section>

      <section style={{ padding: 16, border: "1px solid #ddd", borderRadius: 8 }}>
        <h2>2) Preguntar</h2>
        <input style={{ width: "100%" }} placeholder="Escribe tu pregunta" value={q} onChange={e => setQ(e.target.value)} />
        <button onClick={ask} disabled={loading} style={{ marginTop: 8 }}>Consultar</button>
        {answer && (
          <div style={{ whiteSpace: "pre-wrap", marginTop: 16 }}>
            <h3>Respuesta</h3>
            <p>{answer}</p>
          </div>
        )}
        {hits?.length ? (
          <div style={{ marginTop: 16 }}>
            <h3>Evidencias recuperadas</h3>
            <ul>
              {hits.map((h: any, i: number) => (
                <li key={i}>[{h.doc_title}{h.page ? `, pág ${h.page}` : ""}] {String(h.content).slice(0, 140)}…</li>
              ))}
            </ul>
          </div>
        ) : null}
      </section>

      {loading && <p>Procesando…</p>}
    </main>
  );
}
