-- Create profiles table for user data including credits
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  credits INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view their own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create analyses table
CREATE TABLE public.analyses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  property_id TEXT NOT NULL,
  lote_number TEXT,
  analysis_type TEXT NOT NULL CHECK (analysis_type IN ('links', 'upload')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Input data
  url_matricula TEXT,
  url_edital TEXT,
  link_pag TEXT,
  matricula_file_url TEXT,
  edital_file_url TEXT,
  
  -- Cost tracking
  credits_used INTEGER NOT NULL DEFAULT 1,
  
  -- Processing metadata
  webhook_response JSONB,
  error_message TEXT
);

-- Enable RLS on analyses
ALTER TABLE public.analyses ENABLE ROW LEVEL SECURITY;

-- Create policies for analyses
CREATE POLICY "Users can view their own analyses" 
ON public.analyses FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own analyses" 
ON public.analyses FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own analyses" 
ON public.analyses FOR UPDATE 
USING (auth.uid() = user_id);

-- Create analysis_results table for detailed results
CREATE TABLE public.analysis_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  analysis_id UUID NOT NULL REFERENCES public.analyses(id) ON DELETE CASCADE,
  
  -- Matricula data
  matricula_data JSONB,
  
  -- Edital data  
  edital_data JSONB,
  
  -- Financial analysis
  financial_data JSONB,
  
  -- Legal analysis
  juridico_data JSONB,
  
  -- Complete raw response
  raw_response JSONB,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  UNIQUE(analysis_id)
);

-- Enable RLS on analysis_results
ALTER TABLE public.analysis_results ENABLE ROW LEVEL SECURITY;

-- Create policies for analysis_results
CREATE POLICY "Users can view results of their own analyses" 
ON public.analysis_results FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.analyses 
  WHERE analyses.id = analysis_results.analysis_id 
  AND analyses.user_id = auth.uid()
));

CREATE POLICY "System can insert analysis results" 
ON public.analysis_results FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM public.analyses 
  WHERE analyses.id = analysis_results.analysis_id 
  AND analyses.user_id = auth.uid()
));

-- Create function to update updated_at column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_analyses_updated_at
  BEFORE UPDATE ON public.analyses
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, email, credits)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.email,
    5  -- Start with 5 free credits
  );
  RETURN NEW;
END;
$$;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create indexes for better performance
CREATE INDEX idx_analyses_user_id ON public.analyses(user_id);
CREATE INDEX idx_analyses_created_at ON public.analyses(created_at DESC);
CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX idx_analysis_results_analysis_id ON public.analysis_results(analysis_id);