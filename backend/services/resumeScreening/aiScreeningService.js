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
            model: "claude-opus-4-20250514",
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
                languages: analysis.languages || [],
                certifications: analysis.certifications || [],
                projects: analysis.projects || [],
                workHistory: analysis.workHistory || [],
                extractedProfile: analysis.extractedProfile || {}
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
    // Get skills from position (could be in skills or targetSkills)
    const positionSkills = positionRequirements.skills || positionRequirements.targetSkills || [];
    const skillsList = positionSkills
        .map((s) => `${s.skill || s.name || s} (${s.requirement_level || s.requirementLevel || "REQUIRED"})`)
        .join(", ");

    return `You are an expert HR recruiter and technical hiring manager. Analyze this resume against the job requirements and provide a detailed assessment.

## RESUME DATA:
- Name: ${resumeData.name || "Not provided"}
- Email: ${resumeData.email || "Not provided"}
- Phone: ${resumeData.phone || "Not provided"}
- Skills Found in Resume: ${resumeData.skills
            ? resumeData.skills.join(", ")
            : "Not extracted"
        }
- Experience: ${resumeData.experience || "Not specified"}
- Education: ${resumeData.education || "Not specified"}
- Full Resume Text: ${resumeData.rawText || resumeData.resumeText || "Not available"}

NOTE: The 'Name', 'Email', and 'Phone' fields above are extracted via regex and may be incomplete or incorrect (e.g., 'Name' might missing). ALWAYS verify these against the 'Full Resume Text' and extract the most accurate details into the 'extractedProfile' section. Look for the candidate's name at the very top of the text.

## POSITION REQUIREMENTS:
- Title: ${positionRequirements.title || "Not specified"}
- Required Skills: ${skillsList || "Not specified"}
- Job Description: ${positionRequirements.jobDescription || positionRequirements.description || "Not provided"}
- Experience Required: ${positionRequirements.minexperience ? `${positionRequirements.minexperience} years` : "Not specified"}

## INSTRUCTIONS:
Analyze the resume and provide your assessment in the following JSON format. Be objective and thorough.

\`\`\`json
{
  "score": <number 0-100, overall match percentage>,
  "skillMatch": <number 0-100, percentage of required skills matched>,
  "experienceMatch": <number 0-100, how well experience matches requirements>,
  "summary": "<2-3 sentence summary of the candidate>",
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "concerns": ["<concern 1>", "<concern 2>"],
  "matchedSkills": ["<skill 1>", "<skill 2>"],
  "missingSkills": ["<missing required skill 1>", "<missing required skill 2>"],
  "recommendation": "<PROCEED|HOLD|REJECT>",
  "languages": ["<language 1>", "<language 2>"],
  "certifications": ["<certification 1>", "<certification 2>"],
  "projects": [
    { "title": "<Project Title>", "desc": "<Brief description>" }
  ],
  "workHistory": [
    { 
      "role": "<Job Title>", 
      "company": "<Company Name>", 
      "duration": "<Dates>", 
      "responsibilities": ["<Key responsibility 1>", "<Key responsibility 2>"] 
    }
  ],
  "extractedProfile": {
      "name": "<Candidate Name>",
      "email": "<Candidate Email>",
      "phone": "<Candidate Phone>",
      "education": "<Highest Degree - University>",
      "experienceYears": <number, total years>,
      "currentRole": "<Current Role>",
      "currentLocation": "<City, State>",
      "linkedIn": "<LinkedIn URL>"
  }
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
                skillMatch: Math.min(100, Math.max(0, parsed.skillMatch || 0)),
                experienceMatch: Math.min(100, Math.max(0, parsed.experienceMatch || 0)),
                summary: parsed.summary || "",
                strengths: parsed.strengths || [],
                concerns: parsed.concerns || [],
                matchedSkills: parsed.matchedSkills || [],
                missingSkills: parsed.missingSkills || [],
                recommendation: parsed.recommendation || "HOLD",
                languages: parsed.languages || [],
                certifications: parsed.certifications || [],
                projects: parsed.projects || [],
                workHistory: parsed.workHistory || [],
                extractedProfile: parsed.extractedProfile || {}
            };
        }

        // Fallback if JSON parsing fails
        return {
            score: 50,
            skillMatch: 50,
            experienceMatch: 50,
            summary: "Unable to fully analyze resume",
            strengths: [],
            concerns: ["AI analysis incomplete"],
            matchedSkills: [],
            missingSkills: [],
            recommendation: "HOLD",
        };
    } catch (error) {
        console.error("Error parsing AI response:", error);
        return {
            score: 50,
            skillMatch: 50,
            experienceMatch: 50,
            summary: "Error parsing AI analysis",
            strengths: [],
            concerns: ["AI analysis error"],
            matchedSkills: [],
            missingSkills: [],
            recommendation: "HOLD",
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