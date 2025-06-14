import { useEffect, useState } from "react";

const AnimatedCounter = ({ targetValue, duration = 2000, format }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTimestamp = null;
    const start = 0;
    const end =
      typeof targetValue === "string"
        ? parseFloat(targetValue.replace(/[^0-9.]/g, "")) *
          (targetValue.includes("B")
            ? 1_000_000_000
            : targetValue.includes("M")
              ? 1_000_000
              : 1)
        : parseFloat(targetValue);

    if (isNaN(end)) return;

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const currentValue =
        end < 10000 ? Math.round(progress * end) : progress * end;
      setCount(currentValue);

      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        setCount(end);
      }
    };

    setCount(0);
    const animationId = window.requestAnimationFrame(step);

    return () => {
      window.cancelAnimationFrame(animationId);
    };
  }, [targetValue, duration]);

  const formattedCount = format
    ? format(count)
    : Math.round(count).toLocaleString();

  return <span>{formattedCount}</span>;
};

export default AnimatedCounter;
