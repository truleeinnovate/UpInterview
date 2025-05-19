import { useState, useEffect } from "react";
import img1 from '../Dashboard-Part/Images/slideshow1.png';
import img2 from '../Dashboard-Part/Images/slideshow2.png';
import img3 from '../Dashboard-Part/Images/slideshow3.webp';

const images = [img1, img2, img3];

const Slideshow = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const time = 5000;

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  useEffect(() => {
    const interval = setInterval(nextSlide, time);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative h-[calc(100vh-48px)] sm:h-[532px] w-full overflow-hidden bg-gradient-to-r from-pink-400 via-purple-500 to-blue-700">
      {/* Images */}
      {images.map((image, index) => (
        <div
          key={index}
          className={`absolute inset-0 flex items-center justify-center transition-opacity duration-1000 ${index === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0"
            }`}
        >
          <img
            src={image}
            alt={`slide ${index + 1}`}
            className="w-full h-full object-cover"
          />
        </div>
      ))}

      {/* Circular Indicators with Animations */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-3 z-20 items-center">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className="focus:outline-none group relative"
          >
            {/* Inactive state (small circle) */}
            <div className={`w-2 h-2 rounded-full transition-all duration-300 ${index === currentIndex
                ? "opacity-0"
                : "bg-white/40 group-hover:bg-white/60"
              }`} />

            {/* Active state (animated circle) */}
            {index === currentIndex && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative">
                  {/* Outer pulse ring */}
                  <div className="absolute -inset-1.5 rounded-full bg-white/20 animate-ping" />
                  {/* Solid center circle */}
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