// v1.0.0 - Resume Parser Utility

const { extractText, extractStructuredSections } = require("./pdfExtractor");
const { PREDEFINED_SKILLS, SALESFORCE_CERTIFICATIONS, TECH_CERTIFICATIONS } = require("../data/skillsConfig");

/**
 * Parse a resume from PDF buffer
 * @param {Buffer} pdfBuffer - PDF file buffer
 * @param {string} fileName - Original file name
 * @param {Object} position - Position for context
 * @returns {Object} Parsed resume data
 */
async function parseResume(pdfBuffer, fileName, position = null) {
    try {
        console.log("Starting to parse resume:", fileName);

        const text = await extractText(pdfBuffer, fileName);

        if (!text || text.trim().length === 0) {
            console.warn("No text extracted from PDF:", fileName);
            return {
                success: false,
                error: "Could not extract text from PDF",
            };
        }

        console.log("Text extracted, parsing data...");

        const name = extractName(text, fileName);
        const email = extractEmail(text);
        const phone = extractPhone(text);
        const skills = extractSkills(text);
        const experience = extractExperience(text);
        const education = extractEducation(text);
        const currentCompany = extractCurrentCompany(text);
        const certifications = extractCertifications(text);
        const summary = generateResumeSummary(text, skills, experience, position);
        const workHistory = extractWorkHistory(text);
        const linkedInUrl = extractLinkedIn(text);

        const parsedData = {
            success: true,
            name,
            email: email || (name ? `${name.toLowerCase().replace(/\s+/g, ".")}@email.com` : null),
            phone: phone || "Not provided",
            linkedInUrl,
            experience: experience || calculateTotalExperience(workHistory) || "Not specified",
            education: education || "Not specified",
            currentCompany: currentCompany || "Not specified",
            skills,
            certifications: certifications.length > 0 ? certifications : [],
            summary,
            workHistory,
            resumeText: text,
        };

        console.log("Successfully parsed resume:", fileName, "Found", skills.length, "skills");
        return parsedData;
    } catch (error) {
        console.error("Error in parseResume for", fileName, ":", error);
        return {
            success: false,
            error: error.message,
        };
    }
}

/**
 * Extract email from text
 */
function extractEmail(text) {
    const emailPatterns = [
        /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
        /(?:email|e-mail):\s*([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,})/gi,
    ];

    for (const pattern of emailPatterns) {
        const matches = text.match(pattern);
        if (matches && matches.length > 0) {
            const email = matches[0].replace(/^(?:email|e-mail):\s*/gi, "");
            if (email && email.includes("@") && email.includes(".")) {
                return email.trim().toLowerCase();
            }
        }
    }

    return null;
}

/**
 * Extract phone number from text
 */
function extractPhone(text) {
    const phonePatterns = [
        /(?:phone|tel|mobile|cell):\s*([\+\d\s\-\(\)\.]+)/gi,
        /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g,
        /\+?\d{1,3}[\s-]?\d{3}[\s-]?\d{3}[\s-]?\d{4}/g,
    ];

    for (const pattern of phonePatterns) {
        const matches = text.match(pattern);
        if (matches && matches.length > 0) {
            const phone = matches[0].replace(/^(?:phone|tel|mobile|cell):\s*/gi, "").trim();
            if (phone.replace(/\D/g, "").length >= 10) {
                return phone;
            }
        }
    }

    return null;
}

/**
 * Extract candidate name from text
 */
function extractName(text, filename) {
    const lines = text.split("\n").map((line) => line.trim()).filter((line) => line.length > 0);

    for (let i = 0; i < Math.min(5, lines.length); i++) {
        const line = lines[i];

        // Skip header lines
        if (line.toLowerCase().includes("resume") || line.toLowerCase().includes("curriculum") || line.toLowerCase().includes("cv")) {
            continue;
        }

        // Skip lines with email or phone
        if (line.includes("@") || /\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/.test(line)) {
            continue;
        }

        // Look for name pattern
        if (line.length > 3 && line.length < 60) {
            const nameMatch = line.match(/^([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/);
            if (nameMatch) {
                return nameMatch[0];
            }

            // All caps name
            if (/^[A-Z\s]+$/.test(line) && line.split(/\s+/).length >= 2 && line.split(/\s+/).length <= 5) {
                return line.split(/\s+/).map((word) => word.charAt(0) + word.slice(1).toLowerCase()).join(" ");
            }
        }
    }

    // Fallback to filename - REMOVED to allow AI to find it from text if regex fails
    // or to handle fallback in controller
    return null;
}

/**
 * Extract skills from text
 */
function extractSkills(text) {
    const textLower = text.toLowerCase();
    const foundSkills = [];
    const skillVariations = new Map();

    PREDEFINED_SKILLS.forEach((skill) => {
        const skillLower = skill.toLowerCase();
        const variations = [
            skillLower,
            skillLower.replace(/\s+/g, ""),
            skillLower.replace(/\./g, ""),
            skillLower.replace(/\s+/g, "-"),
        ];

        for (const variation of variations) {
            const escapedVariation = variation.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            const regex = new RegExp(`\\b${escapedVariation}\\b`, "i");

            if (regex.test(textLower)) {
                if (!skillVariations.has(skill)) {
                    skillVariations.set(skill, true);
                    foundSkills.push(skill);
                }
                break;
            }
        }
    });

    return [...new Set(foundSkills)];
}

/**
 * Extract experience years from text
 */
function extractExperience(text) {
    const experiencePatterns = [
        /(\d+)\+?\s*years?\s+(?:of\s+)?(?:professional\s+)?experience/i,
        /experience:?\s*(\d+)\+?\s*years?/i,
        /(\d+)\+?\s*yrs?\s+(?:of\s+)?experience/i,
        /(?:over|more than)\s+(\d+)\s+years/i,
        /(\d+)\+\s*years/i,
    ];

    for (const pattern of experiencePatterns) {
        const match = text.match(pattern);
        if (match) {
            const years = parseInt(match[1]);
            if (years >= 0 && years <= 50) {
                return `${years} years`;
            }
        }
    }

    return null;
}

/**
 * Extract LinkedIn URL from text
 */
function extractLinkedIn(text) {
    const linkedInPattern = /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/[a-zA-Z0-9_-]+\/?/i;
    const match = text.match(linkedInPattern);
    return match ? match[0] : null;
}

function calculateDurationInYears(durationStr) {
    try {
        const parts = durationStr.split(/[-–]|to/);
        if (parts.length !== 2) return 0;

        const parseDate = (str) => {
            str = str.trim().toLowerCase();
            if (str.includes('present') || str.includes('current') || str.includes('now')) return new Date();
            const date = new Date(str);
            return isNaN(date.getTime()) ? null : date;
        };

        const start = parseDate(parts[0]);
        const end = parseDate(parts[1]);

        if (start && end) {
            const diffTime = Math.abs(end - start);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return diffDays / 365;
        }
    } catch (e) {
        return 0;
    }
    return 0;
}

/**
 * Extract education from text
 */
function extractEducation(text) {
    const educationPatterns = [
        /(?:Bachelor|BS|BA|B\.S\.|B\.A\.|B\.Tech|B\.E\.)\s+(?:of\s+)?(?:Science|Arts|Technology|Engineering)?\s+(?:in\s+)?([A-Za-z\s]+?)(?:\n|,|\.|\d)/i,
        /(?:Master|MS|MA|M\.S\.|M\.A\.|M\.Tech|M\.E\.)\s+(?:of\s+)?(?:Science|Arts|Technology|Engineering)?\s+(?:in\s+)?([A-Za-z\s]+?)(?:\n|,|\.|\d)/i,
        /(?:PhD|Ph\.D\.)\s+(?:in\s+)?([A-Za-z\s]+?)(?:\n|,|\.|\d)/i,
        /(?:Diploma)\s+(?:in\s+)?([A-Za-z\s]+?)(?:\n|,|\.|\d)/i,
        /MBA/i,
    ];

    for (const pattern of educationPatterns) {
        const match = text.match(pattern);
        if (match) {
            if (pattern.source.includes("MBA")) {
                return "MBA";
            }
            const degree = match[0].trim();
            return degree.length < 100 ? degree : degree.substring(0, 100);
        }
    }

    return null;
}

/**
 * Extract current company from text
 */
function extractCurrentCompany(text) {
    const lines = text.split("\n");
    const experienceKeywords = ["experience", "work history", "employment", "professional experience"];

    let inExperienceSection = false;
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim().toLowerCase();

        if (experienceKeywords.some((keyword) => line.includes(keyword))) {
            inExperienceSection = true;
            continue;
        }

        if (inExperienceSection && line.length > 3) {
            const presentPattern = /(?:20\d{2}|19\d{2})\s*[-–]\s*(?:present|current)/i;

            if (presentPattern.test(lines[i])) {
                for (let j = i - 1; j >= Math.max(0, i - 3); j--) {
                    const potentialCompany = lines[j].trim();
                    if (potentialCompany && potentialCompany.length < 60) {
                        return potentialCompany;
                    }
                }
            }
        }
    }

    return null;
}

/**
 * Extract certifications from text
 */
function extractCertifications(text) {
    const certifications = [];
    const textLower = text.toLowerCase();

    [...SALESFORCE_CERTIFICATIONS, ...TECH_CERTIFICATIONS].forEach((cert) => {
        const certLower = cert.toLowerCase();
        if (textLower.includes(certLower)) {
            certifications.push(cert);
        }
    });

    return certifications;
}

/**
 * Extract work history from text
 */
function extractWorkHistory(text) {
    const workHistory = [];
    const lines = text.split("\n").map((line) => line.trim());
    const experienceKeywords = ["experience", "work history", "employment", "professional experience"];

    let inExperienceSection = false;
    let currentJob = null;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const lineLower = line.toLowerCase();

        if (experienceKeywords.some((keyword) => lineLower.includes(keyword))) {
            inExperienceSection = true;
            continue;
        }

        if (inExperienceSection) {
            if (lineLower.match(/^(education|certification|skill|project)/)) {
                break;
            }

            const datePattern = /(?:20\d{2}|19\d{2})\s*[-–]\s*(?:present|current|20\d{2}|19\d{2})/i;

            if (datePattern.test(line)) {
                if (currentJob) {
                    workHistory.push(currentJob);
                }

                const duration = line.match(datePattern)[0];
                let role = "";
                let company = "";

                for (let j = i - 1; j >= Math.max(0, i - 3); j--) {
                    const prevLine = lines[j].trim();
                    if (prevLine && prevLine.length < 80) {
                        if (!role) {
                            role = prevLine;
                        } else if (!company) {
                            company = prevLine;
                            break;
                        }
                    }
                }

                currentJob = {
                    role: role || "Role not specified",
                    company: company || "Company not specified",
                    duration,
                    responsibilities: [],
                };
            } else if (currentJob && line.match(/^[•\-\*]/) && line.length > 20) {
                currentJob.responsibilities.push(line.replace(/^[•\-\*]\s*/, ""));
            }

            if (workHistory.length >= 3) break;
        }
    }

    if (currentJob && currentJob.responsibilities.length > 0) {
        workHistory.push(currentJob);
    }

    return workHistory.slice(0, 3);
}

/**
 * Generate resume summary
 */
function generateResumeSummary(text, skills, experience, position) {
    const experienceYears = experience ? parseInt(experience) : skills.length > 5 ? 5 : 3;
    const mainSkills = skills.slice(0, 3).join(", ");

    if (position?.title?.toLowerCase().includes("salesforce")) {
        if (position.title.toLowerCase().includes("developer")) {
            return `Experienced Salesforce Developer with ${experienceYears}+ years building custom solutions`;
        } else if (position.title.toLowerCase().includes("consultant")) {
            return `Salesforce Consultant with ${experienceYears}+ years implementing enterprise solutions`;
        }
    }

    return mainSkills
        ? `Professional with ${experienceYears}+ years of experience in ${mainSkills}`
        : `Professional with ${experienceYears}+ years of experience`;
}

module.exports = {
    parseResume,
    extractEmail,
    extractPhone,
    extractName,
    extractSkills,
    extractExperience,
    extractEducation,
    extractCertifications,
    calculateTotalExperience
};

function calculateTotalExperience(workHistory) {
    if (!workHistory || workHistory.length === 0) return null;

    let totalYears = 0;
    workHistory.forEach(job => {
        if (job.duration) {
            totalYears += calculateDurationInYears(job.duration);
        }
    });

    return totalYears > 0 ? `${totalYears.toFixed(1)} years` : null;
}
