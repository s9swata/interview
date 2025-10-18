'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, FileText, Video, Activity, Award, BookOpen, Users, Search, Loader2, Clock, Upload } from 'lucide-react';
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

export default function Dashboard() {
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

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Welcome back{user?.email ? `, ${user.email.split('@')[0]}` : ''}</h1>
          <p className="mt-2 text-slate-600">Prepare for your next interview with Evalve</p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <Card className="hover:shadow-lg transition-all cursor-pointer">
            <CardHeader className="flex flex-row items-center space-y-0 gap-4">
              <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                <Video className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-lg">Start Interview</CardTitle>
                <CardDescription>Begin a new mock interview session</CardDescription>
              </div>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-all cursor-pointer">
            <CardHeader className="flex flex-row items-center space-y-0 gap-4">
              <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                <Calendar className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <CardTitle className="text-lg">Schedule Interview</CardTitle>
                <CardDescription>Book a future interview slot</CardDescription>
              </div>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-all cursor-pointer">
            <CardHeader className="flex flex-row items-center space-y-0 gap-4">
              <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
                <FileText className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <CardTitle className="text-lg">Upload Resume</CardTitle>
                <CardDescription>Update your resume for review</CardDescription>
              </div>
            </CardHeader>
          </Card>
        </div>

        {/* Interview Categories */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-slate-900 mb-6">Interview Categories</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <Card className="hover:shadow-lg transition-all cursor-pointer">
              <CardContent className="pt-6">
                <div className="w-12 h-12 rounded-lg bg-amber-100 flex items-center justify-center mb-4">
                  <BookOpen className="h-6 w-6 text-amber-600" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Technical Skills</h3>
                <p className="text-sm text-slate-600">Data Structures, Algorithms, System Design</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all cursor-pointer">
              <CardContent className="pt-6">
                <div className="w-12 h-12 rounded-lg bg-rose-100 flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-rose-600" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Behavioral</h3>
                <p className="text-sm text-slate-600">Leadership, Teamwork, Problem-solving</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all cursor-pointer">
              <CardContent className="pt-6">
                <div className="w-12 h-12 rounded-lg bg-indigo-100 flex items-center justify-center mb-4">
                  <Search className="h-6 w-6 text-indigo-600" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Role-specific</h3>
                <p className="text-sm text-slate-600">Frontend, Backend, Full Stack, DevOps</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all cursor-pointer">
              <CardContent className="pt-6">
                <div className="w-12 h-12 rounded-lg bg-teal-100 flex items-center justify-center mb-4">
                  <Award className="h-6 w-6 text-teal-600" />
                </div>
                <h3 className="font-semibold text-lg mb-2">System Design</h3>
                <p className="text-sm text-slate-600">Architecture, Scalability, Best practices</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Statistics */}
        <div>
          <h2 className="text-2xl font-semibold text-slate-900 mb-6">Your Progress</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <Activity className="h-8 w-8 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium text-slate-600">Interviews Completed</p>
                    <h4 className="text-2xl font-bold text-slate-900">12</h4>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <Award className="h-8 w-8 text-green-600" />
                  <div>
                    <p className="text-sm font-medium text-slate-600">Average Score</p>
                    <h4 className="text-2xl font-bold text-slate-900">85%</h4>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <BookOpen className="h-8 w-8 text-purple-600" />
                  <div>
                    <p className="text-sm font-medium text-slate-600">Topics Covered</p>
                    <h4 className="text-2xl font-bold text-slate-900">8</h4>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <Calendar className="h-8 w-8 text-amber-600" />
                  <div>
                    <p className="text-sm font-medium text-slate-600">Next Interview</p>
                    <h4 className="text-2xl font-bold text-slate-900">Today</h4>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
