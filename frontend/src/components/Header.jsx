import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Bell, User, Wifi, Activity, WifiOff } from 'lucide-react';
import qkdApi from '../api/qkdApi';

const HeaderContainer = styled.header`
  background: white;
  border-bottom: 1px solid #e2e8f0;
  padding: 16px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const PageTitle = styled.h2`
  font-size: 24px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
`;

const StatusIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  background: ${props => {
    switch (props.$status) {
      case 'connected': return '#f0f9ff';
      case 'checking': return '#f8fafc';
      case 'disconnected': return '#fef2f2';
      default: return '#f8fafc';
    }
  }};
  color: ${props => {
    switch (props.$status) {
      case 'connected': return '#0369a1';
      case 'checking': return '#64748b';
      case 'disconnected': return '#dc2626';
      default: return '#64748b';
    }
  }};
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  border: 1px solid ${props => {
    switch (props.$status) {
      case 'connected': return '#bae6fd';
      case 'checking': return '#e2e8f0';
      case 'disconnected': return '#fecaca';
      default: return '#e2e8f0';
    }
  }};
`;

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const IconButton = styled.button`
  background: none;
  border: none;
  padding: 8px;
  border-radius: 8px;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;

  &:hover {
    background: #f1f5f9;
    color: #475569;
  }
`;

const NotificationBadge = styled.span`
  position: absolute;
  top: 4px;
  right: 4px;
  background: #ef4444;
  color: white;
  border-radius: 50%;
  width: 8px;
  height: 8px;
  font-size: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const UserProfile = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 16px;
  background: #f8fafc;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #e2e8f0;
  }
`;

const UserAvatar = styled.div`
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
`;

const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const UserName = styled.span`
  font-weight: 600;
  color: #1e293b;
  font-size: 14px;
`;

const UserRole = styled.span`
  color: #64748b;
  font-size: 12px;
`;

const Header = ({ currentPage = 'Dashboard' }) => {
  const [connectionStatus, setConnectionStatus] = useState('checking');
  const [lastCheck, setLastCheck] = useState(null);

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const response = await qkdApi.testConnection();
        setConnectionStatus(response.success ? 'connected' : 'disconnected');
        setLastCheck(new Date());
      } catch (err) {
        setConnectionStatus('disconnected');
        setLastCheck(new Date());
      }
    };

    checkConnection();

    const interval = setInterval(checkConnection, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <HeaderContainer>
      <HeaderLeft>
        <PageTitle>{currentPage}</PageTitle>
        <StatusIndicator $status={connectionStatus}>
          {connectionStatus === 'connected' ? (
            <>
              <Wifi size={14} />
              Live
            </>
          ) : connectionStatus === 'checking' ? (
            <>
              <Activity size={14} />
              Connecting...
            </>
          ) : (
            <>
              <WifiOff size={14} />
              Offline
            </>
          )}
        </StatusIndicator>
      </HeaderLeft>
      
      <HeaderRight>
        <IconButton>
          <Bell size={20} />
          <NotificationBadge />
        </IconButton>
        
        <UserProfile>
          <UserAvatar>Q</UserAvatar>
          <UserInfo>
            <UserName>Quantum User</UserName>
            <UserRole>Researcher</UserRole>
          </UserInfo>
        </UserProfile>
      </HeaderRight>
    </HeaderContainer>
  );
};

export default Header;
