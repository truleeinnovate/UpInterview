// v1.0.0 - Ashok - modified the Slideshow component to include image preloading and lazy loading for better performance
// v1.0.1 - Ashok - changed image files url from local to cloud storage

import { useState, useEffect } from "react";
// v1.0.0 <------------------------------------------------------------------------------------

// v1.0.1 <-------------------------------------------------------------------------------------
const images = [
  {
    src: "https://res.cloudinary.com/dnlrzixy8/image/upload/v1756100809/outsource_zsrvua.webp",
    alt: "Outsource",
  },
  {
    src: "https://res.cloudinary.com/dnlrzixy8/image/upload/v1756100805/assessment_hmpato.webp",
    alt: "Assessment",
  },
  {
    src: "https://res.cloudinary.com/dnlrzixy8/image/upload/v1756100807/internal_brjdws.webp",
    alt: "Internal",
  },
  {
    src: "https://res.cloudinary.com/dnlrzixy8/image/upload/v1756100808/mock_tbwgbe.webp",
    alt: "Mock Interview",
  },
  {
    src: "https://res.cloudinary.com/dnlrzixy8/image/upload/v1756100811/questionBank_kyvouj.webp",
    alt: "Question Bank",
  },
];
// v1.0.1 <------------------------------------------------------------------------------------->

const Slideshow = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const duration = 5000;

  // Preload images
  useEffect(() => {
    images.forEach(({ src }) => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  // Autoplay
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, duration);
    return () => clearInterval(interval);
  }, []);

  const goToSlide = (index) => setCurrentIndex(index);

  return (
    <div className="relative h-[calc(100vh-48px)] sm:h-[400px] w-full overflow-hidden bg-gradient-to-r from-pink-400 via-purple-500 to-blue-700">
      {/* Slides */}
      {images.map(({ src, alt }, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0"
          }`}
        >
          <img
            src={src}
            alt={alt}
            loading="lazy"
            className="w-full h-full object-cover"
          />
        </div>
      ))}

      {/* Slide Indicators */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-3 z-20">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className="focus:outline-none group relative"
          >
            {/* Inactive Circle */}
            <div
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? "opacity-0"
                  : "bg-white/40 group-hover:bg-white/60"
              }`}
            />
            {/* Active Circle Animation */}
            {index === currentIndex && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative">
                  <div className="absolute -inset-1.5 rounded-full bg-white/20 animate-ping" />
                  <div className="w-3 h-3 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
                </div>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Slideshow;
// v1.0.0 ------------------------------------------------------------------------------------>
