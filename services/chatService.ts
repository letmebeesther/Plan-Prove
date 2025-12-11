import { ref, push, onValue, off, serverTimestamp, set, DataSnapshot } from "firebase/database";
import { rtdb } from "./firebase";
import { User } from "../types";

export interface RealtimeMessage {
  id: string;
  userId: string;
  userNickname: string;
  userAvatarUrl: string;
  content: string;
  type: 'TEXT' | 'IMAGE';
  timestamp: number;
}

/**
 * Sends a chat message to the Realtime Database.
 * Path: chats/{roomId}/messages/{messageId}
 */
export const sendChatMessage = async (
  roomId: string, 
  user: User, 
  content: string, 
  type: 'TEXT' | 'IMAGE' = 'TEXT'
) => {
  try {
    const messagesRef = ref(rtdb, `chats/${roomId}/messages`);
    const newMessageRef = push(messagesRef);
    
    await set(newMessageRef, {
      userId: user.id,
      userNickname: user.nickname,
      userAvatarUrl: user.avatarUrl,
      content,
      type,
      timestamp: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
};

/**
 * Subscribes to chat messages for a specific room.
 * Returns an unsubscribe function.
 */
export const subscribeToChat = (roomId: string, callback: (messages: RealtimeMessage[]) => void) => {
  const messagesRef = ref(rtdb, `chats/${roomId}/messages`);
  
  const listener = onValue(messagesRef, (snapshot: DataSnapshot) => {
    const data = snapshot.val();
    if (data) {
      // Convert object to array and sort by timestamp
      const messageList: RealtimeMessage[] = Object.entries(data).map(([key, value]: [string, any]) => ({
        id: key,
        userId: value.userId,
        userNickname: value.userNickname,
        userAvatarUrl: value.userAvatarUrl,
        content: value.content,
        type: value.type,
        timestamp: value.timestamp
      }));
      
      // Sort by timestamp if needed (though keys usually sort chronologically)
      messageList.sort((a, b) => a.timestamp - b.timestamp);
      
      callback(messageList);
    } else {
      callback([]);
    }
  });

  // Return unsubscribe function
  return () => off(messagesRef, 'value', listener);
};
