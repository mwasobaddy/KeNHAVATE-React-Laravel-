import React, { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';
import { 
    ArrowLeft, 
    Users, 
    CircleCheckBig, 
    Sparkles, 
    Info, 
    FileText, 
    Settings2, 
    CircleX,
    GitBranch,
    Eye,
    EyeOff
} from 'lucide-react';
import { toast } from 'react-toastify';

interface Idea {
    id: number;
    idea_title: string;
    slug: string;
    abstract: string;
    problem_statement: string;
    proposed_solution: string;
    cost_benefit_analysis: string;
    declaration_of_interests: string;
    original_idea_disclaimer: boolean;
    collaboration_enabled: boolean;
    team_effort: boolean;
    comments_enabled: boolean;
    collaboration_deadline: string | null;
    thematic_area: {
        id: number;
        name: string;
    } | null;
    user: {
        id: number;
        name: string;
    };
}

interface ThematicArea {
    id: number;
    name: string;
}

interface Props {
    idea: Idea;
    thematicAreas: ThematicArea[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Home',
        href: '/',
    },
    {
        title: 'Propose Changes',
        href: '#',
    },
];

export default function Propose({ idea, thematicAreas }: Props) {
    const [showComparison, setShowComparison] = useState(true);
    
    const form = useForm({
        proposed_idea_title: idea.idea_title,
        proposed_thematic_area_id: idea.thematic_area?.id || '',
        proposed_abstract: idea.abstract,
        proposed_problem_statement: idea.problem_statement,
        proposed_solution: idea.proposed_solution,
        proposed_cost_benefit_analysis: idea.cost_benefit_analysis,
        proposed_declaration_of_interests: idea.declaration_of_interests,
        proposed_original_idea_disclaimer: idea.original_idea_disclaimer,
        proposed_collaboration_enabled: idea.collaboration_enabled,
        proposed_team_effort: idea.team_effort,
        proposed_comments_enabled: idea.comments_enabled,
        proposed_collaboration_deadline: idea.collaboration_deadline || '',
        collaboration_notes: '',
        change_summary: '',
    });

    function setField(key: string, value: any) {
        (form as any).setData(key, value);
    }

    function submit(e: React.FormEvent) {
        e.preventDefault();
        
        form.post(`/collaboration/${idea.slug}/propose`, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Collaboration proposal submitted successfully!');
            },
            onError: () => {
                toast.error('Failed to submit proposal. Please check your input and try again.');
            },
        });
    }

    const ComparisonField = ({ 
        label, 
        originalValue, 
        proposedValue, 
        isTextarea = false, 
        rows = 4 
    }: { 
        label: string; 
        originalValue: any; 
        proposedValue: any; 
        isTextarea?: boolean; 
        rows?: number; 
    }) => (
        <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {label}
            </label>
            {showComparison && (
                <div className="grid lg:grid-cols-2 gap-4 mb-2">
                    <div className="space-y-1">
                        <span className="text-xs text-gray-500 dark:text-gray-400">Original</span>
                        {isTextarea ? (
                            <textarea
                                value={originalValue || ''}
                                readOnly
                                rows={rows}
                                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 resize-none"
                            />
                        ) : (
                            <input
                                type="text"
                                value={originalValue || ''}
                                readOnly
                                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                            />
                        )}
                    </div>
                    <div className="space-y-1">
                        <span className="text-xs text-blue-600 dark:text-blue-400">Your Proposal</span>
                        {React.cloneElement(proposedValue)}
                    </div>
                </div>
            )}
            {!showComparison && proposedValue}
        </div>
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Propose Changes - ${idea.idea_title}`} />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6 bg-transparent text-[#231F20] dark:text-white transition-colors mt-[40px]">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <button
                            type="button"
                            onClick={() => setShowComparison(!showComparison)}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
                        >
                            {showComparison ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            {showComparison ? 'Hide' : 'Show'} Comparison
                        </button>
                    </div>
                </div>

                {/* Page Title */}
                <div className="relative mb-6">
                    <h2 className="flex items-center gap-2 text-3xl md:text-4xl font-extrabold tracking-tight">
                        <GitBranch className='w-10 h-10 text-3xl md:text-4xl dark:text-[#fff200] font-black' />
                        <span className='bg-clip-text text-transparent bg-gradient-to-r from-black to-[#fff200] dark:bg-gradient-to-r dark:from-[#FFF200] dark:to-[#F8EBD5]'>
                            Propose Changes
                        </span>
                    </h2>
                    <div className='absolute -bottom-3 left-0 h-1 w-16 bg-gradient-to-r from-black to-[#fff200] dark:bg-gradient-to-r dark:from-[#FFF200] dark:to-[#F8EBD5] rounded-full animate-pulse'></div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-4">
                        Proposing changes to: <span className="font-semibold">"{idea.idea_title}"</span> by {idea.user.name}
                    </p>
                </div>

                <form onSubmit={submit} className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-[#F8EBD5]/30 dark:bg-[#F8EBD5]/10 backdrop-blur-lg pb-6">
                    
                    {/* Basic Information Card */}
                    <div className="px-6 py-8 border-b border-gray-200 dark:border-gray-700">
                        <h1 className="text-2xl font-semibold flex items-center gap-2">
                            <Sparkles className="h-6 w-6 text-yellow-500 dark:text-yellow-400" />
                            Propose Your Changes
                        </h1>
                    </div>

                    <div className="">
                        <div className="px-6 py-4">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                Basic Information
                            </h2>
                        </div>
                        <div className="p-6 grid gap-6 lg:grid-cols-1 pt-0">
                            <ComparisonField
                                label="Idea Title"
                                originalValue={idea.idea_title}
                                proposedValue={
                                    <input
                                        type="text"
                                        value={form.data.proposed_idea_title as string}
                                        onChange={(e) => setField('proposed_idea_title', e.target.value)}
                                        className="w-full px-3 py-2 rounded-xl border border-[#9B9EA4]/30 text-sm bg-white/80 dark:bg-gray-900/50 text-[#231F20] dark:text-[#F8EBD5]"
                                    />
                                }
                            />

                            <ComparisonField
                                label="Thematic Area"
                                originalValue={idea.thematic_area?.name}
                                proposedValue={
                                    <select
                                        value={form.data.proposed_thematic_area_id as string}
                                        onChange={(e) => setField('proposed_thematic_area_id', e.target.value)}
                                        className="w-full px-3 py-2 rounded-xl border border-[#9B9EA4]/30 text-sm bg-white/80 dark:bg-gray-900/50 text-[#231F20] dark:text-[#F8EBD5]"
                                    >
                                        <option value="">Select Thematic Area</option>
                                        {thematicAreas.map((area) => (
                                            <option key={area.id} value={area.id}>
                                                {area.name}
                                            </option>
                                        ))}
                                    </select>
                                }
                            />
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
                        <div className="p-6 space-y-6 pt-0">
                            <ComparisonField
                                label="Abstract"
                                originalValue={idea.abstract}
                                isTextarea={true}
                                proposedValue={
                                    <textarea
                                        rows={4}
                                        value={form.data.proposed_abstract as string}
                                        onChange={(e) => setField('proposed_abstract', e.target.value)}
                                        className="w-full px-3 py-2 rounded-xl border border-[#9B9EA4]/30 text-sm bg-white/80 dark:bg-gray-900/50 text-[#231F20] dark:text-[#F8EBD5]"
                                    />
                                }
                            />

                            <ComparisonField
                                label="Problem Statement"
                                originalValue={idea.problem_statement}
                                isTextarea={true}
                                proposedValue={
                                    <textarea
                                        rows={4}
                                        value={form.data.proposed_problem_statement as string}
                                        onChange={(e) => setField('proposed_problem_statement', e.target.value)}
                                        className="w-full px-3 py-2 rounded-xl border border-[#9B9EA4]/30 text-sm bg-white/80 dark:bg-gray-900/50 text-[#231F20] dark:text-[#F8EBD5]"
                                    />
                                }
                            />

                            <ComparisonField
                                label="Proposed Solution"
                                originalValue={idea.proposed_solution}
                                isTextarea={true}
                                proposedValue={
                                    <textarea
                                        rows={4}
                                        value={form.data.proposed_solution as string}
                                        onChange={(e) => setField('proposed_solution', e.target.value)}
                                        className="w-full px-3 py-2 rounded-xl border border-[#9B9EA4]/30 text-sm bg-white/80 dark:bg-gray-900/50 text-[#231F20] dark:text-[#F8EBD5]"
                                    />
                                }
                            />

                            <ComparisonField
                                label="Cost Benefit Analysis"
                                originalValue={idea.cost_benefit_analysis}
                                isTextarea={true}
                                proposedValue={
                                    <textarea
                                        rows={4}
                                        value={form.data.proposed_cost_benefit_analysis as string}
                                        onChange={(e) => setField('proposed_cost_benefit_analysis', e.target.value)}
                                        className="w-full px-3 py-2 rounded-xl border border-[#9B9EA4]/30 text-sm bg-white/80 dark:bg-gray-900/50 text-[#231F20] dark:text-[#F8EBD5]"
                                    />
                                }
                            />

                            <ComparisonField
                                label="Declaration of Interests"
                                originalValue={idea.declaration_of_interests}
                                isTextarea={true}
                                rows={3}
                                proposedValue={
                                    <textarea
                                        rows={3}
                                        value={form.data.proposed_declaration_of_interests as string}
                                        onChange={(e) => setField('proposed_declaration_of_interests', e.target.value)}
                                        className="w-full px-3 py-2 rounded-xl border border-[#9B9EA4]/30 text-sm bg-white/80 dark:bg-gray-900/50 text-[#231F20] dark:text-[#F8EBD5]"
                                    />
                                }
                            />
                        </div>
                    </div>

                    {/* Collaboration Notes */}
                    <div className="">
                        <div className="px-6 py-4">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                <GitBranch className="h-5 w-5 text-green-600 dark:text-green-400" />
                                Collaboration Details
                            </h2>
                        </div>
                        <div className="p-6 space-y-6 pt-0">
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Change Summary <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    placeholder="Brief summary of your changes (e.g., 'Improved cost analysis and added implementation timeline')"
                                    value={form.data.change_summary as string}
                                    onChange={(e) => setField('change_summary', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl border border-[#9B9EA4]/30 text-sm bg-white/80 dark:bg-gray-900/50 text-[#231F20] dark:text-[#F8EBD5]"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Collaboration Notes <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    rows={4}
                                    placeholder="Explain your proposed changes, rationale, and how they improve the original idea..."
                                    value={form.data.collaboration_notes as string}
                                    onChange={(e) => setField('collaboration_notes', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl border border-[#9B9EA4]/30 text-sm bg-white/80 dark:bg-gray-900/50 text-[#231F20] dark:text-[#F8EBD5]"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-end gap-4 pt-6 px-6">
                        <Link
                            href="/collaboration"
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
                                    <div className="h-5 w-5 border-2 border-[#231F20] border-t-transparent rounded-full animate-spin" />
                                    Submitting...
                                </>
                            ) : (
                                <>
                                    <GitBranch className="h-5 w-5" />
                                    Submit Proposal
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}