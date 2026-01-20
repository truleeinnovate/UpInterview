// v1.1.0 - PDF/DOCX Text Extraction Utility
// Using pdf2json for PDF parsing (Node.js 22 compatible)

const PDFParser = require("pdf2json");

/**
 * Extract text from a PDF buffer using pdf2json
 * @param {Buffer} pdfBuffer - PDF file buffer
 * @returns {Promise<string>} Extracted text
 */
async function extractTextFromPDF(pdfBuffer) {
    return new Promise((resolve, reject) => {
        try {
            console.log("Extracting text from PDF, buffer size:", pdfBuffer.length, "bytes");

            const pdfParser = new PDFParser();

            pdfParser.on("pdfParser_dataError", (errData) => {
                console.error("PDF parsing error:", errData.parserError);
                reject(new Error(`PDF extraction failed: ${errData.parserError}`));
            });

            pdfParser.on("pdfParser_dataReady", (pdfData) => {
                try {
                    // Extract text from all pages
                    let fullText = "";

                    if (pdfData && pdfData.Pages) {
                        pdfData.Pages.forEach((page) => {
                            if (page.Texts) {
                                page.Texts.forEach((text) => {
                                    if (text.R) {
                                        text.R.forEach((r) => {
                                            if (r.T) {
                                                try {
                                                    // Try to decode URI encoded text
                                                    fullText += decodeURIComponent(r.T) + " ";
                                                } catch (e) {
                                                    // If decoding fails, use the text as-is
                                                    fullText += r.T + " ";
                                                }
                                            }
                                        });
                                    }
                                });
                                fullText += "\n";
                            }
                        });
                    }

                    fullText = cleanExtractedText(fullText);
                    console.log("Extracted text length:", fullText.length, "characters");
                    resolve(fullText);
                } catch (parseError) {
                    console.error("Error processing PDF data:", parseError);
                    reject(new Error(`PDF processing failed: ${parseError.message}`));
                }
            });

            // Parse the buffer
            pdfParser.parseBuffer(pdfBuffer);
        } catch (error) {
            console.error("Error initializing PDF parser:", error);
            reject(new Error(`PDF extraction failed: ${error.message}`));
        }
    });
}

/**
 * Extract text from a DOCX buffer using mammoth
 * @param {Buffer} docxBuffer - DOCX file buffer
 * @returns {Promise<string>} Extracted text
 */
async function extractTextFromDOCX(docxBuffer) {
    try {
        console.log("Extracting text from DOCX, buffer size:", docxBuffer.length, "bytes");

        const mammoth = require("mammoth");
        const result = await mammoth.extractRawText({ buffer: docxBuffer });
        let fullText = result.value || "";

        fullText = cleanExtractedText(fullText);
        console.log("Extracted text length:", fullText.length, "characters");
        return fullText;
    } catch (error) {
        console.error("Error extracting text from DOCX:", error);
        throw new Error(`DOCX extraction failed: ${error.message}`);
    }
}

/**
 * Extract text from a file buffer (auto-detect type)
 * @param {Buffer} buffer - File buffer
 * @param {string} fileName - Original file name
 * @returns {Promise<string>} Extracted text
 */
async function extractText(buffer, fileName) {
    const ext = fileName.toLowerCase().split('.').pop();

    console.log(`Extracting text from file: ${fileName} (type: ${ext})`);

    if (ext === 'pdf') {
        return await extractTextFromPDF(buffer);
    } else if (ext === 'docx' || ext === 'doc') {
        return await extractTextFromDOCX(buffer);
    } else {
        throw new Error(`Unsupported file type: ${ext}. Supported: PDF, DOCX, DOC`);
    }
}

/**
 * Clean and normalize extracted text
 */
function cleanExtractedText(text) {
    if (!text) return "";

    // Normalize whitespace
    text = text.replace(/\s+/g, " ");
    // Fix common OCR issues
    text = text.replace(/ \n/g, "\n");
    text = text.replace(/\n /g, "\n");
    // Remove excessive line breaks
    text = text.replace(/\n{3,}/g, "\n\n");
    // Fix hyphenated words
    text = text.replace(/([a-z])-\s+([a-z])/gi, "$1$2");
    // Trim
    text = text.trim();

    return text;
}

/**
 * Extract structured sections from text
 */
function extractStructuredSections(text) {
    const sections = {
        contact: "",
        summary: "",
        experience: "",
        education: "",
        skills: "",
        certifications: "",
        projects: "",
    };

    const sectionPatterns = {
        summary: /(?:summary|profile|objective|about\s+me)[:\s]*([\s\S]*?)(?=\n(?:experience|education|skills|work|employment|projects|certifications)|$)/i,
        experience: /(?:experience|work\s+history|employment|professional\s+experience)[:\s]*([\s\S]*?)(?=\n(?:education|skills|projects|certifications)|$)/i,
        education: /(?:education|academic|qualifications)[:\s]*([\s\S]*?)(?=\n(?:skills|experience|projects|certifications|work)|$)/i,
        skills: /(?:skills|technical\s+skills|technologies|competencies)[:\s]*([\s\S]*?)(?=\n(?:experience|education|projects|certifications)|$)/i,
        certifications: /(?:certifications?|licenses?|credentials?)[:\s]*([\s\S]*?)(?=\n(?:experience|education|skills|projects)|$)/i,
        projects: /(?:projects?|portfolio)[:\s]*([\s\S]*?)(?=\n(?:experience|education|skills|certifications)|$)/i,
    };

    for (const [section, pattern] of Object.entries(sectionPatterns)) {
        const match = text.match(pattern);
        if (match && match[1]) {
            sections[section] = match[1].trim();
        }
    }

    // Extract contact info from first few lines
    const lines = text.split("\n").slice(0, 10);
    sections.contact = lines.join("\n");

    return sections;
}

module.exports = {
    extractTextFromPDF,
    extractTextFromDOCX,
    extractText,
    cleanExtractedText,
    extractStructuredSections,
};
