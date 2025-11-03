import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, SquarePen, Building2, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';

interface Directorate {
    id: number;
    name: string;
    code: string;
    description?: string;
    is_active: boolean;
    departments_count: number;
}

interface Region {
    id: number;
    name: string;
    code: string;
    description?: string;
    is_active: boolean;
    directorates: Directorate[];
    created_at: string;
}

interface Props {
    region: Region;
}

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
        title: 'View',
        href: '#',
    },
];

export default function Show({ region }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={region.name} />

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" asChild>
                            <Link href="/administration/regions">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Regions
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold">{region.name}</h1>
                            <p className="text-muted-foreground">
                                Region details and associated directorates
                            </p>
                        </div>
                    </div>
                    <Button asChild>
                        <Link href={`/administration/regions/${region.id}/edit`}>
                            <SquarePen className="mr-2 h-4 w-4" />
                            Edit Region
                        </Link>
                    </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Region Details */}
                    <div className="lg:col-span-1">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Building2 className="h-5 w-5" />
                                    Region Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label className="text-sm font-medium text-muted-foreground">Name</Label>
                                    <p className="text-lg font-semibold">{region.name}</p>
                                </div>

                                <div>
                                    <Label className="text-sm font-medium text-muted-foreground">Code</Label>
                                    <p className="font-mono">{region.code}</p>
                                </div>

                                <div>
                                    <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                                    <div className="mt-1">
                                        <Badge variant={region.is_active ? 'default' : 'secondary'}>
                                            {region.is_active ? 'Active' : 'Inactive'}
                                        </Badge>
                                    </div>
                                </div>

                                {region.description && (
                                    <div>
                                        <Label className="text-sm font-medium text-muted-foreground">Description</Label>
                                        <p className="text-sm mt-1">{region.description}</p>
                                    </div>
                                )}

                                <div>
                                    <Label className="text-sm font-medium text-muted-foreground">Created</Label>
                                    <p className="text-sm mt-1">
                                        {new Date(region.created_at).toLocaleDateString()}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Directorates */}
                    <div className="lg:col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center justify-between">
                                    <span className="flex items-center gap-2">
                                        <Building2 className="h-5 w-5" />
                                        Directorates ({region.directorates.length})
                                    </span>
                                    <Button size="sm" asChild>
                                        <Link href="/administration/directorates/create">
                                            Add Directorate
                                        </Link>
                                    </Button>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {region.directorates.length > 0 ? (
                                    <div className="space-y-4">
                                        {region.directorates.map((directorate) => (
                                            <div key={directorate.id} className="border rounded-lg p-4">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2">
                                                            <h3 className="font-semibold">{directorate.name}</h3>
                                                            <Badge variant="outline">{directorate.code}</Badge>
                                                            <Badge variant={directorate.is_active ? 'default' : 'secondary'}>
                                                                {directorate.is_active ? 'Active' : 'Inactive'}
                                                            </Badge>
                                                        </div>
                                                        {directorate.description && (
                                                            <p className="text-sm text-muted-foreground mt-1">
                                                                {directorate.description}
                                                            </p>
                                                        )}
                                                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                                                            <span className="flex items-center gap-1">
                                                                <Users className="h-4 w-4" />
                                                                {directorate.departments_count} departments
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <Button variant="outline" size="sm" asChild>
                                                            <Link href={`/administration/directorates/${directorate.id}`}>
                                                                View
                                                            </Link>
                                                        </Button>
                                                        <Button variant="outline" size="sm" asChild>
                                                            <Link href={`/administration/directorates/${directorate.id}/edit`}>
                                                                Edit
                                                            </Link>
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-muted-foreground">
                                        <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                        <p>No directorates found for this region.</p>
                                        <Button className="mt-4" asChild>
                                            <Link href="/administration/directorates/create">
                                                Create First Directorate
                                            </Link>
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}