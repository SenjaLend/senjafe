/**
 * Utility functions for error handling in transaction hooks
 */

/**
 * Check if an error message indicates user rejection/cancellation
 * @param errorMessage - The error message to check
 * @returns true if the error is a user rejection, false otherwise
 */
export const isUserRejection = (errorMessage: string): boolean => {
  if (!errorMessage) return false;
  
  const rejectionPatterns = [
    'User rejected',
    'User denied',
    'cancelled',
    'rejected',
    'user rejected',
    'User rejected the request',
    'User rejected the transaction',
    'User denied transaction',
    'Transaction was rejected',
    'User cancelled',
    'User canceled',
    'User rejected the request',
    'User rejected the transaction',
    'User denied the request',
    'User denied the transaction',
    'Transaction rejected by user',
    'Transaction cancelled by user',
    'Transaction canceled by user',
    'User cancelled the transaction',
    'User canceled the transaction',
    'User rejected the transaction request',
    'User denied the transaction request',
    'Transaction was cancelled by user',
    'Transaction was canceled by user',
    'User cancelled transaction',
    'User canceled transaction',
    'User rejected transaction',
    'User denied transaction',
    'Transaction cancelled',
    'Transaction canceled',
    'Request rejected',
    'Request denied',
    'Request cancelled',
    'Request canceled',
    'User rejected request',
    'User denied request',
    'User cancelled request',
    'User canceled request'
  ];
  
  return rejectionPatterns.some(pattern => 
    errorMessage.toLowerCase().includes(pattern.toLowerCase())
  );
};

/**
 * Get a user-friendly error message for non-user-rejection errors
 * @param errorMessage - The original error message
 * @param defaultMessage - Default message if no specific error is found
 * @returns A user-friendly error message
 */
export const getUserFriendlyErrorMessage = (
  errorMessage: string, 
  defaultMessage: string = "An error occurred. Please try again."
): string => {
  if (!errorMessage) return defaultMessage;
  
  const lowerError = errorMessage.toLowerCase();
  
  if (lowerError.includes('insufficient')) {
    return "Insufficient balance. Please check your token balance.";
  } else if (lowerError.includes('allowance')) {
    return "Insufficient allowance. Please approve more tokens.";
  } else if (lowerError.includes('network')) {
    return "Network error. Please check your connection.";
  } else if (lowerError.includes('gas')) {
    return "Gas estimation failed. Please try again.";
  } else if (lowerError.includes('timeout')) {
    return "Transaction timeout. Please try again.";
  } else if (lowerError.includes('nonce')) {
    return "Transaction nonce error. Please try again.";
  } else if (lowerError.includes('revert')) {
    return "Transaction reverted. Please check your inputs.";
  } else if (lowerError.includes('execution reverted')) {
    return "Transaction execution failed. Please check your inputs.";
  }
  
  return errorMessage;
};
