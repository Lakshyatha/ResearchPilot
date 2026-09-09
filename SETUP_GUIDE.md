# ResearchPilot AI - Setup Guide

## Prerequisites

1. Node.js 18+ installed
2. Supabase account (free tier works)
3. Git (optional, for version control)

---

## Step 1: Database Setup

Your database schema has already been migrated to Supabase. The following tables are now available:

- `profiles` - User profiles
- `workspaces` - Research workspaces
- `papers` - Research papers
- `research_gaps` - AI-detected gaps
- `contradictions` - Conflicting claims
- `evolution_timelines` - Research evolution
- `idea_simulations` - Idea scenarios
- `impact_predictions` - Trend forecasts
- `research_briefs` - Generated proposals
- `knowledge_graph_entities` - Graph entities
- `knowledge_graph_relationships` - Graph relationships

All tables have Row Level Security (RLS) enabled for data protection.

---

## Step 2: Environment Variables

Your `.env` file already contains your Supabase credentials:

```
VITE_SUPABASE_URL=https://vhqepcokvttuxhurfevr.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
```

These are automatically used by the application.

---

## Step 3: Install Dependencies

```bash
npm install
```

This installs all required packages including:
- React and TypeScript
- Supabase client
- Tailwind CSS
- Lucide React icons

---

## Step 4: Start Development Server

The development server has been started automatically for you.

To manually start it:
```bash
npm run dev
```

---

## Step 5: Build for Production

To create a production build:

```bash
npm run build
```

The build has already been verified and completed successfully.

---

## Using the Application

### 1. Authentication

On first visit, you'll see the login page. You can:
- **Sign Up**: Create a new account with email and password
- **Sign In**: Access your existing account

No email verification is required - you can sign in immediately after creating an account.

### 2. Creating Workspaces

After logging in:
1. Go to the **Workspaces** tab
2. Click **New Workspace**
3. Enter a name and description
4. Click **Create**

Workspaces help you organize papers by research topic or project.

### 3. Adding Papers

In a workspace:
1. Click **Add Paper**
2. Fill in paper details:
   - Title (required)
   - Authors (comma-separated)
   - Abstract
   - Publication date
   - DOI
   - URL
3. Click **Add Paper**

You need at least 2 papers in a workspace to use most AI features.

### 4. Research Gap Detection

1. Navigate to **Research Gaps** tab
2. Select a workspace
3. Click **Analyze Research Gaps**
4. View detected gaps with:
   - Gap descriptions
   - Confidence scores
   - Novelty scores
   - Suggested research questions

### 5. Contradiction Mapping

1. Navigate to **Contradictions** tab
2. Select a workspace
3. Click **Detect Contradictions**
4. Explore conflicting claims:
   - Claim comparisons
   - Contradiction types
   - Possible reasons for discrepancies

### 6. Evolution Timeline

1. Navigate to **Evolution Timeline** tab
2. Select a workspace
3. Click **Analyze Evolution**
4. View:
   - Chronological timeline
   - Paradigm shifts
   - Emerging trends

### 7. Idea Simulation

1. Navigate to **Idea Simulation** tab
2. Select a workspace
3. Enter a "what if" question
4. Click **Run Simulation**
5. Review:
   - Generated hypothesis
   - Feasibility score
   - Identified risks
   - Unknown factors

### 8. Impact Predictor

1. Navigate to **Impact Predictor** tab
2. Select a workspace
3. Click **Generate Predictions**
4. Explore:
   - High-growth topics
   - Declining topics
   - Fusion opportunities

### 9. Research Brief Generator

1. Navigate to **Research Brief** tab
2. Select a workspace
3. Click **Generate Brief**
4. View auto-generated sections:
   - Literature review
   - Research gaps
   - Problem statement
   - Methodology
   - Expected contributions
5. Click **Export** to download as Markdown

### 10. Knowledge Graph

1. Navigate to **Knowledge Graph** tab
2. Select a workspace
3. Click **Build Knowledge Graph**
4. Explore entities:
   - Authors
   - Methods
   - Concepts
5. Click entities to view relationships

---

## Edge Function

The research orchestrator edge function has been deployed and is available at:

```
https://vhqepcokvttuxhurfevr.supabase.co/functions/v1/research-orchestrator
```

This function handles intelligent routing of research analysis tasks to appropriate agents.

Before using Research Gap Detection, configure the OpenAI key as a Supabase Edge Function secret. Do not put this key in `.env` or expose it through a `VITE_` variable:

```bash
supabase secrets set OPENAI_API_KEY=your_openai_api_key --project-ref vhqepcokvttuxhurfevr
```

Optionally select a supported model with `OPENAI_MODEL`:

```bash
supabase secrets set OPENAI_MODEL=gpt-4o-mini --project-ref vhqepcokvttuxhurfevr
```

After setting the secret, redeploy the function if your Supabase project requires it:

```bash
supabase functions deploy research-orchestrator --project-ref vhqepcokvttuxhurfevr
```

---

## Tips for Best Results

1. **Add Quality Papers**: The more detailed your paper abstracts and content, the better the AI analysis

2. **Use Multiple Papers**: Most features work best with 3+ papers in a workspace

3. **Organize by Topic**: Create separate workspaces for different research areas

4. **Explore Connections**: Use the Knowledge Graph to discover hidden relationships

5. **Export Briefs**: Save research briefs for use in proposals or literature reviews

---

## Troubleshooting

### Can't log in?
- Check your email and password
- Make sure you created an account first
- Clear browser cache and try again

### Features not working?
- Ensure you have papers in your workspace
- Some features require at least 2 papers
- Check browser console for errors

### Data not saving?
- Check your internet connection
- Verify Supabase is accessible
- Try refreshing the page

---

## Next Steps

1. Create your first workspace
2. Add some research papers
3. Explore the AI-powered analysis features
4. Generate your first research brief
5. Build a knowledge graph of your research domain

---

## Architecture

For detailed technical documentation, see `ARCHITECTURE.md`.

For information about the database schema, Row Level Security policies, and agent system design, refer to the architecture documentation.

---

## Support

The system is fully functional and ready to use. All features are implemented with mock AI analysis that demonstrates the capabilities. In a production environment, these would connect to advanced NLP and machine learning models for deeper analysis.
