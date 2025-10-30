import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import ideasRoutes from '@/routes/ideas';
import collaborationRoutes from '@/routes/collaboration';
import { EllipsisVertical, Eye, FileText, MessagesSquare, SquarePen, Trash2, UsersRound, Power, Heart, Home, Lightbulb, Plus, Send } from 'lucide-react';
import { useEffect, useState, useMemo } from 'react';
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
    PaginationEllipsis,
} from '@/components/ui/pagination';
import SearchBar from '@/components/SearchBar';
import AdvancedFilters, { type FilterConfig } from '@/components/AdvancedFilters';
import DeleteModal from '@/components/DeleteModal';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { toast } from 'react-toastify';

interface Idea {
    id: number;
    title: string;
    description: string;
    created_at: string;
    status?: string;
    user?: {
        id: number;
        name: string;
    } | null;
    team_members_count?: number;
    collaboration_members_count?: number;
    likes_count?: number;
    current_revision_number?: number;
    slug?: string;
    liked_by_user?: boolean;
    collaboration_enabled?: boolean;
    comments_enabled?: boolean;
    team_effort?: boolean;
    original_idea_disclaimer?: boolean;
    collaboration_deadline?: string;
    attachment_filename?: string;
    attachment_size?: number;
    attachment_mime?: string;
    thematic_area?: {
        id: number;
        name: string;
    } | null;
    is_author?: boolean;
    collaboration_request?: {
        id: number;
        status: 'pending' | 'approved' | 'rejected';
    } | null;
}

interface PaginatedResponse<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
    links: Array<{
        url: string | null;
        label: string;
        active: boolean;
    }>;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Home',
        href: '/dashboard',
        icon: Home,
    },
    {
        title: 'Collaboration Hub',
        // href: '/collaboration/hub',
        // my path is /Users/app/Desktop/ReactNative/KeNHAVATE/resources/js/pages/Ideas/PublicIndex.tsx
        href: collaborationRoutes.hub.url(),
        icon: Lightbulb,
    },
];

export default function Index() {
    const { ideas, thematicAreas } = usePage<{ 
        ideas: PaginatedResponse<Idea>;
        thematicAreas: Array<{ id: number; name: string }>;
    }>().props;
    
    // Initialize search and filters from URL parameters
    const [query, setQuery] = useState(() => {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('search') || '';
    });
    
    const [filters, setFilters] = useState<Record<string, any>>(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const initialFilters: Record<string, any> = {};
        
        // Extract filter values from URL
        for (const [key, value] of urlParams.entries()) {
            if (key !== 'search' && key !== 'page') {
                if (key.endsWith('[]')) {
                    const filterKey = key.slice(0, -2);
                    if (!initialFilters[filterKey]) initialFilters[filterKey] = [];
                    initialFilters[filterKey].push(value);
                } else {
                    initialFilters[key] = value;
                }
            }
        }
        
        return initialFilters;
    });
    
    const [filtersVisible, setFiltersVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const [likedMap, setLikedMap] = useState<Record<number, boolean>>({});
    const [likesMap, setLikesMap] = useState<Record<number, number>>({});
    const [collaborationMap, setCollaborationMap] = useState<Record<number, boolean>>({});
    const [commentsMap, setCommentsMap] = useState<Record<number, boolean>>({});
    const [singleDeleteOpen, setSingleDeleteOpen] = useState(false);
    const [singleDeleteId, setSingleDeleteId] = useState<number | null>(null);
    const [sendingRequests, setSendingRequests] = useState<Set<number>>(new Set());
    const [collaborationRequests, setCollaborationRequests] = useState<Record<number, { status: string; id?: number }>>({});

    const filterConfig: FilterConfig[] = [
        {
            key: 'status',
            label: 'Status',
            type: 'select',
            options: [
                { value: 'draft', label: 'Draft' },
                { value: 'stage 1 review', label: 'Stage 1 Review' },
                { value: 'stage 2 review', label: 'Stage 2 Review' },
                { value: 'stage 1 revise', label: 'Stage 1 Revise' },
                { value: 'stage 2 revise', label: 'Stage 2 Revise' },
                { value: 'approved', label: 'Approved' },
                { value: 'rejected', label: 'Rejected' },
            ],
            placeholder: 'All statuses',
        },
        {
            key: 'minRevisions',
            label: 'Min Revisions',
            type: 'number',
            placeholder: 'Minimum number of revisions',
        },
        {
            key: 'maxRevisions',
            label: 'Max Revisions',
            type: 'number',
            placeholder: 'Maximum number of revisions',
        },
        {
            key: 'collaborationDeadline',
            label: 'Collaboration Deadline',
            type: 'date',
            placeholder: 'Filter by collaboration deadline',
        },
        {
            key: 'createdAfter',
            label: 'Created After',
            type: 'date',
            placeholder: 'Show ideas created after this date',
        },
        {
            key: 'createdBefore',
            label: 'Created Before',
            type: 'date',
            placeholder: 'Show ideas created before this date',
        },
        {
            key: 'thematicArea',
            label: 'Thematic Area',
            type: 'select',
            options: thematicAreas.map(area => ({
                value: area.id.toString(),
                label: area.name
            })),
            placeholder: 'All thematic areas',
        },
        {
            key: 'features',
            label: 'Features',
            type: 'checkbox',
            options: [
                { value: 'collaboration_enabled', label: 'Collaboration Enabled' },
                { value: 'comments_enabled', label: 'Comments Enabled' },
                { value: 'team_effort', label: 'Team Effort' },
                { value: 'original_idea_disclaimer', label: 'Original Idea Disclaimer' },
                { value: 'has_attachment', label: 'Has Attachment' },
            ],
        },
    ];

    useEffect(() => {
        const start = () => setLoading(true);
        const finish = () => setLoading(false);

        router.on('start', start);
        router.on('finish', finish);
    }, []);

    // initialize likes state and collaboration requests from server props
    useEffect(() => {
        const lm: Record<number, boolean> = {};
        const lc: Record<number, number> = {};
        const cm: Record<number, boolean> = {};
        const com: Record<number, boolean> = {};
        const cr: Record<number, { status: string; id?: number }> = {};
        ideas.data.forEach((i) => {
            lm[i.id] = i.liked_by_user ?? false;
            lc[i.id] = i.likes_count ?? 0;
            cm[i.id] = i.collaboration_enabled ?? false;
            com[i.id] = i.comments_enabled ?? false;
            // Initialize collaboration requests from server data
            if (i.collaboration_request) {
                cr[i.id] = {
                    status: i.collaboration_request.status,
                    id: i.collaboration_request.id
                };
            }
        });
        setLikedMap(lm);
        setLikesMap(lc);
        setCollaborationMap(cm);
        setCommentsMap(com);
        setCollaborationRequests(cr);
    }, [ideas]);

    // Handle search with debounce
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            const currentParams = new URLSearchParams(window.location.search);
            const newParams = new URLSearchParams();
            
            // Preserve the current page when building new params
            const currentPage = currentParams.get('page');
            
            if (query) newParams.set('search', query);
            if (Object.keys(filters).length > 0) {
                Object.entries(filters).forEach(([key, value]) => {
                    if (value !== null && value !== undefined && value !== '') {
                        if (Array.isArray(value)) {
                            value.forEach(v => newParams.append(`${key}[]`, v));
                        } else {
                            newParams.set(key, value.toString());
                        }
                    }
                });
            }
            
            // Check if search or filters changed (not page)
            const currentSearch = currentParams.get('search') || '';
            const newSearch = query || '';
            
            // Compare filter params (excluding page)
            const currentFilters = new URLSearchParams();
            const newFilters = new URLSearchParams();
            
            for (const [key, value] of currentParams.entries()) {
                if (key !== 'page' && key !== 'search') {
                    currentFilters.append(key, value);
                }
            }
            
            for (const [key, value] of newParams.entries()) {
                if (key !== 'page' && key !== 'search') {
                    newFilters.append(key, value);
                }
            }
            
            const searchChanged = currentSearch !== newSearch;
            const filtersChanged = currentFilters.toString() !== newFilters.toString();
            
            // Only navigate if search or filters actually changed
            if (searchChanged || filtersChanged) {
                // Reset to page 1 when search/filters change
                const finalUrl = `${collaborationRoutes.hub.url()}${newParams.toString() ? '?' + newParams.toString() : ''}`;
                
                router.get(finalUrl, {}, {
                    preserveState: true,
                    preserveScroll: true,
                    replace: true,
                });
            }
        }, 300); // 300ms debounce

        return () => clearTimeout(timeoutId);
    }, [query, filters]);

    function promptDeleteSingle(id: number) {
        setSingleDeleteId(id);
        setSingleDeleteOpen(true);
    }

    async function confirmSingleDelete() {
        const id = singleDeleteId;
        if (!id) return setSingleDeleteOpen(false);
        try {
            const res = await fetch(`/ideas/${id}`, { method: 'DELETE', headers: { 'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '' } });
            if (res.ok) {
                router.reload();
                toast.success('Idea deleted successfully!');
            } else {
                toast.error('Failed to delete idea. Please try again.');
                console.warn('deleteIdea returned', res.status);
            }
        } catch (e) {
            toast.error('Failed to delete idea. Please try again.');
            console.error(e);
        } finally {
            setSingleDeleteOpen(false);
        }
    }

    function toggleLike(id: number) {
        const currentLiked = !!likedMap[id];
        const currentCount = likesMap[id] ?? 0;

        // update UI optimistically
        setLikedMap((m) => ({ ...m, [id]: !currentLiked }));
        setLikesMap((c) => ({ ...c, [id]: currentCount + (currentLiked ? -1 : 1) }));

        // persist like to backend
        fetch(`/ideas/${id}/toggle-like`, { method: 'POST', headers: { 'X-Requested-With': 'XMLHttpRequest', 'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '' }, credentials: 'same-origin' })
            .then(async (res) => {
                if (!res.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await res.json();
                // reconcile server state
                setLikedMap((m2) => ({ ...m2, [id]: !!data.liked }));
                setLikesMap((c2) => ({ ...c2, [id]: data.likes_count }));
                toast.success(data.liked ? 'Idea liked!' : 'Like removed!');
            })
            .catch((err) => {
                // rollback optimistic change on error
                setLikedMap((m2) => ({ ...m2, [id]: currentLiked }));
                setLikesMap((c2) => ({ ...c2, [id]: currentCount }));
                toast.error('Failed to toggle like. Please try again.');
                console.error('Failed to toggle like', err);
            });
    }

    async function handleSendCollaborationRequest(idea: Idea) {
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
                const data = await response.json();
                toast.success('Collaboration request sent successfully!');
                // Update the collaboration request status
                setCollaborationRequests(prev => ({
                    ...prev,
                    [idea.id]: { status: 'pending', id: data.request_id }
                }));
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
    }

    function getCollaborationButtonProps(idea: Idea) {
        const localRequest = collaborationRequests[idea.id];
        const serverRequest = idea.collaboration_request;
        const requestStatus = serverRequest?.status || localRequest?.status;
        const isSending = sendingRequests.has(idea.id);

        if (isSending) {
            return {
                text: 'Sending...',
                className: 'bg-purple-400 text-white cursor-not-allowed',
                disabled: true,
                onClick: null,
                href: null,
            };
        }

        switch (requestStatus) {
            case 'pending':
                return {
                    text: 'Pending',
                    className: 'bg-orange-500 text-white hover:bg-orange-600 cursor-not-allowed',
                    disabled: true,
                    onClick: null,
                    href: null,
                };
            case 'approved':
                return {
                    text: 'Propose Changes',
                    className: 'bg-green-600 text-white hover:bg-green-700',
                    disabled: false,
                    onClick: null,
                    href: `/collaboration/${idea.slug}/propose`,
                };
            case 'rejected':
                return {
                    text: 'Rejected',
                    className: 'bg-red-500 text-white hover:bg-red-600 cursor-not-allowed',
                    disabled: true,
                    onClick: null,
                    href: null,
                };
            default:
                return {
                    text: 'Collaborate',
                    className: 'bg-purple-600 text-white hover:bg-purple-700',
                    disabled: false,
                    onClick: () => handleSendCollaborationRequest(idea),
                    href: null,
                };
        }
    }

    // Helper function to generate pagination URLs with current search and filter parameters
    function getPaginationUrl(page: number) {
        const params = new URLSearchParams();
        
        if (query) params.set('search', query);
        if (Object.keys(filters).length > 0) {
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== null && value !== undefined && value !== '') {
                    if (Array.isArray(value)) {
                        value.forEach(v => params.append(`${key}[]`, v));
                    } else {
                        params.set(key, value.toString());
                    }
                }
            });
        }
        
        params.set('page', page.toString());
        
        return `${collaborationRoutes.hub.url()}?${params.toString()}`;
    }

    // Generate pagination links with ellipsis logic
    function generatePaginationLinks() {
        const currentPage = ideas.current_page;
        const lastPage = ideas.last_page;
        const links = [];

        if (lastPage <= 7) {
            // Show all pages if 7 or fewer
            for (let i = 1; i <= lastPage; i++) {
                links.push({
                    page: i,
                    url: getPaginationUrl(i),
                    isActive: i === currentPage,
                    isEllipsis: false,
                });
            }
        } else {
            // Always show first page
            links.push({
                page: 1,
                url: getPaginationUrl(1),
                isActive: 1 === currentPage,
                isEllipsis: false,
            });

            // Add ellipsis after first page if needed
            if (currentPage > 4) {
                links.push({
                    page: null,
                    url: null,
                    isActive: false,
                    isEllipsis: true,
                });
            }

            // Show pages around current page
            const start = Math.max(2, currentPage - 1);
            const end = Math.min(lastPage - 1, currentPage + 1);

            for (let i = start; i <= end; i++) {
                links.push({
                    page: i,
                    url: getPaginationUrl(i),
                    isActive: i === currentPage,
                    isEllipsis: false,
                });
            }

            // Add ellipsis before last page if needed
            if (currentPage < lastPage - 3) {
                links.push({
                    page: null,
                    url: null,
                    isActive: false,
                    isEllipsis: true,
                });
            }

            // Always show last page
            links.push({
                page: lastPage,
                url: getPaginationUrl(lastPage),
                isActive: lastPage === currentPage,
                isEllipsis: false,
            });
        }

        return links;
    }

    // dropdown is handled by the shared DropdownMenu component

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Collaboration Hub" />
            {/* 60% Background - Light: white, Dark: gray-900 */}
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6 bg-transparent text-[#231F20] dark:text-white transition-colors mt-[40px]">
                {/* Header */}
                <div className="flex items-center justify-between mb-2">
                    <div className="relative mb-2">
                        <h2 className="flex items-center gap-2 text-3xl md:text-4xl font-extrabold tracking-tight">
                            <UsersRound className='w-10 h-10 text-3xl md:text-4xl dark:text-[#fff200] font-black' />
                            <span className='bg-clip-text text-transparent bg-gradient-to-r from-black to-[#fff200] dark:bg-gradient-to-r dark:from-[#FFF200] dark:to-[#F8EBD5]'>
                                Collaboration Hub
                            </span>
                        </h2>
                        <div className='absolute -bottom-3 left-0 h-1 w-16 bg-gradient-to-r from-black to-[#fff200] dark:bg-gradient-to-r dark:from-[#FFF200] dark:to-[#F8EBD5] rounded-full animate-pulse'></div>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="w-full">
                    <SearchBar 
                        value={query} 
                        onChange={setQuery} 
                        placeholder="Search collaboration opportunities..."
                        showFilterToggle={true}
                        filterVisible={filtersVisible}
                        onFilterToggle={() => setFiltersVisible(!filtersVisible)}
                        activeFilterCount={Object.keys(filters).length}
                    />
                </div>

                {/* Advanced Filters */}
                <div className="w-full">
                    <AdvancedFilters 
                        filters={filterConfig} 
                        onFilterChange={setFilters}
                        visible={filtersVisible}
                    />
                </div>

                {loading ? (
                    <div className="flex flex-col gap-6">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div
                                key={i}
                                className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-[#F8EBD5]/30 dark:bg-gray-800/30 backdrop-blur-lg p-6 shadow-lg animate-pulse"
                            >
                                <div className="flex items-start gap-4">
                                    <Skeleton className="h-12 w-12 rounded-full" />
                                    <div className="flex-1">
                                        <Skeleton className="h-4 w-3/4 mb-2" />
                                        <Skeleton className="h-3 w-1/2" />
                                    </div>
                                    <Skeleton className="h-6 w-20" />
                                </div>

                                <div className="mt-4">
                                    <Skeleton className="h-3 w-full" />
                                </div>
                                <div className="mt-2">
                                    <Skeleton className="h-3 w-5/6" />
                                </div>

                                <div className="mt-4 flex items-center gap-2">
                                    <Skeleton className="h-8 w-full" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : ideas.data.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full py-16">
                        <PlaceholderPattern className="w-32 h-32 opacity-20" />
                        <h3 className="text-xl font-bold mt-6 text-[#231F20] dark:text-white">No ideas yet</h3>
                        <p className="text-sm text-[#9B9EA4] mt-2">Start by creating your first idea.</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-6">
                        {ideas.data.map((idea) => {
                            return (
                                <div
                                    key={idea.id}
                                    className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-[#F8EBD5]/30 dark:bg-[#F8EBD5]/10 backdrop-blur-lg p-6 shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300"
                                >
                                    <div className="flex items-start justify-end mb-4">
                                        <button
                                            onClick={() => toggleLike(idea.id)}
                                            className={`flex gap-2 items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${likedMap[idea.id]
                                                    ? 'text-red-600 bg-red-50 dark:bg-red-900/20 shadow-md'
                                                    : 'text-gray-600 dark:text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20'}`}
                                            aria-pressed={!!likedMap[idea.id]}
                                        >
                                            <Heart
                                                className={`h-5 w-5 ${likedMap[idea.id] ? 'fill-current' : 'fill-none'}`} />
                                            <span>{likesMap[idea.id] ?? idea.likes_count ?? 0}</span>
                                            <span>likes</span>
                                        </button>
                                    </div>

                                    <div className="flex items-start justify-between gap-4 border-b border-gray-200 dark:border-gray-700 pb-6">
                                        <div className="flex items-start gap-4">
                                            <img
                                                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                                                    idea.title
                                                )}&background=FFF200&color=231F20&rounded=true&size=64`}
                                                alt="avatar"
                                                className="h-16 w-16 rounded-full object-cover shadow-md" />

                                            <div>
                                                <h3 className="text-xl font-bold text-[#231F20] dark:text-white">{idea.title}</h3>
                                                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 line-clamp-3">{idea.description}</p>
                                                <div className="flex mt-2 gap-2 text-sm text-[#9B9EA4]">
                                                    <span>
                                                        Author :
                                                    </span>
                                                    <span className="text-[#231F20] dark:text-white font-medium">
                                                        {idea.user?.name ?? 'Unknown'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 border-b border-gray-200 dark:border-gray-700 py-3">
                                        <div className="flex mt-2 gap-2 text-sm text-[#9B9EA4]">
                                            <span>
                                                Created on :
                                            </span>
                                            <span>{idea.created_at}</span>
                                        </div>
                                        <div className="flex mt-2 gap-2 text-sm text-[#9B9EA4]">
                                            <span>
                                                Status :
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
                                                {idea.status ?? 'N/A'}
                                            </span>
                                        </div>
                                        <div className="flex mt-2 gap-2 text-sm text-[#9B9EA4] items-center">
                                            <span>Collaboration :</span>
                                            <span className={`px-2 py-1 rounded-full text-xs ${idea.collaboration_enabled ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-800 dark:bg-gray-700/30 dark:text-gray-400'}`}>
                                                {idea.collaboration_enabled ? 'On' : 'Off'}
                                            </span>
                                        </div>
                                        <div className="flex mt-2 gap-2 text-sm text-[#9B9EA4] items-center">
                                            <span>Comments :</span>
                                            <span className={`px-2 py-1 rounded-full text-xs ${idea.comments_enabled ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-800 dark:bg-gray-700/30 dark:text-gray-400'}`}>
                                                {idea.comments_enabled ? 'On' : 'Off'}
                                            </span>
                                        </div>
                                        <div className="flex mt-2 gap-2 text-sm text-[#9B9EA4] items-center">
                                            <span>Team Effort :</span>
                                            <span className={`px-2 py-1 rounded-full text-xs ${idea.team_effort ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-800 dark:bg-gray-700/30 dark:text-gray-400'}`}>
                                                {idea.team_effort ? 'Yes' : 'No'}
                                            </span>
                                        </div>
                                        {idea.collaboration_deadline && (
                                            <div className="flex mt-2 gap-2 text-sm text-[#9B9EA4]">
                                                <span>Deadline :</span>
                                                <span className="text-orange-600 dark:text-orange-400 font-medium">
                                                    {new Date(idea.collaboration_deadline).toLocaleDateString()}
                                                </span>
                                            </div>
                                        )}
                                        {idea.thematic_area && (
                                            <div className="flex mt-2 gap-2 text-sm text-[#9B9EA4]">
                                                <span>Thematic Area :</span>
                                                <span className="text-blue-600 dark:text-blue-400 font-medium">
                                                    {idea.thematic_area.name}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* 30% Secondary - Stats section with gray/secondary colors */}
                                    <div className="mt-6 flex flex-col space-x-0 xl:space-x-4 justify-between gap-4 xl:gap-0">
                                        <div className='flex flex-wrap space-y-2 sm:space-y-0 sm:space-x-2 pb-4 border-b border-gray-200 dark:border-gray-700'>
                                            <div className="w-fit flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 border-r border-gray-300 dark:border-gray-700 px-4 first:pl-0">
                                                <span className="font-medium">Revisions:</span> {idea.current_revision_number ?? 0}
                                            </div>
                                            <div className="w-fit flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 border-r border-gray-300 dark:border-gray-700 px-4">
                                                <span className="font-medium">Team:</span> {idea.team_members_count ?? 0}
                                            </div>
                                            <div className="w-fit flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 border-r border-gray-300 dark:border-gray-700 px-4">
                                                <span className="font-medium">Collabos:</span> {idea.collaboration_members_count ?? 0}
                                            </div>
                                            {idea.attachment_filename && (
                                                <div className="w-fit flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 border-r border-gray-300 dark:border-gray-700 px-4">
                                                    <span className="font-medium">Attachment:</span> 
                                                    <span className="text-green-600 dark:text-green-400">✓</span>
                                                </div>
                                            )}
                                            {idea.original_idea_disclaimer && (
                                                <div className="w-fit flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 px-4">
                                                    <span className="font-medium">Original:</span> 
                                                    <span className="text-blue-600 dark:text-blue-400">✓</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* 10% Accent - Action buttons with primary yellow */}
                                        <div className="my-4">
                                            <div className="flex flex-wrap gap-2 items-center">
                                                <Link href={ideasRoutes.show.url(idea.slug!)} className="flex items-center gap-2 p-4 sm:px-4 sm:py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm font-medium shadow-md hover:shadow-lg transition-all duration-300">
                                                    <Eye className="h-4 w-4" />
                                                    <span className='hidden sm:block'>View</span>
                                                </Link>
                                                {idea.is_author && (
                                                    <>
                                                        <Link href={ideasRoutes.edit.url(idea.slug!)} className="flex items-center gap-2 p-4 sm:px-4 sm:py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm font-medium shadow-md hover:shadow-lg transition-all duration-300">
                                                            <SquarePen className="h-4 w-4" />
                                                            <span className='hidden sm:block'>Edit</span>
                                                        </Link>
                                                        <button onClick={() => promptDeleteSingle(idea.id)} className="flex items-center gap-2 p-4 sm:px-4 sm:py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm font-medium shadow-md hover:shadow-lg transition-all duration-300">
                                                            <Trash2 className="h-4 w-4" />
                                                            <span className='hidden sm:block'>Delete</span>
                                                        </button>
                                                    </>
                                                )}

                                                <Link href={`/ideas/${idea.slug}/comments`} className="items-center gap-2 p-4 sm:px-4 sm:py-2 bg-gray-950 text-white hover:bg-gray-800 dark:bg-gray-200 dark:text-black hover:dark:bg-gray-400 rounded-lg text-sm font-medium shadow-md hover:shadow-lg hidden lg:flex transition-all duration-300">
                                                    <MessagesSquare className="h-4 w-4" />
                                                    Comments
                                                </Link>
                                                {(() => {
                                                    const buttonProps = getCollaborationButtonProps(idea);
                                                    
                                                    if (buttonProps.href) {
                                                        return (
                                                            <Link
                                                                href={buttonProps.href}
                                                                className={`items-center gap-2 p-4 sm:px-4 sm:py-2 rounded-lg text-sm font-medium shadow-md hover:shadow-lg hidden lg:flex transition-all duration-300 ${buttonProps.className}`}
                                                            >
                                                                <Send className="h-4 w-4" />
                                                                {buttonProps.text}
                                                            </Link>
                                                        );
                                                    } else {
                                                        return (
                                                            <button
                                                                onClick={buttonProps.onClick || undefined}
                                                                disabled={buttonProps.disabled}
                                                                className={`items-center gap-2 p-4 sm:px-4 sm:py-2 rounded-lg text-sm font-medium shadow-md hover:shadow-lg hidden lg:flex transition-all duration-300 ${buttonProps.className}`}
                                                            >
                                                                <Send className="h-4 w-4" />
                                                                {buttonProps.text}
                                                            </button>
                                                        );
                                                    }
                                                })()}
                                                <a
                                                    href={`/ideas/${idea.slug}/attachment`}
                                                    target="_blank"
                                                    className="items-center gap-2 p-4 sm:px-4 sm:py-2 bg-gray-950 text-white hover:bg-gray-800 dark:bg-gray-200 dark:text-black hover:dark:bg-gray-400 rounded-lg text-sm font-medium shadow-md hover:shadow-lg hidden lg:flex transition-all duration-300"
                                                >
                                                    <FileText className="h-4 w-4" />
                                                    PDF
                                                </a>

                                                <div className="relative lg:hidden">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <button
                                                                type="button"
                                                                className="gap-2 p-4 sm:px-4 sm:py-2 bg-gray-950 text-white hover:bg-gray-800 dark:bg-gray-200 dark:text-black hover:dark:bg-gray-400 rounded-lg text-sm font-medium inline-flex items-center shadow-md hover:shadow-lg transition-all duration-300"
                                                            >
                                                                <EllipsisVertical className="h-4 w-4" />
                                                                <span className='hidden sm:block'>More</span>
                                                            </button>
                                                        </DropdownMenuTrigger>

                                                        <DropdownMenuContent sideOffset={8} align="end" className="bg-gray-950 text-white dark:bg-gray-200 dark:text-black border border-gray-200 dark:border-gray-700 shadow-xl">
                                                            <DropdownMenuItem asChild>
                                                                <Link href={`/ideas/${idea.slug}/comments`} className="w-full text-left flex items-center px-4 py-2">
                                                                    <MessagesSquare className="h-4 w-4 text-white dark:text-black" />
                                                                    Comments
                                                                </Link>
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem asChild>
                                                                {(() => {
                                                                    const buttonProps = getCollaborationButtonProps(idea);
                                                                    
                                                                    const getTextColor = () => {
                                                                        const status = idea.collaboration_request?.status || collaborationRequests[idea.id]?.status;
                                                                        switch (status) {
                                                                            case 'pending':
                                                                                return 'text-orange-500 dark:text-orange-400';
                                                                            case 'approved':
                                                                                return 'text-green-600 dark:text-green-400';
                                                                            case 'rejected':
                                                                                return 'text-red-500 dark:text-red-400';
                                                                            default:
                                                                                return 'text-white dark:text-black';
                                                                        }
                                                                    };
                                                                    
                                                                    if (buttonProps.href) {
                                                                        return (
                                                                            <Link
                                                                                href={buttonProps.href}
                                                                                className={`w-full text-left flex items-center px-4 py-2`}
                                                                            >
                                                                                <Send className={`h-4 w-4 mr-2 ${getTextColor()}`} />
                                                                                <span className={getTextColor()}>{buttonProps.text}</span>
                                                                            </Link>
                                                                        );
                                                                    } else {
                                                                        return (
                                                                            <button
                                                                                onClick={buttonProps.onClick || undefined}
                                                                                disabled={buttonProps.disabled}
                                                                                className={`w-full text-left flex items-center px-4 py-2 ${buttonProps.disabled ? 'disabled:cursor-not-allowed opacity-50' : ''}`}
                                                                            >
                                                                                <Send className={`h-4 w-4 mr-2 ${getTextColor()}`} />
                                                                                <span className={getTextColor()}>{buttonProps.text}</span>
                                                                            </button>
                                                                        );
                                                                    }
                                                                })()}
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem asChild>
                                                                <a
                                                                    href={`/ideas/${idea.slug}/attachment`}
                                                                    target="_blank"
                                                                    className="w-full text-left flex items-center px-4 py-2">
                                                                    <FileText className="h-4 w-4 text-white dark:text-black" />
                                                                    PDF
                                                                </a>
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Pagination */}
                {ideas.last_page > 1 && (
                    <div className="mt-8 flex justify-center">
                        <Pagination>
                            <PaginationContent>
                                {ideas.current_page > 1 && (
                                    <PaginationItem>
                                        <PaginationPrevious href={getPaginationUrl(ideas.current_page - 1)} />
                                    </PaginationItem>
                                )}

                                {generatePaginationLinks().map((link, index) => (
                                    <PaginationItem key={index}>
                                        {link.isEllipsis ? (
                                            <PaginationEllipsis />
                                        ) : (
                                            <PaginationLink
                                                href={link.url!}
                                                isActive={link.isActive}
                                            >
                                                {link.page}
                                            </PaginationLink>
                                        )}
                                    </PaginationItem>
                                ))}

                                {ideas.current_page < ideas.last_page && (
                                    <PaginationItem>
                                        <PaginationNext href={getPaginationUrl(ideas.current_page + 1)} />
                                    </PaginationItem>
                                )}
                            </PaginationContent>
                        </Pagination>
                    </div>
                )}

                {/* Pagination Info */}
                {ideas.total > 0 && (
                    <div className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
                        Showing {ideas.from} to {ideas.to} of {ideas.total} results
                    </div>
                )}
            </div>
            <DeleteModal open={singleDeleteOpen} title="Delete idea" body={`Are you sure you want to delete idea #${singleDeleteId}?`} onCancel={() => setSingleDeleteOpen(false)} onConfirm={confirmSingleDelete} />
        </AppLayout>
    );
}
