import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Lightbulb, Sparkles, AlertCircle, HelpCircle } from 'lucide-react';
import { analysisUnavailableMessage, isAnalysisConfigured } from '../lib/analysis';

interface Workspace {
  id: string;
  name: string;
}

interface IdeaSimulation {
  id: string;
  query: string;
  hypothesis: string;
  feasibility_score: number;
  risks: string[];
  unknowns: string[];
  supporting_concepts: Record<string, string>;
  created_at: string;
}

export function IdeaSimulationPage() {
  const { user } = useAuth();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [selectedWorkspace, setSelectedWorkspace] = useState<string>('');
  const [simulations, setSimulations] = useState<IdeaSimulation[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [simulating, setSimulating] = useState(false);

  useEffect(() => {
    loadWorkspaces();
  }, []);

  useEffect(() => {
    if (selectedWorkspace) {
      loadSimulations();
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

  const loadSimulations = async () => {
    if (!isAnalysisConfigured) {
      setSimulations([]);
      return;
    }

    setLoading(true);
    const { data } = await supabase
      .from('idea_simulations')
      .select('*')
      .eq('workspace_id', selectedWorkspace)
      .order('created_at', { ascending: false });

    if (data) {
      setSimulations(data);
    }
    setLoading(false);
  };

  const runSimulation = async () => {
    if (!isAnalysisConfigured) {
      window.alert(analysisUnavailableMessage);
      return;
    }

    if (!selectedWorkspace || !user || !query) return;

    setSimulating(true);

    const mockSimulation = {
      workspace_id: selectedWorkspace,
      user_id: user.id,
      query: query,
      hypothesis: `Applying the proposed methodology could yield significant improvements by leveraging existing frameworks in novel ways. The integration of ${query.toLowerCase()} concepts with current research paradigms presents opportunities for breakthrough discoveries.`,
      feasibility_score: 0.73,
      risks: [
        'Methodological challenges in cross-domain integration',
        'Potential scalability issues with proposed approach',
        'Limited existing empirical validation',
        'Resource requirements may be substantial'
      ],
      unknowns: [
        'Long-term stability of proposed solution',
        'Generalizability across different contexts',
        'Optimal parameter configurations',
        'Interaction effects with existing systems'
      ],
      supporting_concepts: {
        'Framework Integration': 'Combines multiple theoretical frameworks for enhanced capability',
        'Novel Application': 'Applies proven methods to unexplored domains',
        'Empirical Foundation': 'Built on established empirical findings',
        'Innovation Potential': 'High potential for novel contributions'
      }
    };

    await supabase.from('idea_simulations').insert(mockSimulation);
    setQuery('');
    loadSimulations();
    setSimulating(false);
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Idea Simulation Mode</h2>
        <p className="text-gray-600">
          Explore speculative research ideas by combining concepts across papers
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

      <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-lg mb-6">
        <h3 className="font-semibold text-gray-800 mb-4">What if...</h3>
        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Example: What happens if we apply deep learning methods to traditional statistical analysis?"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 mb-4"
          rows={3}
        />
        <button
          onClick={runSimulation}
          disabled={!selectedWorkspace || !query || simulating}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Sparkles className="w-5 h-5" />
          {simulating ? 'Simulating...' : 'Run Simulation'}
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">Loading simulations...</div>
      ) : simulations.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <Lightbulb className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p>No simulations yet</p>
          <p className="text-sm mt-2">Enter a research question to simulate ideas</p>
        </div>
      ) : (
        <div className="space-y-6">
          {simulations.map((simulation) => (
            <div key={simulation.id} className="border border-gray-200 rounded-lg p-6">
              <div className="flex items-start gap-3 mb-4">
                <Lightbulb className="w-6 h-6 text-yellow-500 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    {simulation.query}
                  </h3>
                  <div className="bg-blue-50 p-4 rounded-lg mb-4">
                    <h4 className="font-semibold text-gray-800 mb-2">Generated Hypothesis</h4>
                    <p className="text-gray-700">{simulation.hypothesis}</p>
                  </div>

                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-700">Feasibility Score</span>
                      <span className="text-lg font-bold text-blue-600">
                        {(simulation.feasibility_score * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-blue-600 h-3 rounded-full"
                        style={{ width: `${simulation.feasibility_score * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="bg-red-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-red-600" />
                        Identified Risks
                      </h4>
                      <ul className="space-y-2">
                        {simulation.risks.map((risk, index) => (
                          <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                            <span className="text-red-600 mt-1">•</span>
                            {risk}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <HelpCircle className="w-5 h-5 text-yellow-600" />
                        Unknowns
                      </h4>
                      <ul className="space-y-2">
                        {simulation.unknowns.map((unknown, index) => (
                          <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                            <span className="text-yellow-600 mt-1">•</span>
                            {unknown}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">Supporting Concepts</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {Object.entries(simulation.supporting_concepts).map(([key, value]) => (
                        <div key={key} className="bg-green-50 p-3 rounded-lg">
                          <h5 className="font-medium text-gray-800 text-sm mb-1">{key}</h5>
                          <p className="text-xs text-gray-600">{value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
