import { useState, useEffect } from "react";
import axios from "axios";
import { config } from "../config";
import { useQuery } from "@tanstack/react-query";

export const useContacts = () => {
  return useQuery({
    queryKey: ["contacts"],
    queryFn: async () => {
      const res = await axios.get(`${config.REACT_APP_API_URL}/contacts`);
      return res.data;
    },
    staleTime: 1000 * 60 * 10, // cache for 10 min
  });
};

export const useIndividualLogin = (params) => {
  const { data: contacts, isLoading: contactsLoading } = useContacts();
  const [matchedContact, setMatchedContact] = useState(null);

  useEffect(() => {
    if (!contacts) return;

    if (params?.type === "outsourced") {
      setMatchedContact(contacts);
      return;
    }

    // if (
    //   !params?.linkedIn_email &&
    //   !(params?.isProfileCompleteStateOrg && params?.contactEmailFromOrg)
    // ) {
    //   isLoading = false;
    //   return;
    // }

    const emailToMatch = params?.isProfileCompleteStateOrg
      ? params?.contactEmailFromOrg
      : params?.linkedIn_email;

    if (emailToMatch) {
      const match = contacts.find((c) => c.email === emailToMatch);
      setMatchedContact(match || null);
    }
  }, [contacts, params]);

  return {
    matchedContact,
    loading: contactsLoading,
  };
};

// export const useIndividualLogin = (
//   ParmasArgs
//   //   {
//   //   type,
//   //   linkedIn_email,
//   //   isProfileCompleteStateOrg,
//   //   contactEmailFromOrg,
//   // }
// ) => {
//   const [matchedContact, setMatchedContact] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   console.log("ParmasArgs in useIndividualLogin", ParmasArgs);

//   useEffect(() => {
//     const fetchAndMatchContact = async () => {
//       if (
//         !ParmasArgs?.linkedIn_email &&
//         !(
//           ParmasArgs?.isProfileCompleteStateOrg &&
//           ParmasArgs?.contactEmailFromOrg
//         )
//       ) {
//         setLoading(false);
//         return;
//       }

//       try {
//         setLoading(true);
//         const response = await axios.get(
//           `${config.REACT_APP_API_URL}/contacts`
//         );
//         const contacts = response.data;
//         console.log("contacts fetchAndMatchContact", contacts);

//         // Find contact whose email matches linkedIn_email or contactEmailFromOrg
//         const emailToMatch = ParmasArgs?.isProfileCompleteStateOrg
//           ? ParmasArgs?.contactEmailFromOrg
//           : ParmasArgs?.linkedIn_email;
//         const matched = contacts.find(
//           (contact) => contact.email === emailToMatch
//         );

//         if (ParmasArgs?.type === "outsourced") {
//           setMatchedContact(contacts); // Set to empty object if no match found for outsourced type
//         }
//         if (matched) {
//           setMatchedContact(matched);
//         }
//         // else {
//         //   setMatchedContact(null);
//         // }
//       } catch (err) {
//         setError(err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchAndMatchContact();
//   }, [ParmasArgs]);

//   return { matchedContact, loading, error };
// };
