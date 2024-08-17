import { useEffect } from "react";

export const useViewportHeight = () => {
  useEffect(() => {
    const adjustViewportHeight = () => {
      let vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty("--vh", `${vh}px`);
    };

    window.addEventListener("resize", adjustViewportHeight);
    adjustViewportHeight();

    return () => window.removeEventListener("resize", adjustViewportHeight);
  }, []);
};
