import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes/index';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { Users, Lightbulb, Trophy, GitBranch, TrendingUp, Clock, CheckCircle, XCircle, BarChart3, Settings, FileText, Search, X, RotateCcw, Activity } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
];

interface AdminStats {
    users: {
        total: number;
        active_today: number;
        new_this_month: number;
    };
    ideas: {
        total: number;
        draft: number;
        approved: number;
        under_review: number;
        new_this_week: number;
        by_stage: {
            draft: number;
            stage1_review: number;
            stage2_review: number;
            approved: number;
            rejected: number;
            revision_requested: number;
        };
        with_collaborations: number;
    };
    challenges: {
        total: number;
        active: number;
        completed: number;
        total_funding: number;
        participated: number;
        submissions_by_status: {
            draft: number;
            submitted: number;
            under_review: number;
            approved: number;
            rejected: number;
        };
    };
    collaborations: {
        total_requests: number;
        pending: number;
        approved: number;
        rejected: number;
    };
    quick_links: Array<{
        title: string;
        description: string;
        url: string;
        icon: string;
        color: string;
    }>;
    recent_activity: {
        new_users: Array<{
            id: number;
            name: string;
            created_at: string;
        }>;
        new_ideas: Array<{
            id: number;
            title: string;
            created_at: string;
            user: {
                name: string;
            };
        }>;
        new_challenges: Array<{
            id: number;
            title: string;
            created_at: string;
        }>;
    };
}

interface BasicStats {
    ideas_submitted: {
        total: number;
        by_stage: {
            draft: number;
            stage1_review: number;
            stage2_review: number;
            approved: number;
            rejected: number;
            revision_requested: number;
        };
    };
    ideas_collaborated: {
        total_with_collaborations: number;
    };
    collaborations: {
        total_requests: number;
        by_status: {
            pending: number;
            approved: number;
            rejected: number;
        };
    };
    challenges: {
        active: number;
        participated: number;
        submissions_by_status: {
            draft: number;
            submitted: number;
            under_review: number;
            approved: number;
            rejected: number;
        };
    };
    personal_logs: Array<{
        id: number;
        action: string;
        description: string;
        timestamp: string;
        type: string;
    }>;
}

interface DdStats {
    ideas_submitted: {
        total: number;
        by_stage: {
            draft: number;
            stage1_review: number;
            stage2_review: number;
            approved: number;
            rejected: number;
            revision_requested: number;
        };
    };
    ideas_collaborated: {
        total_with_collaborations: number;
    };
    collaborations: {
        total_requests: number;
        by_status: {
            pending: number;
            approved: number;
            rejected: number;
        };
    };
    challenges: {
        active: number;
        participated: number;
        submissions_by_status: {
            draft: number;
            submitted: number;
            under_review: number;
            approved: number;
            rejected: number;
        };
    };
    review_decisions: {
        ideas_returned_for_revision: number;
        ideas_approved: number;
        ideas_rejected: number;
        challenges_created: number;
        challenge_submissions: number;
        challenges_returned_for_revision: number;
        challenges_approved: number;
        challenges_rejected: number;
    };
    organizational: {
        total_regions: number;
        total_directorates: number;
        total_departments: number;
        total_users_without_admin_role: number;
    };
    personal_logs: Array<{
        id: number;
        action: string;
        description: string;
        timestamp: string;
        type: string;
    }>;
}

interface IdeaReviewStats {
    ideas_submitted: {
        total: number;
        by_current_user: number;
        by_stage: {
            draft: number;
            stage1_review: number;
            stage2_review: number;
            approved: number;
            rejected: number;
            revision_requested: number;
        };
    };
    ideas_collaborated: {
        total_with_collaborations: number;
        my_collaboration_requests: number;
        received_collaboration_requests: number;
    };
    collaborations_sent: {
        total_sent: number;
        by_status: {
            pending: number;
            approved: number;
            rejected: number;
        };
    };
    challenges: {
        active: number;
        participated: number;
        submissions_by_status: {
            draft: number;
            submitted: number;
            under_review: number;
            approved: number;
            rejected: number;
        };
    };
    idea_reviews_done: {
        total_reviews: number;
        stage1_reviews: number;
        stage2_reviews: number;
        by_recommendation: {
            approve: number;
            revise: number;
            reject: number;
        };
    };
    recent_activity: {
        my_recent_ideas: Array<{
            id: number;
            idea_title: string;
            status: string;
            created_at: string;
        }>;
        my_recent_reviews: Array<{
            id: number;
            idea_id: number;
            review_stage: string;
            recommendation: string;
            reviewed_at: string;
            idea: {
                idea_title: string;
            };
        }>;
        my_recent_submissions: Array<{
            id: number;
            challenge_id: number;
            title: string;
            status: string;
            submitted_at: string;
            challenge: {
                title: string;
            };
        }>;
    };
}

interface ChallengeReviewStats {
    ideas_submitted: {
        total: number;
        by_stage: {
            draft: number;
            stage1_review: number;
            stage2_review: number;
            approved: number;
            rejected: number;
            revision_requested: number;
        };
    };
    ideas_collaborated: {
        total_with_collaborations: number;
    };
    collaborations: {
        total_requests: number;
        by_status: {
            pending: number;
            approved: number;
            rejected: number;
        };
    };
    challenges: {
        active: number;
        participated: number;
        submissions_by_status: {
            draft: number;
            submitted: number;
            under_review: number;
            approved: number;
            rejected: number;
        };
    };
    challenge_reviews_done: {
        total_reviews: number;
        stage1_reviews: number;
        stage2_reviews: number;
        by_recommendation: {
            approve: number;
            revise: number;
            reject: number;
        };
    };
    personal_logs: Array<{
        id: number;
        action: string;
        description: string;
        timestamp: string;
        type: string;
    }>;
}

interface Props {
    adminStats?: AdminStats;
    basicStats?: BasicStats;
    ddStats?: DdStats;
    ideaReviewStats?: IdeaReviewStats;
    challengeReviewStats?: ChallengeReviewStats;
    [key: string]: any; // Allow additional props
}

function StatCard({ title, value, subtitle, icon: Icon, color }: {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: any;
    color: string;
}) {
    const colorClasses = {
        blue: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
        green: 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400',
        yellow: 'bg-yellow-50 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400',
        red: 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400',
        purple: 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400',
        gray: 'bg-gray-50 text-gray-600 dark:bg-gray-900/20 dark:text-gray-400',
        indigo: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400',
    };

    return (
        <div className="relative overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
                    {subtitle && <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{subtitle}</p>}
                </div>
                <div className={`p-3 rounded-lg ${colorClasses[color as keyof typeof colorClasses] || colorClasses.blue}`}>
                    <Icon className="h-6 w-6" />
                </div>
            </div>
        </div>
    );
}

function QuickLinkCard({ link }: { link: AdminStats['quick_links'][0] }) {
    const iconMap = {
        users: Users,
        lightbulb: Lightbulb,
        trophy: Trophy,
        'git-branch': GitBranch,
        settings: Settings,
        'bar-chart': BarChart3,
    };

    const Icon = iconMap[link.icon as keyof typeof iconMap] || Settings;

    const colorClasses = {
        blue: 'hover:bg-blue-50 hover:border-blue-200 dark:hover:bg-blue-900/20',
        green: 'hover:bg-green-50 hover:border-green-200 dark:hover:bg-green-900/20',
        yellow: 'hover:bg-yellow-50 hover:border-yellow-200 dark:hover:bg-yellow-900/20',
        purple: 'hover:bg-purple-50 hover:border-purple-200 dark:hover:bg-purple-900/20',
        gray: 'hover:bg-gray-50 hover:border-gray-200 dark:hover:bg-gray-900/20',
        indigo: 'hover:bg-indigo-50 hover:border-indigo-200 dark:hover:bg-indigo-900/20',
    };

    return (
        <a
            href={link.url}
            className={`block p-4 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50 transition-all ${colorClasses[link.color as keyof typeof colorClasses] || colorClasses.blue}`}
        >
            <div className="flex items-center gap-3">
                <Icon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">{link.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{link.description}</p>
                </div>
            </div>
        </a>
    );
}

export default function Dashboard() {
    const { adminStats, basicStats, ddStats, ideaReviewStats, challengeReviewStats } = usePage<Props>().props;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6 bg-transparent text-[#231F20] dark:text-white transition-colors mt-[50px]">
                {/* Admin Stats Section */}
                {adminStats && (
                    <div className="space-y-6">
                        {/* Welcome Header */}
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
                                <p className="text-gray-600 dark:text-gray-400 mt-1">Welcome back! Here's what's happening in your system.</p>
                            </div>
                        </div>

                        {/* Stats Cards */}
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                            <StatCard
                                title="Total Users"
                                value={adminStats.users.total}
                                subtitle={`${adminStats.users.new_this_month} new this month`}
                                icon={Users}
                                color="blue"
                            />
                            <StatCard
                                title="Total Ideas"
                                value={adminStats.ideas.total}
                                subtitle={`${adminStats.ideas.new_this_week} new this week`}
                                icon={Lightbulb}
                                color="yellow"
                            />
                            <StatCard
                                title="Active Challenges"
                                value={adminStats.challenges.active}
                                subtitle={`$${adminStats.challenges.total_funding.toLocaleString()} total funding`}
                                icon={Trophy}
                                color="purple"
                            />
                            <StatCard
                                title="Collaboration Requests"
                                value={adminStats.collaborations.total_requests}
                                subtitle={`${adminStats.collaborations.pending} pending`}
                                icon={GitBranch}
                                color="green"
                            />
                        </div>

                        {/* Detailed Stats */}
                        <div className="grid gap-6 md:grid-cols-2">
                            {/* Ideas Breakdown */}
                            <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Ideas Overview</h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">Draft</span>
                                        <span className="font-medium">{adminStats.ideas.by_stage.draft}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">Stage 1 Review</span>
                                        <span className="font-medium">{adminStats.ideas.by_stage.stage1_review}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">Stage 2 Review</span>
                                        <span className="font-medium">{adminStats.ideas.by_stage.stage2_review}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">Approved</span>
                                        <span className="font-medium">{adminStats.ideas.by_stage.approved}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">Rejected</span>
                                        <span className="font-medium">{adminStats.ideas.by_stage.rejected}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">Revision Requested</span>
                                        <span className="font-medium">{adminStats.ideas.by_stage.revision_requested}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">With Collaborations</span>
                                        <span className="font-medium">{adminStats.ideas.with_collaborations}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Collaborations Breakdown */}
                            <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Collaboration Status</h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                                            <Clock className="h-4 w-4" />
                                            Pending
                                        </span>
                                        <span className="font-medium">{adminStats.collaborations.pending}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                                            <CheckCircle className="h-4 w-4" />
                                            Approved
                                        </span>
                                        <span className="font-medium">{adminStats.collaborations.approved}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                                            <XCircle className="h-4 w-4" />
                                            Rejected
                                        </span>
                                        <span className="font-medium">{adminStats.collaborations.rejected}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Challenge Submissions Breakdown */}
                        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Challenge Submissions Overview</h3>
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">Draft</span>
                                        <span className="font-medium">{adminStats.challenges.submissions_by_status.draft}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">Submitted</span>
                                        <span className="font-medium">{adminStats.challenges.submissions_by_status.submitted}</span>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">Under Review</span>
                                        <span className="font-medium">{adminStats.challenges.submissions_by_status.under_review}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">Approved</span>
                                        <span className="font-medium">{adminStats.challenges.submissions_by_status.approved}</span>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">Rejected</span>
                                        <span className="font-medium">{adminStats.challenges.submissions_by_status.rejected}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">Total Participants</span>
                                        <span className="font-medium">{adminStats.challenges.participated}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Quick Links */}
                        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
                            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                                {adminStats.quick_links.map((link, index) => (
                                    <QuickLinkCard key={index} link={link} />
                                ))}
                            </div>
                        </div>

                        {/* Recent Activity */}
                        <div className="grid gap-6 md:grid-cols-3">
                            {/* Recent Users */}
                            <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Users</h3>
                                <div className="space-y-3">
                                    {adminStats.recent_activity.new_users.map((user) => (
                                        <div key={user.id} className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                                                <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user.name}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    {new Date(user.created_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Recent Ideas */}
                            <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Ideas</h3>
                                <div className="space-y-3">
                                    {adminStats.recent_activity.new_ideas.map((idea) => (
                                        <div key={idea.id} className="flex items-start gap-3">
                                            <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center">
                                                <Lightbulb className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{idea.title}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    by {idea.user.name} • {new Date(idea.created_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Recent Challenges */}
                            <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Challenges</h3>
                                <div className="space-y-3">
                                    {adminStats.recent_activity.new_challenges.map((challenge) => (
                                        <div key={challenge.id} className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                                                <Trophy className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{challenge.title}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    {new Date(challenge.created_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Basic Stats Section */}
                {basicStats && (
                    <div className="space-y-6">
                        {/* Welcome Header */}
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Platform Overview</h1>
                                <p className="text-gray-600 dark:text-gray-400 mt-1">General statistics and activity overview.</p>
                            </div>
                        </div>

                        {/* Main Stats Cards */}
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                            <StatCard
                                title="Total Ideas"
                                value={basicStats.ideas_submitted.total}
                                subtitle={`${basicStats.ideas_submitted.by_stage.approved} approved`}
                                icon={Lightbulb}
                                color="yellow"
                            />
                            <StatCard
                                title="Active Challenges"
                                value={basicStats.challenges.active}
                                subtitle={`${basicStats.challenges.participated} total participants`}
                                icon={Trophy}
                                color="purple"
                            />
                            <StatCard
                                title="Collaboration Requests"
                                value={basicStats.collaborations.total_requests}
                                subtitle={`${basicStats.collaborations.by_status.pending} pending`}
                                icon={GitBranch}
                                color="green"
                            />
                            <StatCard
                                title="Ideas with Collaborations"
                                value={basicStats.ideas_collaborated.total_with_collaborations}
                                subtitle="Collaboration enabled"
                                icon={Users}
                                color="blue"
                            />
                        </div>

                        {/* Ideas by Stage */}
                        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Ideas by Stage</h3>
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">Draft</span>
                                        <span className="font-medium">{basicStats.ideas_submitted.by_stage.draft}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">Stage 1 Review</span>
                                        <span className="font-medium">{basicStats.ideas_submitted.by_stage.stage1_review}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">Stage 2 Review</span>
                                        <span className="font-medium">{basicStats.ideas_submitted.by_stage.stage2_review}</span>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">Approved</span>
                                        <span className="font-medium">{basicStats.ideas_submitted.by_stage.approved}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">Rejected</span>
                                        <span className="font-medium">{basicStats.ideas_submitted.by_stage.rejected}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">Revision Requested</span>
                                        <span className="font-medium">{basicStats.ideas_submitted.by_stage.revision_requested}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Challenge Participation & Collaboration Status */}
                        <div className="grid gap-6 md:grid-cols-2">
                            {/* Challenge Submissions */}
                            <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Challenge Participation</h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">Draft</span>
                                        <span className="font-medium">{basicStats.challenges.submissions_by_status.draft}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">Submitted</span>
                                        <span className="font-medium">{basicStats.challenges.submissions_by_status.submitted}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">Under Review</span>
                                        <span className="font-medium">{basicStats.challenges.submissions_by_status.under_review}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">Approved</span>
                                        <span className="font-medium">{basicStats.challenges.submissions_by_status.approved}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">Rejected</span>
                                        <span className="font-medium">{basicStats.challenges.submissions_by_status.rejected}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Collaboration Status */}
                            <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Collaboration Requests</h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                                            <Clock className="h-4 w-4" />
                                            Pending
                                        </span>
                                        <span className="font-medium">{basicStats.collaborations.by_status.pending}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                                            <CheckCircle className="h-4 w-4" />
                                            Approved
                                        </span>
                                        <span className="font-medium">{basicStats.collaborations.by_status.approved}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                                            <XCircle className="h-4 w-4" />
                                            Rejected
                                        </span>
                                        <span className="font-medium">{basicStats.collaborations.by_status.rejected}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Personal Activity Logs */}
                        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Activity</h3>
                            <div className="space-y-4">
                                {basicStats.personal_logs.map((log) => (
                                    <div key={log.id} className="flex items-start gap-4 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                                            log.type === 'idea' ? 'bg-yellow-100 dark:bg-yellow-900/30' :
                                            log.type === 'collaboration' ? 'bg-green-100 dark:bg-green-900/30' :
                                            log.type === 'challenge' ? 'bg-purple-100 dark:bg-purple-900/30' :
                                            log.type === 'review' ? 'bg-blue-100 dark:bg-blue-900/30' :
                                            'bg-gray-100 dark:bg-gray-900/30'
                                        }`}>
                                            {log.type === 'idea' && <Lightbulb className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />}
                                            {log.type === 'collaboration' && <GitBranch className="h-5 w-5 text-green-600 dark:text-green-400" />}
                                            {log.type === 'challenge' && <Trophy className="h-5 w-5 text-purple-600 dark:text-purple-400" />}
                                            {log.type === 'review' && <BarChart3 className="h-5 w-5 text-blue-600 dark:text-blue-400" />}
                                            {log.type === 'comment' && <Users className="h-5 w-5 text-gray-600 dark:text-gray-400" />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between">
                                                <p className="text-sm font-medium text-gray-900 dark:text-white">{log.action}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    {new Date(log.timestamp).toLocaleDateString()} {new Date(log.timestamp).toLocaleTimeString()}
                                                </p>
                                            </div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{log.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* DD Stats Section */}
                {ddStats && (
                    <div className="space-y-6">
                        {/* Welcome Header */}
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Deputy Director Dashboard</h1>
                                <p className="text-gray-600 dark:text-gray-400 mt-1">Comprehensive overview of innovation activities and organizational metrics.</p>
                            </div>
                        </div>

                        {/* Main Stats Cards */}
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                            <StatCard
                                title="Total Ideas"
                                value={ddStats.ideas_submitted.total}
                                subtitle={`${ddStats.ideas_submitted.by_stage.approved} approved`}
                                icon={Lightbulb}
                                color="yellow"
                            />
                            <StatCard
                                title="Active Challenges"
                                value={ddStats.challenges.active}
                                subtitle={`${ddStats.challenges.participated} total participants`}
                                icon={Trophy}
                                color="purple"
                            />
                            <StatCard
                                title="Review Decisions"
                                value={ddStats.review_decisions.ideas_approved + ddStats.review_decisions.ideas_rejected}
                                subtitle={`${ddStats.review_decisions.ideas_returned_for_revision} revisions requested`}
                                icon={BarChart3}
                                color="blue"
                            />
                            <StatCard
                                title="Total Users"
                                value={ddStats.organizational.total_users_without_admin_role}
                                subtitle={`${ddStats.organizational.total_regions} regions, ${ddStats.organizational.total_directorates} directorates`}
                                icon={Users}
                                color="green"
                            />
                        </div>

                        {/* Ideas and Challenges Overview */}
                        <div className="grid gap-6 md:grid-cols-2">
                            {/* Ideas by Stage */}
                            <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Ideas by Stage</h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">Draft</span>
                                        <span className="font-medium">{ddStats.ideas_submitted.by_stage.draft}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">Stage 1 Review</span>
                                        <span className="font-medium">{ddStats.ideas_submitted.by_stage.stage1_review}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">Stage 2 Review</span>
                                        <span className="font-medium">{ddStats.ideas_submitted.by_stage.stage2_review}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">Approved</span>
                                        <span className="font-medium">{ddStats.ideas_submitted.by_stage.approved}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">Rejected</span>
                                        <span className="font-medium">{ddStats.ideas_submitted.by_stage.rejected}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">Revision Requested</span>
                                        <span className="font-medium">{ddStats.ideas_submitted.by_stage.revision_requested}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Challenge Participation */}
                            <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Challenge Participation</h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">Draft</span>
                                        <span className="font-medium">{ddStats.challenges.submissions_by_status.draft}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">Submitted</span>
                                        <span className="font-medium">{ddStats.challenges.submissions_by_status.submitted}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">Under Review</span>
                                        <span className="font-medium">{ddStats.challenges.submissions_by_status.under_review}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">Approved</span>
                                        <span className="font-medium">{ddStats.challenges.submissions_by_status.approved}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">Rejected</span>
                                        <span className="font-medium">{ddStats.challenges.submissions_by_status.rejected}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Review Decisions & Organizational Stats */}
                        <div className="grid gap-6 md:grid-cols-2">
                            {/* Review Decisions */}
                            <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Review Decisions</h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">Ideas Approved</span>
                                        <span className="font-medium">{ddStats.review_decisions.ideas_approved}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">Ideas Rejected</span>
                                        <span className="font-medium">{ddStats.review_decisions.ideas_rejected}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">Ideas Returned for Revision</span>
                                        <span className="font-medium">{ddStats.review_decisions.ideas_returned_for_revision}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">Challenges Created</span>
                                        <span className="font-medium">{ddStats.review_decisions.challenges_created}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">Challenge Submissions</span>
                                        <span className="font-medium">{ddStats.review_decisions.challenge_submissions}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">Challenges Approved</span>
                                        <span className="font-medium">{ddStats.review_decisions.challenges_approved}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">Challenges Rejected</span>
                                        <span className="font-medium">{ddStats.review_decisions.challenges_rejected}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">Challenges Returned for Revision</span>
                                        <span className="font-medium">{ddStats.review_decisions.challenges_returned_for_revision}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Organizational Stats */}
                            <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Organizational Overview</h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">Total Regions</span>
                                        <span className="font-medium">{ddStats.organizational.total_regions}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">Total Directorates</span>
                                        <span className="font-medium">{ddStats.organizational.total_directorates}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">Total Departments</span>
                                        <span className="font-medium">{ddStats.organizational.total_departments}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">Users (Non-Admin)</span>
                                        <span className="font-medium">{ddStats.organizational.total_users_without_admin_role}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Collaboration Status */}
                        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Collaboration Overview</h3>
                            <div className="grid gap-4 md:grid-cols-3">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{ddStats.collaborations.total_requests}</div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400">Total Requests</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">{ddStats.collaborations.by_status.approved}</div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400">Approved</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-red-600 dark:text-red-400">{ddStats.collaborations.by_status.rejected}</div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400">Rejected</div>
                                </div>
                            </div>
                            <div className="mt-4 text-center">
                                <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{ddStats.collaborations.by_status.pending}</div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">Pending</div>
                            </div>
                        </div>

                        {/* Personal Activity Logs */}
                        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Activity</h3>
                            <div className="space-y-4">
                                {ddStats.personal_logs.map((log) => (
                                    <div key={log.id} className="flex items-start gap-4 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                                            log.type === 'review' ? 'bg-blue-100 dark:bg-blue-900/30' :
                                            log.type === 'challenge' ? 'bg-purple-100 dark:bg-purple-900/30' :
                                            log.type === 'decision' ? 'bg-green-100 dark:bg-green-900/30' :
                                            log.type === 'revision' ? 'bg-yellow-100 dark:bg-yellow-900/30' :
                                            log.type === 'report' ? 'bg-indigo-100 dark:bg-indigo-900/30' :
                                            'bg-gray-100 dark:bg-gray-900/30'
                                        }`}>
                                            {log.type === 'review' && <BarChart3 className="h-5 w-5 text-blue-600 dark:text-blue-400" />}
                                            {log.type === 'challenge' && <Trophy className="h-5 w-5 text-purple-600 dark:text-purple-400" />}
                                            {log.type === 'decision' && <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />}
                                            {log.type === 'revision' && <XCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />}
                                            {log.type === 'report' && <BarChart3 className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />}
                                            {log.type === 'meeting' && <Users className="h-5 w-5 text-gray-600 dark:text-gray-400" />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between">
                                                <p className="text-sm font-medium text-gray-900 dark:text-white">{log.action}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    {new Date(log.timestamp).toLocaleDateString()} {new Date(log.timestamp).toLocaleTimeString()}
                                                </p>
                                            </div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{log.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Idea Review Stats Section */}
                {ideaReviewStats && (
                    <div className="space-y-6">
                        {/* Welcome Header */}
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Idea Review Dashboard</h1>
                                <p className="text-gray-600 dark:text-gray-400 mt-1">Track your ideas, collaborations, and review activities.</p>
                            </div>
                        </div>

                        {/* Main Stats Cards */}
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                            <StatCard
                                title="My Ideas Submitted"
                                value={ideaReviewStats.ideas_submitted.by_current_user}
                                subtitle={`Total ideas: ${ideaReviewStats.ideas_submitted.total}`}
                                icon={Lightbulb}
                                color="yellow"
                            />
                            <StatCard
                                title="Collaborations Sent"
                                value={ideaReviewStats.collaborations_sent.total_sent}
                                subtitle={`${ideaReviewStats.collaborations_sent.by_status.pending} pending`}
                                icon={GitBranch}
                                color="green"
                            />
                            <StatCard
                                title="Challenges Participated"
                                value={ideaReviewStats.challenges.participated}
                                subtitle={`${ideaReviewStats.challenges.active} active challenges`}
                                icon={Trophy}
                                color="purple"
                            />
                            <StatCard
                                title="Reviews Completed"
                                value={ideaReviewStats.idea_reviews_done.total_reviews}
                                subtitle={`${ideaReviewStats.idea_reviews_done.stage1_reviews} stage 1, ${ideaReviewStats.idea_reviews_done.stage2_reviews} stage 2`}
                                icon={BarChart3}
                                color="blue"
                            />
                        </div>

                        {/* Ideas by Stage */}
                        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Ideas by Stage</h3>
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">Draft</span>
                                        <span className="font-medium">{ideaReviewStats.ideas_submitted.by_stage.draft}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">Stage 1 Review</span>
                                        <span className="font-medium">{ideaReviewStats.ideas_submitted.by_stage.stage1_review}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">Stage 2 Review</span>
                                        <span className="font-medium">{ideaReviewStats.ideas_submitted.by_stage.stage2_review}</span>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">Approved</span>
                                        <span className="font-medium">{ideaReviewStats.ideas_submitted.by_stage.approved}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">Rejected</span>
                                        <span className="font-medium">{ideaReviewStats.ideas_submitted.by_stage.rejected}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">Revision Requested</span>
                                        <span className="font-medium">{ideaReviewStats.ideas_submitted.by_stage.revision_requested}</span>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">With Collaborations</span>
                                        <span className="font-medium">{ideaReviewStats.ideas_collaborated.total_with_collaborations}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">My Requests Sent</span>
                                        <span className="font-medium">{ideaReviewStats.ideas_collaborated.my_collaboration_requests}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">Requests Received</span>
                                        <span className="font-medium">{ideaReviewStats.ideas_collaborated.received_collaboration_requests}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Collaboration Status & Challenge Participation */}
                        <div className="grid gap-6 md:grid-cols-2">
                            {/* Collaboration Status */}
                            <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">My Collaboration Requests</h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                                            <Clock className="h-4 w-4" />
                                            Pending
                                        </span>
                                        <span className="font-medium">{ideaReviewStats.collaborations_sent.by_status.pending}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                                            <CheckCircle className="h-4 w-4" />
                                            Approved
                                        </span>
                                        <span className="font-medium">{ideaReviewStats.collaborations_sent.by_status.approved}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                                            <XCircle className="h-4 w-4" />
                                            Rejected
                                        </span>
                                        <span className="font-medium">{ideaReviewStats.collaborations_sent.by_status.rejected}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Challenge Submissions */}
                            <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">My Challenge Submissions</h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">Draft</span>
                                        <span className="font-medium">{ideaReviewStats.challenges.submissions_by_status.draft}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">Submitted</span>
                                        <span className="font-medium">{ideaReviewStats.challenges.submissions_by_status.submitted}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">Under Review</span>
                                        <span className="font-medium">{ideaReviewStats.challenges.submissions_by_status.under_review}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">Approved</span>
                                        <span className="font-medium">{ideaReviewStats.challenges.submissions_by_status.approved}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">Rejected</span>
                                        <span className="font-medium">{ideaReviewStats.challenges.submissions_by_status.rejected}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Review Activity */}
                        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">My Review Activity</h3>
                            <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Reviews by Stage</h4>
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-600 dark:text-gray-400">Stage 1 Reviews</span>
                                            <span className="font-medium">{ideaReviewStats.idea_reviews_done.stage1_reviews}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-600 dark:text-gray-400">Stage 2 Reviews</span>
                                            <span className="font-medium">{ideaReviewStats.idea_reviews_done.stage2_reviews}</span>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Reviews by Recommendation</h4>
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-600 dark:text-gray-400">Approved</span>
                                            <span className="font-medium">{ideaReviewStats.idea_reviews_done.by_recommendation.approve}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-600 dark:text-gray-400">Revision Requested</span>
                                            <span className="font-medium">{ideaReviewStats.idea_reviews_done.by_recommendation.revise}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-600 dark:text-gray-400">Rejected</span>
                                            <span className="font-medium">{ideaReviewStats.idea_reviews_done.by_recommendation.reject}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Recent Activity */}
                        <div className="grid gap-6 md:grid-cols-3">
                            {/* My Recent Ideas */}
                            <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">My Recent Ideas</h3>
                                <div className="space-y-3">
                                    {ideaReviewStats.recent_activity.my_recent_ideas.map((idea) => (
                                        <div key={idea.id} className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center">
                                                <Lightbulb className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{idea.idea_title}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                                                    {idea.status} • {new Date(idea.created_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* My Recent Reviews */}
                            <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">My Recent Reviews</h3>
                                <div className="space-y-3">
                                    {ideaReviewStats.recent_activity.my_recent_reviews.map((review) => (
                                        <div key={review.id} className="flex items-start gap-3">
                                            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                                                <BarChart3 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{review.idea.idea_title}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    {review.review_stage} • {review.recommendation} • {new Date(review.reviewed_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* My Recent Submissions */}
                            <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">My Recent Submissions</h3>
                                <div className="space-y-3">
                                    {ideaReviewStats.recent_activity.my_recent_submissions.map((submission) => (
                                        <div key={submission.id} className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                                                <Trophy className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{submission.title}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    {submission.challenge.title} • {submission.status} • {new Date(submission.submitted_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Challenge Review Stats Section */}
                {challengeReviewStats && (
                    <div className="space-y-6">
                        {/* Welcome Header */}
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Challenge Review Dashboard</h1>
                                <p className="text-gray-600 dark:text-gray-400 mt-1">Monitor challenge submissions and review activities</p>
                            </div>
                        </div>

                        {/* Main Stats Cards */}
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                            <StatCard
                                title="Total Ideas"
                                value={challengeReviewStats.ideas_submitted.total}
                                subtitle={`${challengeReviewStats.ideas_submitted.by_stage.approved} approved`}
                                icon={Lightbulb}
                                color="yellow"
                            />
                            <StatCard
                                title="Active Challenges"
                                value={challengeReviewStats.challenges.active}
                                subtitle={`${challengeReviewStats.challenges.participated} total participants`}
                                icon={Trophy}
                                color="purple"
                            />
                            <StatCard
                                title="Collaboration Requests"
                                value={challengeReviewStats.collaborations.total_requests}
                                subtitle={`${challengeReviewStats.collaborations.by_status.pending} pending`}
                                icon={GitBranch}
                                color="green"
                            />
                            <StatCard
                                title="Reviews Completed"
                                value={challengeReviewStats.challenge_reviews_done.total_reviews}
                                subtitle={`${challengeReviewStats.challenge_reviews_done.stage1_reviews} stage 1, ${challengeReviewStats.challenge_reviews_done.stage2_reviews} stage 2`}
                                icon={BarChart3}
                                color="blue"
                            />
                        </div>

                        {/* Ideas by Stage */}
                        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Ideas by Stage</h3>
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                                            <FileText className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900 dark:text-white">Draft</p>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">Initial submissions</p>
                                        </div>
                                    </div>
                                    <span className="text-2xl font-bold text-gray-900 dark:text-white">{challengeReviewStats.ideas_submitted.by_stage.draft}</span>
                                </div>
                                <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                                            <Search className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900 dark:text-white">Stage 1 Review</p>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">Under initial review</p>
                                        </div>
                                    </div>
                                    <span className="text-2xl font-bold text-gray-900 dark:text-white">{challengeReviewStats.ideas_submitted.by_stage.stage1_review}</span>
                                </div>
                                <div className="flex items-center justify-between p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                                            <CheckCircle className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900 dark:text-white">Stage 2 Review</p>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">Final review stage</p>
                                        </div>
                                    </div>
                                    <span className="text-2xl font-bold text-gray-900 dark:text-white">{challengeReviewStats.ideas_submitted.by_stage.stage2_review}</span>
                                </div>
                                <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                                            <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900 dark:text-white">Approved</p>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">Successfully approved</p>
                                        </div>
                                    </div>
                                    <span className="text-2xl font-bold text-gray-900 dark:text-white">{challengeReviewStats.ideas_submitted.by_stage.approved}</span>
                                </div>
                                <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                                            <X className="h-5 w-5 text-red-600 dark:text-red-400" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900 dark:text-white">Rejected</p>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">Not approved</p>
                                        </div>
                                    </div>
                                    <span className="text-2xl font-bold text-gray-900 dark:text-white">{challengeReviewStats.ideas_submitted.by_stage.rejected}</span>
                                </div>
                                <div className="flex items-center justify-between p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center">
                                            <RotateCcw className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900 dark:text-white">Revision Requested</p>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">Needs modification</p>
                                        </div>
                                    </div>
                                    <span className="text-2xl font-bold text-gray-900 dark:text-white">{challengeReviewStats.ideas_submitted.by_stage.revision_requested}</span>
                                </div>
                            </div>
                        </div>

                        {/* Challenge Participation & Collaboration Status */}
                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Challenge Participation</h3>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-600 dark:text-gray-400">Draft Submissions</span>
                                        <span className="font-semibold text-gray-900 dark:text-white">{challengeReviewStats.challenges.submissions_by_status.draft}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-600 dark:text-gray-400">Submitted</span>
                                        <span className="font-semibold text-gray-900 dark:text-white">{challengeReviewStats.challenges.submissions_by_status.submitted}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-600 dark:text-gray-400">Under Review</span>
                                        <span className="font-semibold text-gray-900 dark:text-white">{challengeReviewStats.challenges.submissions_by_status.under_review}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-600 dark:text-gray-400">Approved</span>
                                        <span className="font-semibold text-green-600 dark:text-green-400">{challengeReviewStats.challenges.submissions_by_status.approved}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-600 dark:text-gray-400">Rejected</span>
                                        <span className="font-semibold text-red-600 dark:text-red-400">{challengeReviewStats.challenges.submissions_by_status.rejected}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Collaboration Status</h3>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-600 dark:text-gray-400">Pending Requests</span>
                                        <span className="font-semibold text-yellow-600 dark:text-yellow-400">{challengeReviewStats.collaborations.by_status.pending}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-600 dark:text-gray-400">Approved</span>
                                        <span className="font-semibold text-green-600 dark:text-green-400">{challengeReviewStats.collaborations.by_status.approved}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-600 dark:text-gray-400">Rejected</span>
                                        <span className="font-semibold text-red-600 dark:text-red-400">{challengeReviewStats.collaborations.by_status.rejected}</span>
                                    </div>
                                    <div className="flex items-center justify-between border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
                                        <span className="text-gray-600 dark:text-gray-400">Ideas with Collaborations</span>
                                        <span className="font-semibold text-blue-600 dark:text-blue-400">{challengeReviewStats.ideas_collaborated.total_with_collaborations}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Challenge Reviews Done */}
                        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Challenge Reviews Completed</h3>
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                                <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">{challengeReviewStats.challenge_reviews_done.total_reviews}</div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400">Total Reviews</div>
                                </div>
                                <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                    <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-1">{challengeReviewStats.challenge_reviews_done.stage1_reviews}</div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400">Stage 1 Reviews</div>
                                </div>
                                <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-1">{challengeReviewStats.challenge_reviews_done.stage2_reviews}</div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400">Stage 2 Reviews</div>
                                </div>
                                <div className="text-center p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                                    <div className="text-2xl font-bold text-gray-600 dark:text-gray-400 mb-1">
                                        {challengeReviewStats.challenge_reviews_done.by_recommendation.approve + challengeReviewStats.challenge_reviews_done.by_recommendation.revise + challengeReviewStats.challenge_reviews_done.by_recommendation.reject}
                                    </div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400">Decisions Made</div>
                                </div>
                            </div>
                            <div className="mt-6 grid gap-4 md:grid-cols-3">
                                <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                    <div className="text-lg font-bold text-green-600 dark:text-green-400">{challengeReviewStats.challenge_reviews_done.by_recommendation.approve}</div>
                                    <div className="text-xs text-gray-600 dark:text-gray-400">Approved</div>
                                </div>
                                <div className="text-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                                    <div className="text-lg font-bold text-yellow-600 dark:text-yellow-400">{challengeReviewStats.challenge_reviews_done.by_recommendation.revise}</div>
                                    <div className="text-xs text-gray-600 dark:text-gray-400">Revision Requested</div>
                                </div>
                                <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                                    <div className="text-lg font-bold text-red-600 dark:text-red-400">{challengeReviewStats.challenge_reviews_done.by_recommendation.reject}</div>
                                    <div className="text-xs text-gray-600 dark:text-gray-400">Rejected</div>
                                </div>
                            </div>
                        </div>

                        {/* Personal Activity Logs */}
                        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Activity</h3>
                            <div className="space-y-4">
                                {challengeReviewStats.personal_logs.map((log) => {
                                    const getIcon = (type: string) => {
                                        switch (type) {
                                            case 'challenge_review':
                                                return <BarChart3 className="h-5 w-5 text-blue-600 dark:text-blue-400" />;
                                            case 'decision':
                                                return <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />;
                                            case 'idea':
                                                return <Lightbulb className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />;
                                            case 'collaboration':
                                                return <GitBranch className="h-5 w-5 text-purple-600 dark:text-purple-400" />;
                                            case 'challenge':
                                                return <Trophy className="h-5 w-5 text-orange-600 dark:text-orange-400" />;
                                            default:
                                                return <Activity className="h-5 w-5 text-gray-600 dark:text-gray-400" />;
                                        }
                                    };

                                    return (
                                        <div key={log.id} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                                            <div className="w-10 h-10 bg-white dark:bg-gray-700 rounded-full flex items-center justify-center shadow-sm">
                                                {getIcon(log.type)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-gray-900 dark:text-white">{log.action}</p>
                                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{log.description}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                                    {new Date(log.timestamp).toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}

                {/* Default Dashboard for non-admin users */}
                {!adminStats && !basicStats && !ddStats && !ideaReviewStats && !challengeReviewStats && (
                    <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                        <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                            <div className="relative aspect-video overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                                <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                            </div>
                            <div className="relative aspect-video overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                                <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                            </div>
                            <div className="relative aspect-video overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                                <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                            </div>
                        </div>
                        <div className="relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
                            <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
