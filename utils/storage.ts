import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

/**
 * Storage utility that provides a consistent API for persistent storage
 * across all platforms (iOS, Android, Web)
 */
class Storage {
  private isWeb(): boolean {
    return Platform.OS === 'web';
  }

  /**
   * Store a value in storage
   * @param key - The storage key
   * @param value - The value to store (will be JSON stringified)
   * @returns Promise that resolves when the value is stored
   */
  async set<T>(key: string, value: T): Promise<void> {
    try {
      const jsonValue = JSON.stringify(value);
      if (this.isWeb()) {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.setItem(key, jsonValue);
        }
      } else {
        await AsyncStorage.setItem(key, jsonValue);
      }
    } catch (error) {
      console.error(`Error storing value for key "${key}":`, error);
    }
  }

  /**
   * Retrieve a value from storage
   * @param key - The storage key
   * @returns Promise that resolves to the stored value, or null if not found
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      let jsonValue: string | null = null;
      
      if (this.isWeb()) {
        if (typeof window !== 'undefined' && window.localStorage) {
          jsonValue = window.localStorage.getItem(key);
        }
      } else {
        jsonValue = await AsyncStorage.getItem(key);
      }

      if (jsonValue === null) {
        return null;
      }
      return JSON.parse(jsonValue) as T;
    } catch (error) {
      console.error(`Error retrieving value for key "${key}":`, error);
      return null;
    }
  }

  /**
   * Remove a value from storage
   * @param key - The storage key
   * @returns Promise that resolves when the value is removed
   */
  async remove(key: string): Promise<void> {
    try {
      if (this.isWeb()) {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.removeItem(key);
        }
      } else {
        await AsyncStorage.removeItem(key);
      }
    } catch (error) {
      console.error(`Error removing value for key "${key}":`, error);
      throw error;
    }
  }

  /**
   * Clear all storage
   * @returns Promise that resolves when all storage is cleared
   */
  async clear(): Promise<void> {
    try {
      if (this.isWeb()) {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.clear();
        }
      } else {
        await AsyncStorage.clear();
      }
    } catch (error) {
      console.error("Error clearing storage:", error);
      throw error;
    }
  }

  /**
   * Get raw string value from storage (for Supabase adapter)
   * @param key - The storage key
   * @returns Promise that resolves to the raw string value, or null if not found
   */
  async getItem(key: string): Promise<string | null> {
    try {
      if (this.isWeb()) {
        if (typeof window !== 'undefined' && window.localStorage) {
          return window.localStorage.getItem(key);
        }
        return null;
      } else {
        return await AsyncStorage.getItem(key);
      }
    } catch (error) {
      console.error(`Error retrieving item for key "${key}":`, error);
      return null;
    }
  }

  /**
   * Set raw string value in storage (for Supabase adapter)
   * @param key - The storage key
   * @param value - The raw string value to store
   * @returns Promise that resolves when the value is stored
   */
  async setItem(key: string, value: string): Promise<void> {
    try {
      if (this.isWeb()) {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.setItem(key, value);
        }
      } else {
        await AsyncStorage.setItem(key, value);
      }
    } catch (error) {
      console.error(`Error storing item for key "${key}":`, error);
      throw error;
    }
  }

  /**
   * Remove item from storage (alias for remove, for Supabase adapter)
   * @param key - The storage key
   * @returns Promise that resolves when the value is removed
   */
  async removeItem(key: string): Promise<void> {
    return this.remove(key);
  }
}

export const storage = new Storage();

export default Storage;