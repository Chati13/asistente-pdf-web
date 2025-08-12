export function chunkText(text: string, max = 1200): string[] {
  const lines = text.split(/\r?\n/);
  const out: string[] = [];
  let cur: string[] = [];
  for (const line of lines) {
    const candidate = [...cur, line].join("\n");
    if (candidate.length > max) {
      if (cur.length) out.push(cur.join("\n"));
      cur = [line];
    } else {
      cur.push(line);
    }
  }
  if (cur.length) out.push(cur.join("\n"));
  return out.filter(s => s.trim().length > 0);
}
