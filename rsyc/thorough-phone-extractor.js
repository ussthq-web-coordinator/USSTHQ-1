/**
 * Thorough Phone Number Extractor for RSYCLeaders.json
 * This script will comprehensively search for phone numbers in all possible fields
 */

// Load the actual RSYCLeaders.json data and process it thoroughly
async function thoroughPhoneExtraction() {
    console.log('🔍 Starting thorough phone number extraction...');
    
    try {
        // Fetch the actual data
        const response = await fetch('https://thisishoperva.org/rsyc/RSYCLeaders.json');
        const leadersData = await response.json();
        
        console.log(`📊 Processing ${leadersData.length} leader entries...`);
        
        // Comprehensive phone number extraction
        const entriesWithPhones = [];
        
        leadersData.forEach((leader, index) => {
            const phoneNumbers = [];
            
            // Check ALL possible phone number fields
            const phoneFields = [
                'PhoneNumber',
                'phone', 
                'Phone',
                'contactPhone',
                'ContactPhone',
                'phoneNumber',
                'telephone',
                'Telephone',
                'mobile',
                'Mobile',
                'cell',
                'Cell',
                'workPhone',
                'WorkPhone',
                'homePhone',
                'HomePhone',
                'businessPhone',
                'BusinessPhone'
            ];
            
            // Check direct fields
            phoneFields.forEach(field => {
                if (leader[field]) {
                    if (typeof leader[field] === 'string' && leader[field].trim()) {
                        phoneNumbers.push(`${field}: ${leader[field].trim()}`);
                    } else if (leader[field].Value && typeof leader[field].Value === 'string' && leader[field].Value.trim()) {
                        phoneNumbers.push(`${field}: ${leader[field].Value.trim()}`);
                    }
                }
            });
            
            // Check nested Person object
            if (leader.Person) {
                phoneFields.forEach(field => {
                    if (leader.Person[field]) {
                        if (typeof leader.Person[field] === 'string' && leader.Person[field].trim()) {
                            phoneNumbers.push(`Person.${field}: ${leader.Person[field].trim()}`);
                        } else if (leader.Person[field].Value && typeof leader.Person[field].Value === 'string' && leader.Person[field].Value.trim()) {
                            phoneNumbers.push(`Person.${field}: ${leader.Person[field].Value.trim()}`);
                        }
                    }
                });
            }
            
            // Check for phone numbers in any string field (regex pattern)
            const phoneRegex = /(\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})/g;
            
            // Check all string fields for phone number patterns
            Object.keys(leader).forEach(key => {
                if (typeof leader[key] === 'string') {
                    const matches = leader[key].match(phoneRegex);
                    if (matches) {
                        matches.forEach(match => {
                            if (!phoneNumbers.includes(match)) {
                                phoneNumbers.push(`${key}: ${match}`);
                            }
                        });
                    }
                }
            });
            
            // If any phone numbers found, add to results
            if (phoneNumbers.length > 0) {
                const personName = leader.Person?.DisplayName || 
                                 leader.AlternateName || 
                                 leader.PositionTitle || 
                                 `ID ${leader.ID}`;
                
                const center = leader.Center && leader.Center[0] ? leader.Center[0].Value : 'Unknown';
                const roleType = leader.RoleType && leader.RoleType.Value ? leader.RoleType.Value : 'Unknown';
                
                entriesWithPhones.push({
                    id: leader.ID,
                    name: personName,
                    center: center,
                    roleType: roleType,
                    phoneNumbers: phoneNumbers,
                    rawEntry: leader // Include raw data for debugging
                });
            }
        });
        
        // Sort by ID
        entriesWithPhones.sort((a, b) => a.id - b.id);
        
        // Display comprehensive results
        console.log('\n' + '='.repeat(100));
        console.log('📋 COMPREHENSIVE PHONE NUMBER ANALYSIS RESULTS');
        console.log('='.repeat(100));
        console.log(`✅ Found ${entriesWithPhones.length} leaders with phone numbers (out of ${leadersData.length} total)`);
        console.log(`📈 Coverage: ${((entriesWithPhones.length / leadersData.length) * 100).toFixed(1)}%\n`);
        
        // Detailed breakdown
        entriesWithPhones.forEach((entry, index) => {
            console.log(`${index + 1}. ID: ${entry.id}`);
            console.log(`   Name: ${entry.name}`);
            console.log(`   Center: ${entry.center}`);
            console.log(`   Role: ${entry.roleType}`);
            console.log(`   Phone Numbers:`);
            entry.phoneNumbers.forEach(phone => {
                console.log(`     - ${phone}`);
            });
            console.log('');
        });
        
        console.log('='.repeat(100));
        console.log('✅ Thorough extraction complete!');
        
        return entriesWithPhones;
        
    } catch (error) {
        console.error('❌ Error during thorough extraction:', error.message);
        return [];
    }
}

// Auto-run in browser
if (typeof window !== 'undefined') {
    thoroughPhoneExtraction();
}
