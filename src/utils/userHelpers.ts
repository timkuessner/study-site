import { User } from 'firebase/auth';

/**
 * Extract first name from Google account
 */
export const getFirstName = (user: User | null): string => {
  if (!user) return '';
  if (user.displayName) {
    return user.displayName.split(' ')[0];
  }
  return user.email?.split('@')[0] || '';
};