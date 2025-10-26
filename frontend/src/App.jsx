import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import styled, { ThemeProvider, createGlobalStyle } from 'styled-components';

import Sidebar from './components/Sidebar';
import Header from './components/Header';
import { WebSocketProvider } from './contexts/WebSocketContext';
import { ToastProvider } from './contexts/ToastContext';

import Dashboard from './pages/Dashboard';
import Simulation from './pages/Simulation';
import AttackAnalysis from './pages/AttackAnalysis';
import Results from './pages/Results';
import AdvancedFeatures from './pages/AdvancedFeatures';
import SecureMessaging from './pages/SecureMessaging';

const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
      'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
      sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    background-color: #f8fafc;
  }

  @media (max-width: 768px) {
    body {
      font-size: 14px;
    }
  }
`;

const theme = {
  colors: {
    primary: '#3b82f6',
    secondary: '#64748b',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    background: '#f8fafc',
    surface: '#ffffff',
    text: '#1e293b',
    textSecondary: '#64748b',
    border: '#e2e8f0',
  },
  breakpoints: {
    mobile: '768px',
    tablet: '1024px',
    desktop: '1280px',
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    xxl: '48px',
  },
};

const AppContainer = styled.div`
  display: flex;
  height: 100vh;
  background-color: ${props => props.theme.colors.background};

  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    flex-direction: column;
  }
`;

const MainContent = styled.main`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-width: 0;

  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    height: calc(100vh - 60px);
  }
`;

const ContentArea = styled.div`
  flex: 1;
  padding: ${props => props.theme.spacing.lg};
  overflow-y: auto;
  min-height: 0;
  width: 100%;

  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    padding: ${props => props.theme.spacing.md};
  }
`;

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
    },
  },
});

function AppContent() {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const getPageTitle = (pathname) => {
    switch (pathname) {
      case '/':
        return 'Dashboard';
      case '/simulation':
        return 'Simulation';
      case '/attack-analysis':
        return 'Attack Analysis';
      case '/results':
        return 'Results';
      case '/advanced-features':
        return 'Advanced Features';
      case '/secure-messaging':
        return 'Secure Messaging';
      default:
        return 'Dashboard';
    }
  };

  return (
    <AppContainer>
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      <MainContent>
        <Header currentPage={getPageTitle(location.pathname)} />
        <ContentArea>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/simulation" element={<Simulation />} />
            <Route path="/attack-analysis" element={<AttackAnalysis />} />
            <Route path="/results" element={<Results />} />
            <Route path="/advanced-features" element={<AdvancedFeatures />} />
            <Route path="/secure-messaging" element={<SecureMessaging />} />
          </Routes>
        </ContentArea>
      </MainContent>
    </AppContainer>
  );
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <WebSocketProvider>
            <Router>
              <AppContent />
            </Router>
          </WebSocketProvider>
        </ToastProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
