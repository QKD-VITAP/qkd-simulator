import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { BarChart3, Download, Eye, TrendingUp, AlertTriangle, RefreshCw, X } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ScatterChart, Scatter } from 'recharts';
import qkdApi from '../api/qkdApi';

const ResultsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  min-height: 100%;
  width: 100%;
`;

const ResultsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(to bottom, #ffffff, #f8fafc);
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(59, 130, 246, 0.05);
  border: 1px solid rgba(59, 130, 246, 0.1);
  transition: all 0.3s ease;
  flex-wrap: wrap;
  gap: 12px;

  &:hover {
    box-shadow: 0 4px 16px rgba(59, 130, 246, 0.15), 0 0 0 1px rgba(59, 130, 246, 0.2);
  }

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
    padding: 12px;
    gap: 10px;
  }
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    width: 100%;
    flex-direction: column;
    align-items: stretch;
  }
`;

const HeaderTitle = styled.h2`
  font-size: 20px;
  font-weight: 700;
  color: #1e293b;
  margin: 0;

  @media (max-width: 768px) {
    font-size: 18px;
  }
`;

const HeaderStats = styled.div`
  display: flex;
  gap: 16px;

  @media (max-width: 768px) {
    width: 100%;
    justify-content: space-between;
    gap: 8px;
  }
`;

const StatItem = styled.div`
  display: flex;
  align-items: center;
  padding: 8px 16px;
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border-radius: 6px;
  border: 1px solid #e2e8f0;
  transition: all 0.3s ease;

  &:hover {
    border-color: rgba(102, 126, 234, 0.3);
    box-shadow: 0 2px 8px rgba(102, 126, 234, 0.1);
    transform: translateY(-1px);
  }

  @media (max-width: 768px) {
    padding: 6px 10px;
  }
`;

const StatValue = styled.div`
  font-size: 16px;
  font-weight: 700;
  color: #667eea;
  margin-left: 8px;

  @media (max-width: 768px) {
    font-size: 13px;
    margin-left: 6px;
  }
`;

const StatLabel = styled.div`
  font-size: 13px;
  color: #64748b;
  font-weight: 600;

  @media (max-width: 768px) {
    font-size: 11px;
  }
`;

const HeaderControls = styled.div`
  display: flex;
  gap: 10px;

  @media (max-width: 768px) {
    width: 100%;
    justify-content: stretch;
    gap: 8px;
  }
`;

const Button = styled.button`
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 6px;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  @media (max-width: 768px) {
    flex: 1;
    justify-content: center;
    padding: 8px 12px;
    font-size: 12px;
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
  grid-template-columns: 2fr 1fr;
  gap: 24px;
  width: 100%;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const ResultsCard = styled.div`
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

const ResultsTable = styled.div`
  overflow-x: auto;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const Tr = styled.tr`
  transition: all 0.2s ease;
  
  &:hover {
    background: linear-gradient(90deg, #fefefe 0%, #f8fafc 100%);
    transform: scale(1.01);
  }
`;

const Th = styled.th`
  text-align: left;
  padding: 16px;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  border-bottom: 2px solid #e2e8f0;
  font-weight: 700;
  color: #374151;
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const Td = styled.td`
  padding: 16px;
  border-bottom: 1px solid #f1f5f9;
  font-size: 14px;
  color: #475569;
  font-weight: 500;
`;

const StatusBadge = styled.span`
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  background: ${props => {
    switch (props.$status) {
      case 'completed': return 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)';
      case 'running': return 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)';
      case 'failed': return 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)';
      default: return 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)';
    }
  }};
  color: ${props => {
    switch (props.$status) {
      case 'completed': return '#166534';
      case 'running': return '#1e40af';
      case 'failed': return '#dc2626';
      default: return '#64748b';
    }
  }};
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  padding: 8px;
  border-radius: 8px;
  color: #64748b;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
    color: #667eea;
    transform: scale(1.1);
  }
`;

const DetailModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
  backdrop-filter: blur(4px);

  @media (max-width: 768px) {
    padding: 10px;
  }
`;

const DetailCard = styled.div`
  background: white;
  border-radius: 20px;
  padding: 32px;
  max-width: 600px;
  width: 100%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  border: 1px solid #e2e8f0;
  animation: slideDown 0.3s ease;

  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @media (max-width: 768px) {
    padding: 24px;
    border-radius: 16px;
    max-height: 90vh;
    overflow-y: auto;
  }
`;

const DetailHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 2px solid #e2e8f0;

  @media (max-width: 768px) {
    margin-bottom: 20px;
    padding-bottom: 12px;
  }
`;

const DetailTitle = styled.h3`
  font-size: 24px;
  font-weight: 700;
  color: #1e293b;
  margin: 0;

  @media (max-width: 768px) {
    font-size: 20px;
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 28px;
  color: #64748b;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s ease;

  &:hover {
    background: #f1f5f9;
    color: #374151;
  }

  @media (max-width: 768px) {
    width: 28px;
    height: 28px;
    font-size: 24px;
  }
`;

const DetailGrid = styled.div`
  display: grid;
  gap: 16px;

  @media (max-width: 768px) {
    gap: 12px;
  }
`;

const DetailRow = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid #f1f5f9;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 4px;
    padding: 8px 0;
  }
`;

const DetailLabel = styled.span`
  font-weight: 600;
  color: #64748b;

  @media (max-width: 768px) {
    font-size: 13px;
  }
`;

const DetailValue = styled.span`
  font-weight: 500;
  color: #1e293b;

  @media (max-width: 768px) {
    font-size: 14px;
  }
`;


const Results = () => {

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDetail, setSelectedDetail] = useState(null);
  
  const [realTimeChartData, setRealTimeChartData] = useState([]);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        const data = await qkdApi.getSimulationHistory();
        
        if (data.simulations) {
          const formattedResults = data.simulations.map(sim => ({
            id: sim.simulation_id || `sim_${Math.random().toString(36).substr(2, 9)}`,
            timestamp: sim.timestamp || new Date().toISOString(),
            status: 'completed',
            qber: sim.bb84_result?.qber || null,
            key_length: sim.bb84_result?.final_key_length || null,
            attack_type: sim.parameters?.attack_type || 'no_attack',
            duration: `${sim.simulation_time?.toFixed(2) || '0.00'}s`,
            raw_key_length: sim.bb84_result?.raw_key_length || null,
            sifted_key_length: sim.bb84_result?.sifted_key_length || null,
            attack_detected: sim.attack_detection?.attack_detected || false,
            performance_metrics: sim.performance_metrics || null
          }));
          setResults(formattedResults);
          
          if (formattedResults.length > 0) {
            const chartData = formattedResults
              .filter(result => result.qber !== null && result.key_length !== null)
              .map((result, index) => ({
                time: new Date(result.timestamp).toLocaleTimeString(),
                qber: result.qber * 100,
                key_length: result.key_length,
                raw_key_length: result.raw_key_length,
                sifted_key_length: result.sifted_key_length,
                attack_detected: result.attack_detected
              }));
            setRealTimeChartData(chartData);
          }
        }
        
        setError(null);
    } catch (err) {
        setError('Unable to load simulation results');
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
    
    const interval = setInterval(fetchResults, 60000);
    return () => clearInterval(interval);
  }, []);


  const exportResults = () => {
    if (results.length === 0) {
      alert('No results to export');
      return;
    }
    
    const headers = ['ID', 'Timestamp', 'Status', 'QBER (%)', 'Final Key Length', 'Raw Key Length', 'Sifted Key Length', 'Attack Type', 'Attack Detected', 'Duration'];
    const csvContent = [
      headers.join(','),
      ...results.map(result => [
        result.id,
        new Date(result.timestamp).toLocaleString(),
        result.status,
        result.qber !== null ? (result.qber * 100).toFixed(2) : 'N/A',
        result.key_length || 'N/A',
        result.raw_key_length || 'N/A',
        result.sifted_key_length || 'N/A',
        result.attack_type.replace('_', ' '),
        result.attack_detected ? 'Yes' : 'No',
        result.duration
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `qkd-simulation-results-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const viewDetails = (id) => {
    const simulation = results.find(r => r.id === id);
    if (simulation) {
      setSelectedDetail(simulation);
    }
  };


  if (loading) {
    return (
      <ResultsContainer>
        <div style={{ 
          textAlign: 'center', 
          padding: '60px 20px',
          color: '#64748b'
        }}>
          <div style={{ fontSize: '24px', marginBottom: '16px' }}>🔄</div>
          <p>Loading simulation results...</p>
        </div>
      </ResultsContainer>
    );
  }

  if (error) {
    return (
      <ResultsContainer>
        <div style={{ 
          textAlign: 'center', 
          padding: '60px 20px',
          color: '#dc2626',
          background: '#fee2e2',
          borderRadius: '12px'
        }}>
          <div style={{ fontSize: '24px', marginBottom: '16px' }}>⚠️</div>
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            style={{
              marginTop: '16px',
              padding: '8px 16px',
              background: '#dc2626',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            Retry
          </button>
        </div>
      </ResultsContainer>
    );
  }

  return (
    <ResultsContainer>
      <ResultsHeader>
        <HeaderStats>
          <StatItem>
            <StatLabel>Total Simulations:</StatLabel>
            <StatValue>{results.length}</StatValue>
          </StatItem>
          <StatItem>
            <StatLabel>Completed:</StatLabel>
            <StatValue>{results.filter(r => r.status === 'completed').length}</StatValue>
          </StatItem>
          <StatItem>
            <StatLabel>Avg QBER:</StatLabel>
            <StatValue>{results.filter(r => r.qber !== null).length > 0 ? (results.filter(r => r.qber !== null).reduce((acc, r) => acc + r.qber, 0) / results.filter(r => r.qber !== null).length * 100).toFixed(2) : '0.00'}%</StatValue>
          </StatItem>
        </HeaderStats>
        
        <HeaderControls>
          <SecondaryButton onClick={() => window.location.reload()}>
            <RefreshCw size={16} />
            Refresh
          </SecondaryButton>
          <PrimaryButton onClick={exportResults}>
            <Download size={16} />
            Export
          </PrimaryButton>
        </HeaderControls>
      </ResultsHeader>


      <ResultsGrid>
        <ResultsCard>
          <CardTitle>
            <BarChart3 size={20} />
            Results Overview
          </CardTitle>
          
                     <ResponsiveContainer width="100%" height={300}>
             <LineChart data={realTimeChartData}>
               <CartesianGrid strokeDasharray="3 3" />
               <XAxis dataKey="time" />
               <YAxis yAxisId="left" />
               <YAxis yAxisId="right" orientation="right" />
               <Tooltip />
               <Line yAxisId="left" type="monotone" dataKey="qber" stroke="#ef4444" strokeWidth={3} name="QBER (%)" />
               <Line yAxisId="right" type="monotone" dataKey="key_length" stroke="#10b981" strokeWidth={3} name="Key Length" />
             </LineChart>
           </ResponsiveContainer>
        </ResultsCard>

        <ResultsCard>
          <CardTitle>
            <TrendingUp size={20} />
            Performance Metrics
          </CardTitle>
          
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart data={realTimeChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="qber" label={{ value: 'QBER (%)', position: 'insideBottom', offset: -5 }} />
              <YAxis dataKey="key_length" label={{ value: 'Key Length (bits)', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Scatter dataKey="key_length" fill="#3b82f6" />
            </ScatterChart>
          </ResponsiveContainer>
        </ResultsCard>
      </ResultsGrid>

      <ResultsCard>
        <CardTitle>
          <BarChart3 size={20} />
          Simulation History
        </CardTitle>
        
        <ResultsTable>
          <Table>
            <thead>
              <tr>
                <Th>ID</Th>
                <Th>Timestamp</Th>
                <Th>Status</Th>
                <Th>QBER</Th>
                <Th>Key Length</Th>
                <Th>Attack Type</Th>
                <Th>Duration</Th>
                <Th>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {results.map(result => (
                <Tr key={result.id}>
                  <Td>{result.id}</Td>
                  <Td>{result.timestamp}</Td>
                  <Td>
                    <StatusBadge $status={result.status}>
                      {result.status}
                    </StatusBadge>
                  </Td>
                  <Td>{result.qber !== null ? `${(result.qber * 100).toFixed(2)}%` : '-'}</Td>
                  <Td>{result.key_length || '-'}</Td>
                  <Td>{result.attack_type.replace('_', ' ')}</Td>
                  <Td>{result.duration}</Td>
                  <Td>
                    <ActionButton onClick={() => viewDetails(result.id)}>
                      <Eye size={16} />
                    </ActionButton>
                  </Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        </ResultsTable>
      </ResultsCard>

      {selectedDetail && (
        <DetailModal onClick={() => setSelectedDetail(null)}>
          <DetailCard onClick={(e) => e.stopPropagation()}>
            <DetailHeader>
              <DetailTitle>Simulation Details</DetailTitle>
              <CloseButton onClick={() => setSelectedDetail(null)}>
                <X size={24} />
              </CloseButton>
            </DetailHeader>
            <DetailGrid>
              <DetailRow>
                <DetailLabel>ID:</DetailLabel>
                <DetailValue>{selectedDetail.id}</DetailValue>
              </DetailRow>
              <DetailRow>
                <DetailLabel>Timestamp:</DetailLabel>
                <DetailValue>{new Date(selectedDetail.timestamp).toLocaleString()}</DetailValue>
              </DetailRow>
              <DetailRow>
                <DetailLabel>Status:</DetailLabel>
                <StatusBadge $status={selectedDetail.status}>{selectedDetail.status}</StatusBadge>
              </DetailRow>
              <DetailRow>
                <DetailLabel>QBER:</DetailLabel>
                <DetailValue>{selectedDetail.qber !== null ? `${(selectedDetail.qber * 100).toFixed(2)}%` : 'N/A'}</DetailValue>
              </DetailRow>
              <DetailRow>
                <DetailLabel>Final Key Length:</DetailLabel>
                <DetailValue>{selectedDetail.key_length || 'N/A'} bits</DetailValue>
              </DetailRow>
              <DetailRow>
                <DetailLabel>Raw Key Length:</DetailLabel>
                <DetailValue>{selectedDetail.raw_key_length || 'N/A'} bits</DetailValue>
              </DetailRow>
              <DetailRow>
                <DetailLabel>Sifted Key Length:</DetailLabel>
                <DetailValue>{selectedDetail.sifted_key_length || 'N/A'} bits</DetailValue>
              </DetailRow>
              <DetailRow>
                <DetailLabel>Attack Type:</DetailLabel>
                <DetailValue>{selectedDetail.attack_type.replace('_', ' ')}</DetailValue>
              </DetailRow>
              <DetailRow>
                <DetailLabel>Attack Detected:</DetailLabel>
                <DetailValue>{selectedDetail.attack_detected ? 'Yes' : 'No'}</DetailValue>
              </DetailRow>
              <DetailRow>
                <DetailLabel>Duration:</DetailLabel>
                <DetailValue>{selectedDetail.duration}</DetailValue>
              </DetailRow>
            </DetailGrid>
          </DetailCard>
        </DetailModal>
      )}
    </ResultsContainer>
  );
};

export default Results;
