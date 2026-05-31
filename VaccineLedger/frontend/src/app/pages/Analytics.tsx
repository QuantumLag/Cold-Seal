import { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { mockShipments } from '../data/mockData';

export default function Analytics() {
  const [tempHistory, setTempHistory] = useState(() =>
    Array.from({ length: 20 }, (_, i) => ({
      id: `temp-${i}`,
      time: `${20 - i}m`,
      temp: 2 + Math.random() * 1.5,
      humidity: 43 + Math.random() * 5
    }))
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setTempHistory(prev => {
        const newHistory = [...prev.slice(1)];
        newHistory.push({
          id: `temp-${Date.now()}`,
          time: '0m',
          temp: 2 + Math.random() * 2 - 0.5,
          humidity: 43 + Math.random() * 6
        });
        return newHistory.map((item, i) => ({
          ...item,
          time: `${newHistory.length - i}m`
        }));
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const qualityDistribution = [
    { range: '95-100%', count: mockShipments.filter(s => s.qualityScore >= 95).length, color: '#10b981' },
    { range: '85-94%', count: mockShipments.filter(s => s.qualityScore >= 85 && s.qualityScore < 95).length, color: '#0891b2' },
    { range: '70-84%', count: mockShipments.filter(s => s.qualityScore >= 70 && s.qualityScore < 85).length, color: '#f59e0b' },
    { range: '50-69%', count: mockShipments.filter(s => s.qualityScore >= 50 && s.qualityScore < 70).length, color: '#ef4444' },
    { range: '0-49%', count: mockShipments.filter(s => s.qualityScore < 50).length, color: '#991b1b' },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold mb-2">Analytics</h1>
        <p className="text-muted-foreground">Detailed charts and insights</p>
      </div>

      <div className="grid gap-6">
        {/* Temperature Chart */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="mb-6">
            <h3 className="font-semibold mb-1">Temperature Monitoring</h3>
            <p className="text-sm text-muted-foreground">Real-time temperature data (last 20 minutes)</p>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={tempHistory}>
              <defs>
                <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" vertical={false} />
              <XAxis
                dataKey="time"
                stroke="#a3a3a3"
                style={{ fontSize: '12px', fontFamily: 'Inter' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                stroke="#a3a3a3"
                style={{ fontSize: '12px', fontFamily: 'JetBrains Mono' }}
                domain={[0, 5]}
                axisLine={false}
                tickLine={false}
                label={{ value: '°C', position: 'insideLeft', style: { fontSize: '12px' } }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e5e5e5',
                  borderRadius: '8px',
                  fontSize: '12px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                }}
                labelStyle={{ color: '#737373', fontFamily: 'Inter', fontWeight: '500' }}
              />
              <Area type="monotone" dataKey="temp" stroke="#3b82f6" fill="url(#tempGradient)" strokeWidth={2} isAnimationActive={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Humidity Chart */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="mb-6">
            <h3 className="font-semibold mb-1">Humidity Monitoring</h3>
            <p className="text-sm text-muted-foreground">Real-time humidity data (last 20 minutes)</p>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={tempHistory}>
              <defs>
                <linearGradient id="humidityGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" vertical={false} />
              <XAxis
                dataKey="time"
                stroke="#a3a3a3"
                style={{ fontSize: '12px', fontFamily: 'Inter' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                stroke="#a3a3a3"
                style={{ fontSize: '12px', fontFamily: 'JetBrains Mono' }}
                domain={[40, 55]}
                axisLine={false}
                tickLine={false}
                label={{ value: '%', position: 'insideLeft', style: { fontSize: '12px' } }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e5e5e5',
                  borderRadius: '8px',
                  fontSize: '12px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                }}
                labelStyle={{ color: '#737373', fontFamily: 'Inter', fontWeight: '500' }}
              />
              <Area type="monotone" dataKey="humidity" stroke="#06b6d4" fill="url(#humidityGradient)" strokeWidth={2} isAnimationActive={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Quality Distribution */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="mb-6">
            <h3 className="font-semibold mb-1">Quality Score Distribution</h3>
            <p className="text-sm text-muted-foreground">Shipment quality across all batches</p>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={qualityDistribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" vertical={false} />
              <XAxis
                dataKey="range"
                stroke="#a3a3a3"
                style={{ fontSize: '12px', fontFamily: 'Inter' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                stroke="#a3a3a3"
                style={{ fontSize: '12px', fontFamily: 'JetBrains Mono' }}
                axisLine={false}
                tickLine={false}
                label={{ value: 'Shipments', angle: -90, position: 'insideLeft', style: { fontSize: '12px' } }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e5e5e5',
                  borderRadius: '8px',
                  fontSize: '12px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                }}
                cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
              />
              <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                {qualityDistribution.map((entry, index) => (
                  <rect key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
