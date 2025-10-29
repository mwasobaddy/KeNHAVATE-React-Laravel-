import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
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
  Users, 
  Clock,
  FileText,
  ChevronRight
} from 'lucide-react';
import { format, isAfter, differenceInDays } from 'date-fns';

interface Challenge {
  id: number;
  title: string;
  description: string;
  deadline: string;
  reward: string;
  status: 'draft' | 'active' | 'closed' | 'cancelled';
  attachment_name?: string;
  active_submissions_count: number;
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

export default function PublicIndex({ auth, challenges }: Props) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredChallenges = challenges.data.filter(challenge =>
    challenge.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    challenge.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTimeRemaining = (deadline: string) => {
    const daysRemaining = differenceInDays(new Date(deadline), new Date());
    if (daysRemaining < 0) return 'Ended';
    if (daysRemaining === 0) return 'Ends today';
    if (daysRemaining === 1) return '1 day left';
    return `${daysRemaining} days left`;
  };

  const getStatusColor = (deadline: string) => {
    const daysRemaining = differenceInDays(new Date(deadline), new Date());
    if (daysRemaining < 0) return 'bg-gray-500';
    if (daysRemaining <= 3) return 'bg-red-500';
    if (daysRemaining <= 7) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <AppLayout>
      <Head title="Challenges" />
      
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Challenges</h1>
            <p className="text-gray-600">
              Participate in exciting challenges and showcase your innovation
            </p>
          </div>
          <Link href={challengesRoutes.submissions.mine().url}>
            <Button variant="outline">
              <FileText className="h-4 w-4 mr-2" />
              My Submissions
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Challenges</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{challenges.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Your Submissions</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {/* This would be calculated in the controller */}
                0
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Participants</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {challenges.data.reduce((total, challenge) => total + challenge.active_submissions_count, 0)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Challenges Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredChallenges.map((challenge) => (
            <Card key={challenge.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg line-clamp-2">
                    {challenge.title}
                  </CardTitle>
                  <Badge variant="secondary" className={`${getStatusColor(challenge.deadline)} text-white`}>
                    {getTimeRemaining(challenge.deadline)}
                  </Badge>
                </div>
                <CardDescription className="line-clamp-3">
                  {challenge.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="h-4 w-4 mr-2" />
                    Deadline: {format(new Date(challenge.deadline), 'MMM dd, yyyy')}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Trophy className="h-4 w-4 mr-2" />
                    Reward: {challenge.reward.substring(0, 50)}...
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Users className="h-4 w-4 mr-2" />
                    {challenge.active_submissions_count} submissions
                  </div>
                  {challenge.attachment_name && (
                    <div className="flex items-center text-sm text-gray-600">
                      <FileText className="h-4 w-4 mr-2" />
                      Attachment available
                    </div>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <Link href={challengesRoutes.show(challenge.id).url} className="flex-1">
                    <Button variant="outline" className="w-full">
                      View Details
                    </Button>
                  </Link>
                  {isAfter(new Date(challenge.deadline), new Date()) && (
                    <Link href={challengesRoutes.submit(challenge.id).url}>
                      <Button size="sm">
                        Submit
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredChallenges.length === 0 && (
          <div className="text-center py-12">
            <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? 'No challenges found' : 'No active challenges'}
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm 
                ? 'Try adjusting your search terms.'
                : 'Check back later for new challenges to participate in.'
              }
            </p>
            {searchTerm && (
              <Button variant="outline" onClick={() => setSearchTerm('')}>
                Clear Search
              </Button>
            )}
          </div>
        )}

        {/* Pagination would go here if needed */}
      </div>
    </AppLayout>
  );
}