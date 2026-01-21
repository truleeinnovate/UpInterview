// v1.0.0 - Ashok - adding padding 9 5o 12  for loading state button
// v1.0.1 - Ashok - Added responsiveness


import React from "react";

const LoadingButton = ({
  children,
  isLoading = false,
  loadingText = "Processing...",
  className = "",
  ...props
}) => {
  return (
    <button
      {...props}
      disabled={isLoading}
      // v1.0.0 <----------------------------------------------------------------------
      // v1.0.1 <---------------------------------------------------------------------------
      className={`
        relative
        h-9
        py-2
        bg-custom-blue hover:bg-custom-blue-dark
        text-white font-medium
        rounded-md
        transition-all duration-300 ease-in-out
        overflow-hidden
        flex items-center justify-center
        sm:text-sm md:text-sm
        ${isLoading ? "cursor-wait px-12" : "px-6"}
        ${className}
      `}
      // v1.0.0 ---------------------------------------------------------------------->
      // v1.0.1 --------------------------------------------------------------------------->
    >
      {/* Content container with transition */}
      <span
        className={`flex items-center justify-center transition-all duration-300 ${
          isLoading ? "opacity-0 -translate-y-2" : "opacity-100"
        }`}
      >
        {children}
      </span>

      {/* Loading state - positioned absolutely */}
      <span
        className={`absolute inset-0 flex items-center justify-center gap-2 transition-all duration-300 ${
          isLoading ? "opacity-100" : "opacity-0 translate-y-2"
        }`}
      >
        {/* Smooth spinning animation */}
        <svg
          className="animate-spin h-5 w-5 text-white"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
        <span>{loadingText}</span>
      </span>
    </button>
  );
};

export default LoadingButton;

// import React from "react";
// import { clsx } from "clsx";
// import { twMerge } from "tailwind-merge";
// import { buttonVariants } from "../Components/Buttons/Button";

// function cn(...inputs) {
//   return twMerge(clsx(inputs));
// }

// const LoadingButton = React.forwardRef(
//   (
//     {
//       children,
//       isLoading = false,
//       loadingText = "Processing...",
//       className,
//       variant,
//       size,
//       ...props
//     },
//     ref,
//   ) => {
//     return (
//       <button
//         ref={ref}
//         {...props}
//         disabled={isLoading || props.disabled}
//         className={cn(
//           buttonVariants({ variant, size }),
//           "relative overflow-hidden transition-all duration-300 ease-in-out",
//           "flex items-center justify-center gap-2",
//           isLoading && "cursor-wait",
//           className,
//         )}
//       >
//         {/* Normal Content */}
//         <span
//           className={cn(
//             "flex items-center gap-2 transition-all duration-300 ease-in-out",
//             isLoading
//               ? "opacity-0 -translate-y-2 scale-95"
//               : "opacity-100 translate-y-0 scale-100",
//           )}
//         >
//           {children}
//         </span>

//         {/* Loading Overlay */}
//         <span
//           className={cn(
//             "absolute inset-0 flex items-center justify-center gap-2 transition-all duration-300 ease-in-out",
//             isLoading
//               ? "opacity-100 translate-y-0"
//               : "opacity-0 translate-y-2 pointer-events-none",
//           )}
//         >
//           {/* Spinner */}
//           <svg
//             className="animate-spin h-4 w-4 text-current"
//             xmlns="http://www.w3.org/2000/svg"
//             fill="none"
//             viewBox="0 0 24 24"
//           >
//             <circle
//               className="opacity-25"
//               cx="12"
//               cy="12"
//               r="10"
//               stroke="currentColor"
//               strokeWidth="4"
//             />
//             <path
//               className="opacity-75"
//               fill="currentColor"
//               d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
//             />
//           </svg>

//           <span className="whitespace-nowrap">{loadingText}</span>
//         </span>
//       </button>
//     );
//   },
// );

// LoadingButton.displayName = "LoadingButton";

// export default LoadingButton;
