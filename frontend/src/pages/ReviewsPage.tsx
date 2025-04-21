// ReviewsPage.tsx - The full reviews page component
import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { Star } from "lucide-react"; // Import Star icon from lucide-react

interface ReviewData {
  id: number;
  user_id: number;
  rating: number;
  comment: string;
  created_at: string;
  hostel_id: number;
}

interface HostelInfo {
  id: number;
  name: string;
  image: string;
  location: string;
  average_rating: number;
  total_reviews: number;
}

export const ReviewsPage = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const showWriteReview = searchParams.get("writeReview") === "true";

  const [reviews, setReviews] = useState<ReviewData[]>([]);
  const [hostelInfo, setHostelInfo] = useState<HostelInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showReviewForm, setShowReviewForm] = useState(showWriteReview);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [hoveredStar, setHoveredStar] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [filter, setFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL;

  const userId = localStorage.getItem("userid");
  console.log("reviews userid:", userId)
  const userLoggedIn = !!userId;

  useEffect(() => {
    const fetchHostelAndReviews = async () => {
      try {
        setLoading(true);
        // Fetch hostel info
        const hostelRes = await axios.get(`${API_URL}/api/hostels/${id}/info`);
        setHostelInfo(hostelRes.data);

        // Fetch reviews with filtering and sorting
        const reviewsRes = await axios.get(
          `${API_URL}/api/review/${id}/reviews?filter=${filter}&sort=${sortBy}&page=${page}&limit=10`
        );
        if (page === 1) {
          setReviews(reviewsRes.data.reviews);
        } else {
          setReviews((prev) => [...prev, ...reviewsRes.data.reviews]);
        }
        setHasMore(reviewsRes.data.has_more);
      } catch (error) {
        console.error("Error fetching hostel reviews:", error);
        setError("Failed to load reviews");
      } finally {
        setLoading(false);
      }
    };
    fetchHostelAndReviews();
  }, [id, filter, sortBy, page, API_URL]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userLoggedIn) {
      toast.error("Please log in to submit a review", {
        duration: 3000,
        position: "top-center",
      });
      return;
    }
    if (rating === 0) {
      toast.error("Please select a rating", {
        duration: 3000,
        position: "top-center",
      });
      return;
    }

    try {
      setSubmitting(true);
      await axios.post(`${API_URL}/api/review/${id}/reviews`, {
        user_id: userId,
        rating,
        comment,
      },
    {headers:{Authorization: `Bearer ${localStorage.getItem("token")}`}}
    );
      toast.success("Review submitted successfully", {
        duration: 3000,
        position: "top-center",
      });

      // Reset form and refresh reviews
      setRating(0);
      setComment("");
      setShowReviewForm(false);
      setPage(1); // Refresh reviews with first page
      const reviewsRes = await axios.get(
        `${API_URL}/api/review/${id}/reviews?filter=${filter}&sort=${sortBy}&page=1&limit=10`
      );
      setReviews(reviewsRes.data.reviews);
      setHasMore(reviewsRes.data.has_more);

      // Refresh hostel info to update average rating
      const hostelRes = await axios.get(`/api/hostels/${id}/info`);
      setHostelInfo(hostelRes.data);
    } catch (error) {
      console.error("Error submitting review:", error);
      toast.error("Failed to submit review", {
        duration: 3000,
        position: "top-center",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const loadMoreReviews = () => {
    if (!loading && hasMore) {
      setPage((prevPage) => prevPage + 1);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilter(e.target.value);
    setPage(1); // Reset to first page when filter changes
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(e.target.value);
    setPage(1); // Reset to first page when sort changes
  };

  if (loading && page === 1) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Back Button and Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate(`/hostels/${id}`)}
          className="flex items-center text-blue-600 hover:text-blue-800 mb-6"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-1"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
              clipRule="evenodd"
            />
          </svg>
          Back to Hostel Details
        </button>

        {hostelInfo && (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
            <div className="flex flex-col md:flex-row">
              <div className="md:w-1/3 h-48">
                <img
                  src={hostelInfo.image}
                  alt={hostelInfo.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6 md:w-2/3 flex flex-col justify-center">
                <h1 className="text-2xl font-bold text-gray-800 mb-2">
                  {hostelInfo.name}
                </h1>
                <div className="flex items-center mb-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-gray-600 mr-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  <span className="text-gray-600">{hostelInfo.location}</span>
                </div>
                <div className="flex items-center">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={20}
                        className={`${
                          i < Math.floor(hostelInfo.average_rating)
                            ? "text-yellow-400"
                            : i < hostelInfo.average_rating
                            ? "text-yellow-400 opacity-50"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="ml-2 text-lg font-semibold">
                    {typeof hostelInfo.average_rating == "number"?hostelInfo.average_rating.toFixed(1): "0.0"}
                  </span>
                  <span className="ml-2 text-gray-500">
                    ({hostelInfo.total_reviews} reviews)
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Write a Review Toggle */}
      {!showReviewForm ? (
        <div className="mb-8">
          <button
            onClick={() => setShowReviewForm(true)}
            className={`bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors inline-flex items-center ${
              !userLoggedIn ? "opacity-75 cursor-not-allowed" : ""
            }`}
            disabled={!userLoggedIn}
          >
            <Star size={20} className="mr-2" />
            Write a Review
          </button>
          {!userLoggedIn && (
            <p className="text-sm text-gray-500 mt-2">
              Please log in to write a review
            </p>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800">Write a Review</h2>
            <button
              onClick={() => setShowReviewForm(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <form onSubmit={handleSubmitReview}>
            <div className="mb-6">
              <label className="block text-gray-700 font-medium mb-3">
                Your Rating
              </label>
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className="focus:outline-none mr-1"
                    onMouseEnter={() => setHoveredStar(star)}
                    onMouseLeave={() => setHoveredStar(0)}
                    onClick={() => setRating(star)}
                  >
                    <Star
                      size={30}
                      className={`transition-colors ${
                        star <= (hoveredStar || rating)
                          ? "text-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  </button>
                ))}
                <span className="ml-3 text-gray-600">
                  {rating
                    ? ["", "Poor", "Fair", "Good", "Very Good", "Excellent"][rating]
                    : "Select a rating"}
                </span>
              </div>
            </div>
            <div className="mb-6">
              <label
                htmlFor="comment"
                className="block text-gray-700 font-medium mb-2"
              >
                Your Review
              </label>
              <textarea
                id="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[120px]"
                placeholder="Share your experience (optional)"
              ></textarea>
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setShowReviewForm(false)}
                className="px-6 py-2 border border-gray-300 rounded-lg mr-3 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg transition-colors flex items-center"
                disabled={submitting || rating === 0}
              >
                {submitting ? (
                  <>
                    <span className="animate-spin inline-block h-4 w-4 border-t-2 border-b-2 border-white rounded-full mr-2"></span>
                    Submitting...
                  </>
                ) : (
                  "Submit Review"
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Reviews Listing */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <h2 className="text-xl font-bold text-gray-800 mb-4 md:mb-0">
              All Reviews {hostelInfo && `(${hostelInfo.total_reviews})`}
            </h2>
            <div className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-4">
              <div className="flex items-center">
                <label htmlFor="filter" className="block text-sm text-gray-700 mr-2">
                  Filter:
                </label>
                <select
                  id="filter"
                  value={filter}
                  onChange={handleFilterChange}
                  className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Ratings</option>
                  <option value="5">5 Stars</option>
                  <option value="4">4 Stars</option>
                  <option value="3">3 Stars</option>
                  <option value="2">2 Stars</option>
                  <option value="1">1 Star</option>
                </select>
              </div>
              <div className="flex items-center">
                <label htmlFor="sort" className="block text-sm text-gray-700 mr-2">
                  Sort:
                </label>
                <select
                  id="sort"
                  value={sortBy}
                  onChange={handleSortChange}
                  className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="newest">Newest</option>
                  <option value="oldest">Oldest</option>
                  <option value="highest">Highest Rating</option>
                  <option value="lowest">Lowest Rating</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {error ? (
          <div className="p-6 text-center text-red-500">{error}</div>
        ) : reviews.length > 0 ? (
          <div>
            <div className="divide-y divide-gray-100">
              {reviews.map((review) => (
                <div key={review.id} className="p-6">
                  <div className="flex items-start mb-4">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-800">
                        {review.user_id}
                      </h4>
                      <div className="flex flex-wrap items-center mt-1">
                        <div className="flex mr-3">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={16}
                              className={`${
                                i < review.rating
                                  ? "text-yellow-400"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-gray-500">
                          {formatDate(review.created_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="ml-14">
                    <p className="text-gray-700">{review.comment}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Load More Button */}
            {hasMore && (
              <div className="p-6 text-center">
                <button
                  onClick={loadMoreReviews}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 font-medium"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="animate-spin inline-block h-4 w-4 border-t-2 border-b-2 border-gray-600 rounded-full mr-2"></span>
                      Loading More...
                    </>
                  ) : (
                    "Load More Reviews"
                  )}
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="p-6 text-center text-gray-500">
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
            <button
              onClick={() => setShowReviewForm(true)}
              className="inline-block mt-3 text-blue-600 hover:underline font-medium"
            >
              Be the first to write a review
            </button>
          </div>
        )}
      </div>
    </div>
  );
};