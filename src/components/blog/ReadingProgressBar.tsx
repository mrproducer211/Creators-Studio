"use client";

import { useEffect, useState } from "react";

export default function ReadingProgressBar() {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const progress = (window.scrollY / totalHeight) * 100;
        setScrollProgress(progress);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className="fixed left-0 right-0 h-[3px] transition-all duration-75"
      style={{
        top: "56px", // Directly beneath the fixed Navbar
        width: `${scrollProgress}%`,
        background: "#C9A84C",
        zIndex: 9999, // Render on top of everything except maybe portals
      }}
    />
  );
}
