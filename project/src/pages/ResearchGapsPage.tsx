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

    setLoading(true);

    const { data, error } = await supabase
      .from("research_gaps")
      .select("*")
      .eq("workspace_id", selectedWorkspace)
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      alert(error.message);
    } else {
      setGaps(data || []);
    }

    setLoading(false);
  };

  const analyzeGaps = async () => {

    if (!selectedWorkspace) {
      alert("Please select workspace");
      return;
    }

    setAnalyzing(true);

    try {

      const { data: papers, error } = await supabase
        .from("papers")
        .select("*")
        .eq("workspace_id", selectedWorkspace);

      if (error) {
        console.error(error);
        alert("Failed to load papers");
        setAnalyzing(false);
        return;
      }

      if (!papers || papers.length === 0) {
        alert("Please add at least one research paper first");
        setAnalyzing(false);
        return;
      }

      const mockGaps = [
        {
          workspace_id: selectedWorkspace,
          gap_description: "Lack of explainable AI models in current research",
          confidence_score: 0.85,
          novelty_score: 0.78,
          suggested_questions: [
            "How can AI models be more explainable?",
            "What techniques improve transparency?",
            "How can interpretability be measured?"
          ],
          supporting_evidence: {
            paper_count: papers.length,
            method: "semantic_analysis"
          }
        },
        {
          workspace_id: selectedWorkspace,
          gap_description: "Limited real-world deployment validation",
          confidence_score: 0.72,
          novelty_score: 0.65,
          suggested_questions: [
            "How do models perform in real-world environments?",
            "What deployment challenges exist?",
            "How can robustness be improved?"
          ],
          supporting_evidence: {
            paper_count: papers.length,
            method: "deployment_analysis"
          }
        }
      ];

      const { error: insertError } = await supabase
        .from("research_gaps")
        .insert(mockGaps);

      if (insertError) {
        console.error(insertError);
        alert(insertError.message);
        setAnalyzing(false);
        return;
      }

      await loadGaps();

      alert("Research gaps generated successfully!");

    } catch (err) {

      console.error(err);
      alert("Analysis failed");

    }

    setAnalyzing(false);
  };

  return (

    <div className="p-6">

      <h2 className="text-2xl font-bold mb-4">
        Research Gap Detection
      </h2>

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
            Research Gap
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
