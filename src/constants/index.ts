import escudoLogo from '../escudo.png';
import directorCardImg from '../imagenes/director_card.png';
import hero1 from '../imagenes/hero-1.jpg';
import hero2 from '../imagenes/hero-2.jpg';
import hero3 from '../imagenes/hero-3.jpg';
import op1 from '../imagenes/oportunidad_1.png';
import op2 from '../imagenes/oportunidad_2.png';
import op3 from '../imagenes/oportunidad_3.png';
import op4 from '../imagenes/oportunidad_4.png';
import noticiaFeria from '../imagenes/noticias/feria_2026.jpg';
import noticiaPromo from '../imagenes/noticias/promo1.jpg';
import noticiaBeisbol from '../imagenes/noticias/beisbol.jpg';

export const LOGO_URL = escudoLogo;
export const DIRECTOR_CARD_IMG = directorCardImg;
export const HERO_IMAGES = [hero1, hero2, hero3];
export const OPPORTUNITY_IMAGES = [op1, op2, op3, op4];

export const NEWS_IMAGE_MAP: Record<string, string> = {
  promo1: noticiaPromo,
  beisbol: noticiaBeisbol,
  feria: noticiaFeria,
};

export interface NewsItem {
  id: number;
  image?: string;
  imageKey?: string;
  category: string;
  date: string;
  title: string;
  desc: string;
  fullDesc: string;
  isFeatured?: boolean;
  link_url?: string;
}

export const NEWS_DATA: NewsItem[] = [
  {
    id: 1,
    image: noticiaPromo,
    category: "Institucional",
    date: "19 MAR",
    title: "Presentación de la Promo 1",
    desc: "De una caja llena de amor emergió nuestra identidad: la franela en morado y blanco de la Promo 1.",
    fullDesc: "El 19 de marzo a las 5:00 p.m., el patio central de la U.E.P. Francisca Elena Burgos Delmoral se convirtió en escenario de pura magia.\n\nDe una caja llena de amor emergió nuestra identidad: la franela en morado y blanco de la Promo 1, Sección A. Este diseño nos identificará cada viernes, recordándonos que somos los pioneros de esta historia. Fue un momento inolvidable donde institución, alumnos, padres y representantes unieron esfuerzos para hacer este sueño realidad.\n\nHoy, esta vivencia queda escrita con letras de oro en la historia personal de cada graduando y guardada para siempre en sus corazones. 🎓✨",
    isFeatured: true
  },
  {
    id: 2,
    image: noticiaBeisbol,
    category: "Deportes",
    date: "23 MAR",
    title: "¡Venezuela Campeón Mundial!",
    desc: "Nos sentimos orgullosos de nuestra selección al otorgarnos el título de Campeones Mundiales 2026.",
    fullDesc: "En la UEP Francisca Elena Burgos Delmoral nos sentimos profundamente orgullosos de nuestra selección venezolana al otorgarnos el título de Campeones Mundiales en este 2026, marcando la historia del béisbol en Venezuela.\n\nQue Dios continúe bendiciendo a nuestra patria! 🇻🇪⚾"
  },
  {
    id: 3,
    image: noticiaFeria,
    category: "Eventos",
    date: "15 ABR",
    title: "Gran Feria de Ciencias 2026",
    desc: "Nuestros estudiantes demostraron su ingenio con proyectos científicos innovadores.",
    fullDesc: "La U.E.P. Francisca Elena Burgos D. se enorgullece en presentar los resultados de nuestra Feria de Ciencias 2026. Durante este evento, los estudiantes de todos los niveles presentaron experimentos y proyectos que abarcan desde energías renovables hasta robótica avanzada. Fue una jornada llena de descubrimiento, donde la curiosidad y el método científico fueron los protagonistas.",
  }
];
