import React, { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';
import { MessagesSquare, CheckCircle, XCircle, Eye, ArrowLeft, Clock, Filter } from 'lucide-react';
import { toast } from 'react-toastify';
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
    requester: {
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
        title: 'Inbox',
        href: '#',
    },
];

export default function Inbox({ requests }: Props) {
    const [respondingRequests, setRespondingRequests] = useState<Set<number>>(new Set());
    const [appliedFilters, setAppliedFilters] = useState<Record<string, any>>({});
    const [searchQuery, setSearchQuery] = useState('');
    const [filtersVisible, setFiltersVisible] = useState(false);

    // Define filter configuration for inbox requests
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
            const matchesRequester = request.requester.name.toLowerCase().includes(searchLower);
            const matchesIdea = request.idea.title.toLowerCase().includes(searchLower);
            if (!matchesRequester && !matchesIdea) return false;
        }
        return true;
    });

    const handleRespond = async (requestId: number, action: 'approve' | 'reject') => {
        if (respondingRequests.has(requestId)) return;

        setRespondingRequests(prev => new Set(prev).add(requestId));

        try {
            const response = await fetch(`/collaboration/requests/${requestId}/respond`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '',
                },
                body: JSON.stringify({ action }),
            });

            if (response.ok) {
                toast.success(`Collaboration request ${action}d successfully!`);
                // Update the request status in the list
                const request = requests.find(r => r.id === requestId);
                if (request) {
                    request.status = action === 'approve' ? 'approved' : 'rejected';
                    request.responded_at = new Date().toLocaleString();
                }
            } else {
                const data = await response.json();
                toast.error(data.message || `Failed to ${action} collaboration request`);
            }
        } catch (error) {
            console.error(`Error ${action}ing collaboration request:`, error);
            toast.error(`Failed to ${action} collaboration request`);
        } finally {
            setRespondingRequests(prev => {
                const newSet = new Set(prev);
                newSet.delete(requestId);
                return newSet;
            });
        }
    };

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
            <Head title="Collaboration Inbox" />

            {/* Main Container */}
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6 bg-transparent text-[#231F20] dark:text-white transition-colors mt-[40px]">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="relative">
                        <h2 className="flex items-center gap-2 text-3xl md:text-4xl font-extrabold tracking-tight">
                            <MessagesSquare className='w-10 h-10 text-3xl md:text-4xl dark:text-[#fff200] font-black' />
                            <span className='bg-clip-text text-transparent bg-gradient-to-r from-black to-[#fff200] dark:bg-gradient-to-r dark:from-[#FFF200] dark:to-[#F8EBD5]'>
                                Inbox
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
                        placeholder="Search by requester name or idea title..."
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
                                        request.requester.name
                                    )}&background=6B7280&color=FFFFFF&rounded=true&size=48`}
                                    alt={`${request.requester.name} avatar`}
                                    className="h-12 w-12 rounded-full object-cover shadow-md flex-shrink-0" />

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <h3 className="text-lg font-semibold text-[#231F20] dark:text-white">
                                                {request.requester.name}
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
                                        Wants to collaborate on: <span className="font-medium">"{request.idea.title}"</span>
                                    </p>

                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Idea Status: {request.idea.status.replace(' ', ' ').toUpperCase()}</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Owner: {request.idea.user.name}</p>

                                    {request.message && (
                                        <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-3 mb-4">
                                            <p className="text-sm text-gray-700 dark:text-gray-300 italic">
                                                "{request.message}"
                                            </p>
                                        </div>
                                    )}
                                    
                                    <div className="flex items-center gap-3 justify-end">
                                        <Link
                                            href={`/ideas/${request.idea.slug}/view`}
                                            className="flex items-center gap-2 p-4 sm:px-4 sm:py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm font-medium shadow-md hover:shadow-lg transition-all duration-300"
                                        >
                                            <Eye className="h-4 w-4" />
                                            <span className='hidden sm:block'>View Idea</span>
                                        </Link>

                                        {request.status === 'pending' && (
                                            <>
                                                <button
                                                    onClick={() => handleRespond(request.id, 'approve')}
                                                    disabled={respondingRequests.has(request.id)}
                                                    className="flex items-center gap-2 p-4 sm:px-4 sm:py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm font-medium shadow-md hover:shadow-lg transition-all duration-300"
                                                >
                                                    {respondingRequests.has(request.id) ? (
                                                        <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                    ) : (
                                                        <CheckCircle className="h-4 w-4" />
                                                    )}
                                                    <span className='hidden sm:block'>Approve</span>
                                                </button>
                                                <button
                                                    onClick={() => handleRespond(request.id, 'reject')}
                                                    disabled={respondingRequests.has(request.id)}
                                                    className="flex items-center gap-2 p-4 sm:px-4 sm:py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm font-medium shadow-md hover:shadow-lg transition-all duration-300"
                                                >
                                                    {respondingRequests.has(request.id) ? (
                                                        <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                    ) : (
                                                        <XCircle className="h-4 w-4" />
                                                    )}
                                                    <span className='hidden sm:block'>Reject</span>
                                                </button>
                                            </>
                                        )}

                                        {request.status !== 'pending' && request.responded_at && (
                                            <span className="text-sm text-gray-500 dark:text-gray-400">
                                                Responded {request.responded_at}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {filteredRequests.length === 0 && (
                    <div className="text-center py-12">
                        <MessagesSquare className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">
                            {Object.keys(appliedFilters).length > 0 ? 'No requests match your filters' : 'No collaboration requests'}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-500">
                            {Object.keys(appliedFilters).length > 0 ? 'Try adjusting your filters to see more requests.' : 'You haven\'t received any collaboration requests yet.'}
                        </p>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}