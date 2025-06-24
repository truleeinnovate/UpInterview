import { useState, useEffect } from 'react';
import axios from 'axios';
import { config } from '../config';

export const useIndividualLogin = (linkedIn_email, isProfileCompleteStateOrg, contactEmailFromOrg) => {
  const [matchedContact, setMatchedContact] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAndMatchContact = async () => {
      if (!linkedIn_email && !(isProfileCompleteStateOrg && contactEmailFromOrg)) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await axios.get(`${config.REACT_APP_API_URL}/contacts`);
        const contacts = response.data;

        // Find contact whose email matches linkedIn_email or contactEmailFromOrg
        const emailToMatch = isProfileCompleteStateOrg ? contactEmailFromOrg : linkedIn_email;
        const matched = contacts.find(contact => contact.email === emailToMatch);
        console.log("🚀 matchedContact in useIndividualLogin:", matchedContact)

        if (matched) {
          console.log("✅ Matched Contact:", matched);
          setMatchedContact(matched);
        } else {
          console.warn("❌ No contact matched the given email");
          setMatchedContact(null);
        }
      } catch (err) {
        console.error("Error fetching contacts:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAndMatchContact();
  }, [linkedIn_email, isProfileCompleteStateOrg, contactEmailFromOrg]);

  return { matchedContact, loading, error };
};
