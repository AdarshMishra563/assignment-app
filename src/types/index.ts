export type MessageType = 'text' | 'audio' | 'video' | 'image' | 'file';
export type MessageStatus = 'sent' | 'delivered' | 'read';

export interface IUser {
  id: string;
  username: string;
  email: string;
  avatarUrl?: string;
  isOnline?: boolean;
  lastSeen?: string | Date;
}

export interface IMessage {
  id: string;
  roomId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  type: MessageType;
  content: string;
  mediaUrl?: string;
  duration?: number;
  fileSize?: string;
  isUploading?: boolean;
  uploadProgress?: number;
  status: MessageStatus;
  createdAt: string | Date;
}

export interface IChatRoom {
  id: string;
  name?: string;
  isGroup: boolean;
  participants: IUser[];
  lastMessage?: IMessage;
  unreadCount?: number;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface ITypingState {
  roomId?: string;
  userId: string;
  username: string;
  isTyping: boolean;
}

export interface IRecordingState {
  roomId?: string;
  userId: string;
  username: string;
  isRecording: boolean;
}

export interface IVideoCallSignal {
  roomId: string;
  fromUserId: string;
  fromUsername: string;
  signalData?: any;
  type: 'offer' | 'answer' | 'ice-candidate' | 'end';
}

export interface IPost {
  id: string;
  userId: string;
  username: string;
  userAvatar?: string;
  caption: string;
  type: 'image' | 'video' | 'text';
  mediaUrl?: string;
  thumbnailUrl?: string;
  likes: string[];
  commentsCount: number;
  createdAt: string;
}
