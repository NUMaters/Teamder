import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_GATEWAY_URL = process.env.EXPO_PUBLIC_API_GATEWAY_URL;

export type User = {
  id: string;
  username: string;
  icon_url: string;
};

export type Match = {
  id: string;
  user1: User;
  user2: User;
};

export type ChatRoom = {
  id: string;
  match: Match;
  lastMessage?: string;
  lastMessageTime?: string;
};

export type ChatMessage = {
  id: string;
  room_id: string;
  sender_id: string;
  content: string;
  created_at: string;
};

class ChatService {
  private async getHeaders() {
    const token = await AsyncStorage.getItem('userToken');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }

  async getChatRooms(): Promise<ChatRoom[]> {
    try {
      const headers = await this.getHeaders();
      const response = await axios.post(
        `${API_GATEWAY_URL}/get_chat_rooms`,
        {},
        { headers }
      );

      if (response.data.error) {
        throw new Error(response.data.error);
      }

      return response.data;
    } catch (error) {
      console.error('Error fetching chat rooms:', error);
      throw error;
    }
  }

  async getChatRoom(roomId: string): Promise<ChatRoom> {
    try {
      const headers = await this.getHeaders();
      const response = await axios.post(
        `${API_GATEWAY_URL}/get_chat_room`,
        { room_id: roomId },
        { headers }
      );

      if (response.data.error) {
        throw new Error(response.data.error);
      }

      return response.data;
    } catch (error) {
      console.error('Error fetching chat room:', error);
      throw error;
    }
  }

  async getMessages(roomId: string): Promise<ChatMessage[]> {
    try {
      const headers = await this.getHeaders();
      const response = await axios.post(
        `${API_GATEWAY_URL}/get_messages`,
        { room_id: roomId },
        { headers }
      );

      if (response.data.error) {
        throw new Error(response.data.error);
      }

      return response.data;
    } catch (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }
  }

  async sendMessage(roomId: string, content: string): Promise<ChatMessage> {
    try {
      const headers = await this.getHeaders();
      const response = await axios.post(
        `${API_GATEWAY_URL}/send_message`,
        {
          room_id: roomId,
          content: content.trim()
        },
        { headers }
      );

      if (response.data.error) {
        throw new Error(response.data.error);
      }

      return response.data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }
}

export const chatService = new ChatService();