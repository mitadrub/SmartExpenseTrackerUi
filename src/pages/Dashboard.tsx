import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import api from '../api/axiosConfig';
import { AnalyticsSummary } from '../api/types';
import { TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';

const Dashboard = () => {
    const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
    const [alerts, setAlerts] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [summaryRes, alertsRes] = await Promise.all([
                    api.get('/analytics/summary'),
                    api.get('/alerts')
                ]);
                setSummary(summaryRes.data);
                setAlerts(alertsRes.data);
            } catch (err) {
                console.error('Failed to fetch dashboard data', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <div className="p-8">Loading dashboard...</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            </div>

            {alerts.length > 0 && (
                <div className="space-y-2">
                    {alerts.map((alert, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="p-4 bg-red-50 text-red-700 rounded-lg flex items-center gap-3 border border-red-100"
                        >
                            <AlertTriangle size={20} />
                            {alert}
                        </motion.div>
                    ))}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-gray-500 text-sm font-medium">Total Expenses</h3>
                    <p className="text-3xl font-bold text-gray-900 mt-2">
                        ₹{summary?.total?.toFixed(2) || '0.00'}
                    </p>
                    <div className="mt-4 flex items-center text-sm">
                        {summary?.monthOverMonthChange && summary.monthOverMonthChange > 0 ? (
                            <span className="flex items-center text-red-500">
                                <TrendingUp size={16} className="mr-1" />
                                +{summary.monthOverMonthChange}% from last month
                            </span>
                        ) : (
                            <span className="flex items-center text-green-500">
                                <TrendingDown size={16} className="mr-1" />
                                {summary?.monthOverMonthChange || 0}% from last month
                            </span>
                        )}
                    </div>
                </motion.div>

                {/* Placeholder for Budget Status - needs Budget API integration */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-gray-500 text-sm font-medium">Top Category</h3>
                    <p className="text-xl font-bold text-gray-900 mt-2 truncate">
                        {summary?.byCategory ? Object.entries(summary.byCategory).sort((a: any, b: any) => b[1] - a[1])[0]?.[0] || 'None' : 'None'}
                    </p>
                </motion.div>
            </div>
        </div>
    );
};

export default Dashboard;
