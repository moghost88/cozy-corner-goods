
import { useState, useEffect } from "react";
import { Review, mockReviews } from "@/data/reviews";
import StarRating from "./StarRating";
import ReviewForm from "./ReviewForm";
import { Separator } from "@/components/ui/separator";
import { User, ThumbsUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

interface ReviewListProps {
    productId: string;
}

const ReviewList = ({ productId }: ReviewListProps) => {
    const [reviews, setReviews] = useState<Review[]>([]);
    const { user } = useAuth();

    useEffect(() => {
        // In a real app, fetch from Supabase
        const productReviews = mockReviews.filter((r) => r.productId === productId);
        setReviews(productReviews);
    }, [productId]);

    const handleNewReview = (newReview: { rating: number; comment: string }) => {
        const review: Review = {
            id: Math.random().toString(36).substr(2, 9),
            productId,
            userId: user?.id || "guest",
            userName: user?.email?.split('@')[0] || "User", // Fallback display logic
            rating: newReview.rating,
            comment: newReview.comment,
            date: new Date().toISOString(),
            helpfulCount: 0,
        };
        setReviews((prev) => [review, ...prev]);
    };

    const averageRating = 
        reviews.length > 0
            ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
            : 0;

    return (
        <div className="space-y-8">
            {/* Summary Header */}
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                <div>
                    <h2 className="font-display text-2xl font-bold">Customer Reviews</h2>
                    <div className="mt-2 flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <StarRating rating={Math.round(averageRating)} readonly />
                            <span className="text-xl font-bold">{averageRating.toFixed(1)}</span>
                        </div>
                        <span className="text-muted-foreground">
                            Based on {reviews.length} reviews
                        </span>
                    </div>
                </div>
            </div>

            <div className="grid gap-8 lg:grid-cols-3">
                {/* Review Form */}
                <div className="lg:col-span-1">
                    <ReviewForm productId={productId} onReviewSubmit={handleNewReview} />
                </div>

                {/* Reviews List */}
                <div className="space-y-6 lg:col-span-2">
                    {reviews.length === 0 ? (
                        <div className="py-8 text-center text-muted-foreground">
                            No reviews yet. Be the first to share your thoughts!
                        </div>
                    ) : (
                        reviews.map((review) => (
                            <div
                                key={review.id}
                                className="rounded-xl border border-border bg-card p-6 transition-all hover:shadow-sm"
                            >
                                <div className="mb-4 flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary/10">
                                            {review.userAvatar ? (
                                                <img
                                                    src={review.userAvatar}
                                                    alt={review.userName}
                                                    className="h-full w-full rounded-full object-cover"
                                                />
                                            ) : (
                                                <User className="h-5 w-5 text-secondary" />
                                            )}
                                        </div>
                                        <div>
                                            <h4 className="font-semibold">{review.userName}</h4>
                                            <p className="text-xs text-muted-foreground">
                                                {new Date(review.date).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    <StarRating rating={review.rating} size="sm" readonly />
                                </div>

                                <p className="mb-4 text-muted-foreground">{review.comment}</p>

                                <div className="flex items-center gap-4">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="gap-2 text-muted-foreground hover:text-foreground"
                                    >
                                        <ThumbsUp className="h-3 w-3" />
                                        Helpful ({review.helpfulCount})
                                    </Button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default ReviewList;
