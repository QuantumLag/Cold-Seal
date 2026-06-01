/**
 * Safe timestamp formatting utility
 * Handles ISO strings, timestamps, and invalid dates gracefully
 */

/**
 * Format timestamp to HH:mm:ss
 * Returns "N/A" if timestamp is invalid or missing
 */
export function formatTimeOnly(timestamp?: string | number): string {
  if (!timestamp) return 'N/A';
  
  try {
    const date = new Date(timestamp);
    
    // Validate the date
    if (isNaN(date.getTime())) {
      return 'N/A';
    }
    
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
  } catch (error) {
    return 'N/A';
  }
}

/**
 * Format timestamp to YYYY-MM-DD HH:mm:ss
 * Returns "N/A" if timestamp is invalid or missing
 */
export function formatDateTime(timestamp?: string | number): string {
  if (!timestamp) return 'N/A';
  
  try {
    const date = new Date(timestamp);
    
    // Validate the date
    if (isNaN(date.getTime())) {
      return 'N/A';
    }
    
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
  } catch (error) {
    return 'N/A';
  }
}

/**
 * Format relative time (e.g., "5 seconds ago")
 * Returns "N/A" if timestamp is invalid or missing
 */
export function formatRelativeTime(timestamp?: string | number): string {
  if (!timestamp) return 'N/A';
  
  try {
    const date = new Date(timestamp);
    
    // Validate the date
    if (isNaN(date.getTime())) {
      return 'N/A';
    }
    
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  } catch (error) {
    return 'N/A';
  }
}
