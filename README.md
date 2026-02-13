### How to Show Specific Roles by ID

To display specific roles on the page by their ID, follow these steps:

1. Locate the `generateAllStaffGrid` function in the `rsyc-unit-templates.js` file.
2. Use the `staffMap` object to filter staff members by their ID.
3. Modify the `sortedStaff` array to include only the desired roles by checking the `roleType` or `positionTitle` properties.

Example:
```javascript
const filteredStaff = Array.from(staffMap.values()).filter(staff => staff.roleType === 'Program Coordinator');
```
4. Replace the `sortedStaff` array with your `filteredStaff` array in the `generateAllStaffGrid` function.

This will ensure that only staff members with the specified role are displayed on the page.