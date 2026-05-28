import React, { useState, useEffect, useRef } from "react";
import "./ChatBot.css";

const PREDEFINED_ANSWERS = {
  "What is this website about?": "Vahlay Astro is your dedicated platform for exploring the mysteries of the cosmos through professional astrology, numerology, and ancient Vedic wisdom. We help you find clarity and growth.",
  "What services do you provide?": "We lead with personalized astrology consultations, detailed numerology reports, and transformative courses like 'Basics of Astrology' and 'Vedic Wisdom'.",
  "How can I contact you?": "You can reach our team at contact@vahlayastro.com or call our center at +91 79 4921 7538. Feel free to visit our address listed in the footer!",
  "How can I book a consultation?": "Booking is easy! Just click the 'BOOK AN APPOINTMENT' button in the Hero section at the top of the home page to access our consulting form.",
  "Where can I read articles?": "Check out our 'Featured Articles' section on the homepage. We regularly publish insights about planetary movements and sacred wisdom.",
};

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { type: "bot", text: "Hii! I am your Vahlay Assistant. Ask what you want! ✨" }
  ]);
  const messagesEndRef = useRef(null);

  // ChatBot stays closed by default - user opens manually
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleQuickReply = (question) => {
    // Add user question
    const newMessages = [...messages, { type: "user", text: question }];
    setMessages(newMessages);

    // Add bot answer with a small delay for "AI feel"
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { type: "bot", text: PREDEFINED_ANSWERS[question] || "I'm sorry, I don't have an answer for that yet. Would you like to reach out to our team?" }
      ]);
    }, 600);
  };

  const toggleChat = () => setIsOpen(!isOpen);

  return (
    <div className={`chatbot-wrapper ${isOpen ? "is-open" : ""}`}>
      {/* Floating Button */}
      <button className="chat-toggle-btn" onClick={toggleChat} aria-label="Toggle Chat">
        {isOpen ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        ) : (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
        )}
      </button>

      {/* Chat Window */}
      <div className="chat-window">
        <div className="chat-header">
          <div className="bot-info">
            <div className="bot-avatar">VA</div>
            <div className="bot-name-group">
              <h4>Vahlay Assistant</h4>
              <span>Online • Cosmic Guide</span>
            </div>
          </div>
        </div>

        <div className="chat-messages">
          {messages.map((msg, idx) => (
            <div key={idx} className={`message-bubble  ${msg.type}`}>
              {msg.text}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="chat-quick-replies">
          <p>Frequently Asked:</p>
          <div className="reply-buttons-grid">
            {Object.keys(PREDEFINED_ANSWERS).map((question) => (
              <button 
                key={question} 
                className="quick-reply-btn"
                onClick={() => handleQuickReply(question)}
              >
                {question}
              </button>
            ))}
          </div>
        </div>

        <div className="chat-footer">
          <p>© {new Date().getFullYear()} Vahlay Astro Assistance</p>
        </div>
      </div>
    </div>
  );
};

export default ChatBot;
