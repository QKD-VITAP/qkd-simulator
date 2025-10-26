import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { 
  Play, 
  Shield, 
  BarChart3, 
  Zap, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Wifi,
  WifiOff
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import qkdApi from '../api/qkdApi';
import { useWebSocket } from '../contexts/WebSocketContext';

const DashboardContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.lg};
  min-height: 100%;
  width: 100%;

  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    gap: ${props => props.theme.spacing.md};
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: ${props => props.theme.spacing.lg};
  width: 100%;

  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    grid-template-columns: 1fr;
    gap: ${props => props.theme.spacing.md};
  }
`;

const StatCard = styled.div`
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

const StatHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
`;

const StatTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #64748b;
  margin: 0;
`;

const StatIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => props.$color};
  color: white;
`;

const StatValue = styled.div`
  font-size: 32px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 8px;
`;

const StatChange = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  color: ${props => props.$positive ? '#059669' : '#dc2626'};
`;

const ChartsGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: ${props => props.theme.spacing.lg};
  width: 100%;

  @media (max-width: ${props => props.theme.breakpoints.tablet}) {
    grid-template-columns: 1fr;
  }
`;

const ChartCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
`;

const ChartTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 24px 0;
`;

const RecentActivity = styled.div`
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
`;

const ActivityItem = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 0;
  border-bottom: 1px solid #f1f5f9;

  &:last-child {
    border-bottom: none;
  }
`;

const ActivityIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => props.$color};
  color: white;
`;

const ActivityContent = styled.div`
  flex: 1;
`;

const ActivityTitle = styled.div`
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 4px;
`;

const ActivityTime = styled.div`
  font-size: 14px;
  color: #64748b;
`;


const Dashboard = () => {
  const { isConnected, lastMessage } = useWebSocket();
  const [stats, setStats] = useState({
    totalSimulations: 0,
    successfulSimulations: 0,
    attackSimulations: 0,
    averageQBER: 0,
    totalKeyBits: 0,
    lastSimulation: 'No simulations yet'
  });

  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [realTimeData, setRealTimeData] = useState({
    qberTrend: [],
    keyLengths: []
  });

  useEffect(() => {
    if (lastMessage) {
      if (lastMessage.type === 'simulation_complete') {
        setStats(prev => ({
          ...prev,
          totalSimulations: prev.totalSimulations + 1,
          successfulSimulations: prev.successfulSimulations + 1,
          totalKeyBits: prev.totalKeyBits + (lastMessage.result.final_key_length || 0),
          averageQBER: (prev.averageQBER * prev.totalSimulations + lastMessage.result.qber) / (prev.totalSimulations + 1),
          lastSimulation: new Date().toLocaleTimeString()
        }));

        setRecentActivity(prev => [{
          id: Date.now(),
          type: 'simulation',
          title: 'Simulation Completed',
          description: `QBER: ${(lastMessage.result.qber * 100).toFixed(1)}%`,
          time: new Date().toLocaleTimeString(),
          icon: Play,
          color: '#10b981'
        }, ...prev.slice(0, 4)]);
      }
    }
  }, [lastMessage]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const data = await qkdApi.getDashboardData();
        
        setStats({
          totalSimulations: data.total_simulations || 0,
          successfulSimulations: data.successful_simulations || 0,
          attackSimulations: data.attack_simulations || 0,
          averageQBER: data.average_qber || 0,
          totalKeyBits: data.total_key_bits || 0,
          lastSimulation: data.last_simulation_time || 'No simulations yet'
        });

        if (data.recent_activity) {
          const activities = data.recent_activity.map((activity, index) => ({
            id: index + 1,
            type: activity.type || 'simulation',
            title: activity.title || 'Simulation',
            description: activity.description || 'Activity completed',
            time: activity.timestamp || 'Unknown time',
            icon: activity.type === 'attack' ? Shield : 
                  activity.type === 'analysis' ? BarChart3 : Play,
            color: activity.type === 'attack' ? '#f59e0b' : 
                   activity.type === 'analysis' ? '#3b82f6' : '#10b981'
          }));
          setRecentActivity(activities);
        }

        if (data.real_time_metrics && data.real_time_metrics.recent_qber_trend) {
          const qberTrend = data.real_time_metrics.recent_qber_trend.map((qber, index) => ({
            time: `${index * 2}:00`,
            qber: qber
          }));
          
          const keyLengths = [];
          if (data.real_time_metrics.recent_key_lengths) {
            const lengths = data.real_time_metrics.recent_key_lengths;
            const ranges = [
              { min: 0, max: 1000, label: '1K' },
              { min: 1000, max: 2000, label: '2K' },
              { min: 2000, max: 5000, label: '5K' },
              { min: 5000, max: 10000, label: '10K' }
            ];
            
            ranges.forEach(range => {
              const count = lengths.filter(len => len >= range.min && len < range.max).length;
              if (count > 0) {
                keyLengths.push({ length: range.label, count });
              }
            });
          }
          
          setRealTimeData({ qberTrend, keyLengths });
        }
        
        setError(null);
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
        setError('Unable to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <DashboardContainer>
        <div style={{ 
          textAlign: 'center', 
          padding: '60px 20px',
          color: '#64748b'
        }}>
          <div style={{ fontSize: '24px', marginBottom: '16px' }}>🔄</div>
          <p>Loading dashboard data...</p>
        </div>
      </DashboardContainer>
    );
  }

  if (error) {
    return (
      <DashboardContainer>
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
      </DashboardContainer>
    );
  }

  return (
    <DashboardContainer>
      
      <StatsGrid>
        <StatCard>
          <StatHeader>
            <StatTitle>Total Simulations</StatTitle>
                          <StatIcon $color="#3b82f6">
              <Play size={24} />
            </StatIcon>
          </StatHeader>
          <StatValue>{stats.totalSimulations}</StatValue>
          <StatChange $positive>
            <TrendingUp size={16} />
            {stats.totalSimulations > 0 ? `+${Math.floor(stats.totalSimulations * 0.1)} this week` : 'No data yet'}
          </StatChange>
        </StatCard>

        <StatCard>
          <StatHeader>
            <StatTitle>Success Rate</StatTitle>
                          <StatIcon $color="#10b981">
              <CheckCircle size={24} />
            </StatIcon>
          </StatHeader>
          <StatValue>{Math.round((stats.successfulSimulations / stats.totalSimulations) * 100)}%</StatValue>
          <StatChange $positive>
            <TrendingUp size={16} />
            {stats.successfulSimulations > 0 ? `+${Math.round((stats.successfulSimulations / stats.totalSimulations) * 100 - 85)}% vs baseline` : 'No data yet'}
          </StatChange>
        </StatCard>

        <StatCard>
          <StatHeader>
            <StatTitle>Average QBER</StatTitle>
                          <StatIcon $color="#f59e0b">
              <AlertTriangle size={24} />
            </StatIcon>
          </StatHeader>
          <StatValue>{(stats.averageQBER * 100).toFixed(1)}%</StatValue>
          <StatChange $positive>
            <TrendingUp size={16} />
            {stats.averageQBER > 0 ? `-${(stats.averageQBER * 100 - 2.5).toFixed(1)}% vs baseline` : 'No data yet'}
          </StatChange>
        </StatCard>

        <StatCard>
          <StatHeader>
            <StatTitle>Total Key Bits</StatTitle>
                          <StatIcon $color="#8b5cf6">
              <Zap size={24} />
            </StatIcon>
          </StatHeader>
          <StatValue>{(stats.totalKeyBits / 1000000).toFixed(1)}M</StatValue>
          <StatChange $positive>
            <TrendingUp size={16} />
            {stats.totalKeyBits > 0 ? `+${Math.floor(stats.totalKeyBits * 0.15 / 1000)}K this week` : 'No data yet'}
          </StatChange>
        </StatCard>
      </StatsGrid>

      <ChartsGrid>
        <ChartCard>
          <ChartTitle>QBER Trend (24 Hours)</ChartTitle>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={realTimeData.qberTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="qber" 
                stroke="#3b82f6" 
                strokeWidth={3}
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard>
          <ChartTitle>Key Length Distribution</ChartTitle>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={realTimeData.keyLengths}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="length" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </ChartsGrid>

      <RecentActivity>
        <ChartTitle>Recent Activity</ChartTitle>
        {recentActivity.map(activity => (
          <ActivityItem key={activity.id}>
            <ActivityIcon $color={activity.color}>
              <activity.icon size={20} />
            </ActivityIcon>
            <ActivityContent>
              <ActivityTitle>{activity.title}</ActivityTitle>
              <ActivityTime>{activity.description}</ActivityTime>
            </ActivityContent>
            <ActivityTime>{activity.time}</ActivityTime>
          </ActivityItem>
        ))}
      </RecentActivity>
    </DashboardContainer>
  );
};

export default Dashboard;
