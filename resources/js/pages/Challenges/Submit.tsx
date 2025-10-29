import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { PageProps } from '@/types';
import challengesRoutes from '@/routes/challenges';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  ChevronLeft,
  Upload,
  FileText,
  AlertCircle,
  Trophy,
  Calendar,
  Info
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'react-toastify';

interface Challenge {
  id: number;
  title: string;
  description: string;
  deadline: string;
  guidelines: string;
  reward: string;
  attachment_name?: string;
  creator: {
    id: number;
    name: string;
  };
}

interface Props extends PageProps {
  challenge: Challenge;
}

interface FormData {
  title: string;
  description: string;
  motivation: string;
  cost_of_implementation: string;
  original_disclaimer: string;
  attachment: File | null;
  submit_now: boolean;
}

export default function Submit({ auth, challenge }: Props) {
  const [isDraft, setIsDraft] = useState(false);
  
  const { data, setData, post, processing, errors, reset } = useForm<FormData>({
    title: '',
    description: '',
    motivation: '',
    cost_of_implementation: '',
    original_disclaimer: '',
    attachment: null,
    submit_now: false,
  });

  const handleSubmit = (e: React.FormEvent, submitNow: boolean = false) => {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('description', data.description);
    formData.append('motivation', data.motivation);
    formData.append('cost_of_implementation', data.cost_of_implementation);
    formData.append('original_disclaimer', data.original_disclaimer);
    formData.append('submit_now', submitNow ? '1' : '0');
    
    if (data.attachment) {
      formData.append('attachment', data.attachment);
    }

    post(challengesRoutes.submissions.store(challenge.id).url, {
      forceFormData: true,
      onSuccess: () => {
        if (submitNow) {
          toast.success('Submission submitted successfully!');
        } else {
          toast.success('Submission saved as draft.');
        }
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
      <Head title={`Submit to ${challenge.title}`} />
      
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Back Navigation */}
        <div className="flex items-center gap-2">
          <Link href={challengesRoutes.show(challenge.id).url}>
            <Button variant="ghost" size="sm">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back to Challenge
            </Button>
          </Link>
        </div>

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Submit Your Entry</h1>
          <p className="text-gray-600">
            Create your submission for "{challenge.title}"
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Submission Details</CardTitle>
                <CardDescription>
                  Fill out all required fields to submit your entry to this challenge.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-6">
                  {/* Title */}
                  <div className="space-y-2">
                    <Label htmlFor="title">Project Title *</Label>
                    <Input
                      id="title"
                      value={data.title}
                      onChange={(e) => setData('title', e.target.value)}
                      placeholder="Enter your project title"
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
                      placeholder="Describe your project and solution"
                      className={errors.description ? 'border-red-500' : ''}
                    />
                    {errors.description && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        {errors.description}
                      </p>
                    )}
                  </div>

                  {/* Motivation */}
                  <div className="space-y-2">
                    <Label htmlFor="motivation">What Motivated You? *</Label>
                    <Textarea
                      id="motivation"
                      rows={3}
                      value={data.motivation}
                      onChange={(e) => setData('motivation', e.target.value)}
                      placeholder="Explain what inspired this solution"
                      className={errors.motivation ? 'border-red-500' : ''}
                    />
                    {errors.motivation && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        {errors.motivation}
                      </p>
                    )}
                  </div>

                  {/* Cost of Implementation */}
                  <div className="space-y-2">
                    <Label htmlFor="cost_of_implementation">Cost of Implementation (Optional)</Label>
                    <Input
                      id="cost_of_implementation"
                      type="number"
                      step="0.01"
                      min="0"
                      value={data.cost_of_implementation}
                      onChange={(e) => setData('cost_of_implementation', e.target.value)}
                      placeholder="0.00"
                      className={errors.cost_of_implementation ? 'border-red-500' : ''}
                    />
                    {errors.cost_of_implementation && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        {errors.cost_of_implementation}
                      </p>
                    )}
                  </div>

                  {/* Original Disclaimer */}
                  <div className="space-y-2">
                    <Label htmlFor="original_disclaimer">Original Disclaimer *</Label>
                    <Textarea
                      id="original_disclaimer"
                      rows={3}
                      value={data.original_disclaimer}
                      onChange={(e) => setData('original_disclaimer', e.target.value)}
                      placeholder="Confirm the originality of your work"
                      className={errors.original_disclaimer ? 'border-red-500' : ''}
                    />
                    {errors.original_disclaimer && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        {errors.original_disclaimer}
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
                          accept="*/*"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Any file format accepted. Max size: 50MB
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
                    <Button
                      type="submit"
                      onClick={(e) => handleSubmit(e, false)}
                      variant="outline"
                      disabled={processing}
                    >
                      Save as Draft
                    </Button>
                    <Button
                      type="button"
                      onClick={(e) => handleSubmit(e, true)}
                      disabled={processing}
                    >
                      {processing ? 'Submitting...' : 'Submit Entry'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Challenge Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{challenge.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="h-4 w-4" />
                  Deadline: {format(new Date(challenge.deadline), 'MMM dd, yyyy')}
                </div>
                <div className="flex items-start gap-2">
                  <Trophy className="h-4 w-4 text-gray-600 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-gray-900">Reward:</p>
                    <p className="text-gray-600">{challenge.reward.substring(0, 100)}...</p>
                  </div>
                </div>
                {challenge.attachment_name && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <FileText className="h-4 w-4" />
                    <Link href={challengesRoutes.attachment(challenge.id).url} className="text-blue-600 hover:underline">
                      {challenge.attachment_name}
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Guidelines Reminder */}
            <Card className="border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2 text-blue-900">
                  <Info className="h-5 w-5" />
                  Important
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-blue-800 space-y-2">
                  <p>• Review the challenge guidelines carefully</p>
                  <p>• Ensure your submission is original work</p>
                  <p>• You can save as draft and submit later</p>
                  <p>• Once submitted, you cannot make changes</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}