import React, { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';
import { Users, Send, Clock, CheckCircle, XCircle, Eye, MessageSquare, Filter } from 'lucide-react';
import { toast } from 'react-toastify';
import AdvancedFilters from '@/components/AdvancedFilters';

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

interface Props {
    ideas: Idea[];
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

export default function Index({ ideas: initialIdeas }: Props) {
    const [ideas, setIdeas] = useState<Idea[]>(initialIdeas);
    const [sendingRequests, setSendingRequests] = useState<Set<number>>(new Set());
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState<Record<string, any>>({});
    const [filterStatus, setFilterStatus] = useState<string | null>(null);
    const [filterMinRevisions, setFilterMinRevisions] = useState<number | null>(null);
    const [filterCollaboration, setFilterCollaboration] = useState<boolean | null>(null);

    const handleApplyFilters = (newFilters: Record<string, any>) => {
        setFilters(newFilters);
        // Here you could make an API call to get filtered ideas
        // For now, we'll filter the existing ideas client-side
    };

    const filteredIdeas = ideas.filter(idea => {
        if (filterStatus && idea.status !== filterStatus) return false;
        // Add more filter logic as needed
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
                <div className="flex items-center justify-between mb-2">
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
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
                        >
                            <Filter className="h-4 w-4" />
                            Filters
                        </button>
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

                {/* Advanced Filters */}
                <AdvancedFilters
                    open={showFilters}
                    onToggle={() => setShowFilters(!showFilters)}
                    onApply={handleApplyFilters}
                    status={filterStatus}
                    minRevisions={filterMinRevisions}
                    collaboration={filterCollaboration}
                    onStatusChange={setFilterStatus}
                    onMinRevisionsChange={setFilterMinRevisions}
                    onCollaborationChange={setFilterCollaboration}
                />

                {/* Ideas Grid */}
                <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
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
                                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 text-sm font-medium">
                                        <CheckCircle className="h-4 w-4" />
                                        Approved
                                    </div>
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

                {filteredIdeas.length === 0 && (
                    <div className="text-center py-12">
                        <Users className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">
                            {Object.keys(filters).length > 0 ? 'No ideas match your filters' : 'No collaboration opportunities available'}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-500">
                            {Object.keys(filters).length > 0 ? 'Try adjusting your filters to see more ideas.' : 'There are currently no ideas available for collaboration.'}
                        </p>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}