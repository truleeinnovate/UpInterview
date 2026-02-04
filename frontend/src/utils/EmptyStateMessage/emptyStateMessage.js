// Created By Ashok
import { capitalizeFirstLetter } from "../CapitalizeFirstLetter/capitalizeFirstLetter";

export function getEmptyStateMessage(
  isSearchActive,
  currentFilteredCount,
  initialDataCount,
  entityName = "items",
) {
  const normalizedEntityName = capitalizeFirstLetter(entityName);

  if (isSearchActive && currentFilteredCount === 0) {
    // Case 1: Search or Filter active but no results
    return `No ${normalizedEntityName} match your current search or filter criteria.`;
  } else if (initialDataCount === 0) {
    // Case 2: No data in database
    return `No ${normalizedEntityName} Found.`;
  }

  // Fallback (e.g., if logic is somehow missed, though unlikely)
  return `No ${normalizedEntityName} to Display.`;
}
