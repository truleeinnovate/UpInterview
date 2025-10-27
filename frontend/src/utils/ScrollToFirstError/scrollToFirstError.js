// Added by Ashok
// v1.0.1 - Ashok - Improved scroll centering logic for both page and containers

export function scrollToFirstError(newErrors, fieldRefs) {
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

  if (errorFields.length === 0) {
    window.scrollTo({ top: 0, behavior: "smooth" });
    return;
  }

  const { key, element } = errorFields[0];

  setTimeout(() => {
    try {
      // Detect the scrollable container (if any)
      const scrollableParent =
        element.closest(
          '[data-scrollable="true"], [data-overflow="scroll"], [data-overflow="auto"]'
        ) || window;

      if (scrollableParent && scrollableParent !== window) {
        const parentRect = scrollableParent.getBoundingClientRect();
        const elementRect = element.getBoundingClientRect();
        const scrollTop = scrollableParent.scrollTop;
        const targetScroll =
          scrollTop +
          (elementRect.top - parentRect.top) -
          parentRect.height / 2 +
          elementRect.height / 2;

        scrollableParent.scrollTo({ top: targetScroll, behavior: "smooth" });
      } else {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    } catch {
      // no-op
    }

    const originalBorderRadius = element.style.borderRadius;

    setTimeout(() => {
      try {
        if (typeof element.focus === "function") element.focus();

        const skipBorderFields = ["skills", "interviewerType", "questions"];

        if (!skipBorderFields.includes(key)) {
          element.classList.add("outline", "outline-2", "outline-red-500");
          element.style.borderRadius = "0.375rem";

          setTimeout(() => {
            element.classList.remove("outline", "outline-2", "outline-red-500");
            element.style.borderRadius = originalBorderRadius;
          }, 3000);
        }
      } catch {
        // silent fail
      }
    }, 200);
  }, 100);
}
