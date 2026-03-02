import { useEffect } from "react";

export const useTitle = (title) => {
  useEffect(() => {
    const defaultTitle = "Upinterview";
    if (title) {
      document.title = `${title}`;
    } else {
      document.title = defaultTitle;
    }
  }, [title]);
};