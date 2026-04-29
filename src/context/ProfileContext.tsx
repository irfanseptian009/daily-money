import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";

export const EMOJI_AVATARS = [
  "😎", "🧑‍💻", "👨‍💼", "👩‍💼", "🧑‍🏭", "🧑‍🎓",
  "👨‍🚀", "👩‍🚀", "🦸", "🦹", "🧚", "🧞",
  "🐱", "🐶", "🦁", "🦊", "🐻", "🐼",
  "🌟", "🔥", "💎", "🌸", "🌻", "🌵",
  "🌈", "⚡", "🌞", "🌙", "🪐", "🧊",
];

export interface ProfileData {
  name: string;
  photoUri: string | null;
}

interface ProfileContextType {
  profile: ProfileData;
  setName: (name: string) => void;
  pickPhoto: () => Promise<void>;
  takePhoto: () => Promise<void>;
  setEmojiAvatar: (emoji: string) => void;
  removePhoto: () => Promise<void>;
  getInitials: () => string;
}

const PROFILE_KEY = "@daily_money_profile";
const PHOTO_DIR = `${FileSystem.documentDirectory}profile/`;

const ProfileContext = createContext<ProfileContextType>({
  profile: { name: "", photoUri: null },
  setName: () => { },
  pickPhoto: async () => { },
  takePhoto: async () => { },
  setEmojiAvatar: () => { },
  removePhoto: async () => { },
  getInitials: () => "U",
});

export const ProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<ProfileData>({ name: "", photoUri: null });

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(PROFILE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          // Verify photo still exists (only for file URIs, not emoji:)
          if (parsed.photoUri && !parsed.photoUri.startsWith("emoji:")) {
            const info = await FileSystem.getInfoAsync(parsed.photoUri);
            if (!info.exists) parsed.photoUri = null;
          }
          setProfile(parsed);
        }
      } catch (e) {
        console.error("Failed to load profile:", e);
      }
    })();
  }, []);

  const saveProfile = useCallback(async (data: ProfileData) => {
    try {
      await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error("Failed to save profile:", e);
    }
  }, []);

  const setName = useCallback((name: string) => {
    const updated = { ...profile, name };
    setProfile(updated);
    saveProfile(updated);
  }, [profile, saveProfile]);

  const pickPhoto = useCallback(async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") return;

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (!result.canceled && result.assets[0]) {
        // Ensure directory exists
        const dirInfo = await FileSystem.getInfoAsync(PHOTO_DIR);
        if (!dirInfo.exists) {
          await FileSystem.makeDirectoryAsync(PHOTO_DIR, { intermediates: true });
        }

        // Copy to persistent storage
        const ext = result.assets[0].uri.split(".").pop() || "jpg";
        const dest = `${PHOTO_DIR}avatar.${ext}`;

        // Delete old file if exists
        const oldInfo = await FileSystem.getInfoAsync(dest);
        if (oldInfo.exists) await FileSystem.deleteAsync(dest);

        await FileSystem.copyAsync({
          from: result.assets[0].uri,
          to: dest,
        });

        const updated = { ...profile, photoUri: dest };
        setProfile(updated);
        saveProfile(updated);
      }
    } catch (e) {
      console.error("Failed to pick photo:", e);
    }
  }, [profile, saveProfile]);

  const takePhoto = useCallback(async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") return;

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (!result.canceled && result.assets[0]) {
        const dirInfo = await FileSystem.getInfoAsync(PHOTO_DIR);
        if (!dirInfo.exists) {
          await FileSystem.makeDirectoryAsync(PHOTO_DIR, { intermediates: true });
        }

        const ext = result.assets[0].uri.split(".").pop() || "jpg";
        const dest = `${PHOTO_DIR}avatar_${Date.now()}.${ext}`;

        await FileSystem.copyAsync({
          from: result.assets[0].uri,
          to: dest,
        });

        const updated = { ...profile, photoUri: dest };
        setProfile(updated);
        saveProfile(updated);
      }
    } catch (e) {
      console.error("Failed to take photo:", e);
    }
  }, [profile, saveProfile]);

  const setEmojiAvatar = useCallback((emoji: string) => {
    const updated = { ...profile, photoUri: `emoji:${emoji}` };
    setProfile(updated);
    saveProfile(updated);
  }, [profile, saveProfile]);

  const removePhoto = useCallback(async () => {
    try {
      if (profile.photoUri && !profile.photoUri.startsWith("emoji:")) {
        const info = await FileSystem.getInfoAsync(profile.photoUri);
        if (info.exists) await FileSystem.deleteAsync(profile.photoUri);
      }
      const updated = { ...profile, photoUri: null };
      setProfile(updated);
      saveProfile(updated);
    } catch (e) {
      console.error("Failed to remove photo:", e);
    }
  }, [profile, saveProfile]);

  const getInitials = useCallback(() => {
    if (!profile.name.trim()) return "U";
    const parts = profile.name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0].substring(0, 2).toUpperCase();
  }, [profile.name]);

  return (
    <ProfileContext.Provider value={{ profile, setName, pickPhoto, takePhoto, setEmojiAvatar, removePhoto, getInitials }}>
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => useContext(ProfileContext);
