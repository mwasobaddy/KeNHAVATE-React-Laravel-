import React, { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';
import { Users, Send, Clock, CheckCircle, XCircle, Eye, MessageSquare, Filter } from 'lucide-react';
import { toast } from 'react-toastify';
import AdvancedFilters from '@/components/AdvancedFilters';
import SearchBar from '@/components/SearchBar';

interface Idea {
    id: number;
    title: string;
    description: string;
    status: string;
    created_at: string;
    user: {
        id: number;
        name: string;
    } | null;
    thematic_area: {
        id: number;
        name: string;
    } | null;
    slug: string;
    has_pending_request: boolean;
    existing_request_id: number | null;
    request_status: string | null;
}

interface ThematicArea {
    id: number;
    name: string;
    slug: string;
}

interface Props {
    ideas: Idea[];
    thematicAreas: ThematicArea[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Home',
        href: '/',
    },
    {
        title: 'Collaboration',
        href: '#',
    },
];

export default function Index({ ideas: initialIdeas, thematicAreas }: Props) {
    const [ideas, setIdeas] = useState<Idea[]>(initialIdeas);
    const [sendingRequests, setSendingRequests] = useState<Set<number>>(new Set());
    const [appliedFilters, setAppliedFilters] = useState<Record<string, any>>({});
    const [searchQuery, setSearchQuery] = useState('');

    const [filtersVisible, setFiltersVisible] = useState(false);

    // Define filter configuration for ideas
    const filterConfig = [
        {
            key: 'status',
            label: 'Idea Status',
            type: 'select' as const,
            options: [
                { value: 'draft', label: 'Draft' },
                { value: 'stage 1 review', label: 'Stage 1 Review' },
                { value: 'stage 2 review', label: 'Stage 2 Review' },
                { value: 'stage 1 revise', label: 'Stage 1 Revise' },
                { value: 'stage 2 revise', label: 'Stage 2 Revise' },
                { value: 'approved', label: 'Approved' },
                { value: 'rejected', label: 'Rejected' }
            ]
        },
        {
            key: 'requestStatus',
            label: 'Collaboration Status',
            type: 'select' as const,
            options: [
                { value: 'none', label: 'Available for Request' },
                { value: 'pending', label: 'Request Pending' },
                { value: 'approved', label: 'Request Approved' },
                { value: 'rejected', label: 'Request Rejected' }
            ]
        },
        {
            key: 'thematicArea',
            label: 'Thematic Area',
            type: 'select' as const,
            options: [
                { value: '', label: 'All Thematic Areas' },
                ...thematicAreas.map(area => ({
                    value: area.id.toString(),
                    label: area.name
                }))
            ]
        },
        {
            key: 'createdAfter',
            label: 'Created After',
            type: 'date' as const,
            placeholder: 'Show ideas created after this date',
        },
        {
            key: 'createdBefore',
            label: 'Created Before',
            type: 'date' as const,
            placeholder: 'Show ideas created before this date',
        },
        {
            key: 'hasThematicArea',
            label: 'Filters',
            type: 'checkbox' as const,
            options: [
                { value: 'has_thematic_area', label: 'Has Thematic Area' },
                { value: 'has_user', label: 'Has Known Author' },
            ],
        },
    ];

    const handleFilterChange = (newFilters: Record<string, any>) => {
        setAppliedFilters(newFilters);
    };

    const filteredIdeas = ideas.filter(idea => {
        // Idea Status filter
        if (appliedFilters.status && idea.status !== appliedFilters.status) return false;
        
        // Collaboration Request Status filter
        if (appliedFilters.requestStatus) {
            switch (appliedFilters.requestStatus) {
                case 'none':
                    if (idea.has_pending_request || idea.request_status) return false;
                    break;
                case 'pending':
                    if (!idea.has_pending_request || idea.request_status !== 'pending') return false;
                    break;
                case 'approved':
                    if (idea.request_status !== 'approved') return false;
                    break;
                case 'rejected':
                    if (idea.request_status !== 'rejected') return false;
                    break;
            }
        }
        
        // Created After filter
        if (appliedFilters.createdAfter) {
            const ideaDate = new Date(idea.created_at);
            const filterDate = new Date(appliedFilters.createdAfter);
            if (ideaDate < filterDate) return false;
        }
        
        // Created Before filter
        if (appliedFilters.createdBefore) {
            const ideaDate = new Date(idea.created_at);
            const filterDate = new Date(appliedFilters.createdBefore);
            filterDate.setHours(23, 59, 59, 999); // End of day
            if (ideaDate > filterDate) return false;
        }
        
        // Checkbox filters
        if (appliedFilters.hasThematicArea && Array.isArray(appliedFilters.hasThematicArea) && appliedFilters.hasThematicArea.length > 0) {
            for (const filter of appliedFilters.hasThematicArea) {
                switch (filter) {
                    case 'has_thematic_area':
                        if (!idea.thematic_area) return false;
                        break;
                    case 'has_user':
                        if (!idea.user) return false;
                        break;
                }
            }
        }
        
        // Search query filter (from SearchBar)
        if (searchQuery) {
            const searchLower = searchQuery.toLowerCase();
            const matchesTitle = idea.title.toLowerCase().includes(searchLower);
            const matchesDescription = idea.description.toLowerCase().includes(searchLower);
            const matchesAuthor = idea.user?.name.toLowerCase().includes(searchLower);
            if (!matchesTitle && !matchesDescription && !matchesAuthor) return false;
        }
        
        // Thematic area filter
        if (appliedFilters.thematicArea && idea.thematic_area) {
            if (idea.thematic_area.id.toString() !== appliedFilters.thematicArea) {
                return false;
            }
        }
        
        return true;
    });

    const handleSendRequest = async (idea: Idea) => {
        if (sendingRequests.has(idea.id)) return;

        setSendingRequests(prev => new Set(prev).add(idea.id));

        try {
            const response = await fetch(`/collaboration/${idea.slug}/request`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '',
                },
                body: JSON.stringify({
                    message: `I would like to collaborate on your idea "${idea.title}".`,
                }),
            });

            if (response.ok) {
                toast.success('Collaboration request sent successfully!');
                // Update the idea in state to show pending request
                setIdeas(prevIdeas =>
                    prevIdeas.map(ideaItem =>
                        ideaItem.id === idea.id
                            ? { ...ideaItem, has_pending_request: true, request_status: 'pending' }
                            : ideaItem
                    )
                );
            } else {
                const data = await response.json();
                toast.error(data.message || 'Failed to send collaboration request');
            }
        } catch (error) {
            console.error('Error sending collaboration request:', error);
            toast.error('Failed to send collaboration request');
        } finally {
            setSendingRequests(prev => {
                const newSet = new Set(prev);
                newSet.delete(idea.id);
                return newSet;
            });
        }
    };

    const handleCancelRequest = async (idea: Idea) => {
        if (!idea.existing_request_id) return;

        try {
            const response = await fetch(`/collaboration/requests/${idea.existing_request_id}`, {
                method: 'DELETE',
                headers: {
                    'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '',
                },
            });

            if (response.ok) {
                toast.success('Collaboration request cancelled');
                // Update the idea in state to remove pending request
                setIdeas(prevIdeas =>
                    prevIdeas.map(ideaItem =>
                        ideaItem.id === idea.id
                            ? { ...ideaItem, has_pending_request: false, existing_request_id: null, request_status: null }
                            : ideaItem
                    )
                );
            } else {
                toast.error('Failed to cancel collaboration request');
            }
        } catch (error) {
            console.error('Error cancelling collaboration request:', error);
            toast.error('Failed to cancel collaboration request');
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'draft':
                return 'text-gray-600 bg-gray-100 dark:text-gray-300 dark:bg-gray-700/50';
            case 'stage 1 review':
                return 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30';
            case 'stage 1 revise':
                return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30';
            default:
                return 'text-gray-600 bg-gray-100 dark:text-gray-300 dark:bg-gray-700/50';
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Collaboration" />

            {/* Main Container */}
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6 bg-transparent text-[#231F20] dark:text-white transition-colors">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="relative">
                        <h2 className="flex items-center gap-2 text-3xl md:text-4xl font-extrabold tracking-tight">
                            <Users className='w-10 h-10 text-3xl md:text-4xl dark:text-[#fff200] font-black' />
                            <span className='bg-clip-text text-transparent bg-gradient-to-r from-black to-[#fff200] dark:bg-gradient-to-r dark:from-[#FFF200] dark:to-[#F8EBD5]'>
                                Collaboration
                            </span>
                        </h2>
                        <div className='absolute -bottom-3 left-0 h-1 w-16 bg-gradient-to-r from-black to-[#fff200] dark:bg-gradient-to-r dark:from-[#FFF200] dark:to-[#F8EBD5] rounded-full animate-pulse'></div>
                    </div>

                    {/* Navigation Links */}
                    <div className="flex items-center gap-4">
                        <Link
                            href="/collaboration/inbox"
                            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
                        >
                            <MessageSquare className="h-4 w-4" />
                            Inbox
                        </Link>
                        <Link
                            href="/collaboration/outbox"
                            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
                        >
                            <Send className="h-4 w-4" />
                            Outbox
                        </Link>
                    </div>
                </div>

                {/* Search and Filters */}
                <div className="space-y-4 mb-6">
                    <SearchBar 
                        value={searchQuery} 
                        onChange={setSearchQuery} 
                        placeholder="Search ideas by title, description, or author..." 
                    />
                    
                    <AdvancedFilters
                        filters={filterConfig}
                        onFilterChange={handleFilterChange}
                        visible={filtersVisible}
                        onToggle={() => setFiltersVisible(!filtersVisible)}
                        showToggleButton={true}
                    />
                </div>

                {/* Ideas Grid */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {filteredIdeas.map((idea) => (
                        <div key={idea.id} className="flex flex-col w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-[#F8EBD5]/30 dark:bg-[#F8EBD5]/10 backdrop-blur-lg p-6 shadow-lg hover:shadow-xl transition-shadow">
                            <div className="flex items-start gap-4 mb-4">
                                <img
                                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                                        idea.title
                                    )}&background=FFF200&color=231F20&rounded=true&size=48`}
                                    alt="idea avatar"
                                    className="h-12 w-12 rounded-full object-cover shadow-md flex-shrink-0" />

                                <div className="flex-1 min-w-0">
                                    <h3 className="text-lg font-bold text-[#231F20] dark:text-white mb-2 line-clamp-2 leading-tight">
                                        {idea.title}
                                    </h3>
                                    <div className='flex flex-wrap gap-2'>
                                        <span className={`flex items-center gap-2 px-2 py-1 rounded-full text-xs font-medium w-fit ${
                                            idea.status === 'draft' ? 'text-gray-600 bg-gray-200 dark:text-gray-300 dark:bg-gray-700/50' :
                                            idea.status === 'stage 1 review' ? 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30' :
                                            idea.status === 'stage 2 review' ? 'text-purple-600 bg-purple-100 dark:text-purple-400 dark:bg-purple-900/30' :
                                            idea.status === 'stage 1 revise' ? 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30' :
                                            idea.status === 'stage 2 revise' ? 'text-orange-600 bg-orange-100 dark:text-orange-400 dark:bg-orange-900/30' :
                                            idea.status === 'approved' ? 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30' :
                                            'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30'
                                        }`}>
                                            <span>By {idea.user?.name || 'Unknown'}</span>
                                        </span>
                                        <span className={`flex items-center gap-2 px-2 py-1 rounded-full text-xs font-medium w-fit ${
                                            idea.status === 'draft' ? 'text-gray-600 bg-gray-200 dark:text-gray-300 dark:bg-gray-700/50' :
                                            idea.status === 'stage 1 review' ? 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30' :
                                            idea.status === 'stage 2 review' ? 'text-purple-600 bg-purple-100 dark:text-purple-400 dark:bg-purple-900/30' :
                                            idea.status === 'stage 1 revise' ? 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30' :
                                            idea.status === 'stage 2 revise' ? 'text-orange-600 bg-orange-100 dark:text-orange-400 dark:bg-orange-900/30' :
                                            idea.status === 'approved' ? 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30' :
                                            'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30'
                                        }`}>
                                            {idea.thematic_area && (
                                                <>
                                                    <span>{idea.thematic_area.name}</span>
                                                </>
                                            )}
                                        </span>
                                        <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(idea.status)}`}>
                                            {idea.status}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-4 line-clamp-3 flex-1">
                                {idea.description}
                            </p>

                            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-4">
                                <span>Created {idea.created_at}</span>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-3">
                                <Link
                                    href={`/ideas/${idea.slug}/view`}
                                    className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm font-medium shadow-md hover:shadow-lg transition-all duration-300"
                                >
                                    <Eye className="h-4 w-4" />
                                    View
                                </Link>

                                {idea.request_status === 'approved' ? (
                                    <Link
                                        href={`/collaboration/${idea.slug}/propose`}
                                        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-all text-sm font-medium"
                                    >
                                        <CheckCircle className="h-4 w-4" />
                                        Collaborate
                                    </Link>
                                ) : idea.request_status === 'rejected' ? (
                                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 text-sm font-medium">
                                        <XCircle className="h-4 w-4" />
                                        Rejected
                                    </div>
                                ) : idea.has_pending_request ? (
                                    <button
                                        onClick={() => handleCancelRequest(idea)}
                                        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-orange-600 text-white hover:bg-orange-700 transition-all text-sm"
                                    >
                                        <Clock className="h-4 w-4" />
                                        Pending
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => handleSendRequest(idea)}
                                        disabled={sendingRequests.has(idea.id)}
                                        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#FFF200] text-[#231F20] hover:bg-yellow-400 transition disabled:opacity-50 text-sm"
                                    >
                                        {sendingRequests.has(idea.id) ? (
                                            <>
                                                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                Sending...
                                            </>
                                        ) : (
                                            <>
                                                <Send className="h-4 w-4" />
                                                Request
                                            </>
                                        )}
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Results Summary */}
                {filteredIdeas.length > 0 && (
                    <div className="text-center mb-4">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Showing {filteredIdeas.length} of {ideas.length} collaboration opportunities
                        </p>
                    </div>
                )}

                {ideas.length === 0 ? (
                    <div className="text-center py-12">
                        <Users className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">
                            No collaboration opportunities available
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-500">
                            There are currently no ideas available for collaboration.
                        </p>
                    </div>
                ) : filteredIdeas.length === 0 ? (
                    <div className="text-center py-12">
                        <Users className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">
                            No ideas match your search or filters
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-500">
                            Try adjusting your search terms or filters to see more collaboration opportunities.
                        </p>
                    </div>
                ) : null}
            </div>
        </AppLayout>
    );
}