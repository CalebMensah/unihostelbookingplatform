// ReviewsSummarySection.tsx - Component for the reviews summary on the hostel details page
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { Star } from "lucide-react"; // Import Star from lucide-react

interface ReviewSummary {
  average_rating: number;
  total_reviews: number;
  rating_breakdown: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
  recent_reviews: Review[];
}

interface Review {
  id: number;
  rating: number;
  comment: string;
  created_at: string;
  user_id: string;
}

interface ReviewsSummarySectionProps {
  hostelId: number;
}

export const ReviewsSummarySection = ({ hostelId }: ReviewsSummarySectionProps) => {
  const [reviewSummary, setReviewSummary] = useState<ReviewSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchReviewSummary = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`/api/review/${hostelId}/reviews/summary`);
        setReviewSummary(res.data);
        console.log("response data:", res.data)
      } catch (error) {
        console.error("Error fetching review summary:", error);
        setError("Failed to load reviews");
      } finally {
        setLoading(false);
      }
    };
    fetchReviewSummary();
  }, [hostelId]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <div className="text-center text-red-500">{error}</div>
      </div>
    );
  }

  if (!reviewSummary) {
    return null;
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (!reviewSummary) {
    return null; // Ensure reviewSummary is defined before proceeding
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800 flex items-center">
          <Star size={20} className="mr-2 text-blue-500" />
          Guest Reviews
        </h2>
        <Link
          to={`/hostels/${hostelId}/reviews`}
          className="text-blue-600 hover:text-blue-800 font-medium flex items-center"
        >
          View All Reviews
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 ml-1"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
              clipRule="evenodd"
            />
          </svg>
        </Link>
      </div>
  
      {/* Average Rating and Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="md:col-span-1 bg-gray-50 p-6 rounded-lg flex flex-col items-center justify-center">
          <div className="text-4xl font-bold text-gray-800 mb-2">
            {reviewSummary.average_rating.toFixed(1)}
          </div>
          <div className="flex items-center mb-2">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={20}
                className={`${
                  i < Math.floor(reviewSummary.average_rating)
                    ? "text-yellow-400"
                    : i < reviewSummary.average_rating
                    ? "text-yellow-400 opacity-50"
                    : "text-gray-300"
                }`}
              />
            ))}
          </div>
          <div className="text-gray-500 text-sm">
            Based on {reviewSummary.total_reviews} reviews
          </div>
        </div>
        <div className="md:col-span-2">
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((rating) => {
              const percentage =
                reviewSummary.total_reviews > 0
                  ? ((reviewSummary.rating_breakdown[rating as keyof typeof reviewSummary.rating_breakdown] || 0) /
                      reviewSummary.total_reviews) *
                    100
                  : 0;
              return (
                <div key={rating} className="flex items-center">
                  <div className="w-10 text-sm text-gray-600 font-medium">
                    {rating}
                    <Star size={16} className="ml-0.5 inline text-yellow-400" />
                  </div>
                  <div className="flex-1 ml-2">
                    <div className="h-2 rounded-full bg-gray-200">
                      <div
                        className="h-2 rounded-full bg-yellow-400"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="w-12 text-right text-sm text-gray-500">
                    {percentage.toFixed(0)}%
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
  
      {/* Recent Reviews */}
      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Reviews</h3>
        {reviewSummary.recent_reviews?.length > 0 ? (
          <div className="space-y-6">
            {reviewSummary.recent_reviews.map((review) => (
              <div
                key={review.id}
                className="border-b border-gray-100 pb-6 last:border-0"
              >
                <div className="flex items-center mb-2">
                  <div>
                    <h4 className="font-medium text-gray-800">{review.user_id}</h4>
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={16}
                          className={`${
                            i < review.rating ? "text-yellow-400" : "text-gray-300"
                          }`}
                        />
                      ))}
                      <span className="text-xs text-gray-500 ml-2">
                        {formatDate(review.created_at)}
                      </span>
                    </div>
                  </div>
                </div>
                <p className="text-gray-600 text-sm">{review.comment}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 mx-auto mb-3 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
              />
            </svg>
            <p>No reviews yet</p>
            <Link
              to={`/hostels/${hostelId}/reviews?writeReview=true`}
              className="inline-block mt-3 text-blue-600 hover:underline font-medium"
            >
              Be the first to write a review
            </Link>
          </div>
        )}
      </div>
  
      {/* Write a Review Button */}
      <div className="mt-6 text-center">
        <Link
          to={`/hostels/${hostelId}/reviews?writeReview=true`}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors inline-flex items-center"
        >
          <Star size={20} className="mr-2" />
          Write a Review
        </Link>
      </div>
    </div>
  );
};