import React from 'react';
import { Head, Link } from '@inertiajs/react';
import challengesRoutes from '@/routes/challenges';
import AppLayout from '@/layouts/app-layout';
import { PageProps } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  Trophy, 
  Users, 
  FileText,
  Download,
  ChevronLeft,
  User,
  Clock
} from 'lucide-react';
import { format, isAfter, differenceInDays } from 'date-fns';

interface Submission {
  id: number;
  title: string;
  status: string;
  submitted_at: string;
  submitter: {
    id: number;
    name: string;
  };
}

interface Challenge {
  id: number;
  title: string;
  description: string;
  deadline: string;
  guidelines: string;
  reward: string;
  attachment_path?: string;
  attachment_name?: string;
  status: 'draft' | 'active' | 'closed' | 'cancelled';
  creator: {
    id: number;
    name: string;
  };
  submissions: Submission[];
  created_at: string;
}

interface Props extends PageProps {
  challenge: Challenge;
  userCanSubmit: boolean;
}

export default function Show({ auth, challenge, userCanSubmit }: Props) {
  const getTimeRemaining = (deadline: string) => {
    const daysRemaining = differenceInDays(new Date(deadline), new Date());
    if (daysRemaining < 0) return 'Challenge has ended';
    if (daysRemaining === 0) return 'Ends today';
    if (daysRemaining === 1) return '1 day remaining';
    return `${daysRemaining} days remaining`;
  };

  const getStatusColor = (deadline: string) => {
    const daysRemaining = differenceInDays(new Date(deadline), new Date());
    if (daysRemaining < 0) return 'bg-gray-500';
    if (daysRemaining <= 3) return 'bg-red-500';
    if (daysRemaining <= 7) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const isOpen = isAfter(new Date(challenge.deadline), new Date());

  return (
    <AppLayout>
      <Head title={challenge.title} />
      
      <div className="space-y-6">
        {/* Back Navigation */}
        <div className="flex items-center gap-2">
          <Link href={challengesRoutes.public.index().url}>
            <Button variant="ghost" size="sm">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back to Challenges
            </Button>
          </Link>
        </div>

        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-gray-900">{challenge.title}</h1>
              <Badge variant="secondary" className={`${getStatusColor(challenge.deadline)} text-white`}>
                {getTimeRemaining(challenge.deadline)}
              </Badge>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
              <div className="flex items-center gap-1">
                <User className="h-4 w-4" />
                Created by {challenge.creator.name}
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {format(new Date(challenge.created_at), 'MMM dd, yyyy')}
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                {challenge.submissions.length} submissions
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-3">
            {challenge.attachment_path && (
              <Link href={challengesRoutes.attachment(challenge.id).url}>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Download Attachment
                </Button>
              </Link>
            )}
            {userCanSubmit && isOpen && (
              <Link href={challengesRoutes.submit(challenge.id).url}>
                <Button>
                  <FileText className="h-4 w-4 mr-2" />
                  Submit Entry
                </Button>
              </Link>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>Challenge Description</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none">
                  {challenge.description.split('\n').map((paragraph, index) => (
                    <p key={index} className="mb-4 last:mb-0">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Guidelines */}
            <Card>
              <CardHeader>
                <CardTitle>Guidelines</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none">
                  {challenge.guidelines.split('\n').map((line, index) => (
                    <p key={index} className="mb-4 last:mb-0">
                      {line}
                    </p>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Submissions */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Submissions</CardTitle>
                <CardDescription>
                  {challenge.submissions.length} total submissions
                </CardDescription>
              </CardHeader>
              <CardContent>
                {challenge.submissions.length > 0 ? (
                  <div className="space-y-3">
                    {challenge.submissions.slice(0, 5).map((submission) => (
                      <div key={submission.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <h4 className="font-medium">{submission.title}</h4>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <span>by {submission.submitter.name}</span>
                            <span>•</span>
                            <span>{format(new Date(submission.submitted_at), 'MMM dd, yyyy')}</span>
                          </div>
                        </div>
                        <Badge variant="outline">
                          {submission.status.replace('_', ' ')}
                        </Badge>
                      </div>
                    ))}
                    {challenge.submissions.length > 5 && (
                      <p className="text-sm text-gray-600 text-center">
                        And {challenge.submissions.length - 5} more submissions...
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600">No submissions yet.</p>
                    {userCanSubmit && isOpen && (
                      <p className="text-sm text-gray-500 mt-1">Be the first to submit!</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Challenge Info */}
            <Card>
              <CardHeader>
                <CardTitle>Challenge Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="font-medium">Deadline</p>
                    <p className="text-sm text-gray-600">
                      {format(new Date(challenge.deadline), 'MMMM dd, yyyy \'at\' HH:mm')}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Trophy className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="font-medium">Reward</p>
                    <div className="text-sm text-gray-600 mt-1">
                      {challenge.reward.split('\n').map((line, index) => (
                        <p key={index} className="mb-1 last:mb-0">{line}</p>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Users className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="font-medium">Participation</p>
                    <p className="text-sm text-gray-600">
                      {challenge.submissions.length} submissions so far
                    </p>
                  </div>
                </div>
                {challenge.attachment_name && (
                  <div className="flex items-start gap-3">
                    <FileText className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="font-medium">Attachment</p>
                      <p className="text-sm text-gray-600">{challenge.attachment_name}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Call to Action */}
            {userCanSubmit && isOpen && (
              <Card className="border-green-200 bg-green-50">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <Trophy className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <h3 className="font-semibold text-green-900 mb-2">Ready to participate?</h3>
                    <p className="text-sm text-green-700 mb-4">
                      Submit your innovative solution and compete for the reward!
                    </p>
                    <Link href={challengesRoutes.submit(challenge.id).url}>
                      <Button className="w-full">
                        Submit Your Entry
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )}

            {!isOpen && (
              <Card className="border-gray-200 bg-gray-50">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <Clock className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <h3 className="font-semibold text-gray-700 mb-2">Challenge Ended</h3>
                    <p className="text-sm text-gray-600">
                      This challenge is no longer accepting submissions.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}