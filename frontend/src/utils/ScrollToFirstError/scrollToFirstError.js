// // Added by Ashok
// // Safe scroll to first error without throwing or logging if inputs are invalid
export function scrollToFirstError(newErrors, fieldRefs) {
  // Silently exit if no errors or field references
  if (
    !newErrors ||
    typeof newErrors !== "object" ||
    Object.keys(newErrors).length === 0 ||
    !fieldRefs ||
    typeof fieldRefs !== "object"
  ) {
    return;
  }

  const errorFields = Object.keys(newErrors)
    .filter((key) => fieldRefs[key]?.current)
    .map((key) => {
      const el = fieldRefs[key].current;
      return {
        key,
        element: el,
        top: el.getBoundingClientRect().top + window.scrollY,
      };
    })
    .sort((a, b) => a.top - b.top);

  if (errorFields.length > 0) {
    const { key, element } = errorFields[0];

    // Allow DOM updates (error messages, layout) before we scroll
    setTimeout(() => {
      try {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
      } catch {
        // no-op
      }

      const originalBorderRadius = element.style.borderRadius;

      // Focus and optional outline after we initiate scroll
      setTimeout(() => {
        try {
          if (typeof element.focus === "function") element.focus();

          // Add field keys here to skip red border (keep minimal to show outline for most fields)
          const skipBorderFields = ["skills", "interviewerType", "questions"]; // do not skip 'skill' or 'tenantListId' so they get red outline

          if (!skipBorderFields.includes(key)) {
            element.classList.add("outline", "outline-2", "outline-red-500");
            element.style.borderRadius = "0.375rem";

            setTimeout(() => {
              element.classList.remove("outline", "outline-2", "outline-red-500");
              element.style.borderRadius = originalBorderRadius;
            }, 3000);
          }
        } catch {
          // Completely silent if anything fails
        }
      }, 200);
    }, 100);
  } else {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}


// Added by Ashok
// Safe scroll to first error without throwing or logging if inputs are invalid
// export function scrollToFirstError(newErrors, fieldRefs) {
//   if (
//     !newErrors ||
//     typeof newErrors !== "object" ||
//     Object.keys(newErrors).length === 0 ||
//     !fieldRefs ||
//     typeof fieldRefs !== "object"
//   ) {
//     return;
//   }

//   const errorFields = Object.keys(newErrors)
//     .filter((key) => fieldRefs[key]?.current)
//     .map((key) => {
//       const el = fieldRefs[key].current;
//       return {
//         key,
//         element: el,
//         top: el.getBoundingClientRect().top + window.scrollY,
//       };
//     })
//     .sort((a, b) => a.top - b.top);

//   if (errorFields.length > 0) {
//     const { key, element } = errorFields[0];

//     element.scrollIntoView({ behavior: "smooth", block: "center" });

//     const originalBorderRadius = element.style.borderRadius;

//     setTimeout(() => {
//       try {
//         if (typeof element.focus === "function") element.focus();

//         // If we want to skip the border for custom drop downs add the value in this array below
//         const skipBorderFields = ["skills", "interviewerType", "questions"];

//         if (skipBorderFields.includes(key)) {
//           // Add font weight temporarily
//           element.classList.add("font-semibold");
//           setTimeout(() => {
//             element.classList.remove("font-semibold");
//           }, 3000);
//         } else {
//           element.classList.add("outline", "outline-2", "outline-red-500");
//           element.style.borderRadius = "0.375rem";

//           setTimeout(() => {
//             element.classList.remove("outline", "outline-2", "outline-red-500");
//             element.style.borderRadius = originalBorderRadius;
//           }, 3000);
//         }
//       } catch {
//         // Completely silent if anything fails
//       }
//     }, 400);
//   } else {
//     window.scrollTo({ top: 0, behavior: "smooth" });
//   }
// }
