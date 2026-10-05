const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
  id: { type: String, required: true },
  questionText: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['technical', 'behavioral', 'coding', 'system-design', 'general'],
    default: 'technical'
  },
  starterCode: { type: String, default: '' },
  expectedKeywords: [{ type: String }],
  hints: [{ type: String }],
  userAnswer: { type: String, default: '' },
  userCode: { type: String, default: '' },
  feedback: {
    score: { type: Number, min: 0, max: 10, default: 0 },
    critique: { type: String, default: '' },
    strengths: [{ type: String }],
    improvements: [{ type: String }],
    idealAnswer: { type: String, default: '' }
  },
  followUp: {
    questionText: { type: String, default: '' },
    userAnswer: { type: String, default: '' }
  }
});

const InterviewSchema = new mongoose.Schema(
  {
    role: { type: String, required: true },
    level: { 
      type: String, 
      enum: ['Junior', 'Mid-Level', 'Senior', 'Lead'], 
      default: 'Mid-Level' 
    },
    type: { 
      type: String, 
      enum: ['Technical', 'Behavioral', 'System Design', 'Mixed'], 
      default: 'Technical' 
    },
    techStack: [{ type: String }],
    jobDescription: { type: String, default: '' },
    currentQuestionIndex: { type: Number, default: 0 },
    questions: [QuestionSchema],
    overallFeedback: {
      overallScore: { type: Number, default: 0 },
      technicalScore: { type: Number, default: 0 },
      communicationScore: { type: Number, default: 0 },
      problemSolvingScore: { type: Number, default: 0 },
      confidenceScore: { type: Number, default: 0 },
      summary: { type: String, default: '' },
      keyStrengths: [{ type: String }],
      areasForImprovement: [{ type: String }],
      actionableRoadmap: [{ type: String }],
      hiringVerdict: { type: String, default: 'Pending Evaluation' }
    },
    status: { 
      type: String, 
      enum: ['pending', 'in-progress', 'completed'], 
      default: 'in-progress' 
    },
    durationMinutes: { type: Number, default: 0 }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Interview', InterviewSchema);
