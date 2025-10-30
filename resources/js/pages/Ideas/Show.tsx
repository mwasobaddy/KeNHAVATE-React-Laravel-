import React from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Upload, FileText, CheckCircle2, AlertCircle, Info, Sparkles, Settings2, Users, Calendar, User, Eye, ArrowBigLeftDash, Plus, Heart } from 'lucide-react';
import { BreadcrumbItem } from '@/types';
import ideasRoutes from '@/routes/ideas';

interface Idea {
    id: number;
    slug: string;
    idea_title: string;
    thematic_area: { name: string };
    abstract: string;
    problem_statement: string;
    proposed_solution: string;
    cost_benefit_analysis: string;
    declaration_of_interests: string;
    original_idea_disclaimer: boolean;
    collaboration_enabled: boolean;
    team_effort: boolean;
    comments_enabled: boolean;
    collaboration_deadline: string;
    status: string;
    user: { name: string };
    team_members: { name: string; email: string; role: string }[];
    team_members_count?: number;
    collaboration_members_count?: number;
    likes_count?: number;
    created_at: string;
    attachment_filename: string;
    attachment_size?: number;
    attachment_mime?: string;
}

export default function Show() {
    const page = usePage();
    const idea = page.props.idea as Idea;

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Home',
            href: '/dashboard',
        },
        {
            title: `View Idea`,
            href: ideasRoutes.show.url(idea.slug),
        }
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`View Idea: ${idea.idea_title}`} />

            {/* Main Container */}
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6 bg-transparent text-[#231F20] dark:text-white transition-colors mt-[40px]">
                {/* Header with add idea button at the end */}
                <div className="flex items-center justify-between mb-2">
                    <div className="relative mb-2">
                        <h2 className="flex items-center gap-2 text-3xl md:text-4xl font-extrabold tracking-tight">
                            <Eye className='w-10 h-10 text-3xl md:text-4xl dark:text-[#fff200] font-black' />
                            <span className='bg-clip-text text-transparent bg-gradient-to-r from-black to-[#fff200] dark:bg-gradient-to-r dark:from-[#FFF200] dark:to-[#F8EBD5]'>
                                View Idea
                            </span>
                        </h2>
                        <div className='absolute -bottom-3 left-0 h-1 w-16 bg-gradient-to-r from-black to-[#fff200] dark:bg-gradient-to-r dark:from-[#FFF200] dark:to-[#F8EBD5] rounded-full animate-pulse'></div>
                    </div>
                </div>
                <div className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-[#F8EBD5]/30 dark:bg-[#F8EBD5]/10 backdrop-blur-lg pb-6">

                    <div className="px-6 py-8 border-b border-gray-200 dark:border-gray-700">
                        <h1 className="text-2xl font-semibold flex items-center gap-2">
                            <Sparkles className="h-6 w-6 text-yellow-500 dark:text-yellow-400" />
                            {idea.idea_title}
                        </h1>
                        <div className="flex items-center gap-2 mt-2 text-sm text-gray-600 dark:text-gray-400 flex-wrap">
                            <span className="flex items-center gap-1">
                                <User className="h-4 w-4" />
                                {idea.user?.name}
                            </span>
                            <span className={`flex items-center gap-2 px-2 py-1 rounded-full text-xs font-medium ${
                                idea.status === 'draft' ? 'text-gray-600 bg-gray-200 dark:text-gray-300 dark:bg-gray-700/50' :
                                idea.status === 'stage 1 review' ? 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30' :
                                idea.status === 'stage 2 review' ? 'text-purple-600 bg-purple-100 dark:text-purple-400 dark:bg-purple-900/30' :
                                idea.status === 'stage 1 revise' ? 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30' :
                                idea.status === 'stage 2 revise' ? 'text-orange-600 bg-orange-100 dark:text-orange-400 dark:bg-orange-900/30' :
                                idea.status === 'approved' ? 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30' :
                                'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30'
                            }`}>
                                <Calendar className="h-4 w-4" />
                                {new Date(idea.created_at).toLocaleDateString()}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                idea.status === 'draft' ? 'text-gray-600 bg-gray-200 dark:text-gray-300 dark:bg-gray-700/50' :
                                idea.status === 'stage 1 review' ? 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30' :
                                idea.status === 'stage 2 review' ? 'text-purple-600 bg-purple-100 dark:text-purple-400 dark:bg-purple-900/30' :
                                idea.status === 'stage 1 revise' ? 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30' :
                                idea.status === 'stage 2 revise' ? 'text-orange-600 bg-orange-100 dark:text-orange-400 dark:bg-orange-900/30' :
                                idea.status === 'approved' ? 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30' :
                                'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30'
                            }`}>{
                                idea.status ?? 'N/A'}
                            </span>
                            <span className={`flex items-center gap-2 px-2 py-1 rounded-full text-xs font-medium ${
                                idea.status === 'draft' ? 'text-gray-600 bg-gray-200 dark:text-gray-300 dark:bg-gray-700/50' :
                                idea.status === 'stage 1 review' ? 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30' :
                                idea.status === 'stage 2 review' ? 'text-purple-600 bg-purple-100 dark:text-purple-400 dark:bg-purple-900/30' :
                                idea.status === 'stage 1 revise' ? 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30' :
                                idea.status === 'stage 2 revise' ? 'text-orange-600 bg-orange-100 dark:text-orange-400 dark:bg-orange-900/30' :
                                idea.status === 'approved' ? 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30' :
                                'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30'
                            }`}>
                                <Users className='w-4 h-4' />
                                <span>Team</span>
                                <span>{idea.team_members_count}</span>
                            </span>
                            <span className={`flex items-center gap-2 px-2 py-1 rounded-full text-xs font-medium ${
                                idea.status === 'draft' ? 'text-gray-600 bg-gray-200 dark:text-gray-300 dark:bg-gray-700/50' :
                                idea.status === 'stage 1 review' ? 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30' :
                                idea.status === 'stage 2 review' ? 'text-purple-600 bg-purple-100 dark:text-purple-400 dark:bg-purple-900/30' :
                                idea.status === 'stage 1 revise' ? 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30' :
                                idea.status === 'stage 2 revise' ? 'text-orange-600 bg-orange-100 dark:text-orange-400 dark:bg-orange-900/30' :
                                idea.status === 'approved' ? 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30' :
                                'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30'
                            }`}>
                                <Users className='w-4 h-4' />
                                <span>Collaborators</span>
                                <span>{idea.collaboration_members_count}</span>
                            </span>
                            <span className={`flex items-center gap-2 px-2 py-1 rounded-full text-xs font-medium ${
                                idea.status === 'draft' ? 'text-gray-600 bg-gray-200 dark:text-gray-300 dark:bg-gray-700/50' :
                                idea.status === 'stage 1 review' ? 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30' :
                                idea.status === 'stage 2 review' ? 'text-purple-600 bg-purple-100 dark:text-purple-400 dark:bg-purple-900/30' :
                                idea.status === 'stage 1 revise' ? 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30' :
                                idea.status === 'stage 2 revise' ? 'text-orange-600 bg-orange-100 dark:text-orange-400 dark:bg-orange-900/30' :
                                idea.status === 'approved' ? 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30' :
                                'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30'
                            }`}>
                                <Heart className='w-4 h-4 text-red-600 fill-current' />
                                <span>{idea.likes_count}</span>
                                <span>Likes</span>
                            </span>
                        </div>
                    </div>

                    {/* Basic Information Card */}
                    <div className="">
                        <div className="px-6 py-4">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                Basic Information
                            </h2>
                        </div>
                        <div className="p-6 grid gap-6 lg:grid-cols-2">
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Idea Title
                                </label>
                                <p className="text-sm bg-white/80 dark:bg-gray-900/50 px-3 py-2 rounded-xl border border-[#9B9EA4]/30 text-[#231F20] dark:text-[#F8EBD5]">
                                    {idea.idea_title}
                                </p>
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Thematic Area
                                </label>
                                <p className="text-sm bg-white/80 dark:bg-gray-900/50 px-3 py-2 rounded-xl border border-[#9B9EA4]/30 text-[#231F20] dark:text-[#F8EBD5]">
                                    {idea.thematic_area?.name}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Detailed Description Card */}
                    <div className="">
                        <div className="px-6 py-4">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                <FileText className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                                Detailed Description
                            </h2>
                        </div>
                        <div className="p-6 grid gap-6 lg:grid-cols-2">
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Abstract
                                </label>
                                <div className="text-sm bg-white/80 dark:bg-gray-900/50 px-3 py-2 rounded-xl border border-[#9B9EA4]/30 text-[#231F20] dark:text-[#F8EBD5] whitespace-pre-wrap">
                                    {idea.abstract}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Problem Statement
                                </label>
                                <div className="text-sm bg-white/80 dark:bg-gray-900/50 px-3 py-2 rounded-xl border border-[#9B9EA4]/30 text-[#231F20] dark:text-[#F8EBD5] whitespace-pre-wrap">
                                    {idea.problem_statement}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Proposed Solution
                                </label>
                                <div className="text-sm bg-white/80 dark:bg-gray-900/50 px-3 py-2 rounded-xl border border-[#9B9EA4]/30 text-[#231F20] dark:text-[#F8EBD5] whitespace-pre-wrap">
                                    {idea.proposed_solution}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Cost Benefit Analysis
                                </label>
                                <div className="text-sm bg-white/80 dark:bg-gray-900/50 px-3 py-2 rounded-xl border border-[#9B9EA4]/30 text-[#231F20] dark:text-[#F8EBD5] whitespace-pre-wrap">
                                    {idea.cost_benefit_analysis}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Declaration of Interests
                                </label>
                                <div className="text-sm bg-white/80 dark:bg-gray-900/50 px-3 py-2 rounded-xl border border-[#9B9EA4]/30 text-[#231F20] dark:text-[#F8EBD5] whitespace-pre-wrap">
                                    {idea.declaration_of_interests}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Configuration & Settings Card */}
                    <div className="">
                        <div className="px-6 py-4">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                <Settings2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                                Configuration & Settings
                            </h2>
                        </div>
                        <div className="p-6">
                            <div className="space-y-4 grid gap-6 lg:grid-cols-2">
                                <div className="col-span-2 lg:col-span-1 flex items-start gap-3 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                                    <CheckCircle2 className={`h-5 w-5 ${idea.original_idea_disclaimer ? 'text-green-600' : 'text-gray-400'}`} />
                                    <div className="flex-1">
                                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                                            Original Idea Disclaimer
                                        </span>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                            {idea.original_idea_disclaimer ? 'Confirmed' : 'Not confirmed'}
                                        </p>
                                    </div>
                                </div>
                                <div className="col-span-2 lg:col-span-1 flex items-start gap-3 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                                    <CheckCircle2 className={`h-5 w-5 ${idea.collaboration_enabled ? 'text-green-600' : 'text-gray-400'}`} />
                                    <div className="flex-1">
                                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                                            Collaboration Enabled
                                        </span>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                            {idea.collaboration_enabled ? 'Enabled' : 'Disabled'}
                                        </p>
                                    </div>
                                </div>
                                {idea.collaboration_enabled && (
                                    <div className="col-span-2 lg:col-span-1 space-y-2">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Collaboration Deadline
                                        </label>
                                        <p className="text-sm bg-white/80 dark:bg-gray-900/50 px-3 py-2 rounded-xl border border-[#9B9EA4]/30 text-[#231F20] dark:text-[#F8EBD5]">
                                            {idea.collaboration_deadline ? new Date(idea.collaboration_deadline).toLocaleDateString() : 'Not set'}
                                        </p>
                                    </div>
                                )}
                                <div className="col-span-2 lg:col-span-1 flex items-start gap-3 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                                    <CheckCircle2 className={`h-5 w-5 ${idea.team_effort ? 'text-green-600' : 'text-gray-400'}`} />
                                    <div className="flex-1">
                                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                                            Team Effort
                                        </span>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                            {idea.team_effort ? 'Team effort' : 'Individual effort'}
                                        </p>
                                    </div>
                                </div>
                                <div className="col-span-2 lg:col-span-1 flex items-start gap-3 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                                    <CheckCircle2 className={`h-5 w-5 ${idea.comments_enabled ? 'text-green-600' : 'text-gray-400'}`} />
                                    <div className="flex-1">
                                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                                            Comments Enabled
                                        </span>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                            {idea.comments_enabled ? 'Comments allowed' : 'Comments disabled'}
                                        </p>
                                    </div>
                                </div>
                                {idea.team_members && idea.team_members.length > 0 && (
                                    <div className="space-y-4 col-span-2">
                                        <h3 className="text-md font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                            <Users className="h-5 w-5" />
                                            Team Members
                                        </h3>
                                        {idea.team_members.map((member, index) => (
                                            <div key={index} className="flex gap-4 items-center p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                                                <div className="flex-1">
                                                    <p className="font-medium text-gray-900 dark:text-white">{member.name}</p>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">{member.email}</p>
                                                </div>
                                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                                    {member.role}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* File Upload Card */}
                    {idea.attachment_filename && (
                        <div className="">
                            <div className="px-6 py-4">
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                    <Upload className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                                    Attachments
                                </h2>
                            </div>
                            <div className="p-6">
                                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <FileText className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                    Attached Document: {idea.attachment_filename}
                                                </p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    {(idea.attachment_size! / 1024 / 1024).toFixed(2)} MB • {idea.attachment_mime}
                                                </p>
                                            </div>
                                        </div>
                                        <a
                                            href={`/ideas/${idea.slug}/attachment`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex flex-row gap-2 items-center px-3 py-1 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                                        >
                                            <Eye className="h-4 w-4" />
                                            Preview
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex items-center justify-end gap-4 pt-6 px-6">
                        <Link
                            href={ideasRoutes.index.url()}
                            className="flex flex-row gap-2 items-center px-6 py-3 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
                        >
                            <ArrowBigLeftDash className="h-5 w-5 ml-2" />
                            <span>Back to Ideas</span>
                        </Link>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}