// utils/roleUtils.js
export const formatWithSpaces = (str) => {
  if (!str) return '';
  const formatted = str
    .replace(/_/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1 $2');
  return formatted.charAt(0).toUpperCase() + formatted.slice(1).toLowerCase();
};

export const sortPermissions = (permissions) => {
  const priorityOrder = ['ViewTab', 'Create', 'Edit', 'Delete'];
  const sortedKeys = Object.keys(permissions).sort((a, b) => {
    const aIndex = priorityOrder.indexOf(a);
    const bIndex = priorityOrder.indexOf(b);
    if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
    if (aIndex !== -1) return -1;
    if (bIndex !== -1) return 1;
    return a.localeCompare(b);
  });
  return sortedKeys.reduce((acc, key) => {
    acc[key] = permissions[key];
    return acc;
  }, {});
};