import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// Initialize Google GenAI client with required telemetry header
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

const RESUME_SYSTEM_INSTRUCTION = `You are "ResumeAI", an elite Certified Professional Resume Writer (CPRW) and senior executive recruiter.
Your purpose is to help users craft exceptional, ATS-optimized (Applicant Tracking System), and interview-winning resumes through natural, supportive conversation.

Key Principles:
1. Act as a warm, articulate, and strategic career consultant.
2. Ask ONE focused, relevant question at a time to guide the user step-by-step through their resume sections:
   - Contact / Personal Information
   - Professional Summary or Career Objective
   - Work Experience (using the Google XYZ formula: "Accomplished [X] as measured by [Y], by doing [Z]")
   - Technical & Soft Skills
   - Projects & Open Source
   - Education & Coursework
   - Certifications, Honors, Achievements, & Languages
3. Never force users into a rigid order. If a user brings up their skills, projects, or existing messy bullet points, immediately meet them where they are and provide refined versions.
4. Adapt to the user's career stage:
   - Freshers / Students: Emphasize capstone projects, academic honors, relevant coursework, technical proficiencies, internships, and student leadership.
   - Experienced Professionals: Focus on quantified business impact, revenue, cost reductions, team scaling, and domain expertise.
   - Career Changers: Spotlight transferable skills, recent bootcamps/certifications, and relevant hands-on projects.
5. NEVER invent false facts, imaginary employers, fake dates, or made-up statistics. If metrics are missing, provide strong drafted bullet points with clear bracketed suggestions like "[e.g., by 25% or saving $15k]" so the user can insert their true numbers.
6. Format output with immaculate markdown:
   - Use bold titles, clear subheadings (###), and bullet points (-) for drafted resume sections.
   - Whenever you provide a polished resume section or revised bullet points, present them clearly so the user can copy them directly.
7. Provide constructive, encouraging feedback explaining *why* a particular phrase or action verb (e.g., "Spearheaded", "Architected", "Engineered", "Orchestrated") elevates their candidacy.
8. Maintain deep context of all previously shared details in this conversation. Do not ask for information the user already shared.`;

// Endpoint: Chat with streaming response (SSE)
app.post('/api/chat', async (req, res) => {
  const { messages, tone, careerField } = req.body;

  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'Messages array is required' });
  }

  // Build system instruction tailored with tone & career field if provided
  let customizedInstruction = RESUME_SYSTEM_INSTRUCTION;
  if (tone) {
    customizedInstruction += `\n\nTone preference: Please maintain a ${tone} tone in your recommendations and wording.`;
  }
  if (careerField) {
    customizedInstruction += `\nTarget Career Field / Role: ${careerField}. Ensure industry-standard keywords and terminology tailored for this domain.`;
  }

  // Format contents for @google/genai
  const contents = messages.map((m: { role: string; content: string }) => ({
    role: m.role === 'assistant' || m.role === 'model' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));

  // Set up SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');

  try {
    const stream = await ai.models.generateContentStream({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        systemInstruction: customizedInstruction,
      },
    });

    for await (const chunk of stream) {
      const text = chunk.text;
      if (text) {
        res.write(`data: ${JSON.stringify({ text })}\n\n`);
      }
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error: any) {
    console.error('Error generating chat response:', error);
    const errorMessage = error?.message || 'Failed to generate response. Please try again.';
    res.write(`data: ${JSON.stringify({ error: errorMessage })}\n\n`);
    res.write('data: [DONE]\n\n');
    res.end();
  }
});

// Endpoint: Auto-generate a concise 3-5 word conversation title
app.post('/api/chat/title', async (req, res) => {
  const { firstMessage } = req.body;

  if (!firstMessage) {
    return res.json({ title: 'New Conversation' });
  }

  try {
    const prompt = `Based on this initial user message to a resume builder: "${firstMessage.slice(0, 300)}", generate a concise, professional title for the conversation in 3 to 5 words. Do not use quotation marks, punctuation, or generic filler like "Resume AI Conversation". Examples: "Software Engineer Resume", "Marketing Manager Summary", "Career Change to Product", "Entry Level Data Analyst". Output only the 3-5 words title.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });

    const title = (response.text ?? 'Resume Discussion').trim().replace(/^["']|["']$/g, '');
    res.json({ title: title || 'New Resume Chat' });
  } catch (error) {
    console.error('Error generating title:', error);
    res.json({ title: 'Resume Discussion' });
  }
});

// Endpoint: Extract structured resume draft from conversation history
app.post('/api/chat/extract-resume', async (req, res) => {
  const { messages } = req.body;

  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'Messages required' });
  }

  try {
    const conversationDigest = messages
      .map((m: { role: string; content: string }) => `${m.role === 'user' ? 'User' : 'AI'}: ${m.content}`)
      .join('\n\n');

    const prompt = `Review the following conversation between a user and a resume consultant:

---
${conversationDigest.slice(-8000)}
---

Extract all concrete resume information that has been gathered or finalized so far into structured markdown text formatted as a clean, ready-to-use resume draft. Include whichever sections have content (e.g., Contact Info, Professional Summary, Technical & Soft Skills, Work Experience, Projects, Education, Certifications).
If a section has not been discussed yet, omit it or write a clean empty placeholder. Output clean markdown directly, starting with the candidate's name or title.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });

    res.json({ markdown: response.text || '' });
  } catch (error: any) {
    console.error('Error extracting resume draft:', error);
    res.status(500).json({ error: 'Could not extract resume content' });
  }
});

// Setup Vite in development or static serving in production
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ResumeAI server running on http://0.0.0.0:${PORT} (${isProduction ? 'production' : 'development'})`);
  });
}

startServer();
