'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, FileText, Loader2, Upload, Clock } from 'lucide-react';
import Link from 'next/link';

interface DashboardStats {
  totalResumes: number;
  totalInterviews: number;
  upcomingInterviews: number;
  completedInterviews: number;
}

interface UpcomingInterview {
  id: string;
  scheduled_date: string;
  duration_minutes: number;
  resume_id: string | null;
}

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    totalResumes: 0,
    totalInterviews: 0,
    upcomingInterviews: 0,
    completedInterviews: 0,
  });
  const [upcomingInterviews, setUpcomingInterviews] = useState<UpcomingInterview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      const [resumesResponse, interviewsResponse, upcomingResponse] = await Promise.all([
        supabase.from('resumes').select('id', { count: 'exact' }),
        supabase.from('interviews').select('id, status', { count: 'exact' }),
        supabase
          .from('interviews')
          .select('id, scheduled_date, duration_minutes, resume_id')
          .eq('status', 'scheduled')
          .gte('scheduled_date', new Date().toISOString())
          .order('scheduled_date', { ascending: true })
          .limit(5),
      ]);

      const totalResumes = resumesResponse.count || 0;
      const interviews = interviewsResponse.data || [];
      const totalInterviews = interviewsResponse.count || 0;
      const upcomingInterviews = interviews.filter((i) => i.status === 'scheduled').length;
      const completedInterviews = interviews.filter((i) => i.status === 'completed').length;

      setStats({
        totalResumes,
        totalInterviews,
        upcomingInterviews,
        completedInterviews,
      });

      setUpcomingInterviews(upcomingResponse.data || []);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || !user) {
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
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Dashboard</h1>
          <p className="text-slate-600">Welcome back! Here's your interview overview</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Resumes</CardTitle>
                  <FileText className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalResumes}</div>
                  <p className="text-xs text-slate-500 mt-1">Uploaded resumes</p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Interviews</CardTitle>
                  <Calendar className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalInterviews}</div>
                  <p className="text-xs text-slate-500 mt-1">All time interviews</p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
                  <Clock className="h-4 w-4 text-orange-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.upcomingInterviews}</div>
                  <p className="text-xs text-slate-500 mt-1">Scheduled interviews</p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Completed</CardTitle>
                  <Calendar className="h-4 w-4 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.completedInterviews}</div>
                  <p className="text-xs text-slate-500 mt-1">Finished interviews</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Get started with your interview preparation</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Link href="/resume" className="block">
                    <Button className="w-full justify-start" variant="outline" size="lg">
                      <Upload className="w-5 h-5 mr-3" />
                      Upload Resume
                    </Button>
                  </Link>
                  <Link href="/schedule" className="block">
                    <Button className="w-full justify-start" size="lg">
                      <Calendar className="w-5 h-5 mr-3" />
                      Schedule Interview
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Upcoming Interviews</CardTitle>
                  <CardDescription>Your next scheduled sessions</CardDescription>
                </CardHeader>
                <CardContent>
                  {upcomingInterviews.length === 0 ? (
                    <div className="text-center py-8">
                      <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                      <p className="text-slate-500 text-sm">No upcoming interviews</p>
                      <Link href="/schedule">
                        <Button className="mt-3" size="sm">
                          Schedule One
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {upcomingInterviews.map((interview) => (
                        <div
                          key={interview.id}
                          className="p-3 border border-slate-200 rounded-lg hover:border-blue-300 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-slate-900">
                                {new Date(interview.scheduled_date).toLocaleDateString('en-US', {
                                  weekday: 'short',
                                  month: 'short',
                                  day: 'numeric',
                                })}
                              </p>
                              <p className="text-sm text-slate-600">
                                {new Date(interview.scheduled_date).toLocaleTimeString('en-US', {
                                  hour: 'numeric',
                                  minute: '2-digit',
                                })}{' '}
                                • {interview.duration_minutes} min
                              </p>
                            </div>
                            <Link href="/schedule">
                              <Button variant="ghost" size="sm">
                                View
                              </Button>
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
