export interface ExtractedQuestion {
  id: string;
  text: string;
}

/**
 * Returns the question number if the line starts a new top-level question,
 * or null if it does not.
 *
 * Recognised formats (RTL-aware):
 *   "1."  "2."  "1)"  "2)"          – standard
 *   ".1." ".2."                      – RTL leading-dot variant common in Hebrew docs
 *   "שאלה 1"  "Question 1"  "Q1"
 *
 * NOT treated as question starts: single Hebrew letters (א. ב. ג.)
 * because those are almost always sub-questions within an existing question.
 */
function getQuestionNumber(line: string): number | null {
  const t = line.trim();

  // RTL leading dot: ".1." / ".12." or just ".1" ".12"
  const rtlMatch = t.match(/^\.(\d+)[.)]/);
  if (rtlMatch) return parseInt(rtlMatch[1], 10);

  // Standard: "1." / "1)" at start
  const stdMatch = t.match(/^(\d+)[.)]/);
  if (stdMatch) return parseInt(stdMatch[1], 10);

  // Keyword-based
  if (/^(?:שאלה|שאלות?)\s*\d/i.test(t)) return -1;
  if (/^(?:Question|Q\.?)\s*\d/i.test(t)) return -1;

  return null;
}

/**
 * Extracts questions from document text.
 *
 * Strategy:
 * 1. Walk lines and detect top-level question boundaries by number.
 *    A new question is detected only when the number increments
 *    (e.g. 1 → 2 → 3 …), so stray numbers inside answer choices are ignored.
 * 2. Short blank lines (≤ 2 consecutive empty lines) inside a question do NOT
 *    end it – they are kept as part of the question text.
 * 3. If no numbered questions are found, fall back to paragraph splitting.
 */
export function extractQuestions(text: string): ExtractedQuestion[] {
  if (!text || typeof text !== "string") return [];

  const normalized = text
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .trim();

  if (!normalized) return [];

  const lines = normalized.split("\n");
  const questions: ExtractedQuestion[] = [];
  let currentLines: string[] = [];
  let currentNum = 0;
  let questionIndex = 0;
  let blankBuffer: string[] = []; // accumulate blank lines between non-blank content

  const flushQuestion = () => {
    // drop trailing blank lines
    while (currentLines.length > 0 && !currentLines[currentLines.length - 1].trim()) {
      currentLines.pop();
    }
    const t = currentLines.join("\n").trim();
    if (t.length > 3) {
      questionIndex += 1;
      questions.push({ id: `q${questionIndex}`, text: t });
    }
    currentLines = [];
    blankBuffer = [];
  };

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed) {
      // Buffer blank lines – don't flush the question yet
      blankBuffer.push(line);
      continue;
    }

    const num = getQuestionNumber(trimmed);
    const isNewTopLevel =
      num !== null &&
      (currentNum === 0 || num === currentNum + 1 || num > currentNum + 1);

    if (isNewTopLevel) {
      if (currentLines.length > 0) {
        flushQuestion();
      }
      blankBuffer = [];
      currentNum = num === -1 ? currentNum + 1 : num;
      currentLines.push(line);
    } else {
      // Flush any buffered blank lines into the current question, then add this line
      if (blankBuffer.length > 0 && currentLines.length > 0) {
        currentLines.push(...blankBuffer);
      }
      blankBuffer = [];
      currentLines.push(line);
    }
  }

  if (currentLines.length > 0) {
    flushQuestion();
  }

  // Fallback: if no structured questions found, split by paragraph
  if (questions.length === 0 && normalized.length > 20) {
    const blocks = normalized
      .split(/\n\s*\n/)
      .filter((b) => b.trim().length > 5);
    blocks.forEach((block, i) => {
      questions.push({ id: `q${i + 1}`, text: block.trim() });
    });
  }

  return questions;
}
