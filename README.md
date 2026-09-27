# Formly

An AI-powered form builder. Describe a form in plain English and get a structured, publishable form in seconds.

## Features

- **Generate forms from a prompt** — e.g. "job application for a software engineer" produces a form with appropriate fields, types, labels, and validation.
- **Revise forms via chat** — ask the AI to add a field, change a type, or reorder fields; changes are applied as structured operations, not free-text edits.
- **Manual field editing** — click a field to edit its label, type, options, or validation in the inspector panel.
- **Publish and share** — publish a form to get a public URL anyone can fill out.
- **Response management** — view submissions in an inbox, filter by status, mark as read/archived, or delete spam.

## Stack

**Backend:** Node.js, Express 5, MongoDB/Mongoose, JWT sessions (HTTP-only cookies), Zod, OpenRouter via Vercel AI SDK, in-memory rate limiting on the public submission endpoint.

**Frontend:** React 18, Vite, Tailwind CSS v4, React Router, Axios, React Hot Toast, Lucide icons.

## Architecture

```
Client (React)
    │  HTTP (axios, withCredentials)
    ▼
Server (Express)
    ├── /api/auth        → authController (JWT cookies)
    ├── /api/forms       → formController (CRUD + AI generation)
    │                     → chatController (AI revisions)
    │                     → submissionController (responses)
    ├── middleware/      → authMiddleware, rateLimiter, validateSubmission
    ├── services/        → ai.js (LLM calls), diff.js (operation application)
    └── models/          → User, Form, Submission
    ▼
MongoDB
```

**Generation flow:**

```
POST /api/forms { prompt }
  → generateForm(prompt)      single AI call, validated against a Zod schema
  → normalizeFields()         fixes ids, types, options, validation
  → Form.create(...)          status: "completed"
```

**Revision flow:**

```
POST /api/forms/:id/chat { prompt }
  → reviseForm(prompt, form)  returns { operations, description }
  → applyFieldOperations()    add_field / update_field / remove_field
  → Form.save(...)            version + 1
```

## Design notes

- **Synchronous generation.** Unlike SiteSphere (the project this one grew out of), form generation is fast enough (~5s) to run inline rather than as a background job — simpler code at the cost of a blocking request.
- **Operation-based revisions.** Edits reference fields by id (`add_field` / `update_field` / `remove_field`) rather than search/replace on text, which keeps referential integrity intact as the AI updates structured data.
- **Defensive post-processing.** Free-tier LLM output is often malformed (wrong type names, duplicate ids, missing select options, stray TypeScript syntax). `services/ai.js` normalizes every field before it reaches the frontend.
- **Rate limiting before validation.** The public submit route runs `rateLimiter → validateSubmission → submitForm`, so bots are rejected before touching MongoDB.
- **Honeypot field.** Public forms include a hidden `__hp` field; a non-empty value marks the submission as spam.

## Running locally

**Prerequisites:** Node 18+, MongoDB (local or Atlas).

### Backend

```bash
cd server
npm install
```

Create `server/.env`:

```env
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/formly
JWT_SECRET=your-long-random-secret
ORIGINS=http://localhost:5173
OPENROUTER_API_KEY=your-openrouter-key
OPENROUTER_MODEL=nvidia/nemotron-3.5-lightning:free
```

```bash
npm run dev
```

### Frontend

```bash
cd client
npm install
```

Create `client/.env`:

```env
VITE_API_URL=http://localhost:3000
```

```bash
npm run dev
```

Visit `http://localhost:5173`.

## Project structure

```
server/
├── config/db.js
├── models/            (user, form, submission)
├── middleware/        (authMiddleware, rateLimiter, validateSubmission)
├── controllers/       (authController, formController, chatController, submissionController)
├── services/          (aiSchemas, prompts, ai, diff)
├── routes/            (authRoutes, formRoutes)
└── server.js

client/
├── src/
│   ├── api/api.js
│   ├── components/    (FormRenderer, FieldCard, FieldInspector, ...)
│   ├── context/AppContext.jsx
│   ├── pages/          (Home, AuthPage, BuilderPage, PublishPage, ...)
│   ├── App.jsx
│   └── main.jsx
└── index.html
```

## Known limitations

- No drag-and-drop field reordering.
- Desktop-first builder layout; no dedicated mobile UI.
- No submission notifications (no email/webhook on new responses).
- In-memory rate limiting only works for a single-instance deployment; a multi-server setup would need Redis.

## License

MIT
