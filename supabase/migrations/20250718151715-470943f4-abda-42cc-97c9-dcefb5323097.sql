-- Create job positions table
CREATE TABLE public.job_positions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  department TEXT,
  location TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create job applications table
CREATE TABLE public.job_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  position_id UUID REFERENCES public.job_positions(id) ON DELETE CASCADE,
  personal_info JSONB NOT NULL,
  availability JSONB,
  employment_history JSONB,
  skills_experience JSONB,
  declarations JSONB,
  status TEXT NOT NULL DEFAULT 'new',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create application documents table
CREATE TABLE public.application_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id UUID REFERENCES public.job_applications(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.job_positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.application_documents ENABLE ROW LEVEL SECURITY;

-- Create policies for job_positions (public read, admin manage)
CREATE POLICY "Allow public read access to active job positions" 
ON public.job_positions FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage job positions" 
ON public.job_positions FOR ALL 
USING (is_admin_user()) 
WITH CHECK (is_admin_user());

-- Create policies for job_applications (public create, admin manage)
CREATE POLICY "Allow public insert access to job applications" 
ON public.job_applications FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Admins can manage job applications" 
ON public.job_applications FOR ALL 
USING (is_admin_user()) 
WITH CHECK (is_admin_user());

-- Create policies for application_documents (public create, admin manage)
CREATE POLICY "Allow public insert access to application documents" 
ON public.application_documents FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Admins can manage application documents" 
ON public.application_documents FOR ALL 
USING (is_admin_user()) 
WITH CHECK (is_admin_user());

-- Create triggers for updated_at timestamps
CREATE TRIGGER update_job_positions_updated_at
BEFORE UPDATE ON public.job_positions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_job_applications_updated_at
BEFORE UPDATE ON public.job_applications
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some sample job positions
INSERT INTO public.job_positions (title, description, department, location) VALUES
('Care Assistant', 'Providing personal care and support to residents', 'Care', 'London'),
('Senior Care Assistant', 'Leading care team and providing specialized care', 'Care', 'London'),
('Night Care Assistant', 'Providing overnight care and support', 'Care', 'London'),
('Healthcare Support Worker', 'Supporting healthcare professionals in care delivery', 'Healthcare', 'London');