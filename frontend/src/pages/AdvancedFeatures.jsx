import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { 
  Cpu, 
  Lock, 
  Database, 
  Key, 
  Zap, 
  BarChart3, 
  Play, 
  CheckCircle, 
  AlertTriangle,
  TrendingUp,
  Shield,
  Settings
} from 'lucide-react';
import qkdApi from '../api/qkdApi';

const AdvancedFeaturesContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  min-height: 100%;
  width: 100%;
`;

const FeaturesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 24px;
  width: 100%;
`;

const FeatureCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  }
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

const FeatureDescription = styled.p`
  color: #64748b;
  font-size: 14px;
  line-height: 1.5;
  margin-bottom: 20px;
`;

const FeatureControls = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const ControlGroup = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const ControlLabel = styled.label`
  font-weight: 500;
  color: #374151;
  font-size: 14px;
`;

const ControlSelect = styled.select`
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  background: white;
  min-width: 120px;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const ControlInput = styled.input`
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  width: 100px;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const Button = styled.button`
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
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

  &:hover:not(:disabled) {
    box-shadow: 0 8px 25px rgba(16, 185, 129, 0.3);
  }
`;

const ResultsSection = styled.div`
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
  margin-top: 24px;
`;

const ResultsTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 20px 0;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const ResultsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
`;

const ResultItem = styled.div`
  background: #f8fafc;
  padding: 16px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
`;

const ResultLabel = styled.div`
  font-size: 12px;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
`;

const ResultValue = styled.div`
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
`;

const StatusIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  background: ${props => {
    switch (props.$status) {
      case 'running': return '#dbeafe';
      case 'completed': return '#dcfce7';
      case 'failed': return '#fee2e2';
      default: return '#f1f5f9';
    }
  }};
  color: ${props => {
    switch (props.$status) {
      case 'running': return '#1e40af';
      case 'completed': return '#166534';
      case 'failed': return '#dc2626';
      default: return '#64748b';
    }
  }};
`;

const AdvancedFeatures = () => {
  const [features, setFeatures] = useState({
    reconciliation: {
      enabled: true,
      method: 'cascade',
      status: 'idle'
    },
    privacyAmplification: {
      enabled: true,
      method: 'toeplitz',
      status: 'idle'
    },
    decoyStates: {
      enabled: false,
      signalIntensity: 0.5,
      decoyIntensity: 0.1,
      vacuumIntensity: 0.0,
      status: 'idle'
    },
    aesDemo: {
      enabled: false,
      encryptionMode: 'GCM',
      keyLength: 256,
      status: 'idle'
    }
  });

  const [results, setResults] = useState({
    reconciliation: null,
    privacyAmplification: null,
    decoyStates: null,
    aesDemo: null
  });

  const [simulationId, setSimulationId] = useState(null);

  const handleFeatureChange = (feature, key, value) => {
    setFeatures(prev => ({
      ...prev,
      [feature]: {
        ...prev[feature],
        [key]: value
      }
    }));
  };

  const runReconciliation = async () => {
    if (!simulationId) {
      alert('Please run a simulation first to get a simulation ID');
      return;
    }

    try {
      setFeatures(prev => ({
        ...prev,
        reconciliation: { ...prev.reconciliation, status: 'running' }
      }));

      const result = await qkdApi.runAdvancedReconciliation(
        simulationId, 
        features.reconciliation.method
      );

      setResults(prev => ({
        ...prev,
        reconciliation: result
      }));

      setFeatures(prev => ({
        ...prev,
        reconciliation: { ...prev.reconciliation, status: 'completed' }
      }));
    } catch (error) {
      console.error('Reconciliation failed:', error);
      setFeatures(prev => ({
        ...prev,
        reconciliation: { ...prev.reconciliation, status: 'failed' }
      }));
    }
  };

  const runPrivacyAmplification = async () => {
    if (!simulationId) {
      alert('Please run a simulation first to get a simulation ID');
      return;
    }

    try {
      setFeatures(prev => ({
        ...prev,
        privacyAmplification: { ...prev.privacyAmplification, status: 'running' }
      }));

      const result = await qkdApi.runAdvancedPrivacyAmplification(
        simulationId, 
        features.privacyAmplification.method
      );

      setResults(prev => ({
        ...prev,
        privacyAmplification: result
      }));

      setFeatures(prev => ({
        ...prev,
        privacyAmplification: { ...prev.privacyAmplification, status: 'completed' }
      }));
    } catch (error) {
      console.error('Privacy amplification failed:', error);
      setFeatures(prev => ({
        ...prev,
        privacyAmplification: { ...prev.privacyAmplification, status: 'failed' }
      }));
    }
  };

  const runDecoyStates = async () => {
    if (!simulationId) {
      alert('Please run a simulation first to get a simulation ID');
      return;
    }

    try {
      setFeatures(prev => ({
        ...prev,
        decoyStates: { ...prev.decoyStates, status: 'running' }
      }));

      const decoyParameters = {
        signal_intensity: features.decoyStates.signalIntensity,
        decoy_intensity: features.decoyStates.decoyIntensity,
        vacuum_intensity: features.decoyStates.vacuumIntensity
      };

      const result = await qkdApi.runDecoyStateSimulation(
        simulationId, 
        decoyParameters
      );

      setResults(prev => ({
        ...prev,
        decoyStates: result
      }));

      setFeatures(prev => ({
        ...prev,
        decoyStates: { ...prev.decoyStates, status: 'completed' }
      }));
    } catch (error) {
      console.error('Decoy states failed:', error);
      setFeatures(prev => ({
        ...prev,
        decoyStates: { ...prev.decoyStates, status: 'failed' }
      }));
    }
  };

  const runAesDemo = async () => {
    if (!simulationId) {
      alert('Please run a simulation first to get a simulation ID');
      return;
    }

    try {
      setFeatures(prev => ({
        ...prev,
        aesDemo: { ...prev.aesDemo, status: 'running' }
      }));

      const result = await qkdApi.createSecureCommunicationDemo(
        simulationId,
        features.aesDemo.encryptionMode,
        features.aesDemo.keyLength
      );

      setResults(prev => ({
        ...prev,
        aesDemo: result
      }));

      setFeatures(prev => ({
        ...prev,
        aesDemo: { ...prev.aesDemo, status: 'completed' }
      }));
    } catch (error) {
      console.error('AES demo failed:', error);
      setFeatures(prev => ({
        ...prev,
        aesDemo: { ...prev.aesDemo, status: 'failed' }
      }));
    }
  };

  const runAllFeatures = async () => {
    if (features.reconciliation.enabled) {
      await runReconciliation();
    }
    if (features.privacyAmplification.enabled) {
      await runPrivacyAmplification();
    }
    if (features.decoyStates.enabled) {
      await runDecoyStates();
    }
    if (features.aesDemo.enabled) {
      await runAesDemo();
    }
  };

  useEffect(() => {
    const storedId = localStorage.getItem('lastSimulationId');
    if (storedId) {
      setSimulationId(storedId);
    }
  }, []);

  return (
    <AdvancedFeaturesContainer>
      <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#1e293b', margin: '0 0 24px 0' }}>
        Advanced QKD Features
      </h1>
      
      <p style={{ color: '#64748b', fontSize: '16px', lineHeight: '1.6', marginBottom: '32px' }}>
        Explore and test the advanced features of the QKD Simulator including reconciliation algorithms, 
        privacy amplification, decoy states, and AES integration.
      </p>

      <FeaturesGrid>
        <FeatureCard>
          <CardTitle>
            <Cpu size={20} />
            Advanced Reconciliation
          </CardTitle>
          <FeatureDescription>
            Test advanced error correction algorithms including Cascade protocol, LDPC codes, and hybrid methods.
          </FeatureDescription>
          
          <FeatureControls>
            <ControlGroup>
              <ControlLabel>Enable:</ControlLabel>
              <input
                type="checkbox"
                checked={features.reconciliation.enabled}
                onChange={(e) => handleFeatureChange('reconciliation', 'enabled', e.target.checked)}
              />
            </ControlGroup>
            
            {features.reconciliation.enabled && (
              <>
                <ControlGroup>
                  <ControlLabel>Method:</ControlLabel>
                  <ControlSelect
                    value={features.reconciliation.method}
                    onChange={(e) => handleFeatureChange('reconciliation', 'method', e.target.value)}
                  >
                    <option value="cascade">Cascade Protocol</option>
                    <option value="ldpc">LDPC Codes</option>
                    <option value="hybrid">Hybrid Method</option>
                  </ControlSelect>
                </ControlGroup>
                
                <Button onClick={runReconciliation} disabled={features.reconciliation.status === 'running'}>
                  <Play size={16} />
                  Run Reconciliation
                </Button>
                
                                 <StatusIndicator $status={features.reconciliation.status}>
                  {features.reconciliation.status === 'running' && <Zap size={16} />}
                  {features.reconciliation.status === 'completed' && <CheckCircle size={16} />}
                  {features.reconciliation.status === 'failed' && <AlertTriangle size={16} />}
                  {features.reconciliation.status === 'running' && 'Running'}
                  {features.reconciliation.status === 'completed' && 'Completed'}
                  {features.reconciliation.status === 'failed' && 'Failed'}
                  {features.reconciliation.status === 'idle' && 'Ready'}
                </StatusIndicator>
              </>
            )}
          </FeatureControls>
        </FeatureCard>

        <FeatureCard>
          <CardTitle>
            <Lock size={20} />
            Privacy Amplification
          </CardTitle>
          <FeatureDescription>
            Test information-theoretic security through advanced hashing techniques including Toeplitz and universal hashing.
          </FeatureDescription>
          
          <FeatureControls>
            <ControlGroup>
              <ControlLabel>Enable:</ControlLabel>
              <input
                type="checkbox"
                checked={features.privacyAmplification.enabled}
                onChange={(e) => handleFeatureChange('privacyAmplification', 'enabled', e.target.checked)}
              />
            </ControlGroup>
            
            {features.privacyAmplification.enabled && (
              <>
                <ControlGroup>
                  <ControlLabel>Method:</ControlLabel>
                  <ControlSelect
                    value={features.privacyAmplification.method}
                    onChange={(e) => handleFeatureChange('privacyAmplification', 'method', e.target.value)}
                  >
                    <option value="toeplitz">Toeplitz Hashing</option>
                    <option value="universal">Universal Hashing</option>
                    <option value="hybrid">Hybrid Method</option>
                  </ControlSelect>
                </ControlGroup>
                
                <Button onClick={runPrivacyAmplification} disabled={features.privacyAmplification.status === 'running'}>
                  <Play size={16} />
                  Run Privacy Amplification
                </Button>
                
                                 <StatusIndicator $status={features.privacyAmplification.status}>
                  {features.privacyAmplification.status === 'running' && <Zap size={16} />}
                  {features.privacyAmplification.status === 'completed' && <CheckCircle size={16} />}
                  {features.privacyAmplification.status === 'failed' && <AlertTriangle size={16} />}
                  {features.privacyAmplification.status === 'running' && 'Running'}
                  {features.privacyAmplification.status === 'completed' && 'Completed'}
                  {features.privacyAmplification.status === 'failed' && 'Failed'}
                  {features.privacyAmplification.status === 'idle' && 'Ready'}
                </StatusIndicator>
              </>
            )}
          </FeatureControls>
        </FeatureCard>

        <FeatureCard>
          <CardTitle>
            <Database size={20} />
            Decoy States
          </CardTitle>
          <FeatureDescription>
            Test decoy-state protocols to mitigate Photon-Number Splitting attacks and improve security.
          </FeatureDescription>
          
          <FeatureControls>
            <ControlGroup>
              <ControlLabel>Enable:</ControlLabel>
              <input
                type="checkbox"
                checked={features.decoyStates.enabled}
                onChange={(e) => handleFeatureChange('decoyStates', 'enabled', e.target.checked)}
              />
            </ControlGroup>
            
            {features.decoyStates.enabled && (
              <>
                <ControlGroup>
                  <ControlLabel>Signal Intensity:</ControlLabel>
                  <ControlInput
                    type="number"
                    value={features.decoyStates.signalIntensity}
                    onChange={(e) => handleFeatureChange('decoyStates', 'signalIntensity', parseFloat(e.target.value))}
                    min="0.1"
                    max="1.0"
                    step="0.1"
                  />
                </ControlGroup>
                
                <ControlGroup>
                  <ControlLabel>Decoy Intensity:</ControlLabel>
                  <ControlInput
                    type="number"
                    value={features.decoyStates.decoyIntensity}
                    onChange={(e) => handleFeatureChange('decoyStates', 'decoyIntensity', parseFloat(e.target.value))}
                    min="0.0"
                    max="0.5"
                    step="0.01"
                  />
                </ControlGroup>
                
                <ControlGroup>
                  <ControlLabel>Vacuum Intensity:</ControlLabel>
                  <ControlInput
                    type="number"
                    value={features.decoyStates.vacuumIntensity}
                    onChange={(e) => handleFeatureChange('decoyStates', 'vacuumIntensity', parseFloat(e.target.value))}
                    min="0.0"
                    max="0.1"
                    step="0.01"
                  />
                </ControlGroup>
                
                <Button onClick={runDecoyStates} disabled={features.decoyStates.status === 'running'}>
                  <Play size={16} />
                  Run Decoy States
                </Button>
                
                                 <StatusIndicator $status={features.decoyStates.status}>
                  {features.decoyStates.status === 'running' && <Zap size={16} />}
                  {features.decoyStates.status === 'completed' && <CheckCircle size={16} />}
                  {features.decoyStates.status === 'failed' && <AlertTriangle size={16} />}
                  {features.decoyStates.status === 'running' && 'Running'}
                  {features.decoyStates.status === 'completed' && 'Completed'}
                  {features.decoyStates.status === 'failed' && 'Failed'}
                  {features.decoyStates.status === 'idle' && 'Ready'}
                </StatusIndicator>
              </>
            )}
          </FeatureControls>
        </FeatureCard>

        <FeatureCard>
          <CardTitle>
            <Key size={20} />
            AES Integration Demo
          </CardTitle>
          <FeatureDescription>
            Test secure communication using QKD-generated keys with AES encryption in various modes.
          </FeatureDescription>
          
          <FeatureControls>
            <ControlGroup>
              <ControlLabel>Enable:</ControlLabel>
              <input
                type="checkbox"
                checked={features.aesDemo.enabled}
                onChange={(e) => handleFeatureChange('aesDemo', 'enabled', e.target.checked)}
              />
            </ControlGroup>
            
            {features.aesDemo.enabled && (
              <>
                <ControlGroup>
                  <ControlLabel>Encryption Mode:</ControlLabel>
                  <ControlSelect
                    value={features.aesDemo.encryptionMode}
                    onChange={(e) => handleFeatureChange('aesDemo', 'encryptionMode', e.target.value)}
                  >
                    <option value="GCM">GCM (Authenticated)</option>
                    <option value="CBC">CBC</option>
                    <option value="CTR">CTR</option>
                  </ControlSelect>
                </ControlGroup>
                
                <ControlGroup>
                  <ControlLabel>Key Length:</ControlLabel>
                  <ControlSelect
                    value={features.aesDemo.keyLength}
                    onChange={(e) => handleFeatureChange('aesDemo', 'keyLength', parseInt(e.target.value))}
                  >
                    <option value={128}>128 bits</option>
                    <option value={192}>192 bits</option>
                    <option value={256}>256 bits</option>
                  </ControlSelect>
                </ControlGroup>
                
                <Button onClick={runAesDemo} disabled={features.aesDemo.status === 'running'}>
                  <Play size={16} />
                  Run AES Demo
                </Button>
                
                                 <StatusIndicator $status={features.aesDemo.status}>
                  {features.aesDemo.status === 'running' && <Zap size={16} />}
                  {features.aesDemo.status === 'completed' && <CheckCircle size={16} />}
                  {features.aesDemo.status === 'failed' && <AlertTriangle size={16} />}
                  {features.aesDemo.status === 'running' && 'Running'}
                  {features.aesDemo.status === 'completed' && 'Completed'}
                  {features.aesDemo.status === 'failed' && 'Failed'}
                  {features.aesDemo.status === 'idle' && 'Ready'}
                </StatusIndicator>
              </>
            )}
          </FeatureControls>
        </FeatureCard>
      </FeaturesGrid>

      <div style={{ textAlign: 'center', marginTop: '24px' }}>
        <SuccessButton onClick={runAllFeatures}>
          <Zap size={18} />
          Run All Enabled Features
        </SuccessButton>
      </div>

      {(results.reconciliation || results.privacyAmplification || results.decoyStates || results.aesDemo) && (
        <ResultsSection>
          <ResultsTitle>
            <BarChart3 size={20} />
            Feature Results
          </ResultsTitle>
          
          <ResultsGrid>
            {results.reconciliation && (
              <ResultItem>
                <ResultLabel>Reconciliation</ResultLabel>
                <ResultValue>{results.reconciliation.reconciliation_method}</ResultValue>
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                  Success Rate: {results.reconciliation.reconciliation_metadata?.success_rate?.toFixed(3) || 'N/A'}
                </div>
              </ResultItem>
            )}
            
            {results.privacyAmplification && (
              <ResultItem>
                <ResultLabel>Privacy Amplification</ResultLabel>
                <ResultValue>{results.privacyAmplification.privacy_amplification_method}</ResultValue>
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                  Compression: {results.privacyAmplification.compression_ratio?.toFixed(3) || 'N/A'}
                </div>
              </ResultItem>
            )}
            
            {results.decoyStates && (
              <ResultItem>
                <ResultLabel>Decoy States</ResultLabel>
                <ResultValue>Active</ResultValue>
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                  Security: {results.decoyStates.security_improvement?.toFixed(3) || 'N/A'}
                </div>
              </ResultItem>
            )}
            
            {results.aesDemo && (
              <ResultItem>
                <ResultLabel>AES Demo</ResultLabel>
                <ResultValue>{results.aesDemo.encryption_mode}</ResultValue>
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                  Key Length: {results.aesDemo.aes_key_length} bits
                </div>
              </ResultItem>
            )}
          </ResultsGrid>
        </ResultsSection>
      )}
    </AdvancedFeaturesContainer>
  );
};

export default AdvancedFeatures;
