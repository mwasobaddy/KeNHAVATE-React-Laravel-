import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { PageProps } from '@/types';
import ddRoutes from '@/routes/dd';
import challengesRoutes from '@/routes/challenges';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  Calendar, 
  Trophy, 
  Plus,
  Edit,
  Trash2,
  Eye,
  Users,
  FileText
} from 'lucide-react';
import { format } from 'date-fns';

interface Challenge {
  id: number;
  title: string;
  description: string;
  deadline: string;
  status: 'draft' | 'active' | 'closed' | 'cancelled';
  submissions_count: number;
  creator: {
    id: number;
    name: string;
  };
  created_at: string;
}

interface ChallengesData {
  data: Challenge[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

interface Props extends PageProps {
  challenges: ChallengesData;
}

export default function Index({ auth, challenges }: Props) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredChallenges = challenges.data.filter(challenge =>
    challenge.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    challenge.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    const variants = {
      draft: 'bg-gray-500',
      active: 'bg-green-500',
      closed: 'bg-blue-500',
      cancelled: 'bg-red-500',
    };
    return variants[status as keyof typeof variants] || 'bg-gray-500';
  };

  const handleDelete = (challengeId: number) => {
    if (confirm('Are you sure you want to delete this challenge?')) {
      router.delete(ddRoutes.challenges.destroy(challengeId).url);
    }
  };

  const handleActivate = (challengeId: number) => {
    router.post(ddRoutes.challenges.activate(challengeId).url);
  };

  const handleClose = (challengeId: number) => {
    router.post(ddRoutes.challenges.close(challengeId).url);
  };

  return (
    <AppLayout>
      <Head title="Manage Challenges" />
      
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Manage Challenges</h1>
            <p className="text-gray-600">
              Create and manage innovation challenges
            </p>
          </div>
          <Link href={ddRoutes.challenges.create().url}>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Challenge
            </Button>
          </Link>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            placeholder="Search challenges..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Challenges</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{challenges.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active</CardTitle>
              <Trophy className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {challenges.data.filter(c => c.status === 'active').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Drafts</CardTitle>
              <FileText className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {challenges.data.filter(c => c.status === 'draft').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {challenges.data.reduce((total, challenge) => total + challenge.submissions_count, 0)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Challenges Table */}
        <Card>
          <CardHeader>
            <CardTitle>Challenges</CardTitle>
            <CardDescription>
              Manage your innovation challenges
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredChallenges.length > 0 ? (
              <div className="space-y-4">
                {filteredChallenges.map((challenge) => (
                  <div key={challenge.id} className="border rounded-lg p-4">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold">{challenge.title}</h3>
                          <Badge className={`${getStatusBadge(challenge.status)} text-white`}>
                            {challenge.status}
                          </Badge>
                        </div>
                        <p className="text-gray-600 mb-2 line-clamp-2">
                          {challenge.description}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            Deadline: {format(new Date(challenge.deadline), 'MMM dd, yyyy')}
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {challenge.submissions_count} submissions
                          </div>
                          <div>
                            Created: {format(new Date(challenge.created_at), 'MMM dd, yyyy')}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Link href={challengesRoutes.show(challenge.id).url}>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Link href={ddRoutes.challenges.edit(challenge.id).url}>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        {challenge.status === 'draft' && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleActivate(challenge.id)}
                          >
                            Activate
                          </Button>
                        )}
                        {challenge.status === 'active' && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleClose(challenge.id)}
                          >
                            Close
                          </Button>
                        )}
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDelete(challenge.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchTerm ? 'No challenges found' : 'No challenges yet'}
                </h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm 
                    ? 'Try adjusting your search terms.'
                    : 'Create your first challenge to get started.'
                  }
                </p>
                {!searchTerm && (
                  <Link href={ddRoutes.challenges.create().url}>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Challenge
                    </Button>
                  </Link>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}