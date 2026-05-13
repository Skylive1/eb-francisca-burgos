import { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase } from './lib/supabase';
import { sendAdmissionEmail } from './lib/email';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { parentName, email, phone, studentName, grade, message } = req.body;

  if (!parentName || !email || !phone || !studentName || !grade) {
    return res.status(400).json({ error: 'Faltan campos obligatorios en el formulario.' });
  }

  try {
    const { data, error } = await supabase
      .from('admissions')
      .insert({
        parent_name: parentName,
        email,
        phone,
        student_name: studentName,
        grade,
        message: message || null
      })
      .select();

    if (error) {
      console.error('Error guardando admisión:', error);
      return res.status(500).json({ error: 'No se pudo guardar la admisión.' });
    }

    // Enviar correo de notificación
    await sendAdmissionEmail(data[0]);

    res.status(201).json({ admission: data[0] });
  } catch (error) {
    console.error('Error guardando admisión:', error);
    res.status(500).json({ error: 'No se pudo guardar la admisión.' });
  }
}
