import { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const ReviewForm = ({ gigId, revieweeId, onSubmitted }) => {
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      alert("Please select a rating");
      return;
    }

    setSubmitting(true);
    try {
      await axios.post('/api/reviews', {
        gigId,
        reviewerId: user.uid,
        revieweeId,
        rating,
        comment
      });
      onSubmitted();
    } catch (error) {
      console.error("Error submitting review:", error);
      alert(error.response?.data?.message || "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-gray-50 p-4 rounded-md mt-3 border border-gray-200">
      <p className="text-sm font-medium text-gray-700 mb-2">Rate your experience</p>
      <div className="flex gap-1 mb-3">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            className={`text-2xl ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
          >
            ★
          </button>
        ))}
      </div>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Optional comment..."
        className="w-full p-2 border border-gray-300 rounded-md text-sm"
        rows="2"
      />
      <button
        onClick={handleSubmit}
        disabled={submitting}
        className="mt-2 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
      >
        {submitting ? 'Submitting...' : 'Submit Review'}
      </button>
    </div>
  );
};

export default ReviewForm;