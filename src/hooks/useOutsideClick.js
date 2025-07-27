// hooks/useDropdownBehavior.js
import { useEffect, useState } from "react";

const useDropdownBehavior = (ref, isOpen, onClose) => {
  const [dropUp, setDropUp] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        onClose?.();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose, ref]);

  useEffect(() => {
    if (ref.current && isOpen) {
      const rect = ref.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const spaceBelow = windowHeight - rect.bottom;
      setDropUp(spaceBelow < 150); // agar pastda joy kam bo‘lsa
    }
  }, [isOpen, ref]);

  return dropUp;
};

export default useDropdownBehavior;
