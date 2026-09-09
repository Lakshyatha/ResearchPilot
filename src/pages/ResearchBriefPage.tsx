import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { FileText, Sparkles, Download } from 'lucide-react';
import { analysisUnavailableMessage, isAnalysisConfigured } from '../lib/analysis';

interface Workspace {
  id: string;
  name: string;
}

interface ResearchBrief {
  id: string;
  title: string;
  literature_review: string;
  research_gaps: string;
  problem_statement: string;
  methodology: string;
  expected_contributions: string;
  created_at: string;
}

export function ResearchBriefPage() {
  const { user } = useAuth();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [selectedWorkspace, setSelectedWorkspace] = useState<string>('');
  const [briefs, setBriefs] = useState<ResearchBrief[]>([]);
  const [selectedBrief, setSelectedBrief] = useState<ResearchBrief | null>(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    loadWorkspaces();
  }, []);

  useEffect(() => {
    if (selectedWorkspace) {
      loadBriefs();
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

  const loadBriefs = async () => {
    if (!isAnalysisConfigured) {
      setBriefs([]);
      setSelectedBrief(null);
      return;
    }

    setLoading(true);
    const { data } = await supabase
      .from('research_briefs')
      .select('*')
      .eq('workspace_id', selectedWorkspace)
      .order('created_at', { ascending: false });

    if (data) {
      setBriefs(data);
      if (data.length > 0 && !selectedBrief) {
        setSelectedBrief(data[0]);
      }
    }
    setLoading(false);
  };

  const generateBrief = async () => {
    if (!isAnalysisConfigured) {
      window.alert(analysisUnavailableMessage);
      return;
    }

    if (!selectedWorkspace || !user) return;

    setGenerating(true);

    const { data: workspace } = await supabase
      .from('workspaces')
      .select('name')
      .eq('id', selectedWorkspace)
      .single();

    const mockBrief = {
      workspace_id: selectedWorkspace,
      user_id: user.id,
      title: `Research Proposal: ${workspace?.name || 'Untitled Research'}`,
      literature_review: `This literature review synthesizes key findings from the analyzed papers, revealing several important themes and trends in the field.

**Foundational Concepts:**
The existing literature establishes core theoretical frameworks that have shaped current understanding. Multiple studies demonstrate the evolution of methodological approaches, from traditional techniques to contemporary innovations.

**Current State:**
Recent research highlights significant advances in both theoretical understanding and practical applications. Several papers document successful implementations while acknowledging remaining challenges and limitations.

**Key Debates:**
The literature reveals ongoing discussions regarding optimal approaches, with different schools of thought proposing competing frameworks. These debates center on methodological choices, scalability concerns, and generalizability of findings.`,

      research_gaps: `Analysis of the literature reveals several significant research gaps:

1. **Methodological Integration:** Limited exploration of how different methodological approaches can be effectively combined to enhance research outcomes.

2. **Cross-Domain Applications:** Insufficient investigation of how findings from one domain translate to other contexts, particularly in emerging technological environments.

3. **Long-term Validation:** Lack of longitudinal studies examining the sustained impact and effectiveness of proposed solutions.

4. **Scalability Challenges:** Inadequate attention to practical scalability concerns when moving from controlled settings to real-world implementations.

5. **Interdisciplinary Perspectives:** Underutilization of insights from related disciplines that could enrich theoretical frameworks.`,

      problem_statement: `Despite significant advances in the field, current approaches face fundamental limitations that constrain their effectiveness and applicability. Existing methodologies, while valuable, often operate in isolation and fail to leverage potential synergies across domains.

The central problem addressed by this research is the need for integrated frameworks that can bridge methodological divides while maintaining rigor and practical applicability. This gap is particularly critical given the increasing complexity of modern research challenges and the growing importance of interdisciplinary collaboration.

This research aims to develop novel approaches that address these limitations while building upon established foundations, ultimately contributing to more robust and widely applicable solutions.`,

      methodology: `**Research Design:**
This study will employ a mixed-methods approach combining quantitative analysis with qualitative insights to provide comprehensive understanding.

**Data Collection:**
- Systematic literature review following established protocols
- Empirical validation through controlled experiments
- Case study analysis of real-world implementations

**Analysis Framework:**
- Statistical analysis using appropriate quantitative methods
- Thematic analysis of qualitative data
- Comparative evaluation across different contexts

**Validation Strategy:**
- Cross-validation with multiple datasets
- Expert review and feedback integration
- Replication studies to ensure robustness

**Implementation:**
Phased approach beginning with pilot studies, followed by scaled implementation and iterative refinement based on findings.`,

      expected_contributions: `This research is expected to make several significant contributions:

**Theoretical Contributions:**
- Novel integrated framework bridging existing methodological gaps
- Enhanced understanding of cross-domain applicability
- Refined theoretical models incorporating interdisciplinary insights

**Methodological Contributions:**
- Validated approaches for combining different research methods
- Practical guidelines for implementation and scaling
- Assessment frameworks for evaluating effectiveness

**Practical Contributions:**
- Actionable recommendations for practitioners
- Tools and resources for implementation
- Evidence-based best practices

**Scientific Impact:**
This work will advance the field by providing both theoretical depth and practical utility, enabling researchers and practitioners to address complex challenges more effectively.`
    };

    await supabase.from('research_briefs').insert(mockBrief);
    loadBriefs();
    setGenerating(false);
  };

  const exportBrief = () => {
    if (!selectedBrief) return;

    const content = `
# ${selectedBrief.title}

## Literature Review
${selectedBrief.literature_review}

## Research Gaps
${selectedBrief.research_gaps}

## Problem Statement
${selectedBrief.problem_statement}

## Proposed Methodology
${selectedBrief.methodology}

## Expected Contributions
${selectedBrief.expected_contributions}
    `;

    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedBrief.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Research Brief Generator</h2>
        <p className="text-gray-600">
          Automatically generate comprehensive research proposals from your papers
        </p>
      </div>

      <div className="mb-6 flex gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Workspace</label>
          <select
            value={selectedWorkspace}
            onChange={(e) => setSelectedWorkspace(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            {workspaces.map((workspace) => (
              <option key={workspace.id} value={workspace.id}>
                {workspace.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-end gap-2">
          <button
            onClick={generateBrief}
            disabled={!selectedWorkspace || generating}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Sparkles className="w-5 h-5" />
            {generating ? 'Generating...' : 'Generate Brief'}
          </button>
          {selectedBrief && (
            <button
              onClick={exportBrief}
              className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download className="w-5 h-5" />
              Export
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">Loading briefs...</div>
      ) : briefs.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p>No research briefs yet</p>
          <p className="text-sm mt-2">Click "Generate Brief" to create your first brief</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Your Briefs</h3>
            <div className="space-y-2">
              {briefs.map((brief) => (
                <button
                  key={brief.id}
                  onClick={() => setSelectedBrief(brief)}
                  className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                    selectedBrief?.id === brief.id
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <p className="font-medium text-gray-800 text-sm truncate">{brief.title}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(brief.created_at).toLocaleDateString()}
                  </p>
                </button>
              ))}
            </div>
          </div>

          <div className="lg:col-span-3">
            {selectedBrief && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">{selectedBrief.title}</h2>
                  <p className="text-sm text-gray-500">
                    Generated on {new Date(selectedBrief.created_at).toLocaleDateString()}
                  </p>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Literature Review</h3>
                  <div className="text-gray-700 whitespace-pre-line">
                    {selectedBrief.literature_review}
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Research Gaps</h3>
                  <div className="text-gray-700 whitespace-pre-line">
                    {selectedBrief.research_gaps}
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Problem Statement</h3>
                  <div className="text-gray-700 whitespace-pre-line">
                    {selectedBrief.problem_statement}
                  </div>
                </div>

                <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Proposed Methodology</h3>
                  <div className="text-gray-700 whitespace-pre-line">
                    {selectedBrief.methodology}
                  </div>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    Expected Contributions
                  </h3>
                  <div className="text-gray-700 whitespace-pre-line">
                    {selectedBrief.expected_contributions}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
