export async function getReviews() {
  const res = await fetch('/api/reviews');
  if (!res.ok) throw new Error('Failed to fetch');
  const data = await res.json();
  return data.reviews; // Return the reviews array from the response
}

export async function addReview(review) {
  const res = await fetch('/api/reviews', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(review),
  });
  if (!res.ok) throw new Error('Failed to add');
  const data = await res.json();
  return data.review; // Return the created review from the response
}
