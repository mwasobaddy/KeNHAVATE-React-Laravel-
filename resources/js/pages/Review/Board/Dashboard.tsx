import React, { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { PageProps } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, FileText, Calendar, User, MessageSquare, TrendingUp, CheckCircle, Clock, AlertCircle } from 'lucide-react';

interface Idea {
  id: number;
  idea_title: string;
  slug: string;
  status: string;
  author: {
    id: number;
    name: string;
    email: string;
  };
  thematic_area: {
    id: number;
    name: string;
  } | null;
  created_at: string;
  updated_at: string;
  reviews_count: number;
  stage2_reviews_count: number;
  average_rating?: number;
  has_reviewed: boolean;
}

interface BoardDashboardProps extends PageProps {
  pending_ideas: Idea[];
  reviewed_ideas: Idea[];
  stats: {
    pending_count: number;
    reviewed_count: number;
    total_reviews: number;
    avg_reviews_per_idea: number;
  };
}

export default function BoardDashboard({ 
  auth, 
  pending_ideas = [], 
  reviewed_ideas = [], 
  stats = {
    pending_count: 0,
    reviewed_count: 0,
    total_reviews: 0,
    avg_reviews_per_idea: 0
  }
}: BoardDashboardProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [thematicFilter, setThematicFilter] = useState('all');

  // Get unique thematic areas for filter
  const thematicAreas = [...new Set([...pending_ideas, ...reviewed_ideas]
    .map(idea => idea.thematic_area)
    .filter(Boolean)
  )];

  const filterIdeas = (ideas: Idea[]) => {
    return ideas.filter(idea => {
      const matchesSearch = idea.idea_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           idea.author.name.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || idea.status === statusFilter;
      
      const matchesThematic = thematicFilter === 'all' || 
                             (idea.thematic_area && idea.thematic_area.id.toString() === thematicFilter);
      
      return matchesSearch && matchesStatus && matchesThematic;
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'stage 2 review': { color: 'bg-blue-100 text-blue-800', icon: Clock },
      'approved': { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      'stage 2 revise': { color: 'bg-yellow-100 text-yellow-800', icon: AlertCircle },
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleReviewIdea = (ideaSlug: string) => {
    router.visit(`/review/board/idea/${ideaSlug}`);
  };

  const IdeaCard = ({ idea }: { idea: Idea }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1">
            <CardTitle className="text-lg line-clamp-2 mb-2">
              {idea.idea_title}
            </CardTitle>
            <CardDescription className="flex items-center gap-4 text-sm">
              <span className="flex items-center gap-1">
                <User className="h-4 w-4" />
                {idea.author.name}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {formatDate(idea.created_at)}
              </span>
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
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span className="flex items-center gap-1">
              <MessageSquare className="h-4 w-4" />
              {idea.stage2_reviews_count} Board Reviews
            </span>
            {idea.average_rating && (
              <span className="flex items-center gap-1">
                <TrendingUp className="h-4 w-4" />
                Avg: {idea.average_rating.toFixed(1)}/5
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.visit(`/ideas/${idea.slug}`)}
            >
              <FileText className="h-4 w-4 mr-1" />
              View Details
            </Button>
            {!idea.has_reviewed && idea.status === 'stage 2 review' && (
              <Button
                size="sm"
                onClick={() => handleReviewIdea(idea.slug)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Review Idea
              </Button>
            )}
            {idea.has_reviewed && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleReviewIdea(idea.slug)}
              >
                View Review
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <AppLayout>
      <Head title="Board Review Dashboard" />

      <div className="py-6">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
                <Clock className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{stats.pending_count}</div>
                <p className="text-xs text-muted-foreground">
                  Stage 2 ideas awaiting review
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completed Reviews</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats.reviewed_count}</div>
                <p className="text-xs text-muted-foreground">
                  Ideas you've reviewed
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
                <MessageSquare className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">{stats.total_reviews}</div>
                <p className="text-xs text-muted-foreground">
                  Reviews submitted by you
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Reviews</CardTitle>
                <TrendingUp className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {stats.avg_reviews_per_idea.toFixed(1)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Reviews per idea
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
                    placeholder="Search by idea title or author..."
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
                    <SelectItem value="stage 2 review">Stage 2 Review</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="stage 2 revise">Needs Revision</SelectItem>
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
          <Tabs defaultValue="pending" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="pending" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Pending Reviews ({filterIdeas(pending_ideas).length})
              </TabsTrigger>
              <TabsTrigger value="reviewed" className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Reviewed Ideas ({filterIdeas(reviewed_ideas).length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pending" className="mt-6">
              <div className="space-y-4">
                {filterIdeas(pending_ideas).length > 0 ? (
                  filterIdeas(pending_ideas).map((idea) => (
                    <IdeaCard key={idea.id} idea={idea} />
                  ))
                ) : (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <Clock className="h-12 w-12 text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        No pending reviews
                      </h3>
                      <p className="text-gray-500 text-center max-w-md">
                        All Stage 2 ideas have been reviewed by you, or there are no ideas 
                        currently in Stage 2 review that match your filters.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="reviewed" className="mt-6">
              <div className="space-y-4">
                {filterIdeas(reviewed_ideas).length > 0 ? (
                  filterIdeas(reviewed_ideas).map((idea) => (
                    <IdeaCard key={idea.id} idea={idea} />
                  ))
                ) : (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <CheckCircle className="h-12 w-12 text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        No reviewed ideas
                      </h3>
                      <p className="text-gray-500 text-center max-w-md">
                        You haven't reviewed any ideas yet, or no reviewed ideas match your current filters.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AppLayout>
  );
}