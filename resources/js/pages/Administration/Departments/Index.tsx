import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Plus, Eye, SquarePen, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Department {
    id: number;
    name: string;
    code: string;
    description?: string;
    is_active: boolean;
    users_count: number;
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
}

interface Props {
    departments: Department[];
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
];

export default function Index({ departments }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Departments" />

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Departments</h1>
                        <p className="text-muted-foreground">
                            Manage organizational departments
                        </p>
                    </div>
                    <Button asChild>
                        <Link href="/administration/departments/create">
                            <Plus className="mr-2 h-4 w-4" />
                            Add Department
                        </Link>
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>All Departments</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left p-4 font-medium">Name</th>
                                        <th className="text-left p-4 font-medium">Code</th>
                                        <th className="text-left p-4 font-medium">Directorate</th>
                                        <th className="text-left p-4 font-medium">Region</th>
                                        <th className="text-left p-4 font-medium">Description</th>
                                        <th className="text-left p-4 font-medium">Status</th>
                                        <th className="text-left p-4 font-medium">Users</th>
                                        <th className="text-left p-4 font-medium w-[100px]">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {departments.map((department) => (
                                        <tr key={department.id} className="border-b">
                                            <td className="p-4 font-medium">
                                                {department.name}
                                            </td>
                                            <td className="p-4">{department.code}</td>
                                            <td className="p-4">
                                                <div>
                                                    <div className="font-medium">{department.directorate.name}</div>
                                                    <div className="text-sm text-muted-foreground">{department.directorate.code}</div>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div>
                                                    <div className="font-medium">{department.directorate.region.name}</div>
                                                    <div className="text-sm text-muted-foreground">{department.directorate.region.code}</div>
                                                </div>
                                            </td>
                                            <td className="p-4 max-w-xs truncate">
                                                {department.description || '-'}
                                            </td>
                                            <td className="p-4">
                                                <Badge variant={department.is_active ? 'default' : 'secondary'}>
                                                    {department.is_active ? 'Active' : 'Inactive'}
                                                </Badge>
                                            </td>
                                            <td className="p-4">{department.users_count}</td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    <Button variant="ghost" size="sm" asChild>
                                                        <Link href={`/administration/departments/${department.id}`}>
                                                            <Eye className="h-4 w-4" />
                                                        </Link>
                                                    </Button>
                                                    <Button variant="ghost" size="sm" asChild>
                                                        <Link href={`/administration/departments/${department.id}/edit`}>
                                                            <SquarePen className="h-4 w-4" />
                                                        </Link>
                                                    </Button>
                                                    <Button variant="ghost" size="sm">
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {departments.length === 0 && (
                                        <tr>
                                            <td colSpan={8} className="p-4 text-center text-muted-foreground">
                                                No departments found
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}