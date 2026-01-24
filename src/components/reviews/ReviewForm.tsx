
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import StarRating from "./StarRating";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

interface ReviewFormProps {
    productId: string;
    onReviewSubmit: (review: { rating: number; comment: string }) => void;
}

const ReviewForm = ({ productId, onReviewSubmit }: ReviewFormProps) => {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const { user } = useAuth();
    const { toast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (rating === 0) {
            toast({
                title: "Rating required",
                description: "Please select a star rating",
                variant: "destructive",
            });
            return;
        }
        if (comment.length < 10) {
            toast({
                title: "Review too short",
                description: "Please write at least 10 characters",
                variant: "destructive",
            });
            return;
        }

        setSubmitting(true);
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));

        onReviewSubmit({ rating, comment });
        setSubmitting(false);
        setRating(0);
        setComment("");

        toast({
            title: "Review submitted",
            description: "Thank you for your feedback!",
        });
    };

    if (!user) {
        return (
            <div className="rounded-xl border border-border bg-muted/30 p-6 text-center">
                <h3 className="mb-2 font-medium">Please sign in to write a review</h3>
                <p className="text-sm text-muted-foreground">
                    Only logged in customers can leave feedback.
                </p>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-border bg-card p-6">
            <h3 className="font-display text-lg font-semibold">Write a Review</h3>

            <div className="space-y-2">
                <label className="text-sm font-medium">Rating</label>
                <StarRating rating={rating} onRatingChange={setRating} size="lg" />
            </div>

            <div className="space-y-2">
                <label htmlFor="comment" className="text-sm font-medium">
                    Your Review
                </label>
                <Textarea
                    id="comment"
                    placeholder="What did you like or dislike?"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="min-h-[100px]"
                    required
                />
            </div>

            <Button type="submit" variant="gradient" disabled={submitting}>
                {submitting ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Posting...
                    </>
                ) : (
                    "Post Review"
                )}
            </Button>
        </form>
    );
};

export default ReviewForm;
