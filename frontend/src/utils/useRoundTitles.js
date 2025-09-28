// useRoundTitles.js
import { useState, useEffect } from 'react';
import { 
  ROUND_TITLES, 
  getRoundTitleByValue, 
  isAssessmentRound,
  isTechnicalRound,
  isFinalRound,
  isHRRound,
  ASSESSMENT_VALUE,
  OTHER_VALUE
} from '../Pages/Dashboard-Part/Tabs/CommonCode-AllTabs/roundTitlesConfig';

export const useRoundTitles = (initialRoundTitle = '') => {
  const [roundTitle, setRoundTitle] = useState('');
  const [customRoundTitle, setCustomRoundTitle] = useState('');
  const [isCustomRoundTitle, setIsCustomRoundTitle] = useState(false);

  // Initialize based on existing value
  useEffect(() => {
    if (initialRoundTitle) {
      const titleConfig = getRoundTitleByValue(initialRoundTitle);
      
      // Check if it's a custom title (not found in predefined titles)
      if (titleConfig.id === ROUND_TITLES.OTHER.id || 
          !Object.values(ROUND_TITLES).some(title => title.value === initialRoundTitle)) {
        setIsCustomRoundTitle(true);
        setCustomRoundTitle(initialRoundTitle);
        setRoundTitle(OTHER_VALUE);
      } else {
        setRoundTitle(initialRoundTitle);
        setIsCustomRoundTitle(false);
        setCustomRoundTitle('');
      }
    } else {
      // Initialize with empty values
      setRoundTitle('');
      setCustomRoundTitle('');
      setIsCustomRoundTitle(false);
    }
  }, [initialRoundTitle]);

  const handleRoundTitleChange = (selectedValue) => {
    if (!selectedValue) {
      // Handle empty selection
      setRoundTitle('');
      setIsCustomRoundTitle(false);
      setCustomRoundTitle('');
      return;
    }

    if (selectedValue === OTHER_VALUE) {
      setIsCustomRoundTitle(true);
      setRoundTitle(OTHER_VALUE);
      setCustomRoundTitle('');
    } else {
      setIsCustomRoundTitle(false);
      setRoundTitle(selectedValue);
      setCustomRoundTitle('');
    }
  };

  const handleCustomRoundTitleChange = (value) => {
    setCustomRoundTitle(value);
  };

  const getFinalRoundTitle = () => {
    if (isCustomRoundTitle && customRoundTitle.trim()) {
      return customRoundTitle.trim();
    }
    return roundTitle;
  };

  const getRoundTitleConfig = () => {
    const finalTitle = getFinalRoundTitle();
    return getRoundTitleByValue(finalTitle);
  };

  const resetRoundTitle = () => {
    setRoundTitle('');
    setCustomRoundTitle('');
    setIsCustomRoundTitle(false);
  };

  const finalTitle = getFinalRoundTitle();
  const titleConfig = getRoundTitleConfig();

  return {
    roundTitle,
    customRoundTitle,
    isCustomRoundTitle,
    handleRoundTitleChange,
    handleCustomRoundTitleChange,
    getFinalRoundTitle,
    getRoundTitleConfig,
    resetRoundTitle,
    isAssessment: isAssessmentRound(finalTitle),
    isTechnical: isTechnicalRound(finalTitle),
    isFinal: isFinalRound(finalTitle),
    isHR: isHRRound(finalTitle),
    titleConfig
  };
};