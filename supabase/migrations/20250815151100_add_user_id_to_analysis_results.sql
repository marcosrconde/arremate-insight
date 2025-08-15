-- Add user_id to analysis_results
ALTER TABLE public.analysis_results
ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Update RLS policy for analysis_results
DROP POLICY "System can insert analysis results" ON public.analysis_results;

CREATE POLICY "Users can insert their own analysis results"
ON public.analysis_results FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create index for user_id
CREATE INDEX idx_analysis_results_user_id ON public.analysis_results(user_id);
