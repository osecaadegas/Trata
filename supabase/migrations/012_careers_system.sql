-- =============================================
-- CAREERS / VACANCIES SYSTEM
-- Tables: jobs, job_applications
-- Storage: cv-uploads bucket
-- =============================================

-- Jobs table
CREATE TABLE IF NOT EXISTS jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  location TEXT NOT NULL DEFAULT 'Braga',
  description TEXT NOT NULL,
  requirements TEXT,
  benefits TEXT,
  type TEXT NOT NULL DEFAULT 'full-time', -- full-time, part-time, contract, internship
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Job applications table
CREATE TABLE IF NOT EXISTS job_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT,
  cv_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, reviewed, shortlisted, rejected
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_jobs_active ON jobs(is_active, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_job_applications_job ON job_applications(job_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_job_applications_status ON job_applications(status);

-- Updated_at trigger for jobs
CREATE OR REPLACE FUNCTION update_jobs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_jobs_updated_at ON jobs;
CREATE TRIGGER trigger_jobs_updated_at
  BEFORE UPDATE ON jobs
  FOR EACH ROW EXECUTE FUNCTION update_jobs_updated_at();

-- RLS Policies
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;

-- Jobs: everyone can read active jobs
CREATE POLICY "jobs_select_active" ON jobs
  FOR SELECT USING (is_active = true);

-- Jobs: admin can do everything
CREATE POLICY "jobs_admin_all" ON jobs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'configurador', 'configurator')
    )
  );

-- Applications: anyone can insert (public applications)
CREATE POLICY "applications_insert_public" ON job_applications
  FOR INSERT WITH CHECK (true);

-- Applications: admin can read all
CREATE POLICY "applications_admin_select" ON job_applications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'configurador', 'configurator')
    )
  );

-- Applications: admin can update status
CREATE POLICY "applications_admin_update" ON job_applications
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'configurador', 'configurator')
    )
  );

-- Applications: admin can delete
CREATE POLICY "applications_admin_delete" ON job_applications
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'configurador', 'configurator')
    )
  );

-- Storage bucket for CVs
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'cv-uploads',
  'cv-uploads',
  false,
  5242880, -- 5MB
  ARRAY['application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for cv-uploads
CREATE POLICY "cv_upload_public" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'cv-uploads');

CREATE POLICY "cv_read_admin" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'cv-uploads'
    AND EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'configurador', 'configurator')
    )
  );
