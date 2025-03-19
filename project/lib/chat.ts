import { supabase } from './supabase';

export type ChatMessage = {
  id: string;
  roomId: string;
  senderId: string;
  content: string;
  createdAt: string;
  readAt: string | null;
};

export type ChatRoom = {
  id: string;
  matchId: string;
  lastMessage: string | null;
  lastMessageAt: string | null;
  updatedAt: string;
  createdAt: string;
};

export const chatService = {
  async getRooms() {
    const { data, error } = await supabase
      .from('chat_rooms')
      .select(`
        *,
        match:matches (
          user1:user1_id (id, name, image_url),
          user2:user2_id (id, name, image_url),
          project:project_id (
            id,
            title,
            company,
            image_url,
            owner:owner_id (id, name, image_url)
          )
        )
      `)
      .order('last_message_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getMessages(roomId: string) {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('room_id', roomId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data;
  },

  async sendMessage(roomId: string, content: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('chat_messages')
      .insert({
        room_id: roomId,
        sender_id: user.id,
        content,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async markAsRead(roomId: string) {
    const { error } = await supabase
      .rpc('mark_messages_as_read', { room_uuid: roomId });

    if (error) throw error;
  },

  subscribeToMessages(roomId: string, callback: (message: ChatMessage) => void) {
    return supabase
      .channel(`room:${roomId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `room_id=eq.${roomId}`,
        },
        (payload) => {
          callback(payload.new as ChatMessage);
        }
      )
      .subscribe();
  },

  subscribeToRooms(callback: (room: ChatRoom) => void) {
    return supabase
      .channel('rooms')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chat_rooms',
        },
        (payload) => {
          callback(payload.new as ChatRoom);
        }
      )
      .subscribe();
  },
};