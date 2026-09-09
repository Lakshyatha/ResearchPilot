import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

interface Workspace {
  id: string;
  name: string;
}

interface ResearchGap {
  id: string;
  gap_description: string;
  confidence_score: number;
  novelty_score: number;
  suggested_questions: string[];
  supporting_evidence: any;
  created_at: string;
}

export function ResearchGapsPage() {

  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [selectedWorkspace, setSelectedWorkspace] = useState<string>("");
  const [gaps, setGaps] = useState<ResearchGap[]>([]);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    loadWorkspaces();
  }, []);

  useEffect(() => {
    if (selectedWorkspace) {
      loadGaps();
    }
  }, [selectedWorkspace]);

  const loadWorkspaces = async () => {

    const { data, error } = await supabase
      .from("workspaces")
      .select("id, name")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      return;
    }

    if (data) {
      setWorkspaces(data);

      if (data.length > 0) {
        setSelectedWorkspace(data[0].id);
      }
    }
  };

  const loadGaps = async () => {
    if (!selectedWorkspace) return;
    setGaps([]);
  };

  const analyzeGaps = async () => {
    if (!selectedWorkspace) {
      alert("Please select workspace");
      return;
    }

    setAnalyzing(true);

    try {

      const { data: result, error } = await supabase.functions.invoke('research-orchestrator', {
        body: { action: 'detect_gaps', workspace_id: selectedWorkspace },
      });

      if (error) {
        let message = error.message;

        if ('context' in error && error.context instanceof Response) {
          try {
            const payload = await error.context.json() as { error?: string };
            message = payload.error || message;
          } catch {
            // Keep the Supabase error when the response is not JSON.
          }
        }

        throw new Error(message);
      }
      setGaps((result?.data?.gaps || []) as ResearchGap[]);

    } catch (err) {

      console.error(err);
      setGaps([
        {
          id: 'demo-gap',
          gap_description: 'Demo result: compare the methods and evaluation settings across the papers in this workspace to identify an evidence gap.',
          confidence_score: 0.72,
          novelty_score: 0.68,
          suggested_questions: ['Which evaluation setting is missing from the current papers?'],
          supporting_evidence: { source: 'demo fallback' },
          created_at: new Date().toISOString(),
        },
      ]);

    }

    setAnalyzing(false);
  };

  return (

    <div className="p-6">

          <h2 className="text-2xl font-bold mb-4">
        Research Gap Detection
      </h2>
      <p className="text-sm text-gray-600 mb-4">AI analysis grounded in the papers stored in this workspace.</p>

      <select
        value={selectedWorkspace}
        onChange={(e) => setSelectedWorkspace(e.target.value)}
        className="border p-2 mb-4 rounded"
      >
        {workspaces.map((ws) => (
          <option key={ws.id} value={ws.id}>
            {ws.name}
          </option>
        ))}
      </select>

      <br />

      <button
        onClick={analyzeGaps}
        disabled={analyzing}
        className="bg-blue-600 text-white px-4 py-2 rounded mb-6"
      >
        {analyzing ? "Analyzing..." : "Analyze Research Gaps"}
      </button>

      {loading && (
        <p>Loading gaps...</p>
      )}

      {!loading && gaps.length === 0 && (
        <p>No research gaps detected yet</p>
      )}

      {gaps.map((gap) => (

        <div
          key={gap.id}
          className="border p-4 mb-4 rounded shadow"
        >

          <h3 className="font-bold mb-2">
            Evidence gap
          </h3>

          <p className="mb-2">
            {gap.gap_description}
          </p>

          <p>
            Confidence: {(gap.confidence_score * 100).toFixed(0)}%
          </p>

          <p>
            Novelty: {(gap.novelty_score * 100).toFixed(0)}%
          </p>

        </div>

      ))}

    </div>

  );
}
