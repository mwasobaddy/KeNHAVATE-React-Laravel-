import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Plus, Eye, SquarePen, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Region {
    id: number;
    name: string;
    code: string;
    description?: string;
    is_active: boolean;
    directorates_count: number;
    created_at: string;
}

interface Props {
    regions: Region[];
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
];

export default function Index({ regions }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Regions" />

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Regions</h1>
                        <p className="text-muted-foreground">
                            Manage organizational regions
                        </p>
                    </div>
                    <Button asChild>
                        <Link href="/administration/regions/create">
                            <Plus className="mr-2 h-4 w-4" />
                            Add Region
                        </Link>
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>All Regions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left p-4 font-medium">Name</th>
                                        <th className="text-left p-4 font-medium">Code</th>
                                        <th className="text-left p-4 font-medium">Description</th>
                                        <th className="text-left p-4 font-medium">Status</th>
                                        <th className="text-left p-4 font-medium">Directorates</th>
                                        <th className="text-left p-4 font-medium w-[100px]">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {regions.map((region) => (
                                        <tr key={region.id} className="border-b">
                                            <td className="p-4 font-medium">
                                                {region.name}
                                            </td>
                                            <td className="p-4">{region.code}</td>
                                            <td className="p-4 max-w-xs truncate">
                                                {region.description || '-'}
                                            </td>
                                            <td className="p-4">
                                                <Badge variant={region.is_active ? 'default' : 'secondary'}>
                                                    {region.is_active ? 'Active' : 'Inactive'}
                                                </Badge>
                                            </td>
                                            <td className="p-4">{region.directorates_count}</td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    <Button variant="ghost" size="sm" asChild>
                                                        <Link href={`/administration/regions/${region.id}`}>
                                                            <Eye className="h-4 w-4" />
                                                        </Link>
                                                    </Button>
                                                    <Button variant="ghost" size="sm" asChild>
                                                        <Link href={`/administration/regions/${region.id}/edit`}>
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
                                    {regions.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="p-4 text-center text-muted-foreground">
                                                No regions found
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