import React, { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';
import { 
    Users, 
    Eye, 
    Clock, 
    CheckCircle, 
    XCircle, 
    AlertCircle,
    User,
    FileText,
    ArrowLeft,
    Settings,
    GitBranch
} from 'lucide-react';
import AdvancedFilters from '@/components/AdvancedFilters';
import SearchBar from '@/components/SearchBar';

interface ProposalGroup {
    idea: {
        id: number;
        title: string;
        slug: string;
    };
    proposals_count: number;
    pending_count: number;
    accepted_count: number;
    rejected_count: number;
    latest_proposal: {
        id: number;
        collaborator_name: string;
        change_summary: string;
        status: string;
        created_at: string;
    };
    all_proposals: Array<{
        id: number;
        collaborator_name: string;
        change_summary: string;
        status: string;
        created_at: string;
    }>;
}

interface Props {
    proposalGroups: ProposalGroup[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Home',
        href: '/',
    },
    {
        title: 'Received Proposals',
        href: '#',
    },
];

export default function ReceivedProposals({ proposalGroups }: Props) {
    const [appliedFilters, setAppliedFilters] = useState<Record<string, any>>({});
    const [searchQuery, setSearchQuery] = useState('');
    const [filtersVisible, setFiltersVisible] = useState(false);

    // Define filter configuration
    const filterConfig = [
        {
            key: 'hasStatus',
            label: 'Filter by Status',
            type: 'checkbox' as const,
            options: [
                { value: 'has_pending', label: 'Has Pending Proposals' },
                { value: 'has_accepted', label: 'Has Accepted Proposals' },
                { value: 'has_rejected', label: 'Has Rejected Proposals' },
            ],
        },
        {
            key: 'proposalCount',
            label: 'Minimum Proposals',
            type: 'number' as const,
            placeholder: 'Minimum number of proposals',
        },
    ];

    const handleFilterChange = (newFilters: Record<string, any>) => {
        setAppliedFilters(newFilters);
    };

    const filteredProposalGroups = proposalGroups.filter(group => {
        // Search query filter
        if (searchQuery) {
            const searchLower = searchQuery.toLowerCase();
            const matchesTitle = group.idea.title.toLowerCase().includes(searchLower);
            const matchesCollaborator = group.all_proposals.some(p => 
                p.collaborator_name.toLowerCase().includes(searchLower)
            );
            const matchesSummary = group.all_proposals.some(p => 
                p.change_summary.toLowerCase().includes(searchLower)
            );
            if (!matchesTitle && !matchesCollaborator && !matchesSummary) return false;
        }
        
        // Status filters
        if (appliedFilters.hasStatus && Array.isArray(appliedFilters.hasStatus) && appliedFilters.hasStatus.length > 0) {
            for (const filter of appliedFilters.hasStatus) {
                switch (filter) {
                    case 'has_pending':
                        if (group.pending_count === 0) return false;
                        break;
                    case 'has_accepted':
                        if (group.accepted_count === 0) return false;
                        break;
                    case 'has_rejected':
                        if (group.rejected_count === 0) return false;
                        break;
                }
            }
        }
        
        // Minimum proposals filter
        if (appliedFilters.proposalCount && group.proposals_count < parseInt(appliedFilters.proposalCount)) {
            return false;
        }
        
        return true;
    });

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

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Received Collaboration Proposals" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6 bg-transparent text-[#231F20] dark:text-white transition-colors mt-[40px]">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="relative">
                        <h2 className="flex items-center gap-2 text-3xl md:text-4xl font-extrabold tracking-tight">
                            <Users className='w-10 h-10 text-3xl md:text-4xl dark:text-[#fff200] font-black' />
                            <span className='bg-clip-text text-transparent bg-gradient-to-r from-black to-[#fff200] dark:bg-gradient-to-r dark:from-[#FFF200] dark:to-[#F8EBD5]'>
                                Received Proposals
                            </span>
                        </h2>
                        <div className='absolute -bottom-3 left-0 h-1 w-16 bg-gradient-to-r from-black to-[#fff200] dark:bg-gradient-to-r dark:from-[#FFF200] dark:to-[#F8EBD5] rounded-full animate-pulse'></div>
                    </div>
                </div>

                {/* Search and Filters */}
                <div className="space-y-4 mb-6">
                    <SearchBar 
                        value={searchQuery} 
                        onChange={setSearchQuery} 
                        placeholder="Search by idea title, collaborator name, or summary..."
                        showFilterToggle={true}
                        filterVisible={filtersVisible}
                        onFilterToggle={() => setFiltersVisible(!filtersVisible)}
                        activeFilterCount={Object.keys(appliedFilters).length}
                    />
                    
                    <AdvancedFilters
                        filters={filterConfig}
                        onFilterChange={handleFilterChange}
                        visible={filtersVisible}
                    />
                </div>

                {/* Proposal Groups List */}
                <div className="space-y-4">
                    {filteredProposalGroups.map((group) => (
                        <div key={group.idea.id} className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-[#F8EBD5]/30 dark:bg-[#F8EBD5]/10 backdrop-blur-lg p-6 shadow-lg hover:shadow-xl transition-shadow">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="text-lg font-semibold text-[#231F20] dark:text-white">
                                            {group.idea.title}
                                        </h3>
                                        <div className="flex gap-2">
                                            {group.pending_count > 0 && (
                                                <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                                                    {group.pending_count} pending
                                                </span>
                                            )}
                                            {group.accepted_count > 0 && (
                                                <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                                    {group.accepted_count} accepted
                                                </span>
                                            )}
                                            {group.rejected_count > 0 && (
                                                <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                                                    {group.rejected_count} rejected
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="mb-3">
                                        <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                                            <span className="font-medium">Latest:</span> {group.latest_proposal.change_summary}
                                        </p>
                                        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                                            <div className="flex items-center gap-1">
                                                <User className="h-4 w-4" />
                                                <span>By {group.latest_proposal.collaborator_name}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Clock className="h-4 w-4" />
                                                <span>{group.latest_proposal.created_at}</span>
                                            </div>
                                            <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(group.latest_proposal.status)}`}>
                                                {getStatusIcon(group.latest_proposal.status)}
                                                {group.latest_proposal.status.toUpperCase().replace('_', ' ')}
                                            </div>
                                        </div>
                                    </div>

                                    {/* All Proposals Preview */}
                                    {group.proposals_count > 1 && (
                                        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                                                All proposals ({group.proposals_count}):
                                            </p>
                                            <div className="space-y-1">
                                                {group.all_proposals.slice(0, 3).map((proposal) => (
                                                    <div key={proposal.id} className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
                                                        <span>{proposal.collaborator_name}: {proposal.change_summary}</span>
                                                        <div className={`flex items-center gap-1 px-1 py-0.5 rounded text-xs ${getStatusColor(proposal.status)}`}>
                                                            {getStatusIcon(proposal.status)}
                                                            {proposal.status}
                                                        </div>
                                                    </div>
                                                ))}
                                                {group.proposals_count > 3 && (
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                                        ... and {group.proposals_count - 3} more
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-3">
                                <Link
                                    href={`/ideas/${group.idea.slug}/view`}
                                    className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all text-sm"
                                >
                                    <FileText className="h-4 w-4" />
                                    View Idea
                                </Link>

                                <Link
                                    href={`/collaboration/manage/${group.idea.slug}`}
                                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-all text-sm"
                                >
                                    <Settings className="h-4 w-4" />
                                    Manage
                                </Link>

                                {group.pending_count > 0 && (
                                    <Link
                                        href={`/collaboration/${group.idea.slug}/review`}
                                        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#FFF200] text-[#231F20] hover:bg-yellow-400 transition-all text-sm font-medium"
                                    >
                                        <Eye className="h-4 w-4" />
                                        Review ({group.pending_count})
                                    </Link>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Results Summary */}
                {filteredProposalGroups.length > 0 && (
                    <div className="text-center mb-4">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Showing {filteredProposalGroups.length} of {proposalGroups.length} ideas with proposals
                        </p>
                    </div>
                )}

                {proposalGroups.length === 0 ? (
                    <div className="text-center py-12">
                        <Users className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">
                            No proposals received yet
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-500 mb-4">
                            You haven't received any collaboration proposals yet.
                        </p>
                        <Link
                            href="/ideas/submissions"
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#FFF200] text-[#231F20] hover:bg-yellow-400 transition-all"
                        >
                            <GitBranch className="h-4 w-4" />
                            Enable Collaboration on Your Ideas
                        </Link>
                    </div>
                ) : filteredProposalGroups.length === 0 ? (
                    <div className="text-center py-12">
                        <Users className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">
                            No proposals match your search or filters
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-500">
                            Try adjusting your search terms or filters to see more proposals.
                        </p>
                    </div>
                ) : null}
            </div>
        </AppLayout>
    );
}