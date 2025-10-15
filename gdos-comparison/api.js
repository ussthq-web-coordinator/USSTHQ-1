import axios from 'axios';

const API_URL = 'https://api.example.com/locations'; // Replace with the actual API URL

export const fetchLocations = async () => {
    try {
        const response = await axios.get(API_URL);
        return response.data;
    } catch (error) {
        console.error('Error fetching locations:', error);
        throw error;
    }
};