import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { toast } from 'react-toastify';
import { useState, useEffect } from 'react';

interface Region {
    id: number;
    name: string;
    code: string;
}

interface Directorate {
    id: number;
    name: string;
    code: string;
    region_id: number;
}

interface Department {
    id: number;
    name: string;
    code: string;
    directorate_id: number;
    description?: string;
    is_active: boolean;
    directorate: {
        region_id: number;
    };
}

interface Props {
    department: Department;
    regions: Region[];
    directorates: Directorate[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Administration',
        href: '#',
    },
    {
        title: 'Departments',
        href: '/administration/departments',
    },
    {
        title: 'Edit',
        href: '#',
    },
];

export default function Edit({ department, regions, directorates }: Props) {
    const [filteredDirectorates, setFilteredDirectorates] = useState<Directorate[]>([]);

    const form = useForm({
        name: department.name,
        code: department.code,
        directorate_id: department.directorate_id.toString(),
        region_id: department.directorate.region_id.toString(),
        description: department.description || '',
        is_active: department.is_active,
    });

    // Filter directorates based on selected region
    useEffect(() => {
        if (form.data.region_id) {
            const filtered = directorates.filter(
                (directorate) => directorate.region_id.toString() === form.data.region_id
            );
            setFilteredDirectorates(filtered);

            // Reset directorate selection if it's not in the filtered list
            if (form.data.directorate_id && !filtered.find(d => d.id.toString() === form.data.directorate_id)) {
                form.setData('directorate_id', '');
            }
        } else {
            setFilteredDirectorates([]);
            form.setData('directorate_id', '');
        }
    }, [form.data.region_id, directorates]);

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        form.patch(`/administration/departments/${department.id}`, {
            onSuccess: () => {
                toast.success('Department updated successfully!');
            },
            onError: () => {
                toast.error('Failed to update department. Please check the form.');
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit ${department.name}`} />

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex items-center gap-4">
                    <Button variant="outline" asChild>
                        <Link href="/administration/departments">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Departments
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold">Edit Department</h1>
                        <p className="text-muted-foreground">
                            Update department details
                        </p>
                    </div>
                </div>

                <form onSubmit={onSubmit} className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Department Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Name *</Label>
                                    <Input
                                        id="name"
                                        value={form.data.name}
                                        onChange={(e) => form.setData('name', e.target.value)}
                                        placeholder="Enter department name"
                                        required
                                    />
                                    {form.errors.name && (
                                        <p className="text-sm text-red-600">{form.errors.name}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="code">Code *</Label>
                                    <Input
                                        id="code"
                                        value={form.data.code}
                                        onChange={(e) => form.setData('code', e.target.value.toUpperCase())}
                                        placeholder="Enter department code (e.g., HR)"
                                        maxLength={10}
                                        required
                                    />
                                    {form.errors.code && (
                                        <p className="text-sm text-red-600">{form.errors.code}</p>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="region_id">Region *</Label>
                                    <Select
                                        value={form.data.region_id}
                                        onValueChange={(value) => form.setData('region_id', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a region" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {regions.map((region) => (
                                                <SelectItem key={region.id} value={region.id.toString()}>
                                                    {region.name} ({region.code})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {form.errors.region_id && (
                                        <p className="text-sm text-red-600">{form.errors.region_id}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="directorate_id">Directorate *</Label>
                                    <Select
                                        value={form.data.directorate_id}
                                        onValueChange={(value) => form.setData('directorate_id', value)}
                                        disabled={!form.data.region_id}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder={form.data.region_id ? "Select a directorate" : "Select region first"} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {filteredDirectorates.map((directorate) => (
                                                <SelectItem key={directorate.id} value={directorate.id.toString()}>
                                                    {directorate.name} ({directorate.code})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {form.errors.directorate_id && (
                                        <p className="text-sm text-red-600">{form.errors.directorate_id}</p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    value={form.data.description}
                                    onChange={(e) => form.setData('description', e.target.value)}
                                    placeholder="Enter department description"
                                    rows={3}
                                />
                                {form.errors.description && (
                                    <p className="text-sm text-red-600">{form.errors.description}</p>
                                )}
                            </div>

                            <div className="flex items-center space-x-2">
                                <Switch
                                    id="is_active"
                                    checked={form.data.is_active}
                                    onCheckedChange={(checked) => form.setData('is_active', checked)}
                                />
                                <Label htmlFor="is_active">Active</Label>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end gap-4">
                        <Button variant="outline" asChild>
                            <Link href="/administration/departments">Cancel</Link>
                        </Button>
                        <Button type="submit" disabled={form.processing}>
                            <Save className="mr-2 h-4 w-4" />
                            {form.processing ? 'Updating...' : 'Update Department'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}