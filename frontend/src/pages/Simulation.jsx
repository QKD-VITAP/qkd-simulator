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
  background: linear-gradient(to bottom, #ffffff, #f8fafc);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(59, 130, 246, 0.05);
  border: 1px solid rgba(59, 130, 246, 0.1);
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 4px 16px rgba(59, 130, 246, 0.15), 0 0 0 1px rgba(59, 130, 246, 0.2);
    transform: translateY(-2px);
  }
`;

const CardTitle = styled.h3`
  font-size: 20px;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 24px 0;
  display: flex;
  align-items: center;
  gap: 12px;
  padding-bottom: 12px;
  border-bottom: 2px solid rgba(59, 130, 246, 0.1);
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
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  font-size: 14px;
  background: #ffffff;
  transition: all 0.2s ease;
  font-weight: 500;

  &:hover {
    border-color: #93c5fd;
  }

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
    background: #fefefe;
  }
`;

const ParameterSelect = styled.select`
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  font-size: 14px;
  background: #ffffff;
  transition: all 0.2s ease;
  font-weight: 500;
  cursor: pointer;

  &:hover {
    border-color: #93c5fd;
  }

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
    background: #fefefe;
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
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  position: relative;
  overflow: hidden;
  font-weight: 700;
  letter-spacing: 0.5px;

  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    border-radius: 50%;
    background: rgba(255,255,255,0.3);
    transform: translate(-50%, -50%);
    transition: width 0.6s, height 0.6s;
  }

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);

    &::before {
      width: 300px;
      height: 300px;
    }
  }

  &:active:not(:disabled) {
    transform: translateY(0px);
    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
  }
`;

const SecondaryButton = styled(Button)`
  background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
  color: #475569;
  font-weight: 600;

  &:hover:not(:disabled) {
    background: linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  }

  &:active:not(:disabled) {
    transform: translateY(0px);
  }
`;

const SuccessButton = styled(Button)`
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  font-weight: 700;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(16, 185, 129, 0.4);
    background: linear-gradient(135deg, #34d399 0%, #10b981 100%);
  }

  &:active:not(:disabled) {
    transform: translateY(0px);
    box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
  }
`;

const StatusCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.08);
    transform: translateY(-2px);
  }
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
  padding: 10px 20px;
  border-radius: 25px;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  background: ${props => {
    switch (props.$status) {
      case 'running': return 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)';
      case 'completed': return 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)';
      case 'failed': return 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)';
      default: return 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)';
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
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
    transition: left 0.5s;
  }

  &:hover::before {
    left: 100%;
  }
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 12px;
  background: linear-gradient(90deg, #e2e8f0 0%, #cbd5e1 100%);
  border-radius: 10px;
  overflow: hidden;
  margin: 16px 0;
  box-shadow: inset 0 2px 4px rgba(0,0,0,0.1);
  position: relative;
`;

const ProgressFill = styled.div`
  height: 100%;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  width: ${props => props.$progress}%;
  transition: width 0.3s ease;
  border-radius: 10px;
  position: relative;
  overflow: hidden;

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
    animation: progress-shine 1.5s infinite;
  }

  @keyframes progress-shine {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
`;

const InfoBox = styled.div`
  background: linear-gradient(135deg, #f0f9eb 0%, #dcfce7 100%);
  border: 1px solid #a7f3d0;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
  font-size: 14px;
  color: #065f46;
  line-height: 1.6;
  border-left: 5px solid #4ade80;
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.1);
  position: relative;
  overflow: hidden;

  &::before {
    content: '✨';
    position: absolute;
    top: 10px;
    right: 10px;
    font-size: 20px;
    opacity: 0.3;
  }

  animation: info-pulse 3s infinite;
  @keyframes info-pulse {
    0%, 100% { box-shadow: 0 2px 8px rgba(16, 185, 129, 0.1); }
    50% { box-shadow: 0 4px 16px rgba(16, 185, 129, 0.2); }
  }
`;



const DetailedResultsCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
  margin-top: 24px;
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
    transform: translateY(-2px);
  }
`;

const QKDResultsCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
  margin-top: 24px;
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
    transform: translateY(-2px);
  }
`;

const ResultsHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 2px solid #e2e8f0;
`;

const ResultsTitle = styled.h2`
  font-size: 24px;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
`;

const StatusBadge = styled.div`
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  background: ${props => props.$isSecure ? '#dcfce7' : '#fee2e2'};
  color: ${props => props.$isSecure ? '#166534' : '#dc2626'};
  display: flex;
  align-items: center;
  gap: 6px;
`;

const SecurityStatus = styled.div`
  font-size: 18px;
  font-weight: 600;
  color: ${props => props.$isSecure ? '#166534' : '#dc2626'};
  margin: 16px 0;
`;

const ErrorRate = styled.div`
  font-size: 16px;
  color: #64748b;
  margin-bottom: 8px;
`;

const TabsContainer = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
  border-bottom: 2px solid #e2e8f0;
`;

const Tab = styled.button`
  padding: 12px 24px;
  border: none;
  background: transparent;
  font-size: 16px;
  font-weight: 600;
  color: ${props => props.$active ? '#3b82f6' : '#64748b'};
  cursor: pointer;
  border-bottom: 3px solid ${props => props.$active ? '#3b82f6' : 'transparent'};
  margin-bottom: -2px;
  transition: all 0.2s ease;

  &:hover {
    color: #3b82f6;
  }
`;

const TabContent = styled.div`
  padding: 20px 0;
`;

const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
`;

const SummaryItem = styled.div`
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  padding: 20px;
  border-radius: 12px;
  border: 2px solid #e2e8f0;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
    transform: scaleX(0);
    transition: transform 0.3s ease;
  }

  &:hover {
    border-color: rgba(102, 126, 234, 0.3);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.1);
    transform: translateY(-2px);

    &::before {
      transform: scaleX(1);
    }
  }
`;

const SummaryLabel = styled.div`
  font-size: 12px;
  color: #64748b;
  margin-bottom: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const SummaryValue = styled.div`
  font-size: 28px;
  font-weight: 800;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  transition: transform 0.2s ease;

  ${SummaryItem}:hover & {
    transform: scale(1.05);
  }
`;

const ProtocolDetailsSection = styled.div`
  margin-bottom: 24px;
`;

const ProtocolLabel = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 8px;
`;

const ProtocolValue = styled.div`
  font-size: 14px;
  color: #1e293b;
  background: #f8fafc;
  padding: 12px;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
  font-family: 'Courier New', monospace;
  word-break: break-all;
  line-height: 1.6;
`;

const KeyDisplay = styled.div`
  font-size: 14px;
  color: #1e293b;
  background: #f8fafc;
  padding: 12px;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
  font-family: 'Courier New', monospace;
  word-break: break-all;
  line-height: 1.6;
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
    num_qubits: 8,
    channel_length: 10.0,
    channel_attenuation: 0.1,
    channel_depolarization: 0.01,
    photon_source_efficiency: 0.8,
    detector_efficiency: 0.8,
    wavelength: 800,
    temperature: 20,
    detector_dark_count_rate: 100,
    detector_dead_time: 0.001,
    clock_frequency: 1.0
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
    use_advanced_privacy_amplification: false,
    privacy_amplification_method: 'toeplitz',
    use_decoy_states: false,
    decoy_state_parameters: {
      signal_intensity: 0.5,
      decoy_intensity: 0.1,
      vacuum_intensity: 0.0
    }
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
  const [activeTab, setActiveTab] = useState('summary');

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
        use_advanced_reconciliation: advancedFeatures.use_advanced_reconciliation,
        reconciliation_method: advancedFeatures.reconciliation_method,
        use_advanced_privacy_amplification: advancedFeatures.use_advanced_privacy_amplification,
        privacy_amplification_method: advancedFeatures.privacy_amplification_method,
        use_decoy_states: advancedFeatures.use_decoy_states,
        decoy_state_parameters: advancedFeatures.decoy_state_parameters
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
              const bb84Result = status.results?.bb84_result || status.results;
              if (bb84Result) {
                qber = bb84Result.sifted_qber || bb84Result.qber || 0;
                keyLength = bb84Result.final_key_length || 0;
                attackDetected = status.attack_detection?.attack_detected || false;
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
              
              let bb84Data = {};
              if (status.results) {
                if (status.results.bb84_result) {
                  bb84Data = status.results.bb84_result;
                } else if (status.results.raw_key_length !== undefined) {
                  bb84Data = status.results;
                }
              } else if (bb84Result) {
                bb84Data = bb84Result;
              }
              
              const detailed = {
                bb84_result: bb84Data,
                attack_detection: status.attack_detection || {},
                simulation_time: status.simulation_time || 0,
                parameters: parameters,
                attackConfig: attackConfig,
                advancedFeatures: advancedFeatures
              };
              
              updateDetailedResults(detailed);
              
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
    setActiveTab('summary');
  };

  return (
    <SimulationContainer>
      <SimulationGrid>
        <ParameterCard>
          <CardTitle>
            <Settings size={20} />
            Simulation Parameters
          </CardTitle>
          
          <ParameterGroup>
            <ParameterLabel>Number of Bits to Transmit</ParameterLabel>
            <ParameterSelect
              value={parameters.num_qubits}
              onChange={(e) => handleParameterChange('num_qubits', parseInt(e.target.value))}
            >
              <option value={8}>8</option>
              <option value={32}>32</option>
              <option value={64}>64</option>
            </ParameterSelect>
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
              min="0.5"
              max="0.95"
              step="0.05"
            />
          </ParameterGroup>

          <ParameterGroup>
            <ParameterLabel>Detector Efficiency</ParameterLabel>
            <ParameterInput
              type="number"
              value={parameters.detector_efficiency}
              onChange={(e) => handleParameterChange('detector_efficiency', e.target.value)}
              min="0.1"
              max="0.95"
              step="0.05"
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
          
          <ParameterGroup>
            <ParameterLabel><Cpu size={16} style={{ display: 'inline', marginRight: '8px' }} /> Advanced Reconciliation</ParameterLabel>
            <CheckboxGroup>
              <Checkbox
                type="checkbox"
                id="use_advanced_reconciliation"
                checked={advancedFeatures.use_advanced_reconciliation}
                onChange={(e) => handleAdvancedFeatureChange('use_advanced_reconciliation', e.target.checked)}
              />
              <ParameterLabel htmlFor="use_advanced_reconciliation" style={{ marginBottom: '0' }}>
                Enable Advanced Reconciliation
              </ParameterLabel>
            </CheckboxGroup>
            {advancedFeatures.use_advanced_reconciliation && (
              <ParameterSelect
                value={advancedFeatures.reconciliation_method}
                onChange={(e) => handleAdvancedFeatureChange('reconciliation_method', e.target.value)}
                style={{ marginTop: '8px' }}
              >
                <option value="cascade">Cascade Protocol</option>
                <option value="ldpc">LDPC Codes</option>
                <option value="hybrid">Hybrid Method</option>
              </ParameterSelect>
            )}
          </ParameterGroup>

          <ParameterGroup>
            <ParameterLabel><Lock size={16} style={{ display: 'inline', marginRight: '8px' }} /> Privacy Amplification</ParameterLabel>
            <CheckboxGroup>
              <Checkbox
                type="checkbox"
                id="use_advanced_privacy_amplification"
                checked={advancedFeatures.use_advanced_privacy_amplification}
                onChange={(e) => handleAdvancedFeatureChange('use_advanced_privacy_amplification', e.target.checked)}
              />
              <ParameterLabel htmlFor="use_advanced_privacy_amplification" style={{ marginBottom: '0' }}>
                Enable Advanced Privacy Amplification
              </ParameterLabel>
            </CheckboxGroup>
            {advancedFeatures.use_advanced_privacy_amplification && (
              <ParameterSelect
                value={advancedFeatures.privacy_amplification_method}
                onChange={(e) => handleAdvancedFeatureChange('privacy_amplification_method', e.target.value)}
                style={{ marginTop: '8px' }}
              >
                <option value="toeplitz">Toeplitz Hashing</option>
                <option value="universal">Universal Hashing</option>
                <option value="hybrid">Hybrid Method</option>
              </ParameterSelect>
            )}
          </ParameterGroup>

          <ParameterGroup>
            <ParameterLabel><Database size={16} style={{ display: 'inline', marginRight: '8px' }} /> Decoy States</ParameterLabel>
            <CheckboxGroup>
              <Checkbox
                type="checkbox"
                id="use_decoy_states"
                checked={advancedFeatures.use_decoy_states}
                onChange={(e) => handleAdvancedFeatureChange('use_decoy_states', e.target.checked)}
              />
              <ParameterLabel htmlFor="use_decoy_states" style={{ marginBottom: '0' }}>
                Enable Decoy States
              </ParameterLabel>
            </CheckboxGroup>
          </ParameterGroup>

        </ParameterCard>
      </SimulationGrid>

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
          <QKDResultsCard>
            <ResultsHeader>
              <ResultsTitle>QKD Results</ResultsTitle>
              <StatusBadge $isSecure={!simulationResults.attackDetected}>
                {simulationResults.attackDetected ? (
                  <>
                    <AlertTriangle size={16} />
                    Compromised
                  </>
                ) : (
                  <>
                    <ShieldCheck size={16} />
                    Secure
                  </>
                )}
              </StatusBadge>
            </ResultsHeader>

            <SecurityStatus $isSecure={!simulationResults.attackDetected}>
              {simulationResults.attackDetected 
                ? 'Eavesdropper Detected!' 
                : 'Secure Key Established'}
            </SecurityStatus>

            <ErrorRate>
              Error rate: {(simulationResults.qber * 100).toFixed(2)}%
            </ErrorRate>

            <TabsContainer>
              <Tab 
                $active={activeTab === 'summary'} 
                onClick={() => setActiveTab('summary')}
              >
                Summary
              </Tab>
              <Tab 
                $active={activeTab === 'details'} 
                onClick={() => setActiveTab('details')}
              >
                Protocol Details
              </Tab>
            </TabsContainer>

            <TabContent>
              {activeTab === 'summary' && (
                <div>
                  <SummaryGrid>
                    <SummaryItem>
                      <SummaryLabel>Raw Key Length</SummaryLabel>
                      <SummaryValue>{parameters.num_qubits}</SummaryValue>
                    </SummaryItem>
                    <SummaryItem>
                      <SummaryLabel>Sifted Key Length</SummaryLabel>
                      <SummaryValue>
                        {detailedResults?.bb84_result?.sifted_key_length || Math.floor(parameters.num_qubits * 0.5)}
                      </SummaryValue>
                    </SummaryItem>
                    <SummaryItem>
                      <SummaryLabel>Sifting Efficiency</SummaryLabel>
                      <SummaryValue>
                        {((detailedResults?.bb84_result?.sifted_key_length || Math.floor(parameters.num_qubits * 0.5)) / parameters.num_qubits * 100).toFixed(1)}%
                      </SummaryValue>
                    </SummaryItem>
                    <SummaryItem>
                      <SummaryLabel>Final Key Length</SummaryLabel>
                      <SummaryValue>
                        {simulationResults.keyLength} bits
                      </SummaryValue>
                    </SummaryItem>
                  </SummaryGrid>
                  
                  <ProtocolDetailsSection>
                    <ProtocolLabel>Security Check</ProtocolLabel>
                    <ProtocolValue>
                      {simulationResults.attackDetected 
                        ? 'Eavesdropping detected - Key compromised' 
                        : 'No eavesdropping detected - Key secure'}
                    </ProtocolValue>
                  </ProtocolDetailsSection>

                  <div style={{ marginTop: '16px', color: '#64748b', fontSize: '14px' }}>
                    Simulation completed in {(detailedResults?.simulation_time || 0.1).toFixed(2)}ms
                  </div>
                </div>
              )}

              {activeTab === 'details' && (
                <div>
                  {detailedResults?.bb84_result ? (
                    <>
                      <ProtocolDetailsSection>
                        <ProtocolLabel>Alice's Random Bits</ProtocolLabel>
                        <ProtocolValue>
                          {detailedResults.bb84_result.alice_random_bits && detailedResults.bb84_result.alice_random_bits.length > 0
                            ? detailedResults.bb84_result.alice_random_bits.slice(0, 100).join(' ') + (detailedResults.bb84_result.alice_random_bits.length > 100 ? '...' : '')
                            : 'N/A'}
                        </ProtocolValue>
                      </ProtocolDetailsSection>

                      <ProtocolDetailsSection>
                        <ProtocolLabel>Alice's Bases</ProtocolLabel>
                        <ProtocolValue>
                          {detailedResults.bb84_result.alice_bases && detailedResults.bb84_result.alice_bases.length > 0
                            ? detailedResults.bb84_result.alice_bases.slice(0, 100).join(' ') + (detailedResults.bb84_result.alice_bases.length > 100 ? '...' : '')
                            : 'N/A'}
                        </ProtocolValue>
                      </ProtocolDetailsSection>

                      <ProtocolDetailsSection>
                        <ProtocolLabel>Bob's Bases</ProtocolLabel>
                        <ProtocolValue>
                          {detailedResults.bb84_result.bob_bases && detailedResults.bb84_result.bob_bases.length > 0
                            ? detailedResults.bb84_result.bob_bases.slice(0, 100).join(' ') + (detailedResults.bb84_result.bob_bases.length > 100 ? '...' : '')
                            : 'N/A'}
                        </ProtocolValue>
                      </ProtocolDetailsSection>

                      <ProtocolDetailsSection>
                        <ProtocolLabel>Bob's Measurements</ProtocolLabel>
                        <ProtocolValue>
                          {detailedResults.bb84_result.bob_measurements && detailedResults.bb84_result.bob_measurements.length > 0
                            ? detailedResults.bb84_result.bob_measurements.slice(0, 100).join(' ') + (detailedResults.bb84_result.bob_measurements.length > 100 ? '...' : '')
                            : 'N/A'}
                        </ProtocolValue>
                      </ProtocolDetailsSection>

                      <ProtocolDetailsSection>
                        <ProtocolLabel>Alice's Key</ProtocolLabel>
                        <KeyDisplay>
                          {(() => {
                            const attackDetected = simulationResults.attackDetected || false;
                            const keyToShow = attackDetected 
                              ? (detailedResults.bb84_result.sifted_key_sender || [])
                              : (detailedResults.bb84_result.final_key_sender || []);
                            
                            if (keyToShow.length > 0) {
                              return keyToShow.slice(0, 50).join('') + (keyToShow.length > 50 ? '...' : '');
                            }
                            
                            const fallbackKey = detailedResults.bb84_result.sifted_key_sender || detailedResults.bb84_result.final_key_sender || [];
                            return fallbackKey.length > 0 
                              ? fallbackKey.slice(0, 50).join('') + (fallbackKey.length > 50 ? '...' : '')
                              : 'N/A';
                          })()}
                        </KeyDisplay>
                      </ProtocolDetailsSection>

                      <ProtocolDetailsSection>
                        <ProtocolLabel>Bob's Key</ProtocolLabel>
                        <KeyDisplay>
                          {(() => {
                            const attackDetected = simulationResults.attackDetected || false;
                            const keyToShow = attackDetected 
                              ? (detailedResults.bb84_result.sifted_key_receiver || [])
                              : (detailedResults.bb84_result.final_key_receiver || []);
                            
                            if (keyToShow.length > 0) {
                              return keyToShow.slice(0, 50).join('') + (keyToShow.length > 50 ? '...' : '');
                            }
                            
                            const fallbackKey = detailedResults.bb84_result.sifted_key_receiver || detailedResults.bb84_result.final_key_receiver || [];
                            return fallbackKey.length > 0 
                              ? fallbackKey.slice(0, 50).join('') + (fallbackKey.length > 50 ? '...' : '')
                              : 'N/A';
                          })()}
                        </KeyDisplay>
                      </ProtocolDetailsSection>
                    </>
                  ) : (
                    <div style={{ color: '#64748b', padding: '20px', textAlign: 'center' }}>
                      Protocol details not available. Please run a simulation first.
                    </div>
                  )}

                  <div style={{ marginTop: '16px', color: '#64748b', fontSize: '14px' }}>
                    Simulation completed in {(detailedResults?.simulation_time || 0.1).toFixed(2)}ms
                  </div>
                </div>
              )}
            </TabContent>

            <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'center' }}>
              <SecondaryButton onClick={resetSimulation}>
                <Settings size={18} />
                Reset Simulation
              </SecondaryButton>
            </div>
          </QKDResultsCard>
        )}
      </StatusCard>

    </SimulationContainer>
  );
};

export default Simulation;
