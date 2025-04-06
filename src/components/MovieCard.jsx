import React from "react";
import { Link } from "react-router-dom";

const MovieCard = ({
  movie: { id, title, vote_average, poster_path, release_date, original_language }, onClick, ref
}) => {
  
  return (
    <div className="movie-card" id={id}>
      <Link to={`/movie/${id}`} onClick={onClick}>
        <figure>
          <img
            className="movie-main-img"
            src={
              poster_path
                ? `https://image.tmdb.org/t/p/w500/${poster_path}`
                : "/no-movie.png"
            }
            alt={title}
          />
        </figure>
        <div className="mt-4 p-2">
          <h3>{title}</h3>

          <div className="content">
            <div className="rating">
              ⭐<p>{vote_average ? vote_average.toFixed(1) : "N/A"}</p>
            </div>
            <p className="lang">{original_language}</p>
            <p className="year">
              {release_date ? release_date.split("-")[0] : "N/A"}
            </p>
          </div>
        </div>
      </Link>
    </div>
  );
};
export default MovieCard;
