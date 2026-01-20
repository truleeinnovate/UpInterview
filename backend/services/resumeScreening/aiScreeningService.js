// v1.0.0 - AI Resume Screening Service using Anthropic Claude API

const Anthropic = require("@anthropic-ai/sdk");

const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
});

/**
 * Screen a resume using AI (Anthropic Claude)
 * @param {Object} resumeData - Parsed resume data
 * @param {Object} positionRequirements - Position requirements
 * @returns {Object} AI screening result
 */
async function screenResumeWithAI(resumeData, positionRequirements) {
    try {
        const prompt = buildScreeningPrompt(resumeData, positionRequirements);

        const response = await anthropic.messages.create({
            model: "claude-3-5-sonnet-20241022",
            max_tokens: 2000,
            messages: [
                {
                    role: "user",
                    content: prompt,
                },
            ],
        });

        const aiResponse = response.content[0].text;
        const analysis = parseAIResponse(aiResponse);

        return {
            success: true,
            data: {
                score: analysis.score,
                skillMatch: analysis.skillMatch,
                analysis: analysis.summary,
                strengths: analysis.strengths || [],
                concerns: analysis.concerns || [],
                matchedSkills: analysis.matchedSkills || [],
                missingSkills: analysis.missingSkills || [],
                experienceMatch: analysis.experienceMatch,
                recommendation: analysis.recommendation,
            },
        };
    } catch (error) {
        console.error("AI screening error:", error);
        return {
            success: false,
            error: error.message,
        };
    }
}

/**
 * Build the screening prompt for Claude
 */
function buildScreeningPrompt(resumeData, positionRequirements) {
    return `You are an expert HR recruiter and technical hiring manager. Analyze this resume against the job requirements and provide a detailed assessment.

## RESUME DATA:
- Name: ${resumeData.name || "Not provided"}
- Email: ${resumeData.email || "Not provided"}
- Phone: ${resumeData.phone || "Not provided"}
- Skills: ${resumeData.skills
            ? resumeData.skills.join(", ")
            : "Not extracted"
        }
- Experience: ${resumeData.experience || "Not specified"}
- Education: ${resumeData.education || "Not specified"}
- Resume Text: ${resumeData.resumeText || "Not available"}

## POSITION REQUIREMENTS:
- Title: ${positionRequirements.title || "Not specified"}
- Required Skills: ${positionRequirements.targetSkills
            ? positionRequirements.targetSkills
                .map((s) => `${s.skill || s.name} (${s.requirement_level || s.requirementLevel || "Required"})`)
                .join(", ")
            : "Not specified"
        }
- Description: ${positionRequirements.description || "Not provided"}
- Experience Required: ${positionRequirements.experienceRequired || positionRequirements.minexperience || "Not specified"}

## INSTRUCTIONS:
Analyze the resume and provide your assessment in the following JSON format. Be objective and thorough.

\`\`\`json
{
  "score": <number 0-100>,
  "skillMatch": "<High|Medium|Low>",
  "summary": "<2-3 sentence summary of the candidate>",
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "concerns": ["<concern 1>", "<concern 2>"],
  "matchedSkills": ["<skill 1>", "<skill 2>"],
  "missingSkills": ["<missing required skill 1>", "<missing required skill 2>"],
  "experienceMatch": "<Exceeds|Meets|Below> requirements",
  "recommendation": "<Highly Recommended|Recommended|Consider for Review|Not Recommended>"
}
\`\`\`

Provide ONLY the JSON response, no additional text.`;
}

/**
 * Parse the AI response and extract structured data
 */
function parseAIResponse(responseText) {
    try {
        // Extract JSON from response
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            return {
                score: Math.min(100, Math.max(0, parsed.score || 0)),
                skillMatch: parsed.skillMatch || "Low",
                summary: parsed.summary || "",
                strengths: parsed.strengths || [],
                concerns: parsed.concerns || [],
                matchedSkills: parsed.matchedSkills || [],
                missingSkills: parsed.missingSkills || [],
                experienceMatch: parsed.experienceMatch || "Unknown",
                recommendation: parsed.recommendation || "Consider for Review",
            };
        }

        // Fallback if JSON parsing fails
        return {
            score: 50,
            skillMatch: "Medium",
            summary: "Unable to fully analyze resume",
            strengths: [],
            concerns: ["AI analysis incomplete"],
            matchedSkills: [],
            missingSkills: [],
            experienceMatch: "Unknown",
            recommendation: "Consider for Review",
        };
    } catch (error) {
        console.error("Error parsing AI response:", error);
        return {
            score: 50,
            skillMatch: "Medium",
            summary: "Error parsing AI analysis",
            strengths: [],
            concerns: ["AI analysis error"],
            matchedSkills: [],
            missingSkills: [],
            experienceMatch: "Unknown",
            recommendation: "Consider for Review",
        };
    }
}

/**
 * Validate the AI analysis response
 */
function validateAIAnalysisResponse(response) {
    if (!response || typeof response !== "object") {
        return false;
    }

    const hasRequiredFields =
        typeof response.score === "number" &&
        typeof response.skillMatch === "string" &&
        typeof response.summary === "string";

    return hasRequiredFields;
}

module.exports = {
    screenResumeWithAI,
    validateAIAnalysisResponse,
};
