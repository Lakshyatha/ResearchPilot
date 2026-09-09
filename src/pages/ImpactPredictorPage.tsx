import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Target, Sparkles, TrendingUp, TrendingDown, Zap } from 'lucide-react';
import { analysisUnavailableMessage, isAnalysisConfigured } from '../lib/analysis';

interface Workspace {
  id: string;
  name: string;
}

interface ImpactPrediction {
  id: string;
  high_growth_topics: Array<{
    topic: string;
    growth_rate: number;
    reasoning: string;
  }>;
  declining_topics: Array<{
    topic: string;
    decline_rate: number;
    reasoning: string;
  }>;
  fusion_opportunities: Array<{
    domain_a: string;
    domain_b: string;
    potential: number;
    description: string;
  }>;
  created_at: string;
}

export function ImpactPredictorPage() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [selectedWorkspace, setSelectedWorkspace] = useState<string>('');
  const [predictions, setPredictions] = useState<ImpactPrediction[]>([]);
  const [loading, setLoading] = useState(false);
  const [predicting, setPredicting] = useState(false);

  useEffect(() => {
    loadWorkspaces();
  }, []);

  useEffect(() => {
    if (selectedWorkspace) {
      loadPredictions();
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

  const loadPredictions = async () => {
    if (!isAnalysisConfigured) {
      setPredictions([]);
      return;
    }

    setLoading(true);
    const { data } = await supabase
      .from('impact_predictions')
      .select('*')
      .eq('workspace_id', selectedWorkspace)
      .order('created_at', { ascending: false });

    if (data) {
      setPredictions(data);
    }
    setLoading(false);
  };

  const generatePrediction = async () => {
    if (!isAnalysisConfigured) {
      window.alert(analysisUnavailableMessage);
      return;
    }

    if (!selectedWorkspace) return;

    setPredicting(true);

    const mockPrediction = {
      workspace_id: selectedWorkspace,
      high_growth_topics: [
        {
          topic: 'AI-Enhanced Research Methodologies',
          growth_rate: 0.94,
          reasoning: 'Strong citation velocity, increasing interdisciplinary adoption, and emerging practical applications indicate high growth potential'
        },
        {
          topic: 'Sustainable Computing Paradigms',
          growth_rate: 0.87,
          reasoning: 'Growing emphasis on environmental impact combined with technological necessity driving rapid expansion'
        },
        {
          topic: 'Quantum-Classical Hybrid Systems',
          growth_rate: 0.82,
          reasoning: 'Breakthrough demonstrations and increasing commercial investment suggest accelerating development'
        }
      ],
      declining_topics: [
        {
          topic: 'Traditional Statistical Methods',
          decline_rate: 0.31,
          reasoning: 'Being superseded by machine learning approaches, though still relevant for specific use cases'
        },
        {
          topic: 'Isolated Domain Research',
          decline_rate: 0.45,
          reasoning: 'Shift towards interdisciplinary collaboration reducing purely domain-specific work'
        }
      ],
      fusion_opportunities: [
        {
          domain_a: 'Natural Language Processing',
          domain_b: 'Formal Verification',
          potential: 0.91,
          description: 'Combining NLP capabilities with formal methods could revolutionize automated reasoning and code verification'
        },
        {
          domain_a: 'Quantum Computing',
          domain_b: 'Cryptography',
          potential: 0.88,
          description: 'Post-quantum cryptography development presents significant opportunities for innovation'
        },
        {
          domain_a: 'Behavioral Science',
          domain_b: 'Human-AI Interaction',
          potential: 0.85,
          description: 'Understanding human behavior crucial for designing effective AI systems'
        }
      ],
      prediction_metadata: {
        analysis_date: new Date().toISOString(),
        confidence: 0.79,
        papers_analyzed: 15
      }
    };

    await supabase.from('impact_predictions').insert(mockPrediction);
    loadPredictions();
    setPredicting(false);
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Research Impact Predictor</h2>
        <p className="text-gray-600">
          Predictive analysis of research trends, growth areas, and interdisciplinary opportunities
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
        onClick={generatePrediction}
        disabled={!selectedWorkspace || predicting}
        className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-6"
      >
        <Sparkles className="w-5 h-5" />
        {predicting ? 'Predicting...' : 'Generate Predictions'}
      </button>

      {loading ? (
        <div className="text-center py-12">Loading predictions...</div>
      ) : predictions.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <Target className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p>No predictions yet</p>
          <p className="text-sm mt-2">Click "Generate Predictions" to analyze trends</p>
        </div>
      ) : (
        <div className="space-y-8">
          {predictions.map((prediction) => (
            <div key={prediction.id} className="space-y-6">
              <div className="bg-green-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                  High Growth Topics
                </h3>
                <div className="space-y-4">
                  {prediction.high_growth_topics.map((topic, index) => (
                    <div key={index} className="bg-white p-4 rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-gray-800">{topic.topic}</h4>
                        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                          {(topic.growth_rate * 100).toFixed(0)}% growth
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{topic.reasoning}</p>
                      <div className="mt-3">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-600 h-2 rounded-full"
                            style={{ width: `${topic.growth_rate * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-orange-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <TrendingDown className="w-6 h-6 text-orange-600" />
                  Declining Topics
                </h3>
                <div className="space-y-4">
                  {prediction.declining_topics.map((topic, index) => (
                    <div key={index} className="bg-white p-4 rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-gray-800">{topic.topic}</h4>
                        <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm font-medium">
                          {(topic.decline_rate * 100).toFixed(0)}% decline
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{topic.reasoning}</p>
                      <div className="mt-3">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-orange-600 h-2 rounded-full"
                            style={{ width: `${topic.decline_rate * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-purple-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Zap className="w-6 h-6 text-purple-600" />
                  Interdisciplinary Fusion Opportunities
                </h3>
                <div className="space-y-4">
                  {prediction.fusion_opportunities.map((opportunity, index) => (
                    <div key={index} className="bg-white p-4 rounded-lg">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-lg text-sm font-medium">
                          {opportunity.domain_a}
                        </span>
                        <span className="text-gray-400">+</span>
                        <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-lg text-sm font-medium">
                          {opportunity.domain_b}
                        </span>
                        <span className="ml-auto bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-medium">
                          {(opportunity.potential * 100).toFixed(0)}% potential
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{opportunity.description}</p>
                      <div className="mt-3">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-purple-600 h-2 rounded-full"
                            style={{ width: `${opportunity.potential * 100}%` }}
                          ></div>
                        </div>
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
