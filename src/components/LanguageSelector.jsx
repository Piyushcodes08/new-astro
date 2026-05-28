import React, { useState, useEffect, useRef } from "react";
import { LanguageIcon, ChevronDownIcon } from "@heroicons/react/24/outline";

const LanguageSelector = () => {
  const [showTranslate, setShowTranslate] = useState(false);
  const translateRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (translateRef.current && !translateRef.current.contains(event.target)) {
        setShowTranslate(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const initWidget = () => {
      if (window.google && window.google.translate) {
        const container = document.getElementById("google_translate_element");
        if (container) container.innerHTML = "";
        new window.google.translate.TranslateElement({
            pageLanguage: "en",
            includedLanguages: "fr,de,es,zh,hi,ar,ja,ru,pt,ko",
            layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
            autoDisplay: false,
          }, "google_translate_element"
        );
      }
    };

    if (!document.getElementById("google-translate-script")) {
      window.googleTranslateElementInit = initWidget;
      const script = document.createElement("script");
      script.id = "google-translate-script";
      script.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      script.async = true;
      document.body.appendChild(script);
    } else if (window.google && window.google.translate) {
      initWidget();
    }
  }, []);

  return (
    <div ref={translateRef} className="relative flex items-center">
      {/* Glass Pill Button */}
      <button
        type="button"
        onClick={() => setShowTranslate((prev) => !prev)}
        className="flex h-10 items-center gap-2 px-3 rounded-full border border-white/20 bg-white/10 text-white transition-all hover:bg-white/20 active:scale-95 shadow-sm"
      >
        <LanguageIcon className="h-4 w-4" />
        <span className="text-[11px] font-bold tracking-widest uppercase">Ln</span>
        <ChevronDownIcon className={`h-3 w-3 transition-transform duration-300 ${showTranslate ? 'rotate-180' : ''}`} />
      </button>

      {/* Premium Language Card */}
      <div 
        className={`absolute right-0 top-full mt-4 z-9999 w-[260px] overflow-hidden rounded-3xl bg-white p-5 shadow-2xl ring-1 ring-black/5 transition-all duration-300 ${
            showTranslate ? "opacity-100 translate-y-0 visible" : "opacity-0 -translate-y-4 invisible"
        }`}
      >
        <div className="mb-4 flex items-center gap-2">
            <div className="h-1 w-8 rounded-full bg-red-500"></div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Select Language</p>
        </div>
        
        <div 
            id="google_translate_element" 
            className="modern-translate-container"
        />
        
        {/* Style hack to hide the Google Branding if desired */}
        <style dangerouslySetInnerHTML={{__html: `
          .goog-te-gadget-simple { border: none !important; background: transparent !important; padding: 0 !important; font-family: inherit !important; }
          .goog-te-gadget-icon { display: none !important; }
          .goog-te-menu-value span { color: #374151 !important; font-size: 13px !important; font-weight: 500 !important; }
        `}} />
      </div>
    </div>
  );
};

export default LanguageSelector;