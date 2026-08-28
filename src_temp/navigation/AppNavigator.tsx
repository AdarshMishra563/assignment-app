import React, { useEffect, useState, useRef } from 'react';
import { View, ActivityIndicator, AppState } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Home, Users, PlusSquare, MessageSquare, User } from 'lucide-react-native';

import { AuthScreen } from '../screens/AuthScreen';
import { OnboardingScreen } from '../screens/OnboardingScreen';
import { HomeFeedScreen } from '../screens/HomeFeedScreen';
import { FriendsScreen } from '../screens/FriendsScreen';
import { CreatePostScreen } from '../screens/CreatePostScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { ChatRoomScreen } from '../screens/ChatRoomScreen';
import { UserProfileScreen } from '../screens/UserProfileScreen';

import { useAppDispatch, useAppSelector } from '../store/hooks';
import { loadSavedSession } from '../store/slices/authSlice';
import { fetchChats } from '../store/slices/chatSlice';
import { initializeSocketReduxListeners } from '../services/socketReduxBridge';
import { FCMClientService } from '../services/fcmService';
import { DarkTheme, LightTheme } from '../theme/colors';
import { apiClient } from '../api/client';
import { socketService } from '../services/socketService';
import { useTheme } from '../context/ThemeContext';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

export function MainTabNavigator({ navigation, activeRoomId, setActiveRoomId }: any) {
  const { theme } = useTheme();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const chats = useAppSelector((state) => state.chat.chats);

  // Total unread MESSAGES across every room. This previously counted rooms, and
  // read from a separate /chats call whose result was thrown away by the list
  // screen — the two could disagree. Now both derive from the same Redux state,
  // which the socket bridge keeps current.
  const unreadCount = React.useMemo(
    () => chats.reduce((sum, c) => sum + (c.unreadCount || 0), 0),
    [chats]
  );

  // Authoritative refresh from the server. The socket keeps the count live, but
  // this covers cold start and anything missed while the app was backgrounded.
  useEffect(() => {
    if (!user) return;
    dispatch(fetchChats());
  }, [user, dispatch]);

  useEffect(() => {
    if (!user) return;
    const sub = AppState.addEventListener('change', (next) => {
      if (next === 'active') dispatch(fetchChats());
    });
    return () => sub.remove();
  }, [user, dispatch]);

  const handleSelectChat = (room: any) => {
    if (setActiveRoomId) setActiveRoomId(room.id);
    navigation.navigate('ChatRoom', { room });
  };

  const handleOpenProfile = (userId: string) => {
    navigation.navigate('UserProfile', { userId });
  };

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.cardBackground,
          borderTopColor: theme.cardBorder,
          height: 64,
          paddingBottom: 8,
          paddingTop: 8,
          elevation: 0
        },
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textMuted
      }}
    >
      <Tab.Screen
        name="FeedTab"
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => <Home size={size || 22} color={color} />
        }}
      >
        {(props) => (
          <HomeFeedScreen
            {...props}
            onOpenProfile={handleOpenProfile}
            onNavigateToCreatePost={() => props.navigation.navigate('PostTab')}
          />
        )}
      </Tab.Screen>

      <Tab.Screen
        name="FriendsTab"
        options={{
          tabBarLabel: 'Friends',
          tabBarIcon: ({ color, size }) => <Users size={size || 22} color={color} />
        }}
      >
        {(props) => (
          <FriendsScreen
            {...props}
            onSelectChat={handleSelectChat}
            onOpenProfile={handleOpenProfile}
          />
        )}
      </Tab.Screen>

      <Tab.Screen
        name="PostTab"
        options={{
          tabBarLabel: 'Post',
          tabBarIcon: ({ color, size }) => <PlusSquare size={size || 22} color={color} />
        }}
      >
        {(props) => (
          <CreatePostScreen
            {...props}
            onPostPublished={() => {
              props.navigation.navigate('FeedTab', { refresh: Date.now() });
            }}
          />
        )}
      </Tab.Screen>

      <Tab.Screen
        name="ChatsTab"
        options={{
          tabBarLabel: 'Chats',
          tabBarBadge: unreadCount > 0 ? unreadCount : undefined,
          tabBarBadgeStyle: { backgroundColor: '#FA383E', fontSize: 11, fontWeight: '800' },
          tabBarIcon: ({ color, size }) => <MessageSquare size={size || 22} color={color} />
        }}
      >
        {(props) => <HomeScreen {...props} onSelectChat={handleSelectChat} onOpenProfile={handleOpenProfile} />}
      </Tab.Screen>

      <Tab.Screen
        name="ProfileTab"
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size }) => <User size={size || 22} color={color} />
        }}
      >
        {(props) => <ProfileScreen {...props} onSelectChat={handleSelectChat} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

import { InAppNotificationBanner, InAppNotificationData } from '../components/InAppNotificationBanner';

export function AppNavigator() {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isOnboarded, setIsOnboarded] = useState(true);
  const [inAppNotification, setInAppNotification] = useState<InAppNotificationData | null>(null);

  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
  const activeRoomIdRef = useRef<string | null>(null);
  activeRoomIdRef.current = activeRoomId;

  useEffect(() => {
    const initSession = async () => {
      await dispatch(loadSavedSession());
      setIsInitializing(false);
    };
    initSession();
  }, [dispatch]);

  useEffect(() => {
    if (user && isAuthenticated) {
      initializeSocketReduxListeners(user.id);
      FCMClientService.requestUserPermissionAndGetToken();

      const socket = socketService.getSocket();
      if (socket) {
        const handleGlobalMessage = (newMsg: any) => {
          if (newMsg.senderId !== user.id) {
            if (newMsg.roomId !== activeRoomIdRef.current) {
              // Recipient is outside room: emit mark_message_delivered -> Double Grey Tick
              socket.emit('mark_message_delivered', {
                messageId: newMsg.id,
                roomId: newMsg.roomId,
                userId: user.id,
              });

              setInAppNotification({
                roomId: newMsg.roomId,
                senderName: newMsg.senderName || 'Message',
                senderAvatar: newMsg.senderAvatar,
                content: newMsg.type === 'audio' ? '🎤 Voice Note' : newMsg.content || 'Shared attachment',
              });
            } else {
              // Recipient is inside room: emit mark_messages_read -> Blue Double Tick
              socket.emit('mark_messages_read', {
                roomId: newMsg.roomId,
                userId: user.id,
              });
            }
          }
        };
        socket.on('receive_message', handleGlobalMessage);
        socket.on('message:received', handleGlobalMessage);

        return () => {
          socket.off('receive_message', handleGlobalMessage);
          socket.off('message:received', handleGlobalMessage);
        };
      }
    }
  }, [user, isAuthenticated]);

  if (isInitializing) {
    return (
      <View style={{ flex: 1, backgroundColor: '#18191A', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0084FF" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <InAppNotificationBanner
        notification={inAppNotification}
        onPressOpen={(roomId) => {
          setInAppNotification(null);
        }}
        onDismiss={() => setInAppNotification(null)}
      />

      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <Stack.Screen name="Auth" component={AuthScreen} />
        ) : !isOnboarded ? (
          <Stack.Screen name="Onboarding">
            {(props) => <OnboardingScreen {...props} onComplete={() => setIsOnboarded(true)} />}
          </Stack.Screen>
        ) : (
          <>
            <Stack.Screen name="MainTabs">
              {(props) => (
                <MainTabNavigator
                  {...props}
                  activeRoomId={activeRoomId}
                  setActiveRoomId={setActiveRoomId}
                />
              )}
            </Stack.Screen>
            <Stack.Screen name="ChatRoom">
              {(props: any) => (
                <ChatRoomScreen
                  room={props.route.params.room}
                  onBack={() => {
                    setActiveRoomId(null);
                    props.navigation.goBack();
                  }}
                />
              )}
            </Stack.Screen>
            <Stack.Screen name="UserProfile">
              {(props: any) => (
                <UserProfileScreen
                  userId={props.route.params.userId}
                  onBack={() => props.navigation.goBack()}
                  onSelectChat={(room) => {
                    setActiveRoomId(room.id);
                    props.navigation.navigate('ChatRoom', { room });
                  }}
                />
              )}
            </Stack.Screen>
          </>
        )}
      </Stack.Navigator>
    </View>
  );
}
