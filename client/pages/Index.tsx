import React, { useState, useRef, useEffect } from "react";
import { TelegramResponse, BookingResponse } from "../types/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useMainReviews } from "@/hooks/useMainReviews";

const StarRating = ({ count = 5 }: { count?: number }) => (
  <div className="flex gap-1 mt-[14px] ml-0">
    {Array.from({ length: count }).map((_, i) => (
      <svg key={i} width="12" height="11" viewBox="0 0 12 11" fill="none">
        <path d="M6 11L5.13 10.2087C2.04 7.40926 0 5.55695 0 3.297C0 1.44469 1.452 0 3.3 0C4.344 0 5.346 0.485559 6 1.24687C6.654 0.485559 7.656 0 8.7 0C10.548 0 12 1.44469 12 3.297C12 5.55695 9.96 7.40926 6.87 10.2087L6 11Z" fill="#CF1B1B"/>
      </svg>
    ))}
  </div>
);

const TestimonialCard = ({
  avatar,
  text,
  stars = 5,
  isActive = false,
  onClick,
}: { avatar: string; text: string; stars?: number; isActive?: boolean; onClick?: () => void }) => {
  
  return (
  <div
    className={`bg-tattoo-card shadow-[0_4px_12px_0_rgba(0,0,0,0.10)] rounded-[22px] w-full max-w-[407px] md:w-[407px] flex flex-row p-6 ${isActive ? 'active-card' : ''}`}
    style={{ 
      minWidth: 407, 
      minHeight: isActive ? "auto" : 213, 
      maxWidth: 407, 
      height: isActive ? "auto" : 213,
      transform: isActive ? 'translateY(-18px)' : 'translateY(0)',
      transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      zIndex: isActive ? 10 : 1,
      boxShadow: isActive ? '0 15px 30px rgba(0,0,0,0.25)' : '0 4px 12px rgba(0,0,0,0.10)',
      cursor: 'pointer',
      position: 'relative',
      marginTop: isActive ? '20px' : '0',
      border: isActive ? '2px solid #FFA500' : 'none',
    }}
    onClick={onClick}
  >
    <div className="flex flex-col items-start flex-shrink-0" style={{ width: 62 }}>
      <img
        src={avatar}
        alt="Client"
        className="w-[62px] h-[55px] rounded-lg object-cover mb-0"
        style={{ marginBottom: 0, borderRadius: '8px' }}
      />
      <div className="mt-[14px] mb-0 flex ml-0">
        <StarRating count={stars} />
      </div>
    </div>
    <div
      className="text-tattoo-light font-open-sans text-sm lg:text-base leading-5 lg:leading-6 ml-6 flex-1"
      style={{ 
        marginTop: 8, 
        marginBottom: 24, 
        minHeight: isActive ? "auto" : "calc(100% - 32px)", 
        maxHeight: isActive ? "none" : "calc(100% - 32px)", 
        overflowWrap: "break-word",
        paddingRight: 8,
        paddingTop: 4,
        transition: "all 0.3s ease",
        overflowY: isActive ? "visible" : "auto",
        height: isActive ? "auto" : "calc(100% - 32px)",
        display: "block",
        whiteSpace: "pre-wrap", 
        wordBreak: "break-word",
        overflowX: "hidden",
        maxWidth: "280px"
      }}
    >
      {text}
    </div>
  </div>
  );
};

// Автоматичний горизонтальний скрол рядків відгуків з плавним нескінченним циклом
function AutoScrollRow({
  children,
  speed = 1,
  reverse = false,
}: {
  children: React.ReactNode;
  speed?: number;
  reverse?: boolean;
}) {
  const rowRef = useRef<HTMLDivElement>(null);
  const [clones, setClones] = useState<React.ReactNode[]>([]);
  const [hovered, setHovered] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [lastX, setLastX] = useState<number | null>(null);
  const [velocity, setVelocity] = useState(0);
  const [activeCardIndex, setActiveCardIndex] = useState<number | null>(null);
  const [isPaused, setIsPaused] = useState(false);

  // Клонуємо дітей для плавного циклу
  useEffect(() => {
    const arr = Array.isArray(children) ? children : [children];
    setClones(arr);
  }, [children]);

  // Анімація автоскролу + drag
  useEffect(() => {
    const row = rowRef.current;
    if (!row) return;
    let frame: number;
    let pos = row.scrollLeft;
    let lastTime = performance.now();

    function animate(now: number) {
      if (!row) return;
      const dt = (now - lastTime) / 16.67; // ~60fps
      lastTime = now;
      let currentSpeed = hovered ? speed * 3 : speed;
      if (dragging || isPaused) {
        currentSpeed = 0;
      }
      // Напрямок скролу
      let scrollStep = (currentSpeed + velocity) * (reverse ? -1 : 1);
      pos += scrollStep;
      row.scrollLeft = pos;
      // нескінченний цикл
      const scrollWidth = row.scrollWidth / 2;
      if (pos >= scrollWidth) {
        pos -= scrollWidth;
        row.scrollLeft = pos;
      } else if (pos < 0) {
        pos += scrollWidth;
        row.scrollLeft = pos;
      }
      // Затухання velocity
      setVelocity((v) => Math.abs(v) > 0.1 ? v * 0.92 : 0);
      frame = requestAnimationFrame(animate);
    }

    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
    // eslint-disable-next-line
  }, [speed, clones, hovered, dragging, velocity, reverse, isPaused]);

  // Drag to scroll (mouse/touch)
  function onPointerDown(e: React.PointerEvent) {
    setDragging(true);
    setLastX(e.clientX);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }
  function onPointerMove(e: React.PointerEvent) {
    if (!dragging || lastX === null) return;
    const dx = e.clientX - lastX;
    setLastX(e.clientX);
    const row = rowRef.current;
    if (row) {
      row.scrollLeft += dx; // виправлено: додавання dx для природного drag
      setVelocity(dx);
    }
  }
  function onPointerUp(e: React.PointerEvent) {
    setDragging(false);
    setLastX(null);
  }

  // Функція для обробки кліку на картку
  const handleCardClick = (index: number) => {
    if (activeCardIndex === index) {
      setActiveCardIndex(null);
      setIsPaused(false);
    } else {
      setActiveCardIndex(index);
      setIsPaused(true);
    }
  };

  // Клонуємо дітей з додаванням обробника кліку
  const childrenWithProps = React.Children.map(clones, (child, index) => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, {
        isActive: activeCardIndex === index,
        onClick: () => handleCardClick(index),
      } as any);
    }
    return child;
  });

  return (
    <div
      ref={rowRef}
      className="flex gap-8 w-full max-w-none pb-2"
      style={{
        scrollBehavior: "auto",
        minWidth: 0,
        overflowX: "hidden",
        userSelect: dragging ? "none" : undefined,
        cursor: dragging ? "grabbing" : "grab",
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={() => setDragging(false)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      tabIndex={-1}
    >
      {childrenWithProps}
      {childrenWithProps}
    </div>
  );
}

// Інтерактивні сердечка для модалки (оригінальний розмір 12x11)
function InteractiveStarRating({
  count = 5,
  value,
  onChange,
}: {
  count?: number;
  value: number;
  onChange: (v: number) => void;
}) {
  const [hovered, setHovered] = useState<number | null>(null);
  return (
    <div className="flex gap-1 mt-[14px] ml-0">
      {Array.from({ length: count }).map((_, i) => {
        const isActive = hovered !== null ? i < hovered : i < value;
        return (
          <svg
            key={i}
            width="12"
            height="11"
            viewBox="0 0 12 11"
            fill="none"
            style={{ cursor: "pointer", transition: "fill 0.2s" }}
            onMouseEnter={() => setHovered(i + 1)}
            onMouseLeave={() => setHovered(null)}
            onClick={() => onChange(i + 1)}
          >
            <path
              d="M6 11L5.13 10.2087C2.04 7.40926 0 5.55695 0 3.297C0 1.44469 1.452 0 3.3 0C4.344 0 5.346 0.485559 6 1.24687C6.654 0.485559 7.656 0 8.7 0C10.548 0 12 1.44469 12 3.297C12 5.55695 9.96 7.40926 6.87 10.2087L6 11Z"
              fill={
                isActive
                  ? "#CF1B1B"
                  : "#888"
              }
              style={{
                transition: "fill 0.2s",
                ...(hovered !== null && i < hovered
                  ? { fill: "#CF1B1B" }
                  : {}),
              }}
            />
          </svg>
        );
      })}
    </div>
  );
}

export default function Index() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    message: ''
  });

  const [showSubmitButton, setShowSubmitButton] = useState(false);
  
  // Додаємо стан для мобільного меню
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Ефект для анімації мобільних пунктів меню
  useEffect(() => {
    if (isMobileMenuOpen) {
      const menuItems = document.querySelectorAll('.mobile-menu-item');
      menuItems.forEach((item, index) => {
        setTimeout(() => {
          item.classList.add('animate-in');
        }, index * 100);
      });
    } else {
      const menuItems = document.querySelectorAll('.mobile-menu-item');
      menuItems.forEach(item => {
        item.classList.remove('animate-in');
      });
    }
  }, [isMobileMenuOpen]);

  // Ефект для контролю відображення side cards на різних розмірах екрану
  useEffect(() => {
    const handleResize = () => {
      const tabletCards = document.querySelector('[data-cards="tablet"]') as HTMLElement;
      const mobileCards = document.querySelector('[data-cards="mobile"]') as HTMLElement;
      const desktopCards = document.querySelector('[data-cards="desktop"]') as HTMLElement;
      const desktopOnlyCards = document.querySelector('[data-cards="desktop-only"]') as HTMLElement;
      
              if (tabletCards && mobileCards && desktopCards && desktopOnlyCards) {
          if (window.innerWidth < 768) {
            // Мобільні пристрої (< 768px) - показуємо тільки мобільні картки
            tabletCards.style.display = 'none';
            mobileCards.style.display = 'block';
            desktopCards.style.display = 'none';
            desktopOnlyCards.style.display = 'none';
            
            // Додаткова перевірка - приховуємо всі інші блоки
            const allSideCards = document.querySelectorAll('[data-cards]');
            allSideCards.forEach(card => {
              const element = card as HTMLElement;
              if (element.getAttribute('data-cards') !== 'mobile') {
                element.style.display = 'none';
              }
            });
          } else if (window.innerWidth >= 768 && window.innerWidth < 1024) {
            // Планшети (768-1023px) - показуємо тільки планшетні картки
            tabletCards.style.display = 'flex';
            mobileCards.style.display = 'none';
            desktopCards.style.display = 'none';
            desktopOnlyCards.style.display = 'none';
            
            // Додаткова перевірка - приховуємо всі інші блоки
            const allSideCards = document.querySelectorAll('[data-cards]');
            allSideCards.forEach(card => {
              const element = card as HTMLElement;
              if (element.getAttribute('data-cards') !== 'tablet') {
                element.style.display = 'none';
              }
            });
          } else if (window.innerWidth >= 1024 && window.innerWidth < 1536) {
            // Десктоп (1024-1535px) - показуємо тільки десктопні картки
            tabletCards.style.display = 'none';
            mobileCards.style.display = 'none';
            desktopCards.style.display = 'flex';
            desktopOnlyCards.style.display = 'none';
            
            // Додаткова перевірка - приховуємо всі інші блоки
            const allSideCards = document.querySelectorAll('[data-cards]');
            allSideCards.forEach(card => {
              const element = card as HTMLElement;
              if (element.getAttribute('data-cards') !== 'desktop') {
                element.style.display = 'none';
              }
            });
          } else {
            // Дуже великі екрани (1536px+) - показуємо тільки Desktop Only картки
            tabletCards.style.display = 'none';
            mobileCards.style.display = 'none';
            desktopCards.style.display = 'none';
            desktopOnlyCards.style.display = 'block';
            
            // Додаткова перевірка - приховуємо всі інші блоки
            const allSideCards = document.querySelectorAll('[data-cards]');
            allSideCards.forEach(card => {
              const element = card as HTMLElement;
              if (element.getAttribute('data-cards') !== 'desktop-only') {
                element.style.display = 'none';
              }
            });
          }
        }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Викликаємо одразу
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Стани для інтерактивних блоків та відео
  const [activeVideoIndex, setActiveVideoIndex] = useState(0);
  const [activeBlockIndex, setActiveBlockIndex] = useState(-1); // -1 означає, що жоден блок не активний
  const activeVideoRef = useRef<HTMLVideoElement>(null);
  
  // Дані для інтерактивних блоків
  const [blocks, setBlocks] = useState([
    {
      id: 0,
      image: "https://api.builder.io/api/v1/image/assets/TEMP/65e67ca781f633b42b9ecce634c50d433e35befb?width=280",
      text: "Тату яке нагадає вам про ваші мрії",
      position: 0, // 0 - верхній, 1 - середній, 2 - нижній
      animationClass: ""
    },
    {
      id: 1,
      image: "https://api.builder.io/api/v1/image/assets/TEMP/04a2e6388ab29696a2fed6636b344068e530e2f1?width=280",
      text: "Сміливе рішення, висока нагорода",
      position: 1,
      animationClass: ""
    },
    {
      id: 2,
      image: "https://api.builder.io/api/v1/image/assets/TEMP/60352c5647f9b9e7f5d8fb61fbc45310a6560144?width=280",
      text: "Перекриття з слабкої роботи на сильну",
      position: 2,
      animationClass: ""
    },
    {
      id: 3,
      // Використовуємо зображення з тату "Memento Mori"
      image: "/photo_2025-08-25_23-13-22.jpg",
      text: "Життя - це усьоголиш мить",
      position: 3, // Блок, який зараз на задньому фоні
      animationClass: ""
    }
  ]);
  
  // Додаємо стан для відстеження анімації
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Фіксовані відео для блоків
  const blockVideos = [
    "/videos/video1.mp4",
    "/videos/video2.mp4",
    "/videos/video3.mp4",
    "/videos/video4.mp4"
  ];
  
  // Функція для обробки кліку по блоку - спрощена версія анімації
  const handleBlockClick = (blockId: number) => {
    // Перевіряємо, чи не відбувається вже анімація
    if (activeBlockIndex !== -1 || isAnimating) return;
    
    // Встановлюємо стан анімації
    setIsAnimating(true);
    setActiveBlockIndex(blockId);
    
    // Знаходимо блок, на який натиснули
    const clickedBlock = blocks.find(block => block.id === blockId);
    if (!clickedBlock) {
      setIsAnimating(false);
      setActiveBlockIndex(-1);
      return;
    }
    
    // Через 500мс змінюємо відео (після анімації вильоту блоку)
    setTimeout(() => {
      setActiveVideoIndex(clickedBlock.id);
      
      // Змінюємо відео на фіксоване
      if (activeVideoRef.current) {
        activeVideoRef.current.src = blockVideos[clickedBlock.id];
        activeVideoRef.current.load();
        activeVideoRef.current.play();
      }
      
      // Через 300мс оновлюємо позиції блоків (після зміни відео)
      setTimeout(() => {
        // Створюємо нову копію блоків для оновлення
        const newBlocks = [...blocks];
        
        // Зберігаємо поточний блок, який був на задньому фоні
        const backgroundBlock = newBlocks.find(block => block.position === 3);
        
        // Зберігаємо позицію натиснутого блоку
        const clickedPosition = clickedBlock.position;
        
        // Скидаємо всі анімаційні класи перед додаванням нових
        newBlocks.forEach(block => {
          block.animationClass = '';
        });
        
        // Додаємо клас для анімації падіння нового блоку
        if (backgroundBlock) {
          // Блок із заднього фону падає на місце натиснутого блоку
          backgroundBlock.position = clickedPosition;
          backgroundBlock.animationClass = 'falling-new-block';
        }
        
        // Натиснутий блок переміщується на задній фон
        newBlocks.forEach(block => {
          if (block.id === clickedBlock.id) {
            block.position = 3; // Переміщуємо на задній фон
            block.animationClass = '';
          }
        });
        
        // Оновлюємо блоки з анімацією падіння
        setBlocks([...newBlocks]);
        
        // Через 800мс скидаємо анімаційні класи і дозволяємо нові кліки
        setTimeout(() => {
          const finalBlocks = newBlocks.map(block => ({
            ...block,
            animationClass: ''
          }));
          
          setBlocks(finalBlocks);
          setActiveBlockIndex(-1); // Скидаємо активний блок, щоб дозволити нові кліки
          setIsAnimating(false); // Скидаємо стан анімації
        }, 800);
      }, 300);
    }, 500);
  };
  
  


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'phone') {
      // Дозволяємо тільки цифри та деякі спеціальні символи для форматування
      const phoneRegex = /^[0-9+\-()\s]*$/;
      if (!phoneRegex.test(value)) {
        return; // Не оновлюємо стан якщо введено недозволені символи
      }
      
      // Обмежуємо довжину до 13 символів (формат +380XXXXXXXXX)
      if (value.length > 13) {
        return;
      }
    }
    
    const newFormData = {
      ...formData,
      [name]: value
    };
    
    setFormData(newFormData);
    
    // Перевіряємо чи можна показати кнопку
    const canShowButton = newFormData.name.trim().length > 0 && 
                         newFormData.phone.trim().length >= 10; // Мінімум 10 цифр для українського номера
    
    setShowSubmitButton(canShowButton);
  };

  // --- Відгуки для двох рядків ---
  const { reviews1, reviews2, isLoading: reviewsLoading, error: reviewsError, addReview, averageRating, reviewsCount } = useMainReviews();

  // --- Додавання відгуку ---
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewForm, setReviewForm] = useState({ avatar: "", text: "", stars: 5 });
  const [lastAddedRow, setLastAddedRow] = useState<1 | 2>(2);

  // --- Запис на тату ---
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingForm, setBookingForm] = useState({ 
    name: "", 
    phone: "", 
    date: "", 
    time: "", 
    description: "" 
  });

  const handleAddReview = () => {
    setShowReviewModal(true);
    setReviewForm({ avatar: "", text: "", stars: 5 });
  };

  const handleReviewFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setReviewForm(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  // --- handle stars for modal ---
  const handleStarChange = (v: number) => {
    setReviewForm(prev => ({ ...prev, stars: v }));
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const avatar = reviewForm.avatar || "https://api.builder.io/api/v1/image/assets/TEMP/50539832474100cc93c13a30455d91939b986e3b?width=124";
    const text = reviewForm.text.trim();
    const stars = reviewForm.stars > 0 ? reviewForm.stars : 5;
    if (!text) return;
    
    
    
    try {
      await addReview({ avatar, text, stars });
      setShowReviewModal(false);
      setReviewForm({ avatar: "", text: "", stars: 5 });
    } catch (err) {
      console.error('Failed to add review:', err);
    }
  };

  // Додаємо ефект скролу для помаранчевого овалу (тільки для десктопу)
  useEffect(() => {
    const handleScroll = () => {
      const navFrame = document.querySelector('.nav-frame') as HTMLElement;
      if (navFrame && window.innerWidth >= 768) { // Тільки для десктопу (md and up)
        // Встановлюємо фіксовану позицію, щоб хедер був видимий на всіх блоках сайту
        navFrame.style.position = 'fixed';
        navFrame.style.top = '55px';
        navFrame.style.left = '50%';
        navFrame.style.transform = 'translateX(-50%)';
        navFrame.style.marginLeft = '40px';
        navFrame.style.zIndex = '100';
        // Переконуємося, що хедер завжди видимий
        navFrame.style.display = 'flex';
      }
    };

    const handleResize = () => {
      const navFrame = document.querySelector('.nav-frame') as HTMLElement;
      if (navFrame) {
        if (window.innerWidth < 768) {
          // На мобільних пристроях приховуємо хедер
          navFrame.style.display = 'none';
        } else {
          // На десктопі показуємо хедер
          navFrame.style.display = 'flex';
          handleScroll();
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleResize);
    handleResize(); // Викликаємо одразу для встановлення початкової позиції
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          message: formData.message
        }),
      });

      const data = await res.json();

      if (data.success) {
        alert("✅ Повідомлення надіслано!");
        setFormData({ name: "", phone: "", message: "" });
        setShowSubmitButton(false);
      } else {
        console.error("Помилка:", data.message);
        alert("❌ Помилка: " + data.message);
      }
    } catch (err) {
      console.error("Помилка запиту:", err);
      alert("❌ Помилка запиту: " + err);
    }

  };

  const handleBookingFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setBookingForm(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
  const response = await fetch('/api/booking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingForm)
      });
      
  const data: BookingResponse = await response.json();
      
      if (data.success) {
        alert("✅ Заявку відправлено!");
        // Очищаємо форму
        setBookingForm({ name: '', phone: '', date: '', time: '', description: '' });
        setShowBookingModal(false);
      } else {
        alert("❌ Помилка: " + data.message);
      }
    } catch (error) {
      console.error('Error submitting booking form:', error);
      alert('Помилка створення запису. Спробуйте пізніше.');
    }
  };



  return (
    <div
      className="min-h-screen bg-tattoo-dark text-tattoo-light"
      style={{ overflow: "hidden" }}
    >
      {/* Hero Section */}
      <section className="relative min-h-screen lg:h-[1024px] overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center">
          <video 
            ref={activeVideoRef}
            className="absolute inset-0 w-full h-full object-cover video-background"
            autoPlay 
            muted 
            loop 
            playsInline
          >
            <source src="/videos/video1.mp4" type="video/mp4" />
          </video>
        </div>
        <div className="absolute inset-0 bg-gradient-radial from-transparent to-black/40" />

        {/* Navigation - Desktop Only (md and up) */}
        <nav className="hidden md:flex relative z-10 justify-between items-center px-4 sm:px-8 md:px-16 lg:px-[86px] pt-[30px] sm:pt-[40px] lg:pt-[50px]">
          <div className="flex-1">
            <img
              src="https://api.builder.io/api/v1/image/assets/TEMP/a8b141c5ff34790a508b1bfbea52de61237d467f?width=168"
              alt="Garyacha Golka Logo"
              className="w-[60px] h-[42px] sm:w-[70px] sm:h-[49px] lg:w-[84px] lg:h-[59px] rounded-[22px]"
            />
          </div>

          {/* Centered Orange Navigation Frame - Desktop Only (md and up) */}
          <div className="nav-frame hidden md:flex items-center justify-center bg-tattoo-orange-light rounded-[22px] shadow-[0_4px_12px_0_rgba(0,0,0,0.10)] w-[90%] max-w-[622px] h-[55px] group z-50" style={{ position: 'fixed', left: '50%', transform: 'translateX(-50%)', top: '55px', padding: '0 20px' }}>
            <img 
              src="https://api.builder.io/api/v1/image/assets/TEMP/2ed533b3383dfc6b14afae701f34cb392281b110?width=1214" 
              alt="Navigation icons" 
              className="h-[55px] w-auto cursor-pointer" 
              useMap="#navigation-map"
            />
            <map name="navigation-map">
              <area 
                shape="rect" 
                coords="10,0,103,55" 
                onClick={() => {
                  const section = document.querySelector('section');
                  if (section) section.scrollIntoView({ behavior: 'smooth' });
                }}
                title="Головна"
                className="cursor-pointer"
              />
              <area 
                shape="rect" 
                coords="103,0,206,55" 
                onClick={() => {
                  const section = document.getElementById('why-us');
                  if (section) section.scrollIntoView({ behavior: 'smooth' });
                }}
                title="Чому саме ми"
                className="cursor-pointer"
              />
              <area 
                shape="rect" 
                coords="206,0,309,55" 
                onClick={() => {
                  const section = document.getElementById('works');
                  if (section) section.scrollIntoView({ behavior: 'smooth' });
                }}
                title="Наші роботи"
                className="cursor-pointer"
              />
              <area 
                shape="rect" 
                coords="309,0,412,55" 
                onClick={() => {
                  const section = document.getElementById('about');
                  if (section) section.scrollIntoView({ behavior: 'smooth' });
                }}
                title="Про нас"
                className="cursor-pointer"
              />
              <area 
                shape="rect" 
                coords="412,0,515,55" 
                onClick={() => {
                  const section = document.getElementById('reviews');
                  if (section) section.scrollIntoView({ behavior: 'smooth' });
                }}
                title="Відгуки"
                className="cursor-pointer"
              />
              <area 
                shape="rect" 
                coords="515,0,612,55" 
                onClick={() => {
                  const section = document.getElementById('contacts');
                  if (section) section.scrollIntoView({ behavior: 'smooth' });
                }}
                title="Контакти"
                className="cursor-pointer"
              />
            </map>
            {/* Tooltip container */}
            <div className="absolute opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black text-white text-xs rounded py-1 px-2 -bottom-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap pointer-events-none" id="nav-tooltip">
              Навігація
            </div>
          </div>
        </nav>

        {/* Mobile Navigation - Logo and Hamburger Menu (767px and below) */}
        <div className="md:hidden fixed top-4 left-0 right-0 z-50 flex justify-between items-center px-4">
          {/* Logo */}
          <div>
                          <img
                src="https://api.builder.io/api/v1/image/assets/TEMP/a8b141c5ff34790a508b1bfbea52de61237d467f?width=168"
                alt="Garyacha Golka Logo"
                className="w-[75px] h-[52px] rounded-[18px]"
              />
          </div>
          
          {/* Hamburger Menu */}
          <button 
            className="text-tattoo-light p-2 bg-tattoo-dark/80 rounded-lg backdrop-blur-sm hover:bg-tattoo-dark/90 transition-all duration-200 hover:scale-105 active:scale-95 z-50"
            onClick={() => {
              console.log('Hamburger menu clicked, current state:', isMobileMenuOpen);
              setIsMobileMenuOpen(!isMobileMenuOpen);
            }}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Mobile Menu Dropdown (767px and below) */}
        {isMobileMenuOpen && (
          <div className="md:hidden fixed top-0 left-0 w-[85%] h-full bg-tattoo-dark z-[9999] mobile-menu-overlay mobile-menu-enter">
            <div className="flex justify-end p-4">
              <button 
                className="text-white p-2 hover:bg-tattoo-orange-light/20 rounded-lg transition-all duration-200 hover:scale-110 active:scale-95"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex flex-col px-6 space-y-6">
              <a href="#home" className="mobile-menu-item flex items-center space-x-3 text-white font-open-sans text-lg py-3 border-b border-gray-600" onClick={() => setIsMobileMenuOpen(false)}>
                <div className="w-2 h-2 bg-gray-400 transform rotate-45"></div>
                <span className="font-bold">Головна</span>
              </a>
              <a href="#why-us" className="mobile-menu-item flex items-center space-x-3 text-gray-300 font-open-sans text-lg py-3 border-b border-gray-600" onClick={() => setIsMobileMenuOpen(false)}>
                <div className="w-2 h-2 bg-gray-400 transform rotate-45"></div>
                <span>Чому ми</span>
              </a>
              <a href="#works" className="mobile-menu-item flex items-center space-x-3 text-gray-300 font-open-sans text-lg py-3 border-b border-gray-600" onClick={() => setIsMobileMenuOpen(false)}>
                <div className="w-2 h-2 bg-gray-400 transform rotate-45"></div>
                <span>Роботи</span>
              </a>
              <a href="#about" className="mobile-menu-item flex items-center space-x-3 text-gray-300 font-open-sans text-lg py-3 border-b border-gray-600" onClick={() => setIsMobileMenuOpen(false)}>
                <div className="w-2 h-2 bg-gray-400 transform rotate-45"></div>
                <span>Про нас</span>
              </a>
              <a href="#reviews" className="mobile-menu-item flex items-center space-x-3 text-gray-300 font-open-sans text-lg py-3 border-b border-gray-600" onClick={() => setIsMobileMenuOpen(false)}>
                <div className="w-2 h-2 bg-gray-400 transform rotate-45"></div>
                <span>Відгуки</span>
              </a>
              <a href="#contacts" className="mobile-menu-item flex items-center space-x-3 text-gray-300 font-open-sans text-lg py-3 border-b border-gray-600" onClick={() => setIsMobileMenuOpen(false)}>
                <div className="w-2 h-2 bg-gray-400 transform rotate-45"></div>
                <span>Контакти</span>
              </a>
            </div>
          </div>
        )}

        {/* Hero Content - Different positioning for mobile vs desktop */}
        <div className="relative z-10 px-4 sm:px-8 md:px-16 lg:px-[86px]">
          {/* Mobile Button (767px and below) - Centered */}
          <div className="md:hidden flex justify-center items-center" style={{ marginTop: 'calc(60vh + 100px)' }}>
            <Button 
              onClick={() => {
                const contactsSection = document.getElementById('contacts');
                if (contactsSection) {
                  contactsSection.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="mobile-button bg-tattoo-primary hover:bg-tattoo-primary/90 text-[#E7E6E6] font-montserrat font-semibold text-xl leading-4 tracking-[0px] px-8 py-4 rounded-[22px] h-auto"
            >
              Записатись
            </Button>
          </div>

          {/* Desktop Button (768px and up) - Original positioning */}
          <div className="hidden md:block mt-[300px] sm:mt-[400px] md:mt-[500px] lg:mt-[564px]">
            <Button 
              onClick={() => {
                const contactsSection = document.getElementById('contacts');
                if (contactsSection) {
                  contactsSection.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="bg-tattoo-primary hover:bg-tattoo-primary/90 text-[#E7E6E6] font-montserrat font-semibold text-lg sm:text-xl lg:text-2xl leading-4 tracking-[0px] px-6 sm:px-8 lg:px-[50px] py-3 sm:py-4 lg:py-[20px] rounded-[22px] h-auto"
            >
              Записатись
            </Button>
          </div>
        </div>

        {/* Side Cards - Desktop Only (1536px+) */}
        <div data-cards="desktop-only" className="hidden 2xl:block absolute right-[55px] top-[279px] space-y-6 sm:hidden md:hidden lg:hidden">
          {blocks.map((block) => {
            // Показуємо тільки блоки з позиціями 0, 1, 2 (не показуємо блок, який зараз на фоні)
            if (block.position === 3) return null;
            
            // Розраховуємо відступ для кожного блоку, щоб запобігти накладанню
            const topOffset = block.position * 6; // Невеликий відступ для кожної позиції
            
            return (
              <div
                key={block.id}
                className={`w-[299px] h-[134px] rounded-[22px] bg-tattoo-orange-light shadow-[0_4px_12px_0_rgba(0,0,0,0.10)] p-[7px] flex gap-[7px] cursor-pointer interactive-block 
                  ${activeBlockIndex === block.id ? 'active' : ''} 
                  ${block.animationClass || ''}`}
                onClick={() => handleBlockClick(block.id)}
                style={{
                  position: 'absolute',
                  top: block.position === 0 ? '0px' : block.position === 1 ? '140px' : '280px',
                  right: '0px',
                  marginTop: `${topOffset}px`,
                  zIndex: 10 - block.position,
                  transition: 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                }}
              >
                <img 
                  src={block.image} 
                  alt="Tattoo" 
                  className="w-[140px] h-[120px] rounded-[15px] object-cover" 
                />
                <p className="text-black font-open-sans font-bold text-lg leading-[21px] tracking-[-0.72px] p-2 w-[138px]" style={{ textShadow: '0px 0px 2px rgba(255, 255, 255, 0.7)' }}>
                  {block.text}
                </p>
              </div>
            );
          })}
        </div>

        {/* Side Cards - Tablet (768-1023px) - Vertical Layout */}
        <div data-cards="tablet" className="hidden md:flex lg:hidden absolute right-4 sm:right-8 md:right-16 lg:right-8 top-[150px] sm:hidden">
          <div className="flex flex-col gap-2 w-full">
          {blocks.map((block) => {
            // Показуємо тільки блоки з позиціями 0, 1, 2 (не показуємо блок, який зараз на фоні)
            if (block.position === 3) return null;
            
            return (
              <div
                key={`tablet-${block.id}`}
                className={`w-[299px] h-[134px] rounded-[22px] bg-tattoo-orange-light shadow-[0_4px_12px_0_rgba(0,0,0,0.10)] p-[7px] flex gap-[7px] cursor-pointer interactive-block 
                  ${activeBlockIndex === block.id ? 'active' : ''} 
                  ${block.animationClass || ''}`}
                onClick={() => handleBlockClick(block.id)}
                style={{
                  transition: 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                }}
              >
                <img 
                  src={block.image} 
                  alt="Tattoo" 
                  className="w-[140px] h-[120px] rounded-[15px] object-cover flex-shrink-0" 
                />
                <p className="text-black font-open-sans font-bold text-lg leading-[21px] tracking-[-0.72px] p-2 flex-1" style={{ textShadow: '0px 0px 2px rgba(255, 255, 255, 0.7)' }}>
                  {block.text}
                </p>
              </div>
            );
          })}
          </div>
        </div>

        {/* Side Cards - Desktop (1024-1535px) - Vertical Layout */}
        <div data-cards="desktop" className="hidden lg:flex 2xl:hidden absolute right-4 sm:right-8 md:right-16 lg:right-8 top-[150px] sm:hidden md:hidden">
          <div className="flex flex-col gap-2 w-full">
          {blocks.map((block) => {
            // Показуємо тільки блоки з позиціями 0, 1, 2 (не показуємо блок, який зараз на фоні)
            if (block.position === 3) return null;
            
            return (
              <div
                key={`desktop-${block.id}`}
                className={`w-[299px] h-[134px] rounded-[22px] bg-tattoo-orange-light shadow-[0_4px_12px_0_rgba(0,0,0,0.10)] p-[7px] flex gap-[7px] cursor-pointer interactive-block 
                  ${activeBlockIndex === block.id ? 'active' : ''} 
                  ${block.animationClass || ''}`}
                onClick={() => handleBlockClick(block.id)}
                style={{
                  transition: 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                }}
              >
                <img 
                  src={block.image} 
                  alt="Tattoo" 
                  className="w-[140px] h-[120px] rounded-[15px] object-cover flex-shrink-0" 
                />
                <p className="text-black font-open-sans font-bold text-lg leading-[21px] tracking-[-0.72px] p-2 flex-1" style={{ textShadow: '0px 0px 2px rgba(255, 255, 255, 0.7)' }}>
                  {block.text}
                </p>
              </div>
            );
          })}
          </div>
        </div>

                  {/* Side Cards - Mobile Only (< 768px) - Horizontal Layout */}
          <div data-cards="mobile" className="hidden absolute top-20 left-4 right-4 z-10">
            <AutoScrollRow speed={0.8}>
              {blocks.map((block) => {
                // Показуємо тільки блоки з позиціями 0, 1, 2 (не показуємо блок, який зараз на фоні)
                if (block.position === 3) return null;
                
                return (
                  <div
                    key={`mobile-${block.id}`}
                    className={`flex-shrink-0 w-[280px] h-[140px] rounded-[16px] bg-tattoo-orange-light shadow-[0_4px_12px_0_rgba(0,0,0,0.10)] p-[4px] flex gap-[4px] cursor-pointer interactive-block hover:shadow-[0_6px_20px_0_rgba(0,0,0,0.15)] hover:scale-105 active:scale-95 transition-all duration-300
                      ${activeBlockIndex === block.id ? 'active' : ''} 
                      ${block.animationClass || ''}`}
                    onClick={() => handleBlockClick(block.id)}
                    style={{
                      transition: 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                    }}
                  >
                                      <img 
                    src={block.image} 
                    alt="Tattoo" 
                    className="w-[110px] h-[110px] rounded-[8px] object-cover flex-shrink-0" 
                    style={{ 
                      maxWidth: '110px', 
                      maxHeight: '110px', 
                      minWidth: '110px', 
                      minHeight: '110px',
                      margin: '7px'
                    }}
                  />
                    <p className="text-black font-open-sans font-bold text-base leading-[18px] tracking-[-0.64px] p-1 flex-1" style={{ textShadow: '0px 0px 2px rgba(255, 255, 255, 0.7)' }}>
                      {block.text}
                    </p>
                  </div>
                );
              })}
            </AutoScrollRow>
          </div>





        {/* Stats */}
        <div className="absolute bottom-0 left-0 right-0 bg-tattoo-dark h-[100px] sm:h-[120px] md:h-[140px] lg:h-[158px] flex items-center justify-between px-4 sm:px-8 md:px-16 lg:px-[301px]">
          <div className="text-left md:ml-[30px] lg:ml-[50px] min-w-0 flex-1 lg:flex-none">
            <h3 className="text-[#E7E6E6] font-open-sans font-semibold text-sm sm:text-base md:text-xl lg:text-[26px] leading-4 tracking-[0.52px] mb-2 sm:mb-4 md:mb-6 lg:mb-[37px] lg:text-left">Нас обрало 200+ людей</h3>
            <p className="text-[#E7E6E6] font-open-sans font-semibold text-sm sm:text-base md:text-xl lg:text-[26px] leading-4 tracking-[0.52px] lg:text-left">Ми працюємо з 2023</p>
          </div>
          <div className="text-center flex flex-col items-center gap-2 sm:gap-3 md:gap-4 lg:gap-[19px] lg:mt-[37px] ml-8 sm:ml-12 md:ml-16 lg:ml-24">
            <div className="text-[#E7E6E6] font-open-sans font-semibold text-2xl sm:text-3xl md:text-4xl lg:text-[60px] leading-4 tracking-[0px]">{averageRating}</div>
            <p className="text-white font-open-sans font-light text-xs sm:text-sm md:text-base lg:text-lg leading-[25px] tracking-[0.18px] w-[80px] sm:w-[100px] md:w-[120px] lg:w-[131px] text-center">Наша оцінка</p>
            <p className="text-white font-open-sans font-light text-xs sm:text-xs md:text-sm lg:text-sm leading-[18px] tracking-[0.14px] opacity-80 lg:mt-[-8px]" style={{ marginTop: "-8px" }}>({reviewsCount} відгуків)</p>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section id="why-us" className="pt-[40px] sm:pt-[50px] md:pt-[60px] lg:pt-[64px] px-4 sm:px-8 md:px-16 lg:px-8 xl:px-16">
                <div className="max-w-4xl mx-auto">
          <h2 className="font-cormorant font-bold text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-tattoo-light mb-[20px] sm:mb-[30px] lg:mb-[40px] text-center">
          Чому саме ми
        </h2>

          <div className="flex flex-col md:flex-row gap-4 sm:gap-6 md:gap-8 lg:gap-12 xl:gap-16 items-center md:items-start justify-center">
          <div className="w-full max-w-[300px] sm:max-w-[350px] md:max-w-[400px] lg:w-[407px] h-[200px] sm:h-[240px] md:h-[270px] lg:h-[292px] rounded-[22px] bg-tattoo-card shadow-[0_4px_12px_0_rgba(0,0,0,0.10)] flex items-center justify-center p-8 sm:p-12 md:p-16 lg:p-[78px]">
            <img
              src="https://api.builder.io/api/v1/image/assets/TEMP/cf5ec56ac39677b40517dac5c0a3b03f4768237b?width=502"
              alt="Tattoo tools"
              className="w-[150px] h-[150px] sm:w-[180px] sm:h-[180px] md:w-[220px] md:h-[220px] lg:w-[251px] lg:h-[251px] object-contain"
            />
          </div>

            <div className="flex-1 space-y-2 leading-normal text-lg w-full max-w-[500px] lg:max-w-none xl:max-w-none">
                          <div>
                <h3 className="font-cormorant font-semibold text-lg sm:text-xl md:text-2xl lg:text-[30px] text-tattoo-light mb-2 sm:mb-3 md:mb-[7px] lg:mb-[8px] text-center md:text-left lg:text-left xl:text-left">Безпека</h3>
                <p className="font-open-sans text-sm sm:text-base md:text-sm lg:text-xs text-tattoo-light leading-5 sm:leading-6 lg:leading-3 max-w-[400px] mx-auto md:mx-0 lg:mx-0 xl:mx-0 text-center md:text-left lg:text-left xl:text-left">Мастер використовує тільки стерільні інструменти та надає повну інструкцію для загоєння тату</p>
              </div>

              <div>
                <h3 className="font-cormorant font-semibold text-lg sm:text-xl md:text-2xl lg:text-[30px] text-tattoo-light mb-2 sm:mb-3 md:mb-[7px] lg:mb-[8px] text-center md:text-left lg:text-left xl:text-left">Якість</h3>
                <p className="font-open-sans text-sm sm:text-base md:text-sm lg:text-xs text-tattoo-light leading-5 sm:leading-6 lg:leading-3 max-w-[400px] mx-auto md:mx-0 lg:mx-0 xl:mx-0 text-center md:text-left lg:text-left xl:text-left">Ми використовуємо виключно преміальні матеріали, та найкращі техніки татуювання</p>
              </div>

              <div>
                <h3 className="font-cormorant font-semibold text-lg sm:text-xl md:text-2xl lg:text-[30px] text-tattoo-light mb-2 sm:mb-3 md:mb-[7px] lg:mb-[8px] text-center md:text-left lg:text-left xl:text-left">Стиль</h3>
                <p className="font-open-sans text-sm sm:text-base md:text-sm lg:text-xs text-tattoo-light leading-5 sm:leading-6 lg:leading-3 max-w-[400px] mx-auto md:mx-0 lg:mx-0 xl:mx-0 text-center md:text-left lg:text-left xl:text-left">Трайбл, неотрайбл, олд скул, треш полька, чикано, японія, флористика, аніме, графіка</p>
              </div>

              <div>
                <h3 className="font-cormorant font-semibold text-lg sm:text-xl md:text-2xl lg:text-[30px] text-tattoo-light mb-2 sm:mb-3 md:mb-[7px] lg:mb-[8px] text-center md:text-left lg:text-left xl:text-left">Розробка ескізів</h3>
                <p className="font-open-sans text-sm sm:text-base md:text-sm lg:text-xs text-tattoo-light leading-5 sm:leading-6 lg:leading-3 max-w-[400px] mx-auto md:mx-0 lg:mx-0 xl:mx-0 text-center md:text-left lg:text-left xl:text-left">Ми розробляємо ескізи понад 3 роки — і ще жодного негативного відгуку</p>
            </div>
              </div>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section id="works" className="bg-tattoo-dark py-[40px] sm:py-[50px] md:py-[60px] lg:py-[82px] px-4 sm:px-8 md:px-16 lg:px-8 xl:px-16 pt-[40px] sm:pt-[50px] md:pt-[60px] lg:pt-[64px]">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-cormorant font-bold text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-tattoo-light mb-[20px] sm:mb-[30px] lg:mb-[40px] text-center">Наші роботи</h2>

          <div className="w-full max-w-4xl mx-auto">
          {/* Модульна галерея як в оригі��альному дизайні */}
          <div className="hidden 2xl:block">
            {/* Перший ряд - вирівняно по верху, фото "вилазять" на різну висоту */}
            <div className="flex gap-[24px] mb-[-52px] items-start">
              <img src="https://api.builder.io/api/v1/image/assets/TEMP/7bf5d6b88d00b3a14f3dd477fca48fafc969fdb9?width=814" alt="Tattoo work" className="w-[407px] h-[371px] object-cover" />
              <img src="https://api.builder.io/api/v1/image/assets/TEMP/c8139526398390e5c9068377e35bc80e915a6cd8?width=382" alt="Tattoo work" className="w-[191px] h-[292px] object-cover" />
              <img src="https://api.builder.io/api/v1/image/assets/TEMP/ce63a58850de289f84ee0b1df9667b61ef387d74?width=382" alt="Tattoo work" className="w-[191px] h-[292px] object-cover" />
            </div>

            {/* Другий ряд - вирівняно по низу, фото "вилазять" вгору */}
            <div className="flex gap-[24px] mb-[24px] items-end">
              <img src="https://api.builder.io/api/v1/image/assets/TEMP/f33e9b71494e16c52531fa71493e53c483e30d43?width=382" alt="Tattoo work" className="w-[191px] h-[292px] object-cover" />
              <img src="https://api.builder.io/api/v1/image/assets/TEMP/f6d3175f695a7c537d71e2515dae222595f1e024?width=382" alt="Tattoo work" className="w-[191px] h-[292px] object-cover" />
              <img src="https://api.builder.io/api/v1/image/assets/TEMP/9a31716473ebbd3780c2dc4f280d4e029167daeb?width=814" alt="Tattoo work" className="w-[407px] h-[371px] object-cover" />
            </div>

            {/* Третій ряд - однакова висота */}
            <div className="flex gap-[24px]">
              <img src="https://api.builder.io/api/v1/image/assets/TEMP/b366a598ef34fe1447b9bd3fc9e842d33bd44b51?width=814" alt="Tattoo work" className="w-[407px] h-[213px] object-cover" />
              <img src="https://api.builder.io/api/v1/image/assets/TEMP/b134efed15cbc04674051d948bb1dc8872e83885?width=812" alt="Tattoo work" className="w-[406px] h-[213px] object-cover" />
            </div>
          </div>

          {/* Mobile/Tablet Gallery - Responsive Grid Layout */}
          <div className="2xl:hidden">
            {/* Mobile Gallery */}
                          <div className="lg:hidden grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="relative w-full h-[200px] rounded-lg overflow-hidden">
                  <div className="absolute inset-0 bg-cover bg-center blur-xl" style={{ backgroundImage: `url(https://api.builder.io/api/v1/image/assets/TEMP/7bf5d6b88d00b3a14f3dd477fca48fafc969fdb9?width=814)` }}></div>
                  <img src="https://api.builder.io/api/v1/image/assets/TEMP/7bf5d6b88d00b3a14f3dd477fca48fafc969fdb9?width=814" alt="Tattoo work" className="relative w-full h-full object-contain z-10" />
                </div>
                <div className="relative w-full h-[200px] rounded-lg overflow-hidden">
                  <div className="absolute inset-0 bg-cover bg-center blur-xl" style={{ backgroundImage: `url(https://api.builder.io/api/v1/image/assets/TEMP/c8139526398390e5c9068377e35bc80e915a6cd8?width=382)` }}></div>
                  <img src="https://api.builder.io/api/v1/image/assets/TEMP/c8139526398390e5c9068377e35bc80e915a6cd8?width=382" alt="Tattoo work" className="relative w-full h-full object-contain z-10" />
                </div>
                <div className="relative w-full h-[200px] rounded-lg overflow-hidden">
                  <div className="absolute inset-0 bg-cover bg-center blur-xl" style={{ backgroundImage: `url(https://api.builder.io/api/v1/image/assets/TEMP/ce63a58850de289f84ee0b1df9667b61ef387d74?width=382)` }}></div>
                  <img src="https://api.builder.io/api/v1/image/assets/TEMP/ce63a58850de289f84ee0b1df9667b61ef387d74?width=382" alt="Tattoo work" className="relative w-full h-full object-contain z-10" />
                </div>
                <div className="relative w-full h-[200px] rounded-lg overflow-hidden">
                  <div className="absolute inset-0 bg-cover bg-center blur-xl" style={{ backgroundImage: `url(https://api.builder.io/api/v1/image/assets/TEMP/f33e9b71494e16c52531fa71493e53c483e30d43?width=382)` }}></div>
                  <img src="https://api.builder.io/api/v1/image/assets/TEMP/f33e9b71494e16c52531fa71493e53c483e30d43?width=382" alt="Tattoo work" className="relative w-full h-full object-contain z-10" />
                </div>
                <div className="relative w-full h-[200px] rounded-lg overflow-hidden">
                  <div className="absolute inset-0 bg-cover bg-center blur-xl" style={{ backgroundImage: `url(https://api.builder.io/api/v1/image/assets/TEMP/f6d3175f695a7c537d71e2515dae222595f1e024?width=382)` }}></div>
                  <img src="https://api.builder.io/api/v1/image/assets/TEMP/f6d3175f695a7c537d71e2515dae222595f1e024?width=382" alt="Tattoo work" className="relative w-full h-full object-contain z-10" />
                </div>
                <div className="relative w-full h-[200px] rounded-lg overflow-hidden">
                  <div className="absolute inset-0 bg-cover bg-center blur-xl" style={{ backgroundImage: `url(https://api.builder.io/api/v1/image/assets/TEMP/9a31716473ebbd3780c2dc4f280d4e029167daeb?width=814)` }}></div>
                  <img src="https://api.builder.io/api/v1/image/assets/TEMP/9a31716473ebbd3780c2dc4f280d4e029167daeb?width=814" alt="Tattoo work" className="relative w-full h-full object-contain z-10" />
                </div>
                <div className="relative w-full h-[200px] rounded-lg overflow-hidden">
                  <div className="absolute inset-0 bg-cover bg-center blur-xl" style={{ backgroundImage: `url(https://api.builder.io/api/v1/image/assets/TEMP/b366a598ef34fe1447b9bd3fc9e842d33bd44b51?width=814)` }}></div>
                  <img src="https://api.builder.io/api/v1/image/assets/TEMP/b366a598ef34fe1447b9bd3fc9e842d33bd44b51?width=814" alt="Tattoo work" className="relative w-full h-full object-contain z-10" />
                </div>
                <div className="relative w-full h-[200px] rounded-lg overflow-hidden">
                  <div className="absolute inset-0 bg-cover bg-center blur-xl" style={{ backgroundImage: `url(https://api.builder.io/api/v1/image/assets/TEMP/b134efed15cbc04674051d948bb1dc8872e83885?width=812)` }}></div>
                  <img src="https://api.builder.io/api/v1/image/assets/TEMP/b134efed15cbc04674051d948bb1dc8872e83885?width=812" alt="Tattoo work" className="relative w-full h-full object-contain z-10" />
                </div>
              </div>

            {/* Tablet/Desktop Gallery (1024-1536px) - Modular Layout */}
            <div className="hidden lg:block">
              {/* First Row - Modular layout with varying heights */}
              <div className="flex gap-4 mb-4">
                <div className="relative w-2/3 h-[280px] rounded-lg overflow-hidden">
                  <div className="absolute inset-0 bg-cover bg-center blur-xl" style={{ backgroundImage: `url(https://api.builder.io/api/v1/image/assets/TEMP/7bf5d6b88d00b3a14f3dd477fca48fafc969fdb9?width=814)` }}></div>
                  <img src="https://api.builder.io/api/v1/image/assets/TEMP/7bf5d6b88d00b3a14f3dd477fca48fafc969fdb9?width=814" alt="Tattoo work" className="relative w-full h-full object-contain z-10" />
                </div>
                <div className="relative w-1/3 h-[280px] rounded-lg overflow-hidden">
                  <div className="absolute inset-0 bg-cover bg-center blur-xl" style={{ backgroundImage: `url(https://api.builder.io/api/v1/image/assets/TEMP/c8139526398390e5c9068377e35bc80e915a6cd8?width=382)` }}></div>
                  <img src="https://api.builder.io/api/v1/image/assets/TEMP/c8139526398390e5c9068377e35bc80e915a6cd8?width=382" alt="Tattoo work" className="relative w-full h-full object-contain z-10" />
                </div>
              </div>

              {/* Second Row - Modular layout with varying heights */}
              <div className="flex gap-4 mb-4">
                <div className="relative w-1/3 h-[200px] rounded-lg overflow-hidden">
                  <div className="absolute inset-0 bg-cover bg-center blur-xl" style={{ backgroundImage: `url(https://api.builder.io/api/v1/image/assets/TEMP/ce63a58850de289f84ee0b1df9667b61ef387d74?width=382)` }}></div>
                  <img src="https://api.builder.io/api/v1/image/assets/TEMP/ce63a58850de289f84ee0b1df9667b61ef387d74?width=382" alt="Tattoo work" className="relative w-full h-full object-contain z-10" />
                </div>
                <div className="relative w-1/3 h-[200px] rounded-lg overflow-hidden">
                  <div className="absolute inset-0 bg-cover bg-center blur-xl" style={{ backgroundImage: `url(https://api.builder.io/api/v1/image/assets/TEMP/f33e9b71494e16c52531fa71493e53c483e30d43?width=382)` }}></div>
                  <img src="https://api.builder.io/api/v1/image/assets/TEMP/f33e9b71494e16c52531fa71493e53c483e30d43?width=382" alt="Tattoo work" className="relative w-full h-full object-contain z-10" />
                </div>
                <div className="relative w-1/3 h-[200px] rounded-lg overflow-hidden">
                  <div className="absolute inset-0 bg-cover bg-center blur-xl" style={{ backgroundImage: `url(https://api.builder.io/api/v1/image/assets/TEMP/f6d3175f695a7c537d71e2515dae222595f1e024?width=382)` }}></div>
                  <img src="https://api.builder.io/api/v1/image/assets/TEMP/f6d3175f695a7c537d71e2515dae222595f1e024?width=382" alt="Tattoo work" className="relative w-full h-full object-contain z-10" />
                </div>
              </div>

              {/* Third Row - Modular layout */}
              <div className="flex gap-4">
                <div className="relative w-1/2 h-[240px] rounded-lg overflow-hidden">
                  <div className="absolute inset-0 bg-cover bg-center blur-xl" style={{ backgroundImage: `url(https://api.builder.io/api/v1/image/assets/TEMP/9a31716473ebbd3780c2dc4f280d4e029167daeb?width=814)` }}></div>
                  <img src="https://api.builder.io/api/v1/image/assets/TEMP/9a31716473ebbd3780c2dc4f280d4e029167daeb?width=814" alt="Tattoo work" className="relative w-full h-full object-contain z-10" />
                </div>
                <div className="relative w-1/2 h-[240px] rounded-lg overflow-hidden">
                  <div className="absolute inset-0 bg-cover bg-center blur-xl" style={{ backgroundImage: `url(https://api.builder.io/api/v1/image/assets/TEMP/b366a598ef34fe1447b9bd3fc9e842d33bd44b51?width=814)` }}></div>
                  <img src="https://api.builder.io/api/v1/image/assets/TEMP/b366a598ef34fe1447b9bd3fc9e842d33bd44b51?width=814" alt="Tattoo work" className="relative w-full h-full object-contain z-10" />
                </div>
              </div>

              {/* Fourth Row - Single large image */}
              <div className="mt-4">
                <div className="relative w-full h-[200px] rounded-lg overflow-hidden">
                  <div className="absolute inset-0 bg-cover bg-center blur-xl" style={{ backgroundImage: `url(https://api.builder.io/api/v1/image/assets/TEMP/b134efed15cbc04674051d948bb1dc8872e83885?width=812)` }}></div>
                  <img src="https://api.builder.io/api/v1/image/assets/TEMP/b134efed15cbc04674051d948bb1dc8872e83885?width=812" alt="Tattoo work" className="relative w-full h-full object-contain z-10" />
                </div>
              </div>
            </div>
          </div>
          </div>
        </div>
      </section>

      {/* About Artist Section */}
      <section id="about" className="bg-tattoo-dark py-[40px] sm:py-[50px] md:py-[60px] lg:py-[82px] px-4 sm:px-8 md:px-16 lg:px-8 xl:px-16 pt-[40px] sm:pt-[50px] md:pt-[60px] lg:pt-[64px]">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-cormorant font-bold text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-tattoo-light mb-[20px] sm:mb-[30px] lg:mb-[40px] text-center">
          Про майстра
        </h2>

        <div className="w-full max-w-[1200px] mx-auto bg-tattoo-card rounded-[32px] shadow-[0_4px_24px_0_rgba(0,0,0,0.15)] p-6 sm:p-8 md:p-12 lg:p-[100px]">
          <div className="md:flex md:items-start gap-8 lg:gap-16">
            <div className="md:flex-shrink-0">
            <img
              src="https://api.builder.io/api/v1/image/assets/TEMP/f265ff5e73d48434a6a1a7c106bd975fc7e5ce90?width=814"
              alt="Галина Попович"
                className="w-full max-w-[200px] sm:max-w-[250px] md:max-w-[300px] lg:max-w-[350px] h-auto object-cover rounded-[22px] mx-auto md:mx-0 md:mt-0"
            />
            </div>

            <div className="mt-4 md:mt-0 md:ml-6 flex-1 space-y-4 lg:space-y-6">
              <h3 className="text-xl font-bold text-tattoo-light text-center md:text-left">Попович Галина</h3>

              <p className="font-open-sans text-sm sm:text-base md:text-lg lg:text-lg text-tattoo-light leading-5 sm:leading-6 lg:leading-7 text-center md:text-left">
                Малювання це моє найулюбленіше заняття, я завжди малюю у вільний час. За життя я навчилась малювати в багатьох техніках і будь якими матеріалами. Наприклад: картини на холстах акрилом та маслом, графічні малюнки, простими або кольоровими олівцями.
              </p>

              <p className="font-open-sans text-sm sm:text-base md:text-lg lg:text-lg text-tattoo-light leading-5 sm:leading-6 lg:leading-7 text-center md:text-left">
                Окрім малювання займаюсь рукоділлям, роблю різноманітні елементи декору на замовлення, які прикрашають та роблять оселі людей затишними.
              </p>

              <p className="font-open-sans text-sm sm:text-base md:text-lg lg:text-lg text-tattoo-light leading-5 sm:leading-6 lg:leading-7 text-center md:text-left">
                Я обрала професію тату майстра тому, що для мене креативність та мистецтво — це більше ніж просто хоббі. Це сенс робити сірі будні кольоровими, за це я люблю свою роботу.
              </p>
            </div>
            </div>
          </div>
        </div>
      </section>

      {/* Client Reviews Section */}
      <section
        id="reviews"
        className="bg-tattoo-dark py-[40px] sm:py-[50px] md:py-[60px] lg:py-[108px] w-screen max-w-none pt-[40px] sm:pt-[50px] md:pt-[60px] lg:pt-[64px] overflow-x-hidden"
        style={{ marginLeft: "calc(50% - 50vw)", marginRight: "calc(50% - 50vw)" }}
      >
        <h2
          className="font-cormorant font-bold text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-tattoo-light mb-[20px] sm:mb-[30px] lg:mb-[40px] text-center lg:text-left xl:text-left lg:ml-[475px] xl:ml-[475px]"
        >
          Наші клієнти
        </h2>

        {/* Відгуки - 2 рядки, автоматичний горизонтальний скрол рядків, без "Залишити відгук" у стрічках */}
        <div className="flex flex-col gap-8 items-center">
          {/* Індикатор завантаження */}
          {reviewsLoading && (
            <div className="text-center text-tattoo-light mb-4">
              Завантаження відгуків...
            </div>
          )}
          
          {/* Помилка */}
          {reviewsError && (
            <div className="text-center text-red-400 mb-4">
              Помилка завантаження: {reviewsError}
            </div>
          )}
          
          {/* 1 ряд */}
          <AutoScrollRow speed={0.5}>
            {reviews1.map((r, i) => (
              <TestimonialCard key={i + r.text.slice(0, 10)} avatar={r.avatar} text={r.text} stars={r.stars} />
            ))}
          </AutoScrollRow>
          {/* 2 ряд */}
          <AutoScrollRow speed={0.3} reverse>
            {reviews2.map((r, i) => (
              <TestimonialCard key={i + r.text.slice(0, 10)} avatar={r.avatar} text={r.text} stars={r.stars} />
            ))}
          </AutoScrollRow>
          {/* Додати відгук кнопка */}
          <div className="mt-[12px]">
            <button
              className="font-open-sans text-[12px] leading-[15px] tracking-[-0.01em] text-tattoo-light opacity-80"
              style={{
                fontWeight: 400,
                letterSpacing: "-1%",
              }}
              onClick={handleAddReview}
            >
              Додати відгук
            </button>
          </div>
        </div>

        {/* Модалка для додавання відгуку */}
        {showReviewModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
            <form
              onSubmit={handleReviewSubmit}
              className="bg-transparent flex items-center justify-center"
              style={{ boxShadow: "none" }}
              encType="multipart/form-data"
            >
              <div
                className="rounded-[22px] w-[407px] h-[213px] flex flex-row p-6"
                style={{
                  minWidth: 407,
                  minHeight: 213,
                  maxWidth: 407,
                  maxHeight: 213,
                  background: "rgba(59,59,59,0.15)",
                  boxShadow: "0 4px 12px 0 rgba(0,0,0,0.10)"
                }}
                onPaste={e => {
                  const items = e.clipboardData.items;
                  for (let i = 0; i < items.length; i++) {
                    const item = items[i];
                    if (item.type.indexOf("image") !== -1) {
                      const file = item.getAsFile();
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (ev) => {
                          setReviewForm(prev => ({
                            ...prev,
                            avatar: ev.target?.result as string
                          }));
                        };
                        reader.readAsDataURL(file);
                        e.preventDefault();
                        break;
                      }
                    }
                  }
                }}
              >
                <div className="flex flex-col items-start flex-shrink-0" style={{ width: 62 }}>
                  {/* Фото завантаження */}
                  <label className="w-[62px] h-[55px] rounded-lg bg-tattoo-dark flex items-center justify-center cursor-pointer overflow-hidden border border-[#444] mb-0">
                    {reviewForm.avatar ? (
                      <img
                        src={reviewForm.avatar}
                        alt="avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span
                        className="text-[8px] text-tattoo-light opacity-60 text-center px-0.5 leading-tight"
                        style={{ wordBreak: "break-word", lineHeight: "1.1" }}
                      >
                        Завантажити фото
                      </span>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: "none" }}
                      required
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (ev) => {
                            setReviewForm(prev => ({
                              ...prev,
                              avatar: ev.target?.result as string
                            }));
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                  <div className="mt-[14px] mb-0 flex ml-0">
                    <InteractiveStarRating
                      count={5}
                      value={reviewForm.stars}
                      onChange={handleStarChange}
                    />
                  </div>
                </div>
                <div className="flex-1 flex flex-col ml-6">
                  <textarea
                    name="text"
                    value={reviewForm.text}
                    onChange={handleReviewFormChange}
                    className="text-tattoo-light font-open-sans text-sm lg:text-base leading-5 lg:leading-6 bg-transparent resize-none outline-none border border-[#444] rounded-[8px] p-2 flex-1"
                    placeholder="Ваш відгук"
                    required
                    style={{
                      minHeight: 60,
                      marginTop: 0,
                      marginBottom: 8,
                    }}
                  />
                </div>
              </div>
              <div
                className="w-full flex gap-4 justify-center absolute left-0 right-0"
                style={{ bottom: 310, marginTop: 0 }}
              >
                <button
                  type="button"
                  className="px-4 py-2 rounded-[14px] bg-gray-500 text-white text-base font-montserrat font-semibold"
                  onClick={() => setShowReviewModal(false)}
                  style={{
                    minWidth: 90,
                    fontSize: 14,
                    paddingTop: 6,
                    paddingBottom: 6,
                  }}
                >
                  Скасувати
                </button>
                <button
                  type="submit"
                  className="px-[40px] py-[16px] rounded-[22px] bg-tattoo-primary hover:bg-tattoo-primary/90 text-[#E7E6E6] font-montserrat font-semibold text-xl leading-4 tracking-[0px]"
                  style={{
                    fontSize: 18,
                    paddingTop: 10,
                    paddingBottom: 10,
                  }}
                >
                  Додати
                </button>
              </div>
            </form>
          </div>
        )}
      </section>

      {/* Contact Section */}
      <section id="contacts" className="bg-tattoo-dark py-[40px] sm:py-[50px] md:py-[60px] lg:py-[108px] px-4 sm:px-8 md:px-16 lg:px-8 xl:px-16 pt-[40px] sm:pt-[50px] md:pt-[60px] lg:pt-[64px]">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-cormorant font-bold text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-tattoo-light mb-[20px] sm:mb-[30px] lg:mb-[40px] text-center">Контакт з нами</h2>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 max-w-6xl mx-auto">
          <div className="w-full lg:w-[348px] flex flex-col">
            <div className="aspect-square lg:h-[316px] rounded-[22px] bg-tattoo-card shadow-[0_4px_12px_0_rgba(0,0,0,0.10)] p-4">
              <img
                src="https://api.builder.io/api/v1/image/assets/TEMP/6b9b4d63ca038b931514fc5bb0898ca9b834d4d7?width=640"
                alt="Location map"
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
            <div className="text-center mt-4 lg:mt-[18px]">
              <p 
                className="text-white font-open-sans text-xs sm:text-sm lg:text-sm leading-4 sm:leading-5 lg:leading-6 tracking-tight lg:tracking-[-1%] font-normal w-full max-w-[300px] mx-auto"
              >
                м. Львів, вулиця Стельмаха 4, Будинок 1, 2-й поверх, офіс 1
              </p>
            </div>
          </div>

          <div className="flex-1 space-y-6">
            <form onSubmit={handleContactSubmit} className="space-y-4">
              <Input
                name="name"
                placeholder="Ім'я"
                value={formData.name}
                onChange={handleInputChange}
                className="bg-transparent border-0 shadow-[0_4px_12px_0_rgba(0,0,0,0.10)] placeholder:text-tattoo-gray font-poppins text-white"
              />

              <Input
                name="phone"
                placeholder="Номер телефону"
                value={formData.phone}
                onChange={handleInputChange}
                className="bg-transparent border-0 shadow-[0_4px_12px_0_rgba(0,0,0,0.10)] placeholder:text-tattoo-gray font-poppins text-white"
              />

              <Textarea
                name="message"
                placeholder="Повідомлення"
                value={formData.message}
                onChange={handleInputChange}
                className="bg-transparent border-0 shadow-[0_4px_12px_0_rgba(0,0,0,0.10)] placeholder:text-tattoo-gray font-poppins min-h-[60px] text-white"
              />
              
              {/* Кнопка відправки з анімацією */}
              <div 
                className={`transition-all duration-300 ease-out ${
                  showSubmitButton 
                    ? 'opacity-100 transform translate-y-0' 
                    : 'opacity-0 transform translate-y-4 pointer-events-none'
                }`}
                style={{ 
                  marginTop: showSubmitButton ? '9px' : '0px', // 4px (space-y-4) + 5px = 9px
                  height: showSubmitButton ? 'auto' : '0px',
                  overflow: 'hidden'
                }}
              >
                <button
                  type="submit"
                  className="w-full bg-tattoo-orange-light text-white font-open-sans font-semibold py-2 px-4 rounded-[22px] shadow-[0_4px_12px_0_rgba(0,0,0,0.10)] hover:bg-tattoo-orange transition-colors duration-200"
                  style={{
                    fontSize: '12px',
                    lineHeight: '16px',
                    letterSpacing: '-1%'
                  }}
                >
                  Надіслати повідомлення
                </button>
              </div>
            </form>

            <div className="flex items-center gap-4">
              <div className="h-px bg-tattoo-light flex-1"></div>
              <span className="text-tattoo-light font-poppins text-sm lg:text-base">Або</span>
              <div className="h-px bg-tattoo-light flex-1"></div>
            </div>

            <div className="flex gap-4 lg:gap-6 justify-center">
              <a href="#" className="p-2 lg:p-4">
                <svg width="62" height="62" viewBox="0 0 62 62" fill="none" className="w-12 h-12 lg:w-[62px] lg:h-[62px]">
                  <path d="M31.0003 5.1665C16.7403 5.1665 2.66699 16.7398 2.66699 30.9998C2.66699 45.2598 16.7403 56.8332 31.0003 56.8332C45.2603 56.8332 56.8337 45.2598 56.8337 30.9998C56.8337 16.7398 45.2603 5.1665 31.0003 5.1665ZM42.987 22.7332C42.5995 26.8148 40.9203 36.7348 40.0678 41.3073C39.7062 43.2448 38.9828 43.8907 38.3112 43.9682C36.8128 44.0973 35.6762 42.9865 34.2295 42.0307C31.9562 40.5323 30.6645 39.6023 28.4687 38.1557C25.9112 36.4765 27.5645 35.5465 29.037 34.0482C29.4245 33.6607 36.0378 27.6415 36.167 27.099C36.1849 27.0168 36.1825 26.9315 36.16 26.8505C36.1375 26.7695 36.0956 26.6951 36.0378 26.634C35.8828 26.5048 35.6762 26.5565 35.4953 26.5823C35.2628 26.634 31.6462 29.0365 24.5937 33.7898C23.5603 34.4873 22.6303 34.849 21.8037 34.8232C20.8737 34.7973 19.117 34.3065 17.7995 33.8673C16.172 33.3507 14.9062 33.0665 15.0095 32.1623C15.0612 31.6973 15.707 31.2323 16.9212 30.7415C24.4645 27.4607 29.4762 25.2907 31.982 24.2573C39.1637 21.2607 40.6362 20.744 41.6178 20.744C41.8245 20.744 42.3153 20.7957 42.6253 21.054C42.8837 21.2607 42.9612 21.5448 42.987 21.7515C42.9612 21.9065 43.0128 22.3715 42.987 22.7332Z" fill="#E7E6E6"/>
                </svg>
              </a>

              <a href="https://www.instagram.com/tattoo_garyacha_golka?igsh=OGJ2ZmY3NGs5ajVn" target="_blank" rel="noopener noreferrer" className="p-2 lg:p-4">
                <svg width="62" height="62" viewBox="0 0 62 62" fill="none" className="w-12 h-12 lg:w-[62px] lg:h-[62px]">
                  <path d="M43.917 21.9585C46.0571 21.9585 47.792 20.2236 47.792 18.0835C47.792 15.9434 46.0571 14.2085 43.917 14.2085C41.7769 14.2085 40.042 15.9434 40.042 18.0835C40.042 20.2236 41.7769 21.9585 43.917 21.9585Z" fill="#E7E6E6"/>
                  <path d="M41.3333 7.75C48.4633 7.75 54.25 13.5367 54.25 20.6667V41.3333C54.25 48.4633 48.4633 54.25 41.3333 54.25H20.6667C13.5367 54.25 7.75 48.4633 7.75 41.3333V20.6667C7.75 13.5367 13.5367 7.75 20.6667 7.75H31H41.3333Z" stroke="#E7E6E6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M31.0003 20.6665C36.7095 20.6665 41.3337 25.2907 41.3337 30.9998C31.3337 36.709 36.7095 41.3332 31.0003 41.3332C25.2912 41.3332 20.667 36.709 20.667 30.9998C20.667 25.2907 25.2912 20.6665 31.0003 20.6665Z" stroke="#E7E6E6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </a>
            </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#626262] py-8 sm:py-10 md:py-12 lg:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row justify-between items-center mb-6 sm:mb-8 lg:mb-12 gap-4 sm:gap-6 lg:gap-0">
            <img
              src="https://api.builder.io/api/v1/image/assets/TEMP/a8b141c5ff34790a508b1bfbea52de61237d467f?width=168"
              alt="Garyacha Golka Logo"
              className="w-[60px] h-[42px] sm:w-[70px] sm:h-[49px] lg:w-[84px] lg:h-[59px] rounded-[22px]"
            />

            <p className="text-white font-roboto text-center text-xs sm:text-sm lg:text-base">© 2023 - 2025 Garyacha golka</p>

            <div className="flex gap-3 sm:gap-4 lg:gap-5">
              <svg width="24" height="24" className="sm:w-6 sm:h-6 lg:w-8 lg:h-8" viewBox="0 0 32 33" fill="none">
                <path d="M16.0003 3.1665C8.64033 3.1665 2.66699 9.13984 2.66699 16.4998C2.66699 23.8598 8.64033 29.8332 16.0003 29.8332C23.3603 29.8332 29.3337 23.8598 29.3337 16.4998C29.3337 9.13984 23.3603 3.1665 16.0003 3.1665ZM22.187 12.2332C21.987 14.3398 21.1203 19.4598 20.6803 21.8198C20.4937 22.8198 20.1203 23.1532 19.7737 23.1932C19.0003 23.2598 18.4137 22.6865 17.667 22.1932C16.4937 21.4198 15.827 20.9398 14.6937 20.1932C13.3737 19.3265 14.227 18.8465 14.987 18.0732C15.187 17.8732 18.6003 14.7665 18.667 14.4865C18.6763 14.4441 18.675 14.4001 18.6634 14.3582C18.6518 14.3164 18.6301 14.2781 18.6003 14.2465C18.5203 14.1798 18.4137 14.2065 18.3203 14.2198C18.2003 14.2465 16.3337 15.4865 12.6937 17.9398C12.1603 18.2998 11.6803 18.4865 11.2537 18.4732C10.7737 18.4598 9.86699 18.2065 9.18699 17.9798C8.34699 17.7132 7.69366 17.5665 7.74699 17.0998C7.77366 16.8598 8.10699 16.6198 8.73366 16.3665C12.627 14.6732 15.2137 13.5532 16.507 13.0198C20.2137 11.4732 20.9737 11.2065 21.4803 11.2065C21.587 11.2065 21.8403 11.2332 22.0003 11.3665C22.1337 11.4732 22.1737 11.6198 22.187 11.7265C22.1737 21.8065 22.2003 12.0465 22.187 12.2332Z" fill="#E7E6E6"/>
              </svg>

              <a href="https://www.instagram.com/tattoo_garyacha_golka?igsh=OGJ2ZmY3NGs5ajVn" target="_blank" rel="noopener noreferrer">
                <svg width="24" height="24" className="sm:w-6 sm:h-6 lg:w-8 lg:h-8" viewBox="0 0 32 33" fill="none">
                  <path d="M22.667 11.8335C23.7716 11.8335 24.667 10.9381 24.667 9.8335C24.667 8.72893 23.7716 7.8335 22.667 7.8335C21.5624 7.8335 20.667 8.72893 20.667 9.8335C20.667 10.9381 21.5624 11.8335 22.667 11.8335Z" fill="#E7E6E6"/>
                  <path d="M21.3333 4.5C25.0133 4.5 28 7.48667 28 11.1667V21.8333C28 25.5133 25.0133 28.5 21.3333 28.5H10.6667C6.98667 28.5 4 25.5133 4 21.8333V11.1667C4 7.48667 6.98667 4.5 10.6667 4.5H16H21.3333Z" stroke="#E7E6E6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M16.0003 11.1665C18.947 11.1665 21.3337 13.5532 21.3337 16.4998C21.3337 19.4465 18.947 21.8332 16.0003 21.8332C13.0537 21.8332 10.667 19.4465 10.667 16.4998C10.667 13.5532 13.0537 11.1665 16.0003 11.1665Z" stroke="#E7E6E6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </a>
            </div>
          </div>

          <div className="h-px bg-white mb-6 sm:mb-8 lg:mb-12"></div>

          <div className="flex flex-col lg:flex-row justify-between gap-6 sm:gap-8">
            <div className="flex flex-col sm:flex-row gap-6 sm:gap-8 lg:gap-24">
              <div className="space-y-3 sm:space-y-4 lg:space-y-6">
                <a href="#" className="block text-white font-roboto text-xs sm:text-sm lg:text-base">Main</a>
                <a href="#" className="block text-white font-roboto text-xs sm:text-sm lg:text-base">Why us</a>
                <a href="#" className="block text-white font-roboto text-xs sm:text-sm lg:text-base">Gallery</a>
              </div>

              <div className="space-y-3 sm:space-y-4 lg:space-y-6">
                <a href="#" className="block text-white font-roboto text-xs sm:text-sm lg:text-base">About us</a>
                <a href="#" className="block text-white font-roboto text-xs sm:text-sm lg:text-base">Review</a>
              </div>
            </div>

            <div className="space-y-3 sm:space-y-4 lg:space-y-6 text-center lg:text-right">
              <p className="text-white font-roboto text-xs sm:text-sm lg:text-base">Created by Oleksandr Kostyrko</p>
              <p className="text-white font-roboto text-xs sm:text-sm lg:text-base">Contact:</p>
              <p className="text-white font-roboto text-xs sm:text-sm lg:text-base">Telegram — @KreeeKl</p>
            </div>
          </div>
        </div>
      </footer>

      {/* Модалка для запису на тату */}
      {showBookingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <form
            onSubmit={handleBookingSubmit}
            className="bg-transparent flex items-center justify-center"
            style={{ boxShadow: "none" }}
          >
            <div
              className="rounded-[22px] w-[500px] max-h-[80vh] overflow-y-auto bg-tattoo-card shadow-[0_4px_12px_0_rgba(0,0,0,0.10)] p-8"
              style={{
                minWidth: 500,
                maxWidth: 500,
              }}
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-white font-cormorant font-bold text-2xl">Запис на тату</h3>
                <button
                  type="button"
                  onClick={() => setShowBookingModal(false)}
                  className="text-white hover:text-gray-300 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <Input
                  name="name"
                  placeholder="Ваше ім'я *"
                  value={bookingForm.name}
                  onChange={handleBookingFormChange}
                  className="bg-transparent border border-gray-600 text-white placeholder:text-gray-400"
                  required
                />

                <Input
                  name="phone"
                  placeholder="Номер телефону *"
                  value={bookingForm.phone}
                  onChange={handleBookingFormChange}
                  className="bg-transparent border border-gray-600 text-white placeholder:text-gray-400"
                  required
                />

                <Input
                  name="date"
                  type="date"
                  placeholder="Бажана дата *"
                  value={bookingForm.date}
                  onChange={handleBookingFormChange}
                  className="bg-transparent border border-gray-600 text-white placeholder:text-gray-400"
                  required
                />

                <Input
                  name="time"
                  type="time"
                  placeholder="Бажаний час *"
                  value={bookingForm.time}
                  onChange={handleBookingFormChange}
                  className="bg-transparent border border-gray-600 text-white placeholder:text-gray-400"
                  required
                />

                <Textarea
                  name="description"
                  placeholder="Опис тату (необов'язково)"
                  value={bookingForm.description}
                  onChange={handleBookingFormChange}
                  className="bg-transparent border border-gray-600 text-white placeholder:text-gray-400 min-h-[100px]"
                />

                <button
                  type="submit"
                  className="w-full bg-tattoo-orange-light text-white font-open-sans font-semibold py-3 px-6 rounded-[22px] hover:bg-tattoo-orange transition-colors duration-200"
                >
                  Записатися
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

