import React, { useState } from 'react';
import styled from 'styled-components';
import { Shield, AlertTriangle, BarChart3, Play, Download, Eye } from 'lucide-react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import qkdApi from '../api/qkdApi';

const AttackContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  min-height: 100%;
  width: 100%;
`;

const AttackGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 24px;
  width: 100%;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
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

const AttackTypeCard = styled.div`
  background: ${props => props.$selected ? 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)' : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'};
  border: 2px solid ${props => props.$selected ? '#3b82f6' : '#e2e8f0'};
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 16px;
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

const ResultsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
  margin-top: 24px;
`;

const ResultCard = styled.div`
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
      name: 'Intercept-Resend Attack',
      description: 'Eve intercepts photons, measures them, and resends them to Bob. This attack can be detected through increased QBER.',
      color: '#ef4444'
    },
    {
      id: 'photon_number_splitting',
      name: 'Photon Number Splitting Attack',
      description: 'Eve exploits multi-photon pulses to gain partial information about the key without detection.',
      color: '#f59e0b'
    },
    {
      id: 'detector_blinding',
      name: 'Detector Blinding Attack',
      description: 'Eve sends bright light to blind detectors, potentially gaining information about the key.',
      color: '#8b5cf6'
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
        const detectionRate = response.attack_detected ? (response.attack_detection?.confidence || 0.9) : 0.1;
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

  return (
    <AttackContainer>
      <AttackGrid>
        <AttackCard>
          <CardTitle>
            <Shield size={20} />
            Attack Configuration
          </CardTitle>
          
          {attackTypes.map(attack => (
                            <AttackTypeCard
                  key={attack.id}
                  $selected={selectedAttack === attack.id}
                  onClick={() => setSelectedAttack(attack.id)}
                >
              <AttackTypeHeader>
                <AttackTypeName>{attack.name}</AttackTypeName>
                <AlertTriangle size={20} color={attack.color} />
              </AttackTypeHeader>
              <AttackTypeDescription>{attack.description}</AttackTypeDescription>
            </AttackTypeCard>
          ))}

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
            <div style={{ textAlign: 'center', color: '#64748b', fontSize: '14px' }}>
              {attackParameters.strength}
            </div>
          </AttackParameter>

          <AttackParameter>
            <ParameterLabel>Duration (qubits)</ParameterLabel>
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

          <div style={{ marginTop: '24px' }}>
            <PrimaryButton onClick={runAttackSimulation}>
              <Play size={18} />
              Run Attack Simulation
            </PrimaryButton>
          </div>
        </AttackCard>

        <AttackCard>
          <CardTitle>
            <BarChart3 size={20} />
            Attack Analysis Results
          </CardTitle>
          
          {simulationResults ? (
            <>
              <div style={{ 
                background: '#fef3c7', 
                padding: '20px', 
                borderRadius: '12px',
                marginBottom: '24px'
              }}>
                <h4 style={{ margin: '0 0 12px 0', color: '#92400e' }}>
                  Simulation Results - {attackTypes.find(a => a.id === simulationResults.attack_type)?.name}
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                  <div>
                    <strong>QBER:</strong> {(simulationResults.qber * 100).toFixed(2)}%
                  </div>
                  <div>
                    <strong>Detection Rate:</strong> {(simulationResults.detection_rate * 100).toFixed(1)}%
                  </div>
                  <div>
                    <strong>Key Compromise:</strong> {(simulationResults.key_compromise * 100).toFixed(1)}%
                  </div>
                </div>
              </div>

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
            </>
          ) : (
            <div style={{ 
              textAlign: 'center', 
              padding: '60px 20px',
              color: '#64748b'
            }}>
              <Shield size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
              <p>Select an attack type and run simulation to see results</p>
            </div>
          )}
        </AttackCard>
      </AttackGrid>

      {simulationResults && (
        <ResultsGrid>
          <ResultCard>
            <CardTitle>Attack Detection Status</CardTitle>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Detected', value: simulationResults.detection_rate * 100, color: '#10b981' },
                    { name: 'Undetected', value: (1 - simulationResults.detection_rate) * 100, color: '#ef4444' }
                  ]}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                >
                  {[
                    { name: 'Detected', value: simulationResults.detection_rate * 100, color: '#10b981' },
                    { name: 'Undetected', value: (1 - simulationResults.detection_rate) * 100, color: '#ef4444' }
                  ].map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </ResultCard>
        </ResultsGrid>
      )}
    </AttackContainer>
  );
};

export default AttackAnalysis;
