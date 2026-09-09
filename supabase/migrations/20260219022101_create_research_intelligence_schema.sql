/*
  # Research Intelligence Platform - Complete Schema

  ## Overview
  This migration creates the complete database schema for ResearchPilot AI Agent,
  a next-generation autonomous research intelligence platform.

  ## New Tables

  ### 1. `profiles`
  Extends Supabase auth.users with user profile information
  - `id` (uuid, FK to auth.users)
  - `email` (text)
  - `full_name` (text)
  - `avatar_url` (text)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 2. `workspaces`
  Research workspaces that contain collections of papers
  - `id` (uuid, PK)
  - `user_id` (uuid, FK to profiles)
  - `name` (text)
  - `description` (text)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 3. `papers`
  Research papers uploaded or imported by users
  - `id` (uuid, PK)
  - `workspace_id` (uuid, FK to workspaces)
  - `title` (text)
  - `authors` (jsonb array)
  - `abstract` (text)
  - `content` (text)
  - `publication_date` (date)
  - `doi` (text)
  - `url` (text)
  - `metadata` (jsonb)
  - `embedding` (vector for semantic search)
  - `created_at` (timestamptz)

  ### 4. `research_gaps`
  AI-detected research gaps and opportunities
  - `id` (uuid, PK)
  - `workspace_id` (uuid, FK)
  - `gap_description` (text)
  - `confidence_score` (float)
  - `novelty_score` (float)
  - `suggested_questions` (jsonb array)
  - `supporting_evidence` (jsonb)
  - `related_papers` (uuid[] array)
  - `created_at` (timestamptz)

  ### 5. `contradictions`
  Detected contradictions across research papers
  - `id` (uuid, PK)
  - `workspace_id` (uuid, FK)
  - `claim_a` (text)
  - `claim_b` (text)
  - `paper_a_id` (uuid, FK to papers)
  - `paper_b_id` (uuid, FK to papers)
  - `contradiction_type` (text)
  - `confidence_score` (float)
  - `supporting_evidence` (jsonb)
  - `possible_reasons` (jsonb array)
  - `created_at` (timestamptz)

  ### 6. `evolution_timelines`
  Temporal analysis of research evolution
  - `id` (uuid, PK)
  - `workspace_id` (uuid, FK)
  - `topic` (text)
  - `timeline_data` (jsonb)
  - `paradigm_shifts` (jsonb array)
  - `foundational_papers` (uuid[] array)
  - `emerging_trends` (jsonb array)
  - `created_at` (timestamptz)

  ### 7. `idea_simulations`
  Speculative research idea simulations
  - `id` (uuid, PK)
  - `workspace_id` (uuid, FK)
  - `user_id` (uuid, FK to profiles)
  - `query` (text)
  - `hypothesis` (text)
  - `feasibility_score` (float)
  - `risks` (jsonb array)
  - `unknowns` (jsonb array)
  - `supporting_concepts` (jsonb)
  - `created_at` (timestamptz)

  ### 8. `impact_predictions`
  Predictive analysis of research impact
  - `id` (uuid, PK)
  - `workspace_id` (uuid, FK)
  - `high_growth_topics` (jsonb array)
  - `declining_topics` (jsonb array)
  - `fusion_opportunities` (jsonb array)
  - `prediction_metadata` (jsonb)
  - `created_at` (timestamptz)

  ### 9. `research_briefs`
  Auto-generated research proposal briefs
  - `id` (uuid, PK)
  - `workspace_id` (uuid, FK)
  - `user_id` (uuid, FK)
  - `title` (text)
  - `literature_review` (text)
  - `research_gaps` (text)
  - `problem_statement` (text)
  - `methodology` (text)
  - `expected_contributions` (text)
  - `created_at` (timestamptz)

  ### 10. `knowledge_graph_entities`
  Entities extracted from papers for knowledge graph
  - `id` (uuid, PK)
  - `workspace_id` (uuid, FK)
  - `entity_type` (text: author, method, concept, etc.)
  - `name` (text)
  - `properties` (jsonb)
  - `paper_ids` (uuid[] array)
  - `created_at` (timestamptz)

  ### 11. `knowledge_graph_relationships`
  Relationships between entities in knowledge graph
  - `id` (uuid, PK)
  - `workspace_id` (uuid, FK)
  - `source_entity_id` (uuid, FK)
  - `target_entity_id` (uuid, FK)
  - `relationship_type` (text)
  - `strength` (float)
  - `metadata` (jsonb)
  - `created_at` (timestamptz)

  ## Security
  - RLS enabled on all tables
  - Users can only access their own data
  - Workspace-based access control
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email text NOT NULL,
  full_name text,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Create workspaces table
CREATE TABLE IF NOT EXISTS workspaces (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own workspaces"
  ON workspaces FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own workspaces"
  ON workspaces FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own workspaces"
  ON workspaces FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own workspaces"
  ON workspaces FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create papers table
CREATE TABLE IF NOT EXISTS papers (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  title text NOT NULL,
  authors jsonb DEFAULT '[]'::jsonb,
  abstract text DEFAULT '',
  content text DEFAULT '',
  publication_date date,
  doi text,
  url text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE papers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view papers in own workspaces"
  ON papers FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workspaces
      WHERE workspaces.id = papers.workspace_id
      AND workspaces.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert papers in own workspaces"
  ON papers FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM workspaces
      WHERE workspaces.id = papers.workspace_id
      AND workspaces.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update papers in own workspaces"
  ON papers FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workspaces
      WHERE workspaces.id = papers.workspace_id
      AND workspaces.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM workspaces
      WHERE workspaces.id = papers.workspace_id
      AND workspaces.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete papers in own workspaces"
  ON papers FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workspaces
      WHERE workspaces.id = papers.workspace_id
      AND workspaces.user_id = auth.uid()
    )
  );

-- Create research_gaps table
CREATE TABLE IF NOT EXISTS research_gaps (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  gap_description text NOT NULL,
  confidence_score float DEFAULT 0,
  novelty_score float DEFAULT 0,
  suggested_questions jsonb DEFAULT '[]'::jsonb,
  supporting_evidence jsonb DEFAULT '{}'::jsonb,
  related_papers uuid[] DEFAULT ARRAY[]::uuid[],
  created_at timestamptz DEFAULT now()
);

ALTER TABLE research_gaps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view gaps in own workspaces"
  ON research_gaps FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workspaces
      WHERE workspaces.id = research_gaps.workspace_id
      AND workspaces.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert gaps in own workspaces"
  ON research_gaps FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM workspaces
      WHERE workspaces.id = research_gaps.workspace_id
      AND workspaces.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete gaps in own workspaces"
  ON research_gaps FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workspaces
      WHERE workspaces.id = research_gaps.workspace_id
      AND workspaces.user_id = auth.uid()
    )
  );

-- Create contradictions table
CREATE TABLE IF NOT EXISTS contradictions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  claim_a text NOT NULL,
  claim_b text NOT NULL,
  paper_a_id uuid REFERENCES papers(id) ON DELETE CASCADE,
  paper_b_id uuid REFERENCES papers(id) ON DELETE CASCADE,
  contradiction_type text DEFAULT 'methodological',
  confidence_score float DEFAULT 0,
  supporting_evidence jsonb DEFAULT '{}'::jsonb,
  possible_reasons jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE contradictions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view contradictions in own workspaces"
  ON contradictions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workspaces
      WHERE workspaces.id = contradictions.workspace_id
      AND workspaces.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert contradictions in own workspaces"
  ON contradictions FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM workspaces
      WHERE workspaces.id = contradictions.workspace_id
      AND workspaces.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete contradictions in own workspaces"
  ON contradictions FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workspaces
      WHERE workspaces.id = contradictions.workspace_id
      AND workspaces.user_id = auth.uid()
    )
  );

-- Create evolution_timelines table
CREATE TABLE IF NOT EXISTS evolution_timelines (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  topic text NOT NULL,
  timeline_data jsonb DEFAULT '[]'::jsonb,
  paradigm_shifts jsonb DEFAULT '[]'::jsonb,
  foundational_papers uuid[] DEFAULT ARRAY[]::uuid[],
  emerging_trends jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE evolution_timelines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view timelines in own workspaces"
  ON evolution_timelines FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workspaces
      WHERE workspaces.id = evolution_timelines.workspace_id
      AND workspaces.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert timelines in own workspaces"
  ON evolution_timelines FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM workspaces
      WHERE workspaces.id = evolution_timelines.workspace_id
      AND workspaces.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete timelines in own workspaces"
  ON evolution_timelines FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workspaces
      WHERE workspaces.id = evolution_timelines.workspace_id
      AND workspaces.user_id = auth.uid()
    )
  );

-- Create idea_simulations table
CREATE TABLE IF NOT EXISTS idea_simulations (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  query text NOT NULL,
  hypothesis text DEFAULT '',
  feasibility_score float DEFAULT 0,
  risks jsonb DEFAULT '[]'::jsonb,
  unknowns jsonb DEFAULT '[]'::jsonb,
  supporting_concepts jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE idea_simulations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own simulations"
  ON idea_simulations FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own simulations"
  ON idea_simulations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own simulations"
  ON idea_simulations FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create impact_predictions table
CREATE TABLE IF NOT EXISTS impact_predictions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  high_growth_topics jsonb DEFAULT '[]'::jsonb,
  declining_topics jsonb DEFAULT '[]'::jsonb,
  fusion_opportunities jsonb DEFAULT '[]'::jsonb,
  prediction_metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE impact_predictions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view predictions in own workspaces"
  ON impact_predictions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workspaces
      WHERE workspaces.id = impact_predictions.workspace_id
      AND workspaces.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert predictions in own workspaces"
  ON impact_predictions FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM workspaces
      WHERE workspaces.id = impact_predictions.workspace_id
      AND workspaces.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete predictions in own workspaces"
  ON impact_predictions FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workspaces
      WHERE workspaces.id = impact_predictions.workspace_id
      AND workspaces.user_id = auth.uid()
    )
  );

-- Create research_briefs table
CREATE TABLE IF NOT EXISTS research_briefs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  literature_review text DEFAULT '',
  research_gaps text DEFAULT '',
  problem_statement text DEFAULT '',
  methodology text DEFAULT '',
  expected_contributions text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE research_briefs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own briefs"
  ON research_briefs FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own briefs"
  ON research_briefs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own briefs"
  ON research_briefs FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own briefs"
  ON research_briefs FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create knowledge_graph_entities table
CREATE TABLE IF NOT EXISTS knowledge_graph_entities (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  entity_type text NOT NULL,
  name text NOT NULL,
  properties jsonb DEFAULT '{}'::jsonb,
  paper_ids uuid[] DEFAULT ARRAY[]::uuid[],
  created_at timestamptz DEFAULT now()
);

ALTER TABLE knowledge_graph_entities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view entities in own workspaces"
  ON knowledge_graph_entities FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workspaces
      WHERE workspaces.id = knowledge_graph_entities.workspace_id
      AND workspaces.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert entities in own workspaces"
  ON knowledge_graph_entities FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM workspaces
      WHERE workspaces.id = knowledge_graph_entities.workspace_id
      AND workspaces.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete entities in own workspaces"
  ON knowledge_graph_entities FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workspaces
      WHERE workspaces.id = knowledge_graph_entities.workspace_id
      AND workspaces.user_id = auth.uid()
    )
  );

-- Create knowledge_graph_relationships table
CREATE TABLE IF NOT EXISTS knowledge_graph_relationships (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  source_entity_id uuid NOT NULL REFERENCES knowledge_graph_entities(id) ON DELETE CASCADE,
  target_entity_id uuid NOT NULL REFERENCES knowledge_graph_entities(id) ON DELETE CASCADE,
  relationship_type text NOT NULL,
  strength float DEFAULT 0.5,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE knowledge_graph_relationships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view relationships in own workspaces"
  ON knowledge_graph_relationships FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workspaces
      WHERE workspaces.id = knowledge_graph_relationships.workspace_id
      AND workspaces.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert relationships in own workspaces"
  ON knowledge_graph_relationships FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM workspaces
      WHERE workspaces.id = knowledge_graph_relationships.workspace_id
      AND workspaces.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete relationships in own workspaces"
  ON knowledge_graph_relationships FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workspaces
      WHERE workspaces.id = knowledge_graph_relationships.workspace_id
      AND workspaces.user_id = auth.uid()
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_workspaces_user_id ON workspaces(user_id);
CREATE INDEX IF NOT EXISTS idx_papers_workspace_id ON papers(workspace_id);
CREATE INDEX IF NOT EXISTS idx_papers_publication_date ON papers(publication_date);
CREATE INDEX IF NOT EXISTS idx_research_gaps_workspace_id ON research_gaps(workspace_id);
CREATE INDEX IF NOT EXISTS idx_contradictions_workspace_id ON contradictions(workspace_id);
CREATE INDEX IF NOT EXISTS idx_evolution_timelines_workspace_id ON evolution_timelines(workspace_id);
CREATE INDEX IF NOT EXISTS idx_idea_simulations_workspace_id ON idea_simulations(workspace_id);
CREATE INDEX IF NOT EXISTS idx_impact_predictions_workspace_id ON impact_predictions(workspace_id);
CREATE INDEX IF NOT EXISTS idx_research_briefs_workspace_id ON research_briefs(workspace_id);
CREATE INDEX IF NOT EXISTS idx_kg_entities_workspace_id ON knowledge_graph_entities(workspace_id);
CREATE INDEX IF NOT EXISTS idx_kg_relationships_workspace_id ON knowledge_graph_relationships(workspace_id);
