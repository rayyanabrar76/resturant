'use client';

import { motion } from 'framer-motion';
import { Quote } from 'lucide-react';
import { useLocale } from 'next-intl';

const REVIEWS = [
  {
    quote: "The Oak-Smoked Shawarma isn't just food; it's a memory of the Levant captured on a plate.",
    author: "Elena Rossi",
    title: "Culinary Critic, The Urban Plate",
    img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=400"
  },
  {
    quote: "Selten habe ich ein Shawarma gegessen, das so viel Seele trägt. Ein Erlebnis, das man nicht vergisst.",
    author: "Klaus Bremer",
    title: "Gastrokritiker, Der Feinschmecker",
    img: "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=400"
  },
  {
    quote: "شاورما الخشب المدخّن تجربة لا تُنسى — كأن بلاد الشام تحضر إليك في كل لقمة.",
    author: "نور الحسيني",
    title: "ناقدة طهي، مجلة زهرة الخليج",
    img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=400"
  },
  {
    quote: "A masterclass in texture. Their Hummus achieves a silkiness I haven't found outside of Beirut.",
    author: "Marcello V.",
    title: "Private Events Director",
    img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400"
  },
  {
    quote: "Der Hummus hier ist eine Offenbarung — cremig, tief und mit einer Frische, die man selten findet.",
    author: "Lena Hartmann",
    title: "Food-Bloggerin, Berliner Teller",
    img: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?q=80&w=400"
  },
  {
    quote: "الحمص هنا يعيد تعريف الكلمة — ناعم، عميق، وبنكهة تأخذك إلى بيروت فوراً.",
    author: "كريم منصور",
    title: "مدير فعاليات راقية، دبي",
    img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400"
  },
  {
    quote: "The atmosphere hums with an understated elegance that perfectly mirrors the complexity of the spices.",
    author: "Julian Thorne",
    title: "Lifestyle Editor, Vogue",
    img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400"
  },
  {
    quote: "Eine Küche, die Tradition und Moderne so mühelos verbindet, verdient höchste Anerkennung.",
    author: "Stefan Vogel",
    title: "Chefredakteur, Taste Berlin",
    img: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?q=80&w=400"
  },
  {
    quote: "أجواء تجمع بين الأصالة والرقي بشكل لم أشهده في أي مطعم عربي خارج المنطقة.",
    author: "ليلى الراشد",
    title: "كاتبة أسلوب حياة، هاربرز عربية",
    img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400"
  },
  {
    quote: "An uncompromising dedication to heritage. Every bite feels like a secret passed down through generations.",
    author: "Sarah Al-Fayed",
    title: "Food Historian",
    img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400"
  },
  {
    quote: "Chef Aboud bringt die Wärme des Levants direkt nach Berlin. Jedes Gericht ist ein kleines Kunstwerk.",
    author: "Thomas Keller",
    title: "Kulinarischer Botschafter",
    img: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=400"
  },
  {
    quote: "كل طبق يحكي قصة موروثة بأمانة — هذا ليس مجرد طعام، هذا إرث حقيقي.",
    author: "سامي العمري",
    title: "مؤرخ طهي وكاتب",
    img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400"
  },
  {
    quote: "The pomegranate-glazed lamb is a revelation; a perfect tension between tart fruit and rich, melting fat.",
    author: "David Chang-Wei",
    title: "Executive Chef, Orizon",
    img: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=400"
  },
  {
    quote: "Das langsam gegrillte Lamm schmilzt auf der Zunge — jede Zutat erzählt eine Geschichte.",
    author: "Miriam Schulz",
    title: "Restaurantkritikerin, Berliner Morgenpost",
    img: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=400"
  },
  {
    quote: "لحم الضأن المزجج بالرمان توازن رائع بين الحموضة والعمق — لقمة لا تنتهي بسهولة.",
    author: "دانة الفهد",
    title: "رئيسة طهاة، مطعم أوريزون",
    img: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=400"
  },
  {
    quote: "Rarely does a restaurant manage to feel both like a neighborhood secret and a global destination.",
    author: "Amara Okoro",
    title: "Travel & Leisure",
    img: "https://images.unsplash.com/photo-1531123897727-8f129e16fd3c?q=80&w=400"
  },
  {
    quote: "Authentizität auf höchstem Niveau. Hier schmeckt man, dass hinter jedem Gericht echte Leidenschaft steckt.",
    author: "Sabine Müller",
    title: "Lifestyle-Redakteurin, Vogue DE",
    img: "https://images.unsplash.com/photo-1531123897727-8f129e16fd3c?q=80&w=400"
  },
  {
    quote: "مطعم يجعلك تشعر أنك اكتشفت سراً دفيناً في قلب برلين — لن تغادر دون أن تعود.",
    author: "رنا طاهر",
    title: "Travel & Leisure العربية",
    img: "https://images.unsplash.com/photo-1531123897727-8f129e16fd3c?q=80&w=400"
  },
];

const DUAL = [...REVIEWS, ...REVIEWS];

export default function EditorialReviews() {
  const locale = useLocale();
  const isRTL = locale === 'ar';

  return (
    <section className="bg-[#0c0803] py-24 overflow-hidden border-y border-[#c17f3b]/10">
      <div className="max-w-7xl mx-auto px-6 mb-12">
        <h2 className="font-serif text-[#c17f3b] text-xs uppercase tracking-[0.4em] opacity-70">
          Selected Press
        </h2>
      </div>

      <div className="flex" dir={isRTL ? 'rtl' : 'ltr'}>
        <motion.div
          className="flex gap-12 pr-12"
        animate={{ x: isRTL ? ['0%', '50%'] : ['0%', '-50%'] }}
          transition={{ duration: 90, ease: 'linear', repeat: Infinity }}
          style={{ display: 'flex' }}
        >
          {DUAL.map((rev, idx) => (
            <div
              key={idx}
              className="w-100 md:w-125 shrink-0 flex flex-col items-start text-left"
            >
              <Quote className="text-[#c17f3b]/20 mb-6" size={48} />

              <blockquote className="font-serif text-[#f7f2eb] text-2xl lg:text-3xl italic leading-relaxed mb-8">
                "{rev.quote}"
              </blockquote>

              <div className="flex items-center gap-4 mt-auto">
                <div className="w-12 h-12 rounded-full p-0.5 border border-[#c17f3b] shrink-0">
                  <img
                    src={rev.img}
                    className="w-full h-full object-cover rounded-full grayscale hover:grayscale-0 transition-all duration-500"
                    alt={rev.author}
                  />
                </div>
                <div>
                  <h4 className="font-sans text-[10px] font-bold uppercase tracking-[0.2em] text-[#c17f3b]">
                    {rev.author}
                  </h4>
                  <p className="font-serif text-[#f7f2eb]/40 text-sm italic">
                    {rev.title}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}