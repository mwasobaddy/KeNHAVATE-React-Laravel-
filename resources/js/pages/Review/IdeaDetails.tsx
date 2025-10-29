import React, { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';
import { 
    ArrowLeft,
    Eye,
    CheckCircle,
    XCircle,
    AlertTriangle,
    User,
    Calendar,
    BookOpen,
    MessageSquare,
    FileText,
    Users,
    Clock,
    Send
} from 'lucide-react';
import { toast } from 'react-toastify';

interface User {
    id: number;
    name: string;
}

interface ThematicArea {
    id: number;
    name: string;
}

interface TeamMember {
    id: number;
    name: string;
    email: string;
    role: string;
}

interface Review {
    id: number;
    recommendation: string;  
    comments: string;
    reviewed_at: string;
    reviewer: User;
}

interface ReviewDecision {
    id: number;
    decision: string;
    compiled_comments: string;
    dd_comments: string | null;
    decided_at: string;
    deputy_director: User;
}

interface Idea {
    id: number;
    idea_title: string;
    slug: string;
    abstract: string;
    problem_statement: string;
    proposed_solution: string;
    cost_benefit_analysis: string;
    declaration_of_interests: string;
    status: string;
    current_revision_number: number;
    created_at: string;
    updated_at: string;
    user: User;
    thematic_area: ThematicArea | null;
    team_members: TeamMember[];
    stage1_reviews: Review[];
    stage2_reviews: Review[];
    stage1_decisions: ReviewDecision[];
    stage2_decisions: ReviewDecision[];
}

interface Props {
    idea: Idea;
    canReview: boolean;
    reviewStage: 'stage1' | 'stage2' | null;
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
        title: 'Idea Details',
        href: '#',
    },
];

export default function IdeaDetails({ idea, canReview, reviewStage }: Props) {
    const [activeSection, setActiveSection] = useState<'details' | 'reviews' | 'submit'>('details');

    const { data, setData, post, processing, errors, reset } = useForm({
        recommendation: '',
        comments: '',
    });

    const handleSubmitReview = (e: React.FormEvent) => {
        e.preventDefault();
        
        post(`/review/${reviewStage === 'stage1' ? 'sme' : 'board'}/idea/${idea.id}/review`, {
            onSuccess: () => {
                toast.success('Review submitted successfully!');
                reset();
                // Navigate back to dashboard
                window.location.href = backUrl;
            },
            onError: () => {
                toast.error('Failed to submit review. Please try again.');
            }
        });
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'stage 1 review':
                return <Clock className="h-4 w-4 text-yellow-500" />;
            case 'stage 2 review':
                return <CheckCircle className="h-4 w-4 text-blue-500" />;
            case 'approved':
                return <CheckCircle className="h-4 w-4 text-green-500" />;
            case 'rejected':
                return <XCircle className="h-4 w-4 text-red-500" />;
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

    const currentReviews = reviewStage === 'stage1' ? idea.stage1_reviews : idea.stage2_reviews;
    const currentDecisions = reviewStage === 'stage1' ? idea.stage1_decisions : idea.stage2_decisions;
    const backUrl = reviewStage === 'stage1' ? '/review/sme/dashboard' : '/review/board/dashboard';

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Review - ${idea.idea_title}`} />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6 bg-transparent text-[#231F20] dark:text-white transition-colors">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <Link
                        href={backUrl}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
                    >
                        <ArrowLeft className="h-5 w-5" />
                        Back to Dashboard
                    </Link>

                    <div className="flex items-center gap-4">
                        <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(idea.status)}`}>
                            {getStatusIcon(idea.status)}
                            {idea.status.toUpperCase()}
                        </div>
                        <Link
                            href={`/ideas/${idea.slug}/view`}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
                        >
                            <FileText className="h-4 w-4" />
                            View Full Details
                        </Link>
                    </div>
                </div>

                {/* Page Title */}
                <div className="relative mb-6">
                    <h2 className="flex items-center gap-2 text-3xl md:text-4xl font-extrabold tracking-tight">
                        <Eye className='w-10 h-10 text-3xl md:text-4xl dark:text-[#fff200] font-black' />
                        <span className='bg-clip-text text-transparent bg-gradient-to-r from-black to-[#fff200] dark:bg-gradient-to-r dark:from-[#FFF200] dark:to-[#F8EBD5]'>
                            Idea Review
                        </span>
                    </h2>
                    <div className='absolute -bottom-3 left-0 h-1 w-16 bg-gradient-to-r from-black to-[#fff200] dark:bg-gradient-to-r dark:from-[#FFF200] dark:to-[#F8EBD5] rounded-full animate-pulse'></div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-4">
                        Reviewing: <span className="font-semibold">"{idea.idea_title}"</span> (Stage {reviewStage === 'stage1' ? '1' : '2'} Review)
                    </p>
                </div>

                {/* Tab Navigation */}
                <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
                    <button
                        onClick={() => setActiveSection('details')}
                        className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                            activeSection === 'details'
                                ? 'border-[#FFF200] text-[#231F20] dark:text-[#FFF200]'
                                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                        }`}
                    >
                        Idea Details
                    </button>
                    <button
                        onClick={() => setActiveSection('reviews')}
                        className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                            activeSection === 'reviews'
                                ? 'border-[#FFF200] text-[#231F20] dark:text-[#FFF200]'
                                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                        }`}
                    >
                        Reviews ({currentReviews.length})
                    </button>
                    {canReview && (
                        <button
                            onClick={() => setActiveSection('submit')}
                            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                                activeSection === 'submit'
                                    ? 'border-[#FFF200] text-[#231F20] dark:text-[#FFF200]'
                                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                            }`}
                        >
                            Submit Review
                        </button>
                    )}
                </div>

                {/* Tab Content */}
                {activeSection === 'details' && (
                    <div className="space-y-6">
                        {/* Idea Summary */}
                        <div className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-[#F8EBD5]/30 dark:bg-[#F8EBD5]/10 backdrop-blur-lg p-6">
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">{idea.idea_title}</h3>
                            <div className="grid md:grid-cols-2 gap-4 text-sm mb-4">
                                <div>
                                    <span className="font-medium text-gray-700 dark:text-gray-300">Author:</span>
                                    <p className="text-gray-900 dark:text-gray-100">{idea.user.name}</p>
                                </div>
                                <div>
                                    <span className="font-medium text-gray-700 dark:text-gray-300">Thematic Area:</span>
                                    <p className="text-gray-900 dark:text-gray-100">{idea.thematic_area?.name || 'Not specified'}</p>
                                </div>
                                <div>
                                    <span className="font-medium text-gray-700 dark:text-gray-300">Submitted:</span>
                                    <p className="text-gray-900 dark:text-gray-100">{idea.created_at}</p>
                                </div>
                                <div>
                                    <span className="font-medium text-gray-700 dark:text-gray-300">Revision:</span>
                                    <p className="text-gray-900 dark:text-gray-100">Version {idea.current_revision_number}</p>
                                </div>
                            </div>
                            
                            {/* Team Members */}
                            {idea.team_members.length > 0 && (
                                <div className="mb-4">
                                    <span className="font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2 mb-2">
                                        <Users className="h-4 w-4" />
                                        Team Members:
                                    </span>
                                    <div className="flex flex-wrap gap-2">
                                        {idea.team_members.map((member, index) => (
                                            <span key={index} className="px-2 py-1 text-xs rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                                                {member.name} ({member.role})
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Idea Content Sections */}
                        <div className="space-y-4">
                            <div className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm p-6">
                                <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Abstract</h4>
                                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{idea.abstract}</p>
                            </div>

                            <div className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm p-6">
                                <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Problem Statement</h4>
                                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{idea.problem_statement}</p>
                            </div>

                            <div className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm p-6">
                                <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Proposed Solution</h4>
                                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{idea.proposed_solution}</p>
                            </div>

                            <div className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm p-6">
                                <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Cost-Benefit Analysis</h4>
                                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{idea.cost_benefit_analysis}</p>
                            </div>

                            <div className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm p-6">
                                <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Declaration of Interests</h4>
                                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{idea.declaration_of_interests}</p>
                            </div>
                        </div>
                    </div>
                )}

                {activeSection === 'reviews' && (
                    <div className="space-y-4">
                        {currentReviews.length === 0 ? (
                            <div className="text-center py-12">
                                <MessageSquare className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">
                                    No reviews yet
                                </h3>
                                <p className="text-sm text-gray-500 dark:text-gray-500">
                                    This idea hasn't received any reviews for this stage yet.
                                </p>
                            </div>
                        ) : (
                            currentReviews.map((review) => (
                                <div key={review.id} className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <User className="h-8 w-8 text-gray-400" />
                                            <div>
                                                <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                                                    {review.reviewer.name}
                                                </h4>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                    Reviewed: {review.reviewed_at}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            {getRecommendationIcon(review.recommendation)}
                                            <span className="text-sm font-medium uppercase">
                                                {review.recommendation}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                                            {review.comments}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}

                        {/* DD Decisions */}
                        {currentDecisions.length > 0 && (
                            <div className="mt-8">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Deputy Director Decisions</h3>
                                {currentDecisions.map((decision) => (
                                    <div key={decision.id} className="w-full rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-900/20 backdrop-blur-sm p-6">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <User className="h-8 w-8 text-blue-500" />
                                                <div>
                                                    <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                                                        {decision.deputy_director.name}
                                                    </h4>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                                        Decision made: {decision.decided_at}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                {getRecommendationIcon(decision.decision)}
                                                <span className="text-sm font-medium uppercase">
                                                    {decision.decision}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                                                <h5 className="font-medium text-gray-900 dark:text-white mb-2">Compiled Comments:</h5>
                                                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                                                    {decision.compiled_comments}
                                                </p>
                                            </div>
                                            {decision.dd_comments && (
                                                <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-4">
                                                    <h5 className="font-medium text-gray-900 dark:text-white mb-2">Additional Comments:</h5>
                                                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                                                        {decision.dd_comments}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeSection === 'submit' && canReview && (
                    <div className="max-w-4xl">
                        <div className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm p-6">
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Submit Your Review</h3>
                            
                            <form onSubmit={handleSubmitReview} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                        Recommendation <span className="text-red-500">*</span>
                                    </label>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {[
                                            { value: 'approve', label: 'Approve', icon: CheckCircle, color: 'green' },
                                            { value: 'revise', label: 'Needs Revision', icon: AlertTriangle, color: 'orange' },
                                            { value: 'reject', label: 'Reject', icon: XCircle, color: 'red' }
                                        ].map((option) => (
                                            <label key={option.value} className={`
                                                flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all
                                                ${data.recommendation === option.value 
                                                    ? `border-${option.color}-500 bg-${option.color}-50 dark:bg-${option.color}-900/20` 
                                                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                                                }
                                            `}>
                                                <input
                                                    type="radio"
                                                    name="recommendation"
                                                    value={option.value}
                                                    checked={data.recommendation === option.value}
                                                    onChange={(e) => setData('recommendation', e.target.value)}
                                                    className="sr-only"
                                                />
                                                <option.icon className={`h-5 w-5 text-${option.color}-500`} />
                                                <span className="font-medium text-gray-900 dark:text-white">
                                                    {option.label}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                    {errors.recommendation && (
                                        <p className="text-red-500 text-sm mt-1">{errors.recommendation}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Review Comments <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        value={data.comments}
                                        onChange={(e) => setData('comments', e.target.value)}
                                        rows={8}
                                        className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Provide detailed feedback on the idea. Consider technical feasibility, innovation, potential impact, and areas for improvement..."
                                    />
                                    <p className="text-sm text-gray-500 mt-1">
                                        Minimum 50 characters, maximum 2000 characters ({data.comments.length}/2000)
                                    </p>
                                    {errors.comments && (
                                        <p className="text-red-500 text-sm mt-1">{errors.comments}</p>
                                    )}
                                </div>

                                <div className="flex items-center justify-end gap-4 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setActiveSection('details')}
                                        className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="flex items-center gap-2 px-6 py-2 bg-[#FFF200] text-[#231F20] rounded-lg hover:bg-yellow-400 transition-all font-medium disabled:opacity-50"
                                    >
                                        {processing ? (
                                            <>
                                                <div className="h-4 w-4 border-2 border-[#231F20] border-t-transparent rounded-full animate-spin" />
                                                Submitting...
                                            </>
                                        ) : (
                                            <>
                                                <Send className="h-4 w-4" />
                                                Submit Review
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}