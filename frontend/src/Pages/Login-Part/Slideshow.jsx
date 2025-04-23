import React, { useState, useEffect } from "react";
import { FaCircle, FaDotCircle } from "react-icons/fa";
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
    <div className="relative h-[532px] bg-gradient-to-r from-pink-400 via-purple-500 to-blue-700 overflow-hidden">
      {/* Left Arrow */}
      {/* <div
        className="absolute top-1/2 left-4 text-3xl text-white opacity-50 hover:opacity-100 cursor-pointer z-10"
        onClick={prevSlide}
      >
        <FaChevronCircleLeft />
      </div> */}

      {/* Images */}
      {images.map((image, index) => (
        <img
          key={index}
          src={image}
          alt="slide"
          className={`absolute top-0 left-0 w-full h-[532px] object-cover transition-opacity duration-1000 ${
            index === currentIndex ? "opacity-100 z-0" : "opacity-0"
          }`}
        />
      ))}

      {/* Right Arrow */}
      {/* <div
        className="absolute top-1/2 right-4 text-3xl text-white opacity-50 hover:opacity-100 cursor-pointer z-10"
        onClick={nextSlide}
      >
        <FaChevronCircleRight />
      </div> */}

      {/* Dots */}
      <div className="absolute bottom-28 left-1/2 transform -translate-x-1/2 flex space-x-2 p-2 rounded-lg z-20">
        {images.map((_, index) => (
          <div key={index} className="text-white text-xl">
            {index === currentIndex ? <FaDotCircle /> : <FaCircle />}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Slideshow;
