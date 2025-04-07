"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import ReviewForm from "./ReviewForm";
import { Star } from "lucide-react";
import clsx from "clsx";
import { useSession } from "next-auth/react";

type MovieReviewsProps = {
  movieTmdbId: number;
  onReviewSubmitted?: () => void;
};

type Review = {
  id: string;
  comment: string;
  rating: number;
  user: {
    nome: string;
    email: string;
  };
};

export default function MovieReviews({ movieTmdbId, onReviewSubmitted }: MovieReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [average, setAverage] = useState<number | null>(null);
  const [expandedReviewIds, setExpandedReviewIds] = useState<Set<string>>(new Set());
  const { data: session, status } = useSession();

  const fetchReviews = async () => {
    const res = await axios.get(`/api/reviews?movieTmdbId=${movieTmdbId}`);
    setReviews(res.data);
  };

  const fetchAverage = async () => {
    const res = await axios.get(`/api/ratings?movieTmdbId=${movieTmdbId}`);
    setAverage(res.data.average);
  };

  const handleReviewSubmitted = async () => {
    await fetchReviews();
    await fetchAverage();
    if (onReviewSubmitted) onReviewSubmitted();
  };

  useEffect(() => {
    fetchReviews();
    fetchAverage();
  }, []);

  const toggleExpand = (id: string) => {
    setExpandedReviewIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  return (
    <div className="max-w-5xl mx-auto mt-10">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Nota dos usuários</h2>
        <div className="flex items-center gap-2 text-[#f9b17a] text-xl">
          <Star className="w-5 h-5 fill-[#f9b17a]" />
          {average !== null ? average : "Sem avaliações"}
        </div>
      </div>

      {status === "authenticated" && (
        <ReviewForm movieTmdbId={movieTmdbId} onReviewSubmitted={handleReviewSubmitted} />
      )}

      <div className="mt-10 space-y-4">
        {reviews.map((review) => {
          const isExpanded = expandedReviewIds.has(review.id);
          const isLong = review.comment.length > 300;

          return (
            <div key={review.id} className="bg-[#424769] p-4 rounded-lg shadow-md">
              <div className="flex items-center gap-2 text-[#f9b17a] mb-2">
                <Star className="w-4 h-4 fill-[#f9b17a]" />
                <span>{review.rating}</span>
                <span className="text-sm text-gray-300">por {review.user.nome}</span>
              </div>
              <p
                className={clsx(
                  "text-white break-words transition-all duration-300",
                  !isExpanded && isLong && "line-clamp-4"
                )}
              >
                {review.comment}
              </p>
              {isLong && (
                <button
                  onClick={() => toggleExpand(review.id)}
                  className="text-sm text-blue-300 hover:underline mt-2"
                >
                  {isExpanded ? "Ver menos" : "Ver mais"}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}