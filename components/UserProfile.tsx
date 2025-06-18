import React, { useState } from 'react';
import { UserProfileData } from '../types/user';

interface UserProfileProps {
  onProfileChange: (profile: UserProfileData) => void;
  initialProfile?: UserProfileData;
}

const UserProfile: React.FC<UserProfileProps> = ({
  onProfileChange,
  initialProfile
}) => {
  const [profile, setProfile] = useState<UserProfileData>(
    initialProfile || {
      name: 'Uživatel',
      avatar_url: null, // Opraveno z avatar na avatar_url
      preferences: {
        responseLength: 'medium',
        communicationStyle: 'casual',
        notificationFrequency: 'none'
      }
    }
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'name') {
      setProfile(prev => ({ ...prev, name: value }));
    } else if (name === 'responseLength' || name === 'communicationStyle' || name === 'notificationFrequency') {
      setProfile(prev => ({
        ...prev,
        preferences: {
          ...prev.preferences,
          [name]: value
        }
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onProfileChange(profile);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-4">
      <h2 className="text-lg font-bold mb-3 dark:text-white">Uživatelský profil</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Jméno
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={profile.name}
            onChange={handleChange}
            className="input w-full"
            placeholder="Vaše jméno"
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="responseLength" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Délka odpovědí
          </label>
          <select
            id="responseLength"
            name="responseLength"
            value={profile.preferences.responseLength}
            onChange={handleChange}
            className="input w-full"
          >
            <option value="short">Krátké</option>
            <option value="medium">Střední</option>
            <option value="long">Dlouhé</option>
          </select>
        </div>
        
        <div className="mb-4">
          <label htmlFor="communicationStyle" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Styl komunikace
          </label>
          <select
            id="communicationStyle"
            name="communicationStyle"
            value={profile.preferences.communicationStyle}
            onChange={handleChange}
            className="input w-full"
          >
            <option value="casual">Neformální</option>
            <option value="formal">Formální</option>
          </select>
        </div>
        
        <div className="mb-4">
          <label htmlFor="notificationFrequency" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Frekvence notifikací
          </label>
          <select
            id="notificationFrequency"
            name="notificationFrequency"
            value={profile.preferences.notificationFrequency}
            onChange={handleChange}
            className="input w-full"
          >
            <option value="none">Žádné</option>
            <option value="daily">Denně</option>
            <option value="weekly">Týdně</option>
          </select>
        </div>
        
        <div className="flex justify-end">
          <button
            type="submit"
            className="btn btn-primary"
          >
            Uložit
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserProfile;
