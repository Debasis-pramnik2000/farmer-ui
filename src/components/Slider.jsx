import React, { useEffect, useState } from "react";

const slides = [
  "/images/slide1.jpg",
  "/images/slide2.jpg",
  "/images/slide3.jpg",
];

function Slider() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="kb-slider">
      {slides.map((img, index) => (
        <div
          key={index}
          className={`kb-slide ${index === current ? "active" : ""}`}
        >
          <img src={img} alt={`slide-${index}`} />
        </div>
      ))}

      <div className="kb-dots">
        {slides.map((_, index) => (
          <span
            key={index}
            className={`kb-dot ${index === current ? "active" : ""}`}
            onClick={() => setCurrent(index)}
          ></span>
        ))}
      </div>
    </div>
  );
}

export default Slider;