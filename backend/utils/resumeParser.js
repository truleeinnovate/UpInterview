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
        const phoneObj = extractPhone(text);
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
            name: name || null,
            email: email || (name ? `${name.toLowerCase().replace(/\s+/g, ".")}@email.com` : null),
            phone: phoneObj?.full || "Not provided",
            countryCode: phoneObj?.countryCode || null,
            phoneNumber: phoneObj?.number || null,
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
        /(?:phone|tel|mobile|cell|contact):\s*([+\d\s\-\(\)\.]+)/gi,
        /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g,
        /\+?\d{1,3}[\s-]?\d{3}[\s-]?\d{3}[\s-]?\d{4}/g,
    ];

    for (const pattern of phonePatterns) {
        const matches = [...text.matchAll(pattern)];
        if (matches.length > 0) {
            // Take the first valid-looking phone match
            let fullPhone = matches[0][0]
                .replace(/^(?:phone|tel|mobile|cell|contact):\s*/gi, "")
                .trim()
                .replace(/[^\d+]/g, '');  // remove all non-digits except +

            if (fullPhone.length < 10) continue;

            let countryCode = '';
            let number = fullPhone;

            // Priority 1: Indian numbers (very common in your data)
            if (fullPhone.startsWith('+91') || fullPhone.startsWith('91')) {
                countryCode = '+91';
                number = fullPhone.replace(/^\+?91/, '');
            }
            // Priority 2: Starts with + followed by 1-3 digits
            else if (fullPhone.startsWith('+')) {
                // Try known short codes first (+1, +44, +91, etc.)
                const shortCcPatterns = [/^\+91/, /^\+1/, /^\+44/, /^\+971/, /^\+20/, /^\+60/];
                for (const ccPat of shortCcPatterns) {
                    if (ccPat.test(fullPhone)) {
                        countryCode = fullPhone.match(ccPat)[0];
                        number = fullPhone.slice(countryCode.length);
                        break;
                    }
                }

                // If no short match, take 1-3 digits but only if remaining >=7 digits
                if (!countryCode) {
                    const ccMatch = fullPhone.match(/^\+(\d{1,3})(?=\d{7,})/);
                    if (ccMatch) {
                        countryCode = '+' + ccMatch[1];
                        number = fullPhone.slice(countryCode.length);
                    }
                }
            }

            // Clean number: remove leading zeros
            number = number.replace(/^0+/, '');

            // Final validation
            if (number.length >= 7 && number.length <= 15) {
                return {
                    full: (countryCode + number).replace(/^(\+)?/, ''), // clean full without extra +
                    countryCode: countryCode || '+91',                 // default India
                    number: number
                };
            }
        }
    }

    return null;
}
/**
 * Extract candidate name from text - balanced for fresher + professional resumes
 */
function extractName(text, filename) {
    if (!text) return null;

    const lines = text.split("\n")
        .map(line => line.trim())
        .filter(line => line.length > 0);

    if (lines.length === 0) return null;

    console.log("First few raw lines for name extraction:");
    lines.slice(0, 4).forEach((l, i) => console.log(`  Line ${i + 1}: "${l}"`));

    const header = lines[0];

    // ───────────────────────────────────────────────
    // Strategy 1: Aggressive cut for fresher-style resumes
    // (name followed by Contact:/E-MAIL ID:/Objective:/DOB etc.)
    // ───────────────────────────────────────────────
    const fresherCutPatterns = [
        /Contact:/i,
        /E-?MAIL\s*ID?:/i,
        /Email:/i,
        /Phone:/i,
        /Mobile:/i,
        /Career\s+Objective/i,
        /Objective:/i,
        /Personal\s+Details/i,
        /Date\s+of\s+Birth/i,
        /DOB/i
    ];

    let namePart = header;
    let usedStrategy = null;

    for (const pattern of fresherCutPatterns) {
        const match = header.match(pattern);
        if (match && match.index > 5) {  // make sure there's something before the marker
            namePart = header.substring(0, match.index).trim();
            usedStrategy = `Fresher cut at "${match[0]}"`;
            console.log(`${usedStrategy} → "${namePart}"`);
            break;
        }
    }

    // ───────────────────────────────────────────────
    // Strategy 2: Conservative split for professional resumes
    // (name + title + Email: | Phone: | Location:)
    // ───────────────────────────────────────────────
    if (!usedStrategy) {
        const proSeparators = [/Email:/i, /E-mail:/i, /\|/, /Phone:/i, /Location:/i];

        for (const sep of proSeparators) {
            if (sep.test(header)) {
                const parts = header.split(sep);
                namePart = parts[0].trim();
                usedStrategy = `Professional split at "${sep}"`;
                console.log(`${usedStrategy} → "${namePart}"`);
                break;
            }
        }
    }

    // ───────────────────────────────────────────────
    // Clean title / trailing junk from both strategies
    // ───────────────────────────────────────────────
    const titleCleanup = [
        /\s+(Senior|Lead|Principal|Full\s*Stack|Software|Frontend|Backend|MERN|MERN\s+Stack|MEAN|Developer|Engineer|Architect|Manager|Consultant|Intern|Jr\.?|Sr\.?|with\s+\d+\+?\s*(years?|yrs?)).*$/i,
        /\s+Developer\s+with.*$/i
    ];

    for (const pattern of titleCleanup) {
        namePart = namePart.replace(pattern, '').trim();
    }

    // Final clean
    namePart = namePart
        .replace(/\s+/g, ' ')
        .replace(/,$/, '')
        .trim();

    // ───────────────────────────────────────────────
    // Validate - accept if looks like real name
    // ───────────────────────────────────────────────
    const words = namePart.split(/\s+/);
    if (
        namePart.length >= 6 &&
        namePart.length <= 45 &&
        /[A-Z]/.test(namePart) &&
        !/\d{3,}/.test(namePart) &&
        !namePart.includes('@') &&
        !namePart.includes('http') &&
        words.length >= 2 &&
        words.length <= 5
    ) {
        // Proper title case
        namePart = namePart
            .toLowerCase()
            .split(' ')
            .map(w => w.charAt(0).toUpperCase() + w.slice(1))
            .join(' ');

        console.log(`Accepted name (${usedStrategy || 'fallback'}): "${namePart}"`);
        return namePart;
    }

    console.log("No good name candidate after cleaning - will fallback to filename");
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
    const patterns = [
        // Direct mentions
        /(\d{1,2})\+?\s*(?:\+)?\s*(years?|yrs?|year|yr)\s*(?:of\s+)?(?:experience|exp|professional\s+experience)/i,
        /experience\s*(?:of\s*)?(\d{1,2})\+?\s*(years?|yrs?|year|yr)/i,
        /(\d{1,2})\+?\s*(years?|yrs?|year|yr)\s*(?:\+)?\s*experience/i,
        /(?:over|more than|approximately|around|about)\s+(\d{1,2})\s*(years?|yrs?|year|yr)/i,
        /(\d{1,2})\s*(?:to|-)\s*(\d{1,2})\s*(years?|yrs?|year|yr)/i, // range like 5-8 years

        // In sentence form
        /with\s+(\d{1,2})\+?\s*(years?|yrs?|year|yr)\s*(?:of\s+)?experience/i,
        /having\s+(\d{1,2})\+?\s*(years?|yrs?|year|yr)\s*(?:of\s+)?experience/i,
        /(\d{1,2})\+?\s*years?\s+in\s+(?:development|it|software|industry)/i,

        // From work history lines (common in fresher resumes)
        /\((\d{4})\s*[-–—]\s*(?:present|current|now|\d{4})\)/gi,
    ];

    // First try keyword-based patterns
    for (const pattern of patterns) {
        const match = text.match(pattern);
        if (match) {
            if (match.length >= 3 && match[1] && match[2]) {
                // Range like 2018 - 2023 → ~5 years
                const start = parseInt(match[1]);
                const end = match[2].toLowerCase().includes('present') ? new Date().getFullYear() : parseInt(match[2]);
                if (end > start) return `${end - start} years`;
            } else if (match[1]) {
                const years = parseInt(match[1]);
                if (years >= 0 && years <= 40) {
                    return `${years} years`;
                }
            }
        }
    }

    // Fallback: count years from date ranges in work history
    const dateRangePattern = /(\d{4})\s*[-–—]\s*(\d{4}|present|current|now)/gi;
    const matches = [...text.matchAll(dateRangePattern)];
    if (matches.length > 0) {
        let total = 0;
        matches.forEach(m => {
            const startYear = parseInt(m[1]);
            let endYear = m[2].toLowerCase().includes('present') || m[2].toLowerCase().includes('current') || m[2].toLowerCase().includes('now')
                ? new Date().getFullYear()
                : parseInt(m[2]);
            if (endYear > startYear) total += (endYear - startYear);
        });
        if (total > 0) return `${total} years`;
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
    const patterns = [
        // Standard degrees
        /(b\.?tech|b\.?e|bachelor\s*(?:of\s*)?(?:technology|engineering|science|computer\s*science|it))/i,
        /(m\.?tech|m\.?e|master\s*(?:of\s*)?(?:technology|engineering|science|computer\s*science))/i,
        /b\.?sc|bachelor\s*of\s*science/i,
        /m\.?sc|master\s*of\s*science/i,
        /b\.?a|bachelor\s*of\s*arts/i,
        /m\.?a|master\s*of\s*arts/i,
        /b\.?com|bachelor\s*of\s*commerce/i,
        /mba|master\s*(?:of\s*)?business\s*administration/i,
        /ph\.?d|doctorate/i,
        /diploma/i,

        // Indian common formats
        /b\.?tech\s*\(?(?:cse|it|ece|eee|mech|civil)\)?/i,
        /bachelor\s*of\s*technology\s*\(?(?:computer\s*science|information\s*technology)\)?/i,
        /pursuing\s*b\.?tech/i,
        /\d{4}\s*[-–]\s*\d{4}\s*(?:b\.?tech|m\.?tech|b\.?e|m\.?e)/i,
    ];

    for (const pattern of patterns) {
        const match = text.match(pattern);
        if (match) {
            let degree = match[0].trim();
            // Clean up
            degree = degree.replace(/\s*\([^)]*\)/g, '').trim(); // remove (cse) etc.
            return degree.length < 100 ? degree : degree.substring(0, 100);
        }
    }

    // Fallback: look for any line with "b.tech", "mca", "degree" etc.
    const fallbackLines = text.split('\n').filter(line => 
        /b\.?tech|b\.?e|m\.?tech|mca|mba|degree|bachelor|master/i.test(line.toLowerCase())
    );
    if (fallbackLines.length > 0) {
        return fallbackLines[0].trim().substring(0, 100);
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
            const years = calculateDurationInYears(job.duration);
            if (years > 0) totalYears += years;
        }
    });

    return totalYears > 0 ? `${Math.round(totalYears)} years` : null;
}