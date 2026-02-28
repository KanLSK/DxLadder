# Doctordle

Doctordle is a clinical diagnosis guessing game built with Next.js, MongoDB, and Google Gemini.

Users test their clinical reasoning by guessing diagnoses from a 5-hint escalating ladder (from vague presentation to pathognomonic findings).

It features:
1. **Case Library**: A persistent library of curated and community-promoted cases.
2. **AI-Generated Case Review**: An ephemeral queue where Gemini generates new cases, users play and vote on their realism/quality, and highly-rated cases are promoted to the permanent library.

## Tech Stack
- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS
- **Database**: MongoDB (Mongoose ORM)
- **AI**: Google Gemini (`gemini-2.5-flash`)

## Prerequisites
- Node.js (v18+)
- MongoDB Atlas cluster (or local instance)
- Google Gemini API Key

## Environment Setup
Create a `.env.local` file in the root directory:

```env
# MongoDB Connection String
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/doctordle?retryWrites=true&w=majority

# Gemini API Key for Case Generation/Critic
GEMINI_API_KEY=your_gemini_api_key_here

# Optional configuration
SERVER_SALT=your_random_string_for_ip_hashing
MIN_VOTES=5
UPVOTE_THRESHOLD=0.8
```

## Running Locally

1. Install dependencies:
   ```bash
   npm install
   ```

2. Seed the database with initial cases:
   ```bash
   node scripts/seed.js
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure
- `src/app`: Next.js pages and API routes
  - `/api/library/*`: Endpoints for fetching from the persistent library
  - `/api/play/*`: Endpoints handling game logic (guesses, hint reveals)
  - `/api/ai/*`: Endpoints for the dual-pass Gemini generation system
  - `/api/vote/*`: Endpoints handling community voting and threshold promotion
- `src/components`: React UI components (PlayPage, CaseCard, GuessInput, VotingPanel)
- `src/lib`: Utilities (DB connection, Gemini pipeline, string normalization)
- `src/models`: Mongoose schemas (CaseLibrary, CaseGenerated, Vote, Play)

## Two-Pass AI System
Doctordle uses a robust "Generate + Critic" pattern to ensure high-quality AI cases before they are shown to users. 
1. **Generator**: Creates a full JSON payload (diagnosis, hints ladder, tags).
2. **Critic**: Evaluates the payload for medical accuracy, hint progression logic, and safety. If it fails, the Generator tries again up to 3 times before returning an error.

## Contributing / Tests
Basic tests exist for hint normalization and alias matching.
```bash
npx jest
```
