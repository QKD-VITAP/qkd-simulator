import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { 
  Send, 
  MessageSquare, 
  Key, 
  Shield, 
  RefreshCw, 
  CheckCircle,
  AlertTriangle,
  BarChart3,
  Users
} from 'lucide-react';
import qkdApi from '../api/qkdApi';

const MessagingContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  min-height: 100%;
  width: 100%;
`;

const Header = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 32px;
  border-radius: 16px;
  text-align: center;
`;

const HeaderTitle = styled.h1`
  font-size: 32px;
  font-weight: 700;
  margin: 0 0 8px 0;
`;

const HeaderSubtitle = styled.p`
  font-size: 18px;
  margin: 0;
  opacity: 0.9;
`;

const MessagingGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 24px;
  width: 100%;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const MessagingCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
`;

const CardTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 20px 0;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const KeySection = styled.div`
  background: #f0f9ff;
  border: 1px solid #0ea5e9;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
`;

const KeyHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
`;

const KeyStatus = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  background: ${props => props.$active ? '#dcfce7' : '#fee2e2'};
  color: ${props => props.$active ? '#166534' : '#dc2626'};
`;

const KeyInfo = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 16px;
`;

const KeyInfoItem = styled.div`
  text-align: center;
  padding: 12px;
  background: white;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
`;

const KeyInfoLabel = styled.div`
  font-size: 12px;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
`;

const KeyInfoValue = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
`;

const Button = styled.button`
  padding: 12px 20px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const PrimaryButton = styled(Button)`
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(59, 130, 246, 0.3);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const SuccessButton = styled(Button)`
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(16, 185, 129, 0.3);
  }
`;

const SecondaryButton = styled(Button)`
  background: #f1f5f9;
  color: #475569;

  &:hover:not(:disabled) {
    background: #e2e8f0;
  }
`;

const MessageSection = styled.div`
  background: #fef3c7;
  border: 1px solid #f59e0b;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
`;

const MessageForm = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const FormLabel = styled.label`
  font-weight: 500;
  color: #374151;
  font-size: 14px;
`;

const FormInput = styled.input`
  padding: 12px 16px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const FormTextarea = styled.textarea`
  padding: 12px 16px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  min-height: 100px;
  resize: vertical;
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const FormSelect = styled.select`
  padding: 12px 16px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  background: white;
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const MessagesList = styled.div`
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 20px;
`;

const MessageItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  background: white;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  margin-bottom: 12px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const MessageContent = styled.div`
  flex: 1;
`;

const MessageHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
`;

const MessageSender = styled.span`
  font-weight: 600;
  color: #1e293b;
`;

const MessageReceiver = styled.span`
  color: #64748b;
`;

const MessageText = styled.div`
  color: #374151;
  margin-bottom: 4px;
`;

const MessageTime = styled.div`
  font-size: 12px;
  color: #64748b;
`;

const MessageStatus = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  background: ${props => {
    switch (props.$status) {
      case 'sent': return '#dbeafe';
      case 'delivered': return '#dcfce7';
      default: return '#f1f5f9';
    }
  }};
  color: ${props => {
    switch (props.$status) {
      case 'sent': return '#1e40af';
      case 'delivered': return '#166534';
      default: return '#64748b';
    }
  }};
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-top: 20px;
`;

const StatCard = styled.div`
  background: white;
  padding: 16px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  text-align: center;
`;

const StatValue = styled.div`
  font-size: 24px;
  font-weight: 700;
  color: #3b82f6;
  margin-bottom: 4px;
`;

const StatLabel = styled.div`
  font-size: 12px;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const SecureMessaging = () => {
  const [currentUser, setCurrentUser] = useState('alice');
  const [quantumKey, setQuantumKey] = useState(null);
  const [keyLoading, setKeyLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  const [messageForm, setMessageForm] = useState({
    receiverId: '',
    message: '',
    encryptionMode: 'GCM',
    keyLength: 256
  });
  const [sendingMessage, setSendingMessage] = useState(false);
  const [messagingStats, setMessagingStats] = useState(null);
  const [sharedKeyForm, setSharedKeyForm] = useState({
    user1Id: 'alice',
    user2Id: 'bob',
    keyLength: 256
  });
  const [sharedKeyLoading, setSharedKeyLoading] = useState(false);
  const [receivedMessages, setReceivedMessages] = useState([]);
  const [userKeys, setUserKeys] = useState({});

  const switchUser = (newUser) => {
    setCurrentUser(newUser);
    const otherUser = newUser === 'alice' ? 'bob' : 'alice';
    setMessageForm(prev => ({ ...prev, receiverId: otherUser }));
  };

  const generateQuantumKey = async () => {
    try {
      setKeyLoading(true);
      const response = await qkdApi.generateQuantumKey(currentUser, messageForm.keyLength);
      
      if (response.success) {
        setQuantumKey(response);
        setUserKeys(prev => ({ ...prev, [currentUser]: response }));
        alert('✅ Quantum key generated successfully!');
      } else {
        alert('❌ Failed to generate quantum key');
      }
    } catch (error) {
      alert('❌ Failed to generate quantum key. Please try again.');
    } finally {
      setKeyLoading(false);
    }
  };

  const refreshQuantumKey = async () => {
    try {
      setKeyLoading(true);
      const response = await qkdApi.refreshQuantumKey(currentUser, messageForm.keyLength);
      
      if (response.success) {
        setQuantumKey(response);
        setUserKeys(prev => ({ ...prev, [currentUser]: response }));
        alert('✅ Quantum key refreshed successfully!');
      } else {
        alert('❌ Failed to refresh quantum key');
      }
    } catch (error) {
      alert('❌ Failed to refresh quantum key. Please try again.');
    } finally {
      setKeyLoading(false);
    }
  };

  const fetchUserMessages = async (userId) => {
    try {
      const sentMessagesResponse = await qkdApi.getUserMessages(userId, 'sent');
      const receivedMessagesResponse = await qkdApi.getUserMessages(userId, 'received');
      
      const sentMessages = Array.isArray(sentMessagesResponse?.messages) ? sentMessagesResponse.messages : [];
      const receivedMessages = Array.isArray(receivedMessagesResponse?.messages) ? receivedMessagesResponse.messages : [];
      
      setMessages(sentMessages);
      setReceivedMessages(receivedMessages);
    } catch (error) {
      setMessages([]);
      setReceivedMessages([]);
    }
  };

  const generateSharedQuantumKey = async () => {
    if (!sharedKeyForm.user1Id.trim() || !sharedKeyForm.user2Id.trim()) {
      alert('Please enter both user IDs');
      return;
    }

    try {
      setSharedKeyLoading(true);
      const response = await qkdApi.generateSharedQuantumKey({
        user1_id: sharedKeyForm.user1Id,
        user2_id: sharedKeyForm.user2Id,
        key_length: sharedKeyForm.keyLength
      });
      
      if (response.success) {
        alert('✅ Shared quantum key generated successfully!');
        if (sharedKeyForm.user1Id === 'alice' && sharedKeyForm.user2Id === 'bob') {
          setTimeout(() => demonstrateSecureMessaging(sharedKeyForm.user1Id, sharedKeyForm.user2Id), 1000);
        }
        setSharedKeyForm({ user1Id: 'alice', user2Id: 'bob', keyLength: 256 });
      } else {
        alert('❌ Failed to generate shared quantum key');
      }
    } catch (error) {
      alert('❌ Failed to generate shared quantum key. Please try again.');
    } finally {
      setSharedKeyLoading(false);
    }
  };

  const demonstrateSecureMessaging = async (user1, user2) => {
    try {
      const testMessage = `Hello ${user2}! This is a secure message from ${user1} using our shared quantum key. 🔐✨`;
      
      const sendResponse = await qkdApi.sendSecureMessage({
        sender_id: user1,
        receiver_id: user2,
        message: testMessage,
        encryption_mode: 'GCM',
        key_length: 256
      });
      
      if (sendResponse.success) {
        const newMessage = {
          message_id: sendResponse.message_id,
          sender_id: user1,
          receiver_id: user2,
          message: testMessage,
          timestamp: new Date().toISOString(),
          status: 'sent'
        };
        setMessages(prev => [newMessage, ...prev]);
        
        setTimeout(async () => {
          try {
            const receiveResponse = await qkdApi.receiveSecureMessage({
              receiver_id: user2,
              message_id: sendResponse.message_id
            });
            
            if (receiveResponse.success) {
              alert(`🎉 DEMONSTRATION COMPLETE!\n\n✅ ${user1} sent encrypted message\n✅ ${user2} successfully decrypted it\n\nThis proves quantum-secured messaging works!`);
            }
          } catch (error) {}
        }, 500);
        
        alert(`🚀 DEMO MESSAGE SENT!\n\nFrom: ${user1}\nTo: ${user2}\nMessage: ${testMessage}\n\nNow try receiving it as ${user2}!`);
      }
    } catch (error) {}
  };

  const sendSecureMessage = async () => {
    if (!messageForm.receiverId.trim() || !messageForm.message.trim()) {
      alert('Please enter both receiver ID and message');
      return;
    }

    if (!quantumKey) {
      alert('Please generate a quantum key first');
      return;
    }

    try {
      setSendingMessage(true);
      const response = await qkdApi.sendSecureMessage({
        sender_id: currentUser,
        receiver_id: messageForm.receiverId,
        message: messageForm.message,
        encryption_mode: messageForm.encryptionMode,
        key_length: messageForm.keyLength
      });

      if (response.success) {
        const newMessage = {
          message_id: response.message_id,
          sender_id: currentUser,
          receiver_id: messageForm.receiverId,
          message: messageForm.message,
          timestamp: new Date().toISOString(),
          status: 'sent'
        };
        setMessages(prev => [newMessage, ...prev]);
        
        const otherUser = currentUser === 'alice' ? 'bob' : 'alice';
        setMessageForm(prev => ({ ...prev, receiverId: otherUser, message: '' }));
        
        alert('✅ Secure message sent successfully!');
        fetchMessagingStats();
        fetchUserMessages(currentUser);
        fetchUserMessages(messageForm.receiverId);
      } else {
        alert('❌ Failed to send message');
      }
    } catch (error) {
      alert('❌ Failed to send message. Please try again.');
    } finally {
      setSendingMessage(false);
    }
  };

  const fetchMessagingStats = async () => {
    try {
      const stats = await qkdApi.getMessagingStatistics();
      setMessagingStats(stats);
    } catch (error) {}
  };

  const receiveMessage = async (messageId) => {
    try {
      const response = await qkdApi.receiveSecureMessage({
        receiver_id: currentUser,
        message_id: messageId
      });
      
      if (response.success) {
        alert(`🔓 Message decrypted successfully!\n\nFrom: ${response.sender_id}\nMessage: ${response.decrypted_message}`);
        
        setReceivedMessages(prev => 
          prev.map(msg => 
            msg.message_id === messageId 
              ? { ...msg, status: 'delivered', decrypted_message: response.decrypted_message }
              : msg
          )
        );
        fetchUserMessages(currentUser);
      } else {
        alert('❌ Failed to decrypt message');
      }
    } catch (error) {
      alert('❌ Failed to receive message. Please try again.');
    }
  };

  useEffect(() => {
    const checkUserKey = async () => {
      try {
        const response = await qkdApi.getUserQuantumKey(currentUser);
        if (response.key_available) {
          setQuantumKey(response);
          setUserKeys(prev => ({ ...prev, [currentUser]: response }));
        }
      } catch (error) {}
    };

    checkUserKey();
    fetchMessagingStats();
    fetchUserMessages(currentUser);
  }, [currentUser]);

  return (
    <MessagingContainer>
             <Header>
         <HeaderTitle>🔐 Quantum-Secured Messaging</HeaderTitle>
         <HeaderSubtitle>
           Send messages using quantum-generated keys and AES encryption
         </HeaderSubtitle>
         
         <div style={{ 
           marginTop: '20px', 
           background: 'rgba(255, 255, 255, 0.1)', 
           borderRadius: '12px', 
           padding: '16px' 
         }}>
           <div style={{ marginBottom: '12px', fontSize: '16px', fontWeight: '600' }}>
             👤 Switch User Identity
           </div>
           <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
             {['alice', 'bob'].map(user => (
               <button
                 key={user}
                 onClick={() => switchUser(user)}
                 style={{
                   padding: '8px 16px',
                   borderRadius: '20px',
                   border: 'none',
                   background: currentUser === user ? '#ffffff' : 'rgba(255, 255, 255, 0.2)',
                   color: currentUser === user ? '#1e293b' : '#ffffff',
                   fontWeight: '600',
                   cursor: 'pointer',
                   transition: 'all 0.2s ease'
                 }}
               >
                 {user.charAt(0).toUpperCase() + user.slice(1)}
               </button>
             ))}
           </div>
           <div style={{ 
             marginTop: '12px', 
             fontSize: '14px', 
             opacity: '0.9',
             textAlign: 'center'
           }}>
             Currently logged in as: <strong>{currentUser}</strong>
           </div>
         </div>
       </Header>

      <MessagingGrid>
        <MessagingCard>
          <CardTitle>
            <Key size={20} />
            Quantum Key Management
          </CardTitle>
          
          <KeySection>
                         <KeyHeader>
               <div>
                 <strong>Current User:</strong> {currentUser}
               </div>
               <KeyStatus $active={!!quantumKey}>
                 {quantumKey ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
                 {quantumKey ? 'Active' : 'No Key'}
               </KeyStatus>
             </KeyHeader>

            {quantumKey && (
              <KeyInfo>
                <KeyInfoItem>
                  <KeyInfoLabel>Key Length</KeyInfoLabel>
                  <KeyInfoValue>{quantumKey.key_length} bits</KeyInfoValue>
                </KeyInfoItem>
                <KeyInfoItem>
                  <KeyInfoLabel>Security Level</KeyInfoLabel>
                  <KeyInfoValue>{(quantumKey.security_metrics?.security_level * 100).toFixed(1)}%</KeyInfoValue>
                </KeyInfoItem>
                <KeyInfoItem>
                  <KeyInfoLabel>QBER</KeyInfoLabel>
                  <KeyInfoValue>{(quantumKey.security_metrics?.qber * 100).toFixed(2)}%</KeyInfoValue>
                </KeyInfoItem>
              </KeyInfo>
            )}

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <PrimaryButton 
                onClick={generateQuantumKey} 
                disabled={keyLoading}
              >
                <Key size={16} />
                {quantumKey ? 'Generate New' : 'Generate Key'}
              </PrimaryButton>
              
              {quantumKey && (
                <SecondaryButton onClick={refreshQuantumKey} disabled={keyLoading}>
                  <RefreshCw size={16} />
                  Refresh
                </SecondaryButton>
              )}
            </div>
          </KeySection>


           <div style={{ marginTop: '20px' }}>
             <CardTitle>
               <Users size={16} />
               Shared Quantum Key Generation
             </CardTitle>
             <div style={{ 
               background: '#f0f9ff', 
               border: '1px solid #0ea5e9', 
               borderRadius: '12px', 
               padding: '20px' 
             }}>
               <p style={{ marginBottom: '16px', color: '#0c4a6e', fontSize: '14px' }}>
                 <strong>🔐 Real QKD Simulation:</strong> Generate a shared quantum key between Alice and Bob.
                 In real quantum systems, both parties share the same key for secure communication.
               </p>
               
               <PrimaryButton 
                 onClick={generateSharedQuantumKey} 
                 disabled={sharedKeyLoading}
               >
                 <Users size={16} />
                 {sharedKeyLoading ? 'Generating...' : 'Generate Shared Quantum Key'}
               </PrimaryButton>
             </div>
           </div>

        </MessagingCard>

        <MessagingCard>
          <CardTitle>
            <MessageSquare size={20} />
            Secure Messaging
          </CardTitle>
          
          <MessageSection>
            <CardTitle>
              <Send size={16} />
              Send Secure Message
            </CardTitle>
            
            <MessageForm>
              <FormGroup>
                <FormLabel>Receiver ID</FormLabel>
                <FormSelect
                  value={messageForm.receiverId}
                  onChange={(e) => setMessageForm(prev => ({ ...prev, receiverId: e.target.value }))}
                >
                  <option value="">Select receiver...</option>
                  {['alice', 'bob'].filter(user => user !== currentUser).map(user => (
                    <option key={user} value={user}>{user.charAt(0).toUpperCase() + user.slice(1)}</option>
                  ))}
                </FormSelect>
              </FormGroup>

              <FormGroup>
                <FormLabel>Message</FormLabel>
                <FormTextarea
                  placeholder="Type your secure message here..."
                  value={messageForm.message}
                  onChange={(e) => setMessageForm(prev => ({ ...prev, message: e.target.value }))}
                />
              </FormGroup>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <FormGroup>
                  <FormLabel>Encryption Mode</FormLabel>
                  <FormSelect
                    value={messageForm.encryptionMode}
                    onChange={(e) => setMessageForm(prev => ({ ...prev, encryptionMode: e.target.value }))}
                  >
                    <option value="GCM">GCM (Authenticated)</option>
                    <option value="CBC">CBC</option>
                    <option value="CTR">CTR</option>
                  </FormSelect>
                </FormGroup>

                <FormGroup>
                  <FormLabel>Key Length</FormLabel>
                  <FormSelect
                    value={messageForm.keyLength}
                    onChange={(e) => setMessageForm(prev => ({ ...prev, keyLength: parseInt(e.target.value) }))}
                  >
                    <option value={128}>128 bits</option>
                    <option value={192}>192 bits</option>
                    <option value={256}>256 bits</option>
                  </FormSelect>
                </FormGroup>
              </div>

                             <SuccessButton 
                 onClick={sendSecureMessage} 
                 disabled={sendingMessage || !quantumKey}
               >
                 <Send size={16} />
                 {sendingMessage ? 'Sending...' : 'Send Secure Message'}
               </SuccessButton>
             </MessageForm>
           </MessageSection>


           <div style={{ marginBottom: '20px' }}>
             <CardTitle>
               <MessageSquare size={16} />
               📥 Received Messages (Click to Decrypt)
             </CardTitle>
             
             {!Array.isArray(receivedMessages) ? (
               <div style={{ textAlign: 'center', padding: '20px', color: '#ef4444' }}>
                 <AlertTriangle size={32} style={{ marginBottom: '12px' }} />
                 <p>Error loading received messages. Please refresh the page.</p>
               </div>
             ) : receivedMessages.length === 0 ? (
               <div style={{ textAlign: 'center', padding: '20px', color: '#64748b' }}>
                 <MessageSquare size={32} style={{ marginBottom: '12px', opacity: 0.5 }} />
                 <p>No received messages yet.</p>
               </div>
             ) : (
               receivedMessages.map(msg => (
                 <div key={msg.message_id} style={{
                   background: 'white',
                   padding: '16px',
                   borderRadius: '8px',
                   border: '1px solid #e2e8f0',
                   marginBottom: '12px',
                   cursor: 'pointer',
                   transition: 'all 0.2s ease'
                 }}
                 onClick={() => receiveMessage(msg.message_id)}
                 onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                 onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                 >
                   <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                     <div style={{ fontWeight: '600', color: '#1e293b' }}>
                       From: {msg.sender_id}
                     </div>
                     <div style={{
                       padding: '4px 12px',
                       borderRadius: '12px',
                       fontSize: '12px',
                       fontWeight: '500',
                       background: msg.status === 'delivered' ? '#dcfce7' : '#fef3c7',
                       color: msg.status === 'delivered' ? '#166534' : '#92400e'
                     }}>
                       {msg.status === 'delivered' ? '🔓 Decrypted' : '🔒 Click to Decrypt'}
                     </div>
                   </div>
                   <div style={{ color: '#64748b', fontSize: '14px' }}>
                     {msg.status === 'delivered' && msg.decrypted_message 
                       ? msg.decrypted_message 
                       : 'Encrypted message (click to decrypt)'
                     }
                   </div>
                   <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '8px' }}>
                     {new Date(msg.timestamp).toLocaleTimeString()}
                   </div>
                 </div>
               ))
             )}
           </div>

           <MessagesList>
             <CardTitle>
               <MessageSquare size={16} />
               📤 Sent Messages
             </CardTitle>
             
             {!Array.isArray(messages) ? (
               <div style={{ textAlign: 'center', padding: '40px', color: '#ef4444' }}>
                 <AlertTriangle size={48} style={{ marginBottom: '16px' }} />
                 <p>Error loading sent messages. Please refresh the page.</p>
               </div>
             ) : messages.length === 0 ? (
               <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                 <MessageSquare size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
                 <p>No messages sent yet. Send your first secure message!</p>
               </div>
             ) : (
               messages.map(msg => (
                 <MessageItem key={msg.message_id}>
                   <MessageContent>
                     <MessageHeader>
                       <MessageSender>To: {msg.receiver_id}</MessageSender>
                       <MessageReceiver>•</MessageReceiver>
                       <MessageTime>
                         {new Date(msg.timestamp).toLocaleTimeString()}
                       </MessageTime>
                     </MessageHeader>
                     <MessageText>{msg.message}</MessageText>
                   </MessageContent>
                   <MessageStatus $status={msg.status}>
                     <Shield size={14} />
                     {msg.status}
                   </MessageStatus>
                 </MessageItem>
               ))
             )}
           </MessagesList>

          {messagingStats && (
            <div style={{ marginTop: '20px' }}>
              <CardTitle>
                <BarChart3 size={16} />
                Messaging Statistics
              </CardTitle>
              <StatsGrid>
                <StatCard>
                  <StatValue>{messagingStats.total_messages}</StatValue>
                  <StatLabel>Total Messages</StatLabel>
                </StatCard>
                <StatCard>
                  <StatValue>{messagingStats.sent_messages}</StatValue>
                  <StatLabel>Sent</StatLabel>
                </StatCard>
                <StatCard>
                  <StatValue>{messagingStats.delivered_messages}</StatValue>
                  <StatLabel>Delivered</StatLabel>
                </StatCard>
                <StatCard>
                  <StatValue>{messagingStats.active_users}</StatValue>
                  <StatLabel>Active Users</StatLabel>
                </StatCard>
              </StatsGrid>
            </div>
          )}
        </MessagingCard>
      </MessagingGrid>
    </MessagingContainer>
  );
};

export default SecureMessaging;
