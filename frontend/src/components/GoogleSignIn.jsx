import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { AUTH_CONFIG } from '../config/auth';

const GoogleSignInContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  max-width: 400px;
  margin: 0 auto;
`;

const Title = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 0.5rem;
`;

const Subtitle = styled.p`
  color: #64748b;
  text-align: center;
  margin-bottom: 1rem;
`;

const GoogleButton = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 0.75rem 1.5rem;
  background: #4285f4;
  color: white;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 500;
  min-width: 200px;

  &:hover {
    background: #3367d6;
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }

  svg {
    width: 20px;
    height: 20px;
  }
`;

const LoadingSpinner = styled.div`
  width: 20px;
  height: 20px;
  border: 2px solid #ffffff40;
  border-top: 2px solid #ffffff;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const GoogleSignIn = ({ onSuccess }) => {
  const { login, loading } = useAuth();
  const { showToast } = useToast();
  const googleButtonRef = useRef(null);

  useEffect(() => {
    // Load Google Identity Services
    const loadGoogleScript = () => {
      if (window.google && window.google.accounts) {
        initializeGoogleSignIn();
        return;
      }

      // Check if script is already loaded
      const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
      if (existingScript) {
        existingScript.onload = initializeGoogleSignIn;
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = initializeGoogleSignIn;
      script.onerror = () => {
        console.error('Failed to load Google Sign-In script');
      };
      document.head.appendChild(script);
    };

    const initializeGoogleSignIn = () => {
      if (window.google && window.google.accounts && googleButtonRef.current) {
        try {
          window.google.accounts.id.initialize({
            client_id: AUTH_CONFIG.GOOGLE_CLIENT_ID,
            callback: handleCredentialResponse,
            auto_select: false,
            cancel_on_tap_outside: true
          });

          window.google.accounts.id.renderButton(
            googleButtonRef.current,
            {
              theme: 'outline',
              size: 'large',
              width: 300,
              text: 'signin_with',
              shape: 'rectangular'
            }
          );
        } catch (error) {
          console.error('Error initializing Google Sign-In:', error);
        }
      }
    };

    loadGoogleScript();
  }, []);

  const handleCredentialResponse = async (response) => {
    try {
      console.log('Google credential response received');
      const result = await login(response.credential);
      
      if (result.success) {
        showToast('Successfully signed in!', 'success');
        if (onSuccess) {
          onSuccess(result.user);
        }
      } else {
        showToast(result.error || 'Sign in failed', 'error');
      }
    } catch (error) {
      console.error('Sign in error:', error);
      showToast('An error occurred during sign in', 'error');
    }
  };

  return (
    <GoogleSignInContainer>
      <Title>Welcome to QKD Simulator</Title>
      <Subtitle>
        Sign in with your Google account to access the quantum key distribution simulator
      </Subtitle>
      
      {loading ? (
        <GoogleButton>
          <LoadingSpinner />
          Signing in...
        </GoogleButton>
      ) : (
        <div ref={googleButtonRef} style={{ width: '100%' }} />
      )}
    </GoogleSignInContainer>
  );
};

export default GoogleSignIn;
