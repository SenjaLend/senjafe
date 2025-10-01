/**
 * Utility functions for address handling
 */

/**
 * Normalize an address to lowercase for consistent comparison
 * @param address - The address to normalize
 * @returns Normalized lowercase address or null if invalid
 */
export function normalizeAddress(address: string | null | undefined): string | null {
  if (!address || typeof address !== 'string') {
    return null;
  }
  
  // Remove any whitespace and convert to lowercase
  return address.trim().toLowerCase();
}

/**
 * Check if two addresses are equal (case-insensitive)
 * @param address1 - First address to compare
 * @param address2 - Second address to compare
 * @returns True if addresses are equal (case-insensitive)
 */
export function isAddressEqual(address1: string | null | undefined, address2: string | null | undefined): boolean {
  const normalized1 = normalizeAddress(address1);
  const normalized2 = normalizeAddress(address2);
  
  if (!normalized1 || !normalized2) {
    return false;
  }
  
  return normalized1 === normalized2;
}

/**
 * Validate if an address is a valid Ethereum address format
 * @param address - The address to validate
 * @returns True if the address is valid
 */
export function isValidAddress(address: string | null | undefined): boolean {
  const normalized = normalizeAddress(address);
  
  if (!normalized) {
    return false;
  }
  
  // Basic Ethereum address validation (0x + 40 hex characters)
  return /^0x[a-f0-9]{40}$/.test(normalized);
}
