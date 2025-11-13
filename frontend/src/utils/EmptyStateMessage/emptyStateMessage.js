// Created By Ashok

export function getEmptyStateMessage(
  isSearchActive,
  currentFilteredCount,
  initialDataCount,
  entityName = "items"
) {
  const normalizedEntityName = entityName.toLowerCase();

  if (isSearchActive && currentFilteredCount === 0) {
    // Case 1: Search or Filter active but no results
    return `No ${normalizedEntityName} match your current search or filter criteria.`;
  } else if (initialDataCount === 0) {
    // Case 2: No data in database
    return `No ${normalizedEntityName} found.`;
  }

  // Fallback (e.g., if logic is somehow missed, though unlikely)
  return `No ${normalizedEntityName} to display.`;
}
