import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { PageProps } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Search, 
  FileText, 
  Calendar, 
  MessageSquare, 
  TrendingUp, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Edit,
  Eye,
  Users,
  Award,
  RefreshCw
} from 'lucide-react';

interface Review {
  id: number;
  reviewer: {
    id: number;
    name: string;
    email: string;
  };
  review_stage: string;
  recommendation: 'approve' | 'revise' | 'reject';
  comments: string;
  reviewed_at: string;
}

interface Decision {
  id: number;
  review_stage: string;
  decision: 'approve' | 'revise' | 'reject';
  compiled_comments: string;
  dd_comments?: string;
  decided_at: string;
}

interface Idea {
  id: number;
  idea_title: string;
  slug: string;
  status: string;
  thematic_area: {
    id: number;
    name: string;
  } | null;
  created_at: string;
  updated_at: string;
  stage1_reviews: Review[];
  stage2_reviews: Review[];
  decisions: Decision[];
  latest_decision?: Decision;
  can_edit: boolean;
}

interface AuthorDashboardProps extends PageProps {
  ideas: Idea[];
  stats: {
    total_ideas: number;
    in_review: number;
    approved: number;
    needs_revision: number;
    rejected: number;
  };
}

export default function AuthorDashboard({ 
  auth, 
  ideas = [], 
  stats = {
    total_ideas: 0,
    in_review: 0,
    approved: 0,
    needs_revision: 0,
    rejected: 0
  }
}: AuthorDashboardProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [thematicFilter, setThematicFilter] = useState('all');

  // Get unique thematic areas for filter
  const thematicAreas = [...new Set(ideas
    .map(idea => idea.thematic_area)
    .filter(Boolean)
  )];

  const filterIdeas = (ideas: Idea[]) => {
    return ideas.filter(idea => {
      const matchesSearch = idea.idea_title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || idea.status === statusFilter;
      const matchesThematic = thematicFilter === 'all' || 
                             (idea.thematic_area && idea.thematic_area.id.toString() === thematicFilter);
      
      return matchesSearch && matchesStatus && matchesThematic;
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'draft': { color: 'bg-gray-100 text-gray-800', icon: FileText },
      'stage 1 review': { color: 'bg-blue-100 text-blue-800', icon: Clock },
      'stage 2 review': { color: 'bg-purple-100 text-purple-800', icon: Users },
      'approved': { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      'stage 1 revise': { color: 'bg-yellow-100 text-yellow-800', icon: RefreshCw },
      'stage 2 revise': { color: 'bg-orange-100 text-orange-800', icon: RefreshCw },
      'rejected': { color: 'bg-red-100 text-red-800', icon: AlertCircle },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || 
                   { color: 'bg-gray-100 text-gray-800', icon: Clock };
    
    const Icon = config.icon;
    
    return (
      <Badge className={`${config.color} flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getProgressPercentage = (status: string) => {
    const progressMap = {
      'draft': 0,
      'stage 1 review': 25,
      'stage 1 revise': 30,
      'stage 2 review': 60,
      'stage 2 revise': 65,  
      'approved': 100,
      'rejected': 100
    };
    
    return progressMap[status as keyof typeof progressMap] || 0;
  };

  const getProgressColor = (status: string) => {
    if (status === 'approved') return 'bg-green-500';
    if (status === 'rejected') return 'bg-red-500';
    if (status.includes('revise')) return 'bg-yellow-500';
    return 'bg-blue-500';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getRecommendationBadge = (recommendation: string) => {
    const colors = {
      approve: 'bg-green-100 text-green-800',
      revise: 'bg-yellow-100 text-yellow-800',
      reject: 'bg-red-100 text-red-800'
    };
    
    return (
      <Badge className={colors[recommendation as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>
        {recommendation.charAt(0).toUpperCase() + recommendation.slice(1)}
      </Badge>
    );
  };

  const IdeaCard = ({ idea }: { idea: Idea }) => {
    const stage1Reviews = idea.stage1_reviews || [];
    const stage2Reviews = idea.stage2_reviews || [];
    const allReviews = [...stage1Reviews, ...stage2Reviews];
    const progressPercentage = getProgressPercentage(idea.status);

    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start gap-4">
            <div className="flex-1">
              <CardTitle className="text-lg line-clamp-2 mb-2">
                {idea.idea_title}
              </CardTitle>
              <CardDescription className="flex items-center gap-4 text-sm">
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Created: {formatDate(idea.created_at)}
                </span>
                {idea.updated_at !== idea.created_at && (
                  <span className="flex items-center gap-1">
                    <RefreshCw className="h-4 w-4" />
                    Updated: {formatDate(idea.updated_at)}
                  </span>
                )}
              </CardDescription>
            </div>
            <div className="flex flex-col items-end gap-2">
              {getStatusBadge(idea.status)}
              {idea.thematic_area && (
                <Badge variant="outline" className="text-xs">
                  {idea.thematic_area.name}
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex justify-between items-center text-sm mb-2">
              <span className="font-medium">Review Progress</span>
              <span className="text-gray-600">{progressPercentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(idea.status)}`}
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>

          {/* Review Statistics */}
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Stage 1 Reviews:</span>
                <span className="ml-2 font-medium">{stage1Reviews.length}</span>
              </div>
              <div>
                <span className="text-gray-600">Stage 2 Reviews:</span>
                <span className="ml-2 font-medium">{stage2Reviews.length}</span>
              </div>
            </div>
          </div>

          {/* Latest Decision */}
          {idea.latest_decision && (
            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-sm">Latest Decision</h4>
                <div className="flex items-center gap-2">
                  {getRecommendationBadge(idea.latest_decision.decision)}
                  <span className="text-xs text-gray-500">
                    {formatDate(idea.latest_decision.decided_at)}
                  </span>
                </div>
              </div>
              <p className="text-sm text-gray-700 line-clamp-3">
                {idea.latest_decision.compiled_comments}
              </p>
              {idea.latest_decision.dd_comments && (
                <div className="mt-2 pt-2 border-t border-blue-200">
                  <p className="text-sm text-blue-800 font-medium">DD Instructions:</p>
                  <p className="text-sm text-blue-700 mt-1">
                    {idea.latest_decision.dd_comments}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Reviews Summary */}
          {allReviews.length > 0 && (
            <div className="mb-4">
              <h4 className="font-medium text-sm mb-2">Recent Reviewer Feedback</h4>
              <div className="space-y-2">
                {allReviews.slice(-2).map((review) => (
                  <div key={review.id} className="p-2 border rounded text-sm">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium">{review.reviewer.name}</span>
                      <div className="flex items-center gap-2">
                        {getRecommendationBadge(review.recommendation)}
                        <Badge variant="outline" className="text-xs">
                          Stage {review.review_stage.replace('stage', '')}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-gray-600 line-clamp-2">{review.comments}</p>
                  </div>
                ))}
                {allReviews.length > 2 && (
                  <Button
                    variant="link"
                    size="sm"
                    className="p-0 h-auto text-blue-600"
                    onClick={() => router.visit(`/ideas/${idea.slug}#reviews`)}
                  >
                    View all {allReviews.length} reviews
                  </Button>
                )}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <MessageSquare className="h-4 w-4" />
                {allReviews.length} Reviews
              </span>
              {idea.status.includes('revise') && (
                <Badge className="bg-yellow-100 text-yellow-800 text-xs">
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Action Required
                </Badge>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.visit(`/ideas/${idea.slug}`)}
              >
                <Eye className="h-4 w-4 mr-1" />
                View Details
              </Button>
              {idea.can_edit && (idea.status === 'draft' || idea.status.includes('revise')) && (
                <Button
                  size="sm"
                  onClick={() => router.visit(`/ideas/${idea.slug}/edit`)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit Idea
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  // Group ideas by status for better organization
  const groupedIdeas = {
    drafts: ideas.filter(idea => idea.status === 'draft'),
    in_review: ideas.filter(idea => idea.status.includes('review')),
    needs_revision: ideas.filter(idea => idea.status.includes('revise')),
    completed: ideas.filter(idea => ['approved', 'rejected'].includes(idea.status))
  };

  return (
    <AppLayout>
      <Head title="My Ideas Dashboard" />

      <div className="py-6">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Ideas</CardTitle>
                <FileText className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{stats.total_ideas}</div>
                <p className="text-xs text-muted-foreground">
                  Ideas submitted
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">In Review</CardTitle>
                <Clock className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">{stats.in_review}</div>
                <p className="text-xs text-muted-foreground">
                  Currently being reviewed
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Approved</CardTitle>
                <Award className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
                <p className="text-xs text-muted-foreground">
                  Successfully approved
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Need Revision</CardTitle>
                <RefreshCw className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{stats.needs_revision}</div>
                <p className="text-xs text-muted-foreground">
                  Require updates
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Rejected</CardTitle>
                <AlertCircle className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
                <p className="text-xs text-muted-foreground">
                  Not approved
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Filter & Search</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by idea title..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="stage 1 review">Stage 1 Review</SelectItem>
                    <SelectItem value="stage 2 review">Stage 2 Review</SelectItem>
                    <SelectItem value="stage 1 revise">Stage 1 Revise</SelectItem>
                    <SelectItem value="stage 2 revise">Stage 2 Revise</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={thematicFilter} onValueChange={setThematicFilter}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Filter by thematic area" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Themes</SelectItem>
                    {thematicAreas.map((area) => (
                      <SelectItem key={area!.id} value={area!.id.toString()}>
                        {area!.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Ideas Tabs */}
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="all">
                All ({filterIdeas(ideas).length})
              </TabsTrigger>
              <TabsTrigger value="drafts">
                Drafts ({filterIdeas(groupedIdeas.drafts).length})
              </TabsTrigger>
              <TabsTrigger value="in_review">
                In Review ({filterIdeas(groupedIdeas.in_review).length})
              </TabsTrigger>
              <TabsTrigger value="needs_revision">
                Revisions ({filterIdeas(groupedIdeas.needs_revision).length})
              </TabsTrigger>
              <TabsTrigger value="completed">
                Completed ({filterIdeas(groupedIdeas.completed).length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-6">
              <div className="space-y-4">
                {filterIdeas(ideas).map((idea) => (
                  <IdeaCard key={idea.id} idea={idea} />
                ))}
                {filterIdeas(ideas).length === 0 && (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <FileText className="h-12 w-12 text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        No ideas found
                      </h3>
                      <p className="text-gray-500 text-center max-w-md mb-4">
                        You haven't submitted any ideas yet, or no ideas match your current filters.
                      </p>
                      <Button onClick={() => router.visit('/ideas/create')}>
                        <FileText className="h-4 w-4 mr-2" />
                        Create Your First Idea
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            {['drafts', 'in_review', 'needs_revision', 'completed'].map((tabKey) => (
              <TabsContent key={tabKey} value={tabKey} className="mt-6">
                <div className="space-y-4">
                  {filterIdeas(groupedIdeas[tabKey as keyof typeof groupedIdeas]).map((idea) => (
                    <IdeaCard key={idea.id} idea={idea} />
                  ))}
                  {filterIdeas(groupedIdeas[tabKey as keyof typeof groupedIdeas]).length === 0 && (
                    <Card>
                      <CardContent className="flex flex-col items-center justify-center py-12">
                        <FileText className="h-12 w-12 text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          No ideas in this category
                        </h3>
                        <p className="text-gray-500 text-center max-w-md">
                          No ideas match this status or your current filters.
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </div>
    </AppLayout>
  );
}