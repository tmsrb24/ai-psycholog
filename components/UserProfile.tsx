import React, { useState, useRef } from 'react';
import { UserProfileData } from '../types';
import { FaUserCircle, FaCamera, FaSpinner } from 'react-icons/fa';
import axios from 'axios';
import Image from 'next/image';

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
      avatar_url: null,
      preferences: {
        responseLength: 'medium',
        communicationStyle: 'casual',
        notificationFrequency: 'none'
      }
    }
  );
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const { data } = await axios.post('/api/user/upload-avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      setProfile(prev => ({ ...prev, avatar_url: data.avatarUrl }));
      onProfileChange({ ...profile, avatar_url: data.avatarUrl });

    } catch (err) {
      console.error(err);
      setError('Nahrávání selhalo. Zkuste to prosím znovu.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onProfileChange(profile);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-4">
      <h2 className="text-lg font-bold mb-4 dark:text-white text-center">Uživatelský profil</h2>
      
      <div className="flex flex-col items-center mb-6">
        <div className="relative">
          {profile.avatar_url ? (
            <Image
              src={profile.avatar_url}
              alt="Avatar"
              width={96}
              height={96}
              className="w-24 h-24 rounded-full object-cover"
            />
          ) : (
            <FaUserCircle className="w-24 h-24 text-gray-400" />
          )}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="absolute -bottom-1 -right-1 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors"
            title="Změnit fotku"
            disabled={uploading}
          >
            {uploading ? <FaSpinner className="animate-spin" /> : <FaCamera />}
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept="image/png, image/jpeg"
          />
        </div>
        {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
      </div>

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
            Uložit změny
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserProfile;
