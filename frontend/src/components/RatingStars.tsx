import React, { useState } from 'react';
import { Star } from 'lucide-react';

interface RatingStarsProps {
  rating: number;
  maxStars?: number;
  interactive?: boolean;
  onChange?: (newRating: number) => void;
  size?: number;
}

export const RatingStars: React.FC<RatingStarsProps> = ({
  rating,
  maxStars = 5,
  interactive = false,
  onChange,
  size = 20,
}) => {
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const handleMouseEnter = (index: number) => {
    if (interactive) {
      setHoverRating(index);
    }
  };

  const handleMouseLeave = () => {
    if (interactive) {
      setHoverRating(null);
    }
  };

  const handleClick = (index: number) => {
    if (interactive && onChange) {
      onChange(index);
    }
  };

  return (
    <div className="stars-container">
      {Array.from({ length: maxStars }).map((_, index) => {
        const starIndex = index + 1;
        const isFilled = hoverRating !== null ? starIndex <= hoverRating : starIndex <= rating;

        return (
          <Star
            key={starIndex}
            size={size}
            className={`
              ${interactive ? 'star-interactive' : ''}
              ${isFilled ? 'star-filled' : 'star-empty'}
            `}
            onMouseEnter={() => handleMouseEnter(starIndex)}
            onMouseLeave={handleMouseLeave}
            onClick={() => handleClick(starIndex)}
          />
        );
      })}
    </div>
  );
};
export default RatingStars;
