import React, { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';
import { 
    GitBranch, 
    Eye, 
    Clock, 
    CheckCircle, 
    XCircle, 
    AlertCircle,
    User,
    FileText,
    ArrowLeft
} from 'lucide-react';
import AdvancedFilters from '@/components/AdvancedFilters';
import SearchBar from '@/components/SearchBar';

interface Proposal {
    id: number;
    idea: {
        id: number;
        title: string;
        slug: string;
    };
    original_author: {
        id: number;
        name: string;
    };
    change_summary: string;
    status: string;
    created_at: string;
    reviewed_at: string | null;
    reviewed_by: string | null;
    review_notes: string | null;
}

interface Props {
    proposals: Proposal[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Home',
        href: '/',
    },
    {
        title: 'My Proposals',
        href: '#',
    },
];

export default function MyProposals({ proposals }: Props) {
    const [appliedFilters, setAppliedFilters] = useState<Record<string, any>>({});
    const [searchQuery, setSearchQuery] = useState('');
    const [filtersVisible, setFiltersVisible] = useState(false);

    // Define filter configuration
    const filterConfig = [
        {
            key: 'status',
            label: 'Status',
            type: 'select' as const,
            options: [
                { value: 'pending', label: 'Pending' },
                { value: 'accepted', label: 'Accepted' },
                { value: 'rejected', label: 'Rejected' },
                { value: 'revision_requested', label: 'Revision Requested' }
            ]
        },
        {
            key: 'createdAfter',
            label: 'Created After',
            type: 'date' as const,
            placeholder: 'Show proposals created after this date',
        },
        {
            key: 'createdBefore',
            label: 'Created Before',
            type: 'date' as const,
            placeholder: 'Show proposals created before this date',
        },
    ];

    const handleFilterChange = (newFilters: Record<string, any>) => {
        setAppliedFilters(newFilters);
    };

    const filteredProposals = proposals.filter(proposal => {
        // Status filter
        if (appliedFilters.status && proposal.status !== appliedFilters.status) return false;
        
        // Date filters
        if (appliedFilters.createdAfter) {
            const proposalDate = new Date(proposal.created_at);
            const filterDate = new Date(appliedFilters.createdAfter);
            if (proposalDate < filterDate) return false;
        }
        
        if (appliedFilters.createdBefore) {
            const proposalDate = new Date(proposal.created_at);
            const filterDate = new Date(appliedFilters.createdBefore);
            filterDate.setHours(23, 59, 59, 999);
            if (proposalDate > filterDate) return false;
        }
        
        // Search query filter
        if (searchQuery) {
            const searchLower = searchQuery.toLowerCase();
            const matchesTitle = proposal.idea.title.toLowerCase().includes(searchLower);
            const matchesSummary = proposal.change_summary.toLowerCase().includes(searchLower);
            const matchesAuthor = proposal.original_author.name.toLowerCase().includes(searchLower);
            if (!matchesTitle && !matchesSummary && !matchesAuthor) return false;
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
            <Head title="My Collaboration Proposals" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6 bg-transparent text-[#231F20] dark:text-white transition-colors mt-[40px]">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="relative">
                        <h2 className="flex items-center gap-2 text-3xl md:text-4xl font-extrabold tracking-tight">
                            <GitBranch className='w-10 h-10 text-3xl md:text-4xl dark:text-[#fff200] font-black' />
                            <span className='bg-clip-text text-transparent bg-gradient-to-r from-black to-[#fff200] dark:bg-gradient-to-r dark:from-[#FFF200] dark:to-[#F8EBD5]'>
                                My Proposals
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
                        placeholder="Search by idea title, summary, or author..."
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

                {/* Proposals List */}
                <div className="space-y-4">
                    {filteredProposals.map((proposal) => (
                        <div key={proposal.id} className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-[#F8EBD5]/30 dark:bg-[#F8EBD5]/10 backdrop-blur-lg p-6 shadow-lg hover:shadow-xl transition-shadow">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="text-lg font-semibold text-[#231F20] dark:text-white">
                                            {proposal.idea.title}
                                        </h3>
                                        <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(proposal.status)}`}>
                                            {getStatusIcon(proposal.status)}
                                            {proposal.status.toUpperCase().replace('_', ' ')}
                                        </div>
                                    </div>

                                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                                        <span className="font-medium">Change Summary:</span> {proposal.change_summary}
                                    </p>

                                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
                                        <div className="flex items-center gap-1">
                                            <User className="h-4 w-4" />
                                            <span>Author: {proposal.original_author.name}</span>
                                        </div>
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

                                    {proposal.review_notes && (
                                        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                            <p className="text-sm text-blue-900 dark:text-blue-100">
                                                <strong>Review Notes:</strong> {proposal.review_notes}
                                            </p>
                                            {proposal.reviewed_by && (
                                                <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                                                    - {proposal.reviewed_by}
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    {proposal.status === 'pending' && (
                                        <span className="text-sm text-yellow-600 dark:text-yellow-400 font-medium">
                                            Awaiting review
                                        </span>
                                    )}
                                    {proposal.status === 'accepted' && (
                                        <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                                            Your proposal was accepted!
                                        </span>
                                    )}
                                    {proposal.status === 'rejected' && (
                                        <span className="text-sm text-red-600 dark:text-red-400 font-medium">
                                            Proposal was declined
                                        </span>
                                    )}
                                    {proposal.status === 'revision_requested' && (
                                        <span className="text-sm text-orange-600 dark:text-orange-400 font-medium">
                                            Revision requested
                                        </span>
                                    )}
                                </div>

                                <div className="flex items-center gap-3">
                                    <Link
                                        href={`/ideas/${proposal.idea.slug}/view`}
                                        className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all text-sm"
                                    >
                                        <FileText className="h-4 w-4" />
                                        View Idea
                                    </Link>

                                    <Link
                                        href={`/collaboration/proposals/${proposal.id}`}
                                        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-all text-sm"
                                    >
                                        <Eye className="h-4 w-4" />
                                        View Details
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Results Summary */}
                {filteredProposals.length > 0 && (
                    <div className="text-center mb-4">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Showing {filteredProposals.length} of {proposals.length} proposals
                        </p>
                    </div>
                )}

                {proposals.length === 0 ? (
                    <div className="text-center py-12">
                        <GitBranch className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">
                            No proposals submitted yet
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-500 mb-4">
                            You haven't submitted any collaboration proposals yet.
                        </p>
                        <Link
                            href="/collaboration"
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#FFF200] text-[#231F20] hover:bg-yellow-400 transition-all"
                        >
                            <GitBranch className="h-4 w-4" />
                            Browse Ideas to Collaborate
                        </Link>
                    </div>
                ) : filteredProposals.length === 0 ? (
                    <div className="text-center py-12">
                        <GitBranch className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
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