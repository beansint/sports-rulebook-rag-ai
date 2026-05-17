import pdfParse from "pdf-parse";
import { normalizeWhitespace } from "./text";

type PdfTextItem = {
  str?: string;
};

type PdfTextContent = {
  items?: PdfTextItem[];
};

type PdfPage = {
  getTextContent?: () => Promise<PdfTextContent>;
};

export type ExtractedPage = {
  pageNumber: number;
  text: string;
};

export async function extractPdfPages(buffer: Buffer): Promise<ExtractedPage[]> {
  const pages: string[] = [];

  const result = await pdfParse(buffer, {
    pagerender: async (pageData: unknown) => {
      const page = pageData as PdfPage;
      const textContent = await page.getTextContent?.();
      const text = normalizeWhitespace(
        textContent?.items?.map((item) => item.str || "").join(" ") || "",
      );
      pages.push(text);
      return text;
    },
  });

  const extracted = pages
    .map((text, index) => ({ pageNumber: index + 1, text }))
    .filter((page) => page.text.length > 0);

  if (extracted.length > 0) {
    return extracted;
  }

  const fallback = normalizeWhitespace(result.text || "");
  return fallback ? [{ pageNumber: 1, text: fallback }] : [];
}
