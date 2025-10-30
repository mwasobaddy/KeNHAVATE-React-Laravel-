import React, { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';
import reviewRoutes from '@/routes/review';
import { 
    ClipboardList,
    Eye,
    Clock,
    CheckCircle,
    XCircle,
    AlertTriangle,
    User,
    Calendar,
    Trophy,
    MessageSquare,
    Search,
    Settings,
    DollarSign,
    TrendingUp,
    Users,
    FileText
} from 'lucide-react';
import { toast } from 'react-toastify';

interface User {
    id: number;
    name: string;
    email: string;
}

interface Challenge {
    id: number;
    title: string;
    description: string;
    status: string;
    total_funding: number;
    created_at: string;
}

interface ChallengeSubmissionReview {
    id: number;
    recommendation: 'approve' | 'revise' | 'reject';
    comments: string;
    reviewed_at: string;
    reviewer: User;
    review_stage: string;
}

interface ChallengeSubmissionDecision {
    id: number;
    decision: string;
    compiled_comments: string;
    decided_at: string;
}

interface ChallengeSubmission {
    id: number;
    title: string;
    executive_summary: string;
    status: string;
    total_budget: number;
    implementation_timeline: string;
    created_at: string;
    updated_at: string;
    user: User;
    challenge: Challenge;
    stage1_reviews: ChallengeSubmissionReview[];
    stage2_reviews: ChallengeSubmissionReview[];
    reviews: ChallengeSubmissionReview[];
    latest_decision?: ChallengeSubmissionDecision;
}

interface Props {
    stage1Submissions: ChallengeSubmission[];
    stage2Submissions: ChallengeSubmission[];
    completedSubmissions: ChallengeSubmission[];
    stats: {
        stage1_pending: number;
        stage2_pending: number;
        decisions_made: number;
        total_submissions_processed: number;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Home',
        href: '/',
    },
    {
        title: 'Review',
        href: '#',
    },
    {
        title: 'Challenge DD Workflow',
        href: '#',
    },
];

export default function ChallengeDDWorkflow({ stage1Submissions, stage2Submissions, completedSubmissions, stats }: Props) {
    const [activeTab, setActiveTab] = useState<'stage1' | 'stage2' | 'completed'>('stage1');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSubmission, setSelectedSubmission] = useState<ChallengeSubmission | null>(null);
    const [decision, setDecision] = useState<'approve' | 'revise' | 'reject'>('approve');
    const [compiledComments, setCompiledComments] = useState('');
    const [ddComments, setDdComments] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'stage 1 review':
                return <Clock className="h-4 w-4 text-blue-500" />;
            case 'stage 2 review':
                return <Clock className="h-4 w-4 text-purple-500" />;
            case 'approved':
                return <CheckCircle className="h-4 w-4 text-green-500" />;
            case 'rejected':
                return <XCircle className="h-4 w-4 text-red-500" />;
            case 'stage 1 revise':
                return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
            case 'stage 2 revise':
                return <AlertTriangle className="h-4 w-4 text-orange-500" />;
            default:
                return <AlertTriangle className="h-4 w-4 text-gray-500" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'stage 1 review':
                return 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30';
            case 'stage 2 review':
                return 'text-purple-600 bg-purple-100 dark:text-purple-400 dark:bg-purple-900/30';
            case 'approved':
                return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30';
            case 'rejected':
                return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30';
            case 'stage 1 revise':
                return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30';
            case 'stage 2 revise':
                return 'text-orange-600 bg-orange-100 dark:text-orange-400 dark:bg-orange-900/30';
            default:
                return 'text-gray-600 bg-gray-100 dark:text-gray-300 dark:bg-gray-700/50';
        }
    };

    const getRecommendationColor = (recommendation: string) => {
        switch (recommendation) {
            case 'approve':
                return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30';
            case 'revise':
                return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30';
            case 'reject':
                return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30';
            default:
                return 'text-gray-600 bg-gray-100 dark:text-gray-300 dark:bg-gray-700/50';
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-KE', {
            style: 'currency',
            currency: 'KES',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const filteredSubmissions = (submissions: ChallengeSubmission[]) => {
        return submissions.filter(submission => {
            const matchesSearch = submission.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                submission.executive_summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                submission.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                submission.challenge.title.toLowerCase().includes(searchTerm.toLowerCase());
            
            return matchesSearch;
        });
    };

    const openDecisionDialog = (submission: ChallengeSubmission) => {
        setSelectedSubmission(submission);
        setDecision('approve');
        setCompiledComments('');
        setDdComments('');
        setIsDialogOpen(true);
    };

    const submitDecision = async () => {
        if (!selectedSubmission || !compiledComments.trim()) {
            toast.error("Please provide compiled comments for your decision.");
            return;
        }

        setIsSubmitting(true);

        try {
            await router.post(reviewRoutes.challenges.dd.decision.make(selectedSubmission.id).url, {
                decision,
                compiled_comments: compiledComments,
                dd_comments: ddComments,
                review_stage: selectedSubmission.status.includes('stage 1') ? 'stage1' : 'stage2'
            });

            toast.success("Decision submitted successfully!");

            setIsDialogOpen(false);
            setSelectedSubmission(null);
        } catch (error) {
            toast.error("Failed to submit decision. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const SubmissionCard = ({ submission }: { submission: ChallengeSubmission }) => {
        const stage1Reviews = submission.stage1_reviews || [];
        const stage2Reviews = submission.stage2_reviews || [];
        const currentReviews = submission.status.includes('stage 1') ? stage1Reviews : stage2Reviews;
        
        const recommendationCounts = currentReviews.reduce(
            (acc, review) => {
                acc[review.recommendation] = (acc[review.recommendation] || 0) + 1;
                return acc;
            },
            {} as Record<string, number>
        );

        const canMakeDecision = currentReviews.length >= 2; // Minimum reviews required

        return (
            <div className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm p-6 hover:shadow-lg transition-all">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                            <h4 className="text-lg font-medium text-gray-900 dark:text-white line-clamp-2">
                                {submission.title}
                            </h4>
                            <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(submission.status)}`}>
                                {getStatusIcon(submission.status)}
                                {submission.status.toUpperCase()}
                            </div>
                        </div>
                        <div className="mb-3">
                            <div className="flex items-center gap-2 mb-2">
                                <Trophy className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                                    Challenge: {submission.challenge.title}
                                </span>
                            </div>
                            <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
                                {submission.executive_summary}
                            </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                            <div className="flex items-center gap-1">
                                <User className="h-4 w-4" />
                                <span>By: {submission.user.name}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                <span>Submitted: {formatDate(submission.created_at)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <DollarSign className="h-4 w-4" />
                                <span>Budget: {formatCurrency(submission.total_budget)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <Users className="h-4 w-4" />
                                <span>Stage {submission.status.includes('stage 1') ? '1' : '2'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Review Summary */}
                <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-sm text-gray-700 dark:text-gray-300">Review Summary</h4>
                        <div className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300">
                            <MessageSquare className="h-3 w-3" />
                            {currentReviews.length} Reviews
                        </div>
                    </div>
                    <div className="flex gap-2 text-xs">
                        {Object.entries(recommendationCounts).map(([rec, count]) => (
                            <div key={rec} className="flex items-center gap-1">
                                <div className={`px-2 py-1 rounded-full text-xs font-medium ${getRecommendationColor(rec)}`}>
                                    {rec.toUpperCase()}
                                </div>
                                <span className="text-gray-600 dark:text-gray-400">({count})</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Latest Decision */}
                {submission.latest_decision && (
                    <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-sm text-blue-700 dark:text-blue-300">Latest Decision</h4>
                            <div className="text-xs text-blue-600 dark:text-blue-400">
                                {formatDate(submission.latest_decision.decided_at)}
                            </div>
                        </div>
                        <p className="text-sm text-blue-700 dark:text-blue-300 line-clamp-2">
                            {submission.latest_decision.compiled_comments}
                        </p>
                    </div>
                )}

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                            <MessageSquare className="h-4 w-4" />
                            {currentReviews.length} Reviews
                        </span>
                    </div>
                    <div className="flex gap-2">
                        <Link
                            href={reviewRoutes.challenges.dd.submission.show(submission.id).url}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all text-sm"
                        >
                            <Eye className="h-4 w-4" />
                            View Details
                        </Link>
                        {canMakeDecision && (
                            <button
                                onClick={() => openDecisionDialog(submission)}
                                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-all text-sm font-medium"
                            >
                                <Settings className="h-4 w-4" />
                                Make Decision
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Challenge DD Workflow Dashboard" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6 bg-transparent text-[#231F20] dark:text-white transition-colors mt-[40px]">
                {/* Header */}
                <div className="relative mb-6">
                    <h2 className="flex items-center gap-2 text-3xl md:text-4xl font-extrabold tracking-tight">
                        <Settings className='w-10 h-10 text-3xl md:text-4xl dark:text-[#fff200] font-black' />
                        <span className='bg-clip-text text-transparent bg-gradient-to-r from-black to-[#fff200] dark:bg-gradient-to-r dark:from-[#FFF200] dark:to-[#F8EBD5]'>
                            DD Workflow Dashboard
                        </span>
                    </h2>
                    <div className='absolute -bottom-3 left-0 h-1 w-16 bg-gradient-to-r from-black to-[#fff200] dark:bg-gradient-to-r dark:from-[#FFF200] dark:to-[#F8EBD5] rounded-full animate-pulse'></div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-4">
                        Manage challenge submission workflow. Make decisions on submissions that have completed review stages.
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white dark:bg-gray-800/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                <Clock className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.stage1_pending || 0}</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Stage 1 Pending</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                                <Clock className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.stage2_pending || 0}</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Stage 2 Pending</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.decisions_made || 0}</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Decisions Made</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                                <Trophy className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.total_submissions_processed || 0}</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Total Processed</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Search */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search submissions by title, summary, challenge, or author..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
                    <button
                        onClick={() => setActiveTab('stage1')}
                        className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                            activeTab === 'stage1'
                                ? 'border-[#FFF200] text-[#231F20] dark:text-[#FFF200]'
                                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                        }`}
                    >
                        Stage 1 Decisions ({stage1Submissions.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('stage2')}
                        className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                            activeTab === 'stage2'
                                ? 'border-[#FFF200] text-[#231F20] dark:text-[#FFF200]'
                                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                        }`}
                    >
                        Stage 2 Decisions ({stage2Submissions.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('completed')}
                        className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                            activeTab === 'completed'
                                ? 'border-[#FFF200] text-[#231F20] dark:text-[#FFF200]'
                                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                        }`}
                    >
                        Completed ({completedSubmissions.length})
                    </button>
                </div>

                {/* Tab Content */}
                {activeTab === 'stage1' && (
                    <div className="space-y-4">
                        {filteredSubmissions(stage1Submissions).length === 0 ? (
                            <div className="text-center py-12">
                                <Clock className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">
                                    No Stage 1 submissions awaiting decision
                                </h3>
                                <p className="text-sm text-gray-500 dark:text-gray-500">
                                    Submissions will appear here when they have completed Stage 1 review.
                                </p>
                            </div>
                        ) : (
                            filteredSubmissions(stage1Submissions).map((submission) => (
                                <SubmissionCard key={submission.id} submission={submission} />
                            ))
                        )}
                    </div>
                )}

                {activeTab === 'stage2' && (
                    <div className="space-y-4">
                        {filteredSubmissions(stage2Submissions).length === 0 ? (
                            <div className="text-center py-12">
                                <Clock className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">
                                    No Stage 2 submissions awaiting decision
                                </h3>
                                <p className="text-sm text-gray-500 dark:text-gray-500">
                                    Submissions will appear here when they have completed Stage 2 review.
                                </p>
                            </div>
                        ) : (
                            filteredSubmissions(stage2Submissions).map((submission) => (
                                <SubmissionCard key={submission.id} submission={submission} />
                            ))
                        )}
                    </div>
                )}

                {activeTab === 'completed' && (
                    <div className="space-y-4">
                        {filteredSubmissions(completedSubmissions).length === 0 ? (
                            <div className="text-center py-12">
                                <CheckCircle className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">
                                    No completed submissions
                                </h3>
                                <p className="text-sm text-gray-500 dark:text-gray-500">
                                    Submissions will appear here after final decisions have been made.
                                </p>
                            </div>
                        ) : (
                            filteredSubmissions(completedSubmissions).map((submission) => (
                                <SubmissionCard key={submission.id} submission={submission} />
                            ))
                        )}
                    </div>
                )}

                {/* Decision Dialog */}
                {isDialogOpen && selectedSubmission && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                            <div className="mb-4">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                    Make Decision: {selectedSubmission.title}
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Review the submission details and make your final decision.
                                </p>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                                        Decision
                                    </label>
                                    <div className="flex gap-3">
                                        {['approve', 'revise', 'reject'].map((option) => (
                                            <label key={option} className="flex items-center">
                                                <input
                                                    type="radio"
                                                    value={option}
                                                    checked={decision === option}
                                                    onChange={(e) => setDecision(e.target.value as 'approve' | 'revise' | 'reject')}
                                                    className="mr-2"
                                                />
                                                <span className="capitalize text-gray-700 dark:text-gray-300">{option}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                                        Compiled Comments (Required)
                                    </label>
                                    <textarea
                                        value={compiledComments}
                                        onChange={(e) => setCompiledComments(e.target.value)}
                                        placeholder="Provide a comprehensive summary of the reviews and your decision rationale..."
                                        rows={4}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                    />
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                                        Additional DD Comments (Optional)
                                    </label>
                                    <textarea
                                        value={ddComments}
                                        onChange={(e) => setDdComments(e.target.value)}
                                        placeholder="Add any additional comments or instructions..."
                                        rows={3}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                                <button
                                    onClick={() => setIsDialogOpen(false)}
                                    className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={submitDecision}
                                    disabled={isSubmitting || !compiledComments.trim()}
                                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                                >
                                    {isSubmitting ? 'Submitting...' : 'Submit Decision'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}