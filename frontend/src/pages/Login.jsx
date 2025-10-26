import React from 'react';
import styled from 'styled-components';
import GoogleSignIn from '../components/GoogleSignIn';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';

const LoginContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 1rem;
`;

const LoginCard = styled.div`
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  padding: 3rem;
  max-width: 500px;
  width: 100%;
`;

const Logo = styled.div`
  text-align: center;
  margin-bottom: 2rem;
`;

const LogoTitle = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 0.5rem;
`;

const LogoSubtitle = styled.p`
  color: #64748b;
  font-size: 1rem;
`;

const Features = styled.div`
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid #e2e8f0;
`;

const FeatureTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 1rem;
  text-align: center;
`;

const FeatureList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const FeatureItem = styled.li`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0;
  color: #64748b;
  font-size: 0.875rem;

  &::before {
    content: '✓';
    color: #10b981;
    font-weight: bold;
    font-size: 1rem;
  }
`;

const Login = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <LoginContainer>
        <LoginCard>
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <div style={{ 
              width: '40px', 
              height: '40px', 
              border: '4px solid #e2e8f0', 
              borderTop: '4px solid #3b82f6', 
              borderRadius: '50%', 
              animation: 'spin 1s linear infinite',
              margin: '0 auto 1rem'
            }} />
            <p>Loading...</p>
          </div>
        </LoginCard>
      </LoginContainer>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <LoginContainer>
      <LoginCard>
        <Logo>
          <LogoTitle>QKD Simulator</LogoTitle>
          <LogoSubtitle>Quantum Key Distribution Simulation Platform</LogoSubtitle>
        </Logo>

        <GoogleSignIn />

        <Features>
          <FeatureTitle>What you can do:</FeatureTitle>
          <FeatureList>
            <FeatureItem>Run BB84 protocol simulations</FeatureItem>
            <FeatureItem>Analyze quantum attack scenarios</FeatureItem>
            <FeatureItem>Test secure messaging with quantum keys</FeatureItem>
            <FeatureItem>Explore advanced QKD features</FeatureItem>
            <FeatureItem>View real-time simulation results</FeatureItem>
          </FeatureList>
        </Features>
      </LoginCard>
    </LoginContainer>
  );
};

export default Login;
