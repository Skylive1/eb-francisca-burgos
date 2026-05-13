CREATE TABLE IF NOT EXISTS news (
  id SERIAL PRIMARY KEY,
  image_key TEXT NOT NULL,
  category TEXT NOT NULL,
  date TEXT NOT NULL,
  title TEXT NOT NULL,
  "desc" TEXT NOT NULL,
  full_desc TEXT NOT NULL,
  is_featured BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS admissions (
  id SERIAL PRIMARY KEY,
  parent_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  student_name TEXT NOT NULL,
  grade TEXT NOT NULL,
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
