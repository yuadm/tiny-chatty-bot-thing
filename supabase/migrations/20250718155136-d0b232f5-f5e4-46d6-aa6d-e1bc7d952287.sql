-- Add consent field to job_applications table
ALTER TABLE public.job_applications 
ADD COLUMN consent JSONB;