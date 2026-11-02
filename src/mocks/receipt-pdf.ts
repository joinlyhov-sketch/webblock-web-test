// MOCK ONLY: builds a small one-page PDF receipt. Spring returns the real receipt file instead.

export type ReceiptLine = { label: string; value: string };

/** PDF text is Latin-1 inside (...): escape the special characters and drop anything outside it. */
function pdfText(text: string): string {
  return text
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^\x20-\x7e]/g, "?")
    .replace(/([\\()])/g, "\\$1");
}

export function buildReceiptPdf(title: string, lines: ReceiptLine[], footer: string): Uint8Array {
  const content: string[] = [];
  const text = (font: "F1" | "F2", size: number, x: number, y: number, value: string) =>
    content.push(`BT /${font} ${size} Tf ${x} ${y} Td (${pdfText(value)}) Tj ET`);

  text("F2", 22, 56, 770, "WebBlock");
  text("F1", 11, 56, 750, title);
  content.push("0.9 0.91 0.92 RG 56 735 m 539 735 l S");

  let y = 705;
  for (const line of lines) {
    text("F1", 10, 56, y, line.label);
    text("F2", 11, 220, y, line.value);
    y -= 26;
  }
  content.push(`0.9 0.91 0.92 RG 56 ${y + 12} m 539 ${y + 12} l S`);
  text("F1", 9, 56, y - 12, footer);

  const stream = content.join("\n");
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 6 0 R /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>",
    `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`,
  ];

  let pdf = "%PDF-1.4\n";
  const offsets: number[] = [];
  objects.forEach((body, i) => {
    offsets.push(pdf.length);
    pdf += `${i + 1} 0 obj\n${body}\nendobj\n`;
  });
  const xref = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (const offset of offsets) pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;

  return Uint8Array.from(pdf, (c) => c.charCodeAt(0) & 0xff);
}
