# Mountain Dew Property Viewer

A web application for browsing and copying site property values from the Mountain Dew database.

## Features

- **Site Filter**: Browse by site
- **Document Filter**: Select specific documents within a site
- **Property Type Filter**: Filter by property type (freetextarea, slides, stories, etc.)
- **Search**: Real-time search across all property values
- **Copy to Clipboard**: Easy one-click copy for any field value
- **JSON Formatting**: Pretty-printed JSON for objects arrays
- **Responsive Design**: Works on desktop and mobile

## Setup

### Prerequisites

- Node.js (v14 or higher)
- MySQL with the `mountaindew` database
- Access to the database

### Installation

1. Install dependencies:
```bash
npm install express mysql2 cors
```

2. Configure database connection in `mountaindew-server.js`:
```javascript
const dbConfig = {
    host: 'localhost',
    user: 'your_username',
    password: 'your_password',
    database: 'mountaindew',
    charset: 'utf8mb4'
};
```

3. Start the server:
```bash
node mountaindew-server.js
```

4. Open `http://localhost:3000/mountaindew-property-viewer.html` in your browser

## Usage

1. **Select a Site**: Choose from the dropdown to load documents
2. **Select a Document**: Pick a specific document to view its properties
3. **Click "Load Properties"**: Fetch all property data
4. **Filter & Search**: Use the property type filter or search box to narrow results
5. **Copy Values**: Click the "Copy" button on any field to copy to clipboard

## Property Types Supported

- freetextarea
- slides
- stories
- accordiongroup
- mediaboxhalf
- cards
- localsites
- countdown
- formbuilder
- eventpagecontent
- whitetitlearea
- ministries
- givingtoolbar
- testimonialbox
- eligibility
- theatreimage
- boardmembers
- And more...

## API Endpoints

- `GET /api/mountaindew/sites` - Get all sites
- `GET /api/mountaindew/documents?siteId=<id>` - Get documents by site
- `GET /api/mountaindew/properties?documentId=<id>` - Get properties for a document

## Schema

The application queries the following tables:
- `site` - Site information
- `document` - Document/page data
- `site_property` - Property values stored as JSON
- `structure` - Site structure/hierarchy

Property values are parsed from the `custom_head_content` JSON field in the `document` table.
