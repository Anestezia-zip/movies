import { useEffect, useState } from "react";
import Search from "./Search";
import MovieCard from "./MovieCard";
import Spinner from "./Spinner";
import { useDebounce } from "react-use";
import { getTrendingMovies, updateSearchCount } from "../appwrite";

const API_BASE_URL = "https://api.themoviedb.org/3";
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const API_OPTIONS = {
  method: "GET",
  headers: {
    accept: "application/json",
    Authorization: `Bearer ${API_KEY}`,
  },
};

const Home = () => {
  const [movieList, setMovieList] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [trendingMovies, setTrendingMovies] = useState([]);
  const [errorMessageTrending, setErrorMessageTrending] = useState("");
  const [isLoadingTrending, setIsLoadingTrending] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [page, setPage] = useState(1);

  // Debounce search term
  useDebounce(() => setDebouncedSearchTerm(searchTerm), 600, [searchTerm]);

  // Fetch movies based on search term or popular movies
  const fetchMovies = async (query = "", pageNum = 1) => {
    setIsLoading(true);
    try {
      if (pageNum === 1) {
        setMovieList([]); // Clear movie list on new search
      }

      const endpoint = query
        ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(
            query
          )}&page=${pageNum}`
        : `${API_BASE_URL}/discover/movie?sort_by=popularity.desc&page=${pageNum}`;

      const response = await fetch(endpoint, API_OPTIONS);
      if (!response.ok) throw new Error("Failed to fetch movies");

      const data = await response.json();
      setMovieList((prevMovies) =>
        pageNum === 1 ? data.results : [...prevMovies, ...data.results]
      );
    } catch (error) {
      console.error(`Error fetching movies: ${error}`);
      setErrorMessage("Error fetching movies. Please try again later");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch trending movies
  const loadTrendingMovies = async () => {
    setIsLoadingTrending(true);
    setErrorMessageTrending("");

    try {
      const movies = await getTrendingMovies();
      setTrendingMovies(movies);
    } catch (error) {
      console.error(`Error fetching trending movies: ${error}`);
      setErrorMessageTrending(error);
    } finally {
      setIsLoadingTrending(false);
    }
  };

  // Handle scroll to load more movies when user scrolls to the bottom
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >=
          document.body.offsetHeight - 500 &&
        !isLoading &&
        debouncedSearchTerm === ""
      ) {
        setPage((prevPage) => prevPage + 1);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isLoading, debouncedSearchTerm]); // Re-run if search term changes

  // Fetch movies on search term change
  useEffect(() => {
    setPage(1); // Reset page to 1 when search term changes
  }, [debouncedSearchTerm]);

  // Fetch movies whenever search term or page changes
  useEffect(() => {
    if (debouncedSearchTerm === "") {
      fetchMovies("", page); // Fetch popular movies if no search term
    } else {
      fetchMovies(debouncedSearchTerm, page); // Fetch search results
    }
  }, [debouncedSearchTerm, page]);

  // Fetch trending movies on initial load
  useEffect(() => {
    loadTrendingMovies();
  }, []);

  // Handle movie click (for search count update)
  const handleMovieClick = async (movie, index) => {
    const termToSave = searchTerm.trim() !== "" ? searchTerm : movie.title;
    try {
      await updateSearchCount(termToSave, movie);
    } catch (error) {
      console.error("Error updating search count:", error);
    }

    const pageOfClickedMovie = Math.ceil((index + 1) / 20);
    sessionStorage.setItem("lastMovieIndex", movie.id);
    sessionStorage.setItem("lastPage", pageOfClickedMovie);
  };

  useEffect(() => {
    const savedPage = sessionStorage.getItem("lastPage");
    const lastMovieIndex = sessionStorage.getItem("lastMovieIndex");
  
    if (!savedPage || !lastMovieIndex) return;
  
    const lastPage = parseInt(savedPage, 10);
  
    const loadAllPages = async () => {
      setIsLoading(true);
  
      try {
        const promises = [];
  
        // Ограничиваем количество страниц, если их слишком много
        const MAX_PRELOAD_PAGES = 50;
        const pagesToLoad = Math.min(lastPage, MAX_PRELOAD_PAGES);
  
        // Загружаем страницы параллельно
        for (let p = 1; p <= pagesToLoad; p++) {
          const endpoint = `${API_BASE_URL}/discover/movie?sort_by=popularity.desc&page=${p}`;
          promises.push(fetch(endpoint, API_OPTIONS).then((res) => res.json()));
        }
  
        // Ждем завершения всех промисов
        const results = await Promise.all(promises);
  
        // Объединяем все фильмы в один массив
        const allMovies = results.flatMap((res) => res.results);
        setMovieList(allMovies);
      } catch (error) {
        console.error("Error preloading pages:", error);
        setErrorMessage("Error loading saved movies.");
      } finally {
        setIsLoading(false);
      }
    };
  
    loadAllPages();
  }, []);
  
  

  useEffect(() => {
    const lastMovieIndex = sessionStorage.getItem("lastMovieIndex");
    const hasScrolled = sessionStorage.getItem("hasScrolled");
  
    if (!lastMovieIndex || hasScrolled) return;
  
    const tryScroll = () => {
      const element = document.getElementById(lastMovieIndex);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
        sessionStorage.setItem("hasScrolled", "true");
  
        setTimeout(() => {
          sessionStorage.removeItem("lastMovieIndex");
          sessionStorage.removeItem("lastPage");
          sessionStorage.removeItem("hasScrolled");
        }, 1000);
      } else {
        // Если элемент ещё не загрузился, пробуем снова через 200 мс
        setTimeout(tryScroll, 200);
      }
    };
  
    tryScroll();
  }, [movieList]);
  

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
          <h1 className="mx-auto max-w-4xl text-center">
            Discover <span className="text-gradient">great movies</span>{" "}
            tailored to your taste — no stress, no guesswork
          </h1>
        </div>
      </header>

      <main>
        {trendingMovies.length > 0 && (
          <section className="trending">
            <h2>Top 20 trending movies based on search terms</h2>
            {isLoadingTrending ? (
              <Spinner />
            ) : errorMessageTrending ? (
              <p className="text-red-500">{errorMessageTrending}</p>
            ) : (
              <ul>
                {trendingMovies.map((movie, index) => (
                  <li key={movie.$id}>
                    <p>{index + 1}</p>
                    <img src={movie.poster_url} alt={movie.title} />
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}

        <section className="all-movies">
          <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
          {errorMessage && <p className="text-red-500">{errorMessage}</p>}

          <ul className="movie-list">
            {movieList.map((movie, i) => (
              <MovieCard
                key={i}
                movie={movie}
                onClick={() => handleMovieClick(movie, i)}
                id={movie.id}
              />
            ))}
          </ul>

          {isLoading && <Spinner />}
        </section>

        <img
          src="./arrow.png"
          alt="Arrow up"
          onClick={() => window.scrollTo({ top: 600, behavior: "smooth" })}
          className="w-14 rounded-full fixed left-3 bottom-3 bg-light-200 hover:bg-blue-200 transition-all duration-300 ease-in-out outline-6 outline-light-200 hover:outline-blue-200 outline-offset-[-6px] cursor-pointer"
        />
      </main>

      <footer></footer>
    </div>
  );
};

export default Home;
