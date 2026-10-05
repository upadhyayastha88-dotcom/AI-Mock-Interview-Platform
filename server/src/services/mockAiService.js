// High quality mock AI service for simulated responses when API key is not present

const mockQuestionsBank = {
  Frontend: [
    {
      category: 'technical',
      questionText: 'Explain the difference between React Server Components (RSC) and Client Components. When would you choose one over the other?',
      expectedKeywords: ['hydration', 'bundle size', 'server-side', 'interactivity', 'hooks'],
      hints: ['Think about where data fetching happens and what gets sent to the browser.'],
      starterCode: ''
    },
    {
      category: 'coding',
      questionText: 'Write a custom debounce hook or function in JavaScript/TypeScript that delays executing a callback until after a specified wait time.',
      expectedKeywords: ['setTimeout', 'clearTimeout', 'useEffect', 'closure'],
      hints: ['Remember to clear the previous timer whenever a new call occurs.'],
      starterCode: `function debounce(func, delay) {
  let timeoutId;
  // TODO: implement debounce wrapper
  return function(...args) {
    // your implementation here
  };
}`
    },
    {
      category: 'technical',
      questionText: 'How does the browser rendering pipeline work from receiving an HTML file to painting pixels on screen, and how do you optimize Critical Rendering Path?',
      expectedKeywords: ['DOM', 'CSSOM', 'Render Tree', 'Layout', 'Paint', 'reflow', 'async', 'defer'],
      hints: ['Consider HTML parsing, stylesheet blocking, and reflow/repaint triggers.'],
      starterCode: ''
    },
    {
      category: 'behavioral',
      questionText: 'Describe a situation where a critical UI bug was pushed to production. How did you diagnose, communicate, and resolve it under pressure?',
      expectedKeywords: ['STAR', 'rollback', 'hotfix', 'root cause analysis', 'postmortem'],
      hints: ['Structure your response using the STAR method: Situation, Task, Action, Result.'],
      starterCode: ''
    }
  ],
  Backend: [
    {
      category: 'technical',
      questionText: 'How would you design an idempotent payment processing endpoint in an Express/Node.js microservice architecture?',
      expectedKeywords: ['idempotency key', 'distributed lock', 'Redis', 'transactions', 'retry mechanism'],
      hints: ['What happens if the client experiences a network timeout and retries the request?'],
      starterCode: ''
    },
    {
      category: 'coding',
      questionText: 'Implement a token bucket or sliding window rate-limiter middleware algorithm in Node.js/JavaScript.',
      expectedKeywords: ['timestamp', 'bucket capacity', 'refill rate', 'sliding window'],
      hints: ['Track request counts per IP or token within a rolling time window.'],
      starterCode: `function rateLimiter(limit, windowMs) {
  const requests = new Map();
  return (req, res, next) => {
    // TODO: implement window rate check
  };
}`
    },
    {
      category: 'system-design',
      questionText: 'How do you handle database scaling when write operations drastically exceed read operations in a high-throughput event logging platform?',
      expectedKeywords: ['sharding', 'read replicas', 'message queue', 'Kafka', 'write-behind cache', 'partitioning'],
      hints: ['Look into asynchronous buffering through message queues and partitioning strategies.'],
      starterCode: ''
    },
    {
      category: 'behavioral',
      questionText: 'Tell me about a time you had a technical disagreement with another engineer on API design or database schema. How did you reach a resolution?',
      expectedKeywords: ['STAR', 'trade-offs', 'benchmarks', 'collaboration', 'consensus'],
      hints: ['Highlight how you weighed technical trade-offs objectively.'],
      starterCode: ''
    }
  ],
  'Full Stack': [
    {
      category: 'technical',
      questionText: 'Walk me through how you implement secure JWT-based authentication with refresh token rotation and CSRF protection in a MERN application.',
      expectedKeywords: ['httpOnly cookie', 'access token', 'refresh token rotation', 'revocation list', 'CSRF token'],
      hints: ['Where should the access token and refresh token be safely stored on the client?'],
      starterCode: ''
    },
    {
      category: 'coding',
      questionText: 'Implement an in-memory LRU (Least Recently Used) cache with get(key) and put(key, value) in O(1) time complexity.',
      expectedKeywords: ['hash map', 'doubly linked list', 'O(1)', 'eviction'],
      hints: ['A combination of a Map/Hash table and a Doubly Linked List achieves O(1) operations.'],
      starterCode: `class LRUCache {
  constructor(capacity) {
    this.capacity = capacity;
    this.map = new Map();
  }

  get(key) {
    // TODO: return value and mark as recently used
  }

  put(key, value) {
    // TODO: insert or update value and evict oldest if over capacity
  }
}`
    },
    {
      category: 'system-design',
      questionText: 'Design a real-time collaborative document editor (like Google Docs). How do you resolve concurrent edits between multiple connected clients?',
      expectedKeywords: ['WebSockets', 'Operational Transformation (OT)', 'CRDTs', 'vector clocks', 'conflict resolution'],
      hints: ['Contrast Operational Transformation (OT) with Conflict-free Replicated Data Types (CRDTs).'],
      starterCode: ''
    },
    {
      category: 'behavioral',
      questionText: 'Describe a project where you had to balance delivering high-priority product features with addressing accumulating technical debt.',
      expectedKeywords: ['STAR', 'prioritization', 'refactoring', 'stakeholder communication', 'metrics'],
      hints: ['Explain how you communicated the business value of paying down tech debt.'],
      starterCode: ''
    }
  ],
  Behavioral: [
    {
      category: 'behavioral',
      questionText: 'Tell me about a time you had to deliver a high-stakes project with tight deadlines and ambiguous requirements. How did you prioritize and execute?',
      expectedKeywords: ['STAR', 'scope negotiation', 'MVP', 'communication', 'milestones'],
      hints: ['Break down your answer: Situation, Task, Action, and quantifiable Result.'],
      starterCode: ''
    },
    {
      category: 'behavioral',
      questionText: 'Give an example of a mistake or failure you experienced in your engineering career. What did you learn and how did it change your approach?',
      expectedKeywords: ['accountability', 'blameless postmortem', 'growth mindset', 'resilience'],
      hints: ['Focus on your ownership of the issue and concrete preventive steps you implemented.'],
      starterCode: ''
    },
    {
      category: 'behavioral',
      questionText: 'Describe a situation where you had to mentor a junior engineer or onboard a new teammate. What techniques did you use to ensure their success?',
      expectedKeywords: ['pair programming', 'documentation', 'feedback', 'empathy', 'empowerment'],
      hints: ['Discuss how you adapted your communication style to their learning needs.'],
      starterCode: ''
    }
  ]
};

const MockAiService = {
  async generateQuestions({ role, level, type, techStack = [], count = 3 }) {
    let pool = mockQuestionsBank[role] || mockQuestionsBank['Full Stack'];
    if (type === 'Behavioral') {
      pool = mockQuestionsBank.Behavioral;
    }

    const selected = pool.slice(0, count).map((item, idx) => ({
      id: `q_${Date.now()}_${idx + 1}`,
      questionText: item.questionText,
      category: item.category,
      starterCode: item.starterCode || '',
      expectedKeywords: item.expectedKeywords || [],
      hints: item.hints || ['Think carefully about trade-offs, architecture, and edge cases.']
    }));

    return selected;
  },

  async generateFollowUp({ questionText, userAnswer, userCode }) {
    const combinedLength = (userAnswer || '').length + (userCode || '').length;

    if (combinedLength < 50) {
      return {
        followUpText: 'Could you elaborate further on how you would handle edge cases or potential failure modes for this solution?',
        quickEvaluation: 'Your answer is a bit brief. Adding real-world examples and trade-offs will make it stronger.'
      };
    }

    return {
      followUpText: 'That is a solid foundation. How would you scale this approach if the traffic increased by 100x or data volume grew exponentially?',
      quickEvaluation: 'Good conceptual grasp. Consider addressing performance bottlenecks at scale.'
    };
  },

  async evaluateInterview({ role, level, questions }) {
    let totalScore = 0;
    const evaluatedQuestions = questions.map((q) => {
      const answerLen = (q.userAnswer || '').trim().length;
      const codeLen = (q.userCode || '').trim().length;
      let score = 5;

      if (answerLen > 150 || codeLen > 50) score += 3;
      if (answerLen > 300) score += 1;
      if (answerLen < 40 && codeLen < 30) score = Math.max(3, score - 2);
      score = Math.min(10, score);
      totalScore += score;

      return {
        ...q,
        feedback: {
          score,
          critique: answerLen > 80
            ? 'Clear explanation addressing the core principles with good structure. Demonstrates practical awareness of trade-offs.'
            : 'Covers introductory concepts, but could benefit from deeper technical depth and specific architectural nuances.',
          strengths: [
            'Direct and structured response format',
            'Good conceptual understanding of the requested topic'
          ],
          improvements: [
            'Cite specific real-world metrics, edge cases, and performance considerations',
            'Elaborate on production failure modes and disaster recovery'
          ],
          idealAnswer: `An exemplary response would systematically break down: 1) Core architecture and operational mechanisms, 2) Trade-offs regarding latency vs throughput, 3) Real-world edge cases (concurrency, network partitioning, cache invalidation), and 4) Concrete monitoring and observability practices.`
        }
      };
    });

    const averageNormalized = Math.round((totalScore / (questions.length * 10)) * 100);
    const overallScore = Math.min(100, Math.max(45, averageNormalized || 78));

    const technicalScore = Math.min(100, overallScore + 2);
    const communicationScore = Math.min(100, overallScore - 1);
    const problemSolvingScore = Math.min(100, overallScore + 1);
    const confidenceScore = Math.min(100, overallScore - 2);

    let hiringVerdict = 'Strong Hire';
    if (overallScore < 60) hiringVerdict = 'Needs Preparation';
    else if (overallScore < 75) hiringVerdict = 'Leaning Hire';
    else if (overallScore < 88) hiringVerdict = 'Hire';

    return {
      evaluatedQuestions,
      overallFeedback: {
        overallScore,
        technicalScore,
        communicationScore,
        problemSolvingScore,
        confidenceScore,
        hiringVerdict,
        summary: `The candidate demonstrated strong foundational knowledge for the ${role} (${level}) position. Responses showed sound reasoning, logical structuring, and an understanding of modern software engineering best practices.`,
        keyStrengths: [
          'Strong articulation of architectural components and modular boundaries',
          'Logical problem-solving flow under mock interview conditions',
          'Good awareness of security, caching, and maintainability'
        ],
        areasForImprovement: [
          'Deepen focus on distributed system edge cases, such as idempotency and concurrency locks',
          'Structure behavioral responses even tighter using the STAR method (Situation, Task, Action, Result)',
          'Mention observability (metrics, logs, traces) when designing backend flows'
        ],
        actionableRoadmap: [
          'Review advanced distributed systems concepts (CAP theorem, consensus algorithms, event-driven architectures)',
          'Practice 3-5 LeetCode medium algorithmic challenges focusing on time/space complexity trade-offs',
          'Prepare 4 structured STAR stories highlighting cross-functional leadership and conflict resolution'
        ]
      }
    };
  }
};

module.exports = MockAiService;
