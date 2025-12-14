import React, { useEffect, useState } from 'react';
import api from '../api/axiosConfig';
import { Plus, Trash2, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import AddExpenseModal from '../components/AddExpenseModal';

interface Expense {
    id: number;
    description: string;
    amount: number;
    date: string; // ISO date
    category?: {
        id: number;
        name: string;
    };
}

const Expenses = () => {
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [debugInfo, setDebugInfo] = useState<string>('');

    const fetchExpenses = async () => {
        try {
            // Fetch expenses for a wide range to ensure visibility
            const now = new Date();
            // Helper to format as YYYY-MM-DD local
            const formatDate = (d: Date) => {
                const year = d.getFullYear();
                const month = String(d.getMonth() + 1).padStart(2, '0');
                const day = String(d.getDate()).padStart(2, '0');
                return `${year}-${month}-${day}`;
            };

            const fromDate = formatDate(new Date(now.getFullYear(), 0, 1));
            const toDate = formatDate(new Date(now.getFullYear(), 11, 31));

            const url = `/expenses?from=${fromDate}&to=${toDate}`;
            const response = await api.get(url);

            console.log('API Response:', response.data);
            setDebugInfo(JSON.stringify(response.data, null, 2));
            setExpenses(response.data);
        } catch (err: any) {
            console.error('Failed to fetch expenses', err);
            setDebugInfo('Error: ' + (err.response?.data?.message || err.message));
        } finally {
            setLoading(false);
        }
    };

    const deleteExpense = async (id: number) => {
        if (!window.confirm('Are you sure you want to delete this expense?')) return;
        try {
            await api.delete(`/expenses/${id}`);
            // Optimistic update or refetch
            setExpenses(prev => prev.filter(e => e.id !== id));
        } catch (err) {
            console.error('Failed to delete expense', err);
        }
    };

    useEffect(() => {
        fetchExpenses();
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">Expenses</h1>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <Plus size={20} />
                    Add Expense
                </button>
            </div>

            {/* Debug Info Block */}
            <div className="p-4 bg-gray-100 rounded text-xs font-mono overflow-auto max-h-40 border border-gray-300">
                <p className="font-bold text-gray-700">Debug Data Raw:</p>
                <pre>{debugInfo || 'No data fetched yet'}</pre>
            </div>

            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                {loading ? (
                    <div className="p-6 text-center text-gray-500">Loading expenses...</div>
                ) : expenses.length === 0 ? (
                    <div className="p-6 text-center text-gray-500">No expenses found. Add one to get started!</div>
                ) : (
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="px-6 py-3 text-xs font-semibold tracking-wider text-gray-500 uppercase">Description</th>
                                <th className="px-6 py-3 text-xs font-semibold tracking-wider text-gray-500 uppercase">Category</th>
                                <th className="px-6 py-3 text-xs font-semibold tracking-wider text-gray-500 uppercase">Date</th>
                                <th className="px-6 py-3 text-xs font-semibold tracking-wider text-right text-gray-500 uppercase">Amount</th>
                                <th className="px-6 py-3 text-xs font-semibold tracking-wider text-gray-500 uppercase"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {expenses.map((expense, index) => (
                                <motion.tr
                                    key={expense.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="hover:bg-gray-50 transition-colors"
                                >
                                    <td className="px-6 py-4 font-medium text-gray-900">{expense.description}</td>
                                    <td className="px-6 py-4 text-gray-500">{expense.category?.name || '-'}</td>
                                    <td className="px-6 py-4 text-gray-500">
                                        <div className="flex items-center gap-2">
                                            <Calendar size={14} />
                                            {new Date(expense.date).toLocaleDateString()}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-semibold text-right text-gray-900">
                                        ${expense.amount.toFixed(2)}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => deleteExpense(expense.id)}
                                            className="text-red-400 hover:text-red-600 transition-colors"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            <AddExpenseModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onExpenseAdded={fetchExpenses}
            />
        </div>
    );
};
export default Expenses;
