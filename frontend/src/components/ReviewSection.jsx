import React, { useState, useEffect } from 'react';
import './ReviewSection.css';

const ReviewSection = ({ movieId }) => {
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState({
    rating: 5,
    content: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await fetch(`http://localhost:5000/movies/${movieId}/reviews`);
        const data = await response.json();
        setReviews(data);
      } catch (err) {
        console.error('Failed to fetch reviews:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, [movieId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:5000/movies/${movieId}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: 1, // Replace with actual user ID from auth
          rating: newReview.rating,
          content: newReview.content
        })
      });
      
      if (response.ok) {
        // Refresh reviews after submission
        const updatedReviews = await fetch(`http://localhost:5000/movies/${movieId}/reviews`);
        setReviews(await updatedReviews.json());
        setNewReview({ rating: 5, content: '' });
      }
    } catch (err) {
      console.error('Failed to submit review:', err);
    }
  };

  if (loading) return <div>Loading reviews...</div>;

  return (
    <section className="review-section">
      <h2>User Reviews</h2>
      
      <div className="reviews-list">
        {reviews.length > 0 ? (
          reviews.map(review => (
            <div key={review.review_id} className="review-card">
              <div className="review-header">
                <span className="reviewer">{review.username}</span>
                <span className="rating">⭐ {review.rating}/10</span>
                <span className="date">
                  {new Date(review.review_date).toLocaleDateString()}
                </span>
              </div>
              <p className="review-content">{review.review_content}</p>
            </div>
          ))
        ) : (
          <p>No reviews yet. Be the first to review!</p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="review-form">
        <h3>Add Your Review</h3>
        <div className="form-group">
          <label>Rating:</label>
          <select 
            value={newReview.rating}
            onChange={(e) => setNewReview({...newReview, rating: e.target.value})}
          >
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
              <option key={num} value={num}>{num}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Review:</label>
          <textarea 
            value={newReview.content}
            onChange={(e) => setNewReview({...newReview, content: e.target.value})}
            rows="4"
          />
        </div>
        <button type="submit">Submit Review</button>
      </form>
    </section>
  );
};

export default ReviewSection;