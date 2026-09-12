import { useState } from "react";
import { Star, X, Check } from "lucide-react";
import { trpc } from "@/lib/trpc";

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ReviewModal({ isOpen, onClose }: ReviewModalProps) {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [author, setAuthor] = useState("");
  const [content, setContent] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const utils = trpc.useContext();

  const createReview = trpc.reviews.create.useMutation({
    onSuccess: () => {
      setSubmitted(true);
      setErrorMessage("");
      // Refresh list to update admin/frontend instantly
      utils.reviews.list.invalidate();

      setTimeout(() => {
        setSubmitted(false);
        onClose();
        setAuthor("");
        setContent("");
        setRating(5);
      }, 1800);
    },
    onError: (err) => {
      console.error("Submission Error:", err);
      setErrorMessage(err.message || "Failed to submit review. Try again!");
    },
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!author.trim() || !content.trim()) {
      setErrorMessage("Please fill out all fields.");
      return;
    }

    createReview.mutate({
      name: author,
      quote: content,
      rating: rating,
    });
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-heading">
          <div>
            <span className="admin-kicker">Feedback</span>
            <h2>Write a Review</h2>
          </div>
          <button className="icon-button" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {submitted ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-green-100 text-green-700 rounded-full flex items-center justify-center mx-auto mb-3">
              <Check size={24} />
            </div>
            <h3 className="text-xl font-bold">Thank You!</h3>
            <p className="text-sm text-gray-600 mt-1">
              Your review has been submitted successfully!
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMessage && (
              <div className="p-3 bg-red-100 border border-red-300 text-red-700 text-sm rounded">
                {errorMessage}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-1">Your Rating</label>
              <div className="flex gap-1 text-amber-500 cursor-pointer">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 focus:outline-none"
                  >
                    <Star
                      size={24}
                      fill={(hoverRating || rating) >= star ? "currentColor" : "none"}
                    />
                  </button>
                ))}
              </div>
            </div>

            <label className="block">
              Your Name
              <input
                type="text"
                required
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="e.g. Rahul Sharma"
                className="w-full mt-1 p-2 border rounded"
              />
            </label>

            <label className="block">
              Your Experience
              <textarea
                required
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Tell us what you loved about The Rasoi..."
                rows={4}
                className="w-full mt-1 p-2 border rounded"
              />
            </label>

            <div className="modal-actions pt-2">
              <button
                type="button"
                className="button button-outline"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="button button-burgundy"
                disabled={createReview.isPending}
              >
                {createReview.isPending ? "Submitting..." : "Submit Review"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}