/**
 * Standalone Phone Number Extractor for RSYCLeaders.json
 * Run this script in browser console or Node.js to extract phone numbers
 * 
 * Usage:
 * 1. Browser: Copy-paste this script into browser console and run extractPhoneNumbers()
 * 2. Node.js: node extract-phone-numbers-standalone.js
 */

// Sample data based on RSYCLeaders.json analysis
const sampleLeadersData = [
    {
        "ID": 105,
        "PhoneNumber": "803- 522- 2963",
        "Person": {
            "DisplayName": "Kathleen Hutto",
            "Email": "Kathleen.Hutto@uss.salvationarmy.org"
        },
        "Center": [{"Value": "Aiken Teen Center"}],
        "RoleType": {"Value": "Center Executive Director"}
    }
    // Add more entries as needed from the actual JSON
];

// Helper function to extract phone number from various possible field names
function extractPhoneNumber(leader) {
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
        let leadersData;
        
        // Try to fetch from URL first (browser environment)
        if (typeof fetch !== 'undefined') {
            try {
                const response = await fetch('https://thisishoperva.org/rsyc/RSYCLeaders.json');
                if (response.ok) {
                    leadersData = await response.json();
                    console.log('📡 Fetched data from URL');
                } else {
                    throw new Error('HTTP response not ok');
                }
            } catch (fetchError) {
                console.log('⚠️ Could not fetch from URL, using sample data');
                leadersData = sampleLeadersData;
            }
        } else {
            // Node.js environment - use sample data
            console.log('📦 Using sample data (Node.js environment)');
            leadersData = sampleLeadersData;
        }
        
        if (!leadersData || !Array.isArray(leadersData)) {
            console.error('❌ Failed to load leaders data or data is not an array');
            return [];
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
        console.log('\n' + '='.repeat(80));
        console.log('📋 RSYC LEADERS WITH PHONE NUMBERS');
        console.log('='.repeat(80));
        
        if (entriesWithPhones.length === 0) {
            console.log('❌ No phone numbers found in the dataset');
        } else {
            console.log('ID\tPhone Number\t\tName\t\t\tCenter');
            console.log('='.repeat(80));
            
            entriesWithPhones.forEach(entry => {
                const idStr = entry.id.toString().padEnd(6);
                const phoneStr = entry.phone.padEnd(20);
                const nameStr = (entry.name.length > 20 ? entry.name.substring(0, 17) + '...' : entry.name).padEnd(20);
                const centerStr = entry.center.length > 15 ? entry.center.substring(0, 12) + '...' : entry.center;
                
                console.log(`${idStr}\t${phoneStr}\t${nameStr}\t${centerStr}`);
            });
            
            console.log('\n' + '='.repeat(80));
            console.log(`📊 SUMMARY: ${entriesWithPhones.length} out of ${leadersData.length} leaders have phone numbers`);
            console.log(`📈 Percentage: ${((entriesWithPhones.length / leadersData.length) * 100).toFixed(1)}%`);
            
            console.log('\n📝 DETAILED INFORMATION:');
            console.log('-'.repeat(80));
            entriesWithPhones.forEach(entry => {
                console.log(`ID: ${entry.id}`);
                console.log(`Name: ${entry.name}`);
                console.log(`Phone: ${entry.phone}`);
                console.log(`Center: ${entry.center}`);
                console.log(`Role: ${entry.roleType}`);
                console.log('-'.repeat(40));
            });
        }
        
        console.log('\n' + '='.repeat(80));
        console.log('✅ Extraction complete!');
        
        return entriesWithPhones;
        
    } catch (error) {
        console.error('❌ Error during extraction:', error.message);
        return [];
    }
}

// Auto-run if in browser
if (typeof window !== 'undefined') {
    console.log('🌐 Browser environment detected. Run extractPhoneNumbers() to start extraction.');
} else {
    // Node.js environment
    console.log('🖥️ Node.js environment detected. Running extraction...');
    extractPhoneNumbers();
}

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { extractPhoneNumbers, extractPhoneNumber, getPersonName };
}
