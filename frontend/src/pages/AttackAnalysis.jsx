import React, { useState } from 'react';
import styled from 'styled-components';
import { Shield, AlertTriangle, Play, Clock, Zap } from 'lucide-react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import qkdApi from '../api/qkdApi';

const AttackContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  min-height: 100%;
  width: 100%;
`;

const AttackCard = styled.div`
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

const AttackGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
`;

const AttackTypeCard = styled.div`
  background: ${props => props.$selected ? 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)' : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'};
  border: 2px solid ${props => props.$selected ? '#3b82f6' : '#e2e8f0'};
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: ${props => props.$selected ? '0 4px 12px rgba(59, 130, 246, 0.2)' : '0 2px 4px rgba(0,0,0,0.05)'};

  &:hover {
    border-color: #3b82f6;
    background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
  }
`;

const AttackTypeHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
`;

const AttackTypeName = styled.h4`
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
`;

const AttackTypeDescription = styled.p`
  color: #64748b;
  font-size: 14px;
  margin: 0;
  line-height: 1.5;
`;

const AttackParameter = styled.div`
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

const ResultsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 24px;
  margin-top: 24px;
`;

const ResultCard = styled.div`
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
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

const ResultTitle = styled.h4`
  font-size: 18px;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 20px 0;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const ResultGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
`;

const ResultItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const ResultLabel = styled.div`
  font-size: 13px;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const ResultValue = styled.div`
  font-size: 28px;
  font-weight: 700;
  color: #1e293b;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const RiskBadge = styled.div`
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: ${props => {
    if (props.$risk === 'high') return 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)';
    if (props.$risk === 'medium') return 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)';
    return 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)';
  }};
  color: ${props => {
    if (props.$risk === 'high') return '#991b1b';
    if (props.$risk === 'medium') return '#92400e';
    return '#065f46';
  }};
`;

const MetricCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 20px;
  border: 1px solid ${props => props.$color || '#e2e8f0'};
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
`;

const AttackAnalysis = () => {
  const [selectedAttack, setSelectedAttack] = useState('intercept_resend');
  const [attackParameters, setAttackParameters] = useState({
    strength: 0.5,
    duration: 1000,
    target_qubits: 500
  });
  const [simulationResults, setSimulationResults] = useState(null);
  const [simulationHistory, setSimulationHistory] = useState([]);
  const [simulationStatus, setSimulationStatus] = useState({
    status: 'idle',
    progress: 0,
    message: 'Ready to run simulation'
  });

  const attackTypes = [
    {
      id: 'intercept_resend',
      name: 'Intercept-Resend',
      description: 'Eve intercepts and resends photons'
    },
    {
      id: 'photon_number_splitting',
      name: 'PNS Attack',
      description: 'Exploit multi-photon pulses'
    },
    {
      id: 'detector_blinding',
      name: 'Detector Blinding',
      description: 'Blind detectors with bright light'
    }
  ];

  const runAttackSimulation = async () => {
    try {
      setSimulationStatus({
        status: 'running',
        progress: 0,
        message: 'Running attack simulation...'
      });

      const attackRequest = {
        num_qubits: attackParameters.target_qubits,
        channel_length: 10.0,
        channel_attenuation: 0.1,
        attack_type: selectedAttack,
        attack_parameters: {
          strength: attackParameters.strength
        }
      };

      const response = await qkdApi.simulateAttack(attackRequest);
      
      if (response && response.simulation_id) {
        const qber = response.sifted_qber || response.qber || 0.0;
        
        let detectionRate = 0.05;
        if (qber > 0.15) {
          detectionRate = 0.85 + (qber - 0.15) * 0.5;
        } else if (qber > 0.10) {
          detectionRate = 0.70 + (qber - 0.10) * 3.0;
        } else if (qber > 0.05) {
          detectionRate = 0.30 + (qber - 0.05) * 8.0;
        }
        detectionRate = Math.min(0.95, Math.max(0.05, detectionRate));
        
        const keyCompromise = qber * 0.5;
        const attackStrength = attackParameters.strength * 100;
        
        const newResult = {
          attack_type: selectedAttack,
          qber: qber,
          detection_rate: detectionRate,
          key_compromise: keyCompromise,
          timestamp: new Date().toISOString(),
          simulation_id: response.simulation_id,
          final_key_length: response.final_key_length,
          strength: attackStrength
        };
        
        setSimulationResults(newResult);
        setSimulationHistory(prev => [...prev, newResult]);

        setSimulationStatus({
          status: 'completed',
          progress: 100,
          message: 'Attack simulation completed'
        });
      } else {
        setSimulationStatus({
          status: 'failed',
          progress: 0,
          message: 'Attack simulation failed'
        });
        alert('Attack simulation failed. Please try again.');
      }
    } catch (err) {
      setSimulationStatus({
        status: 'failed',
        progress: 0,
        message: 'Unable to run attack simulation'
      });
      alert('Unable to run attack simulation');
    }
  };

  const getChartData = () => {
    if (simulationHistory.length === 0) return [];
    
    return simulationHistory.map(result => ({
      strength: parseFloat(result.strength.toFixed(0)),
      qber: parseFloat((result.qber * 100).toFixed(2)),
      detection: parseFloat((result.detection_rate * 100).toFixed(1)),
      compromise: parseFloat((result.key_compromise * 100).toFixed(1))
    }));
  };

  const getRiskLevel = (qber) => {
    if (qber > 0.15) return 'high';
    if (qber > 0.05) return 'medium';
    return 'low';
  };

  const getRiskText = (qber) => {
    if (qber > 0.15) return 'High Risk';
    if (qber > 0.05) return 'Medium Risk - Moderate Risk';
    return 'Low Risk';
  };

  const calculateBreakTime = (qber, attackType, keyLength) => {
    const baseYears = 1000;
    
    let qberReduction = 1;
    if (qber > 0.20) {
      qberReduction = 0.25;
    } else if (qber > 0.15) {
      qberReduction = 0.35;
    } else if (qber > 0.10) {
      qberReduction = 0.50;
    } else if (qber > 0.05) {
      qberReduction = 0.70;
    } else if (qber > 0.01) {
      qberReduction = 0.90;
    } else {
      qberReduction = 1.0;
    }
    
    let attackReduction = 1;
    switch(attackType) {
      case 'intercept_resend':
        attackReduction = 0.60;
        break;
      case 'photon_number_splitting':
        attackReduction = 0.75;
        break;
      case 'detector_blinding':
        attackReduction = 0.65;
        break;
      default:
        attackReduction = 1.0;
    }
    
    const years = baseYears * qberReduction * attackReduction;
    
    if (years < 1) return '0';
    if (years < 1000) return Math.round(years).toString();
    if (years < 1000000) return Math.round(years / 1000).toString() + 'K';
    return Math.round(years / 1000000).toString() + 'M';
  };

  return (
    <AttackContainer>
      <AttackCard>
        <CardTitle>
          <Shield size={20} />
          Attack Configuration
        </CardTitle>
        
        <AttackGrid>
          {attackTypes.map(attack => (
            <AttackTypeCard
              key={attack.id}
              $selected={selectedAttack === attack.id}
              onClick={() => setSelectedAttack(attack.id)}
            >
              <AttackTypeHeader>
                <AttackTypeName>{attack.name}</AttackTypeName>
                <AlertTriangle size={20} color="#ef4444" />
              </AttackTypeHeader>
              <AttackTypeDescription>{attack.description}</AttackTypeDescription>
            </AttackTypeCard>
          ))}
        </AttackGrid>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '24px' }}>
          <AttackParameter>
            <ParameterLabel>Attack Strength</ParameterLabel>
            <ParameterInput
              type="range"
              min="0.1"
              max="1.0"
              step="0.1"
              value={attackParameters.strength}
              onChange={(e) => setAttackParameters(prev => ({
                ...prev,
                strength: parseFloat(e.target.value)
              }))}
            />
            <div style={{ textAlign: 'center', color: '#64748b', fontSize: '14px', fontWeight: 600 }}>
              {(attackParameters.strength * 100).toFixed(0)}%
            </div>
          </AttackParameter>

          <AttackParameter>
            <ParameterLabel>Duration</ParameterLabel>
            <ParameterInput
              type="number"
              value={attackParameters.duration}
              onChange={(e) => setAttackParameters(prev => ({
                ...prev,
                duration: parseInt(e.target.value)
              }))}
              min="100"
              max="10000"
              step="100"
            />
          </AttackParameter>

          <AttackParameter>
            <ParameterLabel>Target Qubits</ParameterLabel>
            <ParameterInput
              type="number"
              value={attackParameters.target_qubits}
              onChange={(e) => setAttackParameters(prev => ({
                ...prev,
                target_qubits: parseInt(e.target.value)
              }))}
              min="100"
              max="10000"
              step="100"
            />
          </AttackParameter>
        </div>

        <div style={{ marginTop: '24px' }}>
          <PrimaryButton onClick={runAttackSimulation}>
            <Play size={18} />
            Run Attack Simulation
          </PrimaryButton>
        </div>
      </AttackCard>

      {simulationResults && (
        <>
          <AttackCard>
            <CardTitle>
              <AlertTriangle size={20} />
              Attack Simulation Results
            </CardTitle>
            <ResultsGrid>
              <ResultCard>
                <ResultTitle>
                  <Clock size={18} />
                  Time to Break Encryption
                </ResultTitle>
                <ResultValue>
                  {calculateBreakTime(simulationResults.qber, simulationResults.attack_type, simulationResults.final_key_length || attackParameters.target_qubits)} Years
                </ResultValue>
                <div style={{ marginTop: '12px' }}>
                  <RiskBadge $risk={getRiskLevel(simulationResults.qber)}>
                    <AlertTriangle size={14} />
                    {getRiskText(simulationResults.qber)}
                  </RiskBadge>
                </div>
              </ResultCard>

              <ResultCard>
                <ResultTitle>
                  <Zap size={18} />
                  Security Vulnerability
                </ResultTitle>
                <ResultValue>
                  {getRiskLevel(simulationResults.qber) === 'high' ? 'High' : 
                   getRiskLevel(simulationResults.qber) === 'medium' ? 'Medium' : 'Low'}
                </ResultValue>
                <div style={{ marginTop: '12px' }}>
                  <ResultLabel>Detection Rate</ResultLabel>
                  <ResultValue style={{ fontSize: '24px' }}>
                    {(simulationResults.detection_rate * 100).toFixed(1)}%
                  </ResultValue>
                </div>
              </ResultCard>

              <ResultCard>
                <ResultTitle>Key Metrics</ResultTitle>
                <ResultGrid>
                  <ResultItem>
                    <ResultLabel>Qubits Required</ResultLabel>
                    <ResultValue style={{ fontSize: '24px' }}>
                      {attackParameters.target_qubits}
                    </ResultValue>
                  </ResultItem>
                  <ResultItem>
                    <ResultLabel>Error Rate</ResultLabel>
                    <ResultValue style={{ fontSize: '24px' }}>
                      {(simulationResults.qber * 100).toFixed(2)}%
                    </ResultValue>
                  </ResultItem>
                  <ResultItem>
                    <ResultLabel>Success Probability</ResultLabel>
                    <ResultValue style={{ fontSize: '24px' }}>
                      {((1 - simulationResults.qber) * 100).toFixed(1)}%
                    </ResultValue>
                  </ResultItem>
                  <ResultItem>
                    <ResultLabel>Key Compromise</ResultLabel>
                    <ResultValue style={{ fontSize: '24px' }}>
                      {(simulationResults.key_compromise * 100).toFixed(1)}%
                    </ResultValue>
                  </ResultItem>
                </ResultGrid>
              </ResultCard>

              <ResultCard>
                <ResultTitle>Algorithm</ResultTitle>
                <ResultValue style={{ fontSize: '20px' }}>
                  QKD-BB84
                </ResultValue>
                <ResultLabel style={{ marginTop: '12px' }}>Quantum-Secure Protocol</ResultLabel>
              </ResultCard>
            </ResultsGrid>
          </AttackCard>

          {simulationHistory.length > 0 && (
            <AttackCard>
              <CardTitle>Attack Visualization</CardTitle>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={getChartData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="strength" label={{ value: 'Attack Strength (%)', position: 'insideBottom', offset: -5 }} />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="detection" stroke="#10b981" strokeWidth={3} name="Detection Rate (%)" />
                  <Line type="monotone" dataKey="compromise" stroke="#ef4444" strokeWidth={3} name="Key Compromise (%)" />
                </LineChart>
              </ResponsiveContainer>
              <p style={{ textAlign: 'center', color: '#64748b', fontSize: '14px', marginTop: '16px' }}>
                This visualization represents quantum computing's impact on BB84 protocol security.
              </p>
            </AttackCard>
          )}
        </>
      )}

      {!simulationResults && (
        <AttackCard>
          <div style={{ 
            textAlign: 'center', 
            padding: '60px 20px',
            color: '#64748b'
          }}>
            <Shield size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
            <p>Select an attack type and run simulation to see results</p>
          </div>
        </AttackCard>
      )}
    </AttackContainer>
  );
};

export default AttackAnalysis;
