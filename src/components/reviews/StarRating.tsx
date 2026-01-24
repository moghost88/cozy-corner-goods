
import { Star } from "lucide-react";

interface StarRatingProps {
    rating: number;
    maxRating?: number;
    onRatingChange?: (rating: number) => void;
    readonly?: boolean;
    size?: "sm" | "md" | "lg";
}

const StarRating = ({
    rating,
    maxRating = 5,
    onRatingChange,
    readonly = false,
    size = "md",
}: StarRatingProps) => {
    const sizeClasses = {
        sm: "h-3 w-3",
        md: "h-5 w-5",
        lg: "h-8 w-8",
    };

    return (
        <div className="flex gap-1">
            {[...Array(maxRating)].map((_, index) => {
                const starValue = index + 1;
                const isFilled = starValue <= rating;

                return (
                    <button
                        key={index}
                        type="button"
                        disabled={readonly}
                        onClick={() => onRatingChange?.(starValue)}
                        className={`${readonly ? "cursor-default" : "cursor-pointer hover:scale-110"} transition-transform`}
                    >
                        <Star
                            className={`${sizeClasses[size]} ${isFilled ? "fill-accent text-accent" : "text-muted-foreground/30"
                                }`}
                        />
                    </button>
                );
            })}
        </div>
    );
};

export default StarRating;
