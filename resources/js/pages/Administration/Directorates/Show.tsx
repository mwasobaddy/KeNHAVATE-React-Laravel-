import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, SquarePen, Building2, Users, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';

interface Department {
    id: number;
    name: string;
    code: string;
    description?: string;
    is_active: boolean;
    users_count: number;
}

interface Directorate {
    id: number;
    name: string;
    code: string;
    description?: string;
    is_active: boolean;
    region: {
        id: number;
        name: string;
        code: string;
    };
    departments: Department[];
}

interface Props {
    directorate: Directorate;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Administration',
        href: '#',
    },
    {
        title: 'Directorates',
        href: '/administration/directorates',
    },
    {
        title: 'View',
        href: '#',
    },
];

export default function Show({ directorate }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={directorate.name} />

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" asChild>
                            <Link href="/administration/directorates">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Directorates
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold">{directorate.name}</h1>
                            <p className="text-muted-foreground">
                                Directorate details and associated departments
                            </p>
                        </div>
                    </div>
                    <Button asChild>
                        <Link href={`/administration/directorates/${directorate.id}/edit`}>
                            <SquarePen className="mr-2 h-4 w-4" />
                            Edit Directorate
                        </Link>
                    </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Directorate Details */}
                    <div className="lg:col-span-1">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Building2 className="h-5 w-5" />
                                    Directorate Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label className="text-sm font-medium text-muted-foreground">Name</Label>
                                    <p className="text-lg font-semibold">{directorate.name}</p>
                                </div>

                                <div>
                                    <Label className="text-sm font-medium text-muted-foreground">Code</Label>
                                    <p className="font-mono">{directorate.code}</p>
                                </div>

                                <div>
                                    <Label className="text-sm font-medium text-muted-foreground">Region</Label>
                                    <div className="flex items-center gap-2 mt-1">
                                        <MapPin className="h-4 w-4 text-muted-foreground" />
                                        <span className="font-medium">{directorate.region.name}</span>
                                        <Badge variant="outline">{directorate.region.code}</Badge>
                                    </div>
                                </div>

                                <div>
                                    <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                                    <div className="mt-1">
                                        <Badge variant={directorate.is_active ? 'default' : 'secondary'}>
                                            {directorate.is_active ? 'Active' : 'Inactive'}
                                        </Badge>
                                    </div>
                                </div>

                                {directorate.description && (
                                    <div>
                                        <Label className="text-sm font-medium text-muted-foreground">Description</Label>
                                        <p className="text-sm mt-1">{directorate.description}</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Departments */}
                    <div className="lg:col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center justify-between">
                                    <span className="flex items-center gap-2">
                                        <Building2 className="h-5 w-5" />
                                        Departments ({directorate.departments.length})
                                    </span>
                                    <Button size="sm" asChild>
                                        <Link href="/administration/departments/create">
                                            Add Department
                                        </Link>
                                    </Button>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {directorate.departments.length > 0 ? (
                                    <div className="space-y-4">
                                        {directorate.departments.map((department) => (
                                            <div key={department.id} className="border rounded-lg p-4">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2">
                                                            <h3 className="font-semibold">{department.name}</h3>
                                                            <Badge variant="outline">{department.code}</Badge>
                                                            <Badge variant={department.is_active ? 'default' : 'secondary'}>
                                                                {department.is_active ? 'Active' : 'Inactive'}
                                                            </Badge>
                                                        </div>
                                                        {department.description && (
                                                            <p className="text-sm text-muted-foreground mt-1">
                                                                {department.description}
                                                            </p>
                                                        )}
                                                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                                                            <span className="flex items-center gap-1">
                                                                <Users className="h-4 w-4" />
                                                                {department.users_count} users
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <Button variant="outline" size="sm" asChild>
                                                            <Link href={`/administration/departments/${department.id}`}>
                                                                View
                                                            </Link>
                                                        </Button>
                                                        <Button variant="outline" size="sm" asChild>
                                                            <Link href={`/administration/departments/${department.id}/edit`}>
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
                                        <p>No departments found for this directorate.</p>
                                        <Button className="mt-4" asChild>
                                            <Link href="/administration/departments/create">
                                                Create First Department
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