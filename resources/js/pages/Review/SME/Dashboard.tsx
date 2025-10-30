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
    BookOpen,
    MessageSquare,
    Filter,
    Search
} from 'lucide-react';

interface User {
    id: number;
    name: string;
}

interface ThematicArea {
    id: number;
    name: string;
}

interface Review {
    id: number;
    recommendation: string;
    comments: string;
    reviewed_at: string;
    reviewer: User;
}

interface Idea {
    id: number;
    idea_title: string;
    slug: string;
    abstract: string;
    status: string;
    created_at: string;
    updated_at: string;
    user: User;
    thematic_area: ThematicArea | null;
    stage1_reviews: Review[];
}

interface Props {
    ideasForReview: Idea[];
    reviewedIdeas: Idea[];
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
        title: 'SME Dashboard',
        href: '#',
    },
];

export default function SMEDashboard({ ideasForReview, reviewedIdeas }: Props) {
    const [activeTab, setActiveTab] = useState<'pending' | 'reviewed'>('pending');
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');

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

    const filteredIdeas = (ideas: Idea[]) => {
        return ideas.filter(idea => {
            const matchesSearch = idea.idea_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                idea.abstract.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                idea.user.name.toLowerCase().includes(searchTerm.toLowerCase());
            
            const matchesStatus = statusFilter === 'all' || idea.status === statusFilter;
            
            return matchesSearch && matchesStatus;
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="SME Review Dashboard" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6 bg-transparent text-[#231F20] dark:text-white transition-colors mt-[40px]">
                {/* Header */}
                <div className="relative mb-6">
                    <h2 className="flex items-center gap-2 text-3xl md:text-4xl font-extrabold tracking-tight">
                        <ClipboardList className='w-10 h-10 text-3xl md:text-4xl dark:text-[#fff200] font-black' />
                        <span className='bg-clip-text text-transparent bg-gradient-to-r from-black to-[#fff200] dark:bg-gradient-to-r dark:from-[#FFF200] dark:to-[#F8EBD5]'>
                            SME Review Dashboard
                        </span>
                    </h2>
                    <div className='absolute -bottom-3 left-0 h-1 w-16 bg-gradient-to-r from-black to-[#fff200] dark:bg-gradient-to-r dark:from-[#FFF200] dark:to-[#F8EBD5] rounded-full animate-pulse'></div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-4">
                        Review ideas submitted for Stage 1 evaluation. Provide technical feedback and recommendations.
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-white dark:bg-gray-800/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                                <Clock className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{ideasForReview.length}</p>
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
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{reviewedIdeas.length}</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Completed Reviews</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                <ClipboardList className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{ideasForReview.length + reviewedIdeas.length}</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Total Ideas</p>
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
                            placeholder="Search ideas by title, description, or author..."
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
                        <option value="stage 1 review">Stage 1 Review</option>
                        <option value="stage 2 review">Stage 2 Review</option>
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
                        Pending Review ({ideasForReview.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('reviewed')}
                        className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                            activeTab === 'reviewed'
                                ? 'border-[#FFF200] text-[#231F20] dark:text-[#FFF200]'
                                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                        }`}
                    >
                        Completed Reviews ({reviewedIdeas.length})
                    </button>
                </div>

                {/* Tab Content */}
                {activeTab === 'pending' && (
                    <div className="space-y-4">
                        {filteredIdeas(ideasForReview).length === 0 ? (
                            <div className="text-center py-12">
                                <ClipboardList className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">
                                    No ideas pending review
                                </h3>
                                <p className="text-sm text-gray-500 dark:text-gray-500">
                                    {searchTerm || statusFilter !== 'all' 
                                        ? 'No ideas match your current filters.' 
                                        : 'All available ideas have been reviewed or none are currently assigned to you.'}
                                </p>
                            </div>
                        ) : (
                            filteredIdeas(ideasForReview).map((idea) => (
                                <div key={idea.id} className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                                                    {idea.idea_title}
                                                </h4>
                                                <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(idea.status)}`}>
                                                    {getStatusIcon(idea.status)}
                                                    {idea.status.toUpperCase()}
                                                </div>
                                            </div>
                                            <p className="text-sm text-gray-700 dark:text-gray-300 mb-3 line-clamp-2">
                                                {idea.abstract}
                                            </p>
                                            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                                                <div className="flex items-center gap-1">
                                                    <User className="h-4 w-4" />
                                                    <span>By: {idea.user.name}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="h-4 w-4" />
                                                    <span>Submitted: {idea.created_at}</span>
                                                </div>
                                                {idea.thematic_area && (
                                                    <div className="flex items-center gap-1">
                                                        <BookOpen className="h-4 w-4" />
                                                        <span>{idea.thematic_area.name}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-end gap-3">
                                        <Link
                                            href={`/review/sme/idea/${idea.id}`}
                                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#FFF200] text-[#231F20] hover:bg-yellow-400 transition-all font-medium"
                                        >
                                            <Eye className="h-4 w-4" />
                                            Review Idea
                                        </Link>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {activeTab === 'reviewed' && (
                    <div className="space-y-4">
                        {filteredIdeas(reviewedIdeas).length === 0 ? (
                            <div className="text-center py-12">
                                <CheckCircle className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">
                                    No completed reviews
                                </h3>
                                <p className="text-sm text-gray-500 dark:text-gray-500">
                                    {searchTerm || statusFilter !== 'all' 
                                        ? 'No reviewed ideas match your current filters.' 
                                        : 'You haven\'t completed any reviews yet.'}
                                </p>
                            </div>
                        ) : (
                            filteredIdeas(reviewedIdeas).map((idea) => (
                                <div key={idea.id} className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                                                    {idea.idea_title}
                                                </h4>
                                                <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(idea.status)}`}>
                                                    {getStatusIcon(idea.status)}
                                                    {idea.status.toUpperCase()}
                                                </div>
                                            </div>
                                            <p className="text-sm text-gray-700 dark:text-gray-300 mb-3 line-clamp-2">
                                                {idea.abstract}
                                            </p>
                                            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
                                                <div className="flex items-center gap-1">
                                                    <User className="h-4 w-4" />
                                                    <span>By: {idea.user.name}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="h-4 w-4" />
                                                    <span>Submitted: {idea.created_at}</span>
                                                </div>
                                            </div>
                                            
                                            {/* My Review */}
                                            {idea.stage1_reviews.length > 0 && (
                                                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 mt-3">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <MessageSquare className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">My Review:</span>
                                                        <div className="flex items-center gap-1">
                                                            {getRecommendationIcon(idea.stage1_reviews[0].recommendation)}
                                                            <span className="text-xs font-medium uppercase">
                                                                {idea.stage1_reviews[0].recommendation}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                                                        {idea.stage1_reviews[0].comments}
                                                    </p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                                                        Reviewed: {idea.stage1_reviews[0].reviewed_at}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-end gap-3">
                                        <Link
                                            href={`/review/sme/idea/${idea.id}`}
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