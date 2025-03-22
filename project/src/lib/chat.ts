import { createApiRequest } from './api-client';

export interface ChatMessage {
  id: string;
  content: string;
  sender_id: string;
  receiver_id: string;
  chat_room_id: string;
  created_at: string;
  read_at?: string | null;
}

export interface ChatRoom {
  id: string;
  user1_id: string;
  user2_id: string;
  created_at: string;
  last_message?: string;
  last_message_at?: string;
  match: {
    user2: {
      name: string;
      image_url: string;
      title?: string;
    };
    project?: {
      title: string;
      image_url: string;
      company?: string;
    };
  };
}

export const chatService = {
  // メッセージの取得
  getMessages: async (roomId: string): Promise<ChatMessage[]> => {
    try {
      const response = await createApiRequest(`/chat/${roomId}/messages`, 'GET');
      return response.data.messages;
    } catch (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }
  },

  // メッセージの送信
  sendMessage: async (roomId: string, content: string): Promise<void> => {
    try {
      await createApiRequest(`/chat/${roomId}/messages`, 'POST', {
        content: content.trim()
      });
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  },

  // メッセージを既読にする
  markAsRead: async (roomId: string): Promise<void> => {
    try {
      await createApiRequest(`/chat/${roomId}/read`, 'POST');
    } catch (error) {
      console.error('Error marking messages as read:', error);
      throw error;
    }
  },

  // チャットルーム一覧の取得
  getChatRooms: async (): Promise<ChatRoom[]> => {
    try {
      const response = await createApiRequest('/chat/rooms', 'GET');
      return response.data.rooms;
    } catch (error) {
      console.error('Error fetching chat rooms:', error);
      throw error;
    }
  },

  // チャットルームの取得
  getChatRoom: async (roomId: string): Promise<ChatRoom> => {
    try {
      const response = await createApiRequest(`/chat/${roomId}`, 'GET');
      return response.data.room;
    } catch (error) {
      console.error('Error fetching chat room:', error);
      throw error;
    }
  },

  // チャットルームの作成
  createChatRoom: async (userId: string, projectId?: string): Promise<ChatRoom> => {
    try {
      const response = await createApiRequest('/chat/rooms', 'POST', {
        user_id: userId,
        project_id: projectId
      });
      return response.data.room;
    } catch (error) {
      console.error('Error creating chat room:', error);
      throw error;
    }
  }
};