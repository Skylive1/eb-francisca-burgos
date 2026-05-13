import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';

/**
 * Hook para gestionar la gamificación (XP, Niveles y Medallas).
 * SINCRONIZADO CON SUPABASE para ranking real entre estudiantes.
 * Curva de dificultad exponencial: Nivel 2 = 200, Nivel 3 = 400, etc.
 */
export const useGamification = () => {
  const [xp, setXp] = useState(() => {
    const saved = localStorage.getItem('febd_xp');
    return saved ? parseInt(saved) : 0;
  });

  const [medals, setMedals] = useState(() => {
    const saved = localStorage.getItem('febd_medals');
    return saved ? JSON.parse(saved) : [];
  });

  const [userId, setUserId] = useState(null);

  // Cargar XP real desde Supabase al montar
  useEffect(() => {
    const loadFromDB = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;
      
      setUserId(session.user.id);

      const { data: profile } = await supabase
        .from('profiles')
        .select('xp')
        .eq('id', session.user.id)
        .single();

      if (profile && profile.xp !== null && profile.xp !== undefined) {
        // Si el XP de la DB es mayor que el local, usar el de la DB
        const localXp = parseInt(localStorage.getItem('febd_xp') || '0');
        const dbXp = profile.xp || 0;
        const finalXp = Math.max(localXp, dbXp);
        setXp(finalXp);
        localStorage.setItem('febd_xp', finalXp.toString());
        
        // Sincronizar el mayor de vuelta a la DB
        if (finalXp > dbXp) {
          await supabase
            .from('profiles')
            .update({ xp: finalXp, level: getLevelInfo(finalXp).level })
            .eq('id', session.user.id);
        }
      }
    };

    loadFromDB();
  }, []);

  // Persistencia local
  useEffect(() => {
    localStorage.setItem('febd_xp', xp.toString());
  }, [xp]);

  useEffect(() => {
    localStorage.setItem('febd_medals', JSON.stringify(medals));
  }, [medals]);

  /**
   * Cálculo de niveles con curva pronunciada.
   * Nivel 1: 0-100
   * Nivel 2: 101-300 (+200)
   * Nivel 3: 301-700 (+400)
   * Nivel 4: 701-1500 (+800)
   */
  const getLevelInfo = (currentXp) => {
    let level = 1;
    let nextThreshold = 100;
    let accumulated = 0;

    while (currentXp >= accumulated + nextThreshold) {
      accumulated += nextThreshold;
      level++;
      nextThreshold *= 2; // Curva exponencial
    }

    const xpInLevel = currentXp - accumulated;
    const progress = (xpInLevel / nextThreshold) * 100;

    return { 
      level, 
      xpInLevel, 
      nextThreshold, 
      progress,
      totalXp: currentXp
    };
  };

  const addXp = useCallback(async (amount) => {
    const oldLevel = getLevelInfo(xp).level;
    const newXp = xp + amount;
    setXp(newXp);
    
    const newLevel = getLevelInfo(newXp).level;

    // Guardar en Supabase
    if (userId) {
      await supabase
        .from('profiles')
        .update({ xp: newXp, level: newLevel })
        .eq('id', userId);
    }
    
    if (newLevel > oldLevel) {
      return { leveledUp: true, newLevel };
    }
    return { leveledUp: false };
  }, [xp, userId]);

  const addMedal = (medalId, title) => {
    if (!medals.find(m => m.id === medalId)) {
      setMedals([...medals, { id: medalId, title, date: new Date().toISOString() }]);
      return true;
    }
    return false;
  };

  return {
    xp,
    medals,
    info: getLevelInfo(xp),
    addXp,
    addMedal
  };
};
