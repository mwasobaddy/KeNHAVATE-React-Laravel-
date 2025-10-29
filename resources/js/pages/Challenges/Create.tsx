import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { PageProps } from '@/types';
import ddRoutes from '@/routes/dd';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  ChevronLeft,
  Upload,
  FileText,
  AlertCircle,
  Trophy,
  Calendar,
  Info
} from 'lucide-react';
import { toast } from 'react-toastify';

interface FormData {
  title: string;
  description: string;
  deadline: string;
  guidelines: string;
  reward: string;
  attachment: File | null;
}

export default function Create({ auth }: PageProps) {
  
  const { data, setData, post, processing, errors, reset } = useForm<FormData>({
    title: '',
    description: '',
    deadline: '',
    guidelines: '',
    reward: '',
    attachment: null,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('description', data.description);
    formData.append('deadline', data.deadline);
    formData.append('guidelines', data.guidelines);
    formData.append('reward', data.reward);
    
    if (data.attachment) {
      formData.append('attachment', data.attachment);
    }

    post(ddRoutes.challenges.store().url, {
      forceFormData: true,
      onSuccess: () => {
        toast.success('Challenge created successfully!');
      },
      onError: (errors) => {
        if (Object.keys(errors).length > 0) {
          toast.error('Please fix the errors below.');
        }
      },
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setData('attachment', file);
  };

  return (
    <AppLayout>
      <Head title="Create Challenge" />
      
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Back Navigation */}
        <div className="flex items-center gap-2">
          <Link href={ddRoutes.challenges.index().url}>
            <Button variant="ghost" size="sm">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back to Challenges
            </Button>
          </Link>
        </div>

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Create New Challenge</h1>
          <p className="text-gray-600">
            Create an innovation challenge to engage the community
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Challenge Details</CardTitle>
                <CardDescription>
                  Fill out all required fields to create your challenge.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Title */}
                  <div className="space-y-2">
                    <Label htmlFor="title">Challenge Title *</Label>
                    <Input
                      id="title"
                      value={data.title}
                      onChange={(e) => setData('title', e.target.value)}
                      placeholder="Enter challenge title"
                      className={errors.title ? 'border-red-500' : ''}
                    />
                    {errors.title && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        {errors.title}
                      </p>
                    )}
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      rows={4}
                      value={data.description}
                      onChange={(e) => setData('description', e.target.value)}
                      placeholder="Describe the challenge and what you're looking for"
                      className={errors.description ? 'border-red-500' : ''}
                    />
                    {errors.description && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        {errors.description}
                      </p>
                    )}
                  </div>

                  {/* Deadline */}
                  <div className="space-y-2">
                    <Label htmlFor="deadline">Deadline *</Label>
                    <Input
                      id="deadline"
                      type="datetime-local"
                      value={data.deadline}
                      onChange={(e) => setData('deadline', e.target.value)}
                      className={errors.deadline ? 'border-red-500' : ''}
                    />
                    {errors.deadline && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        {errors.deadline}
                      </p>
                    )}
                  </div>

                  {/* Guidelines */}
                  <div className="space-y-2">
                    <Label htmlFor="guidelines">Guidelines *</Label>
                    <Textarea
                      id="guidelines"
                      rows={6}
                      value={data.guidelines}
                      onChange={(e) => setData('guidelines', e.target.value)}
                      placeholder="Provide detailed guidelines for participants"
                      className={errors.guidelines ? 'border-red-500' : ''}
                    />
                    {errors.guidelines && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        {errors.guidelines}
                      </p>
                    )}
                  </div>

                  {/* Reward */}
                  <div className="space-y-2">
                    <Label htmlFor="reward">Reward *</Label>
                    <Textarea
                      id="reward"
                      rows={3}
                      value={data.reward}
                      onChange={(e) => setData('reward', e.target.value)}
                      placeholder="Describe the reward for the best submission"
                      className={errors.reward ? 'border-red-500' : ''}
                    />
                    {errors.reward && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        {errors.reward}
                      </p>
                    )}
                  </div>

                  {/* File Attachment */}
                  <div className="space-y-2">
                    <Label htmlFor="attachment">Attachment (Optional)</Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                      <div className="text-center">
                        <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <Label htmlFor="attachment" className="cursor-pointer">
                          <span className="text-blue-600 hover:text-blue-500">
                            Click to upload a file
                          </span>
                          <span className="text-gray-600"> or drag and drop</span>
                        </Label>
                        <Input
                          id="attachment"
                          type="file"
                          onChange={handleFileChange}
                          className="hidden"
                          accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          PDF, DOC, DOCX, PPT, PPTX, JPG, PNG up to 10MB
                        </p>
                        {data.attachment && (
                          <div className="mt-2 flex items-center justify-center gap-2 text-sm text-green-600">
                            <FileText className="h-4 w-4" />
                            {data.attachment.name}
                          </div>
                        )}
                      </div>
                    </div>
                    {errors.attachment && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        {errors.attachment}
                      </p>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-4 pt-4">
                    <Link href={ddRoutes.challenges.index().url}>
                      <Button type="button" variant="outline">
                        Cancel
                      </Button>
                    </Link>
                    <Button type="submit" disabled={processing}>
                      {processing ? 'Creating...' : 'Create Challenge'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Tips */}
            <Card className="border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2 text-blue-900">
                  <Info className="h-5 w-5" />
                  Tips for Creating Challenges
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-blue-800 space-y-2">
                  <p>• Be clear and specific about what you're looking for</p>
                  <p>• Set realistic but motivating deadlines</p>
                  <p>• Provide comprehensive guidelines</p>
                  <p>• Make the reward compelling</p>
                  <p>• Include supporting documents if needed</p>
                </div>
              </CardContent>
            </Card>

            {/* Preview */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Preview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="h-4 w-4" />
                  Status: Draft (until activated)
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Trophy className="h-4 w-4" />
                  Challenge will be visible to all users once activated
                </div>
                {data.deadline && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    Deadline: {new Date(data.deadline).toLocaleDateString()}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}