import React, { useState, useEffect, useContext } from 'react';
import './ReviewSection.css';
import AuthContext from '../context/AuthContext';
import { Link } from 'react-router-dom';

const ReviewSection = ({ movieId }) => {
  const { user } = useContext(AuthContext);

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

    if (!user) {
      alert("You must be logged in to submit a review.");
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/movies/${movieId}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.user_id,
          rating: newReview.rating,
          content: newReview.content
        })
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || 'Failed to submit review');
      }

      // Refresh reviews
      const updatedResponse = await fetch(`http://localhost:5000/movies/${movieId}/reviews`);
      const updatedData = await updatedResponse.json();
      setReviews(updatedData);
      setNewReview({ rating: 5, content: '' });

    } catch (err) {
      alert(`Error: ${err.message}`);
      console.error('Submission error:', err);
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

      {user ? (
        <form onSubmit={handleSubmit} className="review-form">
          <h3>Add Your Review</h3>
          <div className="form-group">
            <label>Rating:</label>
            <select 
              value={newReview.rating}
              onChange={(e) => setNewReview({ ...newReview, rating: e.target.value })}
            >
              {[1,2,3,4,5,6,7,8,9,10].map(num => (
                <option key={num} value={num}>{num}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Review:</label>
            <textarea 
              value={newReview.content}
              onChange={(e) => setNewReview({ ...newReview, content: e.target.value })}
              rows="4"
            />
          </div>
          <button type="submit">Submit Review</button>
        </form>
      ) : (
        <p>Please <Link to="/login">login</Link> to submit a review</p>
      )}
    </section>
  );
};

export default ReviewSection;
