/*
  # AI Interview Platform Database Schema

  ## Overview
  Creates the core tables for an AI interview platform where users can upload resumes
  and schedule interviews.

  ## New Tables
  
  ### `resumes`
  - `id` (uuid, primary key) - Unique identifier for each resume
  - `user_id` (uuid, foreign key) - References auth.users, the owner of the resume
  - `file_name` (text) - Original name of the uploaded resume file
  - `file_url` (text) - Storage URL or path to the resume file
  - `file_size` (integer) - Size of the file in bytes
  - `uploaded_at` (timestamptz) - Timestamp when the resume was uploaded
  - `updated_at` (timestamptz) - Timestamp when the resume was last updated
  
  ### `interviews`
  - `id` (uuid, primary key) - Unique identifier for each interview
  - `user_id` (uuid, foreign key) - References auth.users, the user scheduling the interview
  - `resume_id` (uuid, foreign key) - References resumes, the resume to be used for the interview
  - `scheduled_date` (timestamptz) - When the interview is scheduled
  - `duration_minutes` (integer) - Expected duration of the interview in minutes
  - `status` (text) - Status: 'scheduled', 'completed', 'cancelled'
  - `notes` (text) - Optional notes about the interview
  - `created_at` (timestamptz) - When the interview was created
  - `updated_at` (timestamptz) - When the interview was last updated

  ## Security
  - Enable RLS on both tables
  - Users can only access their own resumes and interviews
  - Policies for SELECT, INSERT, UPDATE, DELETE operations
*/

-- Create resumes table
CREATE TABLE IF NOT EXISTS resumes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  file_name text NOT NULL,
  file_url text NOT NULL,
  file_size integer DEFAULT 0,
  uploaded_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create interviews table
CREATE TABLE IF NOT EXISTS interviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  resume_id uuid REFERENCES resumes(id) ON DELETE SET NULL,
  scheduled_date timestamptz NOT NULL,
  duration_minutes integer DEFAULT 60,
  status text DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled')),
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE interviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies for resumes table
CREATE POLICY "Users can view own resumes"
  ON resumes FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own resumes"
  ON resumes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own resumes"
  ON resumes FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own resumes"
  ON resumes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for interviews table
CREATE POLICY "Users can view own interviews"
  ON interviews FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own interviews"
  ON interviews FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own interviews"
  ON interviews FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own interviews"
  ON interviews FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_resumes_user_id ON resumes(user_id);
CREATE INDEX IF NOT EXISTS idx_interviews_user_id ON interviews(user_id);
CREATE INDEX IF NOT EXISTS idx_interviews_resume_id ON interviews(resume_id);
CREATE INDEX IF NOT EXISTS idx_interviews_scheduled_date ON interviews(scheduled_date);