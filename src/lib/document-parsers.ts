import path from "path";
import { extractQuestions } from "./extract-questions";

export interface ParseResult {
  text: string;
  questions: ReturnType<typeof extractQuestions>;
}

export async function parseDocument(filePath: string): Promise<ParseResult> {
  const ext = path.extname(filePath).toLowerCase();

  let text: string;

  if (ext === ".pdf") {
    text = await parsePdf(filePath);
  } else if (ext === ".docx") {
    text = await parseWord(filePath);
  } else if (ext === ".doc") {
    text = await parseDoc(filePath);
  } else {
    throw new Error(`Unsupported file format: ${ext}. Use .pdf, .doc or .docx`);
  }

  const questions = extractQuestions(text);

  return { text, questions };
}

async function parsePdf(filePath: string): Promise<string> {
  const { PDFParse } = await import("pdf-parse");
  const fs = await import("fs/promises");
  const buffer = await fs.readFile(filePath);
  const parser = new PDFParse({ data: buffer });
  const textResult = await parser.getText();
  await parser.destroy();
  return textResult?.text || "";
}

async function parseWord(filePath: string): Promise<string> {
  const mammoth = await import("mammoth");
  const fs = await import("fs/promises");
  const buffer = await fs.readFile(filePath);
  const result = await mammoth.extractRawText({ buffer });
  return result.value || "";
}

async function parseDoc(filePath: string): Promise<string> {
  const WordExtractor = (await import("word-extractor")).default;
  const extractor = new WordExtractor();
  const doc = await extractor.extract(filePath);
  return doc.getBody() || "";
}
