import React, { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';
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
    FileText,
    DollarSign,
    TrendingUp
} from 'lucide-react';

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
    recommendation: string;
    comments: string;
    reviewed_at: string;
    reviewer: User;
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
    stage1_reviews_count: number;
    stage2_reviews_count: number;
    average_stage1_rating?: number;
    has_reviewed: boolean;
}

interface Props {
    submissionsForReview: ChallengeSubmission[];
    reviewedSubmissions: ChallengeSubmission[];
    stats: {
        pending_count: number;
        reviewed_count: number;
        total_reviews: number;
        avg_reviews_per_submission: number;
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
        title: 'Challenge Board Dashboard',
        href: '#',
    },
];

export default function ChallengeBoardDashboard({ submissionsForReview, reviewedSubmissions, stats }: Props) {
    const [activeTab, setActiveTab] = useState<'pending' | 'reviewed'>('pending');
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'stage 1 review':
                return <Clock className="h-4 w-4 text-yellow-500" />;
            case 'stage 2 review':
                return <Clock className="h-4 w-4 text-blue-500" />;
            case 'approved':
                return <CheckCircle className="h-4 w-4 text-green-500" />;
            case 'rejected':
                return <XCircle className="h-4 w-4 text-red-500" />;
            case 'stage 2 revise':
                return <AlertTriangle className="h-4 w-4 text-orange-500" />;
            default:
                return <AlertTriangle className="h-4 w-4 text-gray-500" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'stage 1 review':
                return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30';
            case 'stage 2 review':
                return 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30';
            case 'approved':
                return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30';
            case 'rejected':
                return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30';
            case 'stage 2 revise':
                return 'text-orange-600 bg-orange-100 dark:text-orange-400 dark:bg-orange-900/30';
            default:
                return 'text-gray-600 bg-gray-100 dark:text-gray-300 dark:bg-gray-700/50';
        }
    };

    const getRecommendationIcon = (recommendation: string) => {
        switch (recommendation) {
            case 'approve':
                return <CheckCircle className="h-4 w-4 text-green-500" />;
            case 'revise':
                return <AlertTriangle className="h-4 w-4 text-orange-500" />;
            case 'reject':
                return <XCircle className="h-4 w-4 text-red-500" />;
            default:
                return null;
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-KE', {
            style: 'currency',
            currency: 'KES',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const filteredSubmissions = (submissions: ChallengeSubmission[]) => {
        return submissions.filter(submission => {
            const matchesSearch = submission.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                submission.executive_summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                submission.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                submission.challenge.title.toLowerCase().includes(searchTerm.toLowerCase());
            
            const matchesStatus = statusFilter === 'all' || submission.status === statusFilter;
            
            return matchesSearch && matchesStatus;
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Challenge Board Review Dashboard" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6 bg-transparent text-[#231F20] dark:text-white transition-colors">
                {/* Header */}
                <div className="relative mb-6">
                    <h2 className="flex items-center gap-2 text-3xl md:text-4xl font-extrabold tracking-tight">
                        <ClipboardList className='w-10 h-10 text-3xl md:text-4xl dark:text-[#fff200] font-black' />
                        <span className='bg-clip-text text-transparent bg-gradient-to-r from-black to-[#fff200] dark:bg-gradient-to-r dark:from-[#FFF200] dark:to-[#F8EBD5]'>
                            Board Review Dashboard
                        </span>
                    </h2>
                    <div className='absolute -bottom-3 left-0 h-1 w-16 bg-gradient-to-r from-black to-[#fff200] dark:bg-gradient-to-r dark:from-[#FFF200] dark:to-[#F8EBD5] rounded-full animate-pulse'></div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-4">
                        Review challenge submissions for Stage 2 evaluation. Evaluate submissions that have passed Stage 1 SME review.
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
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.pending_count}</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Pending Review</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.reviewed_count}</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Completed Reviews</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                                <TrendingUp className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total_reviews}</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Total Reviews</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                                <Trophy className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.avg_reviews_per_submission.toFixed(1)}</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Avg Reviews/Submission</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Search and Filters */}
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
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="all">All Status</option>
                        <option value="stage 2 review">Stage 2 Review</option>
                        <option value="stage 2 revise">Stage 2 Revise</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                    </select>
                </div>

                {/* Tab Navigation */}
                <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
                    <button
                        onClick={() => setActiveTab('pending')}
                        className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                            activeTab === 'pending'
                                ? 'border-[#FFF200] text-[#231F20] dark:text-[#FFF200]'
                                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                        }`}
                    >
                        Pending Review ({submissionsForReview.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('reviewed')}
                        className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                            activeTab === 'reviewed'
                                ? 'border-[#FFF200] text-[#231F20] dark:text-[#FFF200]'
                                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                        }`}
                    >
                        Completed Reviews ({reviewedSubmissions.length})
                    </button>
                </div>

                {/* Tab Content */}
                {activeTab === 'pending' && (
                    <div className="space-y-4">
                        {filteredSubmissions(submissionsForReview).length === 0 ? (
                            <div className="text-center py-12">
                                <Trophy className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">
                                    No submissions pending review
                                </h3>
                                <p className="text-sm text-gray-500 dark:text-gray-500">
                                    {searchTerm || statusFilter !== 'all' 
                                        ? 'No submissions match your current filters.' 
                                        : 'All available submissions have been reviewed or are still in Stage 1 review.'}
                                </p>
                            </div>
                        ) : (
                            filteredSubmissions(submissionsForReview).map((submission) => (
                                <div key={submission.id} className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h4 className="text-lg font-medium text-gray-900 dark:text-white">
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
                                                    <span>Submitted: {submission.created_at}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <DollarSign className="h-4 w-4" />
                                                    <span>Budget: {formatCurrency(submission.total_budget)}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <MessageSquare className="h-4 w-4" />
                                                    <span>Stage 1 Reviews: {submission.stage1_reviews_count}</span>
                                                </div>
                                                {submission.average_stage1_rating && (
                                                    <div className="flex items-center gap-1">
                                                        <TrendingUp className="h-4 w-4" />
                                                        <span>Avg Rating: {submission.average_stage1_rating.toFixed(1)}/5</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-end gap-3">
                                        <Link
                                            href={route('challenges.board.submission.show', submission.id)}
                                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#FFF200] text-[#231F20] hover:bg-yellow-400 transition-all font-medium"
                                        >
                                            <Eye className="h-4 w-4" />
                                            Review Submission
                                        </Link>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {activeTab === 'reviewed' && (
                    <div className="space-y-4">
                        {filteredSubmissions(reviewedSubmissions).length === 0 ? (
                            <div className="text-center py-12">
                                <CheckCircle className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">
                                    No completed reviews
                                </h3>
                                <p className="text-sm text-gray-500 dark:text-gray-500">
                                    {searchTerm || statusFilter !== 'all' 
                                        ? 'No reviewed submissions match your current filters.' 
                                        : 'You haven\'t completed any Stage 2 reviews yet.'}
                                </p>
                            </div>
                        ) : (
                            filteredSubmissions(reviewedSubmissions).map((submission) => (
                                <div key={submission.id} className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h4 className="text-lg font-medium text-gray-900 dark:text-white">
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
                                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
                                                <div className="flex items-center gap-1">
                                                    <User className="h-4 w-4" />
                                                    <span>By: {submission.user.name}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="h-4 w-4" />
                                                    <span>Submitted: {submission.created_at}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <DollarSign className="h-4 w-4" />
                                                    <span>Budget: {formatCurrency(submission.total_budget)}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <MessageSquare className="h-4 w-4" />
                                                    <span>Reviews: S1({submission.stage1_reviews_count}) S2({submission.stage2_reviews_count})</span>
                                                </div>
                                            </div>
                                            
                                            {/* My Review */}
                                            {submission.stage2_reviews.length > 0 && (
                                                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 mt-3">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <MessageSquare className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">My Stage 2 Review:</span>
                                                        <div className="flex items-center gap-1">
                                                            {getRecommendationIcon(submission.stage2_reviews[0].recommendation)}
                                                            <span className="text-xs font-medium uppercase">
                                                                {submission.stage2_reviews[0].recommendation}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                                                        {submission.stage2_reviews[0].comments}
                                                    </p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                                                        Reviewed: {submission.stage2_reviews[0].reviewed_at}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-end gap-3">
                                        <Link
                                            href={route('challenges.board.submission.show', submission.id)}
                                            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all text-sm"
                                        >
                                            <Eye className="h-4 w-4" />
                                            View Details
                                        </Link>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}