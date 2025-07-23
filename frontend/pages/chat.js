import React from 'react';
import { 
  AlertCircle, 
  WifiOff 
} from 'lucide-react';
import { Button, Text, Callout, Card, Badge, Avatar } from '@vapor-ui/core';
import { Flex, Box, HStack } from '../components/ui/Layout';
import { withAuth } from '../middleware/withAuth';
import { useChatRoom } from '../hooks/useChatRoom';
import ChatMessages from '../components/chat/ChatMessages';
import ChatInput from '../components/chat/ChatInput';
import { generateColorFromEmail, getContrastTextColor } from '../utils/colorUtils';

const ChatPage = () => {
  const {
    room,
    messages,
    streamingMessages,
    connected,
    connectionStatus,
    messageLoadError,
    retryMessageLoad,
    currentUser,
    message,
    showEmojiPicker,
    showMentionList,
    mentionFilter,
    mentionIndex,
    filePreview,
    fileInputRef,
    messageInputRef,
    messagesEndRef,
    socketRef,
    handleMessageChange,
    handleMessageSubmit,
    handleEmojiToggle,
    setMessage,
    setShowEmojiPicker,
    setShowMentionList,
    setMentionFilter,
    setMentionIndex,
    handleKeyDown,
    removeFilePreview,
    getFilteredParticipants,
    insertMention,
    loading,
    error,
    handleReactionAdd,
    handleReactionRemove,
    loadingMessages,
    hasMoreMessages,
    handleLoadMore
  } = useChatRoom();

  const renderParticipants = () => {
    if (!room?.participants) return null;

    const maxVisibleAvatars = 3;
    const participants = room.participants;
    const remainingCount = Math.max(0, participants.length - maxVisibleAvatars);

    return (
      <HStack gap="100" align="center">
          {participants.slice(0, maxVisibleAvatars).map(participant => {
            const backgroundColor = generateColorFromEmail(participant.email);
            const color = getContrastTextColor(backgroundColor);
            
            return (
              <Avatar.Root
                key={participant._id}
                size="md"
                style={{ 
                  backgroundColor, 
                  color,
                  flexShrink: 0
                }}
              >
                <Avatar.Fallback style={{ backgroundColor, color }}>
                  {participant.name.charAt(0).toUpperCase()}
                </Avatar.Fallback>
              </Avatar.Root>
            );
          })}
          {remainingCount > 0 && (
            <Avatar.Root
              size="md"
              style={{ 
                backgroundColor: 'var(--vapor-color-secondary)',
                color: 'white',
                flexShrink: 0
              }}
            >
              <Avatar.Fallback style={{ backgroundColor: 'var(--vapor-color-secondary)', color: 'white' }}>
                +{remainingCount}
              </Avatar.Fallback>
            </Avatar.Root>
          )}
          <Text typography="body2" className="ms-3">총 {participants.length}명</Text>
      </HStack>
    );
  };

  const renderLoadingState = () => (
    <div className="chat-container">
      <Card.Root className="chat-room-card">
        <Card.Body style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Box style={{ textAlign: 'center', marginTop: 'var(--vapor-space-500)' }}>
            <div className="spinner-border mb-4" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <br/>
            <Text typography="heading5">채팅방 연결 중...</Text>
          </Box>
        </Card.Body>
      </Card.Root>
    </div>
  );

  const renderErrorState = () => (
    <div className="chat-container">
      <Card.Root className="chat-room-card">
        <Card.Body style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <Box style={{ marginBottom: 'var(--vapor-space-400)' }}>
            <Callout color="danger">
              <Flex align="center" gap="200">
                <AlertCircle className="w-5 h-5" />
                <Text>
                  {error || '채팅방을 불러오는데 실패했습니다.'}
                </Text>
              </Flex>
            </Callout>
          </Box>
          <Button
            onClick={() => window.location.reload()}
          >
            다시 시도
          </Button>
        </Card.Body>
      </Card.Root>
    </div>
  );

  const renderContent = () => {
    if (loading) {
      return (
        <div className="d-flex align-items-center justify-content-center p-4">
          <div className="spinner-border spinner-border-sm me-2" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <span>채팅방 연결 중...</span>
        </div>
      );
    }

    if (error) {
      return (
        <div className="d-flex flex-column align-items-center justify-content-center p-4">
          <Callout color="danger" className="mb-4 d-flex align-items-center">
            <AlertCircle className="w-5 h-5 me-2" />
            <span>{error}</span>
          </Callout>
          <Button onClick={() => window.location.reload()}>
            다시 시도
          </Button>
        </div>
      );
    }

    if (connectionStatus === 'disconnected') {
      return (
        <Box style={{ margin: 'var(--vapor-space-400)' }}>
          <Callout color="warning" className="d-flex align-items-center">
            <WifiOff className="w-5 h-5 me-2" />
            <span>연결이 끊어졌습니다. 재연결을 시도합니다...</span>
          </Callout>
        </Box>
      );
    }

    if (messageLoadError) {
      return (
        <div className="d-flex flex-column align-items-center justify-content-center p-4">
          <Callout color="danger" className="mb-4 d-flex align-items-center">
            <AlertCircle className="w-5 h-5 me-2" />
            <span>메시지 로딩 중 오류가 발생했습니다.</span>
          </Callout>
          <Button onClick={retryMessageLoad}>
            메시지 다시 로드
          </Button>
        </div>
      );
    }

    return (
      <ChatMessages
        messages={messages}
        streamingMessages={streamingMessages}
        currentUser={currentUser}
        room={room}
        messagesEndRef={messagesEndRef}
        onReactionAdd={handleReactionAdd}
        onReactionRemove={handleReactionRemove}
        loadingMessages={loadingMessages}
        hasMoreMessages={hasMoreMessages}
        onLoadMore={handleLoadMore}
        socketRef={socketRef}
      />
    );
  };

  if (loading || !room) {
    return renderLoadingState();
  }

  if (error) {
    return renderErrorState();
  }

  const getConnectionStatus = () => {
    if (connectionStatus === 'connecting') {
      return {
        label: "연결 중...",
        color: "warning"
      };
    } else if (connectionStatus === 'connected') {
      return {
        label: "연결됨",
        color: "success"
      };
    } else {
      return {
        label: "연결 끊김",
        color: "danger"
      };
    }
  };

  const status = getConnectionStatus();

  return (
    <div className="chat-container">
      <Card.Root className="chat-room-card">
        <Card.Header className="chat-room-header">
          <Flex justify="space-between" align="center">
            <Flex align="center" gap="300">
              <Text typography="heading4" style={{ fontWeight: 'bold' }} className="chat-room-title">
                {room.name}
              </Text>
              {renderParticipants()}
            </Flex>
            <Badge color={status.color === 'success' ? 'success' : status.color === 'warning' ? 'warning' : 'danger'}>
              {status.label}
            </Badge>
          </Flex>
        </Card.Header>

        <Card.Body className="chat-room-body">
          <div className="chat-messages">
            {renderContent()}
          </div>
        </Card.Body>

        <Card.Footer className="chat-room-footer">
          <ChatInput 
            message={message}
            onMessageChange={handleMessageChange}
            onSubmit={handleMessageSubmit}
            onEmojiToggle={handleEmojiToggle}
            fileInputRef={fileInputRef}
            messageInputRef={messageInputRef}
            filePreview={filePreview}
            disabled={connectionStatus !== 'connected'}
            uploading={false}
            showEmojiPicker={showEmojiPicker}
            showMentionList={showMentionList}
            mentionFilter={mentionFilter}
            mentionIndex={mentionIndex}
            getFilteredParticipants={getFilteredParticipants}
            setMessage={setMessage}
            setShowEmojiPicker={setShowEmojiPicker}
            setShowMentionList={setShowMentionList}
            setMentionFilter={setMentionFilter}
            setMentionIndex={setMentionIndex}
            room={room} // room 객체 전달
            onMentionSelect={(user) => {
              insertMention(user);
              setShowMentionList(false);
            }}
            onFileRemove={removeFilePreview}
          />
        </Card.Footer>
      </Card.Root>
    </div>
  );
};

export default withAuth(ChatPage);