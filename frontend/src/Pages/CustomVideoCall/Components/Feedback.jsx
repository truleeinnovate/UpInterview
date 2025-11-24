import React, { useState } from "react";
import { X, Send, Star } from "lucide-react";
import "./Feedback.css";

const Feedback = ({ onClose }) => {
    const [feedback, setFeedback] = useState({
        rating: 0,
        category: "general",
        message: "",
        email: ""
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const categories = [
        { value: "general", label: "General" },
        { value: "technical", label: "Technical Issue" },
        { value: "audio", label: "Audio Quality" },
        { value: "video", label: "Video Quality" },
        { value: "ui", label: "User Interface" },
        { value: "other", label: "Other" }
    ];

    const handleRatingChange = (rating) => {
        setFeedback(prev => ({ ...prev, rating }));
    };

    const handleInputChange = (field, value) => {
        setFeedback(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Here you would typically send the feedback to your backend

            alert('Thank you for your feedback!');
            onClose();
        } catch (error) {
            console.error('Failed to submit feedback:', error);
            alert('Failed to submit feedback. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="feedback-modal">
            <div className="feedback-header">
                <h2>Share Your Feedback</h2>
                <button className="close-btn" onClick={onClose}>
                    <X size={20} />
                </button>
            </div>

            <form onSubmit={handleSubmit} className="feedback-form">
                <div className="form-group">
                    <label>How would you rate your experience?</label>
                    <div className="rating-container">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                type="button"
                                className={`star-btn ${feedback.rating >= star ? 'filled' : ''}`}
                                onClick={() => handleRatingChange(star)}
                            >
                                <Star size={24} />
                            </button>
                        ))}
                    </div>
                    <span className="rating-text">
                        {feedback.rating === 0 && "Click to rate"}
                        {feedback.rating === 1 && "Poor"}
                        {feedback.rating === 2 && "Fair"}
                        {feedback.rating === 3 && "Good"}
                        {feedback.rating === 4 && "Very Good"}
                        {feedback.rating === 5 && "Excellent"}
                    </span>
                </div>

                <div className="form-group">
                    <label>Category</label>
                    <select
                        value={feedback.category}
                        onChange={(e) => handleInputChange('category', e.target.value)}
                        className="form-select"
                    >
                        {categories.map(category => (
                            <option key={category.value} value={category.value}>
                                {category.label}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label>Your Message</label>
                    <textarea
                        value={feedback.message}
                        onChange={(e) => handleInputChange('message', e.target.value)}
                        placeholder="Tell us about your experience, suggestions, or any issues you encountered..."
                        rows={4}
                        className="form-textarea"
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Email (optional)</label>
                    <input
                        type="email"
                        value={feedback.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder="your.email@example.com"
                        className="form-input"
                    />
                </div>

                <div className="feedback-actions">
                    <button
                        type="button"
                        onClick={onClose}
                        className="btn btn-secondary"
                        disabled={isSubmitting}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={isSubmitting || !feedback.message.trim()}
                    >
                        {isSubmitting ? (
                            <>
                                <div className="spinner"></div>
                                Submitting...
                            </>
                        ) : (
                            <>
                                <Send size={16} />
                                Submit Feedback
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default Feedback;