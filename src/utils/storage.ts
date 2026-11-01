import { Conversation, ChatSettings } from '../types/chat';

const STORAGE_KEY_CONVERSATIONS = 'resumeai_conversations_v1';
const STORAGE_KEY_ACTIVE_ID = 'resumeai_active_id_v1';
const STORAGE_KEY_SETTINGS = 'resumeai_settings_v1';

export const DEFAULT_SETTINGS: ChatSettings = {
  tone: 'professional',
  careerLevel: 'mid',
  defaultCareerField: 'Software Engineer',
  autoExtractResume: true,
};

const SEED_CONVERSATION: Conversation = {
  id: 'seed-conv-1',
  title: 'Full-Stack Developer Resume',
  createdAt: Date.now() - 1000 * 60 * 60 * 2, // 2 hours ago
  updatedAt: Date.now() - 1000 * 60 * 30, // 30 mins ago
  careerField: 'Full-Stack Software Engineer',
  extractedResume: `# Nishu Sharma
**Full-Stack Software Engineer**
San Francisco, CA · nishu@example.com · github.com/nishu · linkedin.com/in/nishu

---

### Professional Summary
Impact-driven Full-Stack Software Engineer with 4+ years of experience designing and shipping scalable cloud web applications using React, TypeScript, Node.js, and PostgreSQL. Proven track record of improving application performance by 40% and architecting microservices handling 2M+ daily active requests. Passionate about clean code, automated CI/CD pipelines, and intuitive user experiences.

---

### Technical Skills
- **Languages**: TypeScript, JavaScript (ES6+), Python, SQL, HTML5/CSS3
- **Frontend**: React, Next.js, Tailwind CSS, Redux Toolkit, WebSockets
- **Backend & Cloud**: Node.js, Express, PostgreSQL, Redis, Docker, AWS (ECS, S3, RDS)
- **Developer Tools**: Git, GitHub Actions, Jest, Vitest, Postman, Linux

---

### Work Experience
**Senior Frontend Engineer** | CloudScale Systems · San Francisco, CA
*Jan 2023 – Present*
- Architected and migrated legacy dashboard to modern React 19 & TypeScript, cutting initial page load times by 42% and reducing bundle size by 35%.
- Implemented real-time telemetry streaming using WebSockets and Redis, processing 15,000+ data events per second with sub-100ms latency.
- Mentored 4 junior engineers and instituted rigorous code review standards that reduced production regression bugs by 28%.

**Full-Stack Software Developer** | Nexa Solutions · San Jose, CA
*June 2021 – Dec 2022*
- Developed RESTful APIs and responsive frontends for enterprise inventory management software serving 85+ B2B clients.
- Automated PostgreSQL query indexing and caching layers with Redis, slashing slow 95th-percentile queries from 2.4s to 180ms.
- Integrated automated end-to-end testing with Playwright into GitHub Actions CI pipeline, improving deployment release confidence.

---

### Projects
**PulseMetrics – Distributed Analytics Engine**
- Built an open-source real-time analytics platform using React, Node.js, and ClickHouse; garnered 350+ GitHub stars.
- Implemented client-side canvas charting with zero external rendering dependencies, reducing memory usage by 60%.

---

### Education
**B.S. in Computer Science** | University of California, Davis
*Graduated: May 2021* · Dean's Honor List
`,
  messages: [
    {
      id: 'seed-msg-1',
      role: 'user',
      content: 'Hi! I want to create an ATS-friendly resume for a Full-Stack Software Engineer role. Can you help me polish my summary and experience?',
      timestamp: Date.now() - 1000 * 60 * 90,
    },
    {
      id: 'seed-msg-2',
      role: 'assistant',
      content: `Welcome to **ResumeAI**! I would be thrilled to help you build a compelling, ATS-optimized resume that gets noticed by hiring managers and tech recruiters.

To ensure your resume passes ATS scanners with top ranking, we will focus on three key pillars:
1. **Industry-standard keywords**: Clean categorization of languages, frameworks, databases, and DevOps tools.
2. **Quantified achievements**: Using the Google **XYZ Formula** (*"Accomplished [X] as measured by [Y], by doing [Z]"*).
3. **Clean typographic structure**: Standard, parseable headings without complex nested tables or graphics.

Let's begin with your **Professional Summary**. 

Tell me:
- How many years of experience do you have?
- What are your primary technologies (e.g. React, Node, Python, AWS)?
- What is one major achievement or impact you're most proud of?`,
      timestamp: Date.now() - 1000 * 60 * 85,
    },
    {
      id: 'seed-msg-3',
      role: 'user',
      content: 'I have about 4 years of experience mostly working with React, TypeScript, Node.js, and Postgres. At my current job I improved page load times by around 40% and built a telemetry dashboard handling millions of requests.',
      timestamp: Date.now() - 1000 * 60 * 60,
    },
    {
      id: 'seed-msg-4',
      role: 'assistant',
      content: `That is outstanding quantifiable impact! A 40% reduction in load time and handling millions of requests are high-signal achievements that recruiters look for immediately.

Here is a drafted, high-impact **Professional Summary** crafted for your profile:

### Professional Summary
> **Impact-driven Full-Stack Software Engineer** with 4+ years of experience designing and shipping scalable cloud web applications using React, TypeScript, Node.js, and PostgreSQL. Proven track record of improving application performance by 40% and architecting microservices handling 2M+ daily active requests. Passionate about clean code, automated CI/CD pipelines, and intuitive user experiences.

---

### Why this works for ATS & Recruiters:
- **Strong Hook**: Opens with your title and years of core tech stack experience.
- **Immediate Proof**: Integrates your 40% performance gain and 2M+ scale in the second sentence.
- **Keyword Density**: Natural placement of React, TypeScript, Node.js, PostgreSQL, and CI/CD.

Would you like to refine any words in this summary, or shall we move on to crafting your **Work Experience** bullet points for your current position?`,
      timestamp: Date.now() - 1000 * 60 * 55,
    },
  ],
};

export function getStoredConversations(): Conversation[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CONVERSATIONS);
    if (!raw) {
      const initial = [SEED_CONVERSATION];
      saveConversations(initial);
      return initial;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return [SEED_CONVERSATION];
    }
    const sanitized = parsed.map((c) => {
      if (c.extractedResume && (c.extractedResume.includes('Alex Morgan') || c.extractedResume.includes('Sahil'))) {
        return {
          ...c,
          extractedResume: c.extractedResume
            .replace(/Alex Morgan/g, 'Nishu Sharma')
            .replace(/alex\.morgan@example\.com/g, 'nishu@example.com')
            .replace(/alexmorgan/g, 'nishu')
            .replace(/Sahil Darji/g, 'Nishu Sharma')
            .replace(/Sahil/g, 'Nishu'),
        };
      }
      return c;
    });
    return sanitized;
  } catch (err) {
    console.error('Failed to parse conversations from localStorage:', err);
    return [SEED_CONVERSATION];
  }
}

export function saveConversations(conversations: Conversation[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_CONVERSATIONS, JSON.stringify(conversations));
  } catch (err) {
    console.error('Failed to save conversations to localStorage:', err);
  }
}

export function getActiveConversationId(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY_ACTIVE_ID) || null;
  } catch {
    return null;
  }
}

export function setActiveConversationId(id: string): void {
  try {
    localStorage.setItem(STORAGE_KEY_ACTIVE_ID, id);
  } catch (err) {
    console.error('Failed to save active conversation ID:', err);
  }
}

export function getStoredSettings(): ChatSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SETTINGS);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveStoredSettings(settings: ChatSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
  } catch (err) {
    console.error('Failed to save settings:', err);
  }
}

export function createNewConversation(careerField = 'Software Engineer'): Conversation {
  return {
    id: 'conv-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
    title: 'New Resume Chat',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    messages: [],
    careerField,
    extractedResume: '',
  };
}
