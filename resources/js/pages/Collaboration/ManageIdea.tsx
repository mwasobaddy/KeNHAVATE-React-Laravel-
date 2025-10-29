import React, { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';
import { 
    ArrowLeft, 
    Settings,
    GitBranch,
    Eye,
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
    User,
    FileText,
    RotateCcw,
    History
} from 'lucide-react';
import { toast } from 'react-toastify';

interface Idea {
    id: number;
    title: string;
    slug: string;
    abstract: string;
    problem_statement: string;
    proposed_solution: string;
    cost_benefit_analysis: string;
    declaration_of_interests: string;
    current_revision_number: number;
    thematic_area: {
        id: number;
        name: string;
    } | null;
    user: {
        id: number;
        name: string;
    };
}

interface Proposal {
    id: number;
    collaborator: {
        id: number;
        name: string;
    };
    change_summary: string;
    status: string;
    created_at: string;
    reviewed_at: string | null;
}

interface Version {
    id: number;
    version_number: number;
    change_description: string;
    changed_by: string;
    created_at: string;
    changed_fields: string[] | null;
}

interface Props {
    idea: Idea;
    proposals: Proposal[];
    versions: Version[];
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
        title: 'Manage Idea',
        href: '#',
    },
];

export default function ManageIdea({ idea, proposals, versions }: Props) {
    const [activeTab, setActiveTab] = useState<'proposals' | 'versions'>('proposals');
    const [rollingBack, setRollingBack] = useState<number | null>(null);

    const handleRollback = async (versionNumber: number) => {
        if (!confirm(`Are you sure you want to rollback to version ${versionNumber}? This will create a new version and cannot be undone.`)) {
            return;
        }

        setRollingBack(versionNumber);

        try {
            const response = await fetch(`/collaboration/${idea.slug}/rollback`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '',
                },
                body: JSON.stringify({
                    version_number: versionNumber,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                toast.success(data.message);
                // Reload the page to show updated data
                window.location.reload();
            } else {
                const error = await response.json();
                toast.error(error.message || 'Failed to rollback');
            }
        } catch (error) {
            console.error('Error rolling back:', error);
            toast.error('Failed to rollback');
        } finally {
            setRollingBack(null);
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'pending':
                return <Clock className="h-4 w-4 text-yellow-500" />;
            case 'accepted':
                return <CheckCircle className="h-4 w-4 text-green-500" />;
            case 'rejected':
                return <XCircle className="h-4 w-4 text-red-500" />;
            case 'revision_requested':
                return <AlertCircle className="h-4 w-4 text-orange-500" />;
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

    const pendingProposals = proposals.filter(p => p.status === 'pending');

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Manage - ${idea.title}`} />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6 bg-transparent text-[#231F20] dark:text-white transition-colors">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <Link
                        href="/collaboration/received-proposals"
                        className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
                    >
                        <ArrowLeft className="h-5 w-5" />
                        Back to Received Proposals
                    </Link>

                    <div className="flex items-center gap-4">
                        <Link
                            href={`/ideas/${idea.slug}/view`}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
                        >
                            <FileText className="h-4 w-4" />
                            View Idea
                        </Link>

                        {pendingProposals.length > 0 && (
                            <Link
                                href={`/collaboration/${idea.slug}/review`}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#FFF200] text-[#231F20] hover:bg-yellow-400 transition-all font-medium"
                            >
                                <Eye className="h-4 w-4" />
                                Review Proposals ({pendingProposals.length})
                            </Link>
                        )}
                    </div>
                </div>

                {/* Page Title */}
                <div className="relative mb-6">
                    <h2 className="flex items-center gap-2 text-3xl md:text-4xl font-extrabold tracking-tight">
                        <Settings className='w-10 h-10 text-3xl md:text-4xl dark:text-[#fff200] font-black' />
                        <span className='bg-clip-text text-transparent bg-gradient-to-r from-black to-[#fff200] dark:bg-gradient-to-r dark:from-[#FFF200] dark:to-[#F8EBD5]'>
                            Manage Idea
                        </span>
                    </h2>
                    <div className='absolute -bottom-3 left-0 h-1 w-16 bg-gradient-to-r from-black to-[#fff200] dark:bg-gradient-to-r dark:from-[#FFF200] dark:to-[#F8EBD5] rounded-full animate-pulse'></div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-4">
                        Managing: <span className="font-semibold">"{idea.title}"</span> (Revision {idea.current_revision_number})
                    </p>
                </div>

                {/* Idea Summary Card */}
                <div className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-[#F8EBD5]/30 dark:bg-[#F8EBD5]/10 backdrop-blur-lg p-6 mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Idea Summary</h3>
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                        <div>
                            <span className="font-medium text-gray-700 dark:text-gray-300">Title:</span>
                            <p className="text-gray-900 dark:text-gray-100">{idea.title}</p>
                        </div>
                        <div>
                            <span className="font-medium text-gray-700 dark:text-gray-300">Thematic Area:</span>
                            <p className="text-gray-900 dark:text-gray-100">{idea.thematic_area?.name || 'Not specified'}</p>
                        </div>
                        <div className="md:col-span-2">
                            <span className="font-medium text-gray-700 dark:text-gray-300">Abstract:</span>
                            <p className="text-gray-900 dark:text-gray-100 mt-1">{idea.abstract}</p>
                        </div>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
                    <button
                        onClick={() => setActiveTab('proposals')}
                        className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                            activeTab === 'proposals'
                                ? 'border-[#FFF200] text-[#231F20] dark:text-[#FFF200]'
                                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                        }`}
                    >
                        Proposals ({proposals.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('versions')}
                        className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                            activeTab === 'versions'
                                ? 'border-[#FFF200] text-[#231F20] dark:text-[#FFF200]'
                                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                        }`}
                    >
                        Version History ({versions.length})
                    </button>
                </div>

                {/* Tab Content */}
                {activeTab === 'proposals' && (
                    <div className="space-y-4">
                        {proposals.length === 0 ? (
                            <div className="text-center py-12">
                                <GitBranch className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">
                                    No proposals yet
                                </h3>
                                <p className="text-sm text-gray-500 dark:text-gray-500">
                                    No one has submitted collaboration proposals for this idea yet.
                                </p>
                            </div>
                        ) : (
                            proposals.map((proposal) => (
                                <div key={proposal.id} className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                                                    Proposal by {proposal.collaborator.name}
                                                </h4>
                                                <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(proposal.status)}`}>
                                                    {getStatusIcon(proposal.status)}
                                                    {proposal.status.toUpperCase().replace('_', ' ')}
                                                </div>
                                            </div>
                                            <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                                                {proposal.change_summary}
                                            </p>
                                            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                                                <div className="flex items-center gap-1">
                                                    <Clock className="h-4 w-4" />
                                                    <span>Submitted: {proposal.created_at}</span>
                                                </div>
                                                {proposal.reviewed_at && (
                                                    <div className="flex items-center gap-1">
                                                        <CheckCircle className="h-4 w-4" />
                                                        <span>Reviewed: {proposal.reviewed_at}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-end gap-3">
                                        <Link
                                            href={`/collaboration/proposals/${proposal.id}`}
                                            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all text-sm"
                                        >
                                            <Eye className="h-4 w-4" />
                                            View Details
                                        </Link>
                                        {proposal.status === 'pending' && (
                                            <Link
                                                href={`/collaboration/${idea.slug}/review`}
                                                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-all text-sm"
                                            >
                                                <CheckCircle className="h-4 w-4" />
                                                Review
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {activeTab === 'versions' && (
                    <div className="space-y-4">
                        {versions.length === 0 ? (
                            <div className="text-center py-12">
                                <History className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">
                                    No version history
                                </h3>
                                <p className="text-sm text-gray-500 dark:text-gray-500">
                                    This idea hasn't been versioned yet. Versions are created when collaboration proposals are accepted.
                                </p>
                            </div>
                        ) : (
                            versions.map((version) => (
                                <div key={version.id} className={`w-full rounded-xl border p-6 ${
                                    version.version_number === idea.current_revision_number
                                        ? 'border-green-300 bg-green-50 dark:bg-green-900/20 dark:border-green-700'
                                        : 'border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-gray-800/50'
                                } backdrop-blur-sm`}>
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                                                    Version {version.version_number}
                                                    {version.version_number === idea.current_revision_number && (
                                                        <span className="ml-2 px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                                            Current
                                                        </span>
                                                    )}
                                                </h4>
                                            </div>
                                            <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                                                {version.change_description}
                                            </p>
                                            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-2">
                                                <div className="flex items-center gap-1">
                                                    <User className="h-4 w-4" />
                                                    <span>Changed by: {version.changed_by}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Clock className="h-4 w-4" />
                                                    <span>{version.created_at}</span>
                                                </div>
                                            </div>
                                            {version.changed_fields && version.changed_fields.length > 0 && (
                                                <div className="flex flex-wrap gap-1">
                                                    {version.changed_fields.map((field, index) => (
                                                        <span key={index} className="px-2 py-1 text-xs rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                                                            {field.replace('_', ' ')}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    {version.version_number !== idea.current_revision_number && (
                                        <div className="flex items-center justify-end">
                                            <button
                                                onClick={() => handleRollback(version.version_number)}
                                                disabled={rollingBack === version.version_number}
                                                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-orange-600 text-white hover:bg-orange-700 transition disabled:opacity-50 text-sm"
                                            >
                                                {rollingBack === version.version_number ? (
                                                    <>
                                                        <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                        Rolling back...
                                                    </>
                                                ) : (
                                                    <>
                                                        <RotateCcw className="h-4 w-4" />
                                                        Rollback to this version
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}