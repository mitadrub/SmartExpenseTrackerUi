import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../api/axiosConfig';

const Analytics = () => {
    const [trends, setTrends] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState({
        from: new Date(new Date().setMonth(new Date().getMonth() - 3)).toISOString().split('T')[0],
        to: new Date().toISOString().split('T')[0]
    });
    const [granularity, setGranularity] = useState<'day' | 'week' | 'month'>('day');

    const fetchTrends = async (start: string, end: string) => {
        setLoading(true);
        try {
            const response = await api.get(`/analytics/trends?from=${start}&to=${end}`);
            // Convert Map Object { "2023-01-01": 500 } to Array
            const rawData = Object.entries(response.data).map(([date, amount]) => ({
                date,
                amount: Number(amount)
            })).sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());

            const processedData = processData(rawData, granularity);
            setTrends(processedData);
        } catch (err) {
            console.error('Failed to fetch trends', err);
        } finally {
            setLoading(false);
        }
    };

    const processData = (data: any[], groupBy: 'day' | 'week' | 'month') => {
        if (groupBy === 'day') return data;

        const grouped: { [key: string]: number } = {};
        data.forEach(item => {
            const date = new Date(item.date);
            let key = item.date;
            if (groupBy === 'week') {
                // Get Monday of the week
                const day = date.getDay() || 7;
                if (day !== 1) date.setHours(-24 * (day - 1));
                key = date.toISOString().split('T')[0];
            } else if (groupBy === 'month') {
                key = item.date.substring(0, 7); // YYYY-MM
            }
            grouped[key] = (grouped[key] || 0) + item.amount;
        });

        return Object.entries(grouped).map(([date, amount]) => ({ date, amount }))
            .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
    };

    useEffect(() => {
        fetchTrends(dateRange.from, dateRange.to);
    }, [dateRange, granularity]); // Refetch/Reprocess on change

    const handleQuickSelect = (days: number) => {
        const to = new Date().toISOString().split('T')[0];
        const from = new Date(new Date().setDate(new Date().getDate() - days)).toISOString().split('T')[0];
        setDateRange({ from, to });
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>

            <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                    <h3 className="text-lg font-semibold text-gray-800">Spending Trends</h3>

                    <div className="flex flex-wrap gap-2 items-center">
                        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
                            {(['day', 'week', 'month'] as const).map(g => (
                                <button
                                    key={g}
                                    onClick={() => setGranularity(g)}
                                    className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${granularity === g ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    {g.charAt(0).toUpperCase() + g.slice(1)}
                                </button>
                            ))}
                        </div>

                        <div className="flex gap-2 text-sm">
                            <input
                                type="date"
                                value={dateRange.from}
                                onChange={e => setDateRange({ ...dateRange, from: e.target.value })}
                                className="border rounded px-2 py-1 outline-none focus:border-blue-500"
                            />
                            <span className="self-center text-gray-400">-</span>
                            <input
                                type="date"
                                value={dateRange.to}
                                onChange={e => setDateRange({ ...dateRange, to: e.target.value })}
                                className="border rounded px-2 py-1 outline-none focus:border-blue-500"
                            />
                        </div>

                        <div className="flex gap-1">
                            <button onClick={() => handleQuickSelect(30)} className="px-3 py-1 text-xs bg-gray-50 hover:bg-gray-100 border rounded text-gray-600">30D</button>
                            <button onClick={() => handleQuickSelect(90)} className="px-3 py-1 text-xs bg-gray-50 hover:bg-gray-100 border rounded text-gray-600">90D</button>
                        </div>
                    </div>
                </div>
                <div className="h-80">
                    {loading ? (
                        <div className="flex h-full items-center justify-center text-gray-500">Loading charts...</div>
                    ) : trends.length === 0 ? (
                        <div className="flex h-full items-center justify-center text-gray-500">No data available for trends</div>
                    ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={trends}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis
                                    dataKey="date"
                                    axisLine={false}
                                    tickLine={false}
                                    dy={10}
                                    tickFormatter={(value) => new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                />
                                <YAxis axisLine={false} tickLine={false} dx={-10} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    labelFormatter={(value) => new Date(value).toLocaleDateString()}
                                    formatter={(value: number) => [`₹${value.toFixed(2)}`, 'Amount']}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="amount"
                                    stroke="#2563eb"
                                    strokeWidth={3}
                                    dot={{ r: 4, fill: '#2563eb', strokeWidth: 2, stroke: '#fff' }}
                                    activeDot={{ r: 6 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Analytics;
