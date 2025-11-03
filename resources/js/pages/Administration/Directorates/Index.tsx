import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Plus, Eye, SquarePen, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Directorate {
    id: number;
    name: string;
    code: string;
    description?: string;
    is_active: boolean;
    departments_count: number;
    region: {
        id: number;
        name: string;
        code: string;
    };
}

interface Props {
    directorates: Directorate[];
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
];

export default function Index({ directorates }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Directorates" />

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Directorates</h1>
                        <p className="text-muted-foreground">
                            Manage organizational directorates
                        </p>
                    </div>
                    <Button asChild>
                        <Link href="/administration/directorates/create">
                            <Plus className="mr-2 h-4 w-4" />
                            Add Directorate
                        </Link>
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>All Directorates</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left p-4 font-medium">Name</th>
                                        <th className="text-left p-4 font-medium">Code</th>
                                        <th className="text-left p-4 font-medium">Region</th>
                                        <th className="text-left p-4 font-medium">Description</th>
                                        <th className="text-left p-4 font-medium">Status</th>
                                        <th className="text-left p-4 font-medium">Departments</th>
                                        <th className="text-left p-4 font-medium w-[100px]">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {directorates.map((directorate) => (
                                        <tr key={directorate.id} className="border-b">
                                            <td className="p-4 font-medium">
                                                {directorate.name}
                                            </td>
                                            <td className="p-4">{directorate.code}</td>
                                            <td className="p-4">
                                                <div>
                                                    <div className="font-medium">{directorate.region.name}</div>
                                                    <div className="text-sm text-muted-foreground">{directorate.region.code}</div>
                                                </div>
                                            </td>
                                            <td className="p-4 max-w-xs truncate">
                                                {directorate.description || '-'}
                                            </td>
                                            <td className="p-4">
                                                <Badge variant={directorate.is_active ? 'default' : 'secondary'}>
                                                    {directorate.is_active ? 'Active' : 'Inactive'}
                                                </Badge>
                                            </td>
                                            <td className="p-4">{directorate.departments_count}</td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    <Button variant="ghost" size="sm" asChild>
                                                        <Link href={`/administration/directorates/${directorate.id}`}>
                                                            <Eye className="h-4 w-4" />
                                                        </Link>
                                                    </Button>
                                                    <Button variant="ghost" size="sm" asChild>
                                                        <Link href={`/administration/directorates/${directorate.id}/edit`}>
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
                                    {directorates.length === 0 && (
                                        <tr>
                                            <td colSpan={7} className="p-4 text-center text-muted-foreground">
                                                No directorates found
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