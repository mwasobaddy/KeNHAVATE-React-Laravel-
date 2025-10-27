import React, { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { Upload, FileText, CheckCircle2, AlertCircle, Info, Sparkles, Settings2, Plus, Minus, CircleX, Home, Lightbulb, CircleCheckBig, Trash2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import ideasRoutes from '@/routes/ideas';
import { BreadcrumbItem } from '@/types';
import { toast } from 'react-toastify';

const MAX_ATTACHMENT_BYTES = 5 * 1024 * 1024; // 5 MB

interface ThematicArea {
    id: number;
    name: string;
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
    {
        title: 'Create Idea',
        href: ideasRoutes.create.url(),
        icon: Lightbulb,
    },
];

export default function Create() {
    const page = usePage();
    const thematicAreas = page.props.thematicAreas as ThematicArea[];
    const form = useForm<any>({
        idea_title: '',
        thematic_area_id: '',
        abstract: '',
        problem_statement: '',
        proposed_solution: '',
        cost_benefit_analysis: '',
        declaration_of_interests: '',
        original_idea_disclaimer: false,
        collaboration_enabled: false,
        team_effort: false,
        comments_enabled: true,
        current_revision_number: 1,
        collaboration_deadline: '',
        status: 'stage 1 review',
        attachment: null,
        team_members: [] as { name: string; email: string; role: string }[],
    });

    const [clientError, setClientError] = useState<string | null>(null);
    const [fileName, setFileName] = useState<string>('');

    function setField(key: string, value: any) {
        (form as any).setData(key, value);
    }

    function addTeamMember() {
        const current = form.data.team_members as { name: string; email: string; role: string }[];
        setField('team_members', [...current, { name: '', email: '', role: '' }]);
    }

    function removeTeamMember(index: number) {
        const current = form.data.team_members as { name: string; email: string; role: string }[];
        setField('team_members', current.filter((_, i) => i !== index));
    }

    function updateTeamMember(index: number, field: 'name' | 'email' | 'role', value: string) {
        const current = form.data.team_members as { name: string; email: string; role: string }[];
        const updated = current.map((member, i) => i === index ? { ...member, [field]: value } : member);
        setField('team_members', updated);
    }

    function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        setClientError(null);
        const file = e.target.files?.[0] || null;
        if (file && file.size > MAX_ATTACHMENT_BYTES) {
            setClientError(`Attachment must be <= ${Math.round(MAX_ATTACHMENT_BYTES / 1024 / 1024)} MB`);
            (form as any).setData('attachment', null);
            setFileName('');
            return;
        }
        (form as any).setData('attachment', file);
        setFileName(file?.name || '');
    }

    function submit(e: React.FormEvent) {
        e.preventDefault();
        setClientError(null);

        if (form.data.attachment && (form.data.attachment as File).size > MAX_ATTACHMENT_BYTES) {
            setClientError(`Attachment must be <= ${Math.round(MAX_ATTACHMENT_BYTES / 1024 / 1024)} MB`);
            return;
        }

        form.post('/ideas', {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Idea created successfully!');
            },
            onError: () => {
                toast.error('Failed to create idea. Please check your input and try again.');
            },
            onFinish: () => {},
        });
    }

    const progress = form.progress;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Idea" />

            {/* Main Form Container */}
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6 bg-transparent text-[#231F20] dark:text-white transition-colors">
                {/* Header with add idea button at the end */}
                <div className="flex items-center justify-between mb-2">
                    <div className="relative mb-2">
                        <h2 className="flex items-center gap-2 text-3xl md:text-4xl font-extrabold tracking-tight">
                            <CircleCheckBig className='w-10 h-10 text-3xl md:text-4xl dark:text-[#fff200] font-black' />
                            <span className='bg-clip-text text-transparent bg-gradient-to-r from-black to-[#fff200] dark:bg-gradient-to-r dark:from-[#FFF200] dark:to-[#F8EBD5]'>
                                Create Idea
                            </span>
                        </h2>
                        <div className='absolute -bottom-3 left-0 h-1 w-16 bg-gradient-to-r from-black to-[#fff200] dark:bg-gradient-to-r dark:from-[#FFF200] dark:to-[#F8EBD5] rounded-full animate-pulse'></div>
                    </div>
                </div>
                <form onSubmit={submit} encType="multipart/form-data" className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-[#F8EBD5]/30 dark:bg-[#F8EBD5]/10 backdrop-blur-lg pb-6">

                    <div className="px-6 py-8 border-b border-gray-200 dark:border-gray-700">
                        <h1 className="text-2xl font-semibold flex items-center gap-2">
                            <Sparkles className="h-6 w-6 text-yellow-500 dark:text-yellow-400" />
                            Submit a New Idea
                        </h1>
                    </div>
                    
                    {/* Basic Information Card */}
                    <div className="">
                        <div className="px-6 py-4">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                Basic Information
                            </h2>
                        </div>
                        <div className="p-6 grid gap-6 lg:grid-cols-2 pt-0">
                            {/* Title Input */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Idea Title (35 characters max) <span className="text-red-500">*</span>
                                </label>
                                {form.processing ? (
                                    <Skeleton className="h-12 w-full" />
                                ) : (
                                    <input
                                        type="text"
                                        placeholder="Enter a compelling title for your idea (e.g., AI-Powered Pothole Detection System)"
                                        value={form.data.idea_title as string}
                                        onChange={(e) => setField('idea_title', e.target.value)}
                                        className="w-full px-3 py-2 rounded-xl border border-[#9B9EA4]/30 text-sm bg-white/80 dark:bg-gray-900/50 text-[#231F20] dark:text-[#F8EBD5]"
                                    />
                                )}
                                {form.errors.idea_title && (
                                    <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                                        <AlertCircle className="h-4 w-4" />
                                        {form.errors.idea_title}
                                    </div>
                                )}
                            </div>

                            {/* Thematic Area ID */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Thematic Area <span className="text-red-500">*</span>
                                </label>
                                {form.processing ? (
                                    <Skeleton className="h-12 w-full" />
                                ) : (
                                    <select
                                        value={form.data.thematic_area_id as any}
                                        onChange={(e) => setField('thematic_area_id', parseInt(e.target.value))}
                                        className="w-full px-3 py-2 rounded-xl border border-[#9B9EA4]/30 text-sm bg-white/80 dark:bg-gray-900/50 text-[#231F20] dark:text-[#F8EBD5]"
                                    >
                                        <option value="">Select Thematic Area</option>
                                        {thematicAreas.map((area) => (
                                            <option key={area.id} value={area.id}>
                                                {area.name}
                                            </option>
                                        ))}
                                    </select>
                                )}
                                {form.errors.thematic_area_id && (
                                    <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                                        <AlertCircle className="h-4 w-4" />
                                        {form.errors.thematic_area_id}
                                    </div>
                                )}
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
                        <div className="p-6 grid gap-6 lg:grid-cols-2 pt-0">
                            {/* Abstract */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Abstract (200-350 words) <span className="text-red-500">*</span>
                                </label>
                                {form.processing ? (
                                    <Skeleton className="h-24 w-full" />
                                ) : (
                                    <textarea
                                        rows={4}
                                        placeholder="Provide a compelling one-paragraph summary that captures the essence of your idea, its objectives, and expected outcomes..."
                                        value={form.data.abstract as string}
                                        onChange={(e) => setField('abstract', e.target.value)}
                                        className="w-full px-3 py-2 rounded-xl border border-[#9B9EA4]/30 text-sm bg-white/80 dark:bg-gray-900/50 text-[#231F20] dark:text-[#F8EBD5]"
                                    />
                                )}
                                {form.errors.abstract && (
                                    <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                                        <AlertCircle className="h-4 w-4" />
                                        {form.errors.abstract}
                                    </div>
                                )}
                            </div>

                            {/* Problem Statement */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Problem Statement (200-350 words) <span className="text-red-500">*</span>
                                </label>
                                {form.processing ? (
                                    <Skeleton className="h-24 w-full" />
                                ) : (
                                    <textarea
                                        rows={4}
                                        placeholder="What specific challenge or pain point does your idea address? Be clear about the scope, impact, and urgency of the problem..."
                                        value={form.data.problem_statement as string}
                                        onChange={(e) => setField('problem_statement', e.target.value)}
                                        className="w-full px-3 py-2 rounded-xl border border-[#9B9EA4]/30 text-sm bg-white/80 dark:bg-gray-900/50 text-[#231F20] dark:text-[#F8EBD5]"
                                    />
                                )}
                                {form.errors.problem_statement && (
                                    <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                                        <AlertCircle className="h-4 w-4" />
                                        {form.errors.problem_statement}
                                    </div>
                                )}
                            </div>

                            {/* Proposed Solution */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Proposed Solution (200-350 words) <span className="text-red-500">*</span>
                                </label>
                                {form.processing ? (
                                    <Skeleton className="h-24 w-full" />
                                ) : (
                                    <textarea
                                        rows={4}
                                        placeholder="Describe your innovative solution in detail. How does it work? What makes it unique? What are the key features and benefits..."
                                        value={form.data.proposed_solution as string}
                                        onChange={(e) => setField('proposed_solution', e.target.value)}
                                        className="w-full px-3 py-2 rounded-xl border border-[#9B9EA4]/30 text-sm bg-white/80 dark:bg-gray-900/50 text-[#231F20] dark:text-[#F8EBD5]"
                                    />
                                )}
                                {form.errors.proposed_solution && (
                                    <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                                        <AlertCircle className="h-4 w-4" />
                                        {form.errors.proposed_solution}
                                    </div>
                                )}
                            </div>

                            {/* Cost Benefit Analysis */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Cost Benefit Analysis (200-350 words) <span className="text-red-500">*</span>
                                </label>
                                {form.processing ? (
                                    <Skeleton className="h-24 w-full" />
                                ) : (
                                    <textarea
                                        rows={4}
                                        placeholder="Break down the implementation costs, expected benefits, potential risks, and mitigation strategies. Include timeframes and ROI estimates if possible..."
                                        value={form.data.cost_benefit_analysis as string}
                                        onChange={(e) => setField('cost_benefit_analysis', e.target.value)}
                                        className="w-full px-3 py-2 rounded-xl border border-[#9B9EA4]/30 text-sm bg-white/80 dark:bg-gray-900/50 text-[#231F20] dark:text-[#F8EBD5]"
                                    />
                                )}
                                {form.errors.cost_benefit_analysis && (
                                    <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                                        <AlertCircle className="h-4 w-4" />
                                        {form.errors.cost_benefit_analysis}
                                    </div>
                                )}
                            </div>

                            {/* Declaration of Interests */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Declaration of Interests (200-350 words) <span className="text-red-500">*</span>
                                </label>
                                {form.processing ? (
                                    <Skeleton className="h-20 w-full" />
                                ) : (
                                    <textarea
                                        rows={3}
                                        placeholder="Declare any personal or corporate interests in this idea. What role do you envision playing if this idea is implemented? Are there any potential conflicts of interest..."
                                        value={form.data.declaration_of_interests as string}
                                        onChange={(e) => setField('declaration_of_interests', e.target.value)}
                                        className="w-full px-3 py-2 rounded-xl border border-[#9B9EA4]/30 text-sm bg-white/80 dark:bg-gray-900/50 text-[#231F20] dark:text-[#F8EBD5]"
                                    />
                                )}
                                {form.errors.declaration_of_interests && (
                                    <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                                        <AlertCircle className="h-4 w-4" />
                                        {form.errors.declaration_of_interests}
                                    </div>
                                )}
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
                        <div className="p-6 pt-0">
                            {/* Checkboxes Section */}
                            <div className="space-y-4 grid gap-6 lg:grid-cols-2">
                                {/* Original Idea Disclaimer */}
                                <div className="col-span-2 lg:col-span-1 space-y-2">
                                    <label className="flex items-start gap-3 p-4 rounded-xl border border-gray-200 dark:border-gray-700 cursor-pointer transition-all hover:bg-gray-50 dark:hover:bg-gray-900/30 group">
                                        <input
                                            type="checkbox"
                                            checked={!!form.data.original_idea_disclaimer}
                                            onChange={(e) => setField('original_idea_disclaimer', e.target.checked)}
                                            disabled={form.processing}
                                            className="mt-1 h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 cursor-pointer disabled:opacity-50"
                                        />
                                        <div className="flex-1">
                                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                Original Idea Disclaimer <span className="text-red-500">*</span>
                                            </span>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                I confirm this is my original idea and has not been plagiarized
                                            </p>
                                        </div>
                                    </label>
                                    {form.errors.original_idea_disclaimer && (
                                        <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400 ml-8">
                                            <AlertCircle className="h-4 w-4" />
                                            {form.errors.original_idea_disclaimer}
                                        </div>
                                    )}
                                </div>

                                {/* Collaboration Enabled */}
                                <label className="col-span-2 lg:col-span-1 flex items-start gap-3 p-4 rounded-xl border border-gray-200 dark:border-gray-700 cursor-pointer transition-all hover:bg-gray-50 dark:hover:bg-gray-900/30 group">
                                    <input
                                        type="checkbox"
                                        checked={!!form.data.collaboration_enabled}
                                        onChange={(e) => setField('collaboration_enabled', e.target.checked)}
                                        disabled={form.processing}
                                        className="mt-1 h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 cursor-pointer disabled:opacity-50"
                                    />
                                    <div className="flex-1">
                                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                                            Enable Collaboration
                                        </span>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                            Allow others to contribute and collaborate on this idea
                                        </p>
                                    </div>
                                </label>

                                {/* Collaboration Deadline */}
                                {form.data.collaboration_enabled && (
                                    <div className="col-span-2 lg:col-span-1 space-y-2">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Collaboration Deadline
                                        </label>
                                        {form.processing ? (
                                            <Skeleton className="h-12 w-full" />
                                        ) : (
                                            <input
                                                type="date"
                                                value={form.data.collaboration_deadline as string}
                                                onChange={(e) => setField('collaboration_deadline', e.target.value)}
                                                className="w-full px-3 py-2 rounded-xl border border-[#9B9EA4]/30 text-sm bg-white/80 dark:bg-gray-900/50 text-[#231F20] dark:text-[#F8EBD5]"
                                            />
                                        )}
                                        {form.errors.collaboration_deadline && (
                                            <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                                                <AlertCircle className="h-4 w-4" />
                                                {form.errors.collaboration_deadline}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Team Effort */}
                                <label className="col-span-2 lg:col-span-1 flex items-start gap-3 p-4 rounded-xl border border-gray-200 dark:border-gray-700 cursor-pointer transition-all hover:bg-gray-50 dark:hover:bg-gray-900/30 group">
                                    <input
                                        type="checkbox"
                                        checked={!!form.data.team_effort}
                                        onChange={(e) => setField('team_effort', e.target.checked)}
                                        disabled={form.processing}
                                        className="mt-1 h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 cursor-pointer disabled:opacity-50"
                                    />
                                    <div className="flex-1">
                                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                                            Team Effort
                                        </span>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                            This idea is a collaborative effort from a team
                                        </p>
                                    </div>
                                </label>

                                {/* Comments Enabled */}
                                <label className="col-span-2 lg:col-span-1 flex items-start gap-3 p-4 rounded-xl border border-gray-200 dark:border-gray-700 cursor-pointer transition-all hover:bg-gray-50 dark:hover:bg-gray-900/30 group">
                                    <input
                                        type="checkbox"
                                        checked={!!form.data.comments_enabled}
                                        onChange={(e) => setField('comments_enabled', e.target.checked)}
                                        disabled={form.processing}
                                        className="mt-1 h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 cursor-pointer disabled:opacity-50"
                                    />
                                    <div className="flex-1">
                                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                                            Enable Comments
                                        </span>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                            Allow others to comment on this idea
                                        </p>
                                    </div>
                                </label>

                                {/* Team Members Section */}
                                {form.data.team_effort && (
                                    <div className="space-y-4 col-span-2">
                                        <h3 className="text-md font-semibold text-gray-900 dark:text-white">Team Members</h3>
                                        {(form.data.team_members as { name: string; email: string; role: string }[]).map((member, index) => (
                                            <div key={index} className="flex flex-col lg:flex-row gap-4 items-start">
                                                <div className="flex-1 w-full space-y-2">
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
                                                    {form.processing ? (
                                                        <Skeleton className="h-10 w-full" />
                                                    ) : (
                                                        <input
                                                            type="text"
                                                            placeholder="Team member name"
                                                            value={member.name}
                                                            onChange={(e) => updateTeamMember(index, 'name', e.target.value)}
                                                            className="w-full px-3 py-2 rounded-xl border border-[#9B9EA4]/30 text-sm bg-white/80 dark:bg-gray-900/50 text-[#231F20] dark:text-[#F8EBD5]"
                                                        />
                                                    )}
                                                    {form.errors[`team_members.${index}.name`] && (
                                                        <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                                                            <AlertCircle className="h-4 w-4" />
                                                            {form.errors[`team_members.${index}.name`]}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1 w-full space-y-2">
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                                                    {form.processing ? (
                                                        <Skeleton className="h-10 w-full" />
                                                    ) : (
                                                        <input
                                                            type="email"
                                                            placeholder="Team member email"
                                                            value={member.email}
                                                            onChange={(e) => updateTeamMember(index, 'email', e.target.value)}
                                                            className="w-full px-3 py-2 rounded-xl border border-[#9B9EA4]/30 text-sm bg-white/80 dark:bg-gray-900/50 text-[#231F20] dark:text-[#F8EBD5]"
                                                        />
                                                    )}
                                                    {form.errors[`team_members.${index}.email`] && (
                                                        <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                                                            <AlertCircle className="h-4 w-4" />
                                                            {form.errors[`team_members.${index}.email`]}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1 w-full space-y-2">
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Role</label>
                                                    {form.processing ? (
                                                        <Skeleton className="h-10 w-full" />
                                                    ) : (
                                                        <input
                                                            type="text"
                                                            placeholder="Team member role"
                                                            value={member.role}
                                                            onChange={(e) => updateTeamMember(index, 'role', e.target.value)}
                                                            className="w-full px-3 py-2 rounded-xl border border-[#9B9EA4]/30 text-sm bg-white/80 dark:bg-gray-900/50 text-[#231F20] dark:text-[#F8EBD5]"
                                                        />
                                                    )}
                                                    {form.errors[`team_members.${index}.role`] && (
                                                        <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                                                            <AlertCircle className="h-4 w-4" />
                                                            {form.errors[`team_members.${index}.role`]}
                                                        </div>
                                                    )}
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => removeTeamMember(index)}
                                                    disabled={form.processing}
                                                    className="flex gap-2 items-center px-3 py-2 rounded-xl bg-red-500 text-white hover:bg-red-600 transition disabled:opacity-50"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                    <span className='block lg:hidden'>
                                                        Delete
                                                    </span>
                                                </button>
                                            </div>
                                        ))}
                                        {form.errors.team_members && (
                                            <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                                                <AlertCircle className="h-4 w-4" />
                                                {form.errors.team_members}
                                            </div>
                                        )}
                                        <button
                                            type="button"
                                            onClick={addTeamMember}
                                            disabled={form.processing}
                                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#FFF200] text-[#231F20] hover:bg-yellow-400 transition disabled:opacity-50"
                                        >
                                            <Plus className="h-4 w-4" />
                                            Add Team Member
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Grid Layout for Form Fields */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                            </div>
                        </div>
                    </div>

                    {/* File Upload Card */}
                    <div className="">
                        <div className="px-6 py-4">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                <Upload className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                                Attachments
                            </h2>
                        </div>
                        <div className="p-6 pt-0">
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Upload The Actual Idea Proposal Document <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type="file"
                                        onChange={onFileChange}
                                        disabled={form.processing}
                                        className="hidden"
                                        id="file-upload"
                                    />
                                    <label
                                        htmlFor="file-upload"
                                        className={`flex flex-col items-center justify-center w-full px-6 py-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl cursor-pointer bg-gray-50 dark:bg-gray-900/30 hover:bg-gray-100 dark:hover:bg-gray-900/50 transition-all group ${form.processing ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        <Upload className="h-10 w-10 text-gray-400 group-hover:text-blue-500 transition-colors mb-3" />
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                            {fileName || 'Click to upload or drag and drop'}
                                        </span>
                                        <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                            PDF, DOC, DOCX up to 5MB
                                        </span>
                                    </label>
                                </div>
                                {clientError && (
                                    <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                                        <AlertCircle className="h-4 w-4" />
                                        {clientError}
                                    </div>
                                )}
                                {form.errors.attachment && (
                                    <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                                        <AlertCircle className="h-4 w-4" />
                                        {form.errors.attachment}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Upload Progress Bar */}
                    {progress && (
                        <div className="bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Uploading...
                                </span>
                                <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                                    {Math.round((progress.percentage || 0))}%
                                </span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                                <div
                                    className="bg-gradient-to-r from-blue-500 to-indigo-600 h-3 rounded-full transition-all duration-300 ease-out"
                                    style={{ width: `${Math.round((progress.percentage || 0))}%` }}
                                />
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex items-center justify-end gap-4 pt-6 px-6">
                        <Link
                            href={ideasRoutes.index().url}
                            className="px-6 py-3 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
                        >
                            <CircleX className="h-5 w-5 inline-block mr-2" />
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={form.processing}
                            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#FFF200] text-[#231F20] hover:bg-yellow-400 transition disabled:opacity-50 border border-black"
                        >
                            {form.processing ? (
                                <>
                                    <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Submitting...
                                </>
                            ) : (
                                <>
                                    <CheckCircle2 className="h-5 w-5" />
                                    Create Idea
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}