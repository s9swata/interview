'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, FileText, Calendar, Star, Download, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { Navbar } from '@/components/Navbar';

interface Resume {
    id: string;
    file_name: string;
    file_url: string;
    created_at: string;
    ats_score: number;
}

interface Interview {
    id: string;
    scheduled_date: string;
    duration_minutes: number;
    status: 'scheduled' | 'completed' | 'cancelled';
    resume_id: string;
    feedback?: string;
}

export default function ProfilePage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [resumes, setResumes] = useState<Resume[]>([]);
    const [interviews, setInterviews] = useState<Interview[]>([]);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        }
    }, [user, authLoading, router]);

    useEffect(() => {
        async function fetchUserData() {
            if (!user) return;

            try {
                const { data: resumesData, error: resumesError } = await supabase
                    .from('resumes')
                    .select('*')
                    .eq('user_id', user.id);

                if (resumesError) throw resumesError;
                setResumes(resumesData || []);

                const { data: interviewsData, error: interviewsError } = await supabase
                    .from('interviews')
                    .select('*')
                    .eq('user_id', user.id);

                if (interviewsError) throw interviewsError;
                setInterviews(interviewsData || []);
            } catch (error) {
                console.error('Error fetching user data:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchUserData();
    }, [user]);

    if (authLoading || loading || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">My Profile</h1>
                    <p className="text-slate-600">Manage your resumes and interview history</p>
                </div>

                <Tabs defaultValue="resumes" className="space-y-6">
                    <TabsList>
                        <TabsTrigger value="resumes">Resumes</TabsTrigger>
                        <TabsTrigger value="interviews">Interviews</TabsTrigger>
                    </TabsList>

                    <TabsContent value="resumes" className="space-y-6">
                        {resumes.length === 0 ? (
                            <Card className="flex flex-col items-center justify-center p-12 text-center">
                                <FileText className="h-12 w-12 text-slate-400 mb-4" />
                                <h3 className="text-lg font-medium text-slate-900 mb-2">No resumes uploaded yet</h3>
                                <p className="text-sm text-slate-600 mb-4">Upload your resume to get started with interviews</p>
                                <Button onClick={() => router.push('/resume')} size="lg">
                                    Upload Resume
                                </Button>
                            </Card>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {resumes.map((resume) => (
                                    <Card key={resume.id} className="hover:shadow-lg transition-shadow">
                                        <CardHeader className="flex flex-row items-start justify-between space-y-0">
                                            <div>
                                                <CardTitle className="text-base font-medium line-clamp-1">
                                                    {resume.file_name}
                                                </CardTitle>
                                                <CardDescription>
                                                    Uploaded {format(new Date(resume.created_at), 'PPP')}
                                                </CardDescription>
                                            </div>
                                            <FileText className="h-5 w-5 text-blue-600" />
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-4">
                                                <div>
                                                    <p className="text-sm font-medium text-slate-600">ATS Score</p>
                                                    <div className="flex items-center mt-1">
                                                        <Star className="h-5 w-5 text-yellow-500 mr-1" />
                                                        <span className="text-lg font-semibold">{resume.ats_score}/100</span>
                                                    </div>
                                                </div>
                                                <div className="flex space-x-2">
                                                    <Button variant="outline" size="sm" className="flex-1">
                                                        <Download className="h-4 w-4 mr-2" />
                                                        Download
                                                    </Button>
                                                    <Button size="sm" className="flex-1">
                                                        <ExternalLink className="h-4 w-4 mr-2" />
                                                        View
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="interviews" className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {interviews.map((interview) => (
                                <Card key={interview.id} className="hover:shadow-lg transition-shadow">
                                    <CardHeader className="flex flex-row items-start justify-between space-y-0">
                                        <div>
                                            <CardTitle className="text-base font-medium">
                                                {format(new Date(interview.scheduled_date), 'PPP')}
                                            </CardTitle>
                                            <CardDescription>
                                                {interview.duration_minutes} minutes
                                            </CardDescription>
                                        </div>
                                        <div className={`
                      px-2 py-1 rounded-full text-xs font-medium
                      ${interview.status === 'completed' ? 'bg-green-100 text-green-800' : ''}
                      ${interview.status === 'scheduled' ? 'bg-blue-100 text-blue-800' : ''}
                      ${interview.status === 'cancelled' ? 'bg-red-100 text-red-800' : ''}
                    `}>
                                            {interview.status.charAt(0).toUpperCase() + interview.status.slice(1)}
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            <div>
                                                <p className="text-sm font-medium text-slate-600">Time</p>
                                                <p className="mt-1 text-sm">
                                                    {format(new Date(interview.scheduled_date), 'p')}
                                                </p>
                                            </div>
                                            {interview.feedback && (
                                                <div>
                                                    <p className="text-sm font-medium text-slate-600">Feedback</p>
                                                    <p className="mt-1 text-sm line-clamp-3">{interview.feedback}</p>
                                                </div>
                                            )}
                                            {interview.status === 'completed' && (
                                                <Button variant="outline" size="sm" className="w-full">
                                                    View Details
                                                </Button>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}