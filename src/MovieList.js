import React, { useEffect, useState } from 'react';

function MovieList() {
  const [movies, setMovies] = useState([]);

  useEffect(() => {
    fetch('/api/movies')
      .then(response => response.json())
      .then(data => setMovies(data))
      .catch(error => console.error('Ошибка:', error));
  }, []);

  return (
    <div>
      <h2>Список фильмов</h2>
      <ul>
        {movies.map(movie => (
          <li key={movie.id}>{movie.title} ({movie.genre})</li>
        ))}
      </ul>
    </div>
  );
}

export default MovieList;