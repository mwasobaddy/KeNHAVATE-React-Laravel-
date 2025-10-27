import { Head, Link, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import ideasRoutes from '@/routes/ideas';
import { useForm } from '@inertiajs/react';
import { useState } from 'react';
import {
    ArrowLeft,
    MessageSquare,
    Send,
    User,
    Calendar,
    FileText,
    Home,
    Lightbulb,
    CheckCircle2,
    AlertCircle
} from 'lucide-react';

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
}

interface Comment {
    id: number;
    content: string;
    user: {
        id: number;
        name: string;
    };
    created_at: string;
}

interface Props {
    idea: Idea;
    comments: Comment[];
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

export default function Comments({ idea, comments }: Props) {
    const form = useForm({
        content: '',
    });

    const [clientError, setClientError] = useState<string | null>(null);

    function submit(e: React.FormEvent) {
        e.preventDefault();
        setClientError(null);

        if (!form.data.content.trim()) {
            setClientError('Comment cannot be empty');
            return;
        }

        form.post(`/ideas/${idea.slug}/comments`, {
            preserveScroll: true,
            onSuccess: () => {
                form.reset();
            },
        });
    }

    return (
        <AppLayout breadcrumbs={[...breadcrumbs, { title: `Comments: ${idea.title}`, href: '#' }]}>
            <Head title={`Comments - ${idea.title}`} />

            {/* Main Container */}
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6 bg-transparent text-[#231F20] dark:text-white transition-colors">
                {/* Header with back button */}
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-4">
                        <Link
                            href={ideasRoutes.index.url()}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
                        >
                            <ArrowLeft className="h-5 w-5" />
                            Back to Ideas
                        </Link>
                        <div className="relative">
                            <h2 className="flex items-center gap-2 text-3xl md:text-4xl font-extrabold tracking-tight">
                                <MessageSquare className='w-10 h-10 text-3xl md:text-4xl dark:text-[#fff200] font-black' />
                                <span className='bg-clip-text text-transparent bg-gradient-to-r from-black to-[#fff200] dark:bg-gradient-to-r dark:from-[#FFF200] dark:to-[#F8EBD5]'>
                                    Comments
                                </span>
                            </h2>
                            <div className='absolute -bottom-3 left-0 h-1 w-16 bg-gradient-to-r from-black to-[#fff200] dark:bg-gradient-to-r dark:from-[#FFF200] dark:to-[#F8EBD5] rounded-full animate-pulse'></div>
                        </div>
                    </div>
                </div>

                {/* Idea Summary Card */}
                <div className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-[#F8EBD5]/30 dark:bg-[#F8EBD5]/10 backdrop-blur-lg p-6 shadow-lg">
                    <div className="flex items-start gap-4">
                        <img
                            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                                idea.title
                            )}&background=FFF200&color=231F20&rounded=true&size=64`}
                            alt="idea avatar"
                            className="h-16 w-16 rounded-full object-cover shadow-md" />

                        <div className="flex-1">
                            <h3 className="text-xl font-bold text-[#231F20] dark:text-white">{idea.title}</h3>
                            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 line-clamp-3">{idea.description}</p>

                            <div className="flex items-center gap-4 mt-4 text-sm text-[#9B9EA4]">
                                <div className="flex items-center gap-2">
                                    <User className="h-4 w-4" />
                                    <span>By {idea.user?.name || 'Unknown'}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4" />
                                    <span>{idea.created_at}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <FileText className="h-4 w-4" />
                                    <span>Status: {idea.status || 'N/A'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Add Comment Form */}
                {idea.comments_enabled ? (
                    <div className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-[#F8EBD5]/30 dark:bg-[#F8EBD5]/10 backdrop-blur-lg p-6 shadow-lg">
                        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                            <h2 className="text-lg font-semibold flex items-center gap-2 text-gray-900 dark:text-white">
                                <MessageSquare className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                Add a Comment
                            </h2>
                        </div>

                        <form onSubmit={submit} className="p-6 pt-0">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Your Comment <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        rows={4}
                                        placeholder="Share your thoughts, feedback, or questions about this idea..."
                                        value={form.data.content}
                                        onChange={(e) => form.setData('content', e.target.value)}
                                        className="w-full px-3 py-2 rounded-xl border border-[#9B9EA4]/30 text-sm bg-white/80 dark:bg-gray-900/50 text-[#231F20] dark:text-[#F8EBD5] resize-none"
                                        disabled={form.processing}
                                    />
                                    {form.errors.content && (
                                        <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400 mt-2">
                                            <AlertCircle className="h-4 w-4" />
                                            {form.errors.content}
                                        </div>
                                    )}
                                    {clientError && (
                                        <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400 mt-2">
                                            <AlertCircle className="h-4 w-4" />
                                            {clientError}
                                        </div>
                                    )}
                                </div>

                                <div className="flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={form.processing}
                                        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#FFF200] text-[#231F20] hover:bg-yellow-400 transition disabled:opacity-50 border border-black"
                                    >
                                        {form.processing ? (
                                            <>
                                                <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                Posting...
                                            </>
                                        ) : (
                                            <>
                                                <Send className="h-5 w-5" />
                                                Post Comment
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                ) : (
                    <div className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-red-50 dark:bg-red-900/20 backdrop-blur-lg p-6 shadow-lg">
                        <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
                            <AlertCircle className="h-6 w-6" />
                            <div>
                                <h3 className="font-semibold">Comments Disabled</h3>
                                <p className="text-sm">Comments are currently disabled for this idea.</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Comments List */}
                <div className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-[#F8EBD5]/30 dark:bg-[#F8EBD5]/10 backdrop-blur-lg shadow-lg">
                    <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                        <h2 className="text-lg font-semibold flex items-center gap-2 text-gray-900 dark:text-white">
                            <MessageSquare className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                            Comments ({comments.length})
                        </h2>
                    </div>

                    <div className="p-6">
                        {comments.length === 0 ? (
                            <div className="text-center py-12">
                                <MessageSquare className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">No comments yet</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-500">
                                    {idea.comments_enabled ? 'Be the first to share your thoughts!' : 'Comments are disabled for this idea.'}
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {comments.map((comment) => (
                                    <div key={comment.id} className="flex gap-4 p-4 rounded-xl bg-white/50 dark:bg-gray-800/30 border border-gray-100 dark:border-gray-700">
                                        <img
                                            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                                                comment.user.name
                                            )}&background=6B7280&color=FFFFFF&rounded=true&size=40`}
                                            alt={`${comment.user.name} avatar`}
                                            className="h-10 w-10 rounded-full object-cover flex-shrink-0" />

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="font-semibold text-[#231F20] dark:text-white">{comment.user.name}</span>
                                                <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                                    <Calendar className="h-3 w-3" />
                                                    {new Date(comment.created_at).toLocaleDateString('en-US', {
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{comment.content}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}