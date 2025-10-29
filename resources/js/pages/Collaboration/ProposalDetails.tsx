import React, { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';
import { 
    ArrowLeft, 
    GitBranch,
    Eye,
    EyeOff,
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
    User,
    FileText,
    MessageSquare
} from 'lucide-react';

interface Proposal {
    id: number;
    idea: {
        id: number;
        title: string;
        slug: string;
        abstract: string;
        problem_statement: string;
        proposed_solution: string;
        cost_benefit_analysis: string;
        declaration_of_interests: string;
        thematic_area: {
            id: number;
            name: string;
        } | null;
    };
    collaborator: {
        id: number;
        name: string;
    };
    original_author: {
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
    proposed_thematic_area: {
        id: number;
        name: string;
    } | null;
    collaboration_notes: string;
    change_summary: string;
    changed_fields: string[];
    status: string;
    review_notes: string | null;
    created_at: string;
    reviewed_at: string | null;
    reviewed_by: string | null;
}

interface ThematicArea {
    id: number;
    name: string;
}

interface Props {
    proposal: Proposal;
    thematicAreas: ThematicArea[];
    isAuthor: boolean;
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
        title: 'Proposal Details',
        href: '#',
    },
];

export default function ProposalDetails({ proposal, thematicAreas, isAuthor }: Props) {
    const [showComparison, setShowComparison] = useState(true);

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'pending':
                return <Clock className="h-5 w-5 text-yellow-500" />;
            case 'accepted':
                return <CheckCircle className="h-5 w-5 text-green-500" />;
            case 'rejected':
                return <XCircle className="h-5 w-5 text-red-500" />;
            case 'revision_requested':
                return <AlertCircle className="h-5 w-5 text-orange-500" />;
            default:
                return null;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending':
                return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30';
            case 'accepted':
                return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30';
            case 'rejected':
                return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30';
            case 'revision_requested':
                return 'text-orange-600 bg-orange-100 dark:text-orange-400 dark:bg-orange-900/30';
            default:
                return 'text-gray-600 bg-gray-100 dark:text-gray-300 dark:bg-gray-700/50';
        }
    };

    const ComparisonField = ({ 
        label, 
        originalValue, 
        proposedValue, 
        hasChanged,
        isTextarea = false, 
        rows = 4 
    }: { 
        label: string; 
        originalValue: any; 
        proposedValue: any; 
        hasChanged: boolean;
        isTextarea?: boolean; 
        rows?: number; 
    }) => (
        <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {label} {hasChanged && <span className="text-yellow-600">● Changed</span>}
            </label>
            {showComparison ? (
                <div className="grid lg:grid-cols-2 gap-4">
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
                                type="text"
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
                                value={proposedValue || originalValue || ''}
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
                                type="text"
                                value={proposedValue || originalValue || ''}
                                readOnly
                                className={`w-full px-3 py-2 rounded-xl border text-sm ${
                                    hasChanged 
                                        ? 'border-yellow-300 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-900 dark:text-yellow-100' 
                                        : 'border-gray-200 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                                }`}
                            />
                        )}
                    </div>
                </div>
            ) : (
                <div>
                    {isTextarea ? (
                        <textarea
                            value={proposedValue || originalValue || ''}
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
                            type="text"
                            value={proposedValue || originalValue || ''}
                            readOnly
                            className={`w-full px-3 py-2 rounded-xl border text-sm ${
                                hasChanged 
                                    ? 'border-yellow-300 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-900 dark:text-yellow-100' 
                                    : 'border-gray-200 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                            }`}
                        />
                    )}
                </div>
            )}
        </div>
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Proposal Details - ${proposal.idea.title}`} />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6 bg-transparent text-[#231F20] dark:text-white transition-colors">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <Link
                        href="/collaboration/my-proposals"
                        className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
                    >
                        <ArrowLeft className="h-5 w-5" />
                        Back to My Proposals
                    </Link>

                    <button
                        type="button"
                        onClick={() => setShowComparison(!showComparison)}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
                    >
                        {showComparison ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        {showComparison ? 'Hide' : 'Show'} Comparison
                    </button>
                </div>

                {/* Page Title */}
                <div className="relative mb-6">
                    <h2 className="flex items-center gap-2 text-3xl md:text-4xl font-extrabold tracking-tight">
                        <GitBranch className='w-10 h-10 text-3xl md:text-4xl dark:text-[#fff200] font-black' />
                        <span className='bg-clip-text text-transparent bg-gradient-to-r from-black to-[#fff200] dark:bg-gradient-to-r dark:from-[#FFF200] dark:to-[#F8EBD5]'>
                            Proposal Details
                        </span>
                    </h2>
                    <div className='absolute -bottom-3 left-0 h-1 w-16 bg-gradient-to-r from-black to-[#fff200] dark:bg-gradient-to-r dark:from-[#FFF200] dark:to-[#F8EBD5] rounded-full animate-pulse'></div>
                </div>

                <div className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-[#F8EBD5]/30 dark:bg-[#F8EBD5]/10 backdrop-blur-lg">
                    {/* Proposal Header */}
                    <div className="px-6 py-6 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                                    {proposal.idea.title}
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Proposal by <span className="font-medium">{proposal.collaborator.name}</span> to <span className="font-medium">{proposal.original_author.name}</span>
                                </p>
                            </div>
                            <div className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium ${getStatusColor(proposal.status)}`}>
                                {getStatusIcon(proposal.status)}
                                {proposal.status.toUpperCase().replace('_', ' ')}
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
                            <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                <span>Submitted: {proposal.created_at}</span>
                            </div>
                            {proposal.reviewed_at && (
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="h-4 w-4" />
                                    <span>Reviewed: {proposal.reviewed_at}</span>
                                </div>
                            )}
                        </div>

                        <div className="space-y-3">
                            <div>
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Change Summary:</span>
                                <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">{proposal.change_summary}</p>
                            </div>

                            {proposal.collaboration_notes && (
                                <div>
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Collaboration Notes:</span>
                                    <div className="mt-1 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                        <p className="text-sm text-blue-900 dark:text-blue-100">{proposal.collaboration_notes}</p>
                                    </div>
                                </div>
                            )}

                            {proposal.review_notes && (
                                <div>
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Review Notes:</span>
                                    <div className="mt-1 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                                        <p className="text-sm text-gray-900 dark:text-gray-100">{proposal.review_notes}</p>
                                        {proposal.reviewed_by && (
                                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">- {proposal.reviewed_by}</p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Comparison Fields */}
                    <div className="p-6 space-y-6">
                        <ComparisonField
                            label="Idea Title"
                            originalValue={proposal.idea.title}
                            proposedValue={proposal.proposed_idea_title}
                            hasChanged={proposal.changed_fields.includes('idea_title')}
                        />

                        <ComparisonField
                            label="Thematic Area"
                            originalValue={proposal.idea.thematic_area?.name}
                            proposedValue={proposal.proposed_thematic_area?.name}
                            hasChanged={proposal.changed_fields.includes('thematic_area_id')}
                        />

                        <ComparisonField
                            label="Abstract"
                            originalValue={proposal.idea.abstract}
                            proposedValue={proposal.proposed_abstract}
                            hasChanged={proposal.changed_fields.includes('abstract')}
                            isTextarea={true}
                        />

                        <ComparisonField
                            label="Problem Statement"
                            originalValue={proposal.idea.problem_statement}
                            proposedValue={proposal.proposed_problem_statement}
                            hasChanged={proposal.changed_fields.includes('problem_statement')}
                            isTextarea={true}
                        />

                        <ComparisonField
                            label="Proposed Solution"
                            originalValue={proposal.idea.proposed_solution}
                            proposedValue={proposal.proposed_solution}
                            hasChanged={proposal.changed_fields.includes('proposed_solution')}
                            isTextarea={true}
                        />

                        <ComparisonField
                            label="Cost Benefit Analysis"
                            originalValue={proposal.idea.cost_benefit_analysis}
                            proposedValue={proposal.proposed_cost_benefit_analysis}
                            hasChanged={proposal.changed_fields.includes('cost_benefit_analysis')}
                            isTextarea={true}
                        />

                        <ComparisonField
                            label="Declaration of Interests"
                            originalValue={proposal.idea.declaration_of_interests}
                            proposedValue={proposal.proposed_declaration_of_interests}
                            hasChanged={proposal.changed_fields.includes('declaration_of_interests')}
                            isTextarea={true}
                            rows={3}
                        />
                    </div>

                    {/* Action Buttons */}
                    <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                        <Link
                            href={`/ideas/${proposal.idea.slug}/view`}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
                        >
                            <FileText className="h-4 w-4" />
                            View Original Idea
                        </Link>

                        {isAuthor && proposal.status === 'pending' && (
                            <Link
                                href={`/collaboration/${proposal.idea.slug}/review`}
                                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#FFF200] text-[#231F20] hover:bg-yellow-400 transition"
                            >
                                <MessageSquare className="h-4 w-4" />
                                Review & Respond
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}