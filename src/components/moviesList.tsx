"use client";

import { useEffect, useState, useCallback } from "react";
import { useMovies } from "@/app/lib/hooks/useMovies";
import { useSearchMovies } from "@/app/lib/hooks/useSearchMovies";
import { useMovieRatings } from "@/app/lib/hooks/useMovieRatings";
import Link from "next/link";
import Pagination from "@/components/Pagination";
import SearchBar from "@/components/SearchBar";
import debounce from "lodash.debounce";
import { Star } from "lucide-react";

export default function MoviesList() {
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  const debounceQuery = useCallback(
    debounce((value: string) => {
      setDebouncedQuery(value);
      setPage(1);
    }, 500),
    []
  );

  useEffect(() => {
    debounceQuery(query);
  }, [query, debounceQuery]);

  const { data: moviesData, isLoading, error } = debouncedQuery
    ? useSearchMovies(debouncedQuery, page)
    : useMovies(page);

  const movieIds = moviesData?.results.map((movie: any) => movie.id) || [];
  const ratings = useMovieRatings(movieIds);

  return (
    <div className="bg-[#2d3250] min-h-screen text-white px-6 py-10">
      <SearchBar value={query} onChange={setQuery} />

      {isLoading && <p className="text-center mt-10 text-[#f9b17a]">Carregando filmes...</p>}
      {error && <p className="text-center text-red-500">Erro ao carregar filmes.</p>}
      {!isLoading && moviesData?.results?.length === 0 && (
        <p className="text-center mt-10 text-[#676f9d]">Nenhum filme encontrado.</p>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-8 mt-8">
        {moviesData?.results.map((movie: any, index: number) => {
          const rating = ratings[index];

          return (
            <Link href={`/movie/${movie.id}`} key={movie.id}>
              <div className="bg-[#424769] p-4 rounded-2xl shadow-xl hover:scale-[1.03] hover:shadow-2xl transition-all duration-200 cursor-pointer flex flex-col h-full">
                <img
                  src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                  alt={movie.title}
                  className="w-full h-96 object-cover rounded-xl"
                />
                <div className="mt-4 flex flex-col justify-between flex-grow">
                  <h3 className="font-semibold text-base text-white line-clamp-2">
                    {movie.title}
                  </h3>
                  <div className="text-[#f9b17a] text-sm mt-1 flex items-center gap-1">
                    <Star className="w-4 h-4 fill-[#f9b17a]" />
                    {rating !== undefined
                      ? rating?.toFixed(1)
                      : "Sem avaliação"}
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="mt-10">
        <Pagination
          currentPage={page}
          totalPages={moviesData?.total_pages || 1}
          onPageChange={setPage}
        />
      </div>
    </div>
  );
}
