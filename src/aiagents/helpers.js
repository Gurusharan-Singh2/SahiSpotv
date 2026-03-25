import PDFParser from "pdf2json";
import mammoth from "mammoth";

export async function extractResumeText(file) {
  if (!file) return "";

  // ========================
  // 📄 PDF FILE
  // ========================
  if (file.mimetype === "application/pdf") {
    return await extractPdfText(file.buffer);
  }

  // ========================
  // 📄 DOCX / DOC FILE
  // ========================
  if (
    file.mimetype ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    file.mimetype === "application/msword"
  ) {
    const result = await mammoth.extractRawText({
      buffer: file.buffer,
    });
    return result.value || "";
  }

  return "";
}

// ========================
// 🔥 PDF2JSON TEXT EXTRACTOR
// ========================
function extractPdfText(buffer) {
  return new Promise((resolve, reject) => {
    const pdfParser = new PDFParser();

    pdfParser.on("pdfParser_dataError", (errData) => {
      reject(errData.parserError);
    });

    pdfParser.on("pdfParser_dataReady", (pdfData) => {
      try {
        let text = "";

        pdfData.Pages.forEach((page) => {
          page.Texts.forEach((textItem) => {
            textItem.R.forEach((r) => {
              try {
                text += decodeURIComponent(r.T) + " ";
              } catch (e) {
                text += r.T + " ";
              }
            });
          });
          text += "\n";
        });

        resolve(text.trim());
      } catch (err) {
        reject(err);
      }
    });

    pdfParser.parseBuffer(buffer);
  });
}

// ========================
// 🔥 UTIL FUNCTIONS
// ========================

export function cleanJsonResponse(text) {
  if (!text) return "";
  return text
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();
}

export const isEmptyAnswer = (ans) =>
  typeof ans !== "string" || ans.trim().length === 0;

export const scaleScore = (s) => {
  const score = Number(s);
  if (!score || score <= 1) return 0;
  if (score >= 5) return 10;
  return Math.round(((score - 1) / 4) * 10);
};
