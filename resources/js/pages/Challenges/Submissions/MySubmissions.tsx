import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { PageProps } from '@/types';
import challengesRoutes from '@/routes/challenges';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  Calendar, 
  Trophy, 
  Edit,
  Eye,
  FileText,
  Clock
} from 'lucide-react';
import { format } from 'date-fns';

interface Challenge {
  id: number;
  title: string;
  deadline: string;
}

interface Submission {
  id: number;
  title: string;
  description: string;
  status: 'draft' | 'stage 1 review' | 'stage 2 review' | 'stage 1 revise' | 'stage 2 revise' | 'approved' | 'rejected';
  submitted_at?: string;
  challenge: Challenge;
  created_at: string;
}

interface SubmissionsData {
  data: Submission[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

interface Props extends PageProps {
  submissions: SubmissionsData;
}

export default function MySubmissions({ auth, submissions }: Props) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredSubmissions = submissions.data.filter(submission =>
    submission.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    submission.challenge.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    const variants = {
      'draft': 'bg-gray-500',
      'stage 1 review': 'bg-blue-500',
      'stage 2 review': 'bg-blue-600',
      'stage 1 revise': 'bg-yellow-500',
      'stage 2 revise': 'bg-yellow-600',
      'approved': 'bg-green-500',
      'rejected': 'bg-red-500',
    };
    return variants[status as keyof typeof variants] || 'bg-gray-500';
  };

  const getStatusText = (status: string) => {
    const texts = {
      'draft': 'Draft',
      'stage 1 review': 'Under Review (Stage 1)',
      'stage 2 review': 'Under Review (Stage 2)',
      'stage 1 revise': 'Needs Revision (Stage 1)',
      'stage 2 revise': 'Needs Revision (Stage 2)',
      'approved': 'Approved',
      'rejected': 'Rejected',
    };
    return texts[status as keyof typeof texts] || status;
  };

  const canEdit = (submission: Submission) => {
    return ['draft', 'stage 1 revise', 'stage 2 revise'].includes(submission.status) &&
           new Date(submission.challenge.deadline) > new Date();
  };

  return (
    <AppLayout>
      <Head title="My Submissions" />
      
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Submissions</h1>
            <p className="text-gray-600">
              Track your challenge submissions and their status
            </p>
          </div>
          <Link href={challengesRoutes.public.index().url}>
            <Button>
              <Trophy className="h-4 w-4 mr-2" />
              Browse Challenges
            </Button>
          </Link>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            placeholder="Search submissions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{submissions.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Under Review</CardTitle>
              <Clock className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {submissions.data.filter(s => s.status.includes('review')).length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approved</CardTitle>
              <Trophy className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {submissions.data.filter(s => s.status === 'approved').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Drafts</CardTitle>
              <Edit className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {submissions.data.filter(s => s.status === 'draft').length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Submissions List */}
        <div className="space-y-4">
          {filteredSubmissions.length > 0 ? (
            filteredSubmissions.map((submission) => (
              <Card key={submission.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">{submission.title}</h3>
                        <Badge className={`${getStatusBadge(submission.status)} text-white`}>
                          {getStatusText(submission.status)}
                        </Badge>
                      </div>
                      <p className="text-gray-600 mb-2 line-clamp-2">
                        {submission.description}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Trophy className="h-4 w-4" />
                          Challenge: {submission.challenge.title}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {submission.submitted_at 
                            ? `Submitted: ${format(new Date(submission.submitted_at), 'MMM dd, yyyy')}`
                            : `Created: ${format(new Date(submission.created_at), 'MMM dd, yyyy')}`
                          }
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          Deadline: {format(new Date(submission.challenge.deadline), 'MMM dd, yyyy')}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Link href={challengesRoutes.submissions.show(submission.id).url}>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </Link>
                      {canEdit(submission) && (
                        <Link href={challengesRoutes.submissions.edit(submission.id).url}>
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm ? 'No submissions found' : 'No submissions yet'}
              </h3>
              <p className="text-gray-600 mb-4">
                {searchTerm 
                  ? 'Try adjusting your search terms.'
                  : 'Start by participating in a challenge to create your first submission.'
                }
              </p>
              {!searchTerm && (
                <Link href={challengesRoutes.public.index().url}>
                  <Button>
                    <Trophy className="h-4 w-4 mr-2" />
                    Browse Challenges
                  </Button>
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}