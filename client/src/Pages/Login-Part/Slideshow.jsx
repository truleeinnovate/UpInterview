import React, { useState, useEffect } from "react";
import { FaCircle, FaDotCircle } from "react-icons/fa";

const images = [
  "https://images.unsplash.com/photo-1518640027989-a30d5d7e498e?ixlib=rb-0.3.5&q=85&fm=jpg&crop=entropy&cs=srgb&ixid=eyJhcHBfaWQiOjE0NTg5fQ&s=f9575732a498c98486879d7000ab1d47",
  "https://images.unsplash.com/photo-1505843378597-b96befae716e?ixlib=rb-0.3.5&q=85&fm=jpg&crop=entropy&cs=srgb&ixid=eyJhcHBfaWQiOjE0NTg5fQ&s=9e69634f39ec7c08514fef902cfc85ac",
  "https://images.unsplash.com/photo-1471138406156-7a89e687a062?ixlib=rb-0.3.5&q=85&fm=jpg&crop=entropy&cs=srgb&ixid=eyJhcHBfaWQiOjE0NTg5fQ&s=7820fc816715b37942a793360b785c60",
];

const Slideshow = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const time = 5000; // Auto slideshow interval

  // Function to move to the next slide
  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  // Function to move to the previous slide
  const prevSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex <= 0 ? images.length - 1 : prevIndex - 1
    );
  };

  // Auto slide
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
