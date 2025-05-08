    // State Tithely Links
    const tithelyData = [
  { state: "Alabama", name: "The Salvation Army – Alabaster Corps AL", url: "https://tithe.ly/give?c=1980457" },
  { state: "Alabama", name: "The Salvation Army – Anniston Corps", url: "https://tithe.ly/give?c=1756299" },
  { state: "Alabama", name: "The Salvation Army – Birmingham 614 Corps AL", url: "https://tithe.ly/give?c=1756308" },
  { state: "Alabama", name: "The Salvation Army – Decatur Corps", url: "https://tithe.ly/give?c=1756324" },
  { state: "Alabama", name: "The Salvation Army – Dothan AL", url: "https://tithe.ly/give?c=1756331" },
  { state: "Alabama", name: "The Salvation Army – Florence Corps AL", url: "https://tithe.ly/give?c=1756334" },
  { state: "Alabama", name: "The Salvation Army – Gadsden AL", url: "https://tithe.ly/give?c=1756343" },
  { state: "Alabama", name: "The Salvation Army – Huntsville Corps AL", url: "https://tithe.ly/give?c=1756367" },
  { state: "Alabama", name: "The Salvation Army – Mobile County Corps AL", url: "https://tithe.ly/give?c=1756404" },
  { state: "Alabama", name: "The Salvation Army – Montgomery Corps AL", url: "https://tithe.ly/give?c=1756413" },
  { state: "Alabama", name: "The Salvation Army – Tuscaloosa Corps AL", url: "https://tithe.ly/give?c=1756441" },
  // Florida

  { state: "Arkansas", name: "The Salvation Army – Conway AR", url: "https://tithe.ly/give?c=1752932" },
  { state: "Arkansas", name: "The Salvation Army – El Dorado AR", url: "https://tithe.ly/give?c=1752938" },
  { state: "Arkansas", name: "The Salvation Army – Fayetteville AR", url: "https://tithe.ly/give?c=1752957" },
  { state: "Arkansas", name: "The Salvation Army – Fort Smith AR", url: "https://tithe.ly/give?c=1752959" },
  { state: "Arkansas", name: "The Salvation Army – Hot Springs AR", url: "https://tithe.ly/give?c=1752963" },
  { state: "Arkansas", name: "The Salvation Army – Jonesboro AR", url: "https://tithe.ly/give?c=1752965" },
  { state: "Arkansas", name: "The Salvation Army – Mountain Home AR", url: "https://tithe.ly/give?c=1752970" },
  { state: "Arkansas", name: "The Salvation Army – North Little Rock AR", url: "https://tithe.ly/give?c=1866160" },
  { state: "Arkansas", name: "The Salvation Army – Pine Bluff AR", url: "https://tithe.ly/give?c=1866578" },
  { state: "Arkansas", name: "The Salvation Army – Rogers AR", url: "https://tithe.ly/give?c=1753040" },
  { state: "Arkansas", name: "The Salvation Army – Russellville AR", url: "https://tithe.ly/give?c=1753043" },
  { state: "Arkansas", name: "The Salvation Army – Springdale AR", url: "https://tithe.ly/give?c=1753052" },
  // Arkansas
  { state: "Florida", name: "The Salvation Army – Boca Raton Corps FL", url: "https://tithe.ly/give?c=1756463" },
  { state: "Florida", name: "The Salvation Army – Bradenton Corps FL", url: "https://tithe.ly/give?c=1756465" },
  { state: "Florida", name: "The Salvation Army – Citrus County Corps FL", url: "https://tithe.ly/give?c=1756473" },
  { state: "Florida", name: "The Salvation Army – Clay County Corps FL", url: "https://tithe.ly/give?c=1756478" },
  { state: "Florida", name: "The Salvation Army – Clearwater Corps FL", url: "https://tithe.ly/give?c=1756482" },
  { state: "Florida", name: "The Salvation Army – Daytona Beach Corps FL", url: "https://tithe.ly/give?c=1756489" },
  { state: "Florida", name: "The Salvation Army – Ft Lauderdale FL", url: "https://tithe.ly/give?c=1756492" },
  { state: "Florida", name: "The Salvation Army – Ft Myers FL", url: "https://tithe.ly/give?c=1756496" },
  { state: "Florida", name: "The Salvation Army – Ft Walton Beach FL", url: "https://tithe.ly/give?c=1756500" },
  { state: "Florida", name: "The Salvation Army – Gainesville FL", url: "https://tithe.ly/give?c=1756505" },
  { state: "Florida", name: "The Salvation Army – Jacksonville FL", url: "https://tithe.ly/give?c=1756508" },
  { state: "Florida", name: "The Salvation Army – Lakeland FL", url: "https://tithe.ly/give?c=1756513" },
  { state: "Florida", name: "The Salvation Army – Leesburg FL", url: "https://tithe.ly/give?c=1756516" },
  { state: "Florida", name: "The Salvation Army – Manatee County FL", url: "https://tithe.ly/give?c=1756520" },
  { state: "Florida", name: "The Salvation Army – Melbourne FL", url: "https://tithe.ly/give?c=1756525" },
  { state: "Florida", name: "The Salvation Army – Miami Area Command FL", url: "https://tithe.ly/give?c=1756530" },
  { state: "Florida", name: "The Salvation Army – Naples FL", url: "https://tithe.ly/give?c=1756534" },
  { state: "Florida", name: "The Salvation Army – Ocala FL", url: "https://tithe.ly/give?c=1756538" },
  { state: "Florida", name: "The Salvation Army – Orlando Area Command FL", url: "https://tithe.ly/give?c=1756543" },
  { state: "Florida", name: "The Salvation Army – Panama City FL", url: "https://tithe.ly/give?c=1756547" },
  { state: "Florida", name: "The Salvation Army – Pensacola FL", url: "https://tithe.ly/give?c=1756552" },
  { state: "Florida", name: "The Salvation Army – Sarasota FL", url: "https://tithe.ly/give?c=1756556" },
  { state: "Florida", name: "The Salvation Army – Sebring FL", url: "https://tithe.ly/give?c=1756560" },
  { state: "Florida", name: "The Salvation Army – St. Augustine FL", url: "https://tithe.ly/give?c=1756564" },
  { state: "Florida", name: "The Salvation Army – St. Petersburg FL", url: "https://tithe.ly/give?c=1756569" },
  { state: "Florida", name: "The Salvation Army – Stuart FL", url: "https://tithe.ly/give?c=1756572" },
  { state: "Florida", name: "The Salvation Army – Tallahassee FL", url: "https://tithe.ly/give?c=1756576" },
  { state: "Florida", name: "The Salvation Army – Tampa FL", url: "https://tithe.ly/give?c=1756580" },
  { state: "Florida", name: "The Salvation Army – Vero Beach FL", url: "https://tithe.ly/give?c=1756584" },
  { state: "Florida", name: "The Salvation Army – West Palm Beach FL", url: "https://tithe.ly/give?c=1756588" },
  // Georgia
  { state: "Georgia", name: "The Salvation Army – Albany Corps GA", url: "https://tithe.ly/give?c=1756594" },
  { state: "Georgia", name: "The Salvation Army – Atlanta International Corps GA", url: "https://tithe.ly/give?c=1756596" },
  { state: "Georgia", name: "The Salvation Army – Atlanta Kroc Center GA", url: "https://tithe.ly/give?c=1756598" },
  { state: "Georgia", name: "The Salvation Army – Atlanta Temple Corps GA", url: "https://tithe.ly/give?c=1756600" },
  { state: "Georgia", name: "The Salvation Army – Augusta GA", url: "https://tithe.ly/give?c=1756602" },
  { state: "Georgia", name: "The Salvation Army – Bainbridge Corps GA", url: "https://tithe.ly/give?c=1756604" },
  { state: "Georgia", name: "The Salvation Army – Brunswick Corps GA", url: "https://tithe.ly/give?c=1756606" },
  { state: "Georgia", name: "The Salvation Army – Columbus Corps GA", url: "https://tithe.ly/give?c=1756608" },
  { state: "Georgia", name: "The Salvation Army – Dalton Corps GA", url: "https://tithe.ly/give?c=1756610" },
  { state: "Georgia", name: "The Salvation Army – Griffin Corps GA", url: "https://tithe.ly/give?c=1756612" },
  { state: "Georgia", name: "The Salvation Army – Gwinnett County Corps GA", url: "https://tithe.ly/give?c=1756614" },
  { state: "Georgia", name: "The Salvation Army – Newnan Corps GA", url: "https://tithe.ly/give?c=1756616" },
  { state: "Georgia", name: "The Salvation Army – Rome Corps GA", url: "https://tithe.ly/give?c=1756618" },
  { state: "Georgia", name: "The Salvation Army – Savannah Corps GA", url: "https://tithe.ly/give?c=1756620" },
  { state: "Georgia", name: "The Salvation Army – Thomasville GA", url: "https://tithe.ly/give?c=1756622" },
  { state: "Georgia", name: "The Salvation Army – Toccoa GA", url: "https://tithe.ly/give?c=1756624" },
  { state: "Georgia", name: "The Salvation Army – Valdosta GA", url: "https://tithe.ly/give?c=1756626" },
// Kentucky
{ state: "Kentucky", name: "The Salvation Army – Bowling Green Corps KY", url: "https://tithe.ly/give?c=1755973" },
{ state: "Kentucky", name: "The Salvation Army – Danville Corps KY", url: "https://tithe.ly/give?c=1756008" },
{ state: "Kentucky", name: "The Salvation Army – Elizabethtown Corps KY", url: "https://tithe.ly/give?c=1756012" },
{ state: "Kentucky", name: "The Salvation Army – Frankfort Corps KY", url: "https://tithe.ly/give?c=1756025" },
{ state: "Kentucky", name: "The Salvation Army – Henderson Corps KY", url: "https://tithe.ly/give?c=1756029" },
{ state: "Kentucky", name: "The Salvation Army – Hopkinsville Corps KY", url: "https://tithe.ly/give?c=1756034" },
{ state: "Kentucky", name: "The Salvation Army – Louisville Portland Corps KY", url: "https://tithe.ly/give?c=1756077" },
{ state: "Kentucky", name: "The Salvation Army – Louisville Sanders Mission KY", url: "https://tithe.ly/give?c=1756089" },
{ state: "Kentucky", name: "The Salvation Army – Louisville South Corps KY", url: "https://tithe.ly/give?c=1756094" },
{ state: "Kentucky", name: "The Salvation Army – Madisonville Corps KY", url: "https://tithe.ly/give?c=1756098" },
{ state: "Kentucky", name: "The Salvation Army – Middlesboro Corps KY", url: "https://tithe.ly/give?c=1756217" },
{ state: "Kentucky", name: "The Salvation Army – Owensboro Corps KY", url: "https://tithe.ly/give?c=1756254" },
{ state: "Kentucky", name: "The Salvation Army – Paducah Corps KY", url: "https://tithe.ly/give?c=1756261" },
{ state: "Kentucky", name: "The Salvation Army – Richmond Corps KY", url: "https://tithe.ly/give?c=1756264" },
// Louisiana
{ state: "Louisiana", name: "The Salvation Army – Alexandria LA Corps", url: "https://tithe.ly/give?c=1756295" },
{ state: "Louisiana", name: "The Salvation Army – Baton Rouge Corps", url: "https://tithe.ly/give?c=1756302" },
{ state: "Louisiana", name: "The Salvation Army – Lafayette Corps LA", url: "https://tithe.ly/give?c=1756375" },
{ state: "Louisiana", name: "The Salvation Army – Lake Charles Corps LA", url: "https://tithe.ly/give?c=1756381" },
{ state: "Louisiana", name: "The Salvation Army – Monroe Corps LA", url: "https://tithe.ly/give?c=1756407" },
{ state: "Louisiana", name: "The Salvation Army – New Orleans (Citadel) LA", url: "https://tithe.ly/give?c=1756418" },
{ state: "Louisiana", name: "The Salvation Army – Shreveport Corps LA", url: "https://tithe.ly/give?c=1756429" },
// Maryland
{ state: "Maryland", name: "The Salvation Army – Annapolis MD", url: "https://tithe.ly/give?c=1753085" },
{ state: "Maryland", name: "The Salvation Army – Baltimore Hampden MD", url: "https://tithe.ly/give?c=1753087" },
{ state: "Maryland", name: "The Salvation Army – Baltimore Middle River MD", url: "https://tithe.ly/give?c=1753091" },
{ state: "Maryland", name: "The Salvation Army – Baltimore Temple MD", url: "https://tithe.ly/give?c=1753114" },
{ state: "Maryland", name: "The Salvation Army – Cambridge MD", url: "https://tithe.ly/give?c=1753121" },
{ state: "Maryland", name: "The Salvation Army – Cumberland MD", url: "https://tithe.ly/give?c=1753131" },
{ state: "Maryland", name: "The Salvation Army – Frederick MD", url: "https://tithe.ly/give?c=1753135" },
{ state: "Maryland", name: "The Salvation Army – Hagerstown MD", url: "https://tithe.ly/give?c=1753139" },
{ state: "Maryland", name: "The Salvation Army – Havre De Grace MD", url: "https://tithe.ly/give?c=1753143" },
{ state: "Maryland", name: "The Salvation Army – Montgomery County MD", url: "https://tithe.ly/give?c=1753211" },
{ state: "Maryland", name: "The Salvation Army – Prince Georges MD", url: "https://tithe.ly/give?c=1753215" },
{ state: "Maryland", name: "The Salvation Army – Salisbury MD", url: "https://tithe.ly/give?c=1753153" },
{ state: "Maryland", name: "The Salvation Army – Waldorf MD", url: "https://tithe.ly/give?c=1861694" },
// Mississippi
{ state: "Mississippi", name: "The Salvation Army – Columbus MS Corps", url: "https://tithe.ly/give?c=1756311" },
{ state: "Mississippi", name: "The Salvation Army – Greenwood Corps MS", url: "https://tithe.ly/give?c=1756347" },
{ state: "Mississippi", name: "The Salvation Army – Gulf Coast Kroc Center MS", url: "https://tithe.ly/give?c=1756352" },
{ state: "Mississippi", name: "The Salvation Army – Hattiesburg Corps MS", url: "https://tithe.ly/give?c=1756360" },
{ state: "Mississippi", name: "The Salvation Army – Jackson Corps MS", url: "https://tithe.ly/give?c=1756371" },
{ state: "Mississippi", name: "The Salvation Army – Laurel Corps MS", url: "https://tithe.ly/give?c=1756389" },
{ state: "Mississippi", name: "The Salvation Army – Meridian Corps MS", url: "https://tithe.ly/give?c=1756392" },
{ state: "Mississippi", name: "The Salvation Army – Pascagoula Corps MS", url: "https://tithe.ly/give?c=1756423" },
{ state: "Mississippi", name: "The Salvation Army – Tupelo Corps MS", url: "https://tithe.ly/give?c=1756434" },
{ state: "Mississippi", name: "The Salvation Army – Vicksburg Corps MS", url: "https://tithe.ly/give?c=1756454" },
// North Carolina
  { state: "North Carolina", name: "The Salvation Army – Asheville Corps NC", url: "https://tithe.ly/give?c=1756700" },
  { state: "North Carolina", name: "The Salvation Army – Charlotte Corps NC", url: "https://tithe.ly/give?c=1756702" },
  { state: "North Carolina", name: "The Salvation Army – Durham Corps NC", url: "https://tithe.ly/give?c=1756704" },
  { state: "North Carolina", name: "The Salvation Army – Fayetteville Corps NC", url: "https://tithe.ly/give?c=1756706" },
  { state: "North Carolina", name: "The Salvation Army – Greensboro Corps NC", url: "https://tithe.ly/give?c=1756708" },
  { state: "North Carolina", name: "The Salvation Army – High Point Corps NC", url: "https://tithe.ly/give?c=1756710" },
  { state: "North Carolina", name: "The Salvation Army – Hickory Corps NC", url: "https://tithe.ly/give?c=1756712" },
  { state: "North Carolina", name: "The Salvation Army – Jacksonville Corps NC", url: "https://tithe.ly/give?c=1756714" },
  { state: "North Carolina", name: "The Salvation Army – Raleigh Corps NC", url: "https://tithe.ly/give?c=1756716" },
  { state: "North Carolina", name: "The Salvation Army – Rocky Mount Corps NC", url: "https://tithe.ly/give?c=1756718" },
  { state: "North Carolina", name: "The Salvation Army – Winston-Salem Corps NC", url: "https://tithe.ly/give?c=1756720" },
  { state: "North Carolina", name: "The Salvation Army – Wilmington Corps NC", url: "https://tithe.ly/give?c=1756722" },
  { state: "North Carolina", name: "The Salvation Army – Greenville Corps NC", url: "https://tithe.ly/give?c=1756724" },
  { state: "North Carolina", name: "The Salvation Army – Gastonia Corps NC", url: "https://tithe.ly/give?c=1756726" },
  { state: "North Carolina", name: "The Salvation Army – Salisbury Corps NC", url: "https://tithe.ly/give?c=1756728" },
  { state: "North Carolina", name: "The Salvation Army – Wilson Corps NC", url: "https://tithe.ly/give?c=1756730" },
// Oklahoma
{ state: "Oklahoma", name: "The Salvation Army – Altus OK", url: "https://tithe.ly/give?c=1752911" },
{ state: "Oklahoma", name: "The Salvation Army – Ardmore OK", url: "https://tithe.ly/give?c=1752922" },
{ state: "Oklahoma", name: "The Salvation Army – Bartlesville Corps", url: "https://tithe.ly/give?c=1846470" },
{ state: "Oklahoma", name: "The Salvation Army – Broken Arrow Corps", url: "https://tithe.ly/give?c=1846305" },
{ state: "Oklahoma", name: "The Salvation Army – Chickasha OK", url: "https://tithe.ly/give?c=1752927" },
{ state: "Oklahoma", name: "The Salvation Army – Enid OK", url: "https://tithe.ly/give?c=1752941" },
{ state: "Oklahoma", name: "The Salvation Army – Lawton OK", url: "https://tithe.ly/give?c=1752967" },
{ state: "Oklahoma", name: "The Salvation Army – Muskogee OK", url: "https://tithe.ly/give?c=1752973" },
{ state: "Oklahoma", name: "The Salvation Army – Norman OK", url: "https://tithe.ly/give?c=1752977" },
{ state: "Oklahoma", name: "The Salvation Army – OKC 614 Corps OK", url: "https://tithe.ly/give?c=1753016" },
{ state: "Oklahoma", name: "The Salvation Army – Oklahoma City Citadel OK", url: "https://tithe.ly/give?c=1753017" },
{ state: "Oklahoma", name: "The Salvation Army – Sand Springs OK", url: "https://tithe.ly/give?c=1753046" },
{ state: "Oklahoma", name: "The Salvation Army – Shawnee OK", url: "https://tithe.ly/give?c=1753050" },
{ state: "Oklahoma", name: "The Salvation Army – Stillwater OK", url: "https://tithe.ly/give?c=1753054" },
{ state: "Oklahoma", name: "The Salvation Army – Tulsa (Citadel) OK", url: "https://tithe.ly/give?c=1753055" },
// South Carolina
{ state: "South Carolina", name: "The Salvation Army – Aiken SC", url: "https://tithe.ly/give?c=1756927" },
{ state: "South Carolina", name: "The Salvation Army – Anderson SC", url: "https://tithe.ly/give?c=1756933" },
{ state: "South Carolina", name: "The Salvation Army – Beaufort SC", url: "https://tithe.ly/give?c=1756955" },
{ state: "South Carolina", name: "The Salvation Army – Charleston SC", url: "https://tithe.ly/give?c=1756976" },
{ state: "South Carolina", name: "The Salvation Army – Columbia SC", url: "https://tithe.ly/give?c=1760956" },
{ state: "South Carolina", name: "The Salvation Army – Conway SC", url: "https://tithe.ly/give?c=1757013" },
{ state: "South Carolina", name: "The Salvation Army – Florence SC", url: "https://tithe.ly/give?c=1757154" },
{ state: "South Carolina", name: "The Salvation Army – Gaffney SC", url: "https://tithe.ly/give?c=1757163" },
{ state: "South Carolina", name: "The Salvation Army – Georgetown SC", url: "https://tithe.ly/give?c=1757448" },
{ state: "South Carolina", name: "The Salvation Army – Greenville Kroc Center SC", url: "https://tithe.ly/give?c=1757481" },
{ state: "South Carolina", name: "The Salvation Army – Greenwood SC", url: "https://tithe.ly/give?c=1760858" },
{ state: "South Carolina", name: "The Salvation Army – Irmo SC", url: "https://tithe.ly/give?c=1760926" },
{ state: "South Carolina", name: "The Salvation Army – Orangeburg SC", url: "https://tithe.ly/give?c=1760990" },
{ state: "South Carolina", name: "The Salvation Army – Rock Hill SC", url: "https://tithe.ly/give?c=1761009" },
{ state: "South Carolina", name: "The Salvation Army – Rutherford 614 SC", url: "https://tithe.ly/give?c=1761029" },
{ state: "South Carolina", name: "The Salvation Army – Spartanburg SC", url: "https://tithe.ly/give?c=1761218" },
{ state: "South Carolina", name: "The Salvation Army – Sumter SC", url: "https://tithe.ly/give?c=1761244" },
// Tennessee
{ state: "Tennessee", name: "The Salvation Army – 614 Chattanooga TN", url: "https://tithe.ly/give?c=1755968" },
{ state: "Tennessee", name: "The Salvation Army – Bristol Corps TN", url: "https://tithe.ly/give?c=1755980" },
{ state: "Tennessee", name: "The Salvation Army – Chattanooga Citadel TN", url: "https://tithe.ly/give?c=1755985" },
{ state: "Tennessee", name: "The Salvation Army – Chattanooga East Lake Corps TN", url: "https://tithe.ly/give?c=1755991" },
{ state: "Tennessee", name: "The Salvation Army – Clarksville Corps TN", url: "https://tithe.ly/give?c=1755995" },
{ state: "Tennessee", name: "The Salvation Army – Cleveland Corps TN", url: "https://tithe.ly/give?c=1756000" },
{ state: "Tennessee", name: "The Salvation Army – Jackson Corps TN", url: "https://tithe.ly/give?c=1756040" },
{ state: "Tennessee", name: "The Salvation Army – Johnson City Corps TN", url: "https://tithe.ly/give?c=1756049" },
{ state: "Tennessee", name: "The Salvation Army – Kingsport Corps TN", url: "https://tithe.ly/give?c=1756053" },
{ state: "Tennessee", name: "The Salvation Army – Knoxville Corps TN", url: "https://tithe.ly/give?c=1756063" },
{ state: "Tennessee", name: "The Salvation Army – Lebanon Corps TN", url: "https://tithe.ly/give?c=1756070" },
{ state: "Tennessee", name: "The Salvation Army – Maryville Corps TN", url: "https://tithe.ly/give?c=1756194" },
{ state: "Tennessee", name: "The Salvation Army – Memphis Kroc Corps Community Center TN", url: "https://tithe.ly/give?c=1756205" },
{ state: "Tennessee", name: "The Salvation Army – Memphis Purdue Corps TN", url: "https://tithe.ly/give?c=1756210" },
{ state: "Tennessee", name: "The Salvation Army – Murfreesboro Corps TN", url: "https://tithe.ly/give?c=1756226" },
{ state: "Tennessee", name: "The Salvation Army – Nashville Berry St Corps TN", url: "https://tithe.ly/give?c=1756233" },
{ state: "Tennessee", name: "The Salvation Army – Nashville Citadel TN", url: "https://tithe.ly/give?c=1756240" },
{ state: "Tennessee", name: "The Salvation Army – Nashville South Corps TN", url: "https://tithe.ly/give?c=1756247" },
{ state: "Tennessee", name: "The Salvation Army – Sevierville Corps TN", url: "https://tithe.ly/give?c=1756289" },
// Texas
{ state: "Texas", name: "The Salvation Army – Abilene TX", url: "https://tithe.ly/give?c=1763322" },
{ state: "Texas", name: "The Salvation Army – Aldine-Westfield TX", url: "https://tithe.ly/give?c=1763328" },
{ state: "Texas", name: "The Salvation Army – Amarillo TX", url: "https://tithe.ly/give?c=1763335" },
{ state: "Texas", name: "The Salvation Army – Arlington TX", url: "https://tithe.ly/give?c=1763338" },
{ state: "Texas", name: "The Salvation Army – Austin Citadel TX", url: "https://tithe.ly/give?c=1763340" },
{ state: "Texas", name: "The Salvation Army – Beaumont TX", url: "https://tithe.ly/give?c=1763351" },
{ state: "Texas", name: "The Salvation Army – Big Spring TX", url: "https://tithe.ly/give?c=1763353" },
{ state: "Texas", name: "The Salvation Army – Bryan TX", url: "https://tithe.ly/give?c=1763358" },
{ state: "Texas", name: "The Salvation Army – Cleburne Service Center TX", url: "https://tithe.ly/give?c=1763368" },
{ state: "Texas", name: "The Salvation Army – Conroe TX", url: "https://tithe.ly/give?c=1763379" },
{ state: "Texas", name: "The Salvation Army – Corpus Christi TX", url: "https://tithe.ly/give?c=1763389" },
{ state: "Texas", name: "The Salvation Army – Corsicana TX", url: "https://tithe.ly/give?c=1763394" },
{ state: "Texas", name: "The Salvation Army – CPC Harbor Light TX", url: "https://tithe.ly/give?c=1763410" },
{ state: "Texas", name: "The Salvation Army – Dallas Oak Cliff TX", url: "https://tithe.ly/give?c=1763413" },
{ state: "Texas", name: "The Salvation Army – Dallas Pleasant Grove TX", url: "https://tithe.ly/give?c=1763419" },
{ state: "Texas", name: "The Salvation Army – Denton TX", url: "https://tithe.ly/give?c=1763426" },
{ state: "Texas", name: "The Salvation Army – El Paso TX", url: "https://tithe.ly/give?c=1764615" },
{ state: "Texas", name: "The Salvation Army – Fort Worth Lancaster TX", url: "https://tithe.ly/give?c=1763431" },
{ state: "Texas", name: "The Salvation Army – Freeport TX", url: "https://tithe.ly/give?c=1763436" },
{ state: "Texas", name: "The Salvation Army – Ft Worth Northside TX", url: "https://tithe.ly/give?c=1763441" },
{ state: "Texas", name: "The Salvation Army – Galveston TX RC", url: "https://tithe.ly/give?c=1763449" },
{ state: "Texas", name: "The Salvation Army – Garland TX", url: "https://tithe.ly/give?c=1763451" },
{ state: "Texas", name: "The Salvation Army – Harlingen TX", url: "https://tithe.ly/give?c=1763454" },
{ state: "Texas", name: "The Salvation Army – Houston International TX", url: "https://tithe.ly/give?c=1763459" },
{ state: "Texas", name: "The Salvation Army – Houston Northwest TX", url: "https://tithe.ly/give?c=1763469" },
{ state: "Texas", name: "The Salvation Army – Houston Temple TX", url: "https://tithe.ly/give?c=1763593" },
{ state: "Texas", name: "The Salvation Army – Irving TX", url: "https://tithe.ly/give?c=1763749" },
// Virginia
{ state: "Virginia", name: "The Salvation Army – Alexandria Citadel VA", url: "https://tithe.ly/give?c=1753189" },
{ state: "Virginia", name: "The Salvation Army – Arlington VA", url: "https://tithe.ly/give?c=1753190" },
{ state: "Virginia", name: "The Salvation Army – Charlottesville VA", url: "https://tithe.ly/give?c=1753191" },
{ state: "Virginia", name: "The Salvation Army – Covington VA", url: "https://tithe.ly/give?c=1753192" },
{ state: "Virginia", name: "The Salvation Army – Danville VA", url: "https://tithe.ly/give?c=1753194" },
{ state: "Virginia", name: "The Salvation Army – Fairfax VA", url: "https://tithe.ly/give?c=1753196" },
{ state: "Virginia", name: "The Salvation Army – Fredericksburg VA", url: "https://tithe.ly/give?c=1753197" },
{ state: "Virginia", name: "The Salvation Army – Front Royal VA", url: "https://tithe.ly/give?c=1753200" },
{ state: "Virginia", name: "The Salvation Army – Hampton Roads Kroc Center VA", url: "https://tithe.ly/give?c=1753202" },
{ state: "Virginia", name: "The Salvation Army – Harrisonburg VA", url: "https://tithe.ly/give?c=1753204" },
{ state: "Virginia", name: "The Salvation Army – Landmark VA", url: "https://tithe.ly/give?c=1753206" },
{ state: "Virginia", name: "The Salvation Army – Loudoun County VA", url: "https://tithe.ly/give?c=1753207" },
{ state: "Virginia", name: "The Salvation Army – Lynchburg VA", url: "https://tithe.ly/give?c=1753208" },
{ state: "Virginia", name: "The Salvation Army – Martinsville VA", url: "https://tithe.ly/give?c=1753210" },
{ state: "Virginia", name: "The Salvation Army – New River Valley VA", url: "https://tithe.ly/give?c=1753212" },
{ state: "Virginia", name: "The Salvation Army – Portsmouth VA", url: "https://tithe.ly/give?c=1753214" },
{ state: "Virginia", name: "The Salvation Army – Prince William County VA", url: "https://tithe.ly/give?c=1753217" },
{ state: "Virginia", name: "The Salvation Army – Richmond Citadel VA", url: "https://tithe.ly/give?c=1753218" },
{ state: "Virginia", name: "The Salvation Army – Roanoke VA", url: "https://tithe.ly/give?c=1753221" },
{ state: "Virginia", name: "The Salvation Army – Staunton VA", url: "https://tithe.ly/give?c=1753224" },
{ state: "Virginia", name: "The Salvation Army – Suffolk VA", url: "https://tithe.ly/give?c=1753225" },
{ state: "Virginia", name: "The Salvation Army – VA Piedmont Corps", url: "https://tithe.ly/give?c=1753227" },
{ state: "Virginia", name: "The Salvation Army – Virginia Peninsula Corps", url: "https://tithe.ly/give?c=1753228" },
{ state: "Virginia", name: "The Salvation Army – Waynesboro VA", url: "https://tithe.ly/give?c=1753244" },
{ state: "Virginia", name: "The Salvation Army – Williamsburg VA", url: "https://tithe.ly/give?c=1753246" },
{ state: "Virginia", name: "The Salvation Army – Winchester VA", url: "https://tithe.ly/give?c=1753248" },
// Washington, D.C.
{ state: "Washington, D.C.", name: "The Salvation Army – Washington Harbor Light Corps DC", url: "https://tithe.ly/give?c=1753238" },
{ state: "Washington, D.C.", name: "The Salvation Army – Washington S.G.B. DC", url: "https://tithe.ly/give?c=1753239" },
{ state: "Washington, D.C.", name: "The Salvation Army – Washington Sherman Ave DC", url: "https://tithe.ly/give?c=1753242" },
// West Virginia
{ state: "West Virginia", name: "The Salvation Army – Beckley WV", url: "https://tithe.ly/give?c=1753118" },
{ state: "West Virginia", name: "The Salvation Army – Charleston Citadel WV", url: "https://tithe.ly/give?c=1753122" },
{ state: "West Virginia", name: "The Salvation Army – Clarksburg WV", url: "https://tithe.ly/give?c=1753127" },
{ state: "West Virginia", name: "The Salvation Army – Grafton WV", url: "https://tithe.ly/give?c=1753137" },
{ state: "West Virginia", name: "The Salvation Army – Huntington WV", url: "https://tithe.ly/give?c=1753145" },
{ state: "West Virginia", name: "The Salvation Army – Martinsburg WV", url: "https://tithe.ly/give?c=1753146" },
{ state: "West Virginia", name: "The Salvation Army – Morgantown WV", url: "https://tithe.ly/give?c=1753149" },
{ state: "West Virginia", name: "The Salvation Army – Parkersburg WV", url: "https://tithe.ly/give?c=1753150" },
{ state: "West Virginia", name: "The Salvation Army – Princeton WV", url: "https://tithe.ly/give?c=1753152" },
{ state: "West Virginia", name: "The Salvation Army – Weirton WV", url: "https://tithe.ly/give?c=1753157" },
{ state: "West Virginia", name: "The Salvation Army – Wheeling WV", url: "https://tithe.ly/give?c=1753158" }
      // Add more states and corps here...
    ];

    const resultsContainer = document.getElementById("resultsContainer");
    const searchInput = document.getElementById("searchInput");
    const stateFilter = document.getElementById("stateFilter");

    // Populate state filter dropdown
    const states = [...new Set(tithelyData.map(item => item.state))].sort();
    states.forEach(state => {
      const option = document.createElement("option");
      option.value = state;
      option.textContent = state;
      stateFilter.appendChild(option);
    });

    function renderList() {
      const query = searchInput.value.toLowerCase();
      const selectedState = stateFilter.value;
      const filtered = tithelyData.filter(item => {
        const matchName = item.name.toLowerCase().includes(query);
        const matchState = selectedState ? item.state === selectedState : true;
        return matchName && matchState;
      });

      const grouped = {};
      filtered.forEach(item => {
        if (!grouped[item.state]) grouped[item.state] = [];
        grouped[item.state].push(item);
      });

      resultsContainer.innerHTML = "";
      for (const state in grouped) {
        const section = document.createElement("div");
        section.className = "state-group";

        const title = document.createElement("h2");
        title.className = "state-title";
        title.textContent = state;
        section.appendChild(title);

        const grid = document.createElement("div");
        grid.className = "corps-grid";

        grouped[state].forEach(item => {
          const card = document.createElement("div");
          card.className = "corps-card";

          const link = document.createElement("a");
          link.href = item.url;
          link.textContent = item.name;
          link.target = "_blank";
          link.rel = "noopener noreferrer";

          const url = document.createElement("a");
          url.href = item.url;
          url.textContent = item.url;
          url.target = "_blank";
          url.rel = "noopener noreferrer";

          card.appendChild(link);
          card.appendChild(url);
          grid.appendChild(card);
        });

        section.appendChild(grid);
        resultsContainer.appendChild(section);
      }
    }

    searchInput.addEventListener("input", renderList);
    stateFilter.addEventListener("change", renderList);

    // Initial render
    renderList();
