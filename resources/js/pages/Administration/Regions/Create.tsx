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
import { toast } from 'react-toastify';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Administration',
        href: '#',
    },
    {
        title: 'Regions',
        href: '/administration/regions',
    },
    {
        title: 'Create',
        href: '/administration/regions/create',
    },
];

export default function Create() {
    const form = useForm({
        name: '',
        code: '',
        description: '',
        is_active: true,
    });

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post('/administration/regions', {
            onSuccess: () => {
                toast.success('Region created successfully!');
            },
            onError: () => {
                toast.error('Failed to create region. Please check the form.');
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Region" />

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex items-center gap-4">
                    <Button variant="outline" asChild>
                        <Link href="/administration/regions">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Regions
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold">Create Region</h1>
                        <p className="text-muted-foreground">
                            Add a new organizational region
                        </p>
                    </div>
                </div>

                <form onSubmit={onSubmit} className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Region Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Name *</Label>
                                    <Input
                                        id="name"
                                        value={form.data.name}
                                        onChange={(e) => form.setData('name', e.target.value)}
                                        placeholder="Enter region name"
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
                                        placeholder="Enter region code (e.g., NRB)"
                                        maxLength={10}
                                        required
                                    />
                                    {form.errors.code && (
                                        <p className="text-sm text-red-600">{form.errors.code}</p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    value={form.data.description}
                                    onChange={(e) => form.setData('description', e.target.value)}
                                    placeholder="Enter region description"
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
                            <Link href="/administration/regions">Cancel</Link>
                        </Button>
                        <Button type="submit" disabled={form.processing}>
                            <Save className="mr-2 h-4 w-4" />
                            {form.processing ? 'Creating...' : 'Create Region'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}