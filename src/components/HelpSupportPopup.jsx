import React, { useState } from 'react';
import { ChevronDown, CheckCircle2, AlertCircle, Loader2, X } from 'lucide-react';
import './HelpSupportPopup.css';

const HelpSupportPopup = ({ onClose }) => {
  const [openFaqIndex, setOpenFaqIndex] = useState(null);
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null); // { type: 'success' | 'error', text: string }
  const [touched, setTouched] = useState(false);

  const faqs = [
    {
      question: "What is Pujo Porikroma?",
      answer: "Pujo Porikroma is a full Pujo guide for 2026. Where u can find your favourite your favourite pandels with proper vibe."
    },
    {
      question: "What is the Significance of the page?",
      answer: "This is a all rounder for pandal hopper. Here u can find pandel with their details, and also connect with new peoples while vibing with Puja playlist."
    },
    {
      question: "How do I mark a pandal as visited?",
      answer: 'Tap the pandal location, use "Mark as visited". Your visited count shows on your profile so you can track your journey.'
    }
  ];

  const toggleFaq = (index) => {
    setOpenFaqIndex(prevIndex => prevIndex === index ? null : index);
  };

  const isContactEmpty = !contact.trim();
  const isMessageEmpty = !message.trim();
  const isFormValid = !isContactEmpty && !isMessageEmpty;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched(true);

    if (!isFormValid || isSubmitting) return;

    setIsSubmitting(true);
    setStatusMessage(null);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: name.trim(),
          contact: contact.trim(),
          message: message.trim()
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setStatusMessage({
          type: 'success',
          text: data.message || 'Message sent successfully! We will get back to you soon.'
        });
        setTimeout(() => {
          onClose();
        }, 2200);
      } else {
        setStatusMessage({
          type: 'error',
          text: data.error || 'Failed to send message. Please try again later.'
        });
      }
    } catch (err) {
      console.error("Contact submit error:", err);
      setStatusMessage({
        type: 'error',
        text: 'Network error connecting to server. Please check your connection.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="help-overlay" onClick={(e) => { e.stopPropagation(); onClose(); }}>
      <div className="help-content" onClick={(e) => e.stopPropagation()}>
        <div className="help-header">
          <div className="help-header-top">
            <h2 className="help-title">Help & support</h2>
            <button className="help-close-icon-btn" onClick={onClose} aria-label="Close">
              <X size={18} />
            </button>
          </div>
          <p className="help-subtitle">Answers to common questions — or send us a message.</p>
        </div>

        {statusMessage?.type === 'success' ? (
          <div className="help-success-view">
            <CheckCircle2 size={48} className="help-success-icon" />
            <h3 className="help-success-title">Thank You!</h3>
            <p className="help-success-desc">{statusMessage.text}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="help-form-wrapper">
            <div className="help-body">
              <div className="help-section-title">FAQS</div>
              <div className="help-faqs">
                {faqs.map((faq, index) => {
                  const isOpen = openFaqIndex === index;
                  return (
                    <div
                      key={index}
                      className={`help-faq-item ${isOpen ? 'open' : ''}`}
                      onClick={() => toggleFaq(index)}
                    >
                      <div className="help-faq-header">
                        <span>{faq.question}</span>
                        <ChevronDown size={18} className={`help-faq-icon ${isOpen ? 'rotated' : ''}`} />
                      </div>
                      <div className={`help-faq-collapse ${isOpen ? 'expanded' : ''}`}>
                        <div className="help-faq-answer-inner">
                          {faq.answer}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="help-section-title">CONTACT US</div>
              <p className="help-contact-subtitle">Can't find an answer? Send us a message and we'll help.</p>
              <div className="help-contact">
                <div className="help-field">
                  <input 
                    type="text" 
                    placeholder="Your name (optional)" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="help-field">
                  <input 
                    type="text" 
                    placeholder="Email or phone (so we can reply)" 
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    className={touched && isContactEmpty ? 'input-error' : ''}
                  />
                  {touched && isContactEmpty && (
                    <span className="field-error-text">Email or phone is required so we can reply.</span>
                  )}
                </div>
                <div className="help-field">
                  <textarea 
                    placeholder="How can we help?" 
                    rows="4"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className={touched && isMessageEmpty ? 'input-error' : ''}
                  ></textarea>
                  {touched && isMessageEmpty && (
                    <span className="field-error-text">Please enter your question or message.</span>
                  )}
                </div>
              </div>

              {/* Alert Banner for errors or rate limiting */}
              {statusMessage?.type === 'error' && (
                <div className="help-alert-banner">
                  <AlertCircle size={16} className="flex-shrink-0" />
                  <span>{statusMessage.text}</span>
                </div>
              )}
            </div>

            <div className="help-footer">
              <button 
                type="submit" 
                className="help-send-btn" 
                disabled={!isFormValid || isSubmitting}
              >
                {isSubmitting ? (
                  <span className="help-btn-loading">
                    <Loader2 size={18} className="spin-icon" /> Sending...
                  </span>
                ) : (
                  "Send message"
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default HelpSupportPopup;
