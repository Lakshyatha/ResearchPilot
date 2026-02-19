# ResearchPilot AI - Architecture Documentation

## System Overview

ResearchPilot AI is a next-generation autonomous research intelligence platform that goes beyond traditional RAG-based research assistants. It's a cognitive research co-pilot that models research evolution, identifies contradictions, detects research gaps, and predicts future trends.

## Core Innovation

Unlike standard academic research tools that focus on semantic search and summarization, ResearchPilot AI provides:

- **Autonomous Intelligence**: Multi-agent system that independently analyzes research patterns
- **Cognitive Analysis**: Deep understanding of research evolution and paradigm shifts
- **Predictive Capabilities**: Forward-looking trend analysis and impact prediction
- **Knowledge Synthesis**: Automatic generation of research proposals and briefs

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend Layer                          │
│  React + TypeScript + Tailwind CSS + Supabase Client       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  Authentication Layer                        │
│              Supabase Auth (Email/Password)                 │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   Orchestrator Layer                         │
│            Supabase Edge Function: Intelligent Router       │
│   • Intent Classification                                   │
│   • Task Decomposition                                      │
│   • Agent Pipeline Execution                                │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     Agent Layer                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │ Gap Agent   │  │Contradiction│  │ Evolution   │        │
│  │             │  │   Agent     │  │   Agent     │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │ Simulation  │  │   Impact    │  │    Brief    │        │
│  │   Agent     │  │  Predictor  │  │  Generator  │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
│  ┌─────────────┐                                            │
│  │ Knowledge   │                                            │
│  │Graph Builder│                                            │
│  └─────────────┘                                            │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   Data Layer                                 │
│  Supabase PostgreSQL with Row Level Security               │
│  • Papers          • Research Gaps                          │
│  • Workspaces      • Contradictions                         │
│  • Entities        • Timelines                              │
│  • Relationships   • Predictions                            │
└─────────────────────────────────────────────────────────────┘
```

---

## Novel Features

### 1. Research Gap Detection Agent

**What makes it unique:**
- Analyzes multiple papers simultaneously (not single-paper analysis)
- Identifies unanswered questions across literature
- Detects under-explored areas with confidence scoring
- Suggests potential thesis topics automatically

**Output:**
- Gap descriptions with confidence scores
- Novelty assessment scores
- Suggested research questions
- Supporting evidence from multiple papers

**Technical Implementation:**
- Cross-document semantic analysis
- Pattern recognition for research themes
- Gap identification through absence detection
- Question generation from identified gaps

---

### 2. Contradiction Mapping Engine

**What makes it unique:**
- Detects conflicting claims between papers
- Maps disagreement clusters
- Identifies methodological differences
- Provides explanations for discrepancies

**Output:**
- Claim A vs Claim B comparisons
- Contradiction type classification (methodological, theoretical, empirical)
- Confidence scores
- Possible reasons for discrepancies

**Technical Implementation:**
- Claim extraction and comparison
- Semantic conflict detection
- Context-aware contradiction identification
- Reasoning engine for discrepancy analysis

---

### 3. Research Evolution Timeline

**What makes it unique:**
- Temporal analysis of research progression
- Paradigm shift detection
- Foundational paper identification
- Emerging trend prediction

**Output:**
- Chronological evolution visualization
- Major turning points
- Foundational papers list
- Emerging trends with strength scores

**Technical Implementation:**
- Temporal ordering and clustering
- Citation velocity analysis
- Impact trajectory modeling
- Trend emergence detection

---

### 4. Idea Simulation Mode

**What makes it unique:**
- Speculative reasoning capabilities
- Cross-domain concept fusion
- Feasibility assessment
- Risk and unknown identification

**How it works:**
User asks: "What if we apply method X to domain Y?"

System provides:
- Generated hypothesis
- Feasibility score
- Identified risks
- Unknown factors
- Supporting concepts from papers

**Technical Implementation:**
- Concept extraction and combination
- Feasibility scoring through similarity analysis
- Risk assessment based on paper evidence
- Unknown detection through gap analysis

---

### 5. Research Impact Predictor

**What makes it unique:**
- Citation velocity analysis
- Topic growth signal detection
- Interdisciplinary fusion opportunities
- Declining topic identification

**Output:**
- High-growth topics with reasoning
- Declining topics with explanations
- Fusion opportunities between domains
- Confidence metrics

**Technical Implementation:**
- Time-series analysis of research activity
- Embedding similarity clustering
- Cross-domain opportunity detection
- Trend forecasting algorithms

---

### 6. Autonomous Research Brief Generator

**What makes it unique:**
- Full research proposal generation
- Structured academic writing
- Multi-section synthesis
- Publication-ready format

**Sections generated:**
1. Literature Review
2. Research Gaps
3. Problem Statement
4. Proposed Methodology
5. Expected Contributions

**Technical Implementation:**
- Multi-paper synthesis
- Academic writing patterns
- Section-specific generation
- Coherence maintenance across sections

---

### 7. Dynamic Knowledge Graph Builder

**What makes it unique:**
- Automatic entity extraction
- Relationship detection
- Interactive exploration
- Evolves with new papers

**Entities:**
- Authors
- Methods
- Concepts
- Technologies

**Relationships:**
- Uses
- Collaborates with
- Implements
- Requires
- Extends

**Technical Implementation:**
- Named entity recognition
- Relationship extraction
- Graph database modeling
- Interactive visualization

---

## Database Schema

### Core Tables

**profiles**
- User authentication and profile data
- Links to auth.users

**workspaces**
- Research project containers
- Organizes papers by topic/project

**papers**
- Research paper storage
- Metadata and content

### Intelligence Tables

**research_gaps**
- AI-detected research opportunities
- Confidence and novelty scores
- Suggested research questions

**contradictions**
- Conflicting claims across papers
- Contradiction types and evidence
- Reasoning for discrepancies

**evolution_timelines**
- Temporal research progression
- Paradigm shifts
- Emerging trends

**idea_simulations**
- Speculative research scenarios
- Feasibility assessments
- Risk/unknown analysis

**impact_predictions**
- Growth/decline forecasts
- Fusion opportunities
- Trend analysis

**research_briefs**
- Generated research proposals
- Multi-section academic documents

**knowledge_graph_entities**
- Extracted entities from papers
- Entity properties and metadata

**knowledge_graph_relationships**
- Connections between entities
- Relationship types and strengths

---

## Agent Orchestration System

### Intent Classification

The orchestrator analyzes user requests and determines:
1. Primary intent (gap detection, contradiction analysis, etc.)
2. Required data sources
3. Appropriate agent(s) to invoke

### Task Decomposition

Complex requests are broken down into:
1. Data retrieval steps
2. Analysis phases
3. Synthesis operations
4. Output formatting

### Agent Pipeline Execution

Agents are executed in optimal order:
1. Sequential for dependent operations
2. Parallel for independent analyses
3. Chained for multi-step processes

### Actions Supported

- `detect_gaps` - Research gap detection
- `find_contradictions` - Contradiction mapping
- `analyze_evolution` - Timeline generation
- `simulate_idea` - Idea feasibility analysis
- `predict_impact` - Trend prediction
- `generate_brief` - Research proposal creation
- `build_graph` - Knowledge graph construction

---

## Security Architecture

### Row Level Security (RLS)

All tables implement strict RLS policies:
- Users access only their own data
- Workspace-based access control
- Authentication required for all operations

### Authentication

- Supabase Auth with email/password
- JWT-based session management
- Automatic profile creation on signup

---

## Technology Stack

**Frontend:**
- React 18
- TypeScript
- Tailwind CSS
- Lucide React (icons)

**Backend:**
- Supabase PostgreSQL
- Supabase Edge Functions (Deno runtime)
- Row Level Security

**Authentication:**
- Supabase Auth

**Deployment:**
- Vite build system
- Edge function deployment via Supabase

---

## What Makes This System Unique

1. **Not a Chatbot**: This is an autonomous intelligence system, not a conversational interface

2. **Multi-Paper Analysis**: All agents work across multiple papers, not single documents

3. **Cognitive Capabilities**: The system models research evolution and paradigm shifts

4. **Predictive Intelligence**: Forward-looking analysis, not just retrospective summarization

5. **Automatic Synthesis**: Generates publication-ready research proposals

6. **Dynamic Knowledge**: Knowledge graph evolves as papers are added

7. **Contradiction Detection**: Actively identifies and explains conflicting findings

8. **Speculative Reasoning**: Can simulate and evaluate novel research ideas

9. **Impact Forecasting**: Predicts which research areas will grow or decline

10. **Modular Architecture**: Each capability is a separate, composable agent

---

## Future Enhancements

The architecture supports adding:
- Real-time paper ingestion from academic databases
- Advanced NLP for deeper semantic understanding
- Citation network analysis
- Collaborative workspaces
- Export to academic formats (LaTeX, Word)
- Integration with reference managers
- AI-powered peer review simulation
- Research methodology recommendation engine

---

## Conclusion

ResearchPilot AI represents a fundamental shift from traditional research assistants. It's not about finding papers or answering questions - it's about understanding the research landscape, identifying opportunities, detecting conflicts, and predicting future directions. This makes it a true cognitive co-pilot for researchers.
