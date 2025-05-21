import { useEffect, useState } from "react";

const AnimatedCounter = ({ targetValue, duration = 2000, format }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTimestamp = null;
    const start = 0;
    // Chuyển targetValue thành số, bỏ định dạng nếu có
    const end =
      typeof targetValue === "string"
        ? parseFloat(targetValue.replace(/[^0-9.]/g, ""))
        : parseFloat(targetValue);

    if (isNaN(end)) return; // Tránh lỗi nếu end không hợp lệ

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // Làm tròn giá trị để tránh số thập phân lung tung
      const currentValue = Math.round(progress * (end - start) + start);

      setCount(currentValue);

      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };

    window.requestAnimationFrame(step);
  }, [targetValue, duration]);

  // Dùng format nếu có, nếu không thì toLocaleString
  const formattedCount = format ? format(count) : count.toLocaleString();

  return <span>{formattedCount}</span>;
};

export default AnimatedCounter;