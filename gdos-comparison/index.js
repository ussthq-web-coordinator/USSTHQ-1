import { fetchLocations } from './api';
import { compareLocations } from './compare';

const init = async () => {
    try {
        const locations = await fetchLocations();
        const secondAppData = await fetch('URL_TO_SECOND_APP_DATA').then(response => response.json());
        
        const comparisonResult = compareLocations(locations, secondAppData);
        
        console.log('Comparison Result:', comparisonResult);
    } catch (error) {
        console.error('Error initializing application:', error);
    }
};

init();