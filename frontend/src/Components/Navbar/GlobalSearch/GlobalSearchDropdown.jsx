import React from 'react';
import { Search, ArrowRight } from 'lucide-react';

const GlobalSearchDropdown = ({ query, selectedIndex, onSelect }) => {
    const options = [
        {
            mode: 'contains',
            title: 'contains',
            description: 'Search anywhere in text'
        },
        {
            mode: 'startsWith',
            title: 'starts with',
            description: 'Search at beginning of text'
        }
    ];

    return (
        <div className="global-search-dropdown">
            <div className="global-search-dropdown-header">
                Search for "<strong>{query}</strong>"
            </div>

            {options.map((option, index) => (
                <div
                    key={option.mode}
                    className={`global-search-option ${selectedIndex === index ? 'selected' : ''}`}
                    onClick={() => onSelect(option.mode)}
                >
                    <div className="global-search-option-icon">
                        <Search size={16} />
                    </div>
                    <div className="global-search-option-content">
                        <div className="global-search-option-title">
                            Searched for "<strong>{query}</strong>" {option.title}
                        </div>
                        <div className="global-search-option-description">
                            {option.description}
                        </div>
                    </div>
                    <ArrowRight size={16} style={{ color: '#94a3b8' }} />
                </div>
            ))}

            <div className="global-search-dropdown-footer">
                <span>Press</span>
                <kbd>Enter</kbd>
                <span>to search or</span>
                <kbd>↑</kbd>
                <kbd>↓</kbd>
                <span>to navigate</span>
            </div>
        </div>
    );
};

export default GlobalSearchDropdown;
