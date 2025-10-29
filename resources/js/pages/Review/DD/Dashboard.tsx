import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { PageProps } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { 
  Search, 
  FileText, 
  Calendar, 
  User, 
  MessageSquare, 
  TrendingUp, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Settings,
  Eye,
  ArrowRight,
  Users
} from 'lucide-react';
import { toast } from 'react-toastify';

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
  reviews: Review[];
  stage1_reviews: Review[];
  stage2_reviews: Review[];
  latest_decision?: {
    id: number;
    decision: string;
    compiled_comments: string;
    decided_at: string;
  };
}

interface DDWorkflowProps extends PageProps {
  stage1_ideas: Idea[];
  stage2_ideas: Idea[];
  completed_ideas: Idea[];
  stats: {
    stage1_pending: number;
    stage2_pending: number;
    decisions_made: number;
    total_ideas_processed: number;
  };
}

export default function DDWorkflow({ 
  auth, 
  stage1_ideas = [], 
  stage2_ideas = [], 
  completed_ideas = [],
  stats = {
    stage1_pending: 0,
    stage2_pending: 0,
    decisions_made: 0,
    total_ideas_processed: 0
  }
}: DDWorkflowProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null);
  const [decision, setDecision] = useState<'approve' | 'revise' | 'reject'>('approve');
  const [compiledComments, setCompiledComments] = useState('');
  const [ddComments, setDdComments] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filterIdeas = (ideas: Idea[]) => {
    return ideas.filter(idea => 
      idea.idea_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      idea.author.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'stage 1 review': { color: 'bg-blue-100 text-blue-800', icon: Clock },
      'stage 2 review': { color: 'bg-purple-100 text-purple-800', icon: Clock },
      'approved': { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      'stage 1 revise': { color: 'bg-yellow-100 text-yellow-800', icon: AlertCircle },
      'stage 2 revise': { color: 'bg-orange-100 text-orange-800', icon: AlertCircle },
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const openDecisionDialog = (idea: Idea) => {
    setSelectedIdea(idea);
    setDecision('approve');
    setCompiledComments('');
    setDdComments('');
    setIsDialogOpen(true);
  };

  const submitDecision = async () => {
    if (!selectedIdea || !compiledComments.trim()) {
      toast.error("Please provide compiled comments for your decision.");
      return;
    }

    setIsSubmitting(true);

    try {
      await router.post(`/review/dd/decision/${selectedIdea.id}`, {
        decision,
        compiled_comments: compiledComments,
        dd_comments: ddComments,
        review_stage: selectedIdea.status.includes('stage 1') ? 'stage1' : 'stage2'
      });

      toast.success("Decision submitted successfully!");

      setIsDialogOpen(false);
      setSelectedIdea(null);
    } catch (error) {
      toast.error("Failed to submit decision. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const IdeaCard = ({ idea }: { idea: Idea }) => {
    const stage1Reviews = idea.stage1_reviews || [];
    const stage2Reviews = idea.stage2_reviews || [];
    const currentReviews = idea.status.includes('stage 1') ? stage1Reviews : stage2Reviews;
    
    const recommendationCounts = currentReviews.reduce(
      (acc, review) => {
        acc[review.recommendation] = (acc[review.recommendation] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const canMakeDecision = currentReviews.length >= 2; // Minimum reviews required

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
          {/* Review Summary */}
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-sm">Review Summary</h4>
              <Badge variant="outline" className="text-xs">
                {currentReviews.length} Reviews
              </Badge>
            </div>
            <div className="flex gap-2 text-xs">
              {Object.entries(recommendationCounts).map(([rec, count]) => (
                <div key={rec} className="flex items-center gap-1">
                  {getRecommendationBadge(rec)}
                  <span className="text-gray-600">({count})</span>
                </div>
              ))}
            </div>
          </div>

          {/* Latest Decision */}
          {idea.latest_decision && (
            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-sm">Latest Decision</h4>
                <Badge variant="outline" className="text-xs">
                  {formatDate(idea.latest_decision.decided_at)}
                </Badge>
              </div>
              <p className="text-sm text-gray-700 line-clamp-2">
                {idea.latest_decision.compiled_comments}
              </p>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <MessageSquare className="h-4 w-4" />
                {currentReviews.length} Reviews
              </span>
              <span className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                Stage {idea.status.includes('stage 1') ? '1' : '2'}
              </span>
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
              {canMakeDecision && (
                <Button
                  size="sm"
                  onClick={() => openDecisionDialog(idea)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Settings className="h-4 w-4 mr-1" />
                  Make Decision
                </Button>
              )}
              {!canMakeDecision && (
                <Badge variant="outline" className="text-xs px-3 py-1">
                  Awaiting Reviews
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <AppLayout>
      <Head title="DD Workflow Management" />

      <div className="py-6">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Stage 1 Pending</CardTitle>
                <Clock className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{stats.stage1_pending}</div>
                <p className="text-xs text-muted-foreground">
                  Ideas awaiting Stage 1 decision
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Stage 2 Pending</CardTitle>
                <Clock className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">{stats.stage2_pending}</div>
                <p className="text-xs text-muted-foreground">
                  Ideas awaiting Stage 2 decision
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Decisions Made</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats.decisions_made}</div>
                <p className="text-xs text-muted-foreground">
                  Total decisions this month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Processed</CardTitle>
                <TrendingUp className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{stats.total_ideas_processed}</div>
                <p className="text-xs text-muted-foreground">
                  Ideas processed overall
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Search */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Search Ideas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by idea title or author..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          {/* Ideas Tabs */}
          <Tabs defaultValue="stage1" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="stage1" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Stage 1 Ideas ({filterIdeas(stage1_ideas).length})
              </TabsTrigger>
              <TabsTrigger value="stage2" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Stage 2 Ideas ({filterIdeas(stage2_ideas).length})
              </TabsTrigger>
              <TabsTrigger value="completed" className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Completed ({filterIdeas(completed_ideas).length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="stage1" className="mt-6">
              <div className="space-y-4">
                {filterIdeas(stage1_ideas).map((idea) => (
                  <IdeaCard key={idea.id} idea={idea} />
                ))}
                {filterIdeas(stage1_ideas).length === 0 && (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <Clock className="h-12 w-12 text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        No Stage 1 ideas pending
                      </h3>
                      <p className="text-gray-500 text-center max-w-md">
                        All Stage 1 ideas have been processed or there are no ideas matching your search.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="stage2" className="mt-6">
              <div className="space-y-4">
                {filterIdeas(stage2_ideas).map((idea) => (
                  <IdeaCard key={idea.id} idea={idea} />
                ))}
                {filterIdeas(stage2_ideas).length === 0 && (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <Users className="h-12 w-12 text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        No Stage 2 ideas pending
                      </h3>
                      <p className="text-gray-500 text-center max-w-md">
                        All Stage 2 ideas have been processed or there are no ideas matching your search.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="completed" className="mt-6">
              <div className="space-y-4">
                {filterIdeas(completed_ideas).map((idea) => (
                  <IdeaCard key={idea.id} idea={idea} />
                ))}
                {filterIdeas(completed_ideas).length === 0 && (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <CheckCircle className="h-12 w-12 text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        No completed ideas
                      </h3>
                      <p className="text-gray-500 text-center max-w-md">
                        No ideas have been completed yet, or none match your search criteria.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Decision Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Make Decision</DialogTitle>
            <DialogDescription>
              Review all feedback and make a decision for: {selectedIdea?.idea_title}
            </DialogDescription>
          </DialogHeader>

          {selectedIdea && (
            <div className="space-y-6">
              {/* Review Summary */}
              <div className="space-y-4">
                <h4 className="font-medium">Review Summary</h4>
                <div className="space-y-3">
                  {(selectedIdea.status.includes('stage 1') ? selectedIdea.stage1_reviews : selectedIdea.stage2_reviews).map((review) => (
                    <div key={review.id} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm">{review.reviewer.name}</span>
                        <div className="flex items-center gap-2">
                          {getRecommendationBadge(review.recommendation)}
                          <span className="text-xs text-gray-500">
                            {formatDate(review.reviewed_at)}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-700">{review.comments}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Decision Form */}
              <div className="space-y-4">
                <div>
                  <Label className="text-base font-medium">Your Decision</Label>
                  <RadioGroup value={decision} onValueChange={(value: 'approve' | 'revise' | 'reject') => setDecision(value)} className="mt-2">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="approve" id="approve" />
                      <Label htmlFor="approve" className="text-green-700">Approve - Move to next stage</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="revise" id="revise" />
                      <Label htmlFor="revise" className="text-yellow-700">Request Revisions</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="reject" id="reject" />
                      <Label htmlFor="reject" className="text-red-700">Reject Idea</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div>
                  <Label htmlFor="compiled-comments">Compiled Comments *</Label>
                  <Textarea
                    id="compiled-comments"
                    placeholder="Summarize the reviewers' feedback and provide your reasoning for this decision..."
                    value={compiledComments}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setCompiledComments(e.target.value)}
                    rows={4}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="dd-comments">Additional DD Comments (Optional)</Label>
                  <Textarea
                    id="dd-comments"
                    placeholder="Add any additional instructions or comments for the author..."
                    value={ddComments}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDdComments(e.target.value)}
                    rows={3}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={submitDecision} 
              disabled={isSubmitting || !compiledComments.trim()}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Decision'}
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}