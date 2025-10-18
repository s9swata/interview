'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { BrainCircuit, Calendar, FileText, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      <nav className="border-b bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <BrainCircuit className="w-8 h-8 text-blue-600" />
              <span className="font-bold text-xl text-slate-900">AI Interview Platform</span>
            </div>
            <Link href="/login">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center p-2 bg-blue-100 rounded-full mb-6">
            <Sparkles className="w-6 h-6 text-blue-600" />
          </div>
          <h1 className="text-5xl font-bold text-slate-900 mb-6">
            Ace Your Next Interview with
            <span className="text-blue-600"> AI-Powered Practice</span>
          </h1>
          <p className="text-xl text-slate-600 mb-8 max-w-3xl mx-auto">
            Upload your resume, schedule mock interviews, and get instant feedback from our advanced AI interviewer. Practice anytime, anywhere.
          </p>
          <Link href="/login">
            <Button size="lg" className="text-lg px-8 py-6">
              Start Practicing Now
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20">
          <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition-shadow border border-slate-200">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-3">Upload Your Resume</h3>
            <p className="text-slate-600">
              Securely upload your resume and let our AI analyze your background to create tailored interview questions.
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition-shadow border border-slate-200">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <Calendar className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-3">Schedule Interviews</h3>
            <p className="text-slate-600">
              Pick a time that works for you. Schedule unlimited practice sessions at your convenience.
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition-shadow border border-slate-200">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <BrainCircuit className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-3">AI-Powered Sessions</h3>
            <p className="text-slate-600">
              Experience realistic interview scenarios powered by advanced AI technology to help you improve.
            </p>
          </div>
        </div>

        <div className="mt-20 text-center">
          <p className="text-slate-600 mb-4">Ready to transform your interview skills?</p>
          <Link href="/login">
            <Button variant="outline" size="lg">
              Create Your Free Account
            </Button>
          </Link>
        </div>
      </div>

      <footer className="border-t bg-white mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-center text-slate-500 text-sm">
            © 2025 AI Interview Platform. Prepare smarter, interview better.
          </p>
        </div>
      </footer>
    </div>
  );
}
