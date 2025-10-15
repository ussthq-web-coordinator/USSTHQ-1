const compareLocations = (dataSet1, dataSet2) => {
    const differences = [];
    const similarities = [];

    dataSet1.forEach(location1 => {
        const match = dataSet2.find(location2 => location1.id === location2.id);
        if (match) {
            similarities.push({ ...location1, ...match });
        } else {
            differences.push(location1);
        }
    });

    dataSet2.forEach(location2 => {
        const match = dataSet1.find(location1 => location1.id === location2.id);
        if (!match) {
            differences.push(location2);
        }
    });

    return { similarities, differences };
};

export { compareLocations };