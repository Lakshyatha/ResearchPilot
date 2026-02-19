import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { AlertTriangle, Sparkles } from 'lucide-react';

interface Workspace {
  id: string;
  name: string;
}

interface Contradiction {
  id: string;
  claim_a: string;
  claim_b: string;
  contradiction_type: string;
  confidence_score: number;
  possible_reasons: string[];
  created_at: string;
}

export function ContradictionsPage() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [selectedWorkspace, setSelectedWorkspace] = useState<string>('');
  const [contradictions, setContradictions] = useState<Contradiction[]>([]);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    loadWorkspaces();
  }, []);

  useEffect(() => {
    if (selectedWorkspace) {
      loadContradictions();
    }
  }, [selectedWorkspace]);

  const loadWorkspaces = async () => {
    const { data } = await supabase
      .from('workspaces')
      .select('id, name')
      .order('created_at', { ascending: false });

    if (data) {
      setWorkspaces(data);
      if (data.length > 0) {
        setSelectedWorkspace(data[0].id);
      }
    }
  };

  const loadContradictions = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('contradictions')
      .select('*')
      .eq('workspace_id', selectedWorkspace)
      .order('created_at', { ascending: false });

    if (data) {
      setContradictions(data);
    }
    setLoading(false);
  };

  const analyzeContradictions = async () => {
    if (!selectedWorkspace) return;

    setAnalyzing(true);

    const { data: papers } = await supabase
      .from('papers')
      .select('*')
      .eq('workspace_id', selectedWorkspace);

    if (papers && papers.length >= 2) {
      const mockContradictions = [
        {
          workspace_id: selectedWorkspace,
          claim_a: 'Method A shows significant improvement in accuracy',
          claim_b: 'Method A demonstrates limited effectiveness in real-world scenarios',
          paper_a_id: papers[0].id,
          paper_b_id: papers[1].id,
          contradiction_type: 'Methodological',
          confidence_score: 0.82,
          supporting_evidence: { papers: [papers[0].title, papers[1].title] },
          possible_reasons: [
            'Different experimental conditions and datasets used',
            'Varying baseline comparisons and evaluation metrics',
            'Different time periods of study affecting technological context'
          ]
        },
        {
          workspace_id: selectedWorkspace,
          claim_a: 'Theoretical framework X provides comprehensive explanation',
          claim_b: 'Theoretical framework X has significant limitations in scope',
          paper_a_id: papers[0].id,
          paper_b_id: papers[papers.length - 1].id,
          contradiction_type: 'Theoretical',
          confidence_score: 0.75,
          supporting_evidence: { papers: [papers[0].title, papers[papers.length - 1].title] },
          possible_reasons: [
            'Different application domains considered',
            'Evolution of understanding over time',
            'Complementary perspectives rather than true contradiction'
          ]
        }
      ];

      for (const contradiction of mockContradictions) {
        await supabase.from('contradictions').insert(contradiction);
      }

      loadContradictions();
    }

    setAnalyzing(false);
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      Methodological: 'bg-orange-100 text-orange-700',
      Theoretical: 'bg-purple-100 text-purple-700',
      Empirical: 'bg-blue-100 text-blue-700',
    };
    return colors[type] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Contradiction Mapping</h2>
        <p className="text-gray-600">
          Detect and analyze conflicting claims across research papers
        </p>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Select Workspace</label>
        <select
          value={selectedWorkspace}
          onChange={(e) => setSelectedWorkspace(e.target.value)}
          className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          {workspaces.map((workspace) => (
            <option key={workspace.id} value={workspace.id}>
              {workspace.name}
            </option>
          ))}
        </select>
      </div>

      <button
        onClick={analyzeContradictions}
        disabled={!selectedWorkspace || analyzing}
        className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-6"
      >
        <Sparkles className="w-5 h-5" />
        {analyzing ? 'Analyzing...' : 'Detect Contradictions'}
      </button>

      {loading ? (
        <div className="text-center py-12">Loading contradictions...</div>
      ) : contradictions.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p>No contradictions detected yet</p>
          <p className="text-sm mt-2">Click "Detect Contradictions" to start analysis</p>
        </div>
      ) : (
        <div className="space-y-6">
          {contradictions.map((contradiction, index) => (
            <div key={contradiction.id} className="border border-gray-200 rounded-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  Contradiction #{index + 1}
                </h3>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getTypeColor(contradiction.contradiction_type)}`}>
                    {contradiction.contradiction_type}
                  </span>
                  <span className="text-sm text-gray-600">
                    Confidence: {(contradiction.confidence_score * 100).toFixed(0)}%
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-red-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                    <span className="w-2 h-2 bg-red-600 rounded-full"></span>
                    Claim A
                  </h4>
                  <p className="text-gray-700">{contradiction.claim_a}</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                    Claim B
                  </h4>
                  <p className="text-gray-700">{contradiction.claim_b}</p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-800 mb-3">Possible Reasons for Discrepancy</h4>
                <ul className="space-y-2">
                  {contradiction.possible_reasons.map((reason, rIndex) => (
                    <li key={rIndex} className="flex items-start gap-2">
                      <span className="text-blue-600 font-bold mt-1">•</span>
                      <span className="text-gray-700">{reason}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
