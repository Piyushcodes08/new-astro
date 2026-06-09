import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import SliderHeader from '../../ui/Slider/SliderHeader';
import SliderControls from '../../ui/Slider/SliderControls';
import { articlesData as rawArticles } from "../../../data/pages/articles";
import { useArticles } from '../../../context/ArticlesContext';
import './ArticleSection.css';

const ArticleSection = () => {
  const { slugMap, loading } = useArticles();
  const articlesData = React.useMemo(() => {
    return Object.values(slugMap).sort((a, b) => {
      // Prioritize rawDate (Post Date) for editorial order
      const timeA = a.rawDate ? new Date(a.rawDate).getTime() : (a.createdAt?.seconds ? a.createdAt.seconds * 1000 : 0);
      const timeB = b.rawDate ? new Date(b.rawDate).getTime() : (b.createdAt?.seconds ? b.createdAt.seconds * 1000 : 0);

      return timeB - timeA; // Descending order (newest first)
    });
  }, [slugMap]);

  // We clone items for seamless loop: items at end added to start, items at start added to end
  const [currentIndex, setCurrentIndex] = useState(4);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [visibleItems, setVisibleItems] = useState(4);
  const sliderRef = useRef(null);
  const touchStartRef = useRef(0);
  const isMovingRef = useRef(false);

  // Extend data for seamless cloning
  const clonedData = React.useMemo(() => {
    if (articlesData.length === 0) return [];
    return [
      ...articlesData.slice(-4),
      ...articlesData,
      ...articlesData.slice(0, 4)
    ];
  }, [articlesData]);

  const totalRealItems = articlesData.length;

  useEffect(() => {
    if (totalRealItems > 0 && currentIndex === 0) {
      setCurrentIndex(4);
    }
  }, [totalRealItems, currentIndex]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) setVisibleItems(1);
      else if (window.innerWidth < 768) setVisibleItems(2);
      else if (window.innerWidth < 1024) setVisibleItems(3);
      else if (window.innerWidth < 1440) setVisibleItems(4);
      else setVisibleItems(5);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const moveToIndex = useCallback((index, smooth = true) => {
    setIsTransitioning(smooth);
    setCurrentIndex(index);
  }, []);

  const nextSlide = useCallback(() => {
    if (isMovingRef.current) return;
    moveToIndex(currentIndex + 1);
  }, [currentIndex, moveToIndex]);

  const prevSlide = useCallback(() => {
    if (isMovingRef.current) return;
    moveToIndex(currentIndex - 1);
  }, [currentIndex, moveToIndex]);

  // Boundary check for infinite loop
  useEffect(() => {
    // Jump from end clone back to real start
    if (currentIndex >= totalRealItems + 4) {
      const timer = setTimeout(() => {
        moveToIndex(4, false);
      }, 600);
      return () => clearTimeout(timer);
    }
    // Jump from start clone forward to real end
    if (currentIndex <= 3) {
      const timer = setTimeout(() => {
        moveToIndex(totalRealItems + 3, false);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [currentIndex, totalRealItems, moveToIndex]);

  // Touch Handling
  const handleTouchStart = (e) => {
    touchStartRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStartRef.current - touchEnd;
    if (Math.abs(diff) > 50) {
      if (diff > 0) nextSlide();
      else prevSlide();
    }
  };

  const getTranslateX = () => {
    const percentage = (100 / visibleItems) * currentIndex;
    return `translateX(-${percentage}%)`;
  };

  const [openCardId, setOpenCardId] = useState(null);

  const handleCardClick = (id) => {
    setOpenCardId(prev => prev === id ? null : id);
  };

  // Early returns must happen AFTER all hooks are called!
  if (loading) {
    return (
      <div className="py-20 flex items-center justify-center">
        <div className="text-brand-red text-xl font-bold animate-pulse uppercase tracking-[0.3em]">
          Reading Scrolls...
        </div>
      </div>
    );
  }

  if (totalRealItems === 0) return null;

  return (
    <section className="article-section">
      <div className="section-container">
        <SliderHeader
          title="Featured Articles"
          subTitle="Explore our latest insights and sacred wisdom."
          onNext={nextSlide}
          onPrev={prevSlide}
          isPrevDisabled={false}
          isNextDisabled={false}
        />

        <div
          className="article-slider-container"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div
            className="article-track"
            style={{
              transform: getTranslateX(),
              transition: isTransitioning ? 'transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)' : 'none'
            }}
          >
            {clonedData.map((article, index) => {
              const uniqueId = `${article.id}-${index}`;
              const isOpen = openCardId === uniqueId;

              return (
                <div
                  key={uniqueId}
                  className="article-slide"
                  style={{ flex: `0 0 ${100 / visibleItems}%` }}
                >
                  <div className="article-item">
                    <div
                      className={`article-wrapper ${isOpen ? 'is-open' : ''}`}
                      onClick={() => handleCardClick(uniqueId)}
                    >
                      {/* Inner page content — revealed when cover opens */}
                      <div className="article-inner">
                        <h4 className="article-inner-title">{article.title}</h4>
                        {article.hindi && <h5 className="article-inner-hindi-title">{article.hindi}</h5>}
                        <div className="article-inner-meta">
                          {article.author && <span className="article-inner-author">By {article.author}</span>}
                          {(article.data || article.createdAt) && (
                            <span className="article-inner-date">
                              {article.data || (article.createdAt?.seconds ? new Date(article.createdAt.seconds * 1000).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : "")}
                            </span>
                          )}
                        </div>
                        <Link to={`/articles/${article.id}`} className="article-read-more" onClick={(e) => e.stopPropagation()}>Read More</Link>
                      </div>
                      {/* Cover — rotates open on hover/click */}
                      <div className="article-cover-container">
                        <div className="w-full aspect-video overflow-hidden">
                          <img
                            src={article.imageUrl || article.img}
                            alt={article.title}
                            className="w-full h-full object-contain"
                            loading="eager"
                          />
                        </div>
                        <div className="article-cover-content">
                          <h4 className="article-cover-title">{article.title}</h4>
                          {article.author && <p className="article-cover-author">By {article.author}</p>}
                          {(article.data || article.createdAt) && (
                            <p className="article-cover-date">
                              {article.data || (article.createdAt?.seconds ? new Date(article.createdAt.seconds * 1000).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : "")}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <SliderControls
          onNext={nextSlide}
          onPrev={prevSlide}
          isPrevDisabled={false}
          isNextDisabled={false}
        />
      </div>
    </section>
  );
};

export default ArticleSection;
