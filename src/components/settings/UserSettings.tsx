'use client';

import { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { FirebaseService } from '@/services/firebaseService';
import Image from 'next/image';

interface UserSettingsProps {
  user: User;
  onSignOut: () => Promise<void>;
}

export function UserSettings({ user, onSignOut }: UserSettingsProps) {
  interface UserData {
    name?: string;
    tag?: string;
  }
  
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isVerified, setIsVerified] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Form states
  const [newName, setNewName] = useState('');
  const [newTag, setNewTag] = useState('');
  const [nameError, setNameError] = useState('');
  const [tagError, setTagError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    loadUserData();
  }); // Removed loadUserData dependency since it causes a reference error

  const loadUserData = async () => {
    try {
      setLoading(true);
      const [currentUserData, verified] = await Promise.all([
        FirebaseService.getCurrentUserData(user),
        FirebaseService.isUserVerified(user)
      ]);
      
      setUserData(currentUserData);
      setIsVerified(verified);
      
      if (currentUserData) {
        setNewName(currentUserData.name || '');
        setNewTag(currentUserData.tag || '');
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      setNameError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const validateTag = (tag: string): string | null => {
    if (!tag.trim()) {
      return 'Tag cannot be empty';
    }

    // Only lowercase letters and periods allowed
    const tagRegex = /^[a-z.]+$/;
    if (!tagRegex.test(tag.trim())) {
      return 'Tag can only contain lowercase letters and periods';
    }

    // Additional validation rules
    if (tag.trim().length < 2) {
      return 'Tag must be at least 2 characters long';
    }

    if (tag.trim().startsWith('.') || tag.trim().endsWith('.')) {
      return 'Tag cannot start or end with a period';
    }

    if (tag.trim().includes('..')) {
      return 'Tag cannot contain consecutive periods';
    }

    return null;
  };

  const handleUpdateName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) {
      setNameError('Name cannot be empty');
      return;
    }

    setSaving(true);
    setNameError('');
    setSuccessMessage('');

    try {
      const result = await FirebaseService.updateUserName(user, newName.trim());
      
      if (result.success) {
        setSuccessMessage('Name updated successfully!');
        // Refresh user data
        await loadUserData();
      } else {
        setNameError(result.error || 'Failed to update name');
      }
    } catch (_error) {
      setNameError('Failed to update name');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateTag = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const tagValidationError = validateTag(newTag);
    if (tagValidationError) {
      setTagError(tagValidationError);
      return;
    }

    setSaving(true);
    setTagError('');
    setSuccessMessage('');

    try {
      const result = await FirebaseService.updateUserTag(user, newTag.trim());
      
      if (result.success) {
        setSuccessMessage('Tag updated successfully!');
        // Refresh user data
        await loadUserData();
      } else {
        setTagError(result.error || 'Failed to update tag');
      }
    } catch (_error) {
      setTagError('Failed to update tag');
    } finally {
      setSaving(false);
    }
  };

  const handleTagChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase(); // Auto-convert to lowercase
    setNewTag(value);
    
    // Clear error when user starts typing
    if (tagError) {
      setTagError('');
    }
  };

  const handleSignOut = async () => {
    try {
      await onSignOut();
    } catch (error) {
      console.error('Failed to sign out:', error);
      setTagError(error instanceof Error ? error.message : 'Unknown error');
    }
  };

  if (loading) {
    return (
      <div className="w-full max-w-md mx-auto space-y-6">
        <div className="text-center text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      {/* Profile Header */}
      <div className="text-center space-y-4">
        {user.photoURL && (
          <div className="flex justify-center">
            <Image
              src={user.photoURL}
              alt="Profile"
              width={80}
              height={80}
              className="rounded-full border-2 border-gray-600"
            />
          </div>
        )}
        
        <div>
          <h2 className="text-xl font-medium text-white">
            {userData?.name || user.displayName || 'User'}
          </h2>
          <p className="text-sm text-gray-400">@{userData?.tag || 'No tag'}</p>
          <p className="text-xs text-gray-500">{user.email}</p>
        </div>

        {!isVerified && (
          <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-3">
            <p className="text-yellow-400 text-sm">
              🔒 Account not verified. Contact admin to enable editing features.
            </p>
          </div>
        )}
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-3">
          <p className="text-green-400 text-sm">{successMessage}</p>
        </div>
      )}

      {/* Settings Forms */}
      {isVerified && (
        <div className="space-y-6">
          {/* Update Name */}
          <form onSubmit={handleUpdateName} className="space-y-3">
            <h3 className="text-lg font-medium text-white">Display Name</h3>
            <div>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Enter your display name"
                className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
                disabled={saving}
              />
              {nameError && (
                <p className="text-red-400 text-sm mt-1">{nameError}</p>
              )}
            </div>
            <button
              type="submit"
              disabled={saving || newName.trim() === userData?.name}
              className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
            >
              {saving ? 'Updating...' : 'Update Name'}
            </button>
          </form>

          {/* Update Tag */}
          <form onSubmit={handleUpdateTag} className="space-y-3">
            <h3 className="text-lg font-medium text-white">Username Tag</h3>
            <div>
              <input
                type="text"
                value={newTag}
                onChange={handleTagChange}
                placeholder="Enter your username tag"
                className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
                disabled={saving}
              />
              <p className="text-xs text-gray-400 mt-1">
                Only lowercase letters and periods allowed (e.g., john.doe, user.name)
              </p>
              {tagError && (
                <p className="text-red-400 text-sm mt-1">{tagError}</p>
              )}
            </div>
            <button
              type="submit"
              disabled={saving || newTag.trim() === userData?.tag}
              className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
            >
              {saving ? 'Updating...' : 'Update Tag'}
            </button>
          </form>
        </div>
      )}

      {/* Account Actions */}
      <div className="pt-6 border-t border-gray-700">
        <button
          onClick={handleSignOut}
          className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}