import React from 'react';

import { Link } from 'react-router-dom';

const MovieCard = ({ movie }) => (
  <Link to={`/movies/${movie.movie_id}`} className="movie-card">
    <img 
      src={movie.poster_url} 
      alt={movie.movie_name}
      className="movie-poster"
    />
    <div className="movie-details">
      <h3>{movie.movie_name}</h3>
      <p>⭐ {movie.imdb_score}/10</p>
    </div>
  </Link>
);

export default MovieCard;