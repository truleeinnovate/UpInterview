// v1.0.0 - Ashok - modified the Slideshow component to include image preloading and lazy loading for better performance

import { useState, useEffect } from "react";
// v1.0.0 <------------------------------------------------------------------------------------

// import img1 from '../Dashboard-Part/Images/outsource.webp';
// import img2 from '../Dashboard-Part/Images/assessment.webp';
// import img3 from '../Dashboard-Part/Images/internal.webp';
// import img4 from '../Dashboard-Part/Images/mock.webp';
// import img5 from '../Dashboard-Part/Images/questionBank.webp';

import img1 from "../../assets/images/outsource.webp";
import img2 from "../../assets/images/assessment.webp";
import img3 from "../../assets/images/internal.webp";
import img4 from "../../assets/images/mock.webp";
import img5 from "../../assets/images/questionBank.webp";

// const images = [img1, img2, img3, img4, img5];

// const Slideshow = () => {
//   const [currentIndex, setCurrentIndex] = useState(0);
//   const time = 5000;

//   const nextSlide = () => {
//     setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
//   };

//   const goToSlide = (index) => {
//     setCurrentIndex(index);
//   };

//   useEffect(() => {
//     const interval = setInterval(nextSlide, time);
//     return () => clearInterval(interval);
//   }, []);

//   return (
//     <div className="relative h-[calc(100vh-48px)] sm:h-[400px] w-full overflow-hidden bg-gradient-to-r from-pink-400 via-purple-500 to-blue-700">
//       {/* Images */}
//       {images.map((image, index) => (
//         <div
//           key={index}
//           className={`absolute inset-0 flex items-center justify-center transition-opacity duration-1000 ${index === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0"
//             }`}
//         >
//           <img
//             src={image}
//             alt={`slide ${index + 1}`}
//             className="w-full h-full object-cover"
//           />
//         </div>
//       ))}

//       {/* Circular Indicators with Animations */}
//       <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-3 z-20 items-center">
//         {images.map((_, index) => (
//           <button
//             key={index}
//             onClick={() => goToSlide(index)}
//             className="focus:outline-none group relative"
//           >
//             {/* Inactive state (small circle) */}
//             <div className={`w-2 h-2 rounded-full transition-all duration-300 ${index === currentIndex
//                 ? "opacity-0"
//                 : "bg-white/40 group-hover:bg-white/60"
//               }`} />

//             {/* Active state (animated circle) */}
//             {index === currentIndex && (
//               <div className="absolute inset-0 flex items-center justify-center">
//                 <div className="relative">
//                   {/* Outer pulse ring */}
//                   <div className="absolute -inset-1.5 rounded-full bg-white/20 animate-ping" />
//                   {/* Solid center circle */}
//                   <div className="w-3 h-3 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
//                 </div>
//               </div>
//             )}
//           </button>
//         ))}
//       </div>

//     </div>
//   );
// };

// export default Slideshow;

const images = [
  { src: img1, alt: "Outsource" },
  { src: img2, alt: "Assessment" },
  { src: img3, alt: "Internal" },
  { src: img4, alt: "Mock Interview" },
  { src: img5, alt: "Question Bank" },
];

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
