import React, { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';
import { 
    ArrowLeft, 
    Users, 
    CircleCheckBig, 
    CircleX,
    GitBranch,
    Eye,
    EyeOff,
    CheckCircle,
    XCircle,
    Edit3,
    Clock,
    User
} from 'lucide-react';
import { toast } from 'react-toastify';

interface Idea {
    id: number;
    idea_title: string;
    slug: string;
    abstract: string;
    problem_statement: string;
    proposed_solution: string;
    cost_benefit_analysis: string;
    declaration_of_interests: string;
    original_idea_disclaimer: boolean;
    collaboration_enabled: boolean;
    team_effort: boolean;
    comments_enabled: boolean;
    collaboration_deadline: string | null;
    thematic_area: {
        id: number;
        name: string;
    } | null;
    user: {
        id: number;
        name: string;
    };
}

interface CollaborationProposal {
    id: number;
    collaborator: {
        id: number;
        name: string;
    };
    proposed_idea_title: string | null;
    proposed_thematic_area_id: number | null;
    proposed_abstract: string | null;
    proposed_problem_statement: string | null;
    proposed_solution: string | null;
    proposed_cost_benefit_analysis: string | null;
    proposed_declaration_of_interests: string | null;
    proposed_original_idea_disclaimer: boolean;
    proposed_collaboration_enabled: boolean;
    proposed_team_effort: boolean;
    proposed_comments_enabled: boolean;
    proposed_collaboration_deadline: string | null;
    collaboration_notes: string;
    change_summary: string;
    changed_fields: string[];
    status: string;
    created_at: string;
    proposed_thematic_area: {
        id: number;
        name: string;
    } | null;
}

interface ThematicArea {
    id: number;
    name: string;
}

interface Props {
    idea: Idea;
    proposals: CollaborationProposal[];
    thematicAreas: ThematicArea[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Home',
        href: '/',
    },
    {
        title: 'Collaboration',
        href: '/collaboration',
    },
    {
        title: 'Review Proposals',
        href: '#',
    },
];

export default function Review({ idea, proposals, thematicAreas }: Props) {
    const [selectedProposal, setSelectedProposal] = useState<CollaborationProposal | null>(
        proposals.length > 0 ? proposals[0] : null
    );
    const [showComparison, setShowComparison] = useState(true);
    const [editingProposal, setEditingProposal] = useState<Record<string, any>>({});
    const [isEditing, setIsEditing] = useState(false);
    const [reviewNotes, setReviewNotes] = useState('');
    const [respondingTo, setRespondingTo] = useState<number | null>(null);

    const handleResponse = async (proposalId: number, action: 'accept' | 'reject') => {
        setRespondingTo(proposalId);
        
        try {
            const response = await fetch(`/collaboration/proposals/${proposalId}/respond`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '',
                },
                body: JSON.stringify({
                    action,
                    review_notes: reviewNotes,
                    edited_proposal: isEditing ? editingProposal : null,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                toast.success(data.message);
                // Reload the page to show updated status
                window.location.reload();
            } else {
                const error = await response.json();
                toast.error(error.message || `Failed to ${action} proposal`);
            }
        } catch (error) {
            console.error(`Error ${action}ing proposal:`, error);
            toast.error(`Failed to ${action} proposal`);
        } finally {
            setRespondingTo(null);
        }
    };

    const ComparisonField = ({ 
        label, 
        originalValue, 
        proposedValue, 
        fieldName,
        isTextarea = false, 
        rows = 4,
        type = 'text'
    }: { 
        label: string; 
        originalValue: any; 
        proposedValue: any; 
        fieldName: string;
        isTextarea?: boolean; 
        rows?: number; 
        type?: string;
    }) => {
        const hasChanged = originalValue !== proposedValue;
        const editedValue = editingProposal[fieldName] ?? proposedValue;
        
        return (
            <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {label} {hasChanged && <span className="text-yellow-600">●</span>}
                </label>
                {showComparison && (
                    <div className="grid lg:grid-cols-3 gap-4 mb-2">
                        <div className="space-y-1">
                            <span className="text-xs text-gray-500 dark:text-gray-400">Original</span>
                            {isTextarea ? (
                                <textarea
                                    value={originalValue || ''}
                                    readOnly
                                    rows={rows}
                                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 resize-none"
                                />
                            ) : (
                                <input
                                    type={type}
                                    value={originalValue || ''}
                                    readOnly
                                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                                />
                            )}
                        </div>
                        <div className="space-y-1">
                            <span className="text-xs text-blue-600 dark:text-blue-400">Proposed</span>
                            {isTextarea ? (
                                <textarea
                                    value={proposedValue || ''}
                                    readOnly
                                    rows={rows}
                                    className={`w-full px-3 py-2 rounded-xl border text-sm resize-none ${
                                        hasChanged 
                                            ? 'border-yellow-300 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-900 dark:text-yellow-100' 
                                            : 'border-gray-200 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                                    }`}
                                />
                            ) : (
                                <input
                                    type={type}
                                    value={proposedValue || ''}
                                    readOnly
                                    className={`w-full px-3 py-2 rounded-xl border text-sm ${
                                        hasChanged 
                                            ? 'border-yellow-300 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-900 dark:text-yellow-100' 
                                            : 'border-gray-200 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                                    }`}
                                />
                            )}
                        </div>
                        {isEditing && (
                            <div className="space-y-1">
                                <span className="text-xs text-green-600 dark:text-green-400">Your Edit</span>
                                {isTextarea ? (
                                    <textarea
                                        value={editedValue || ''}
                                        onChange={(e) => setEditingProposal(prev => ({ ...prev, [fieldName]: e.target.value }))}
                                        rows={rows}
                                        className="w-full px-3 py-2 rounded-xl border border-green-300 text-sm bg-green-50 dark:bg-green-900/20 text-green-900 dark:text-green-100 resize-none"
                                    />
                                ) : (
                                    <input
                                        type={type}
                                        value={editedValue || ''}
                                        onChange={(e) => setEditingProposal(prev => ({ ...prev, [fieldName]: e.target.value }))}
                                        className="w-full px-3 py-2 rounded-xl border border-green-300 text-sm bg-green-50 dark:bg-green-900/20 text-green-900 dark:text-green-100"
                                    />
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    };

    if (proposals.length === 0) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title={`Review Proposals - ${idea.idea_title}`} />
                
                <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6 bg-transparent text-[#231F20] dark:text-white transition-colors">
                    <div className="text-center py-12">
                        <GitBranch className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">
                            No pending proposals
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-500">
                            There are no collaboration proposals waiting for your review.
                        </p>
                        <Link
                            href="/collaboration"
                            className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-xl bg-[#FFF200] text-[#231F20] hover:bg-yellow-400 transition-all"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back to Collaboration
                        </Link>
                    </div>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Review Proposals - ${idea.idea_title}`} />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6 bg-transparent text-[#231F20] dark:text-white transition-colors">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <Link
                        href="/collaboration"
                        className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
                    >
                        <ArrowLeft className="h-5 w-5" />
                        Back to Collaboration
                    </Link>

                    <div className="flex items-center gap-4">
                        <button
                            type="button"
                            onClick={() => setIsEditing(!isEditing)}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
                        >
                            <Edit3 className="h-4 w-4" />
                            {isEditing ? 'Stop Editing' : 'Edit Proposal'}
                        </button>
                        
                        <button
                            type="button"
                            onClick={() => setShowComparison(!showComparison)}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
                        >
                            {showComparison ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            {showComparison ? 'Hide' : 'Show'} Comparison
                        </button>
                    </div>
                </div>

                {/* Page Title */}
                <div className="relative mb-6">
                    <h2 className="flex items-center gap-2 text-3xl md:text-4xl font-extrabold tracking-tight">
                        <GitBranch className='w-10 h-10 text-3xl md:text-4xl dark:text-[#fff200] font-black' />
                        <span className='bg-clip-text text-transparent bg-gradient-to-r from-black to-[#fff200] dark:bg-gradient-to-r dark:from-[#FFF200] dark:to-[#F8EBD5]'>
                            Review Proposals
                        </span>
                    </h2>
                    <div className='absolute -bottom-3 left-0 h-1 w-16 bg-gradient-to-r from-black to-[#fff200] dark:bg-gradient-to-r dark:from-[#FFF200] dark:to-[#F8EBD5] rounded-full animate-pulse'></div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-4">
                        Reviewing proposals for: <span className="font-semibold">"{idea.idea_title}"</span>
                    </p>
                </div>

                <div className="grid lg:grid-cols-4 gap-6">
                    {/* Proposals Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-[#F8EBD5]/30 dark:bg-[#F8EBD5]/10 backdrop-blur-lg p-4">
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                                Proposals ({proposals.length})
                            </h3>
                            <div className="space-y-2">
                                {proposals.map((proposal) => (
                                    <button
                                        key={proposal.id}
                                        onClick={() => setSelectedProposal(proposal)}
                                        className={`w-full text-left p-3 rounded-lg border transition-all ${
                                            selectedProposal?.id === proposal.id
                                                ? 'border-blue-300 bg-blue-50 dark:bg-blue-900/20'
                                                : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                                        }`}
                                    >
                                        <div className="flex items-center gap-2 mb-1">
                                            <User className="h-4 w-4 text-gray-500" />
                                            <span className="font-medium text-sm">{proposal.collaborator.name}</span>
                                        </div>
                                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                                            {proposal.change_summary}
                                        </p>
                                        <div className="flex items-center gap-2 text-xs text-gray-500">
                                            <Clock className="h-3 w-3" />
                                            {proposal.created_at}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Proposal Review */}
                    <div className="lg:col-span-3">
                        {selectedProposal && (
                            <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-[#F8EBD5]/30 dark:bg-[#F8EBD5]/10 backdrop-blur-lg p-6">
                                {/* Proposal Header */}
                                <div className="border-b border-gray-200 dark:border-gray-700 pb-4 mb-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                                Proposal by {selectedProposal.collaborator.name}
                                            </h3>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                                {selectedProposal.change_summary}
                                            </p>
                                        </div>
                                        <span className="text-xs text-gray-500">{selectedProposal.created_at}</span>
                                    </div>
                                    
                                    {selectedProposal.collaboration_notes && (
                                        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                            <p className="text-sm text-blue-900 dark:text-blue-100">
                                                <strong>Collaboration Notes:</strong> {selectedProposal.collaboration_notes}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Comparison Fields */}
                                <div className="space-y-6">
                                    <ComparisonField
                                        label="Idea Title"
                                        originalValue={idea.idea_title}
                                        proposedValue={selectedProposal.proposed_idea_title}
                                        fieldName="proposed_idea_title"
                                    />

                                    <ComparisonField
                                        label="Abstract"
                                        originalValue={idea.abstract}
                                        proposedValue={selectedProposal.proposed_abstract}
                                        fieldName="proposed_abstract"
                                        isTextarea={true}
                                    />

                                    <ComparisonField
                                        label="Problem Statement"
                                        originalValue={idea.problem_statement}
                                        proposedValue={selectedProposal.proposed_problem_statement}
                                        fieldName="proposed_problem_statement"
                                        isTextarea={true}
                                    />

                                    <ComparisonField
                                        label="Proposed Solution"
                                        originalValue={idea.proposed_solution}
                                        proposedValue={selectedProposal.proposed_solution}
                                        fieldName="proposed_solution"
                                        isTextarea={true}
                                    />

                                    <ComparisonField
                                        label="Cost Benefit Analysis"
                                        originalValue={idea.cost_benefit_analysis}
                                        proposedValue={selectedProposal.proposed_cost_benefit_analysis}
                                        fieldName="proposed_cost_benefit_analysis"
                                        isTextarea={true}
                                    />
                                </div>

                                {/* Review Notes */}
                                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Review Notes (Optional)
                                            </label>
                                            <textarea
                                                value={reviewNotes}
                                                onChange={(e) => setReviewNotes(e.target.value)}
                                                rows={3}
                                                placeholder="Add any notes about your decision..."
                                                className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                                            />
                                        </div>

                                        <div className="flex items-center justify-end gap-4">
                                            <button
                                                onClick={() => handleResponse(selectedProposal.id, 'reject')}
                                                disabled={respondingTo === selectedProposal.id}
                                                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700 transition disabled:opacity-50"
                                            >
                                                {respondingTo === selectedProposal.id ? (
                                                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                ) : (
                                                    <XCircle className="h-4 w-4" />
                                                )}
                                                Reject
                                            </button>
                                            
                                            <button
                                                onClick={() => handleResponse(selectedProposal.id, 'accept')}
                                                disabled={respondingTo === selectedProposal.id}
                                                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-600 text-white hover:bg-green-700 transition disabled:opacity-50"
                                            >
                                                {respondingTo === selectedProposal.id ? (
                                                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                ) : (
                                                    <CheckCircle className="h-4 w-4" />
                                                )}
                                                Accept{isEditing ? ' with Edits' : ''}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}