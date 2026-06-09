import React, { useState, useEffect, useCallback } from "react";
import "./gallery.css";

const galleryItems = [
  {
    image: "https://i.ibb.co/sm8mdMP/pic16.jpg",
    title: "Sacred Ritual Ceremony",
    description:
      "A powerful spiritual gathering where ancient Vedic rituals are performed to invoke divine blessings and positive cosmic energy.",
  },
  {
    image: "https://i.ibb.co/Gnq2gJb/pic2.jpg",
    title: "Astrological Consultation",
    description:
      "Personal guidance sessions where our experts interpret planetary alignments to help you navigate life's most important decisions.",
  },
  {
    image: "https://i.ibb.co/vDpCDSY/pic13.jpg",
    title: "Meditation & Healing",
    description:
      "Tranquil moments of deep meditation and energy healing, restoring balance between mind, body, and spirit.",
  },
  {
    image: "https://i.ibb.co/f0Yt9bM/pic4.jpg",
    title: "Spiritual Workshop",
    description:
      "Interactive workshops where seekers learn the foundations of astrology, numerology, and spiritual self-discovery.",
  },
  {
    image: "https://i.ibb.co/g4hxBfz/pic5.jpg",
    title: "Temple Blessings",
    description:
      "Sacred visits to revered temples, connecting with centuries of spiritual tradition and divine grace.",
  },
  {
    image: "https://i.ibb.co/FgdgX20/pic10.jpg",
    title: "Community Gathering",
    description:
      "Warm community events where like-minded souls come together to share wisdom, faith, and spiritual growth.",
  },
  {
    image: "https://i.ibb.co/kDjJwhB/pic7.jpg",
    title: "Yantra & Mantra Session",
    description:
      "Focused sessions on sacred yantras and mantras, harnessing vibrational energy for protection and prosperity.",
  },
  {
    image: "https://i.ibb.co/9n7mHQt/pic8.jpg",
    title: "Festive Celebrations",
    description:
      "Joyful celebrations of auspicious festivals, honoring the cosmic cycles that shape our spiritual journey.",
  },
];

const Gallery = () => {
  const [selectedItem, setSelectedItem] = useState(null);

  const closePopup = useCallback(() => setSelectedItem(null), []);

  useEffect(() => {
    if (!selectedItem) return;

    document.body.style.overflow = "hidden";

    const handleKeyDown = (e) => {
      if (e.key === "Escape") closePopup();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedItem, closePopup]);

  return (
    <section className="gallery-section" id="gallery">
      <div className="section-container">
        <div className="gallery-header">
          <h2 className="title-batangas">Our Spiritual Gallery</h2>
          <p className="subtitle-poppins">
            Sacred moments, rituals, and spiritual gatherings from Vahlay Astro.
          </p>
        </div>

        <div className="gallery-grid">
          {galleryItems.map((item, index) => (
            <button
              key={index}
              type="button"
              className="gallery-item"
              onClick={() => setSelectedItem(item)}
              aria-label={`View ${item.title}`}
            >
              <img src={item.image} alt={item.title} loading="lazy" />
            </button>
          ))}
        </div>
      </div>

      {selectedItem && (
        <div
          className="gallery-modal-overlay show"
          onClick={closePopup}
          role="dialog"
          aria-modal="true"
          aria-label={selectedItem.title}
        >
          <div
            className="gallery-modal show"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="gallery-modal-close"
              onClick={closePopup}
              aria-label="Close gallery popup"
            >
              &times;
            </button>

            <div className="gallery-modal-image">
              <img src={selectedItem.image} alt={selectedItem.title} />
            </div>

            <div className="gallery-modal-content">
              <h3 className="gallery-modal-title title-batangas">
                {selectedItem.title}
              </h3>
              <p className="gallery-modal-description subtitle-poppins">
                {selectedItem.description}
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Gallery;
