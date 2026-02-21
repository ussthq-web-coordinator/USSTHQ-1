/**
 * Extract IDs with Phone Numbers from RSYCLeaders.json
 * This script fetches the RSYCLeaders.json file and extracts all entries that have phone numbers
 */

// Helper function to fetch JSON with CORS handling
async function fetchJSON(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error(`Failed to fetch ${url}:`, error.message);
        return null;
    }
}

// Helper function to extract phone number from various possible field names
function extractPhoneNumber(leader) {
    // Check various possible phone number field names
    const phoneFields = [
        'PhoneNumber',
        'phone', 
        'Phone',
        'contactPhone',
        'ContactPhone',
        'phoneNumber',
        'telephone',
        'Telephone'
    ];
    
    for (const field of phoneFields) {
        if (leader[field] && typeof leader[field] === 'string' && leader[field].trim()) {
            return leader[field].trim();
        }
        // Check for SharePoint .Value pattern
        if (leader[field] && leader[field].Value && typeof leader[field].Value === 'string') {
            return leader[field].Value.trim();
        }
    }
    
    // Check nested Person object for phone numbers
    if (leader.Person) {
        for (const field of phoneFields) {
            if (leader.Person[field] && typeof leader.Person[field] === 'string' && leader.Person[field].trim()) {
                return leader.Person[field].trim();
            }
        }
    }
    
    return null;
}

// Helper function to get person's name
function getPersonName(leader) {
    // Try various name fields
    if (leader.Person && leader.Person.DisplayName) {
        return leader.Person.DisplayName;
    }
    if (leader.AlternateName) {
        return leader.AlternateName;
    }
    if (leader.PositionTitle) {
        return leader.PositionTitle;
    }
    return `ID ${leader.ID}`;
}

// Main extraction function
async function extractPhoneNumbers() {
    console.log('🔍 Extracting phone numbers from RSYCLeaders.json...');
    
    try {
        // Fetch the leaders data
        const leadersData = await fetchJSON('https://thisishoperva.org/rsyc/RSYCLeaders.json');
        
        if (!leadersData || !Array.isArray(leadersData)) {
            console.error('❌ Failed to load leaders data or data is not an array');
            return;
        }
        
        console.log(`📊 Processing ${leadersData.length} leader entries...`);
        
        // Extract entries with phone numbers
        const entriesWithPhones = [];
        
        leadersData.forEach(leader => {
            const phoneNumber = extractPhoneNumber(leader);
            
            if (phoneNumber) {
                const personName = getPersonName(leader);
                entriesWithPhones.push({
                    id: leader.ID,
                    name: personName,
                    phone: phoneNumber,
                    center: leader.Center && leader.Center[0] ? leader.Center[0].Value : 'Unknown',
                    roleType: leader.RoleType && leader.RoleType.Value ? leader.RoleType.Value : 'Unknown'
                });
            }
        });
        
        // Sort by ID for easy reference
        entriesWithPhones.sort((a, b) => a.id - b.id);
        
        // Display results
        console.log(`\n✅ Found ${entriesWithPhones.length} entries with phone numbers:\n`);
        console.log('=' .repeat(80));
        console.log('ID\tPhone Number\t\tName\t\t\tCenter');
        console.log('=' .repeat(80));
        
        entriesWithPhones.forEach(entry => {
            const idStr = entry.id.toString().padEnd(6);
            const phoneStr = entry.phone.padEnd(20);
            const nameStr = (entry.name.length > 20 ? entry.name.substring(0, 17) + '...' : entry.name).padEnd(20);
            const centerStr = entry.center.length > 15 ? entry.center.substring(0, 12) + '...' : entry.center;
            
            console.log(`${idStr}\t${phoneStr}\t${nameStr}\t${centerStr}`);
        });
        
        console.log('\n' + '=' .repeat(80));
        console.log(`📋 Summary: ${entriesWithPhones.length} out of ${leadersData.length} leaders have phone numbers`);
        
        // Return the data for potential further processing
        return entriesWithPhones;
        
    } catch (error) {
        console.error('❌ Error during extraction:', error.message);
        return [];
    }
}

// Export for use in other scripts or run immediately
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { extractPhoneNumbers };
} else {
    // Run immediately if loaded in browser
    extractPhoneNumbers().then(results => {
        console.log('\n🎉 Extraction complete!');
        console.log('💡 You can access the results via the returned array if needed.');
    });
}
