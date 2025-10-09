# API Data Comparison App

## Overview
This application connects to a REST API to retrieve over 7000 location data points and compares them with similar JSON data from a second application. The goal is to identify differences and similarities between the two datasets.

## Project Structure
```
api-data-comparison-app
├── src
│   ├── index.js         # Entry point of the application
│   ├── api.js           # Functions to connect to the REST API
│   └── compare.js       # Functions to compare location data
├── package.json         # NPM configuration file
└── README.md            # Documentation for the project
```

## Setup Instructions
1. Clone the repository:
   ```
   git clone <repository-url>
   ```
2. Navigate to the project directory:
   ```
   cd api-data-comparison-app
   ```
3. Install the dependencies:
   ```
   npm install
   ```

## Usage
To run the application, execute the following command:
```
node src/index.js
```

## API Information
The application retrieves location data from a specified REST API. Ensure that you have the correct API endpoint configured in `src/api.js`.

## Comparison Logic
The comparison of location data is handled in `src/compare.js`. The `compareLocations` function takes two datasets and returns the differences or similarities.

## Contributing
If you would like to contribute to this project, please fork the repository and submit a pull request with your changes.

## License
This project is licensed under the MIT License.