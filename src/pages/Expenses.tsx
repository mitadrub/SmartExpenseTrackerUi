import React, { useEffect, useState } from 'react';
import api from '../api/axiosConfig';
import { Plus, Trash2, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import AddExpenseModal from '../components/AddExpenseModal';

interface Category {
    id: number;
    name: string;
}

interface Expense {
    id: number;
    description: string;
    amount: number;
    date: string; // ISO date
    category?: Category;
}

const Expenses = () => {
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Filter States
    const [categories, setCategories] = useState<Category[]>([]);
    const [filters, setFilters] = useState({
        from: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0], // Start of current year
        to: new Date(new Date().getFullYear(), 11, 31).toISOString().split('T')[0],   // End of current year
        categoryId: '',
        minAmount: '',
        maxAmount: ''
    });


    const fetchCategories = async () => {
        try {
            const response = await api.get('/categories');
            setCategories(response.data);
        } catch (err) {
            console.error('Failed to fetch categories', err);
        }
    };

    const fetchExpenses = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (filters.from) params.append('from', filters.from);
            if (filters.to) params.append('to', filters.to);
            if (filters.categoryId) params.append('category', filters.categoryId);
            if (filters.minAmount) params.append('minAmount', filters.minAmount);
            if (filters.maxAmount) params.append('maxAmount', filters.maxAmount);

            const response = await api.get(`/expenses?${params.toString()}`);
            console.log('API Response:', response.data);
            setExpenses(response.data);
        } catch (err: any) {
            console.error('Failed to fetch expenses', err);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const applyFilters = (e: React.FormEvent) => {
        e.preventDefault();
        fetchExpenses();
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
        fetchCategories();
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

            {/* Filters Section */}
            <form onSubmit={applyFilters} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">From Date</label>
                    <input
                        type="date"
                        name="from"
                        value={filters.from}
                        onChange={handleFilterChange}
                        className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">To Date</label>
                    <input
                        type="date"
                        name="to"
                        value={filters.to}
                        onChange={handleFilterChange}
                        className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Category</label>
                    <select
                        name="categoryId"
                        value={filters.categoryId}
                        onChange={handleFilterChange}
                        className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                        <option value="">All Categories</option>
                        {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                    </select>
                </div>
                <div className="flex gap-2">
                    <div className="flex-1">
                        <label className="block text-xs font-medium text-gray-700 mb-1">Min ₹</label>
                        <input
                            type="number"
                            name="minAmount"
                            placeholder="0"
                            value={filters.minAmount}
                            onChange={handleFilterChange}
                            className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                    <div className="flex-1">
                        <label className="block text-xs font-medium text-gray-700 mb-1">Max ₹</label>
                        <input
                            type="number"
                            name="maxAmount"
                            placeholder="Inf"
                            value={filters.maxAmount}
                            onChange={handleFilterChange}
                            className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                </div>
                <button
                    type="submit"
                    className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium"
                >
                    Apply Filters
                </button>
            </form>



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
                                        ₹{expense.amount.toFixed(2)}
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
