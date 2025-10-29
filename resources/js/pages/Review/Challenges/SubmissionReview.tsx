import React, { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';
import { 
    ArrowLeft,
    Eye,
    Clock,
    CheckCircle,
    XCircle,
    AlertTriangle,
    User,
    Calendar,
    Trophy,
    MessageSquare,
    FileText,
    DollarSign,
    Download,
    Star,
    Send
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
    rating: number;
    reviewed_at: string;
    reviewer: User;
    review_stage: string;
}

interface ChallengeSubmission {
    id: number;
    title: string;
    executive_summary: string;
    problem_statement: string;
    proposed_solution: string;
    methodology: string;
    expected_outcomes: string;
    total_budget: number;
    budget_breakdown: string;
    implementation_timeline: string;
    team_composition: string;
    risk_assessment: string;
    sustainability_plan: string;
    attachment_path?: string;
    status: string;
    created_at: string;
    updated_at: string;
    user: User;
    challenge: Challenge;
    stage1_reviews: ChallengeSubmissionReview[];
    stage2_reviews: ChallengeSubmissionReview[];
}

interface Props {
    submission: ChallengeSubmission;
    reviewStage: 'sme' | 'board' | 'dd';
    canReview: boolean;
    hasReviewed: boolean;
    userReview?: ChallengeSubmissionReview;
}

export default function ChallengeSubmissionReview({ submission, reviewStage, canReview, hasReviewed, userReview }: Props) {
    const [recommendation, setRecommendation] = useState<'approve' | 'revise' | 'reject'>('approve');
    const [comments, setComments] = useState('');
    const [rating, setRating] = useState(5);
    const [isSubmitting, setIsSubmitting] = useState(false);

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
            title: `${reviewStage.toUpperCase()} Dashboard`,
            href: route(`challenges.${reviewStage}.dashboard`),
        },
        {
            title: 'Review Submission',
            href: '#',
        },
    ];

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
                return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30';
            case 'stage 2 review':
                return 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30';
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

    const getRecommendationColor = (rec: string) => {
        switch (rec) {
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
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const submitReview = async () => {
        if (!comments.trim()) {
            toast.error("Please provide comments for your review.");
            return;
        }

        setIsSubmitting(true);

        try {
            await router.post(route(`challenges.${reviewStage}.submission.review`, submission.id), {
                recommendation,
                comments,
                rating,
                review_stage: reviewStage === 'sme' ? 'stage1' : 'stage2'
            });

            toast.success("Review submitted successfully!");
        } catch (error) {
            toast.error("Failed to submit review. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const currentReviews = reviewStage === 'sme' ? submission.stage1_reviews : submission.stage2_reviews;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Review: ${submission.title}`} />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6 bg-transparent text-[#231F20] dark:text-white transition-colors">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <Link
                            href={route(`challenges.${reviewStage}.dashboard`)}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all text-sm"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back to Dashboard
                        </Link>
                        <div className="relative">
                            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                                Review Submission
                            </h1>
                            <div className='absolute -bottom-2 left-0 h-1 w-12 bg-gradient-to-r from-black to-[#fff200] dark:bg-gradient-to-r dark:from-[#FFF200] dark:to-[#F8EBD5] rounded-full'></div>
                        </div>
                    </div>
                    <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(submission.status)}`}>
                        {getStatusIcon(submission.status)}
                        {submission.status.toUpperCase()}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Submission Overview */}
                        <div className="bg-white dark:bg-gray-800/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                            <div className="mb-4">
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                                    {submission.title}
                                </h2>
                                <div className="flex items-center gap-2 mb-3">
                                    <Trophy className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                    <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                                        Challenge: {submission.challenge.title}
                                    </span>
                                </div>
                                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                                    <div className="flex items-center gap-1">
                                        <User className="h-4 w-4" />
                                        <span>Submitted by: {submission.user.name}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Calendar className="h-4 w-4" />
                                        <span>Date: {formatDate(submission.created_at)}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <DollarSign className="h-4 w-4" />
                                        <span>Budget: {formatCurrency(submission.total_budget)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Executive Summary */}
                        <div className="bg-white dark:bg-gray-800/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Executive Summary</h3>
                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                                {submission.executive_summary}
                            </p>
                        </div>

                        {/* Problem Statement */}
                        <div className="bg-white dark:bg-gray-800/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Problem Statement</h3>
                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                                {submission.problem_statement}
                            </p>
                        </div>

                        {/* Proposed Solution */}
                        <div className="bg-white dark:bg-gray-800/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Proposed Solution</h3>
                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                                {submission.proposed_solution}
                            </p>
                        </div>

                        {/* Methodology */}
                        <div className="bg-white dark:bg-gray-800/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Methodology</h3>
                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                                {submission.methodology}
                            </p>
                        </div>

                        {/* Expected Outcomes */}
                        <div className="bg-white dark:bg-gray-800/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Expected Outcomes</h3>
                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                                {submission.expected_outcomes}
                            </p>
                        </div>

                        {/* Budget Details */}
                        <div className="bg-white dark:bg-gray-800/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Budget Breakdown</h3>
                            <div className="mb-3">
                                <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                                    {formatCurrency(submission.total_budget)}
                                </span>
                                <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">Total Budget</span>
                            </div>
                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                                {submission.budget_breakdown}
                            </p>
                        </div>

                        {/* Additional Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-white dark:bg-gray-800/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Implementation Timeline</h3>
                                <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                                    {submission.implementation_timeline}
                                </p>
                            </div>
                            
                            <div className="bg-white dark:bg-gray-800/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Team Composition</h3>
                                <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                                    {submission.team_composition}
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-white dark:bg-gray-800/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Risk Assessment</h3>
                                <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                                    {submission.risk_assessment}
                                </p>
                            </div>
                            
                            <div className="bg-white dark:bg-gray-800/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Sustainability Plan</h3>
                                <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                                    {submission.sustainability_plan}
                                </p>
                            </div>
                        </div>

                        {/* Attachment */}
                        {submission.attachment_path && (
                            <div className="bg-white dark:bg-gray-800/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Attachment</h3>
                                <Link
                                    href={route('challenges.submissions.attachment', submission.id)}
                                    className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
                                >
                                    <Download className="h-4 w-4" />
                                    Download Attachment
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Review Form */}
                        {canReview && !hasReviewed && (
                            <div className="bg-white dark:bg-gray-800/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Submit Your Review</h3>
                                
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                                            Recommendation
                                        </label>
                                        <div className="flex gap-2">
                                            {['approve', 'revise', 'reject'].map((option) => (
                                                <label key={option} className="flex items-center">
                                                    <input
                                                        type="radio"
                                                        value={option}
                                                        checked={recommendation === option}
                                                        onChange={(e) => setRecommendation(e.target.value as 'approve' | 'revise' | 'reject')}
                                                        className="mr-2"
                                                    />
                                                    <span className="capitalize text-sm text-gray-700 dark:text-gray-300">{option}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                                            Rating (1-5)
                                        </label>
                                        <div className="flex gap-1">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <button
                                                    key={star}
                                                    type="button"
                                                    onClick={() => setRating(star)}
                                                    className={`text-2xl transition-colors ${
                                                        star <= rating ? 'text-yellow-500' : 'text-gray-300 dark:text-gray-600'
                                                    }`}
                                                >
                                                    <Star className="h-6 w-6" fill={star <= rating ? 'currentColor' : 'none'} />
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                                            Comments (Required)
                                        </label>
                                        <textarea
                                            value={comments}
                                            onChange={(e) => setComments(e.target.value)}
                                            placeholder="Provide detailed feedback on the submission..."
                                            rows={6}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                        />
                                    </div>

                                    <button
                                        onClick={submitReview}
                                        disabled={isSubmitting || !comments.trim()}
                                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[#FFF200] text-[#231F20] rounded-lg hover:bg-yellow-400 disabled:opacity-50 disabled:cursor-not-started transition-all font-medium"
                                    >
                                        <Send className="h-4 w-4" />
                                        {isSubmitting ? 'Submitting...' : 'Submit Review'}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* User's Review */}
                        {hasReviewed && userReview && (
                            <div className="bg-green-50 dark:bg-green-900/30 rounded-xl p-6 border border-green-200 dark:border-green-700">
                                <h3 className="text-lg font-semibold text-green-800 dark:text-green-300 mb-4">Your Review</h3>
                                
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${getRecommendationColor(userReview.recommendation)}`}>
                                            {userReview.recommendation.toUpperCase()}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <Star
                                                    key={star}
                                                    className={`h-4 w-4 ${
                                                        star <= userReview.rating ? 'text-yellow-500' : 'text-gray-300'
                                                    }`}
                                                    fill={star <= userReview.rating ? 'currentColor' : 'none'}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                    <p className="text-sm text-green-700 dark:text-green-300">
                                        {userReview.comments}
                                    </p>
                                    <p className="text-xs text-green-600 dark:text-green-400">
                                        Reviewed: {formatDate(userReview.reviewed_at)}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Other Reviews */}
                        {currentReviews.length > 0 && (
                            <div className="bg-white dark:bg-gray-800/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                    {reviewStage === 'sme' ? 'Stage 1' : 'Stage 2'} Reviews ({currentReviews.length})
                                </h3>
                                
                                <div className="space-y-4">
                                    {currentReviews.map((review) => (
                                        <div key={review.id} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                    {review.reviewer.name}
                                                </span>
                                                <div className="flex items-center gap-2">
                                                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${getRecommendationColor(review.recommendation)}`}>
                                                        {review.recommendation.toUpperCase()}
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        {[1, 2, 3, 4, 5].map((star) => (
                                                            <Star
                                                                key={star}
                                                                className={`h-3 w-3 ${
                                                                    star <= review.rating ? 'text-yellow-500' : 'text-gray-300'
                                                                }`}
                                                                fill={star <= review.rating ? 'currentColor' : 'none'}
                                                            />
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                                {review.comments}
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-500">
                                                {formatDate(review.reviewed_at)}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}