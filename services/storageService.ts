
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "./firebase";

/**
 * Uploads an image file to Firebase Storage and returns the download URL.
 * @param file The file object to upload
 * @param path The path in storage (e.g., 'evidence', 'avatars', 'challenges')
 * @returns Promise<string> The download URL of the uploaded image
 */
export const uploadImage = async (file: File, folder: string): Promise<string> => {
  try {
    // Create a unique filename: timestamp_random_filename
    const filename = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}_${file.name}`;
    const storageRef = ref(storage, `${folder}/${filename}`);
    
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    return downloadURL;
  } catch (error) {
    console.error("Error uploading image:", error);
    throw error;
  }
};

/**
 * Calculates the SHA-256 hash of a file for duplicate/fraud detection.
 * @param file The file object
 * @returns Promise<string> The hex string of the hash
 */
export const calculateFileHash = async (file: File): Promise<string> => {
  try {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
  } catch (error) {
    console.error("Error calculating file hash:", error);
    return `error-hash-${Date.now()}`;
  }
};
