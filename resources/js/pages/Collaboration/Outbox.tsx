import React, { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';
import { Send, CheckCircle, XCircle, Eye, ArrowLeft, Clock, Filter } from 'lucide-react';
import AdvancedFilters from '@/components/AdvancedFilters';
import SearchBar from '@/components/SearchBar';

interface CollaborationRequest {
    id: number;
    status: string;
    message: string;
    created_at: string;
    responded_at: string | null;
    idea: {
        id: number;
        title: string;
        slug: string;
        status: string;
        user: {
            name: string;
        };
    };
    owner: {
        id: number;
        name: string;
    };
}

interface Props {
    requests: CollaborationRequest[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Home',
        href: '/',
    },
    {
        title: 'Outbox',
        href: '#',
    },
];

export default function Outbox({ requests }: Props) {
    const [appliedFilters, setAppliedFilters] = useState<Record<string, any>>({});
    const [searchQuery, setSearchQuery] = useState('');
    const [filtersVisible, setFiltersVisible] = useState(false);

    // Define filter configuration for outbox requests
    const filterConfig = [
        {
            key: 'status',
            label: 'Status',
            type: 'select' as const,
            options: [
                { value: 'pending', label: 'Pending' },
                { value: 'approved', label: 'Approved' },
                { value: 'rejected', label: 'Rejected' }
            ]
        }
    ];

    const handleFilterChange = (newFilters: Record<string, any>) => {
        setAppliedFilters(newFilters);
    };

    const filteredRequests = requests.filter(request => {
        // Status filter
        if (appliedFilters.status && request.status !== appliedFilters.status) return false;
        
        // Search query filter
        if (searchQuery) {
            const searchLower = searchQuery.toLowerCase();
            const matchesOwner = request.owner.name.toLowerCase().includes(searchLower);
            const matchesIdea = request.idea.title.toLowerCase().includes(searchLower);
            if (!matchesOwner && !matchesIdea) return false;
        }
        return true;
    });
    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'pending':
                return <Clock className="h-4 w-4 text-yellow-500" />;
            case 'approved':
                return <CheckCircle className="h-4 w-4 text-green-500" />;
            case 'rejected':
                return <XCircle className="h-4 w-4 text-red-500" />;
            default:
                return null;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending':
                return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30';
            case 'approved':
                return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30';
            case 'rejected':
                return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30';
            default:
                return 'text-gray-600 bg-gray-100 dark:text-gray-300 dark:bg-gray-700/50';
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Collaboration Outbox" />

            {/* Main Container */}
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6 bg-transparent text-[#231F20] dark:text-white transition-colors mt-[40px]">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="relative">
                        <h2 className="flex items-center gap-2 text-3xl md:text-4xl font-extrabold tracking-tight">
                            <Send className='w-10 h-10 text-3xl md:text-4xl dark:text-[#fff200] font-black' />
                            <span className='bg-clip-text text-transparent bg-gradient-to-r from-black to-[#fff200] dark:bg-gradient-to-r dark:from-[#FFF200] dark:to-[#F8EBD5]'>
                                Outbox
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
                        placeholder="Search by owner name or idea title..."
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

                {/* Requests List */}
                <div className="space-y-4">
                    {filteredRequests.map((request) => (
                        <div key={request.id} className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-[#F8EBD5]/30 dark:bg-[#F8EBD5]/10 backdrop-blur-lg p-6 shadow-lg">
                            <div className="flex items-start gap-4">
                                <img
                                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                                        request.owner.name
                                    )}&background=FFF200&color=231F20&rounded=true&size=48`}
                                    alt={`${request.owner.name} avatar`}
                                    className="h-12 w-12 rounded-full object-cover shadow-md flex-shrink-0" />

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-lg font-semibold text-[#231F20] dark:text-white">
                                                Sent to {request.owner.name}
                                            </h3>
                                            <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                                                {getStatusIcon(request.status)}
                                                {request.status.toUpperCase()}
                                            </div>
                                        </div>
                                        <span className="text-sm text-gray-500 dark:text-gray-400">
                                            {request.created_at}
                                        </span>
                                    </div>

                                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                                        Collaboration request for: <span className="font-medium">"{request.idea.title}"</span>
                                    </p>

                                    {request.message && (
                                        <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-3 mb-4">
                                            <p className="text-sm text-gray-700 dark:text-gray-300 italic">
                                                "{request.message}"
                                            </p>
                                        </div>
                                    )}

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                                            <span>Idea Status: {request.idea.status.replace(' ', ' ').toUpperCase()}</span>
                                            <span>Owner: {request.idea.user.name}</span>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <Link
                                                href={`/ideas/${request.idea.slug}/view`}
                                                className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all text-sm"
                                            >
                                                <Eye className="h-4 w-4" />
                                                View Idea
                                            </Link>

                                            {request.status !== 'pending' && request.responded_at && (
                                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                                    Responded {request.responded_at}
                                                </span>
                                            )}

                                            {request.status === 'pending' && (
                                                <span className="text-sm text-yellow-600 dark:text-yellow-400 font-medium">
                                                    Awaiting response
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {filteredRequests.length === 0 && (
                    <div className="text-center py-12">
                        <Send className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">
                            {Object.keys(appliedFilters).length > 0 ? 'No requests match your filters' : 'No sent requests'}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-500">
                            {Object.keys(appliedFilters).length > 0 ? 'Try adjusting your filters to see more requests.' : 'You haven\'t sent any collaboration requests yet.'}
                        </p>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}