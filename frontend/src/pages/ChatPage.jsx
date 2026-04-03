import React, { useEffect, useMemo, useState } from 'react';
import { MessageSquare, Send, Users } from 'lucide-react';
import { theme } from '../styles/theme';

const formatTimestamp = (value) => {
  if (!value) {
    return '';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return date.toLocaleString([], {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};

export default function ChatPage({
  username,
  users = [],
  conversations = [],
  selectedChatUser,
  setSelectedChatUser,
  messages = [],
  newMessage,
  setNewMessage,
  onSendMessage,
}) {
  const [search, setSearch] = useState('');

  const conversationMap = useMemo(
    () => new Map(conversations.map((conversation) => [conversation.username, conversation])),
    [conversations]
  );

  const availableUsers = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return users
      .filter((candidate) => candidate.toLowerCase() !== username.toLowerCase())
      .filter((candidate) => candidate.toLowerCase().includes(normalizedSearch))
      .sort((left, right) => {
        const leftConversation = conversationMap.get(left);
        const rightConversation = conversationMap.get(right);
        if (leftConversation && rightConversation) {
          return new Date(rightConversation.last_message_at) - new Date(leftConversation.last_message_at);
        }
        if (leftConversation) {
          return -1;
        }
        if (rightConversation) {
          return 1;
        }
        return left.localeCompare(right);
      });
  }, [conversationMap, search, users, username]);

  useEffect(() => {
    if (!selectedChatUser && availableUsers.length > 0) {
      setSelectedChatUser(availableUsers[0]);
    }
  }, [availableUsers, selectedChatUser, setSelectedChatUser]);

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '320px minmax(0, 1fr)',
        gap: '20px',
        minHeight: '640px',
      }}
    >
      <aside
        style={{
          background: theme.cardBg,
          border: `1px solid ${theme.border}`,
          borderRadius: '24px',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <Users size={20} color={theme.primary} />
          <h2 style={{ margin: 0, fontSize: '20px' }}>Chats</h2>
        </div>
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Find a user..."
          style={{
            background: theme.innerBg,
            color: theme.text,
            border: `1px solid ${theme.border}`,
            borderRadius: '12px',
            padding: '12px 14px',
            outline: 'none',
            marginBottom: '16px',
          }}
        />

        <div style={{ display: 'grid', gap: '10px', overflowY: 'auto' }}>
          {availableUsers.length === 0 ? (
            <div style={{ color: theme.textMuted, fontSize: '14px' }}>No users available.</div>
          ) : (
            availableUsers.map((candidate) => {
              const conversation = conversationMap.get(candidate);
              const isActive = selectedChatUser === candidate;
              return (
                <button
                  key={candidate}
                  onClick={() => setSelectedChatUser(candidate)}
                  style={{
                    textAlign: 'left',
                    background: isActive ? `${theme.primary}22` : theme.innerBg,
                    border: `1px solid ${isActive ? theme.primary : theme.border}`,
                    borderRadius: '16px',
                    padding: '14px',
                    color: theme.text,
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', alignItems: 'center' }}>
                    <div style={{ fontWeight: 'bold' }}>{candidate}</div>
                    {conversation?.unread_count ? (
                      <div
                        style={{
                          minWidth: '22px',
                          height: '22px',
                          borderRadius: '999px',
                          display: 'grid',
                          placeItems: 'center',
                          background: theme.primary,
                          color: 'white',
                          fontSize: '12px',
                          fontWeight: 'bold',
                        }}
                      >
                        {conversation.unread_count}
                      </div>
                    ) : null}
                  </div>
                  <div style={{ marginTop: '6px', fontSize: '12px', color: theme.textMuted }}>
                    {conversation?.last_message_at ? `Last message ${formatTimestamp(conversation.last_message_at)}` : 'No messages yet'}
                  </div>
                </button>
              );
            })
          )}
        </div>
      </aside>

      <section
        style={{
          background: theme.cardBg,
          border: `1px solid ${theme.border}`,
          borderRadius: '24px',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {selectedChatUser ? (
          <>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                paddingBottom: '16px',
                marginBottom: '16px',
                borderBottom: `1px solid ${theme.border}`,
              }}
            >
              <MessageSquare size={20} color={theme.primary} />
              <div>
                <div style={{ fontSize: '12px', color: theme.textMuted }}>Conversation</div>
                <div style={{ fontSize: '20px', fontWeight: 'bold' }}>{selectedChatUser}</div>
              </div>
            </div>

            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                display: 'grid',
                gap: '12px',
                paddingRight: '4px',
                minHeight: '360px',
              }}
            >
              {messages.length === 0 ? (
                <div style={{ color: theme.textMuted, alignSelf: 'center', textAlign: 'center' }}>
                  Start the conversation with {selectedChatUser}.
                </div>
              ) : (
                messages.map((message) => {
                  const isMine = message.sender === username;
                  return (
                    <div
                      key={message.id}
                      style={{
                        justifySelf: isMine ? 'end' : 'start',
                        alignSelf: 'start',
                        maxWidth: '70%',
                        background: isMine ? theme.primary : theme.innerBg,
                        color: isMine ? 'white' : theme.text,
                        border: `1px solid ${isMine ? theme.primary : theme.border}`,
                        borderRadius: '18px',
                        padding: '12px 14px',
                        width: 'fit-content',
                      }}
                    >
                      <div style={{ fontSize: '14px', lineHeight: 1.5 }}>{message.content}</div>
                      <div
                        style={{
                          marginTop: '8px',
                          fontSize: '11px',
                          color: isMine ? 'rgba(255,255,255,0.75)' : theme.textMuted,
                          textAlign: 'right',
                        }}
                      >
                        {formatTimestamp(message.created_at)}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <form
              onSubmit={onSendMessage}
              style={{
                marginTop: '16px',
                display: 'grid',
                gridTemplateColumns: '1fr auto',
                gap: '12px',
              }}
            >
              <input
                value={newMessage}
                onChange={(event) => setNewMessage(event.target.value)}
                placeholder={`Message ${selectedChatUser}...`}
                style={{
                  background: theme.innerBg,
                  color: theme.text,
                  border: `1px solid ${theme.border}`,
                  borderRadius: '14px',
                  padding: '14px 16px',
                  outline: 'none',
                }}
              />
              <button
                type="submit"
                style={{
                  background: theme.primary,
                  color: 'white',
                  border: 'none',
                  borderRadius: '14px',
                  padding: '0 18px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <Send size={16} />
                Send
              </button>
            </form>
          </>
        ) : (
          <div style={{ color: theme.textMuted, margin: 'auto', textAlign: 'center' }}>
            Choose a user to start chatting.
          </div>
        )}
      </section>
    </div>
  );
}
