import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, User, Settings } from 'lucide-react';

const ProfileContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const ProfileButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  background: transparent;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: #f1f5f9;
  }
`;

const ProfileImage = styled.img`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
`;

const ProfileName = styled.span`
  font-weight: 500;
  color: #1e293b;
  font-size: 0.875rem;
`;

const DropdownMenu = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 0.5rem;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  min-width: 200px;
  z-index: 50;
  overflow: hidden;
`;

const DropdownItem = styled.button`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0.75rem 1rem;
  background: transparent;
  border: none;
  text-align: left;
  cursor: pointer;
  transition: background-color 0.2s ease;
  color: #374151;
  font-size: 0.875rem;

  &:hover {
    background-color: #f9fafb;
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

const UserInfo = styled.div`
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #e2e8f0;
  background-color: #f8fafc;
`;

const UserName = styled.div`
  font-weight: 600;
  color: #1e293b;
  font-size: 0.875rem;
`;

const UserEmail = styled.div`
  color: #64748b;
  font-size: 0.75rem;
  margin-top: 0.25rem;
`;

const UserProfile = () => {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (!user) return null;

  const handleLogout = () => {
    logout();
    setIsOpen(false);
  };

  return (
    <ProfileContainer ref={dropdownRef}>
      <ProfileButton onClick={() => setIsOpen(!isOpen)}>
        <ProfileImage 
          src={user.picture || '/default-avatar.png'} 
          alt={user.name}
          onError={(e) => {
            e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTYiIGN5PSIxNiIgcj0iMTYiIGZpbGw9IiNFMkU4RjAiLz4KPHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4PSI4IiB5PSI4Ij4KPHBhdGggZD0iTTggOEM5LjY1Njg1IDggMTEgNi42NTY4NSAxMSA1QzExIDMuMzQzMTUgOS42NTY4NSAyIDggMkM2LjM0MzE1IDIgNSAzLjM0MzE1IDUgNUM1IDYuNjU2ODUgNi4zNDMxNSA4IDggOFoiIGZpbGw9IiM2NDc0OEIiLz4KPHBhdGggZD0iTTggMTBDMTAuMjA5MSAxMCAxMiA4LjIwOTE0IDEyIDZDMTIgMy43OTA4NiAxMC4yMDkxIDIgOCAyQzUuNzkwODYgMiA0IDMuNzkwODYgNCA2QzQgOC4yMDkxNCA1Ljc5MDg2IDEwIDggMTBaIiBmaWxsPSIjNjQ3NDhCIi8+CjxwYXRoIGQ9Ik0yIDE0QzIgMTEuNzkwOSAzLjc5MDg2IDEwIDYgMTBIMTBMMTIgMTBDMTQuMjA5MSAxMCAxNiAxMS43OTA5IDE2IDE0VjE0SDJWMTQiIGZpbGw9IiM2NDc0OEIiLz4KPC9zdmc+Cjwvc3ZnPgo=';
          }}
        />
        <ProfileName>{user.name}</ProfileName>
      </ProfileButton>

      {isOpen && (
        <DropdownMenu>
          <UserInfo>
            <UserName>{user.name}</UserName>
            <UserEmail>{user.email}</UserEmail>
          </UserInfo>
          
          <DropdownItem>
            <User />
            Profile
          </DropdownItem>
          
          <DropdownItem>
            <Settings />
            Settings
          </DropdownItem>
          
          <DropdownItem onClick={handleLogout}>
            <LogOut />
            Sign Out
          </DropdownItem>
        </DropdownMenu>
      )}
    </ProfileContainer>
  );
};

export default UserProfile;
