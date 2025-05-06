import { useState, useEffect } from "react";
import { Circle, Dot, ChevronLeft, ChevronRight } from 'lucide-react';
import img1 from '../Dashboard-Part/Images/slideshow1.png';
import img2 from '../Dashboard-Part/Images/slideshow2.png';
import img3 from '../Dashboard-Part/Images/slideshow3.png';

const images = [img1, img2, img3];

const Slideshow = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const time = 5000;

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  // const prevSlide = () => {
  //   setCurrentIndex((prevIndex) =>
  //     prevIndex <= 0 ? images.length - 1 : prevIndex - 1
  //   );
  // };

  useEffect(() => {
    const interval = setInterval(nextSlide, time);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
    <div className="relative sm:h-[532px] md:h-screen lg:h-screen xl:h-screen 2xl:h-screen 3xl:h-screen w-full overflow-hidden bg-gradient-to-r from-pink-400 via-purple-500 to-blue-700">
      {/* Left Arrow */}
      {/* <div
        className="absolute top-1/2 left-4 text-3xl text-white opacity-50 hover:opacity-100 cursor-pointer z-10"
        onClick={prevSlide}
      >
        <ChevronLeft />
      </div> */}

      {/* Images */}
      {images.map((image, index) => (
        <div key={index} className={`absolute inset-0 flex items-center justify-center transition-opacity duration-1000 ${
          index === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0"
        }`}>
          <img src={image} alt="slide" className="w-full h-full" />
        </div>
      ))}

      {/* Right Arrow */}
      {/* <div
        className="absolute top-1/2 right-4 text-3xl text-white opacity-50 hover:opacity-100 cursor-pointer z-10"
        onClick={nextSlide}
      >
        <ChevronRight />
      </div> */}

      {/* Dots */}
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
