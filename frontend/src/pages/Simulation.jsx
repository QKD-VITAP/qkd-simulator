import React, { useState } from 'react';
import styled from 'styled-components';
import { Play, Settings, Shield, Zap, AlertTriangle, CheckCircle, Clock, Lock, Key, Database, Cpu, Brain, ShieldCheck } from 'lucide-react';
import qkdApi from '../api/qkdApi';

const SimulationContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  min-height: 100%;
  width: 100%;
`;

const SimulationGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  width: 100%;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const AdvancedFeaturesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
  width: 100%;
`;

const ParameterCard = styled.div`
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
  margin: 0 0 24px 0;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const ParameterGroup = styled.div`
  margin-bottom: 20px;
`;

const ParameterLabel = styled.label`
  display: block;
  font-weight: 500;
  color: #374151;
  margin-bottom: 8px;
  font-size: 14px;
`;

const ParameterInput = styled.input`
  width: 100%;
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

const ParameterSelect = styled.select`
  width: 100%;
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

const CheckboxGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
`;

const Checkbox = styled.input`
  width: 18px;
  height: 18px;
  accent-color: #3b82f6;
`;

const SmallButton = styled.button`
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 6px;
  background: #f1f5f9;
  color: #475569;

  &:hover {
    background: #e2e8f0;
  }
`;

const AttackSection = styled.div`
  background: #fef3c7;
  border: 1px solid #f59e0b;
  border-radius: 12px;
  padding: 20px;
  margin-top: 20px;
`;

const AttackTitle = styled.h4`
  color: #92400e;
  margin: 0 0 16px 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const AttackParameter = styled.div`
  margin-bottom: 16px;
`;

const AdvancedSection = styled.div`
  background: #f0f9ff;
  border: 1px solid #0ea5e9;
  border-radius: 12px;
  padding: 20px;
  margin-top: 20px;
`;

const AdvancedTitle = styled.h4`
  color: #0c4a6e;
  margin: 0 0 16px 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const SimulationControls = styled.div`
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
`;

const ControlButtons = styled.div`
  display: flex;
  gap: 16px;
  margin-top: 24px;
  flex-wrap: wrap;
`;

const Button = styled.button`
  padding: 14px 28px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const PrimaryButton = styled(Button)`
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(59, 130, 246, 0.3);
  }
`;

const SecondaryButton = styled(Button)`
  background: #f1f5f9;
  color: #475569;

  &:hover:not(:disabled) {
    background: #e2e8f0;
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

const StatusCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
`;

const StatusHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
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

const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background: #e2e8f0;
  border-radius: 4px;
  overflow: hidden;
  margin: 16px 0;
`;

const ProgressFill = styled.div`
  height: 100%;
  background: linear-gradient(90deg, #3b82f6 0%, #1d4ed8 100%);
  width: ${props => props.$progress}%;
  transition: width 0.3s ease;
`;

const Header = styled.div`
  background: #f8fafc;
  padding: 24px;
  border-radius: 16px;
  margin-bottom: 24px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
`;

const HeaderTitle = styled.h1`
  font-size: 28px;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 8px 0;
`;

const HeaderSubtitle = styled.p`
  font-size: 16px;
  color: #475569;
  margin: 0;
`;

const InfoBox = styled.div`
  background: #f0f9eb;
  border: 1px solid #a7f3d0;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 24px;
  font-size: 14px;
  color: #065f46;
  line-height: 1.6;
  border-left: 4px solid #4ade80;
`;



const DetailedResultsCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
  margin-top: 24px;
`;

const ResultsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-top: 20px;
`;

const ResultItem = styled.div`
  background: ${props => props.$type === 'success' ? '#dcfce7' : props.$type === 'warning' ? '#fef3c7' : '#dbeafe'};
  border: 1px solid ${props => props.$type === 'success' ? '#a7f3d0' : props.$type === 'warning' ? '#fcd34d' : '#93c5fd'};
  border-radius: 12px;
  padding: 16px;
  text-align: center;
`;

const ResultValue = styled.div`
  font-size: 24px;
  font-weight: 700;
  color: ${props => props.$type === 'success' ? '#166534' : props.$type === 'warning' ? '#92400e' : '#1e40af'};
  margin-bottom: 8px;
`;

const ResultLabel = styled.div`
  font-size: 14px;
  color: #64748b;
  font-weight: 500;
`;



const Simulation = () => {
  const [parameters, setParameters] = useState({
    num_qubits: 1000,
    channel_length: 10.0,
    channel_attenuation: 0.1,
    channel_depolarization: 0.01,
    photon_source_efficiency: 0.8,
    detector_efficiency: 0.8
  });

  const [attackConfig, setAttackConfig] = useState({
    enabled: false,
    type: 'intercept_resend',
    parameters: {
      strength: 0.5
    }
  });

  const [advancedFeatures, setAdvancedFeatures] = useState({
    use_advanced_reconciliation: true,
    reconciliation_method: 'cascade',
    use_advanced_privacy_amplification: true,
    privacy_amplification_method: 'toeplitz',
    use_decoy_states: false,
    decoy_state_parameters: {
      signal_intensity: 0.5,
      decoy_intensity: 0.1,
      vacuum_intensity: 0.0
    }
  });

  const [aesDemo, setAesDemo] = useState({
    enabled: false,
    encryption_mode: 'GCM',
    key_length: 256,
    messages: []
  });

  const [simulationStatus, setSimulationStatus] = useState({
    status: 'idle',
    progress: 0,
    message: 'Ready to run simulation'
  });

  const [simulationResults, setSimulationResults] = useState({
    qber: 0,
    keyLength: 0,
    attackDetected: false
  });
  const [lastSimulationId, setLastSimulationId] = useState(null);
  
  const [detailedResults, setDetailedResults] = useState(null);

  const handleParameterChange = (key, value) => {
    setParameters(prev => ({
      ...prev,
      [key]: parseFloat(value) || value
    }));
  };

  const handleAttackChange = (key, value) => {
    setAttackConfig(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleAdvancedFeatureChange = (key, value) => {
    setAdvancedFeatures(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleDecoyStateChange = (key, value) => {
    setAdvancedFeatures(prev => ({
      ...prev,
      decoy_state_parameters: {
        ...prev.decoy_state_parameters,
        [key]: parseFloat(value) || value
      }
    }));
  };

  const handleAesDemoChange = (key, value) => {
    setAesDemo(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const addMessage = () => {
    setAesDemo(prev => ({
      ...prev,
      messages: [...prev.messages, { sender: 'Alice', receiver: 'Bob', content: '' }]
    }));
  };

  const updateMessage = (index, field, value) => {
    setAesDemo(prev => ({
      ...prev,
      messages: prev.messages.map((msg, i) => 
        i === index ? { ...msg, [field]: value } : msg
      )
    }));
  };

  const removeMessage = (index) => {
    setAesDemo(prev => ({
      ...prev,
      messages: prev.messages.filter((_, i) => i !== index)
    }));
  };

  const updateDetailedResults = (results) => {
    setDetailedResults(results);
  };



  const runSimulation = async () => {
    try {
      setSimulationStatus({
        status: 'running',
        progress: 0,
        message: 'Starting simulation...'
      });

      const simulationRequest = {
        ...parameters,
        attack_type: attackConfig.enabled ? attackConfig.type : 'no_attack',
        attack_parameters: attackConfig.enabled ? attackConfig.parameters : {},
      };
      const response = await qkdApi.runSimulationAsync(simulationRequest);
      
      if (response.simulation_id) {
        setLastSimulationId(response.simulation_id);
        const pollStatus = async () => {
          try {
            const status = await qkdApi.getSimulationStatus(response.simulation_id);
            
            if (status.status === 'completed') {
              let qber = 0;
              let keyLength = 0;
              let attackDetected = false;
              if (status.results && status.results.bb84_result) {
                qber = status.results.bb84_result.qber || 0;
                keyLength = status.results.bb84_result.final_key_length || 0;
                attackDetected = status.results.attack_detection?.attack_detected || false;
              } else if (response.results_summary) {
                qber = response.results_summary.qber || 0;
                keyLength = response.results_summary.final_key_length || 0;
                attackDetected = response.results_summary.attack_detected || false;
              }
              setSimulationResults({
                qber: qber,
                keyLength: keyLength,
                attackDetected: attackDetected
              });
              
              updateDetailedResults({
                ...status.results,
                parameters: parameters,
                attackConfig: attackConfig,
                advancedFeatures: advancedFeatures
              });
              
              setSimulationStatus({
                status: 'completed',
                progress: 100,
                message: `Simulation completed! QBER: ${(qber * 100).toFixed(2)}%, Key bits: ${keyLength}`
              });
            } else if (status.status === 'failed') {
              setSimulationStatus({
                status: 'failed',
                progress: 0,
                message: `Simulation failed: ${status.error || 'Unknown error'}`
              });
            } else if (status.status === 'running') {
              const progress = status.progress || 0;
              setSimulationStatus({
                status: 'running',
                progress: progress,
                message: `Processing... ${progress}%`
              });
              
              if (progress < 100) {
                setTimeout(pollStatus, 2000);
              }
            }
          } catch (err) {
            setSimulationStatus({
              status: 'failed',
              progress: 0,
              message: 'Failed to get simulation status'
            });
          }
        };

        setTimeout(pollStatus, 1000);
      } else {
        setSimulationStatus({
          status: 'failed',
          progress: 0,
          message: 'Failed to start async simulation'
        });
      }
    } catch (err) {
      setSimulationStatus({
        status: 'failed',
        progress: 0,
        message: `Failed to start simulation: ${err.message}`
      });
    }
  };

  const runAesDemo = async () => {
    if (!aesDemo.messages.length) {
      alert('Please add at least one message to test AES encryption');
      return;
    }
    if (!lastSimulationId) {
      alert('Run a simulation first to generate keys (simulation_id missing).');
      return;
    }

    try {
      await qkdApi.createSecureCommunicationDemo(
        lastSimulationId,
        aesDemo.encryption_mode,
        aesDemo.key_length
      );

      const commLog = await qkdApi.runSecureCommunicationDemo(aesDemo.messages);
      const stats = await qkdApi.getSecureCommunicationStats();

      alert('AES demo completed successfully!');
    } catch (err) {
      alert('AES demo failed');
    }
  };

  const resetSimulation = () => {
    setSimulationStatus({
      status: 'idle',
      progress: 0,
      message: 'Ready to run simulation'
    });
    setSimulationResults({
      qber: 0,
      keyLength: 0,
      attackDetected: false
    });
  };

  return (
    <SimulationContainer>
      <Header>
        <HeaderTitle>Quantum Key Distribution Simulator</HeaderTitle>
        <HeaderSubtitle>Run BB84 protocol simulations with advanced security features</HeaderSubtitle>
      </Header>














      <SimulationGrid>
        <ParameterCard>
          <CardTitle>
            <Settings size={20} />
            Simulation Parameters
          </CardTitle>
          
          <ParameterGroup>
            <ParameterLabel>Number of Qubits</ParameterLabel>
            <ParameterInput
              type="number"
              value={parameters.num_qubits}
              onChange={(e) => handleParameterChange('num_qubits', e.target.value)}
              min="100"
              max="10000"
              step="100"
            />
          </ParameterGroup>

          <ParameterGroup>
            <ParameterLabel>Channel Length (km)</ParameterLabel>
            <ParameterInput
              type="number"
              value={parameters.channel_length}
              onChange={(e) => handleParameterChange('channel_length', e.target.value)}
              min="0.1"
              max="100.0"
              step="0.1"
            />
          </ParameterGroup>

          <ParameterGroup>
            <ParameterLabel>Channel Attenuation (dB/km)</ParameterLabel>
            <ParameterInput
              type="number"
              value={parameters.channel_attenuation}
              onChange={(e) => handleParameterChange('channel_attenuation', e.target.value)}
              min="0.01"
              max="1.0"
              step="0.01"
            />
          </ParameterGroup>

          <ParameterGroup>
            <ParameterLabel>Channel Depolarization Rate</ParameterLabel>
            <ParameterInput
              type="number"
              value={parameters.channel_depolarization}
              onChange={(e) => handleParameterChange('channel_depolarization', e.target.value)}
              min="0.0"
              max="0.1"
              step="0.001"
            />
          </ParameterGroup>

          <ParameterGroup>
            <ParameterLabel>Photon Source Efficiency</ParameterLabel>
            <ParameterInput
              type="number"
              value={parameters.photon_source_efficiency}
              onChange={(e) => handleParameterChange('photon_source_efficiency', e.target.value)}
              min="0.1"
              max="1.0"
              step="0.1"
            />
          </ParameterGroup>

          <ParameterGroup>
            <ParameterLabel>Detector Efficiency</ParameterLabel>
            <ParameterInput
              type="number"
              value={parameters.detector_efficiency}
              onChange={(e) => handleParameterChange('detector_efficiency', e.target.value)}
              min="0.1"
              max="1.0"
              step="0.1"
            />
          </ParameterGroup>

          <ParameterGroup>
            <ParameterLabel>Wavelength (nm)</ParameterLabel>
            <ParameterSelect
              value={parameters.wavelength}
              onChange={(e) => handleParameterChange('wavelength', parseFloat(e.target.value))}
            >
              <option value={800}>800 nm (Free Space)</option>
              <option value={1310}>1310 nm (Fiber)</option>
              <option value={1550}>1550 nm (Fiber - Low Loss)</option>
            </ParameterSelect>
            <small style={{ color: '#64748b', fontSize: '12px' }}>
              Affects channel attenuation and dispersion
            </small>
          </ParameterGroup>

          <ParameterGroup>
            <ParameterLabel>Temperature (°C)</ParameterLabel>
            <ParameterInput
              type="number"
              value={parameters.temperature}
              onChange={(e) => handleParameterChange('temperature', parseFloat(e.target.value))}
              min="-40"
              max="80"
              step="1"
            />
            <small style={{ color: '#64748b', fontSize: '12px' }}>
              Affects fiber attenuation (±0.1% per °C)
            </small>
          </ParameterGroup>

          <ParameterGroup>
            <ParameterLabel>Detector Dark Count Rate (counts/s)</ParameterLabel>
            <ParameterInput
              type="number"
              value={parameters.detector_dark_count_rate}
              onChange={(e) => handleParameterChange('detector_dark_count_rate', parseFloat(e.target.value))}
              min="1"
              max="10000"
              step="10"
            />
            <small style={{ color: '#64748b', fontSize: '12px' }}>
              Background noise: 1-1000 counts/s typical
            </small>
          </ParameterGroup>

          <ParameterGroup>
            <ParameterLabel>Detector Dead Time (μs)</ParameterLabel>
            <ParameterInput
              type="number"
              value={parameters.detector_dead_time}
              onChange={(e) => handleParameterChange('detector_dead_time', parseFloat(e.target.value))}
              min="0.001"
              max="1.0"
              step="0.001"
            />
            <small style={{ color: '#64748b', fontSize: '12px' }}>
              Recovery time: 10ns - 1μs typical
            </small>
          </ParameterGroup>

          <ParameterGroup>
            <ParameterLabel>Clock Frequency (GHz)</ParameterLabel>
            <ParameterInput
              type="number"
              value={parameters.clock_frequency}
              onChange={(e) => handleParameterChange('clock_frequency', parseFloat(e.target.value))}
              min="0.1"
              max="10.0"
              step="0.1"
            />
            <small style={{ color: '#64748b', fontSize: '12px' }}>
              QKD clock rate: 0.1-10 GHz typical
            </small>
          </ParameterGroup>
        </ParameterCard>

        <ParameterCard>
          <CardTitle>
            <Shield size={20} />
            Attack Configuration
          </CardTitle>
          
          <ParameterGroup>
            <ParameterLabel>Enable Attack Simulation</ParameterLabel>
            <ParameterSelect
              value={attackConfig.enabled ? 'enabled' : 'disabled'}
              onChange={(e) => handleAttackChange('enabled', e.target.value === 'enabled')}
            >
              <option value="disabled">No Attack</option>
              <option value="enabled">Enable Attack</option>
            </ParameterSelect>
          </ParameterGroup>

          {attackConfig.enabled && (
            <>
              <ParameterGroup>
                <ParameterLabel>Attack Type</ParameterLabel>
                <ParameterSelect
                  value={attackConfig.type}
                  onChange={(e) => handleAttackChange('type', e.target.value)}
                >
                  <option value="intercept_resend">Intercept-Resend</option>
                  <option value="photon_number_splitting">Photon Number Splitting</option>
                  <option value="detector_blinding">Detector Blinding</option>
                </ParameterSelect>
              </ParameterGroup>

              <AttackSection>
                <AttackTitle>
                  <AlertTriangle size={16} />
                  Attack Parameters
                </AttackTitle>
                <AttackParameter>
                  <ParameterLabel>Attack Strength</ParameterLabel>
                  <ParameterInput
                    type="number"
                    value={attackConfig.parameters.strength || 0.5}
                    onChange={(e) => handleAttackChange('parameters', {
                      ...attackConfig.parameters,
                      strength: parseFloat(e.target.value)
                    })}
                    min="0.1"
                    max="1.0"
                    step="0.1"
                  />
                </AttackParameter>
              </AttackSection>
            </>
          )}
        </ParameterCard>
      </SimulationGrid>

      <AdvancedFeaturesGrid>
        <ParameterCard>
          <CardTitle>
            <Cpu size={20} />
            Advanced Reconciliation
          </CardTitle>
          
          <CheckboxGroup>
            <Checkbox
              type="checkbox"
              id="use_advanced_reconciliation"
              checked={advancedFeatures.use_advanced_reconciliation}
              onChange={(e) => handleAdvancedFeatureChange('use_advanced_reconciliation', e.target.checked)}
            />
            <ParameterLabel htmlFor="use_advanced_reconciliation">
              Enable Advanced Reconciliation
            </ParameterLabel>
          </CheckboxGroup>

          {advancedFeatures.use_advanced_reconciliation && (
            <ParameterGroup>
              <ParameterLabel>Reconciliation Method</ParameterLabel>
              <ParameterSelect
                value={advancedFeatures.reconciliation_method}
                onChange={(e) => handleAdvancedFeatureChange('reconciliation_method', e.target.value)}
              >
                <option value="cascade">Cascade Protocol</option>
                <option value="ldpc">LDPC Codes</option>
                <option value="hybrid">Hybrid Method</option>
              </ParameterSelect>
            </ParameterGroup>
          )}
        </ParameterCard>

        <ParameterCard>
          <CardTitle>
            <Lock size={20} />
            Privacy Amplification
          </CardTitle>
          
          <CheckboxGroup>
            <Checkbox
              type="checkbox"
              id="use_advanced_privacy_amplification"
              checked={advancedFeatures.use_advanced_privacy_amplification}
              onChange={(e) => handleAdvancedFeatureChange('use_advanced_privacy_amplification', e.target.checked)}
            />
            <ParameterLabel htmlFor="use_advanced_privacy_amplification">
              Enable Advanced Privacy Amplification
            </ParameterLabel>
          </CheckboxGroup>

          {advancedFeatures.use_advanced_privacy_amplification && (
            <ParameterGroup>
              <ParameterLabel>Privacy Amplification Method</ParameterLabel>
              <ParameterSelect
                value={advancedFeatures.privacy_amplification_method}
                onChange={(e) => handleAdvancedFeatureChange('privacy_amplification_method', e.target.value)}
              >
                <option value="toeplitz">Toeplitz Hashing</option>
                <option value="universal">Universal Hashing</option>
                <option value="hybrid">Hybrid Method</option>
              </ParameterSelect>
            </ParameterGroup>
          )}
        </ParameterCard>

        <ParameterCard>
          <CardTitle>
            <Database size={20} />
            Decoy States
          </CardTitle>
          
          <CheckboxGroup>
            <Checkbox
              type="checkbox"
              id="use_decoy_states"
              checked={advancedFeatures.use_decoy_states}
              onChange={(e) => handleAdvancedFeatureChange('use_decoy_states', e.target.checked)}
            />
            <ParameterLabel htmlFor="use_decoy_states">
              Enable Decoy States
            </ParameterLabel>
          </CheckboxGroup>

          {advancedFeatures.use_decoy_states && (
            <AdvancedSection>
              <AdvancedTitle>
                <Database size={16} />
                Decoy State Parameters
              </AdvancedTitle>
              
              <ParameterGroup>
                <ParameterLabel>Signal Intensity</ParameterLabel>
                <ParameterInput
                  type="number"
                  value={advancedFeatures.decoy_state_parameters.signal_intensity}
                  onChange={(e) => handleDecoyStateChange('signal_intensity', e.target.value)}
                  min="0.1"
                  max="1.0"
                  step="0.1"
                />
              </ParameterGroup>

              <ParameterGroup>
                <ParameterLabel>Decoy Intensity</ParameterLabel>
                <ParameterInput
                  type="number"
                  value={advancedFeatures.decoy_state_parameters.decoy_intensity}
                  onChange={(e) => handleDecoyStateChange('decoy_intensity', e.target.value)}
                  min="0.0"
                  max="0.5"
                  step="0.01"
                />
              </ParameterGroup>

              <ParameterGroup>
                <ParameterLabel>Vacuum Intensity</ParameterLabel>
                <ParameterInput
                  type="number"
                  value={advancedFeatures.decoy_state_parameters.vacuum_intensity}
                  onChange={(e) => handleDecoyStateChange('vacuum_intensity', e.target.value)}
                  min="0.0"
                  max="0.1"
                  step="0.01"
                />
              </ParameterGroup>
            </AdvancedSection>
          )}
        </ParameterCard>

        <ParameterCard>
          <CardTitle>
            <Key size={20} />
            AES Integration Demo
          </CardTitle>
          
          <CheckboxGroup>
            <Checkbox
              type="checkbox"
              id="enable_aes_demo"
              checked={aesDemo.enabled}
              onChange={(e) => handleAesDemoChange('enabled', e.target.checked)}
            />
            <ParameterLabel htmlFor="enable_aes_demo">
              Enable AES Demo
            </ParameterLabel>
          </CheckboxGroup>

          {aesDemo.enabled && (
            <AdvancedSection>
              <AdvancedTitle>
                <Key size={16} />
                AES Configuration
              </AdvancedTitle>
              
              <ParameterGroup>
                <ParameterLabel>Encryption Mode</ParameterLabel>
                <ParameterSelect
                  value={aesDemo.encryption_mode}
                  onChange={(e) => handleAesDemoChange('encryption_mode', e.target.value)}
                >
                  <option value="GCM">GCM (Authenticated)</option>
                  <option value="CBC">CBC</option>
                  <option value="CTR">CTR</option>
                </ParameterSelect>
              </ParameterGroup>

              <ParameterGroup>
                <ParameterLabel>Key Length (bits)</ParameterLabel>
                <ParameterSelect
                  value={aesDemo.key_length}
                  onChange={(e) => handleAesDemoChange('key_length', parseInt(e.target.value))}
                >
                  <option value={128}>128 bits</option>
                  <option value={192}>192 bits</option>
                  <option value={256}>256 bits</option>
                </ParameterSelect>
              </ParameterGroup>

              <ParameterGroup>
                <ParameterLabel>Test Messages</ParameterLabel>
                                 <SmallButton onClick={addMessage} style={{ marginBottom: '12px' }}>
                   + Add Message
                 </SmallButton>
                
                {aesDemo.messages.map((msg, index) => (
                  <div key={index} style={{ 
                    border: '1px solid #e2e8f0', 
                    borderRadius: '8px', 
                    padding: '12px', 
                    marginBottom: '12px',
                    background: '#f8fafc'
                  }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                      <ParameterInput
                        placeholder="Sender"
                        value={msg.sender}
                        onChange={(e) => updateMessage(index, 'sender', e.target.value)}
                      />
                      <ParameterInput
                        placeholder="Receiver"
                        value={msg.receiver}
                        onChange={(e) => updateMessage(index, 'receiver', e.target.value)}
                      />
                    </div>
                    <ParameterInput
                      placeholder="Message content"
                      value={msg.content}
                      onChange={(e) => updateMessage(index, 'content', e.target.value)}
                    />
                                         <SmallButton 
                       onClick={() => removeMessage(index)}
                       style={{ 
                         marginTop: '8px', 
                         background: '#ef4444', 
                         color: 'white',
                         padding: '4px 8px',
                         fontSize: '12px'
                       }}
                     >
                       Remove
                     </SmallButton>
                  </div>
                ))}
              </ParameterGroup>
            </AdvancedSection>
          )}
        </ParameterCard>
      </AdvancedFeaturesGrid>

      <SimulationControls>
        <CardTitle>
          <Play size={20} />
          Simulation Controls
        </CardTitle>
        
        
        <ControlButtons>
          <PrimaryButton
            onClick={runSimulation}
            disabled={simulationStatus.status === 'running'}
          >
            <Play size={18} />
            Run Simulation
          </PrimaryButton>
          
          {aesDemo.enabled && aesDemo.messages.length > 0 && (
            <SuccessButton
              onClick={runAesDemo}
              disabled={simulationStatus.status === 'running'}
            >
              <Key size={18} />
              Run AES Demo
            </SuccessButton>
          )}
          
          <SecondaryButton
            onClick={resetSimulation}
            disabled={simulationStatus.status === 'idle'}
          >
            <Settings size={18} />
            Reset
          </SecondaryButton>
        </ControlButtons>
      </SimulationControls>

      <StatusCard>
        <StatusHeader>
          <CardTitle>
            <Zap size={20} />
            Simulation Status
          </CardTitle>
          
                     <StatusIndicator $status={simulationStatus.status}>
            {simulationStatus.status === 'running' && <Clock size={16} />}
            {simulationStatus.status === 'completed' && <CheckCircle size={16} />}
            {simulationStatus.status === 'failed' && <AlertTriangle size={16} />}
            {simulationStatus.status === 'idle' && <Zap size={16} />}
            {simulationStatus.status === 'running' && 'Running'}
            {simulationStatus.status === 'completed' && 'Completed'}
            {simulationStatus.status === 'failed' && 'Failed'}
            {simulationStatus.status === 'idle' && 'Idle'}
          </StatusIndicator>
        </StatusHeader>
        
        <p style={{ margin: '0 0 16px 0', color: '#64748b' }}>
          {simulationStatus.message}
        </p>
        
        {simulationStatus.status === 'running' && (
          <ProgressBar>
                            <ProgressFill $progress={simulationStatus.progress} />
          </ProgressBar>
        )}
        
        {simulationStatus.status === 'completed' && (
          <>
            <div style={{ 
              background: '#dcfce7', 
              padding: '16px', 
              borderRadius: '8px',
              color: '#166534',
              marginBottom: '20px'
            }}>
              <strong>Simulation Results Summary:</strong>
              <div style={{ marginTop: '8px' }}>
                <div><strong>QBER:</strong> {(simulationResults.qber * 100).toFixed(2)}%</div>
                <div><strong>Final Key Length:</strong> {simulationResults.keyLength} bits</div>
                <div><strong>Attack Detected:</strong> {simulationResults.attackDetected ? 'Yes' : 'No'}</div>
                <div><strong>Success Rate:</strong> {parameters.num_qubits > 0 ? ((simulationResults.keyLength / parameters.num_qubits) * 100).toFixed(1) : 0}%</div>
              </div>
              
              
            </div>
          </>
        )}
      </StatusCard>

    </SimulationContainer>
  );
};

export default Simulation;
