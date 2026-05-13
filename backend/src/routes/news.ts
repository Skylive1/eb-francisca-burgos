import { Router } from 'express';
import { supabase } from '../db';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('news')
      .select('*')
      .order('id', { ascending: false });

    if (error) {
      console.error('Error obteniendo noticias:', error);
      return res.status(500).json({ error: 'No se pudo obtener las noticias' });
    }

    res.json(data);
  } catch (error) {
    console.error('Error obteniendo noticias:', error);
    res.status(500).json({ error: 'No se pudo obtener las noticias' });
  }
});

export default router;
