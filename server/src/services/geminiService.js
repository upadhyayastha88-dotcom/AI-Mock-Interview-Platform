const { GoogleGenerativeAI } = require('@google/generative-ai');
const MockAiService = require('./mockAiService');

function cleanJsonResponse(text) {
  let cleaned = text.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/, '').replace(/```\s*$/, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/, '').replace(/```\s*$/, '');
  }
  return cleaned.trim();
}

const GeminiService = {
  getGenAI(apiKey) {
    const key = apiKey || process.env.GEMINI_API_KEY;
    if (!key) return null;
    return new GoogleGenerativeAI(key);
  },

  async generateQuestions({ role, level, type, techStack = [], jobDescription = '', count = 3, apiKey }) {
    const genAI = this.getGenAI(apiKey);
    if (!genAI) {
      console.log('No Gemini API key found. Using mock questions.');
      return MockAiService.generateQuestions({ role, level, type, techStack, count });
    }

    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const prompt = `You are an expert technical hiring manager conducting an interview for a ${level} ${role}.
Interview Type: ${type}
Key Tech Stack / Skills: ${techStack.join(', ') || 'General Engineering'}
${jobDescription ? `Job Description / Context: ${jobDescription}` : ''}

Generate ${count} realistic, high-caliber interview questions. 
Include a mix of conceptual depth, practical problem-solving / coding (provide a starterCode snippet if applicable, otherwise empty string), and behavioral / architectural scenarios.

Return ONLY a valid JSON array of question objects without markdown formatting or commentary:
[
  {
    "id": "q_1",
    "questionText": "The question to ask the candidate",
    "category": "technical | coding | behavioral | system-design",
    "starterCode": "optional starter code or empty string",
    "expectedKeywords": ["keyword1", "keyword2"],
    "hints": ["Helpful hint 1"]
  }
]`;

      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const cleaned = cleanJsonResponse(text);
      const parsed = JSON.parse(cleaned);

      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((q, idx) => ({
          ...q,
          id: q.id || `q_${Date.now()}_${idx + 1}`
        }));
      }
      return MockAiService.generateQuestions({ role, level, type, techStack, count });
    } catch (err) {
      console.error('Gemini question generation error:', err.message);
      return MockAiService.generateQuestions({ role, level, type, techStack, count });
    }
  },

  async generateFollowUp({ questionText, userAnswer, userCode, apiKey }) {
    const genAI = this.getGenAI(apiKey);
    if (!genAI) {
      return MockAiService.generateFollowUp({ questionText, userAnswer, userCode });
    }

    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const prompt = `You are an interviewer listening to a candidate's answer.
Question Asked: "${questionText}"
Candidate's Spoken/Written Answer: "${userAnswer || 'No verbal answer'}"
Candidate's Code Submission (if any): "${userCode || 'None'}"

Evaluate the candidate's answer concisely and provide an intelligent follow-up probing question that challenges their knowledge or asks about trade-offs/edge cases.

Return ONLY a valid JSON object:
{
  "followUpText": "Your follow-up question here",
  "quickEvaluation": "Brief, encouraging critique of what they said"
}`;

      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const cleaned = cleanJsonResponse(text);
      return JSON.parse(cleaned);
    } catch (err) {
      console.error('Gemini follow-up generation error:', err.message);
      return MockAiService.generateFollowUp({ questionText, userAnswer, userCode });
    }
  },

  async evaluateInterview({ role, level, type, questions, apiKey }) {
    const genAI = this.getGenAI(apiKey);
    if (!genAI) {
      return MockAiService.evaluateInterview({ role, level, questions });
    }

    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const prompt = `You are a Principal Engineering Lead conducting a post-interview evaluation report for a ${level} ${role}.
Interview Type: ${type}

Candidate's Questions & Answers:
${JSON.stringify(
  questions.map((q) => ({
    id: q.id,
    questionText: q.questionText,
    category: q.category,
    userAnswer: q.userAnswer || 'Not answered',
    userCode: q.userCode || 'None',
    followUp: q.followUp
  })),
  null,
  2
)}

Perform a thorough, objective evaluation.
Output ONLY a valid JSON object matching this schema:
{
  "evaluatedQuestions": [
    {
      "id": "question id",
      "feedback": {
        "score": 8, // integer 0 to 10
        "critique": "Specific feedback on their response and code",
        "strengths": ["strength 1", "strength 2"],
        "improvements": ["improvement 1"],
        "idealAnswer": "Comprehensive model answer showing how a top candidate would answer"
      }
    }
  ],
  "overallFeedback": {
    "overallScore": 82, // integer 0 to 100
    "technicalScore": 85, // integer 0 to 100
    "communicationScore": 80, // integer 0 to 100
    "problemSolvingScore": 83, // integer 0 to 100
    "confidenceScore": 80, // integer 0 to 100
    "hiringVerdict": "Strong Hire | Hire | Leaning Hire | Needs Preparation",
    "summary": "2-3 paragraphs evaluating the candidate performance comprehensively",
    "keyStrengths": ["bullet 1", "bullet 2", "bullet 3"],
    "areasForImprovement": ["bullet 1", "bullet 2", "bullet 3"],
    "actionableRoadmap": ["Concrete next step 1", "Concrete next step 2", "Concrete next step 3"]
  }
}`;

      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const cleaned = cleanJsonResponse(text);
      const parsed = JSON.parse(cleaned);

      // Merge back into questions
      const mergedQuestions = questions.map((q) => {
        const found = parsed.evaluatedQuestions?.find((eq) => eq.id === q.id);
        return {
          ...q,
          feedback: found?.feedback || {
            score: 7,
            critique: 'Answer provided covered the fundamental requirements.',
            strengths: ['Addressed the prompt directly'],
            improvements: ['Provide more concrete details and metrics'],
            idealAnswer: 'Detailed architectural and technical explanation.'
          }
        };
      });

      return {
        evaluatedQuestions: mergedQuestions,
        overallFeedback: parsed.overallFeedback
      };
    } catch (err) {
      console.error('Gemini holistic evaluation error:', err.message);
      return MockAiService.evaluateInterview({ role, level, questions });
    }
  }
};

module.exports = GeminiService;
