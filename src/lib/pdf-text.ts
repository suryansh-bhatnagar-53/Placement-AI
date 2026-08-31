// Browser-side PDF text extraction. Loaded lazily so pdfjs never runs during SSR.
export async function extractPdfText(file: File): Promise<string> {
  const pdfjs = await import("pdfjs-dist");
  const worker = await import("pdfjs-dist/build/pdf.worker.mjs?url");
  pdfjs.GlobalWorkerOptions.workerSrc = worker.default;

  const buffer = await file.arrayBuffer();
  const doc = await pdfjs.getDocument({ data: buffer }).promise;
  let text = "";
  for (let page = 1; page <= doc.numPages; page++) {
    const content = await (await doc.getPage(page)).getTextContent();
    const items = content.items as Array<{ str?: string; hasEOL?: boolean }>;
    for (const item of items) {
      text += item.str ?? "";
      text += item.hasEOL ? "\n" : " ";
    }
    text += "\n";
  }
  return text;
}
