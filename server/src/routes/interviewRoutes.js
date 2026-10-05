const express = require('express');
const router = express.Router();
const InterviewController = require('../controllers/interviewController');

// Start / Generate new interview
router.post('/generate', InterviewController.createInterview);

// Submit an answer for a question and get follow-up
router.post('/:id/submit-answer', InterviewController.submitAnswer);

// Submit answer to the follow-up question
router.post('/:id/submit-followup', InterviewController.submitFollowUpAnswer);

// Finish interview and get complete evaluation & scorecard
router.post('/:id/complete', InterviewController.completeInterview);

// Get list of all previous interviews
router.get('/', InterviewController.getAllInterviews);

// Get a specific interview details & report
router.get('/:id', InterviewController.getInterviewById);

// Delete an interview
router.delete('/:id', InterviewController.deleteInterview);

module.exports = router;
