-- =========================================================================
-- TABLAS PARA ENTREGAS DE ALUMNOS (TAREAS Y CUESTIONARIOS)
-- =========================================================================

-- 1. Tabla para Entregas de Tareas (Archivos)
CREATE TABLE IF NOT EXISTS public.task_submissions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    file_url TEXT NOT NULL,
    file_name TEXT,
    status TEXT DEFAULT 'entregado',
    score INTEGER,
    feedback TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(task_id, student_id) -- Asegura que el estudiante solo tenga una entrega activa por tarea
);

-- 2. Tabla para Intentos de Cuestionarios
CREATE TABLE IF NOT EXISTS public.quiz_attempts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    quiz_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    score INTEGER NOT NULL,
    correct_answers INTEGER NOT NULL,
    answers_data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(quiz_id, student_id) -- Asegura que el estudiante solo haga el examen una vez
);

-- Habilitar RLS (Seguridad)
ALTER TABLE public.task_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;

-- Políticas para task_submissions
-- Los estudiantes pueden ver sus propias entregas
CREATE POLICY "Estudiantes pueden ver sus propias entregas" 
    ON public.task_submissions FOR SELECT 
    USING (auth.uid() = student_id);

-- Los profesores pueden ver todas las entregas (asumiendo que confías en el acceso de la UI, o puedes vincularlo a sus clases)
CREATE POLICY "Profesores pueden ver todas las entregas" 
    ON public.task_submissions FOR SELECT 
    USING (EXISTS (
        SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('profesor', 'admin', 'institucion')
    ));

-- Los estudiantes pueden insertar/actualizar sus propias entregas
CREATE POLICY "Estudiantes pueden subir entregas" 
    ON public.task_submissions FOR INSERT 
    WITH CHECK (auth.uid() = student_id);
    
CREATE POLICY "Estudiantes pueden actualizar sus entregas" 
    ON public.task_submissions FOR UPDATE 
    USING (auth.uid() = student_id);

-- Políticas para quiz_attempts
CREATE POLICY "Estudiantes pueden ver sus propios intentos" 
    ON public.quiz_attempts FOR SELECT 
    USING (auth.uid() = student_id);

CREATE POLICY "Profesores pueden ver intentos de cuestionarios" 
    ON public.quiz_attempts FOR SELECT 
    USING (EXISTS (
        SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('profesor', 'admin', 'institucion')
    ));

CREATE POLICY "Estudiantes pueden guardar sus intentos" 
    ON public.quiz_attempts FOR INSERT 
    WITH CHECK (auth.uid() = student_id);

-- =========================================================================
-- CONFIGURACIÓN DE STORAGE (BUCKET)
-- =========================================================================
-- IMPORTANTE: Debes ejecutar esto o crear el bucket manualmente en la interfaz de Supabase

INSERT INTO storage.buckets (id, name, public) 
VALUES ('task-submissions', 'task-submissions', true)
ON CONFLICT (id) DO NOTHING;

-- Políticas de Storage para el bucket task-submissions
CREATE POLICY "Estudiantes pueden subir archivos a task-submissions" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'task-submissions' AND auth.uid() = owner);

CREATE POLICY "Todos pueden ver los archivos en task-submissions" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'task-submissions');
