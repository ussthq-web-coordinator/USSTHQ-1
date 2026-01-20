-- Query to find site_property rows based on IDs in Document.custom_head_content JSON
-- MySQL version - properties is a JSON string that needs to be parsed twice
-- Results ordered by array position in custom_head_content
-- Handles multiple property types with type-specific fields extracted

-- Parse JSON from custom_head_content and join with site_property table
SELECT 
    json_props.row_num AS position,
    json_props.property_name AS property_type,
    sp.id,
    sp.fkSite,
    sp.name,
    -- Common fields across all types
    JSON_UNQUOTE(JSON_EXTRACT(sp.value, '$.visible')) AS visible,
    -- FreeTextArea, WhiteTitleArea, EventPageContent, TestimonialBox specific fields
    JSON_UNQUOTE(JSON_EXTRACT(sp.value, '$.text')) AS text_html,
    JSON_UNQUOTE(JSON_EXTRACT(sp.value, '$.fullWidth')) AS fullWidth,
    JSON_UNQUOTE(JSON_EXTRACT(sp.value, '$.htmlMode')) AS htmlMode,
    JSON_UNQUOTE(JSON_EXTRACT(sp.value, '$.backgroundColor')) AS backgroundColor,
    JSON_UNQUOTE(JSON_EXTRACT(sp.value, '$.backgroundImage')) AS backgroundImage,
    JSON_UNQUOTE(JSON_EXTRACT(sp.value, '$.backgroundSource')) AS backgroundSource,
    JSON_UNQUOTE(JSON_EXTRACT(sp.value, '$.backgroundRepeat')) AS backgroundRepeat,
    JSON_UNQUOTE(JSON_EXTRACT(sp.value, '$.applyParallax')) AS applyParallax,
    -- Slides specific fields
    JSON_EXTRACT(sp.value, '$.objects') AS objects_array,
    JSON_UNQUOTE(JSON_EXTRACT(sp.value, '$.isConductor')) AS isConductor,
    -- Stories specific fields
    JSON_UNQUOTE(JSON_EXTRACT(sp.value, '$.recent')) AS recent,
    JSON_UNQUOTE(JSON_EXTRACT(sp.value, '$.selected')) AS selected,
    JSON_UNQUOTE(JSON_EXTRACT(sp.value, '$.titleText')) AS titleText,
    JSON_UNQUOTE(JSON_EXTRACT(sp.value, '$.sort')) AS sort,
    JSON_UNQUOTE(JSON_EXTRACT(sp.value, '$.tagUrls')) AS tagUrls,
    -- AccordionGroup specific fields
    JSON_UNQUOTE(JSON_EXTRACT(sp.value, '$.isFaq')) AS isFaq,
    JSON_UNQUOTE(JSON_EXTRACT(sp.value, '$.color')) AS color,
    JSON_UNQUOTE(JSON_EXTRACT(sp.value, '$.bodyColor')) AS bodyColor,
    -- MediaBoxHalf specific fields
    JSON_UNQUOTE(JSON_EXTRACT(sp.value, '$.display')) AS display,
    JSON_UNQUOTE(JSON_EXTRACT(sp.value, '$.mediaType')) AS mediaType,
    JSON_UNQUOTE(JSON_EXTRACT(sp.value, '$.mediaTypeSource')) AS mediaTypeSource,
    JSON_UNQUOTE(JSON_EXTRACT(sp.value, '$.url')) AS url,
    JSON_UNQUOTE(JSON_EXTRACT(sp.value, '$.address')) AS address,
    JSON_UNQUOTE(JSON_EXTRACT(sp.value, '$.city')) AS city,
    JSON_UNQUOTE(JSON_EXTRACT(sp.value, '$.state')) AS state,
    JSON_UNQUOTE(JSON_EXTRACT(sp.value, '$.zip')) AS zip,
    -- Cards specific fields
    JSON_UNQUOTE(JSON_EXTRACT(sp.value, '$.showSlidesView')) AS showSlidesView,
    JSON_UNQUOTE(JSON_EXTRACT(sp.value, '$.showMobileSlidesView')) AS showMobileSlidesView,
    JSON_UNQUOTE(JSON_EXTRACT(sp.value, '$.featuredText')) AS featuredText,
    -- LocalSites specific fields
    JSON_UNQUOTE(JSON_EXTRACT(sp.value, '$.locationName')) AS locationName,
    -- Countdown specific fields
    JSON_UNQUOTE(JSON_EXTRACT(sp.value, '$.header')) AS header,
    JSON_UNQUOTE(JSON_EXTRACT(sp.value, '$.endDate')) AS endDate,
    JSON_UNQUOTE(JSON_EXTRACT(sp.value, '$.description')) AS description,
    JSON_UNQUOTE(JSON_EXTRACT(sp.value, '$.borderColor')) AS borderColor,
    JSON_UNQUOTE(JSON_EXTRACT(sp.value, '$.fontColor')) AS fontColor,
    -- FormBuilder specific fields
    JSON_UNQUOTE(JSON_EXTRACT(sp.value, '$.twoColumns')) AS twoColumns,
    JSON_UNQUOTE(JSON_EXTRACT(sp.value, '$.useCaptcha')) AS useCaptcha,
    JSON_UNQUOTE(JSON_EXTRACT(sp.value, '$.title')) AS title,
    JSON_UNQUOTE(JSON_EXTRACT(sp.value, '$.sendTo')) AS sendTo,
    JSON_UNQUOTE(JSON_EXTRACT(sp.value, '$.html')) AS html,
    -- GivingToolbar specific fields
    JSON_UNQUOTE(JSON_EXTRACT(sp.value, '$.donationPageUrl')) AS donationPageUrl,
    -- TestimonialBox specific fields
    JSON_UNQUOTE(JSON_EXTRACT(sp.value, '$.filter')) AS filter,
    JSON_UNQUOTE(JSON_EXTRACT(sp.value, '$.align')) AS align,
    JSON_UNQUOTE(JSON_EXTRACT(sp.value, '$.source')) AS source,
    -- Eligibility specific fields
    JSON_UNQUOTE(JSON_EXTRACT(sp.value, '$.showButton')) AS showButton,
    JSON_UNQUOTE(JSON_EXTRACT(sp.value, '$.headline')) AS headline,
    JSON_UNQUOTE(JSON_EXTRACT(sp.value, '$.buttonText')) AS buttonText,
    JSON_UNQUOTE(JSON_EXTRACT(sp.value, '$.buttonStyle')) AS buttonStyle,
    JSON_UNQUOTE(JSON_EXTRACT(sp.value, '$.buttonSource')) AS buttonSource,
    JSON_UNQUOTE(JSON_EXTRACT(sp.value, '$.buttonUrl')) AS buttonUrl,
    -- TheatreImage specific fields
    JSON_UNQUOTE(JSON_EXTRACT(sp.value, '$.subtitle')) AS subtitle,
    -- Ministries specific fields
    JSON_UNQUOTE(JSON_EXTRACT(sp.value, '$.isPrimary')) AS isPrimary,
    JSON_UNQUOTE(JSON_EXTRACT(sp.value, '$.useDescriptions')) AS useDescriptions,
    -- Full JSON for reference
    sp.value AS full_json_value
FROM 
    document d
CROSS JOIN 
    JSON_TABLE(
        JSON_UNQUOTE(JSON_EXTRACT(d.custom_head_content, '$.properties')),
        '$[*]' COLUMNS (
            row_num FOR ORDINALITY,
            property_id VARCHAR(50) PATH '$.id',
            property_name VARCHAR(50) PATH '$.name'
        )
    ) AS json_props
INNER JOIN 
    site_property sp ON sp.id = json_props.property_id
WHERE 
    d.idDocument = '8a80804689637e690189ac28b8360745'
ORDER BY 
    json_props.row_num;

-- Debug: View the custom_head_content JSON to understand structure
/*
SELECT 
    idDocument,
    custom_head_content,
    JSON_EXTRACT(custom_head_content, '$.properties') AS properties_string,
    JSON_UNQUOTE(JSON_EXTRACT(custom_head_content, '$.properties')) AS properties_unquoted
FROM 
    document
WHERE 
    idDocument = '8a80804689637e690189ac28b8360745';
*/
