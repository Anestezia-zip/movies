import { useState, useEffect } from "react";
import { FaArrowLeftLong } from "react-icons/fa6";
import { Link, useParams } from "react-router-dom";

const API_BASE_URL = "https://api.themoviedb.org/3";
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const API_OPTIONS = {
  method: "GET",
  headers: {
    accept: "application/json",
    Authorization: `Bearer ${API_KEY}`,
  },
};

const MovieDetail = () => {
  const { id: movieId } = useParams();
  const [movie, setMovie] = useState(null);

  const [trailerKey, setTrailerKey] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!movieId) {
      setErrorMessage("Invalid movie ID.");
      setIsLoading(false);
      return;
    }

    const fetchMovie = async () => {
      try {
        // Запрос данных о фильме
        const response = await fetch(
          `${API_BASE_URL}/movie/${movieId}?language=en-US`,
          API_OPTIONS
        );
        if (!response.ok) throw new Error("Movie not found");
        const data = await response.json();
        setMovie(data);

        // Запрос трейлеров
        const videosResponse = await fetch(
          `${API_BASE_URL}/movie/${movieId}/videos?language=en-US`,
          API_OPTIONS
        );
        const videosData = await videosResponse.json();

        // Найти первый трейлер (если есть)
        const trailer = videosData.results.find(
          (video) => video.type === "Trailer" && video.site === "YouTube"
        );
        if (trailer) {
          setTrailerKey(trailer.key);
        }
      } catch (error) {
        setErrorMessage("Failed to fetch movie details.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchMovie();
  }, [movieId]);

  if (isLoading) return <p className="text-white">Loading...</p>;
  if (errorMessage) return <p className="text-red-500">{errorMessage}</p>;
  if (!movie) return null;

  const formattedDate = new Date(movie.release_date).toLocaleDateString(
    "en-US",
    {
      month: "long",
      day: "numeric",
      year: "numeric",
    }
  );

  return (
    <div className="p-8 px-5">
      <div className="p-6 text-[#a3b2de] rounded-2xl shadow-[0_0_15px_5px_rgba(133,195,231,0.4)]">
        <Link to={'/'}>
          <button className="flex items-center gap-2 bg-[#3b486d] text-yellow-50 p-4 py-0.5 rounded mx-auto cursor-pointer">
            <FaArrowLeftLong />
            <span>Home</span>
          </button>
        </Link>
        <div className="flex max-md:flex-col justify-between items-baseline">
          <h1 className="text-4xl md:text-5xl 2xl:text-6xl mb-6 max-md:mb-4 font-bold">
            {movie.title}
          </h1>
          <div className="flex gap-2">
            <span className="text-lg font-semibold flex items-center bg-[#221F3D]/80 max-md:mb-2 p-2 px-3 pr-4 rounded">
              <span>⭐</span>
              <span>
                <span className="text-white">
                  {movie.vote_average.toFixed(2)}
                </span>
                <span>/10 ({movie.vote_count})</span>
              </span>
            </span>
            <span className="flex items-center gap-2 font-semibold bg-[#221F3D]/80 p-2 px-3 rounded max-md:hidden">
              <img src="../icons.png" alt="Icon" />
              <span>1</span>
            </span>
          </div>
        </div>

        <p className="text-[#d8e2ff] text-xl pl-1 flex items-center gap-5">
          <span>{movie.release_date?.slice(0, 4)}</span>
          <span className="w-1 h-1 bg-amber-100 rounded-full" />
          {!movie.adult && <span>PG-13</span>}
          <span className="w-1 h-1 bg-amber-100 rounded-full" />
          <span>{movie.runtime} min</span>
        </p>

        <div className="flex max-md:flex-col gap-4 mt-4 max-h-[500px] max-md:max-h-full">
          <figure>
            <img
              src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
              alt={movie.title}
              className="rounded-lg object-fit w-full max-h-[500px] "
            />
          </figure>
          <div className="relative w-full max-w-[870px]">
            {trailerKey ? (
              <iframe
                className="rounded-lg w-full h-full "
                src={`https://www.youtube.com/embed/${trailerKey}`}
                title={`${movie.title} Trailer`}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            ) : (
              <img
                src={`https://image.tmdb.org/t/p/w500${movie.backdrop_path}`}
                alt={`${movie.title} Trailer`}
                className="rounded-lg"
              />
            )}
          </div>
        </div>

        <table className="movie-detail-table">
          <tbody>
            <tr>
              <th>Genres</th>
              <td>
                <ul className="flex gap-3 max-md:flex-wrap">
                  {movie.genres.map((genre, i) => (
                    <li
                      key={i}
                      className="bg-[#221F3D]/80 p-1 px-3 rounded text-white font-normal"
                    >
                      {genre.name}
                    </li>
                  ))}
                </ul>
              </td>
            </tr>
            <tr>
              <th>Overview</th>
              <td className="text-white font-normal">{movie.overview}</td>
            </tr>
            <tr>
              <th>Release date</th>
              <td>{formattedDate} (Worldwide)</td>
            </tr>
            <tr>
              <th>Countries</th>
              <td>
                {movie.production_countries
                  .map((country) => country.iso_3166_1)
                  .join(" \u00A0\u00A0•\u00A0\u00A0 ")}
              </td>
            </tr>
            <tr>
              <th>Status</th>
              <td>{movie.status}</td>
            </tr>
            <tr>
              <th>Languages</th>
              <td>
                {movie.spoken_languages.map(
                  (lg) =>
                    lg.iso_639_1.charAt(0).toUpperCase() + lg.iso_639_1.slice(1)
                )}
              </td>
            </tr>
            <tr>
              <th>Budget</th>
              <td>${movie.budget.toLocaleString()}</td>
            </tr>
            <tr>
              <th>Revenue</th>
              <td>${movie.revenue.toLocaleString()}</td>
            </tr>
            <tr>
              <th>Tagline</th>
              <td>{movie.tagline}</td>
            </tr>
            <tr>
              <th>Production companies</th>
              <td>
                {movie.production_companies
                  .map((company) => company.name)
                  .join(" \u00A0\u00A0•\u00A0\u00A0 ")}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MovieDetail;
