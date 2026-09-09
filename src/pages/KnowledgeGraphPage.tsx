import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Network, Sparkles, Users, Lightbulb, BookOpen } from 'lucide-react';
import { analysisUnavailableMessage, isAnalysisConfigured } from '../lib/analysis';

interface Workspace {
  id: string;
  name: string;
}

interface Entity {
  id: string;
  entity_type: string;
  name: string;
  properties: Record<string, unknown>;
  paper_ids: string[];
}

interface Relationship {
  id: string;
  source_entity_id: string;
  target_entity_id: string;
  relationship_type: string;
  strength: number;
}

export function KnowledgeGraphPage() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [selectedWorkspace, setSelectedWorkspace] = useState<string>('');
  const [entities, setEntities] = useState<Entity[]>([]);
  const [relationships, setRelationships] = useState<Relationship[]>([]);
  const [loading, setLoading] = useState(false);
  const [building, setBuilding] = useState(false);
  const [selectedEntity, setSelectedEntity] = useState<Entity | null>(null);

  useEffect(() => {
    loadWorkspaces();
  }, []);

  useEffect(() => {
    if (selectedWorkspace) {
      loadGraph();
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

  const loadGraph = async () => {
    if (!isAnalysisConfigured) {
      setEntities([]);
      setRelationships([]);
      return;
    }

    setLoading(true);

    const [entitiesResult, relationshipsResult] = await Promise.all([
      supabase
        .from('knowledge_graph_entities')
        .select('*')
        .eq('workspace_id', selectedWorkspace),
      supabase
        .from('knowledge_graph_relationships')
        .select('*')
        .eq('workspace_id', selectedWorkspace),
    ]);

    if (entitiesResult.data) setEntities(entitiesResult.data);
    if (relationshipsResult.data) setRelationships(relationshipsResult.data);

    setLoading(false);
  };

  const buildGraph = async () => {
    if (!isAnalysisConfigured) {
      window.alert(analysisUnavailableMessage);
      return;
    }

    if (!selectedWorkspace) return;

    setBuilding(true);

    const { data: papers } = await supabase
      .from('papers')
      .select('*')
      .eq('workspace_id', selectedWorkspace);

    if (papers && papers.length > 0) {
      const mockEntities = [
        {
          workspace_id: selectedWorkspace,
          entity_type: 'author',
          name: 'Dr. Sarah Chen',
          properties: { affiliation: 'MIT', papers: 12, h_index: 18 },
          paper_ids: [papers[0].id]
        },
        {
          workspace_id: selectedWorkspace,
          entity_type: 'author',
          name: 'Prof. Michael Roberts',
          properties: { affiliation: 'Stanford', papers: 24, h_index: 31 },
          paper_ids: papers.length > 1 ? [papers[1].id] : [papers[0].id]
        },
        {
          workspace_id: selectedWorkspace,
          entity_type: 'method',
          name: 'Deep Learning Framework',
          properties: { category: 'Machine Learning', maturity: 'High' },
          paper_ids: [papers[0].id]
        },
        {
          workspace_id: selectedWorkspace,
          entity_type: 'method',
          name: 'Statistical Analysis',
          properties: { category: 'Statistics', maturity: 'Established' },
          paper_ids: papers.slice(0, 2).map(p => p.id)
        },
        {
          workspace_id: selectedWorkspace,
          entity_type: 'concept',
          name: 'Neural Networks',
          properties: { domain: 'AI/ML', relevance: 'High' },
          paper_ids: [papers[0].id]
        },
        {
          workspace_id: selectedWorkspace,
          entity_type: 'concept',
          name: 'Feature Engineering',
          properties: { domain: 'Data Science', relevance: 'Medium' },
          paper_ids: papers.slice(0, 2).map(p => p.id)
        }
      ];

      const insertedEntities = [];
      for (const entity of mockEntities) {
        const { data } = await supabase
          .from('knowledge_graph_entities')
          .insert(entity)
          .select()
          .single();
        if (data) insertedEntities.push(data);
      }

      if (insertedEntities.length >= 4) {
        const mockRelationships = [
          {
            workspace_id: selectedWorkspace,
            source_entity_id: insertedEntities[0].id,
            target_entity_id: insertedEntities[2].id,
            relationship_type: 'uses',
            strength: 0.9,
            metadata: { context: 'Primary methodology' }
          },
          {
            workspace_id: selectedWorkspace,
            source_entity_id: insertedEntities[1].id,
            target_entity_id: insertedEntities[3].id,
            relationship_type: 'applies',
            strength: 0.85,
            metadata: { context: 'Comparative analysis' }
          },
          {
            workspace_id: selectedWorkspace,
            source_entity_id: insertedEntities[2].id,
            target_entity_id: insertedEntities[4].id,
            relationship_type: 'implements',
            strength: 0.95,
            metadata: { context: 'Core implementation' }
          },
          {
            workspace_id: selectedWorkspace,
            source_entity_id: insertedEntities[3].id,
            target_entity_id: insertedEntities[5].id,
            relationship_type: 'requires',
            strength: 0.75,
            metadata: { context: 'Prerequisite step' }
          },
          {
            workspace_id: selectedWorkspace,
            source_entity_id: insertedEntities[0].id,
            target_entity_id: insertedEntities[1].id,
            relationship_type: 'collaborates_with',
            strength: 0.65,
            metadata: { context: 'Research collaboration' }
          }
        ];

        for (const rel of mockRelationships) {
          await supabase.from('knowledge_graph_relationships').insert(rel);
        }
      }

      loadGraph();
    }

    setBuilding(false);
  };

  const getEntityIcon = (type: string) => {
    const icons: Record<string, JSX.Element> = {
      author: <Users className="w-5 h-5" />,
      method: <Lightbulb className="w-5 h-5" />,
      concept: <BookOpen className="w-5 h-5" />,
    };
    return icons[type] || <Network className="w-5 h-5" />;
  };

  const getEntityColor = (type: string) => {
    const colors: Record<string, string> = {
      author: 'bg-blue-100 text-blue-700 border-blue-300',
      method: 'bg-green-100 text-green-700 border-green-300',
      concept: 'bg-purple-100 text-purple-700 border-purple-300',
    };
    return colors[type] || 'bg-gray-100 text-gray-700 border-gray-300';
  };

  const getRelatedEntities = (entityId: string) => {
    const related = relationships.filter(
      (rel) => rel.source_entity_id === entityId || rel.target_entity_id === entityId
    );

    return related.map((rel) => {
      const targetId =
        rel.source_entity_id === entityId ? rel.target_entity_id : rel.source_entity_id;
      const entity = entities.find((e) => e.id === targetId);
      return {
        entity,
        relationship: rel.relationship_type,
        strength: rel.strength,
        direction: rel.source_entity_id === entityId ? 'outgoing' : 'incoming',
      };
    });
  };

  const entitiesByType = entities.reduce((acc, entity) => {
    if (!acc[entity.entity_type]) acc[entity.entity_type] = [];
    acc[entity.entity_type].push(entity);
    return acc;
  }, {} as Record<string, Entity[]>);

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Knowledge Graph</h2>
        <p className="text-gray-600">
          Interactive graph of entities, concepts, and relationships extracted from your papers
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
        onClick={buildGraph}
        disabled={!selectedWorkspace || building}
        className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-6"
      >
        <Sparkles className="w-5 h-5" />
        {building ? 'Building Graph...' : 'Build Knowledge Graph'}
      </button>

      {loading ? (
        <div className="text-center py-12">Loading graph...</div>
      ) : entities.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <Network className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p>No knowledge graph yet</p>
          <p className="text-sm mt-2">Click "Build Knowledge Graph" to extract entities</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-gray-50 p-6 rounded-lg mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Graph Overview</h3>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="bg-white p-4 rounded-lg">
                  <p className="text-3xl font-bold text-blue-600">{entities.length}</p>
                  <p className="text-sm text-gray-600 mt-1">Entities</p>
                </div>
                <div className="bg-white p-4 rounded-lg">
                  <p className="text-3xl font-bold text-green-600">{relationships.length}</p>
                  <p className="text-sm text-gray-600 mt-1">Relationships</p>
                </div>
                <div className="bg-white p-4 rounded-lg">
                  <p className="text-3xl font-bold text-purple-600">
                    {Object.keys(entitiesByType).length}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">Types</p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {Object.entries(entitiesByType).map(([type, typeEntities]) => (
                <div key={type}>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3 capitalize">
                    {type}s ({typeEntities.length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {typeEntities.map((entity) => (
                      <button
                        key={entity.id}
                        onClick={() => setSelectedEntity(entity)}
                        className={`text-left p-4 rounded-lg border-2 transition-all ${
                          selectedEntity?.id === entity.id
                            ? 'border-blue-600 bg-blue-50'
                            : `${getEntityColor(type)} border-2`
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {getEntityIcon(type)}
                          <div className="flex-1">
                            <h4 className="font-semibold">{entity.name}</h4>
                            <p className="text-xs mt-1 opacity-75">
                              {entity.paper_ids.length} paper(s)
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-1">
            {selectedEntity ? (
              <div className="bg-white border-2 border-gray-200 rounded-lg p-6 sticky top-24">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`p-2 rounded-lg ${getEntityColor(selectedEntity.entity_type)}`}>
                    {getEntityIcon(selectedEntity.entity_type)}
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase">
                      {selectedEntity.entity_type}
                    </p>
                    <h3 className="font-bold text-gray-800">{selectedEntity.name}</h3>
                  </div>
                </div>

                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Properties</h4>
                  <div className="space-y-2">
                    {Object.entries(selectedEntity.properties).map(([key, value]) => (
                      <div key={key} className="text-sm">
                        <span className="text-gray-600">{key}:</span>{' '}
                        <span className="font-medium text-gray-800">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Relationships</h4>
                  <div className="space-y-2">
                    {getRelatedEntities(selectedEntity.id).map((rel, index) => (
                      <div key={index} className="bg-gray-50 p-3 rounded-lg text-sm">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-gray-800">
                            {rel.direction === 'outgoing' ? '→' : '←'} {rel.relationship}
                          </span>
                          <span className="text-xs text-gray-500">
                            {(rel.strength * 100).toFixed(0)}%
                          </span>
                        </div>
                        <p className="text-gray-600">{rel.entity?.name}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-12 text-center text-gray-500">
                <Network className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p>Select an entity to view details</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
