<div align="center">

<br />

```
██████╗ ███████╗███████╗███████╗██████╗ ██████╗
██╔══██╗██╔════╝██╔════╝██╔════╝██╔══██╗██╔══██╗
██║  ██║█████╗  █████╗  █████╗  ██████╔╝██████╔╝
██║  ██║██╔══╝  ██╔══╝  ██╔══╝  ██╔══██╗██╔══██╗
██████╔╝███████╗██║     ███████╗██║  ██║██║  ██║
╚═════╝ ╚══════╝╚═╝     ╚══════╝╚═╝  ╚═╝╚═╝  ╚═╝
```

### **The AI that stops you from deferring what matters.**

<br />

[![Built with Gemini](https://img.shields.io/badge/Built%20with-Gemini%201.5%20Flash-4285F4?style=flat-square&logo=google&logoColor=white)](https://ai.google.dev/)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-6366F1?style=flat-square)](LICENSE)

<br />

> *Built for the [vibe2ship Hackathon](https://vibe2ship.com) · Solo project · 48-hour sprint*
>
> *By **Chiranjivi Panda***

<br />

---

</div>

## The Problem

Every person in this world has missed a deadline they were reminded about.

Reminders don't fail because you forget. They fail because **nothing got easier after the notification.** You still had no plan, no time cleared, no first step taken. The reminder fired into the void.

Every productivity tool ever built is a more sophisticated version of the same passive system: log it, label it, remind you, repeat. They act as digital filing cabinets — beautiful, organised, and completely inert.

**Deferr is not a reminder app.**

It is the first step taken for you.

---

## What Deferr Does Differently

Most apps tell you *what* to do. Deferr acts on it.

When you add a task, the AI doesn't just log it. It analyses your behavioral history, profiles your peak energy windows, detects structural overcommitment before it becomes crisis, negotiates calendar space on your behalf, and — in the case of cognitive overload — breaks the task into micro-steps so small that starting becomes the only rational response.

The entire architecture is built around a single thesis: **the gap between knowing a deadline exists and taking the first action on it is where productivity dies.** Every feature in Deferr closes that gap.

---

## Feature Architecture

### Layer 1 — Core AI & Behavioral Engine *(Gemini 1.5 Flash)*

<table>
<thead>
<tr><th>Feature</th><th>What it does</th><th>Why it matters</th></tr>
</thead>
<tbody>
<tr>
<td><strong>Task Deconstruction</strong><br /><em>Deadline DNA</em></td>
<td>Takes a vague, heavy task ("Write Final Paper") and uses Gemini to decompose it into a structured JSON array of 5–10 minute micro-steps with effort estimates and sequencing logic.</td>
<td>Eliminates start-friction. The single hardest moment in any task is the first one. Micro-steps make starting the only rational action.</td>
</tr>
<tr>
<td><strong>Tough Love Audit</strong><br /><em>Temporal Mirror</em></td>
<td>An AI diagnostic that analyses the user's ratio of delayed vs. completed tasks across their full history. Gemini acts as a blunt behavioral coach, generating a no-nonsense personalised audit to break the procrastination loop.</td>
<td>Generic productivity advice changes nothing. Personalised behavioral feedback written in first person — "here is your specific pattern" — does.</td>
</tr>
<tr>
<td><strong>Chronotype Profiling</strong></td>
<td>Analyses the timestamps of when tasks are historically completed to infer the user's peak cognitive energy windows. The system automatically routes heavy-lift tasks to optimal time slots.</td>
<td>Fighting your own biology is the most common productivity mistake. Knowing you're a 9am thinker vs. a 10pm thinker changes which tasks you win.</td>
</tr>
<tr>
<td><strong>Dynamic Rescheduling</strong><br /><em>Auto-Triage</em></td>
<td>When a deadline is missed, the system doesn't shame the user. Gemini recalculates all remaining tasks and proposes a restructured, mathematically realistic schedule — with justification for every decision.</td>
<td>The "snowball effect" of a single missed deadline is what causes total collapse. Auto-triage stops the cascade at step one.</td>
</tr>
<tr>
<td><strong>Natural Language Task Parsing</strong></td>
<td>Users can type a messy, unstructured thought — "CS assignment Friday, also groceries and call mum" — and the AI parses every entity, infers categories and deadlines, and creates strictly typed JSON task objects in a single call.</td>
<td>Friction at task entry is where productivity systems lose users. Zero-format input removes that barrier entirely.</td>
</tr>
</tbody>
</table>

---

### Layer 2 — Dynamic User Interface *(React 18 + Tailwind CSS)*

<table>
<thead>
<tr><th>Feature</th><th>What it does</th><th>Why it matters</th></tr>
</thead>
<tbody>
<tr>
<td><strong>Ambient Urgency UI</strong></td>
<td>The visual weight of the entire application shifts dynamically based on the urgency state of the current task set. Three modes: <em>Nominal</em> (slow animations, generous whitespace), <em>Alert</em> (tighter spacing, amber accents), <em>Critical</em> (non-critical tasks grey out, the one deadline that matters dominates the screen). Transitions are animated system-wide via a single CSS data-attribute on the root element.</td>
<td>No other productivity app changes its own personality based on its data. When the UI itself tightens as a deadline enters the 1-hour window, the urgency is felt — not just read.</td>
</tr>
<tr>
<td><strong>Adaptive Eisenhower Matrix</strong></td>
<td>A toggleable view that shifts the standard task list into a 4-quadrant Urgent/Important grid. The AI automatically plots every task based on deadline proximity (urgency) and a Gemini-inferred importance score, with colour-coded quadrants and one-click drilling.</td>
<td>The Eisenhower Matrix is the most trusted prioritisation framework in professional productivity. Making it AI-automated removes the cognitive load of categorisation entirely.</td>
</tr>
<tr>
<td><strong>Micro-Friction Focus Mode</strong><br /><em>"Just Start"</em></td>
<td>Hides the overwhelming master task list and presents only the single next micro-step of one task on a full-screen canvas. No notifications, no other tasks, no escape route — except forward. If the user tries to exit before completing the step, the AI delivers a contextual persuasion message using their own deadline data.</td>
<td>Cognitive overload is the primary reason people open a task manager and immediately close it. Showing exactly one thing eliminates the paradox of choice.</td>
</tr>
<tr>
<td><strong>Behavioral Analytics Dashboard</strong></td>
<td>Visual metrics tracking "procrastination velocity" (frequency of task deferrals over time), task completion rate by category, time debt accumulation, and a composite productivity score — all derived from the action log, rendered as interactive charts.</td>
<td>You cannot change what you cannot measure. Showing users a concrete number for their procrastination behaviour transforms it from a feeling into a fact — and facts are fixable.</td>
</tr>
</tbody>
</table>

---

### Layer 3 — Backend & Data Architecture *(Node.js + Express + TypeScript)*

<table>
<thead>
<tr><th>Feature</th><th>What it does</th><th>Why it matters</th></tr>
</thead>
<tbody>
<tr>
<td><strong>Mock Calendar & Event Seeding</strong></td>
<td>A robust initialisation script in <code>src/index.ts</code> that hydrates the local JSON store with realistic, complex schedules including overlapping events, conflicting deadlines, and movable vs. fixed calendar blocks. The app is fully demonstrable from a cold start with zero manual data entry.</td>
<td>A productivity app demo that starts empty proves nothing. Seeded data lets every feature be shown immediately, in context, without setup time.</td>
</tr>
<tr>
<td><strong>Strict JSON Schema Enforcement</strong></td>
<td>All Gemini API calls use <code>generationConfig: { responseMimeType: "application/json" }</code> and structured output schemas. The AI only ever communicates with the frontend via predictable, typed data objects. Raw text responses are architecturally impossible.</td>
<td>LLM output unpredictability is the most common cause of hackathon demo failure. Enforcing JSON schema at the API level makes every AI response as reliable as a database query.</td>
</tr>
<tr>
<td><strong>Production-Ready Cloud Architecture</strong></td>
<td>A clean Express server on port <code>3001</code>, fully decoupled from local AI dependencies, secured via environment variables, structured with a clear route/service/store separation, and containerisation-ready for deployment to Google Cloud Run.</td>
<td>Architecture is a signal of engineering maturity. A project that could ship to production in an afternoon demonstrates genuine craft, not just prototype thinking.</td>
</tr>
</tbody>
</table>

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           DEFERR ARCHITECTURE                           │
├────────────────────────┬────────────────────────┬───────────────────────┤
│     React Frontend     │   Node/Express API     │     Gemini 1.5 Flash  │
│                        │                        │                       │
│  ┌──────────────────┐  │  ┌──────────────────┐  │  ┌─────────────────┐  │
│  │  Dashboard       │  │  │  /api/tasks      │  │  │  NLP Parsing    │  │
│  │  Focus Mode      │◄─┼─►│  /api/insights   │◄─┼─►│  Task Deconstruct│ │
│  │  Eisenhower Grid │  │  │  /api/calendar   │  │  │  Audit Engine   │  │
│  │  Analytics       │  │  │  /api/negotiate  │  │  │  Schedule Opt.  │  │
│  └──────────────────┘  │  └──────────────────┘  │  └─────────────────┘  │
│                        │           │             │                       │
│  Ambient Urgency OS    │  ┌────────▼──────────┐  │  JSON Schema Only     │
│  (CSS data-attribute   │  │  JSON Store       │  │  (No raw text ever)   │
│   drives entire UI)    │  │  tasks.json       │  │                       │
│                        │  │  calendar.json    │  │                       │
│                        │  │  user-profile.json│  │                       │
│                        │  └───────────────────┘  │                       │
└────────────────────────┴────────────────────────┴───────────────────────┘
```

---

## Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| Frontend framework | React 18 + Vite | Fast HMR, modern component architecture |
| Styling | Tailwind CSS | Utility-first, Ambient Urgency system via data-attributes |
| Language | TypeScript (strict) | End-to-end type safety across client and server |
| Backend | Node.js + Express | Lightweight API server, clean route/service separation |
| AI engine | Gemini 1.5 Flash | Task parsing, behavioral analysis, schedule negotiation |
| Data persistence | JSON file store | Zero-setup, demo-reliable, Cloud Run compatible |
| Voice input | Web Speech API | Browser-native, no additional dependency |
| Deployment target | Google Cloud Run | Containerised, serverless, scales to zero |

---

## Project Structure

```
deferr/
├── README.md
├── .env.example
├── .gitignore
│
├── server/                          # Express backend
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
│       ├── index.ts                 # Server entry, middleware, route mount
│       ├── config.ts                # Constants: model string, ports, paths
│       ├── routes/
│       │   ├── health.ts            # GET /api/health
│       │   ├── tasks.ts             # CRUD, parse, rank, deconstruct
│       │   ├── calendar.ts          # Events, proposals, apply
│       │   ├── insights.ts          # DNA, temporal mirror, chronotype
│       │   └── negotiate.ts         # Pushback negotiation endpoint
│       ├── services/
│       │   ├── gemini.ts            # Gemini client, all prompt builders
│       │   ├── task-ranker.ts       # Deterministic priority scoring
│       │   ├── proposal-engine.ts   # At-risk detection + reschedule logic
│       │   └── chronotype.ts        # Peak energy window analyser
│       ├── calendar/
│       │   ├── calendar-adapter.ts  # CalendarAdapter interface
│       │   └── mock-calendar.ts     # Seeded events + free-block finder
│       ├── store/
│       │   ├── json-store.ts        # Generic file-based read/write
│       │   └── seed.ts              # Demo data initialisation
│       ├── types/
│       │   └── index.ts             # Task, CalendarEvent, Proposal, DNA
│       └── middleware/
│           └── error-handler.ts     # Centralised error responses
│
└── client/                          # Vite + React frontend
    ├── package.json
    ├── vite.config.ts
    ├── tsconfig.json
    ├── index.html
    └── src/
        ├── main.tsx
        ├── App.tsx                  # Router + urgency mode context
        ├── index.css                # Tailwind + urgency mode CSS vars
        ├── types/index.ts
        ├── hooks/
        │   ├── useTasks.ts
        │   ├── useCalendar.ts
        │   ├── useUrgencyMode.ts    # Global urgency state (nominal/alert/critical)
        │   └── useSpeech.ts
        ├── components/
        │   ├── Layout.tsx
        │   ├── TaskRow.tsx          # Dense row with tabular-nums countdown
        │   ├── ProposalCard.tsx     # The magic moment — Apply / Dismiss
        │   ├── CalendarTimeline.tsx
        │   ├── FocusMode.tsx        # Full-screen single micro-step view
        │   ├── NegotiationPanel.tsx # AI pushback conversation UI
        │   ├── TemporalMirror.tsx   # "A note from 48h from now"
        │   ├── EisenhowerGrid.tsx   # 4-quadrant AI-plotted matrix
        │   └── ui/
        │       ├── GlassCard.tsx
        │       ├── CountdownTimer.tsx
        │       └── SkeletonLoader.tsx
        └── pages/
            ├── Dashboard.tsx        # Command centre — main view
            ├── Analytics.tsx        # Procrastination velocity charts
            ├── CalendarView.tsx
            └── AddTask.tsx
```

---

## Data Model

```typescript
interface Task {
  id: string;                    // UUID v4
  title: string;                 // Parsed clean title
  raw_input: string;             // Original user text, preserved verbatim
  category: TaskCategory;        // 'bill' | 'assignment' | 'meeting' | 'interview' | 'personal' | 'other'
  deadline: string;              // ISO 8601
  estimated_effort_minutes: number;
  priority_score: number;        // 0–100, deterministic (never LLM-derived)
  priority_reasoning: string;    // 1–2 sentence AI explanation of the rank
  status: TaskStatus;            // 'pending' | 'in_progress' | 'action_taken' | 'completed' | 'missed'
  micro_steps: MicroStep[];      // Deconstruction output — 5-10 min steps
  ai_action_log: ActionLogEntry[];
  created_at: string;
  updated_at: string;
}

interface ActionLogEntry {
  timestamp: string;
  action: ActionType;            // 'parsed' | 'ranked' | 'deconstructed' | 'event_moved' | 'audit_generated' | 'negotiation_declined'
  details: string;               // Human-readable chain of reasoning
}

interface UserDNA {
  patterns: BehavioralPattern[];
  chronotype: ChronotypeProfile;
  time_debt_score: number;       // 0–100+ — above 100 means structural overcommitment
  audit_generated_at: string;
}
```

---

## Priority Scoring Formula

The priority engine is entirely deterministic — **Gemini never influences the numeric rank.** This is by design: LLM output variance must not change what the user sees at the top of their task list.

```
priority_score = clamp(0, 100,
  0.5 × urgency + 0.4 × importance − 0.1 × normalized_effort
)

urgency      = 100 × (1 − clamp(0, 1, hours_remaining / 168))
importance   = { bill: 90, interview: 90, assignment: 85, meeting: 60, personal: 40, other: 50 }
norm_effort  = 100 × clamp(0, 1, estimated_effort_minutes / 480)
```

Gemini's role is exclusively to generate the `priority_reasoning` string — the human-readable explanation of *why* this score was assigned. If that call fails, a structured fallback template fires automatically. The ranking itself is always stable.

---

## API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Server health check |
| `GET` | `/api/tasks` | Fetch all tasks, sorted by priority |
| `POST` | `/api/tasks` | Parse NL input → structured Task + rank |
| `PATCH` | `/api/tasks/:id/status` | Update task status |
| `DELETE` | `/api/tasks/:id` | Hard delete |
| `POST` | `/api/tasks/:id/deconstruct` | Break task into micro-steps via Gemini |
| `POST` | `/api/tasks/:id/propose` | Generate calendar reschedule proposal |
| `POST` | `/api/tasks/:id/apply` | Apply the proposal to the calendar |
| `POST` | `/api/tasks/negotiate` | AI pushback conversation turn |
| `POST` | `/api/insights/dna` | Generate behavioral fingerprint |
| `POST` | `/api/insights/temporal-mirror` | Generate "48h from now" letter |
| `POST` | `/api/insights/chronotype` | Infer peak energy windows from history |
| `POST` | `/api/insights/triage` | Structural overcommitment analysis |
| `GET` | `/api/calendar/events` | Fetch 48h of calendar events |
| `POST` | `/api/tasks/braindump` | Parse voice transcript → multiple tasks |

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+
- A [Google AI Studio](https://aistudio.google.com/) API key (free tier)

### Installation

```bash
# Clone the repository
git clone https://github.com/<your-username>/deferr.git
cd deferr

# Install server dependencies
cd server && npm install

# Install client dependencies
cd ../client && npm install
```

### Environment Setup

```bash
# In the server directory, copy the example env file
cp .env.example .env
```

Open `.env` and add your key:

```env
GEMINI_API_KEY=your_key_here
PORT=3001
```

### Run in Development

Open two terminals:

```bash
# Terminal 1 — start the backend
cd server && npm run dev

# Terminal 2 — start the frontend
cd client && npm run dev
```

The app will be available at `http://localhost:5173`.

On first run, the seed script automatically hydrates the calendar store with realistic demo events. No manual setup required.

### Verify the Setup

```bash
# Confirm the backend is live
curl http://localhost:3001/api/health
# → { "status": "ok", "timestamp": "..." }

# Confirm Gemini is connected
curl http://localhost:3001/api/test-gemini
# → { "success": true, "response": "..." }

# Confirm calendar seeding worked
curl http://localhost:3001/api/calendar/events
# → [...array of 10 seeded events...]
```

---

## The Core Demo Loop

The single most important sequence in Deferr — the one this entire architecture is built around:

```
1. User adds a task via voice or text
       ↓
2. Gemini parses NL → structured Task object with deadline, category, effort
       ↓
3. Deterministic ranker scores it → task appears at correct position in dashboard
       ↓
4. Gemini generates priority_reasoning → one sentence explains the rank
       ↓
5. At-risk detection fires → no free block ≥ effort exists before deadline
       ↓
6. Gemini proposes: "Move Gym (5–6pm) to 7–8pm → frees 2h for your assignment"
       ↓
7. User clicks Apply → calendar event moves for real → action logged
       ↓
8. Temporal Mirror updates → "A note from 48h from now..." regenerates
```

Every feature in the codebase exists to make step 7 work flawlessly, and to make the journey from step 1 to step 7 feel inevitable.

---

## Design System

Deferr's UI follows a philosophy called **Operational Calm** — borrowed from two design languages that are rarely combined: aviation instrument panels (maximum information density, zero decoration) and luxury watchmaking (restraint, silence, micro-precision).

| Token | Value | Usage |
|---|---|---|
| Background | `#0D0D0F` | True near-black — makes every accent read clearly |
| Primary accent | `#6366F1` | Electric indigo — interactive elements only |
| Alert accent | `#F59E0B` | Amber — urgency, not decoration |
| Critical accent | `#EF4444` | Desaturated red — 1h-or-less deadline states |
| Text primary | `#F4F4F5` | Near-white — all body copy |
| Text secondary | `#A1A1AA` | Muted zinc — metadata, reasoning text |
| Display font | DM Sans 500 | UI chrome, task titles |
| Voice font | DM Serif Display italic | AI-generated content only — temporal mirror, audit |
| Countdown format | `tabular-nums` | Live timers that don't shift width on update |

The Ambient Urgency OS is the single most important UI decision in the codebase. A CSS `data-urgency` attribute on the `:root` element drives transition speed, spacing density, and accent colour system-wide via CSS custom property overrides. The AI is not just described as understanding urgency — the interface demonstrates it.

---

## Hackathon Context

**Event:** vibe2ship Hackathon
**Problem Statement:** *"The Last-Minute Life Saver"* — Build an AI-powered productivity companion that proactively assists users in planning, prioritising, and completing tasks before deadlines are missed. Move beyond passive reminders.

**Builder:** Chiranjivi Panda · Roll No: 24CS2013

**Positioning:** Every other team at this event will build "AI to-do list with smart reminders." Deferr's point of difference is architectural: the AI acts, not notifies. The calendar reshuffling is real. The behavioral audit is personalised. The pushback is contextual. The Temporal Mirror is generative. The Ambient Urgency OS is responsive. Reminders are passive. Deferr is not.

---

## Roadmap

- [ ] Google Calendar OAuth integration (real event read/write via Calendar API)
- [ ] Public deployment (Vercel + Google Cloud Run)
- [ ] Peer pressure engine (anonymous cohort completion statistics per task category)
- [ ] WhatsApp-style shareable plan card (HTML Canvas → PNG export)
- [ ] Progressive Web App (offline task capture, background sync)
- [ ] Multi-session memory (persistent behavioral DNA across browser sessions)

---

## License

MIT License — see [LICENSE](LICENSE) for details.

---

<div align="center">

<br />

*Built in 48 hours. Designed to last.*

<br />

**Deferr** — *The AI that stops you from deferring what matters.*

<br />

</div>
