import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, SquarePen, Building2, Users, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface User {
    id: number;
    name: string;
    email: string;
}

interface Department {
    id: number;
    name: string;
    code: string;
    description?: string;
    is_active: boolean;
    directorate: {
        id: number;
        name: string;
        code: string;
        region: {
            id: number;
            name: string;
            code: string;
        };
    };
    users: User[];
}

interface Props {
    department: Department;
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
        title: 'View',
        href: '#',
    },
];

export default function Show({ department }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={department.name} />

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" asChild>
                            <Link href="/administration/departments">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Departments
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold">{department.name}</h1>
                            <p className="text-muted-foreground">
                                Department details and associated users
                            </p>
                        </div>
                    </div>
                    <Button asChild>
                        <Link href={`/administration/departments/${department.id}/edit`}>
                            <SquarePen className="mr-2 h-4 w-4" />
                            Edit Department
                        </Link>
                    </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Department Details */}
                    <div className="lg:col-span-1">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Building2 className="h-5 w-5" />
                                    Department Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label className="text-sm font-medium text-muted-foreground">Name</Label>
                                    <p className="text-lg font-semibold">{department.name}</p>
                                </div>

                                <div>
                                    <Label className="text-sm font-medium text-muted-foreground">Code</Label>
                                    <p className="font-mono">{department.code}</p>
                                </div>

                                <div>
                                    <Label className="text-sm font-medium text-muted-foreground">Directorate</Label>
                                    <div className="flex items-center gap-2 mt-1">
                                        <Building2 className="h-4 w-4 text-muted-foreground" />
                                        <span className="font-medium">{department.directorate.name}</span>
                                        <Badge variant="outline">{department.directorate.code}</Badge>
                                    </div>
                                </div>

                                <div>
                                    <Label className="text-sm font-medium text-muted-foreground">Region</Label>
                                    <div className="flex items-center gap-2 mt-1">
                                        <MapPin className="h-4 w-4 text-muted-foreground" />
                                        <span className="font-medium">{department.directorate.region.name}</span>
                                        <Badge variant="outline">{department.directorate.region.code}</Badge>
                                    </div>
                                </div>

                                <div>
                                    <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                                    <div className="mt-1">
                                        <Badge variant={department.is_active ? 'default' : 'secondary'}>
                                            {department.is_active ? 'Active' : 'Inactive'}
                                        </Badge>
                                    </div>
                                </div>

                                {department.description && (
                                    <div>
                                        <Label className="text-sm font-medium text-muted-foreground">Description</Label>
                                        <p className="text-sm mt-1">{department.description}</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Users */}
                    <div className="lg:col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Users className="h-5 w-5" />
                                    Users ({department.users.length})
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {department.users.length > 0 ? (
                                    <div className="space-y-4">
                                        {department.users.map((user) => (
                                            <div key={user.id} className="flex items-center gap-4 p-4 border rounded-lg">
                                                <Avatar>
                                                    <AvatarFallback>
                                                        {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex-1">
                                                    <h3 className="font-semibold">{user.name}</h3>
                                                    <p className="text-sm text-muted-foreground">{user.email}</p>
                                                </div>
                                                <Button variant="outline" size="sm">
                                                    View Profile
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-muted-foreground">
                                        <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                        <p>No users assigned to this department.</p>
                                        <p className="text-sm mt-2">
                                            Users can be assigned to departments through user management.
                                        </p>
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