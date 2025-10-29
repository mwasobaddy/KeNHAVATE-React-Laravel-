import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import ideasRoutes from '@/routes/ideas';
import { EllipsisVertical, Eye, FileText, MessagesSquare, SquarePen, Trash2, UsersRound, Power, Heart, Home, Lightbulb, Plus } from 'lucide-react';
import { useEffect, useState, useMemo } from 'react';
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import SearchBar from '@/components/SearchBar';
import AdvancedFilters, { type FilterConfig } from '@/components/AdvancedFilters';
import SelectionToolbar from '@/components/SelectionToolbar';
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
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Home',
        href: '/ideas',
        icon: Home,
    },
    {
        title: 'Ideas',
        href: ideasRoutes.index.url(),
        icon: Lightbulb,
    },
];

export default function Index() {
    const { ideas } = usePage<{ ideas: Idea[] }>().props;
    const [query, setQuery] = useState('');
    const [filters, setFilters] = useState<Record<string, any>>({});
    const [filtersVisible, setFiltersVisible] = useState(false);
    const [selected, setSelected] = useState<Record<number, boolean>>({});
    const [loading, setLoading] = useState(false);
    const [likedMap, setLikedMap] = useState<Record<number, boolean>>({});
    const [likesMap, setLikesMap] = useState<Record<number, number>>({});
    const [collaborationMap, setCollaborationMap] = useState<Record<number, boolean>>({});
    const [commentsMap, setCommentsMap] = useState<Record<number, boolean>>({});
    const [singleDeleteOpen, setSingleDeleteOpen] = useState(false);
    const [singleDeleteId, setSingleDeleteId] = useState<number | null>(null);
    const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);

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
            options: [
                // These would typically come from a thematic areas API or props
                // For now, adding common ones - should be dynamic
                { value: '1', label: 'Technology & Innovation' },
                { value: '2', label: 'Healthcare & Medicine' },
                { value: '3', label: 'Education & Learning' },
                { value: '4', label: 'Environment & Sustainability' },
                { value: '5', label: 'Business & Economics' },
                { value: '6', label: 'Social Impact' },
            ],
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

    // initialize likes state from server props
    useEffect(() => {
        const lm: Record<number, boolean> = {};
        const lc: Record<number, number> = {};
        const cm: Record<number, boolean> = {};
        const com: Record<number, boolean> = {};
        ideas.forEach((i) => {
            lm[i.id] = i.liked_by_user ?? false;
            lc[i.id] = i.likes_count ?? 0;
            cm[i.id] = i.collaboration_enabled ?? false;
            com[i.id] = i.comments_enabled ?? false;
        });
        setLikedMap(lm);
        setLikesMap(lc);
        setCollaborationMap(cm);
        setCommentsMap(com);
    }, [ideas]);

    const filteredIdeas = useMemo(() => {
        return ideas.filter((idea) => {
            // SearchBar filter (query)
            if (query && !`${idea.title} ${idea.description}`.toLowerCase().includes(query.toLowerCase())) return false;
            
            // Status filter
            if (filters.status && idea.status !== filters.status) return false;
            
            // Thematic Area filter
            if (filters.thematicArea && idea.thematic_area) {
                if (idea.thematic_area.id.toString() !== filters.thematicArea) return false;
            } else if (filters.thematicArea && !idea.thematic_area) {
                return false; // Filter requires thematic area but idea doesn't have one
            }
            
            // Min Revisions filter
            if (filters.minRevisions && (idea.current_revision_number ?? 0) < filters.minRevisions) return false;
            
            // Max Revisions filter
            if (filters.maxRevisions && (idea.current_revision_number ?? 0) > filters.maxRevisions) return false;
            
            // Collaboration Deadline filter
            if (filters.collaborationDeadline && idea.collaboration_deadline) {
                const ideaDate = new Date(idea.collaboration_deadline);
                const filterDate = new Date(filters.collaborationDeadline);
                if (ideaDate.toDateString() !== filterDate.toDateString()) return false;
            }
            
            // Created After filter
            if (filters.createdAfter) {
                const ideaDate = new Date(idea.created_at);
                const filterDate = new Date(filters.createdAfter);
                if (ideaDate < filterDate) return false;
            }
            
            // Created Before filter
            if (filters.createdBefore) {
                const ideaDate = new Date(idea.created_at);
                const filterDate = new Date(filters.createdBefore);
                filterDate.setHours(23, 59, 59, 999); // End of day
                if (ideaDate > filterDate) return false;
            }
            
            // Features filter (checkbox array)
            if (filters.features && Array.isArray(filters.features) && filters.features.length > 0) {
                for (const feature of filters.features) {
                    switch (feature) {
                        case 'collaboration_enabled':
                            if (!idea.collaboration_enabled) return false;
                            break;
                        case 'comments_enabled':
                            if (!idea.comments_enabled) return false;
                            break;
                        case 'team_effort':
                            if (!idea.team_effort) return false;
                            break;
                        case 'original_idea_disclaimer':
                            if (!idea.original_idea_disclaimer) return false;
                            break;
                        case 'has_attachment':
                            if (!idea.attachment_filename) return false;
                            break;
                    }
                }
            }
            
            return true;
        });
    }, [ideas, query, filters]);

    function onSelectAll(checked: boolean) {
        const map: Record<number, boolean> = {};
        filteredIdeas.forEach((i) => (map[i.id] = checked));
        setSelected(map);
    }

    function onSelectOne(id: number, checked: boolean) {
        setSelected((s) => ({ ...s, [id]: checked }));
    }

    function getSelectedIds() {
        return Object.entries(selected).filter(([, v]) => v).map(([k]) => Number(k));
    }

    function exportSelected(format: 'csv' | 'pdf' | 'docx') {
        const ids = getSelectedIds();
        const rows = ideas.filter((i) => ids.includes(i.id)).map((i) => ({ id: i.id, title: i.title, description: i.description, status: i.status }));
        if (format === 'csv') {
            const header = 'id,title,description,status\n';
            const body = rows.map((r) => `${r.id},"${(r.title || '').replace(/"/g, '""')}","${(r.description || '').replace(/"/g, '""')}",${r.status || ''}`).join('\n');
            const csv = header + body;
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `ideas-export-${Date.now()}.csv`;
            a.click();
            URL.revokeObjectURL(url);
        } else {
            // For PDF/DOCX we can hit a backend export route if available. For now, we'll fallback to CSV and inform the user.
            exportSelected('csv');
        }
    }

    async function deleteSelected() {
        const ids = getSelectedIds();
        if (!ids.length) return;
        setBulkDeleteOpen(true);
    }

    async function confirmBulkDelete() {
        const ids = getSelectedIds();
        if (!ids.length) return setBulkDeleteOpen(false);
        try {
            const res = await fetch('/ideas/delete-selected', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '' }, body: JSON.stringify({ ids }) });
            if (res.ok) {
                router.reload();
                toast.success(`${ids.length} idea${ids.length > 1 ? 's' : ''} deleted successfully!`);
            } else {
                toast.error('Failed to delete selected ideas. Please try again.');
                console.warn('confirmBulkDelete returned', res.status);
            }
        } catch (e) {
            toast.error('Failed to delete selected ideas. Please try again.');
            console.error(e);
        } finally {
            setBulkDeleteOpen(false);
        }
    }

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

    function toggleCollaboration(id: number) {
        const currentEnabled = !!collaborationMap[id];

        // update UI optimistically
        setCollaborationMap((m) => ({ ...m, [id]: !currentEnabled }));

        // persist to backend
        fetch(`/ideas/${id}/toggle-collaboration`, { method: 'POST', headers: { 'X-Requested-With': 'XMLHttpRequest', 'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '' }, credentials: 'same-origin' })
            .then(async (res) => {
                if (!res.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await res.json();
                // reconcile server state
                setCollaborationMap((m2) => ({ ...m2, [id]: !!data.collaboration_enabled }));
                toast.success(data.collaboration_enabled ? 'Collaboration enabled!' : 'Collaboration disabled!');
            })
            .catch((err) => {
                // rollback optimistic change on error
                setCollaborationMap((m2) => ({ ...m2, [id]: currentEnabled }));
                toast.error('Failed to toggle collaboration. Please try again.');
                console.error('Failed to toggle collaboration', err);
            });
    }

    function toggleComments(id: number) {
        const currentEnabled = !!commentsMap[id];

        // update UI optimistically
        setCommentsMap((m) => ({ ...m, [id]: !currentEnabled }));

        // persist to backend
        fetch(`/ideas/${id}/toggle-comments`, { method: 'POST', headers: { 'X-Requested-With': 'XMLHttpRequest', 'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '' }, credentials: 'same-origin' })
            .then(async (res) => {
                if (!res.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await res.json();
                // reconcile server state
                setCommentsMap((m2) => ({ ...m2, [id]: !!data.comments_enabled }));
                toast.success(data.comments_enabled ? 'Comments enabled!' : 'Comments disabled!');
            })
            .catch((err) => {
                // rollback optimistic change on error
                setCommentsMap((m2) => ({ ...m2, [id]: currentEnabled }));
                toast.error('Failed to toggle comments. Please try again.');
                console.error('Failed to toggle comments', err);
            });
    }

    // dropdown is handled by the shared DropdownMenu component

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Manage Ideas" />
            {/* 60% Background - Light: white, Dark: gray-900 */}
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6 bg-transparent text-[#231F20] dark:text-white transition-colors">
                {/* Header with add idea button at the end */}
                <div className="flex items-center justify-between mb-2">
                    <div className="relative mb-2">
                        <h2 className="flex items-center gap-2 text-3xl md:text-4xl font-extrabold tracking-tight">
                            <FileText className='w-10 h-10 text-3xl md:text-4xl dark:text-[#fff200] font-black' />
                            <span className='bg-clip-text text-transparent bg-gradient-to-r from-black to-[#fff200] dark:bg-gradient-to-r dark:from-[#FFF200] dark:to-[#F8EBD5]'>
                                Manage Ideas
                            </span>
                        </h2>
                        <div className='absolute -bottom-3 left-0 h-1 w-16 bg-gradient-to-r from-black to-[#fff200] dark:bg-gradient-to-r dark:from-[#FFF200] dark:to-[#F8EBD5] rounded-full animate-pulse'></div>
                    </div>
                    <Link
                        href={ideasRoutes.create.url()}
                        className="flex flex-row gap-2 items-center border border-black dark:border-none p-4 sm:px-4 sm:py-2 bg-[#FFF200] text-[#231F20] font-semibold rounded-lg shadow-md hover:shadow-lg hover:bg-yellow-400 transition-all duration-300"
                    >
                        <Plus className='w-4 h-4' />
                        <span className='hidden sm:block'>Create Idea</span>
                    </Link>
                </div>

                {/* Search Bar */}
                <div className="w-full">
                    <SearchBar value={query} onChange={setQuery} placeholder="Search ideas..." />
                </div>

                {/* Advanced Filters */}
                <div className="w-full">
                    <AdvancedFilters 
                        filters={filterConfig} 
                        onFilterChange={setFilters}
                        visible={filtersVisible}
                        onToggle={() => setFiltersVisible(!filtersVisible)}
                        showToggleButton={true}
                    />
                </div>

                <SelectionToolbar total={ideas.length} selectedCount={getSelectedIds().length} onSelectAll={onSelectAll} onExport={exportSelected} onDeleteSelected={deleteSelected} />
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
                ) : ideas.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full py-16">
                        <PlaceholderPattern className="w-32 h-32 opacity-20" />
                        <h3 className="text-xl font-bold mt-6 text-[#231F20] dark:text-white">No ideas yet</h3>
                        <p className="text-sm text-[#9B9EA4] mt-2">Start by creating your first idea.</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-6">
                        {ideas.map((idea) => {
                            return (
                                <div
                                    key={idea.id}
                                    className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-[#F8EBD5]/30 dark:bg-[#F8EBD5]/10 backdrop-blur-lg p-6 shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <input
                                            type="checkbox"
                                            checked={!!selected[idea.id]}
                                            onChange={(e) => onSelectOne(idea.id, e.target.checked)}
                                            className="h-5 w-5 rounded border-gray-300 dark:border-gray-600 mr-3 cursor-pointer" />

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
                                            <Switch
                                                checked={!!collaborationMap[idea.id]}
                                                onCheckedChange={() => toggleCollaboration(idea.id)}
                                                className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-gray-300"
                                            />
                                        </div>
                                        <div className="flex mt-2 gap-2 text-sm text-[#9B9EA4] items-center">
                                            <span>Comments :</span>
                                            <Switch
                                                checked={!!commentsMap[idea.id]}
                                                onCheckedChange={() => toggleComments(idea.id)}
                                                className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-gray-300"
                                            />
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
                                                <Link href={ideasRoutes.edit.url(idea.slug!)} className="flex items-center gap-2 p-4 sm:px-4 sm:py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm font-medium shadow-md hover:shadow-lg transition-all duration-300">
                                                    <SquarePen className="h-4 w-4" />
                                                    <span className='hidden sm:block'>Edit</span>
                                                </Link>
                                                <button onClick={() => promptDeleteSingle(idea.id)} className="flex items-center gap-2 p-4 sm:px-4 sm:py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm font-medium shadow-md hover:shadow-lg transition-all duration-300">
                                                    <Trash2 className="h-4 w-4" />
                                                    <span className='hidden sm:block'>Delete</span>
                                                </button>

                                                <Link href={`/ideas/${idea.slug}/comments`} className="items-center gap-2 p-4 sm:px-4 sm:py-2 bg-gray-950 text-white hover:bg-gray-800 dark:bg-gray-200 dark:text-black hover:dark:bg-gray-400 rounded-lg text-sm font-medium shadow-md hover:shadow-lg hidden lg:flex transition-all duration-300">
                                                    <MessagesSquare className="h-4 w-4" />
                                                    Comments
                                                </Link>
                                                <Link className="items-center gap-2 p-4 sm:px-4 sm:py-2 bg-gray-950 text-white hover:bg-gray-800 dark:bg-gray-200 dark:text-black hover:dark:bg-gray-400 rounded-lg text-sm font-medium shadow-md hover:shadow-lg hidden lg:flex transition-all duration-300">
                                                    <UsersRound className="h-4 w-4" />
                                                    Collaborators
                                                </Link>
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
                                                                <Link href="#" className="w-full text-left flex items-center px-4 py-2">
                                                                    <UsersRound className="h-4 w-4 text-white dark:text-black" />
                                                                    Collaborators
                                                                </Link>
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
            </div>
            <DeleteModal open={singleDeleteOpen} title="Delete idea" body={`Are you sure you want to delete idea #${singleDeleteId}?`} onCancel={() => setSingleDeleteOpen(false)} onConfirm={confirmSingleDelete} />
            <DeleteModal open={bulkDeleteOpen} title="Delete selected ideas" body={`Are you sure you want to delete ${getSelectedIds().length} selected ideas?`} onCancel={() => setBulkDeleteOpen(false)} onConfirm={confirmBulkDelete} />
        </AppLayout>
    );
}
