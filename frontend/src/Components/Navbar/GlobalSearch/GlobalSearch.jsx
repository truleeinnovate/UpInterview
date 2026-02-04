import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import GlobalSearchDropdown from './GlobalSearchDropdown';
import './GlobalSearch.css';

const GlobalSearch = () => {
    const [query, setQuery] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef(null);
    const containerRef = useRef(null);
    const navigate = useNavigate();

    // Handle click outside to close dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Handle input change
    const handleInputChange = useCallback((e) => {
        const value = e.target.value;
        setQuery(value);
        setIsDropdownOpen(value.trim().length > 0);
        setSelectedIndex(0);
    }, []);

    // Handle search navigation
    const handleSearch = useCallback((mode) => {
        if (query.trim().length > 0) {
            setIsDropdownOpen(false);
            navigate(`/search?q=${encodeURIComponent(query.trim())}&mode=${mode}`);
        }
    }, [query, navigate]);

    // Handle keyboard navigation
    const handleKeyDown = useCallback((e) => {
        if (!isDropdownOpen) {
            if (e.key === 'Enter' && query.trim().length > 0) {
                handleSearch('contains');
            }
            return;
        }

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setSelectedIndex((prev) => (prev < 1 ? prev + 1 : prev));
                break;
            case 'ArrowUp':
                e.preventDefault();
                setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
                break;
            case 'Enter':
                e.preventDefault();
                handleSearch(selectedIndex === 0 ? 'contains' : 'startsWith');
                break;
            case 'Escape':
                setIsDropdownOpen(false);
                break;
            default:
                break;
        }
    }, [isDropdownOpen, query, selectedIndex, handleSearch]);

    // Handle focus
    const handleFocus = useCallback(() => {
        if (query.trim().length > 0) {
            setIsDropdownOpen(true);
        }
    }, [query]);

    return (
        <div className="global-search-container" ref={containerRef}>
            <div className="global-search-input-wrapper">
                <Search className="global-search-icon" size={16} />
                <input
                    ref={inputRef}
                    type="text"
                    className="global-search-input"
                    placeholder="Search across all tabs..."
                    value={query}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    onFocus={handleFocus}
                    autoComplete="off"
                />
            </div>

            {isDropdownOpen && query.trim().length > 0 && (
                <GlobalSearchDropdown
                    query={query}
                    selectedIndex={selectedIndex}
                    onSelect={handleSearch}
                />
            )}
        </div>
    );
};

export default GlobalSearch;
