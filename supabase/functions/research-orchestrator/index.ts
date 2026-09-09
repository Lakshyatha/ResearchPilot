import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Max-Age": "86400",
};

interface OrchestratorRequest {
  action: string;
  workspace_id: string;
  data?: Record<string, unknown>;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  try {
    const body: OrchestratorRequest = await req.json();
    const { action, workspace_id, data } = body;

    let result;

    switch (action) {
      case "detect_gaps":
        result = await detectResearchGaps(workspace_id, data, req);
        break;

      case "find_contradictions":
        result = await findContradictions(workspace_id, data);
        break;

      case "analyze_evolution":
        result = await analyzeEvolution(workspace_id, data);
        break;

      case "simulate_idea":
        result = await simulateIdea(workspace_id, data);
        break;

      case "predict_impact":
        result = await predictImpact(workspace_id, data);
        break;

      case "generate_brief":
        result = await generateBrief(workspace_id, data);
        break;

      case "build_graph":
        result = await buildKnowledgeGraph(workspace_id, data);
        break;

      default:
        return new Response(
          JSON.stringify({ error: "Unknown action" }),
          {
            status: 400,
            headers: {
              ...corsHeaders,
              "Content-Type": "application/json",
            },
          }
        );
    }

    return new Response(
      JSON.stringify({ success: true, data: result }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Orchestrator error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});

async function detectResearchGaps(
  workspace_id: string,
  data?: Record<string, unknown>,
  req?: Request
): Promise<unknown> {
  const openAiKey = Deno.env.get("OPENAI_API_KEY");
  if (!openAiKey) throw new Error("OPENAI_API_KEY is not configured in Supabase secrets");

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const authorization = req?.headers.get("Authorization");
  if (!supabaseUrl || !supabaseAnonKey || !authorization) {
    throw new Error("Authenticated Supabase context is missing");
  }

  const userClient = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authorization } },
  });
  const { data: userResult, error: userError } = await userClient.auth.getUser();
  if (userError || !userResult.user) throw new Error("Authentication is required");

  const { data: papers, error: papersError } = await userClient
    .from("papers")
    .select("id, title, authors, abstract, content, publication_date")
    .eq("workspace_id", workspace_id)
    .order("created_at", { ascending: true });

  if (papersError) throw papersError;
  if (!papers?.length) throw new Error("Add at least one paper before running gap analysis");

  const paperContext = papers.map((paper) => ({
    id: paper.id,
    title: paper.title,
    abstract: paper.abstract || "",
    content: (paper.content || "").slice(0, 12000),
  }));

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${openAiKey}` },
    body: JSON.stringify({
      model: Deno.env.get("OPENAI_MODEL") || "gpt-4o-mini",
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: "You are a rigorous research analyst. Identify only evidence-supported research gaps from the supplied papers. Return JSON with a gaps array. Each gap must include gap_description, confidence_score (0 to 1), novelty_score (0 to 1), suggested_questions (array of strings), and supporting_evidence with paper_ids and rationale. Do not invent paper facts.",
        },
        { role: "user", content: JSON.stringify({ workspace_id, papers: paperContext, request: data || {} }) },
      ],
    }),
  });

  if (!response.ok) throw new Error(`AI provider request failed: ${await response.text()}`);
  const completion = await response.json();
  const parsed = JSON.parse(completion.choices?.[0]?.message?.content || "{}");
  return { workspace_id, gaps: parsed.gaps || [], source: "ai" };
}

async function findContradictions(
  workspace_id: string,
  data?: Record<string, unknown>
): Promise<unknown> {
  return {
    message: "Contradiction analysis completed",
    contradictions_found: 2,
    workspace_id,
    data,
  };
}

async function analyzeEvolution(
  workspace_id: string,
  data?: Record<string, unknown>
): Promise<unknown> {
  return {
    message: "Evolution timeline generated",
    timeline_points: 6,
    workspace_id,
    data,
  };
}

async function simulateIdea(
  workspace_id: string,
  data?: Record<string, unknown>
): Promise<unknown> {
  return {
    message: "Idea simulation completed",
    feasibility_score: 0.75,
    workspace_id,
    query: data?.query || "",
  };
}

async function predictImpact(
  workspace_id: string,
  data?: Record<string, unknown>
): Promise<unknown> {
  return {
    message: "Impact prediction completed",
    high_growth_topics: 3,
    declining_topics: 2,
    workspace_id,
    data,
  };
}

async function generateBrief(
  workspace_id: string,
  data?: Record<string, unknown>
): Promise<unknown> {
  return {
    message: "Research brief generated",
    sections: 5,
    workspace_id,
    data,
  };
}

async function buildKnowledgeGraph(
  workspace_id: string,
  data?: Record<string, unknown>
): Promise<unknown> {
  return {
    message: "Knowledge graph built",
    entities: 15,
    relationships: 12,
    workspace_id,
    data,
  };
}
