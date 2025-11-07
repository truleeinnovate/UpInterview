// useEnterpriseContacts.js
import { useState, useEffect } from 'react';
import axios from 'axios';
import { config } from '../../config';

export const useEnterpriseContacts = (queryParams = {}) => {
    const [enterpriseContacts, setEnterpriseContacts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [totalCount, setTotalCount] = useState(0);

    const fetchEnterpriseContacts = async () => {
        try {
            setIsLoading(true);
            setError(null);
            
            console.log('Fetching enterprise contacts with params:', queryParams);
            
            // Build query parameters
            const params = new URLSearchParams();
            Object.entries(queryParams).forEach(([key, value]) => {
                if (value !== undefined && value !== null && value !== '') {
                    if (typeof value === 'object' && !Array.isArray(value)) {
                        // Handle nested objects like dateRange
                        Object.entries(value).forEach(([subKey, subValue]) => {
                            if (subValue) {
                                params.append(`${key}.${subKey}`, subValue);
                            }
                        });
                    } else {
                        params.append(key, value);
                    }
                }
            });

            const response = await axios.get(
                `${config.REACT_APP_API_URL}/upinterviewEnterpriseContact?${params.toString()}`
            );
            
            console.log('API Response:', response.data);
            
            const { contacts, total } = response.data;
            
            if (Array.isArray(contacts)) {
                console.log(`Received ${contacts.length} contacts from API`);
                
                // Transform the data for the frontend
                const formattedData = contacts.map(contact => ({
                    id: contact._id,
                    _id: contact._id,
                    companyName: contact.companyName || 'N/A',
                    contactPerson: [contact.firstName, contact.lastName]
                        .filter(Boolean)
                        .join(' ')
                        .trim() || 'N/A',
                    email: contact.workEmail || 'N/A',
                    phone: contact.phone || 'N/A',
                    jobTitle: contact.jobTitle || 'N/A',
                    companySize: contact.companySize || 'N/A',
                    status: (contact.status || 'new').toLowerCase(),
                    createdAt: contact.createdAt ? 
                        new Date(contact.createdAt).toISOString() : 
                        new Date().toISOString(),
                    name: [contact.firstName, contact.lastName]
                        .filter(Boolean)
                        .join(' ')
                        .trim() || 'N/A',
                    company: contact.companyName || 'N/A',
                    message: contact.additionalDetails || ''
                }));
                
                console.log('Formatted contacts:', formattedData);
                setEnterpriseContacts(formattedData);
                setTotalCount(total || 0);
            }
        } catch (err) {
            console.error('Error fetching enterprise contacts:', err);
            setError(err.message || 'Failed to fetch enterprise contacts');
            setEnterpriseContacts([]);
            setTotalCount(0);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchEnterpriseContacts();
    }, [JSON.stringify(queryParams)]); // Re-fetch when queryParams change

    return { 
        enterpriseContacts, 
        totalCount,
        isLoading, 
        error, 
        refetch: fetchEnterpriseContacts 
    };
};

export default useEnterpriseContacts;