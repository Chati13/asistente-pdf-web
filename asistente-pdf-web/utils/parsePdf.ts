import pdfParse from "pdf-parse";

/**
 * Extrae el texto de un PDF recibido como bytes.
 * NO lee archivos del disco; solo procesa el buffer que le pasamos.
 */
export async function extractTextFromPDF(bytes: Uint8Array): Promise<{
  text: string;
  pageHints: { page?: number }[];
}> {
  const buffer = Buffer.from(bytes);
  const result = await pdfParse(buffer);

  // 'result.text' devuelve el texto plano de todo el PDF
  const text = result.text || "";

  // Si más adelante quieres detectar páginas, hay que hacer parsing extra.
  // Por ahora devolvemos una lista vacía (o podrías dividir por '\f' si lo necesitas).
  return { text, pageHints: [] };
}
