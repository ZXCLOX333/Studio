import React, { useEffect, useState } from 'react';
import { getReviews, addReview } from '../services/reviewsService';

function Reviews() {
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setIsLoading(true);
      const data = await getReviews();
      setReviews(data);
      setError('');
    } catch (err) {
      setError('Не вдалося завантажити відгуки');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newReview.trim()) return;
    
    try {
      setIsLoading(true);
      await addReview({ text: newReview });
      setNewReview('');
      setError('');
      fetchReviews(); // Refresh the list
    } catch (err) {
      setError('Не вдалося додати відгук');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('uk-UA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h2>Відгуки</h2>
      
      <form onSubmit={handleSubmit} style={{ marginBottom: '20px' }}>
        <textarea
          value={newReview}
          onChange={e => setNewReview(e.target.value)}
          placeholder="Напишіть ваш відгук..."
          style={{
            width: '100%',
            minHeight: '100px',
            padding: '10px',
            marginBottom: '10px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            resize: 'vertical'
          }}
        />
        <button 
          type="submit" 
          disabled={isLoading || !newReview.trim()}
          style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            opacity: isLoading ? 0.6 : 1
          }}
        >
          {isLoading ? 'Додавання...' : 'Додати відгук'}
        </button>
      </form>
      
      {error && (
        <div style={{color: 'red', marginBottom: '10px'}}>
          {error}
        </div>
      )}
      
      {isLoading && reviews.length === 0 ? (
        <div>Завантаження відгуків...</div>
      ) : reviews.length === 0 ? (
        <div>Поки що немає відгуків. Будьте першим!</div>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {reviews.map((review) => (
            <li 
              key={review.id} 
              style={{
                border: '1px solid #eee',
                borderRadius: '8px',
                padding: '15px',
                marginBottom: '10px',
                backgroundColor: '#f9f9f9'
              }}
            >
              <div style={{ marginBottom: '8px' }}>{review.text}</div>
              <small style={{ color: '#666' }}>
                {formatDate(review.createdAt)}
              </small>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Reviews;
