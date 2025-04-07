import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import './MovieDetail.css';

const MovieDetail = () => {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMovieData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:5000/movies/${id}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch movie');
        }
        
        const data = await response.json();
        setMovie(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMovieData();
  }, [id]);

  if (loading) {
    return (
      <div className="loading-state">
        <div className="spinner"></div>
        <p>Loading movie details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-state">
        <h2>Error Loading Movie</h2>
        <p>{error}</p>
        <Link to="/" className="back-button">Return to Home</Link>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="not-found">
        <h2>Movie Not Found</h2>
        <Link to="/" className="back-button">Browse All Movies</Link>
      </div>
    );
  }

  return (
    <div className="movie-detail-container">
      <Link to="/" className="back-button">
        &larr; Back to Movies
      </Link>

      <div className="movie-hero">
        <img 
          src={movie.poster_url} 
          alt={`Poster for ${movie.movie_name}`} 
          className="movie-poster"
        />
        
        <div className="movie-info">
          <h1>{movie.movie_name}</h1>
          
          <div className="movie-meta">
            <span className="rating">
              ⭐ {movie.imdb_score}/10
            </span>
            <span className="year">
              {new Date(movie.movie_release_date).getFullYear()}
            </span>
            <span className="runtime">
              {Math.floor(movie.movie_duration / 60)}h {movie.movie_duration % 60}m
            </span>
          </div>

          <div className="genres">
            {movie.genres?.map(genre => (
              <span key={genre} className="genre-tag">{genre}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="movie-content">
        <section className="synopsis">
          <h2>Synopsis</h2>
          <p>{movie.description || 'No synopsis available.'}</p>
        </section>

        <div className="details-grid">
          <div className="detail-card">
            <h3>Director</h3>
            <p>{movie.director || 'Unknown'}</p>
          </div>
          
          <div className="detail-card">
            <h3>Budget</h3>
            <p>{movie.budget ? `$${movie.budget.toLocaleString()}` : 'Unknown'}</p>
          </div>
          
          <div className="detail-card">
            <h3>Release Date</h3>
            <p>{new Date(movie.movie_release_date).toLocaleDateString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieDetail;