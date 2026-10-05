const StorageService = require('../services/storageService');
const GeminiService = require('../services/geminiService');

const InterviewController = {
  async createInterview(req, res) {
    try {
      const {
        role = 'Full Stack Developer',
        level = 'Mid-Level',
        type = 'Technical',
        techStack = ['React', 'Node.js', 'MongoDB'],
        jobDescription = '',
        count = 3,
        apiKey
      } = req.body;

      console.log(`Generating interview for Role: ${role}, Level: ${level}, Type: ${type}`);

      const generatedQuestions = await GeminiService.generateQuestions({
        role,
        level,
        type,
        techStack,
        jobDescription,
        count: Math.min(Math.max(parseInt(count) || 3, 1), 6),
        apiKey
      });

      const interviewData = {
        role,
        level,
        type,
        techStack,
        jobDescription,
        currentQuestionIndex: 0,
        questions: generatedQuestions,
        status: 'in-progress',
        durationMinutes: 0
      };

      const savedInterview = await StorageService.createInterview(interviewData);

      return res.status(201).json({
        success: true,
        message: 'Interview session initialized successfully',
        interview: savedInterview
      });
    } catch (err) {
      console.error('Error creating interview:', err);
      return res.status(500).json({
        success: false,
        error: 'Failed to initialize interview',
        details: err.message
      });
    }
  },

  async submitAnswer(req, res) {
    try {
      const { id } = req.params;
      const { questionIndex = 0, userAnswer = '', userCode = '', apiKey } = req.body;

      const interview = await StorageService.getInterviewById(id);
      if (!interview) {
        return res.status(404).json({ success: false, error: 'Interview not found' });
      }

      const questions = [...interview.questions];
      const targetQuestion = questions[questionIndex];

      if (!targetQuestion) {
        return res.status(400).json({ success: false, error: 'Invalid question index' });
      }

      targetQuestion.userAnswer = userAnswer;
      targetQuestion.userCode = userCode;

      // Generate dynamic follow up
      const followUpResult = await GeminiService.generateFollowUp({
        questionText: targetQuestion.questionText,
        userAnswer,
        userCode,
        apiKey
      });

      targetQuestion.followUp = {
        questionText: followUpResult.followUpText,
        userAnswer: ''
      };

      const updated = await StorageService.updateInterview(id, {
        questions,
        currentQuestionIndex: questionIndex
      });

      return res.json({
        success: true,
        followUp: followUpResult,
        question: targetQuestion,
        interview: updated
      });
    } catch (err) {
      console.error('Error submitting answer:', err);
      return res.status(500).json({
        success: false,
        error: 'Failed to submit answer',
        details: err.message
      });
    }
  },

  async submitFollowUpAnswer(req, res) {
    try {
      const { id } = req.params;
      const { questionIndex = 0, followUpAnswer = '' } = req.body;

      const interview = await StorageService.getInterviewById(id);
      if (!interview) {
        return res.status(404).json({ success: false, error: 'Interview not found' });
      }

      const questions = [...interview.questions];
      if (questions[questionIndex]?.followUp) {
        questions[questionIndex].followUp.userAnswer = followUpAnswer;
      }

      const updated = await StorageService.updateInterview(id, { questions });

      return res.json({
        success: true,
        interview: updated
      });
    } catch (err) {
      console.error('Error submitting follow-up answer:', err);
      return res.status(500).json({
        success: false,
        error: 'Failed to record follow-up answer'
      });
    }
  },

  async completeInterview(req, res) {
    try {
      const { id } = req.params;
      const { durationMinutes = 15, apiKey } = req.body;

      const interview = await StorageService.getInterviewById(id);
      if (!interview) {
        return res.status(404).json({ success: false, error: 'Interview not found' });
      }

      console.log(`Evaluating interview ${id}...`);

      const evaluation = await GeminiService.evaluateInterview({
        role: interview.role,
        level: interview.level,
        type: interview.type,
        questions: interview.questions,
        apiKey
      });

      const updated = await StorageService.updateInterview(id, {
        questions: evaluation.evaluatedQuestions,
        overallFeedback: evaluation.overallFeedback,
        status: 'completed',
        durationMinutes: parseInt(durationMinutes) || 15
      });

      return res.json({
        success: true,
        message: 'Interview evaluation completed successfully',
        interview: updated
      });
    } catch (err) {
      console.error('Error completing interview:', err);
      return res.status(500).json({
        success: false,
        error: 'Failed to complete interview evaluation',
        details: err.message
      });
    }
  },

  async getAllInterviews(req, res) {
    try {
      const list = await StorageService.getAllInterviews();
      return res.json({ success: true, count: list.length, interviews: list });
    } catch (err) {
      console.error('Error fetching interviews:', err);
      return res.status(500).json({ success: false, error: 'Failed to fetch interviews' });
    }
  },

  async getInterviewById(req, res) {
    try {
      const { id } = req.params;
      const interview = await StorageService.getInterviewById(id);
      if (!interview) {
        return res.status(404).json({ success: false, error: 'Interview not found' });
      }
      return res.json({ success: true, interview });
    } catch (err) {
      console.error('Error fetching interview by ID:', err);
      return res.status(500).json({ success: false, error: 'Failed to retrieve interview' });
    }
  },

  async deleteInterview(req, res) {
    try {
      const { id } = req.params;
      await StorageService.deleteInterview(id);
      return res.json({ success: true, message: 'Interview deleted successfully' });
    } catch (err) {
      console.error('Error deleting interview:', err);
      return res.status(500).json({ success: false, error: 'Failed to delete interview' });
    }
  }
};

module.exports = InterviewController;
