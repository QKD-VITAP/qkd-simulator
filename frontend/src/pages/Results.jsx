import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { BarChart3, Download, Eye, Filter, Search, Calendar, TrendingUp, AlertTriangle, RefreshCw } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, ScatterChart, Scatter } from 'recharts';
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
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const HeaderTitle = styled.h2`
  font-size: 24px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
`;

const HeaderStats = styled.div`
  display: flex;
  gap: 24px;
`;

const StatItem = styled.div`
  text-align: center;
`;

const StatValue = styled.div`
  font-size: 24px;
  font-weight: 700;
  color: #3b82f6;
`;

const StatLabel = styled.div`
  font-size: 14px;
  color: #64748b;
`;

const HeaderControls = styled.div`
  display: flex;
  gap: 16px;
`;

const Button = styled.button`
  padding: 12px 20px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const PrimaryButton = styled(Button)`
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(59, 130, 246, 0.3);
  }
`;

const SecondaryButton = styled(Button)`
  background: #f1f5f9;
  color: #475569;

  &:hover {
    background: #e2e8f0;
  }
`;

const FilterSection = styled.div`
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
`;

const FilterGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
`;

const FilterGroup = styled.div``;

const FilterLabel = styled.label`
  display: block;
  font-weight: 500;
  color: #374151;
  margin-bottom: 8px;
  font-size: 14px;
`;

const FilterInput = styled.input`
  width: 100%;
  padding: 10px 14px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const FilterSelect = styled.select`
  width: 100%;
  padding: 10px 14px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  background: white;
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
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

const ResultsTable = styled.div`
  overflow-x: auto;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const Th = styled.th`
  text-align: left;
  padding: 12px;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  font-weight: 600;
  color: #374151;
  font-size: 14px;
`;

const Td = styled.td`
  padding: 12px;
  border-bottom: 1px solid #f1f5f9;
  font-size: 14px;
  color: #475569;
`;

const StatusBadge = styled.span`
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  background: ${props => {
    switch (props.$status) {
      case 'completed': return '#dcfce7';
      case 'running': return '#dbeafe';
      case 'failed': return '#fee2e2';
      default: return '#f1f5f9';
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
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  padding: 6px;
  border-radius: 4px;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #f1f5f9;
    color: #374151;
  }
`;


const Results = () => {
  const [filters, setFilters] = useState({
    status: 'all',
    attack_type: 'all',
    date_from: '',
    date_to: '',
    min_qber: '',
    max_qber: ''
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
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
        console.error('Failed to fetch results:', err);
        setError('Unable to load simulation results');
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
    
    const interval = setInterval(fetchResults, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

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
      const details = `
Simulation Details:
- ID: ${simulation.id}
- Timestamp: ${new Date(simulation.timestamp).toLocaleString()}
- Status: ${simulation.status}
- QBER: ${simulation.qber !== null ? `${(simulation.qber * 100).toFixed(2)}%` : 'N/A'}
- Final Key Length: ${simulation.key_length || 'N/A'} bits
- Raw Key Length: ${simulation.raw_key_length || 'N/A'} bits
- Sifted Key Length: ${simulation.sifted_key_length || 'N/A'} bits
- Attack Type: ${simulation.attack_type.replace('_', ' ')}
- Attack Detected: ${simulation.attack_detected ? 'Yes' : 'No'}
- Duration: ${simulation.duration}
      `;
      alert(details);
    }
  };

  const filteredResults = results.filter(result => {
    if (filters.status !== 'all' && result.status !== filters.status) return false;
    if (filters.attack_type !== 'all' && result.attack_type !== filters.attack_type) return false;
    if (searchTerm && !result.id.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

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
        <HeaderLeft>
          <HeaderTitle>Simulation Results</HeaderTitle>
                     <HeaderStats>
             <StatItem>
               <StatValue>{results.length}</StatValue>
               <StatLabel>Total Simulations</StatLabel>
             </StatItem>
             <StatItem>
               <StatValue>{results.filter(r => r.status === 'completed').length}</StatValue>
               <StatLabel>Completed</StatLabel>
             </StatItem>
             <StatItem>
               <StatValue>{results.filter(r => r.qber !== null).length > 0 ? (results.filter(r => r.qber !== null).reduce((acc, r) => acc + r.qber, 0) / results.filter(r => r.qber !== null).length * 100).toFixed(2) : '0.00'}%</StatValue>
               <StatLabel>Avg QBER</StatLabel>
             </StatItem>
           </HeaderStats>
        </HeaderLeft>
        
        <HeaderControls>
          <SecondaryButton onClick={() => window.location.reload()}>
            <RefreshCw size={16} />
            Refresh
          </SecondaryButton>
          <SecondaryButton>
            <Filter size={16} />
            Filters
          </SecondaryButton>
          <PrimaryButton onClick={exportResults}>
            <Download size={16} />
            Export
          </PrimaryButton>
        </HeaderControls>
      </ResultsHeader>

      <FilterSection>
        <CardTitle>
          <Filter size={20} />
          Filter Results
        </CardTitle>
        
        <FilterGrid>
          <FilterGroup>
            <FilterLabel>Status</FilterLabel>
            <FilterSelect
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="running">Running</option>
              <option value="failed">Failed</option>
            </FilterSelect>
          </FilterGroup>

          <FilterGroup>
            <FilterLabel>Attack Type</FilterLabel>
            <FilterSelect
              value={filters.attack_type}
              onChange={(e) => handleFilterChange('attack_type', e.target.value)}
            >
              <option value="all">All Types</option>
              <option value="none">No Attack</option>
              <option value="intercept_resend">Intercept-Resend</option>
              <option value="photon_number_splitting">Photon Number Splitting</option>
              <option value="detector_blinding">Detector Blinding</option>
            </FilterSelect>
          </FilterGroup>

          <FilterGroup>
            <FilterLabel>Date From</FilterLabel>
            <FilterInput
              type="date"
              value={filters.date_from}
              onChange={(e) => handleFilterChange('date_from', e.target.value)}
            />
          </FilterGroup>

          <FilterGroup>
            <FilterLabel>Date To</FilterLabel>
            <FilterInput
              type="date"
              value={filters.date_to}
              onChange={(e) => handleFilterChange('date_to', e.target.value)}
            />
          </FilterGroup>

          <FilterGroup>
            <FilterLabel>Min QBER (%)</FilterLabel>
            <FilterInput
              type="number"
              placeholder="0.0"
              value={filters.min_qber}
              onChange={(e) => handleFilterChange('min_qber', e.target.value)}
            />
          </FilterGroup>

          <FilterGroup>
            <FilterLabel>Max QBER (%)</FilterLabel>
            <FilterInput
              type="number"
              placeholder="10.0"
              value={filters.max_qber}
              onChange={(e) => handleFilterChange('max_qber', e.target.value)}
            />
          </FilterGroup>
        </FilterGrid>

        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
            <FilterInput
              type="text"
              placeholder="Search by simulation ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '40px' }}
            />
          </div>
        </div>
      </FilterSection>

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
              {filteredResults.map(result => (
                <tr key={result.id}>
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
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <ActionButton onClick={() => viewDetails(result.id)}>
                        <Eye size={16} />
                      </ActionButton>
                      <ActionButton>
                        <Download size={16} />
                      </ActionButton>
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </ResultsTable>
      </ResultsCard>
    </ResultsContainer>
  );
};

export default Results;
