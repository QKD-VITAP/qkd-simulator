import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import styled from 'styled-components';
import { 
  Home, 
  Play, 
  Shield, 
  BarChart3, 
  Zap,
  Activity,
  Cpu,
  MessageSquare,
  Menu,
  X
} from 'lucide-react';

const SidebarContainer = styled.aside`
  width: 280px;
  background: linear-gradient(180deg, #1e293b 0%, #334155 100%);
  color: white;
  padding: 24px 0;
  box-shadow: 4px 0 10px rgba(0, 0, 0, 0.1);
  overflow-y: auto;
  transition: transform 0.3s ease;
  z-index: 1000;

  @media (max-width: 768px) {
    position: fixed;
    top: 0;
    left: 0;
    height: 100vh;
    transform: ${props => props.$isOpen ? 'translateX(0)' : 'translateX(-100%)'};
    width: 280px;
    z-index: 1000;
  }

  @media (max-width: 480px) {
    width: 100vw;
  }
`;

const MobileOverlay = styled.div`
  display: none;
  
  @media (max-width: 768px) {
    display: ${props => props.$isOpen ? 'block' : 'none'};
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 999;
  }
`;

const MobileMenuButton = styled.button`
  display: none;
  
  @media (max-width: 768px) {
    display: flex;
    position: fixed;
    top: 16px;
    left: 16px;
    z-index: 1001;
    background: #3b82f6;
    color: white;
    border: none;
    border-radius: 8px;
    padding: 8px;
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  }
`;

const Logo = styled.div`
  padding: 0 24px 32px;
  border-bottom: 1px solid #475569;
  margin-bottom: 24px;
`;

const LogoTitle = styled.h1`
  font-size: 24px;
  font-weight: 700;
  color: #60a5fa;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const Nav = styled.nav`
  padding: 0 16px;
`;

const NavItem = styled(NavLink)`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  color: #cbd5e1;
  text-decoration: none;
  border-radius: 12px;
  margin-bottom: 8px;
  transition: all 0.2s ease;
  font-weight: 500;

  &:hover {
    background-color: #475569;
    color: white;
    transform: translateX(4px);
  }

  &.active {
    background: linear-gradient(90deg, #3b82f6 0%, #1d4ed8 100%);
    color: white;
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
  }
`;

const NavText = styled.span`
  font-size: 16px;
`;

const Sidebar = ({ isOpen, onToggle }) => {
  const menuItems = [
    {
      title: 'Simulation',
      path: '/',
      icon: Play,
      description: 'Run QKD simulations'
    },
    {
      title: 'Attack Analysis',
      path: '/attack-analysis',
      icon: Shield,
      description: 'Test security against attacks'
    },
    {
      title: 'Secure Messaging',
      path: '/secure-messaging',
      icon: MessageSquare,
      description: 'Quantum-secured messaging'
    },
    {
      title: 'Results',
      path: '/results',
      icon: BarChart3,
      description: 'View simulation results'
    },
  ];

  return (
    <>
      <MobileMenuButton onClick={onToggle}>
        <Menu size={20} />
      </MobileMenuButton>
      
      <MobileOverlay $isOpen={isOpen} onClick={onToggle} />
      
      <SidebarContainer $isOpen={isOpen}>
        <Logo>
          <LogoTitle>
            <Zap size={28} />
            QKD Simulator
          </LogoTitle>
        </Logo>
        
        <Nav>
          {menuItems.map((item) => (
            <NavItem key={item.path} to={item.path} end onClick={() => window.innerWidth <= 768 && onToggle()}>
              <item.icon size={20} />
              <NavText>{item.title}</NavText>
            </NavItem>
          ))}
        </Nav>
      </SidebarContainer>
    </>
  );
};

export default Sidebar;
