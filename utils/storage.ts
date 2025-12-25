import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * Storage utility that provides a consistent API for persistent storage
 * across all platforms (iOS, Android, Web)
 */
class Storage {
  /**
   * Store a value in storage
   * @param key - The storage key
   * @param value - The value to store (will be JSON stringified)
   * @returns Promise that resolves when the value is stored
   */
  async set<T>(key: string, value: T): Promise<void> {
    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem(key, jsonValue);
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
      const jsonValue = await AsyncStorage.getItem(key);
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
      await AsyncStorage.removeItem(key);
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
      await AsyncStorage.clear();
    } catch (error) {
      console.error("Error clearing storage:", error);
      throw error;
    }
  }
}

// Export a singleton instance
export const storage = new Storage();

// Export the class for testing or custom instances
export default Storage;