const http = require('http');

async function runTests() {
  console.log('Testing Mock AI & Storage Service directly...');

  const MockAiService = require('./src/services/mockAiService');
  const StorageService = require('./src/services/storageService');

  // 1. Test question generation
  console.log('1. Generating questions...');
  const questions = await MockAiService.generateQuestions({
    role: 'Full Stack Developer',
    level: 'Senior',
    type: 'Technical',
    techStack: ['React', 'Node.js', 'MongoDB'],
    count: 2
  });

  if (!questions || questions.length !== 2) {
    throw new Error('Question generation failed');
  }
  console.log(`✅ Generated ${questions.length} questions successfully.`);

  // 2. Test interview creation in storage
  console.log('2. Creating interview record...');
  const created = await StorageService.createInterview({
    role: 'Full Stack Developer',
    level: 'Senior',
    type: 'Technical',
    techStack: ['React', 'Node.js', 'MongoDB'],
    questions,
    status: 'in-progress'
  });

  if (!created || !created._id) {
    throw new Error('Interview storage creation failed');
  }
  console.log(`✅ Created interview ID: ${created._id}`);

  // 3. Test follow-up generation
  console.log('3. Testing follow-up generation...');
  const followUp = await MockAiService.generateFollowUp({
    questionText: questions[0].questionText,
    userAnswer: 'I use JWT tokens stored in httpOnly cookies and implement refresh token rotation in Redis.',
    userCode: ''
  });
  if (!followUp || !followUp.followUpText) {
    throw new Error('Follow-up generation failed');
  }
  console.log(`✅ Generated follow-up: "${followUp.followUpText.substring(0, 60)}..."`);

  // 4. Test holistic evaluation
  console.log('4. Testing holistic evaluation & scoring...');
  questions[0].userAnswer = 'I use JWT tokens stored in httpOnly cookies with refresh token rotation.';
  questions[1].userAnswer = 'I implement LRU cache using a Map and a doubly linked list to achieve O(1) operations.';
  
  const evaluation = await MockAiService.evaluateInterview({
    role: 'Full Stack Developer',
    level: 'Senior',
    questions
  });

  if (!evaluation || !evaluation.overallFeedback || !evaluation.overallFeedback.overallScore) {
    throw new Error('Evaluation failed');
  }
  console.log(`✅ Evaluation generated with overall score: ${evaluation.overallFeedback.overallScore}/100, Verdict: ${evaluation.overallFeedback.hiringVerdict}`);

  // 5. Update interview with evaluation
  const completed = await StorageService.updateInterview(created._id, {
    questions: evaluation.evaluatedQuestions,
    overallFeedback: evaluation.overallFeedback,
    status: 'completed',
    durationMinutes: 12
  });

  if (!completed || completed.status !== 'completed') {
    throw new Error('Status update failed');
  }
  console.log('✅ Interview record updated to completed status.');

  // 6. Fetch all interviews
  const all = await StorageService.getAllInterviews();
  console.log(`✅ Storage query returned ${all.length} interview sessions.`);

  console.log('\n🎉 ALL SYSTEM VERIFICATION TESTS PASSED SUCCESSFULLY!');
}

runTests().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
