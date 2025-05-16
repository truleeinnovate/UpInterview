import { useState, useEffect } from "react";
import { Circle, Dot } from 'lucide-react';
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

  useEffect(() => {
    const interval = setInterval(nextSlide, time);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
    <div className="relative h-[calc(100vh-48px)] sm:h-[532px] w-full overflow-hidden bg-gradient-to-r from-pink-400 via-purple-500 to-blue-700">
      {/* Images */}
      {images.map((image, index) => (
        <div key={index} className={`absolute inset-0 flex items-center justify-center transition-opacity duration-1000 ${
          index === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0"
        }`}>
          <img src={image} alt="slide" className="w-full h-full" />
        </div>
      ))}

      <div className="absolute bottom-14 left-1/2 transform -translate-x-1/2 flex space-x-2 p-2 rounded-lg z-20">
        {images.map((_, index) => (
          <div key={index} className="text-white text-xl">
            {index === currentIndex ? <Dot /> : <Circle />}
          </div>
        ))}
      </div>
    </div>
    </>
  );
};

export default Slideshow;
