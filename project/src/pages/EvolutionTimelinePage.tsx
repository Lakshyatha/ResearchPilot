import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { TrendingUp, Sparkles, Calendar } from 'lucide-react';

interface Workspace {
  id: string;
  name: string;
}

interface EvolutionTimeline {
  id: string;
  topic: string;
  timeline_data: Array<{
    year: number;
    title: string;
    impact: string;
  }>;
  paradigm_shifts: Array<{
    year: number;
    description: string;
  }>;
  emerging_trends: Array<{
    trend: string;
    strength: number;
  }>;
  created_at: string;
}

export function EvolutionTimelinePage() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [selectedWorkspace, setSelectedWorkspace] = useState<string>('');
  const [timelines, setTimelines] = useState<EvolutionTimeline[]>([]);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    loadWorkspaces();
  }, []);

  useEffect(() => {
    if (selectedWorkspace) {
      loadTimelines();
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

  const loadTimelines = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('evolution_timelines')
      .select('*')
      .eq('workspace_id', selectedWorkspace)
      .order('created_at', { ascending: false });

    if (data) {
      setTimelines(data);
    }
    setLoading(false);
  };

  const analyzeEvolution = async () => {
    if (!selectedWorkspace) return;

    setAnalyzing(true);

    const { data: papers } = await supabase
      .from('papers')
      .select('*')
      .eq('workspace_id', selectedWorkspace);

    if (papers && papers.length > 0) {
      const mockTimeline = {
        workspace_id: selectedWorkspace,
        topic: 'Research Domain Evolution',
        timeline_data: [
          { year: 2018, title: 'Foundational Methods', impact: 'Established core theoretical framework' },
          { year: 2019, title: 'First Applications', impact: 'Initial practical implementations demonstrated' },
          { year: 2020, title: 'Methodology Refinement', impact: 'Improved techniques and validation methods' },
          { year: 2021, title: 'Interdisciplinary Integration', impact: 'Cross-domain applications emerged' },
          { year: 2022, title: 'Scalability Focus', impact: 'Large-scale deployments and optimizations' },
          { year: 2023, title: 'Current Frontier', impact: 'Advanced techniques and novel applications' }
        ],
        paradigm_shifts: [
          { year: 2020, description: 'Shift from purely theoretical to applied research focus' },
          { year: 2022, description: 'Integration of interdisciplinary methodologies became standard' }
        ],
        emerging_trends: [
          { trend: 'AI-assisted research methodologies', strength: 0.92 },
          { trend: 'Cross-domain knowledge transfer', strength: 0.85 },
          { trend: 'Automated validation frameworks', strength: 0.78 },
          { trend: 'Real-time collaborative research', strength: 0.71 }
        ],
        foundational_papers: papers.slice(0, 3).map(p => p.id)
      };

      await supabase.from('evolution_timelines').insert(mockTimeline);
      loadTimelines();
    }

    setAnalyzing(false);
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Research Evolution Timeline</h2>
        <p className="text-gray-600">
          Track how research ideas evolved over time, identify paradigm shifts, and discover emerging trends
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
        onClick={analyzeEvolution}
        disabled={!selectedWorkspace || analyzing}
        className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-6"
      >
        <Sparkles className="w-5 h-5" />
        {analyzing ? 'Analyzing...' : 'Analyze Evolution'}
      </button>

      {loading ? (
        <div className="text-center py-12">Loading timelines...</div>
      ) : timelines.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p>No evolution timeline yet</p>
          <p className="text-sm mt-2">Click "Analyze Evolution" to generate timeline</p>
        </div>
      ) : (
        <div className="space-y-8">
          {timelines.map((timeline) => (
            <div key={timeline.id} className="space-y-6">
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg">
                <h3 className="text-xl font-bold text-gray-800 mb-2">{timeline.topic}</h3>
                <p className="text-gray-600">Temporal analysis of research progression</p>
              </div>

              <div>
                <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  Timeline Evolution
                </h4>
                <div className="relative">
                  <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-blue-200"></div>
                  <div className="space-y-6 ml-12">
                    {timeline.timeline_data.map((event, index) => (
                      <div key={index} className="relative">
                        <div className="absolute -left-[3.25rem] top-2 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                          {index + 1}
                        </div>
                        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-lg font-bold text-blue-600">{event.year}</span>
                            <span className="text-gray-400">•</span>
                            <span className="font-semibold text-gray-800">{event.title}</span>
                          </div>
                          <p className="text-gray-600">{event.impact}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 p-6 rounded-lg">
                <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-yellow-600" />
                  Paradigm Shifts
                </h4>
                <div className="space-y-3">
                  {timeline.paradigm_shifts.map((shift, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <span className="font-bold text-yellow-600 text-lg">{shift.year}</span>
                      <p className="text-gray-700 flex-1">{shift.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  Emerging Trends
                </h4>
                <div className="space-y-3">
                  {timeline.emerging_trends.map((trend, index) => (
                    <div key={index} className="bg-white p-4 rounded-lg border border-gray-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-800">{trend.trend}</span>
                        <span className="text-sm text-purple-600 font-semibold">
                          {(trend.strength * 100).toFixed(0)}% strength
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-purple-600 h-2 rounded-full"
                          style={{ width: `${trend.strength * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
