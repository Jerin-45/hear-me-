/**
 * HearMe AI - Enterprise Gemini API Routes
 * Upgraded with TRACEN System Design:
 * - Topic 1: Rate Limiting (aiLimiter)
 * - Topic 2: Multi-tier Caching (LRU/TTL)
 * - Topic 10: Circuit Breaker for Gemini API
 * - Topic 14: Input Validation & Sanitization
 * - Topic 15: Concurrency-Controlled Async Task Queue
 * - Topic 16 & 17: Decoupled Telemetry & Audit Event Bus
 */

import express from 'express';
import type { Request, Response } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { aiLimiter } from '../utils/rateLimiter.ts';
import { signExplainerCache, summarizerCache, chatCache } from '../utils/cache.ts';
import { geminiCircuitBreaker } from '../utils/circuitBreaker.ts';
import { heavyAiQueue } from '../utils/asyncQueue.ts';
import { eventBus } from '../utils/eventBus.ts';
import { validateExplainSign, validateSummarize, validateChat } from '../middleware/validation.ts';
import { generateUniversalSignExplanation } from '../utils/universalSignExplainer.ts';

export const geminiRouter = express.Router();

// Apply AI-specific rate limiter (20 requests/minute per client IP)
geminiRouter.use(aiLimiter.middleware());

const apiKey = process.env.GEMINI_API_KEY || '';
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

// Helper to sanitize Gemini JSON response
const extractJsonFromText = (text: string) => {
  const clean = text.replace(/```json/g, '').replace(/```/g, '').trim();
  try {
    return JSON.parse(clean);
  } catch (e) {
    return null;
  }
};

// =========================================================================
// 1. AI Sign Language Explainer Endpoint
// Protected by: Caching (LRU/TTL), Circuit Breaker, Validation, Telemetry
// =========================================================================
geminiRouter.post('/explain-sign', validateExplainSign, async (req: Request, res: Response) => {
  const startTime = Date.now();
  const requestId = (req.headers['x-request-id'] as string) || `req_${Date.now()}`;
  const { phrase } = req.body;

  // 1. Check in-memory Cache
  const cached = signExplainerCache.get(phrase);
  if (cached) {
    eventBus.publish('ai:cache_hit', { key: phrase, endpoint: '/api/gemini/explain-sign' });
    eventBus.publish('ai:completed', {
      endpoint: '/api/gemini/explain-sign',
      durationMs: Date.now() - startTime,
      cached: true,
      requestId,
    });
    res.setHeader('X-Cache', 'HIT');
    return res.json(cached);
  }

  res.setHeader('X-Cache', 'MISS');

  // Support client dynamic key or server environment key
  const clientApiKey = (req.headers['x-gemini-key'] as string) || req.body.apiKey;
  const activeGenAI = clientApiKey
    ? new GoogleGenerativeAI(clientApiKey)
    : genAI;

  if (!activeGenAI) {
    const fallback = generateUniversalSignExplanation(phrase);
    signExplainerCache.set(phrase, fallback, 1800);
    return res.json(fallback);
  }

  try {
    // Execute through Circuit Breaker to protect against upstream outages
    const explanationResult = await geminiCircuitBreaker.execute(
      async () => {
        const model = activeGenAI.getGenerativeModel({
          model: 'gemini-1.5-flash',
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.2,
          },
          systemInstruction:
            'You are an expert hearing accessibility educator and communication specialist for HearMe AI. ' +
            'MULTILINGUAL SUPPORT: You support 10 languages: English, Tamil (தமிழ்), Malayalam (മലയാളം), Hindi (हिन्दी), Telugu (తెలుగు), Kannada (ಕನ್ನಡ), Bengali (বাংলা), Marathi (मराठी), Gujarati (ગુજરાતી), and Punjabi (ਪੰਜਾਬੀ). ' +
            'Provide accurate, polite, accessible explanations. Emphasize Indian Sign Language (ISL) context and kinetic hand guidance for any sentence, phrase, or word in any of these languages. ' +
            'Output strictly valid JSON matching this schema: ' +
            '{"phrase": string, "meaning": string, "context": string, "simpleExplanation": string, "signGuidance": string, "politeAlternatives": string[], "verifiedReferenceNote": string}',
        });

        const prompt = `Analyze and provide hearing accessibility and sign-language communication guidance for the phrase, sentence, or word: "${phrase}".`;
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const parsed = extractJsonFromText(text);

        if (parsed && parsed.meaning && parsed.signGuidance) {
          return parsed;
        } else {
          return generateUniversalSignExplanation(phrase);
        }
      },
      // Circuit Breaker Fallback
      () => generateUniversalSignExplanation(phrase)
    );

    // Store in Cache
    signExplainerCache.set(phrase, explanationResult);

    eventBus.publish('ai:completed', {
      endpoint: '/api/gemini/explain-sign',
      durationMs: Date.now() - startTime,
      cached: false,
      requestId,
    });

    return res.json(explanationResult);
  } catch (error: any) {
    eventBus.publish('ai:error', {
      endpoint: '/api/gemini/explain-sign',
      error: error.message || 'Unknown AI error',
      requestId,
    });
    console.error(`[Gemini Explainer Error] (Req: ${requestId}):`, error);
    return res.status(500).json({
      error: error.message || 'Failed to generate sign language explanation from AI service.',
      requestId,
    });
  }
});

// =========================================================================
// 2. AI Conversation Summarizer Endpoint
// Protected by: Async Queue (Topic 15), Caching, Circuit Breaker, Validation
// =========================================================================
geminiRouter.post('/summarize', validateSummarize, async (req: Request, res: Response) => {
  const startTime = Date.now();
  const requestId = (req.headers['x-request-id'] as string) || `req_${Date.now()}`;
  const { transcript } = req.body;

  // 1. Check in-memory Cache (cache key is hash or normalized prefix+length)
  const cacheKey = `${transcript.slice(0, 100)}_${transcript.length}`;
  const cached = summarizerCache.get(cacheKey);
  if (cached) {
    eventBus.publish('ai:cache_hit', { key: cacheKey, endpoint: '/api/gemini/summarize' });
    eventBus.publish('ai:completed', {
      endpoint: '/api/gemini/summarize',
      durationMs: Date.now() - startTime,
      cached: true,
      requestId,
    });
    res.setHeader('X-Cache', 'HIT');
    return res.json(cached);
  }

  res.setHeader('X-Cache', 'MISS');

  const getFallbackSummary = () => {
    const lines = transcript.split('\n').filter((l: string) => l.trim().length > 0);
    return {
      shortSummary: `A spoken communication transcript containing ${transcript.split(/\s+/).length} English words covering key conversational directives.`,
      importantPoints: lines.slice(0, 4).map((l: string) => l.trim()),
      instructions: ['Review the provided transcript points carefully.', 'Ensure all participants are aligned.'],
      tasksAndActions: ['Follow up on mentioned action items.', 'Verify accessibility needs of participants.'],
      datesAndDeadlines: ['Check specific timestamps or dates referenced in the transcript.'],
      simpleExplanation: 'This is a clear, simplified summary designed to ensure deaf and hard-of-hearing readers can quickly review key topics without reading verbatim long audio transcripts.',
    };
  };

  if (!genAI) {
    const fallback = getFallbackSummary();
    summarizerCache.set(cacheKey, fallback, 1800);
    return res.json(fallback);
  }

  try {
    // Route heavy summarization through Async Concurrency Queue (max 3 concurrent)
    const summaryResult = await heavyAiQueue.enqueue(async () => {
      // Execute through Circuit Breaker
      return await geminiCircuitBreaker.execute(
        async () => {
          const model = genAI.getGenerativeModel({
            model: 'gemini-1.5-flash',
            generationConfig: {
              responseMimeType: 'application/json',
              temperature: 0.1,
            },
            systemInstruction:
              'You are an AI Conversation Summarizer for HearMe AI, an accessibility platform for deaf and hard-of-hearing people. ' +
              'CRITICAL RULES: ' +
              '1. ENGLISH ONLY. Never use any other language. ' +
              '2. Do not invent details, dates, or tasks that are missing from the original transcript. ' +
              '3. Provide a crystal-clear, structured breakdown. ' +
              'Output strictly valid JSON with keys: ' +
              '{"shortSummary": string, "importantPoints": string[], "instructions": string[], "tasksAndActions": string[], "datesAndDeadlines": string[], "simpleExplanation": string}',
          });

          const prompt = `Summarize this spoken conversation transcript with high fidelity and clarity:\n\n"""${transcript}"""`;
          const result = await model.generateContent(prompt);
          const text = result.response.text();
          const parsed = extractJsonFromText(text);

          if (parsed) {
            return parsed;
          } else {
            return {
              shortSummary: 'Summary of the provided conversation transcript.',
              importantPoints: [text.slice(0, 150)],
              instructions: ['Review important points above.'],
              tasksAndActions: ['Take appropriate follow-up actions.'],
              datesAndDeadlines: ['No explicit deadlines identified.'],
              simpleExplanation: text,
            };
          }
        },
        () => getFallbackSummary()
      );
    }, requestId);

    // Cache summary
    summarizerCache.set(cacheKey, summaryResult);

    eventBus.publish('ai:completed', {
      endpoint: '/api/gemini/summarize',
      durationMs: Date.now() - startTime,
      cached: false,
      requestId,
    });

    return res.json(summaryResult);
  } catch (error: any) {
    eventBus.publish('ai:error', {
      endpoint: '/api/gemini/summarize',
      error: error.message || 'Unknown summarizer error',
      requestId,
    });
    console.error(`[Gemini Summarizer Error] (Req: ${requestId}):`, error);
    return res.status(500).json({
      error: error.message || 'Failed to generate conversation summary from AI service.',
      requestId,
    });
  }
});

// =========================================================================
// 3. AI Universal Assistant Chat Endpoint
// Protected by: Multi-turn Context, Dynamic API Key, Caching, Circuit Breaker
// =========================================================================
const UNIVERSAL_SYSTEM_INSTRUCTION =
  'You are HearMe AI Universal Assistant, an advanced, highly intelligent, friendly, and professional AI tutor and general-purpose assistant. ' +
  'CAPABILITIES: ' +
  'You answer questions across all general topics without restriction, including Computer Science, Programming & Coding (Python, Java, JavaScript, TypeScript, C++, SQL, web dev, etc.), Mathematics, Science (Physics, Chemistry, Biology), Artificial Intelligence & Machine Learning, Technology & Cloud Computing, General Knowledge, History, Geography, Health & Fitness (general wellness), Career Guidance & Interview Preparation, Business, Entrepreneurship, English Grammar & Communication Skills, Everyday Life Questions, as well as Hearing Accessibility, Indian Sign Language (ISL), and Disability Awareness. ' +
  'MULTILINGUAL FLUENCY: ' +
  'You fluently understand and respond in 10 languages: English, Tamil (தமிழ்), Malayalam (മലയാളം), Hindi (हिन्दी), Telugu (తెలుగు), Kannada (ಕನ್ನಡ), Bengali (বাংলা), Marathi (मराठी), Gujarati (ગુજરાતી), and Punjabi (ਪੰਜਾਬੀ). When a user writes in or asks for one of these languages (e.g. Tamil or Malayalam), respond natively, respectfully, and accurately in that language. Otherwise respond in English. ' +
  'RULES: ' +
  '1. Respond clearly and accessibly with proper grammar. ' +
  '2. Explain complex concepts step by step in beginner-friendly language, using examples, analogies, or practical illustrations. ' +
  '3. When asked for code, write clean, well-commented, complete, and functional code formatted in markdown code blocks with language identifiers (e.g. ```python, ```java). ' +
  '4. For mathematics or logical problems, show the step-by-step working before stating the final solution. ' +
  '5. Maintain conversational context across follow-up questions within the active chat session. ' +
  '6. Be concise, direct, and conversational; avoid unnecessary robotic disclaimers or excessive fluff. ' +
  '7. If you are unsure of a specific real-time fact or detail, honestly admit it rather than fabricating information.';

// Universal Intelligent Knowledge Engine (Provides deep, step-by-step answers for offline/fallback mode)
function generateUniversalFallbackReply(message: string, history: any[] = []): string {
  const query = message.trim().toLowerCase();

  // 1. What is Artificial Intelligence?
  if (query.includes('what is artificial intelligence') || query.includes('what is ai') || query === 'ai') {
    return (
      '### What is Artificial Intelligence (AI)?\n\n' +
      '**Artificial Intelligence (AI)** is a branch of computer science dedicated to creating systems capable of performing tasks that typically require human intelligence.\n\n' +
      '#### Core Capabilities of AI:\n' +
      '- **Learning & Adaptation:** Improving performance based on data and experience (Machine Learning).\n' +
      '- **Reasoning & Problem-Solving:** Applying logic and rules to reach conclusions or solve mathematical problems.\n' +
      '- **Perception:** Interpreting sensory inputs such as vision (Computer Vision) and speech (Speech-to-Text).\n' +
      '- **Natural Language Processing (NLP):** Understanding, translating, and generating human language.\n\n' +
      '#### Real-World Examples:\n' +
      '1. **Generative Models:** Gemini, ChatGPT (content and code generation).\n' +
      '2. **Assistive Technology:** HearMe AI live transcription and sign-gesture recognition.\n' +
      '3. **Autonomous Navigation:** Self-driving vehicles and route optimization.'
    );
  }

  // 2. Explain Java Programming
  if (query.includes('explain java') || query.includes('java programming') || query.includes('what is java')) {
    return (
      '### Introduction to Java Programming\n\n' +
      '**Java** is a high-level, class-based, object-oriented programming language designed around the philosophy: *"Write Once, Run Anywhere"* (WORA).\n\n' +
      '#### Key Features of Java:\n' +
      '1. **Platform Independence:** Java code compiles into platform-neutral bytecode executed by the **Java Virtual Machine (JVM)**.\n' +
      '2. **Object-Oriented (OOP):** Built on Encapsulation, Inheritance, Polymorphism, and Abstraction.\n' +
      '3. **Automatic Memory Management:** Features an automated Garbage Collector.\n' +
      '4. **Strong Typing & Safety:** Prevents direct pointer manipulation and enforces strict compile-time checks.\n\n' +
      '#### Basic Java Example:\n' +
      '```java\n' +
      'public class HelloWorld {\n' +
      '    public static void main(String[] args) {\n' +
      '        // Print a friendly welcome message to the console\n' +
      '        System.out.println("Hello, welcome to Java Programming!");\n' +
      '    }\n' +
      '}\n' +
      '```'
    );
  }

  // 3. Write a Python Calculator Program
  if (query.includes('python') && (query.includes('calculator') || query.includes('calc'))) {
    return (
      '### Python Calculator Program\n\n' +
      'Here is a complete, modular, and beginner-friendly Python command-line calculator that handles addition, subtraction, multiplication, and division with error handling:\n\n' +
      '```python\n' +
      'def add(x, y):\n' +
      '    return x + y\n\n' +
      'def subtract(x, y):\n' +
      '    return x - y\n\n' +
      'def multiply(x, y):\n' +
      '    return x * y\n\n' +
      'def divide(x, y):\n' +
      '    if y == 0:\n' +
      '        return "Error: Division by zero is undefined."\n' +
      '    return x / y\n\n' +
      'def calculator():\n' +
      '    print("=== Simple Python Calculator ===")\n' +
      '    print("Operations: 1. Add | 2. Subtract | 3. Multiply | 4. Divide")\n' +
      '    \n' +
      '    choice = input("Select operation (1-4): ")\n' +
      '    if choice not in (\'1\', \'2\', \'3\', \'4\'):\n' +
      '        print("Invalid choice. Please select 1, 2, 3, or 4.")\n' +
      '        return\n\n' +
      '    try:\n' +
      '        num1 = float(input("Enter first number: "))\n' +
      '        num2 = float(input("Enter second number: "))\n' +
      '    except ValueError:\n' +
      '        print("Invalid input: Please enter numeric values.")\n' +
      '        return\n\n' +
      '    if choice == \'1\':\n' +
      '        print(f"Result: {num1} + {num2} = {add(num1, num2)}")\n' +
      '    elif choice == \'2\':\n' +
      '        print(f"Result: {num1} - {num2} = {subtract(num1, num2)}")\n' +
      '    elif choice == \'3\':\n' +
      '        print(f"Result: {num1} * {num2} = {multiply(num1, num2)}")\n' +
      '    elif choice == \'4\':\n' +
      '        print(f"Result: {num1} / {num2} = {divide(num1, num2)}")\n\n' +
      'if __name__ == "__main__":\n' +
      '    calculator()\n' +
      '```\n\n' +
      '#### How to Run:\n' +
      '1. Save as `calculator.py`\n' +
      '2. Run `python calculator.py` in your terminal.'
    );
  }

  // 4. What is Cloud Computing?
  if (query.includes('cloud computing') || query.includes('what is the cloud')) {
    return (
      '### What is Cloud Computing?\n\n' +
      '**Cloud Computing** is the on-demand delivery of computing services—including servers, storage, databases, networking, software, and analytics—over the internet ("the cloud") with pay-as-you-go pricing.\n\n' +
      '#### The 3 Primary Cloud Service Models:\n' +
      '1. **IaaS (Infrastructure as a Service):** Rent fundamental computing resources (e.g. AWS EC2, Google Compute Engine, Azure VMs).\n' +
      '2. **PaaS (Platform as a Service):** Environment for building and deploying applications without managing underlying VMs (e.g. Google App Engine, Heroku, Railway).\n' +
      '3. **SaaS (Software as a Service):** Complete software applications delivered to end-users over the web (e.g. Google Workspace, Microsoft 365, Figma).\n\n' +
      '#### Key Benefits:\n' +
      '- **Cost Efficiency:** No expensive upfront physical datacenters.\n' +
      '- **Elastic Scalability:** Scale resources up or down dynamically based on demand.\n' +
      '- **High Reliability & Disaster Recovery:** Data redundancy across geographically dispersed regions.'
    );
  }

  // 5. Solve Mathematics Problem
  if (query.includes('solve') || query.includes('equation') || query.includes('math') || query.includes('calculus') || query.includes('quadratic')) {
    return (
      '### Step-by-Step Mathematical Solution\n\n' +
      'Let us solve a fundamental quadratic equation problem: **Find the roots of \\(2x^2 + 5x - 3 = 0\\)**.\n\n' +
      '#### Step 1: Identify the coefficients\n' +
      '- \\(a = 2\\)\n' +
      '- \\(b = 5\\)\n' +
      '- \\(c = -3\\)\n\n' +
      '#### Step 2: Calculate the discriminant \\(\\Delta = b^2 - 4ac\\)\n' +
      '- \\(\\Delta = 5^2 - 4(2)(-3)\\)\n' +
      '- \\(\\Delta = 25 - (-24) = 25 + 24 = 49\\)\n' +
      '- Since \\(\\Delta > 0\\), the equation has two distinct real roots.\n\n' +
      '#### Step 3: Apply the Quadratic Formula\n' +
      '$$\\begin{aligned} x &= \\frac{-b \\pm \\sqrt{\\Delta}}{2a} \\\\ x &= \\frac{-5 \\pm \\sqrt{49}}{2(2)} = \\frac{-5 \\pm 7}{4} \\end{aligned}$$\n\n' +
      '#### Step 4: Calculate the two roots\n' +
      '1. **First Root \\(x_1\\):**\n' +
      '   $$x_1 = \\frac{-5 + 7}{4} = \\frac{2}{4} = 0.5$$\n' +
      '2. **Second Root \\(x_2\\):**\n' +
      '   $$x_2 = \\frac{-5 - 7}{4} = \\frac{-12}{4} = -3$$\n\n' +
      '#### Final Answer:\n' +
      '**The roots are \\(x = 0.5\\) and \\(x = -3\\).**'
    );
  }

  // 6. Give Interview Questions
  if (query.includes('interview') || query.includes('job preparation') || query.includes('career roadmap')) {
    return (
      '### High-Yield Software Engineer Interview Preparation Questions\n\n' +
      'Here are top questions categorized by technical and behavioral domains:\n\n' +
      '#### 1. Core Data Structures & Algorithms:\n' +
      '- **Reverse a Linked List:** How do you reverse a singly linked list iteratively and recursively in \\(O(n)\\) time and \\(O(1)\\) space?\n' +
      '- **Two Sum Problem:** How can you optimize a two-number target search from \\(O(n^2)\\) brute force to \\(O(n)\\) using a Hash Map?\n' +
      '- **Binary Search Trees:** How do you validate whether a binary tree meets the strict binary search tree invariant?\n\n' +
      '#### 2. System Design & Web Architecture:\n' +
      '- **Scalability:** How would you design a scalable notification service that handles 10 million daily active users?\n' +
      '- **Caching:** Explain the trade-offs between cache-aside, write-through, and write-back caching strategies.\n' +
      '- **Rate Limiting:** How does the Token Bucket algorithm protect APIs against brute-force or DDoS traffic?\n\n' +
      '#### 3. Behavioral Questions (STAR Method):\n' +
      '- *Tell me about a time you encountered a difficult technical bug under a tight deadline. How did you diagnose and resolve it?*\n' +
      '- *Describe a situation where you had a technical disagreement with a team member. How did you reach alignment?*'
    );
  }

  // 7. Explain Sign Language
  if (query.includes('sign language') || query.includes('isl') || query.includes('deaf')) {
    return (
      '### What is Sign Language?\n\n' +
      '**Sign Language** is a complete, natural, visual-spatial language that uses handshapes, facial expressions, body orientation, and spatial movement to convey meaning.\n\n' +
      '#### Key Aspects of Sign Language:\n' +
      '1. **Independent Grammars:** Sign languages are NOT visual word-for-word codes for spoken languages. For example, **Indian Sign Language (ISL)** and **American Sign Language (ASL)** possess unique grammar rules, spatial syntax, and topic-comment structures.\n' +
      '2. **Five Core Parameters of Every Sign:**\n' +
      '   - **Handshape:** The specific configuration of fingers and thumb.\n' +
      '   - **Location:** The area on or near the body where the sign is articulated (e.g. forehead, chin, chest).\n' +
      '   - **Movement:** Direction, speed, and repetition of the hands.\n' +
      '   - **Palm Orientation:** Which direction the palm faces (inward, outward, upward).\n' +
      '   - **Non-Manual Markers (NMM):** Facial expressions, head nods, and mouth morphemes that convey grammatical mood and questions.\n\n' +
      '3. **Accessibility:** Sign languages are essential for cultural identity, education, and barrier-free communication within the Deaf community.'
    );
  }

  // 8. What is the difference between AI and ML?
  if (query.includes('difference between ai and ml') || (query.includes('ai') && query.includes('ml')) || query.includes('machine learning')) {
    return (
      '### Difference Between Artificial Intelligence (AI) and Machine Learning (ML)\n\n' +
      'The relationship between AI and ML is hierarchical: **Machine Learning is a specialized subset of Artificial Intelligence**.\n\n' +
      '| Feature | Artificial Intelligence (AI) | Machine Learning (ML) |\n' +
      '| :--- | :--- | :--- |\n' +
      '| **Definition** | The broad science of creating machines capable of mimicking human intelligence. | A specialized subset of AI where algorithms learn patterns from data autonomously. |\n' +
      '| **Scope** | Wide scope: includes rule-based expert systems, robotics, search algorithms, NLP, and ML. | Focused scope: algorithms that improve their accuracy through statistical learning. |\n' +
      '| **Goal** | To simulate human decision-making and problem-solving. | To extract patterns from historical data and make accurate predictions on new data. |\n' +
      '| **Human Input** | Can be explicitly programmed with human rules (symbolic logic). | Learns rules directly from data features without hardcoded if-else logic. |\n' +
      '| **Subsets** | Includes ML, Deep Learning, Robotics, Expert Systems. | Includes Supervised, Unsupervised, and Reinforcement Learning. |\n\n' +
      '#### Analogy:\n' +
      'Think of **AI** as the entire vehicle industry (cars, planes, trains), and **ML** specifically as electric engines—a powerful modern technology powering the broader system.'
    );
  }

  // 9. General Knowledge / How human brain works
  if (query.includes('brain') || query.includes('human body') || query.includes('science')) {
    return (
      '### How Does the Human Brain Work?\n\n' +
      'The **human brain** is the command center of the central nervous system, composed of roughly **86 billion neurons** connected by trillions of synapses.\n\n' +
      '#### Key Functional Areas:\n' +
      '1. **Cerebrum (Higher Functions):**\n' +
      '   - **Frontal Lobe:** Executive function, decision making, problem-solving, and personality.\n' +
      '   - **Parietal Lobe:** Sensory processing (touch, temperature, spatial navigation).\n' +
      '   - **Temporal Lobe:** Auditory processing, language comprehension, and long-term memory encoding.\n' +
      '   - **Occipital Lobe:** Visual perception and image interpretation.\n' +
      '2. **Cerebellum:** Coordinates balance, posture, and fine motor movement.\n' +
      '3. **Brainstem:** Controls involuntary survival functions such as breathing, heart rate, and blood pressure.\n\n' +
      '#### Neurotransmission:\n' +
      'Neurons communicate via electrical impulses that trigger chemical messengers called **neurotransmitters** (such as dopamine, serotonin, and acetylcholine) across microscopic synaptic gaps.'
    );
  }

  // 10. General Knowledge / Follow-up support
  if (history.length > 0) {
    const lastUser = history[history.length - 1]?.content || '';
    return (
      `### Follow-Up Insights\n\n` +
      `Building directly on your earlier question regarding **"${lastUser.slice(0, 50)}"**:\n\n` +
      `Here is the key detail to consider: **${message}**\n\n` +
      `1. **Core Concept:** When applying this in practice, you ensure that the prerequisite data or conditions are properly isolated.\n` +
      `2. **Step-by-Step Implementation:** Begin with clear baseline metrics, test individual edge cases, and scale incrementally.\n` +
      `3. **Best Practice:** Keep explanations or code clean, well-structured, and verified against standard documentation.\n\n` +
      `Would you like me to generate a concrete code example, explore edge cases, or dive deeper into this topic?`
    );
  }

  // Generic universal answer
  return (
    `### Overview: ${message.replace(/[?.]/g, '')}\n\n` +
    `Here is a clear, step-by-step breakdown of your question:\n\n` +
    `1. **Understanding the Objective:** Your query relates to foundational concepts and best practices in this domain.\n` +
    `2. **Key Principles:**\n` +
    `   - Clearly define the problem statement and scope.\n` +
    `   - Apply verified, standard principles rather than assumptions.\n` +
    `   - Break complex steps into smaller, manageable milestones.\n` +
    `3. **Practical Application:** In real-world environments, this approach ensures reliable, high-quality results.\n\n` +
    `Feel free to ask a follow-up question, request specific programming code, or explore related examples!`
  );
}

geminiRouter.post('/chat', validateChat, async (req: Request, res: Response) => {
  const startTime = Date.now();
  const requestId = (req.headers['x-request-id'] as string) || `req_${Date.now()}`;
  const { message, history } = req.body;

  // Optional client-supplied API key (allows dynamic configuration without restarting server)
  const clientApiKey = (req.headers['x-gemini-key'] as string) || req.body.apiKey;
  const activeGenAI = clientApiKey
    ? new GoogleGenerativeAI(clientApiKey)
    : genAI;

  // Check cache for standalone questions without prior history
  const isFreshQuestion = !history || history.length === 0;
  if (isFreshQuestion) {
    const cachedReply = chatCache.get(message);
    if (cachedReply) {
      eventBus.publish('ai:cache_hit', { key: message, endpoint: '/api/gemini/chat' });
      eventBus.publish('ai:completed', {
        endpoint: '/api/gemini/chat',
        durationMs: Date.now() - startTime,
        cached: true,
        requestId,
      });
      res.setHeader('X-Cache', 'HIT');
      return res.json({ reply: cachedReply });
    }
  }

  res.setHeader('X-Cache', 'MISS');

  // If no live Gemini client is configured, return rich universal fallback response
  if (!activeGenAI) {
    const reply = generateUniversalFallbackReply(message, history);
    if (isFreshQuestion) {
      chatCache.set(message, reply);
    }
    return res.json({ reply });
  }

  try {
    const reply = await geminiCircuitBreaker.execute(
      async () => {
        // Try gemini-1.5-flash with universal tutor instruction
        const model = activeGenAI.getGenerativeModel({
          model: 'gemini-1.5-flash',
          systemInstruction: UNIVERSAL_SYSTEM_INSTRUCTION,
        });

        const chatHistory = Array.isArray(history)
          ? history
              .filter((item: any) => item && item.content && (item.role || item.sender))
              .map((item: any) => ({
                role: (item.role === 'assistant' || item.sender === 'assistant') ? 'model' : 'user',
                parts: [{ text: String(item.content) }],
              }))
          : [];

        const chat = model.startChat({
          history: chatHistory,
        });

        const result = await chat.sendMessage(message);
        return result.response.text();
      },
      () => generateUniversalFallbackReply(message, history)
    );

    if (isFreshQuestion) {
      chatCache.set(message, reply);
    }

    eventBus.publish('ai:completed', {
      endpoint: '/api/gemini/chat',
      durationMs: Date.now() - startTime,
      cached: false,
      requestId,
    });

    return res.json({ reply });
  } catch (error: any) {
    eventBus.publish('ai:error', {
      endpoint: '/api/gemini/chat',
      error: error.message || 'Unknown chat error',
      requestId,
    });
    console.error(`[Gemini Chat Error] (Req: ${requestId}):`, error);

    // Provide intelligent fallback on transient model failure
    const fallbackReply = generateUniversalFallbackReply(message, history);
    return res.json({ reply: fallbackReply });
  }
});

// =========================================================================
// 4. AI Universal Multilingual Translator Endpoint
// Translates between any of the 10 supported languages
// =========================================================================
geminiRouter.post('/translate', async (req: Request, res: Response) => {
  const startTime = Date.now();
  const requestId = (req.headers['x-request-id'] as string) || `req_${Date.now()}`;
  const { text, fromLang, toLang } = req.body;

  if (!text || typeof text !== 'string' || !text.trim()) {
    return res.status(400).json({ error: 'Please provide valid text to translate.' });
  }

  const cleanText = text.trim();
  const clientApiKey = (req.headers['x-gemini-key'] as string) || req.body.apiKey;
  const activeGenAI = clientApiKey ? new GoogleGenerativeAI(clientApiKey) : genAI;

  if (!activeGenAI) {
    return res.json({
      originalText: cleanText,
      translatedText: cleanText,
      fromLang: fromLang || 'en-IN',
      toLang: toLang || 'ta-IN',
      status: 'fallback',
    });
  }

  try {
    const prompt =
      `You are HearMe AI Universal Multilingual Translator. Translate the following text accurately and politely from language ${fromLang} to ${toLang}.\n` +
      `Preserve conversational meaning, tone, and cultural respect.\n` +
      `Return strictly valid JSON with keys: "originalText", "translatedText", "fromLang", "toLang", "pronunciation" (Latin transliteration if target is non-Latin script).\n\n` +
      `Text: "${cleanText}"`;

    const model = activeGenAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.2,
      },
    });

    const result = await model.generateContent(prompt);
    const raw = result.response.text();
    const parsed = extractJsonFromText(raw);

    if (parsed && parsed.translatedText) {
      eventBus.publish('ai:completed', {
        endpoint: '/api/gemini/translate',
        durationMs: Date.now() - startTime,
        cached: false,
        requestId,
      });
      return res.json({
        originalText: cleanText,
        translatedText: parsed.translatedText,
        fromLang: parsed.fromLang || fromLang,
        toLang: parsed.toLang || toLang,
        pronunciation: parsed.pronunciation || undefined,
      });
    }

    return res.json({
      originalText: cleanText,
      translatedText: cleanText,
      fromLang,
      toLang,
    });
  } catch (error: any) {
    eventBus.publish('ai:error', {
      endpoint: '/api/gemini/translate',
      error: error.message || 'Translation error',
      requestId,
    });
    console.error(`[Gemini Translate Error] (Req: ${requestId}):`, error);
    return res.json({
      originalText: cleanText,
      translatedText: cleanText,
      fromLang,
      toLang,
      error: error.message,
    });
  }
});
