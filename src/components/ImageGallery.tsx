'use client';

export default function ImageGallery() {
  const galleryImages = [
    "https://images.pexels.com/photos/941861/pexels-photo-941861.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/262978/pexels-photo-262978.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/67468/pexels-photo-67468.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/1267320/pexels-photo-1267320.jpeg?auto=compress&cs=tinysrgb&w=800"
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 h-150 md:h-200">
      <div className="col-span-2 row-span-2 relative rounded-[2.5rem] overflow-hidden shadow-premium group bg-stone-100">
        <img src={galleryImages[0]} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" alt="Interior" />
      </div>
      <div className="col-span-2 row-span-1 relative rounded-[2.5rem] overflow-hidden shadow-premium group bg-stone-100">
        <img src={galleryImages[1]} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" alt="Plating" />
      </div>
      <div className="col-span-1 row-span-1 relative rounded-[2.5rem] overflow-hidden shadow-premium group bg-stone-100">
        <img src={galleryImages[2]} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" alt="Chef" />
      </div>
      <div className="col-span-1 row-span-1 relative rounded-[2.5rem] overflow-hidden shadow-premium group bg-stone-100">
        <img src={galleryImages[3]} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" alt="Dining" />
      </div>
    </div>
  );
}