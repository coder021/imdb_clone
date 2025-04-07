import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MovieCard from './components/MovieCard';
import MovieDetail from './components/MovieDetail'; // We'll create this next
import './App.css';

// 1. First, extract your movie list into a separate component
function MovieList() {
  const [movies, setMovies] = useState([]);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const response = await fetch('http://localhost:5000/movies');
        const data = await response.json();
        setMovies(data);
      } catch (error) {
        console.error('Error fetching movies:', error);
      }
    };
    fetchMovies();
  }, []);

  return (
    <div className="movie-grid">
      {movies.map(movie => (
        <MovieCard key={movie.movie_id} movie={movie} />
      ))}
    </div>
  );
}

// 2. Update the main App component
function App() {
  return (
    <Router>
      <div className="app">
        <h1>IMDb Clone</h1>
        <Routes>
          {/* Home route - shows movie grid */}
          <Route path="/" element={<MovieList />} />
          
          {/* Movie details route */}
          <Route path="/movies/:id" element={<MovieDetail />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;