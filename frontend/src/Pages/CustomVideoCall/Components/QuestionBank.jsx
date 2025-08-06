import React, { useState, useEffect } from "react";
import { X, Search, BookOpen, Filter, Copy, Share2 } from "lucide-react";
import "./QuestionBank.css";

const QuestionBank = ({ onClose }) => {
    const [questions, setQuestions] = useState([]);
    const [filteredQuestions, setFilteredQuestions] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [isLoading, setIsLoading] = useState(true);
    const [selectedQuestion, setSelectedQuestion] = useState(null);

    const categories = [
        { value: "all", label: "All Categories" },
        { value: "technical", label: "Technical" },
        { value: "general", label: "General" },
        { value: "behavioral", label: "Behavioral" },
        { value: "coding", label: "Coding" },
        { value: "system-design", label: "System Design" }
    ];

    // Sample questions data
    const sampleQuestions = [
        {
            id: 1,
            question: "What is React and what are its key features?",
            category: "technical",
            difficulty: "easy",
            tags: ["react", "frontend", "javascript"]
        },
        {
            id: 2,
            question: "Explain the difference between state and props in React.",
            category: "technical",
            difficulty: "medium",
            tags: ["react", "state", "props"]
        },
        {
            id: 3,
            question: "What are React hooks and how do they work?",
            category: "technical",
            difficulty: "medium",
            tags: ["react", "hooks", "functional-components"]
        },
        {
            id: 4,
            question: "Describe a challenging project you worked on and how you overcame obstacles.",
            category: "behavioral",
            difficulty: "medium",
            tags: ["behavioral", "project-management", "problem-solving"]
        },
        {
            id: 5,
            question: "How would you design a scalable microservices architecture?",
            category: "system-design",
            difficulty: "hard",
            tags: ["architecture", "microservices", "scalability"]
        },
        {
            id: 6,
            question: "Write a function to reverse a string in JavaScript.",
            category: "coding",
            difficulty: "easy",
            tags: ["javascript", "algorithms", "string-manipulation"]
        },
        {
            id: 7,
            question: "What is the difference between let, const, and var in JavaScript?",
            category: "technical",
            difficulty: "easy",
            tags: ["javascript", "variables", "scope"]
        },
        {
            id: 8,
            question: "How do you handle errors in asynchronous JavaScript code?",
            category: "technical",
            difficulty: "medium",
            tags: ["javascript", "async", "error-handling"]
        },
        {
            id: 9,
            question: "Tell me about a time when you had to learn a new technology quickly.",
            category: "behavioral",
            difficulty: "medium",
            tags: ["learning", "adaptability", "problem-solving"]
        },
        {
            id: 10,
            question: "What is the event loop in JavaScript?",
            category: "technical",
            difficulty: "hard",
            tags: ["javascript", "event-loop", "asynchronous"]
        }
    ];

    useEffect(() => {
        // Simulate API call
        const fetchQuestions = async () => {
            setIsLoading(true);
            try {
                // Simulate network delay
                await new Promise(resolve => setTimeout(resolve, 1000));
                setQuestions(sampleQuestions);
                setFilteredQuestions(sampleQuestions);
            } catch (error) {
                console.error('Failed to fetch questions:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchQuestions();
    }, []);

    useEffect(() => {
        // Filter questions based on search term and category
        let filtered = questions;

        if (selectedCategory !== "all") {
            filtered = filtered.filter(q => q.category === selectedCategory);
        }

        if (searchTerm.trim()) {
            filtered = filtered.filter(q =>
                q.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                q.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }

        setFilteredQuestions(filtered);
    }, [searchTerm, selectedCategory, questions]);

    const handleCopyQuestion = (question) => {
        navigator.clipboard.writeText(question.question);
        // You could add a toast notification here
        alert('Question copied to clipboard!');
    };

    const handleShareQuestion = (question) => {
        // You could implement sharing functionality here
        alert('Sharing functionality would be implemented here!');
    };

    const getDifficultyColor = (difficulty) => {
        switch (difficulty) {
            case 'easy': return '#4CAF50';
            case 'medium': return '#FF9800';
            case 'hard': return '#f44336';
            default: return '#666';
        }
    };

    if (isLoading) {
        return (
            <div className="question-bank-modal">
                <div className="question-bank-header">
                    <h2>Question Bank</h2>
                    <button className="close-btn" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>
                <div className="loading-container">
                    <div className="spinner"></div>
                    <p>Loading questions...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="question-bank-modal">
            <div className="question-bank-header">
                <h2>Question Bank</h2>
                <button className="close-btn" onClick={onClose}>
                    <X size={20} />
                </button>
            </div>

            <div className="question-bank-content">
                <div className="search-filters">
                    <div className="search-container">
                        <Search size={20} className="search-icon" />
                        <input
                            type="text"
                            placeholder="Search questions..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="search-input"
                        />
                    </div>

                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="category-select"
                    >
                        {categories.map(category => (
                            <option key={category.value} value={category.value}>
                                {category.label}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="questions-container">
                    {filteredQuestions.length === 0 ? (
                        <div className="no-questions">
                            <BookOpen size={48} />
                            <p>No questions found matching your criteria.</p>
                        </div>
                    ) : (
                        <div className="questions-list">
                            {filteredQuestions.map((question) => (
                                <div
                                    key={question.id}
                                    className={`question-item ${selectedQuestion?.id === question.id ? 'selected' : ''}`}
                                    onClick={() => setSelectedQuestion(question)}
                                >
                                    <div className="question-header">
                                        <h3 className="question-text">{question.question}</h3>
                                        <div className="question-actions">
                                            <button
                                                className="action-btn"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleCopyQuestion(question);
                                                }}
                                                title="Copy question"
                                            >
                                                <Copy size={16} />
                                            </button>
                                            <button
                                                className="action-btn"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleShareQuestion(question);
                                                }}
                                                title="Share question"
                                            >
                                                <Share2 size={16} />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="question-meta">
                                        <span
                                            className="difficulty-badge"
                                            style={{ backgroundColor: getDifficultyColor(question.difficulty) }}
                                        >
                                            {question.difficulty}
                                        </span>
                                        <div className="tags">
                                            {question.tags.map((tag, index) => (
                                                <span key={index} className="tag">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="question-bank-footer">
                    <p className="question-count">
                        Showing {filteredQuestions.length} of {questions.length} questions
                    </p>
                </div>
            </div>
        </div>
    );
};

export default QuestionBank;