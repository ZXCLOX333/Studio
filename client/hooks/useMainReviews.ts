import { useState, useEffect } from 'react';
import { Review } from '@shared/api';

export interface MainReview {
  id: string;
  avatar: string;
  text: string;
  stars?: number;
  createdAt: string;
}

// Дефолтні відгуки для першого рядка
const defaultReviews1: MainReview[] = [
  {
    id: "default1-1",
    avatar: "https://api.builder.io/api/v1/image/assets/TEMP/cdb95157596678dcd21a38073c5dcce3c7845536?width=124",
    text: "Дякую, милуюсь, дуже подобається 😍",
    stars: 5,
    createdAt: new Date().toISOString(),
  },
  {
    id: "default1-2",
    avatar: "https://api.builder.io/api/v1/image/assets/TEMP/cdb95157596678dcd21a38073c5dcce3c7845536?width=124",
    text: "Плівочку зняла, трошки ще шкіра відшулушується але все чудово, всі звертають увагу на це тату, тільки ходжу і компліменти збираю, відгук зроблю коли вже повністю заживе, мені дуууже подобається що вийшло",
    stars: 5,
    createdAt: new Date().toISOString(),
  },
  {
    id: "default1-3",
    avatar: "https://api.builder.io/api/v1/image/assets/TEMP/50539832474100cc93c13a30455d91939b986e3b?width=124",
    text: "Дуже дякую вам за таку красу🥰",
    stars: 5,
    createdAt: new Date().toISOString(),
  },
  {
    id: "default1-4",
    avatar: "https://api.builder.io/api/v1/image/assets/TEMP/2729787a24c3ce7f2d8e56cf9df4a559357dd1cc?width=124",
    text: "Дякую вам велике, дійсно передали почерк татка",
    stars: 5,
    createdAt: new Date().toISOString(),
  },
  {
    id: "default1-5",
    avatar: "https://api.builder.io/api/v1/image/assets/TEMP/4f321696851b976b89571c1e7b153c95b21343cd?width=124",
    text: "В мене всі в восторзі перекриттям😍😍😍",
    stars: 5,
    createdAt: new Date().toISOString(),
  },
];

// Дефолтні відгуки для другого рядка
const defaultReviews2: MainReview[] = [
  {
    id: "default2-1",
    avatar: "https://api.builder.io/api/v1/image/assets/TEMP/0acf3d9092acdfa26325861372ef538be625cfbb?width=124",
    text: "Щиро дякую я цілий вечір ними любуюсь",
    stars: 5,
    createdAt: new Date().toISOString(),
  },
  {
    id: "default2-2",
    avatar: "https://api.builder.io/api/v1/image/assets/TEMP/0acf3d9092acdfa26325861372ef538be625cfbb?width=124",
    text: "Робила у вас своє перше довгоочікуване татуювання, від результату я просто в захваті. Заживше тату виглядає неймовірно. Буду вас рекомендувати своїм друзям і знайомим і вернусь за другим тату",
    stars: 5,
    createdAt: new Date().toISOString(),
  },
  {
    id: "default2-3",
    avatar: "https://api.builder.io/api/v1/image/assets/TEMP/a1e30bb9c104bd25e0eb8a67f857180939b05fb1?width=124",
    text: "🔥",
    stars: 5,
    createdAt: new Date().toISOString(),
  },
  {
    id: "default2-4",
    avatar: "https://api.builder.io/api/v1/image/assets/TEMP/50539832474100cc93c13a30455d91939b986e3b?width=124",
    text: "Дуже дякую за атмосферу і професіоналізм!",
    stars: 5,
    createdAt: new Date().toISOString(),
  },
  {
    id: "default2-5",
    avatar: "https://api.builder.io/api/v1/image/assets/TEMP/2729787a24c3ce7f2d8e56cf9df4a559357dd1cc?width=124",
    text: "Все дуже сподобалось, прийду ще!",
    stars: 5,
    createdAt: new Date().toISOString(),
  },
];

export function useMainReviews() {
  const [reviews1, setReviews1] = useState<MainReview[]>([]);
  const [reviews2, setReviews2] = useState<MainReview[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Завантаження відгуків з API
  const loadReviews = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
  const response = await fetch('/api/reviews');
      if (!response.ok) {
        throw new Error('Failed to fetch reviews');
      }
      
      const data = await response.json();
      const apiReviews: Review[] = data.reviews || [];
      
      // Конвертуємо API відгуки в формат для UI
                        const uiReviews: MainReview[] = apiReviews.map(review => {
                    const stars = review.stars !== undefined ? review.stars : 5;
                    return {
          id: review.id,
          text: review.text,
          createdAt: review.createdAt,
          avatar: review.avatar || "https://api.builder.io/api/v1/image/assets/TEMP/50539832474100cc93c13a30455d91939b986e3b?width=124",
          stars: stars
        };
      });
      
      // Розподіляємо відгуки між двома рядками
      const allReviews = [...defaultReviews1, ...defaultReviews2, ...uiReviews];
      const half = Math.ceil(allReviews.length / 2);
      
      setReviews1(allReviews.slice(0, half));
      setReviews2(allReviews.slice(half));
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load reviews');
      console.error('Error loading reviews:', err);
      
      // Якщо API не працює, використовуємо дефолтні відгуки
      setReviews1(defaultReviews1);
      setReviews2(defaultReviews2);
    } finally {
      setIsLoading(false);
    }
  };

  // Додавання нового відгуку
  const addReview = async (review: { avatar: string; text: string; stars?: number }) => {
    try {
      setIsLoading(true);
      setError(null);
      
  const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: review.text,
          avatar: review.avatar,
          stars: review.stars
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to add review');
      }
      
      const data = await response.json();
      const newReview: MainReview = {
        id: data.review.id,
        text: data.review.text,
        createdAt: data.review.createdAt,
        avatar: data.review.avatar || review.avatar,
        stars: data.review.stars !== undefined ? data.review.stars : (review.stars !== undefined ? review.stars : 5)
      };
      
      // Перезавантажуємо всі відгуки після додавання нового
      await loadReviews();
      
      return newReview;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add review');
      console.error('Error adding review:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Завантаження відгуків при ініціалізації
  useEffect(() => {
    loadReviews();
  }, []);

  // Розрахунок середньої оцінки
  const calculateAverageRating = (): number => {
    const allReviews = [...reviews1, ...reviews2];
    if (allReviews.length === 0) return 5; // Дефолтна оцінка якщо немає відгуків
    
    const totalStars = allReviews.reduce((sum, review) => sum + (review.stars || 5), 0);
    const average = totalStars / allReviews.length;
    
    // Округляємо до одного знака після коми
    return Math.round(average * 10) / 10;
  };

  // Отримання кількості відгуків
  const getReviewsCount = (): number => {
    return reviews1.length + reviews2.length;
  };

  return {
    reviews1,
    reviews2,
    isLoading,
    error,
    addReview,
    loadReviews,
    averageRating: calculateAverageRating(),
    reviewsCount: getReviewsCount()
  };
}
