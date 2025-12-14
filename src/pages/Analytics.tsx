import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../api/axiosConfig';

const Analytics = () => {
    const [trends, setTrends] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTrends = async () => {
            try {
                const response = await api.get('/analytics/trends');
                // Convert Map Object { "2023-01-01": 500 } to Array [{ date: "2023-01-01", amount: 500 }]
                const data = Object.entries(response.data).map(([date, amount]) => ({
                    date,
                    amount
                })).sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());

                setTrends(data);
            } catch (err) {
                console.error('Failed to fetch trends', err);
            } finally {
                setLoading(false);
            }
        };
        fetchTrends();
    }, []);

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>

            <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
                <h3 className="mb-6 text-lg font-semibold text-gray-800">Spending Trends</h3>
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
                                    formatter={(value: number) => [`$${value.toFixed(2)}`, 'Amount']}
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
