import { useEffect, useState } from "react";
import Search from "./components/Search";
import MovieCard from "./components/MovieCard";
import Spinner from "./components/Spinner";
import { useDebounce } from "react-use";
import { getTrendingMovies, updateSearchCount } from "./appwrite";

const API_BASE_URL = "https://api.themoviedb.org/3";

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const API_OPTIONS = {
  method: "GET",
  headers: {
    accept: "application/json",
    Authorization: `Bearer ${API_KEY}`,
  },
};

const App = () => {
  const [movieList, setMovieList] = useState([]);
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncesSearchTerm, setDebouncesSearchTerm] = useState("");
  // Debounce the search term to prevent making too many API requests
  // by waiting for the user to stop typing for 500ms
  useDebounce(() => setDebouncesSearchTerm(searchTerm), 800, [searchTerm]);

  const fetchMovies = async (query = "") => {
    setIsLoading(true);
    setErrorMessage("");
    try {
      const endpoint = query
        ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}`
        : `${API_BASE_URL}/discover/movie?sort_by=popularity.desc`;

      const response = await fetch(endpoint, API_OPTIONS);

      if (!response.ok) {
        throw new Error("Failed to fetch movies");
      }

      const data = await response.json();

      if (data.Response === "False") {
        setErrorMessage(data.Error || "Failed to fetch movies");
        setMovieList([]);
        return;
      }

      setMovieList(data.results || []);

      if (query && data.results.length > 0) {
        await updateSearchCount(query, data.results[0]);
      }
    } catch (error) {
      console.error(`Error fetching movies: ${error}`);
      setErrorMessage(`Error fetching movies. Please try again later`);
    } finally {
      setIsLoading(false);
    }
  };

  const loadTrendingMovies = async () => {
    try {
      const movies = await getTrendingMovies(); 
      setTrendingMovies(movies);
    } catch (error) {
      console.error(`Error fetching trending movies: ${error}`);
    }
  };

  useEffect(() => {
    fetchMovies(debouncesSearchTerm);
  }, [debouncesSearchTerm]);

  useEffect(() => {
    loadTrendingMovies();
  }, []);

  return (
    <div>
      <header className="header-wrapper">
        <div className="hero-pattern"></div>
        <img
          src="hero-left-light.png"
          alt="Left light"
          className="hero__light hero__light-left"
        />
        <img
          src="hero-right-light.png"
          alt="Right light"
          className="hero__light hero__light-right"
        />

        <div className="hero-wrapper">
          <img src="./hero-img.png" alt="Hero Banner" className="hero-img" />
          <h1>
            Discover <span className="text-gradient">great movies</span>{" "}
            tailored to your taste — no stress, no guesswork
          </h1>
        </div>
      </header>
      <main>
        {trendingMovies.length > 0 && (
          <section className="trending">
            <h2>Trending movies</h2>
            <ul>
              {trendingMovies.map((movie, index) => (
                <li key={movie.$id}>
                  <p>{index + 1}</p>
                </li>
              ))}
            </ul>
          </section>
        )}
        <section className="all-movies mt-20">
          <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
          <p className="text-red-500">{errorMessage}</p>

          {isLoading ? (
            <Spinner />
          ) : errorMessage ? (
            <p className="text-red-500">{errorMessage}</p>
          ) : (
            <ul className="movie-list">
              {movieList.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </ul>
          )}
        </section>
      </main>
      <footer></footer>
    </div>
  );
};

export default App;
