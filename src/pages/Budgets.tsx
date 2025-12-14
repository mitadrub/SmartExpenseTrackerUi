import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../api/axiosConfig';
import { Plus, Tag, Loader2 } from 'lucide-react';

interface Category {
    id: number;
    name: string;
}

interface Budget {
    id: number;
    amount: number;
    month: string; // YYYY-MM
    category: Category | null;
}

const Budgets = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [budgets, setBudgets] = useState<Budget[]>([]);
    const [newCategory, setNewCategory] = useState('');
    const [loading, setLoading] = useState(true);
    const [adding, setAdding] = useState(false);
    const [error, setError] = useState('');

    // Budget Form State
    const [budgetForm, setBudgetForm] = useState({
        amount: '',
        month: new Date().toISOString().slice(0, 7), // YYYY-MM
        categoryId: ''
    });
    const [settingBudget, setSettingBudget] = useState(false);

    const fetchData = async () => {
        try {
            const [catRes, budgetRes] = await Promise.all([
                api.get('/categories'),
                api.get('/budgets')
            ]);
            setCategories(catRes.data);
            setBudgets(budgetRes.data);
        } catch (err) {
            console.error('Failed to fetch data', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleAddCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCategory.trim()) return;

        setAdding(true);
        setError('');
        try {
            const response = await api.post('/categories', { name: newCategory });
            setCategories([...categories, response.data]);
            setNewCategory('');
        } catch (err: any) {
            setError('Failed to add category');
            console.error(err);
        } finally {
            setAdding(false);
        }
    };

    const handleSetBudget = async (e: React.FormEvent) => {
        e.preventDefault();
        setSettingBudget(true);
        try {
            const payload = {
                amount: parseFloat(budgetForm.amount),
                month: budgetForm.month,
                category: budgetForm.categoryId ? { id: parseInt(budgetForm.categoryId) } : null
            };
            const response = await api.post('/budgets', payload);
            setBudgets([...budgets, response.data]);
            // Reset amount but keep month/category for convenience
            setBudgetForm(prev => ({ ...prev, amount: '' }));
        } catch (err) {
            console.error('Failed to set budget', err);
            alert('Failed to set budget');
        } finally {
            setSettingBudget(false);
        }
    };

    const handleBudgetChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setBudgetForm({ ...budgetForm, [e.target.name]: e.target.value });
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">Budgets & Categories</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Category Management Section */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex items-center gap-2 mb-6">
                        <Tag className="text-blue-600" size={24} />
                        <h2 className="text-lg font-bold text-gray-900">Categories</h2>
                    </div>

                    <form onSubmit={handleAddCategory} className="flex gap-2 mb-6">
                        <input
                            type="text"
                            value={newCategory}
                            onChange={(e) => setNewCategory(e.target.value)}
                            placeholder="New category name..."
                            className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                        <button
                            type="submit"
                            disabled={adding || !newCategory.trim()}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                        >
                            {adding ? <Loader2 className="animate-spin" /> : <Plus />}
                        </button>
                    </form>
                    {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

                    <div className="space-y-2 max-h-[400px] overflow-y-auto">
                        {loading ? (
                            <p className="text-gray-500 text-center">Loading categories...</p>
                        ) : categories.length === 0 ? (
                            <p className="text-gray-500 text-center">No categories found.</p>
                        ) : (
                            categories.map((cat, idx) => (
                                <motion.div
                                    key={cat.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg group hover:bg-gray-100 transition-colors"
                                >
                                    <span className="font-medium text-gray-700">{cat.name}</span>
                                    {/* Placeholder for delete/edit if API supports it */}
                                </motion.div>
                            ))
                        )}
                    </div>
                </div>

                {/* Placeholder for Budgets */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Monthly Budgets</h2>

                    {/* Set Budget Form */}
                    <form onSubmit={handleSetBudget} className="flex flex-col gap-3 mb-6 p-4 bg-gray-50 rounded-lg border border-gray-100">
                        <div className="flex gap-2">
                            <input
                                type="month"
                                name="month"
                                value={budgetForm.month}
                                onChange={handleBudgetChange}
                                className="px-3 py-2 border rounded-md text-sm outline-none w-40"
                                required
                            />
                            <select
                                name="categoryId"
                                value={budgetForm.categoryId}
                                onChange={handleBudgetChange}
                                className="flex-1 px-3 py-2 border rounded-md text-sm outline-none"
                            >
                                <option value="">Overall Budget (All Categories)</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex gap-2">
                            <input
                                type="number"
                                name="amount"
                                placeholder="Limit Amount ($)"
                                value={budgetForm.amount}
                                onChange={handleBudgetChange}
                                className="flex-1 px-3 py-2 border rounded-md text-sm outline-none"
                                required
                                min="0"
                                step="0.01"
                            />
                            <button
                                type="submit"
                                disabled={settingBudget}
                                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm font-medium disabled:opacity-50"
                            >
                                {settingBudget ? 'Saving...' : 'Set Budget'}
                            </button>
                        </div>
                    </form>

                    <div className="space-y-3 max-h-[400px] overflow-y-auto">
                        {budgets.length === 0 ? (
                            <p className="text-gray-500 text-center text-sm">No budgets set yet.</p>
                        ) : (
                            budgets.map((budget) => (
                                <div key={budget.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                                    <div>
                                        <p className="font-semibold text-gray-800">
                                            {budget.category ? budget.category.name : 'Overall Budget'}
                                        </p>
                                        <p className="text-xs text-gray-500">{budget.month}</p>
                                    </div>
                                    <div className="font-bold text-gray-900">
                                        ${budget.amount.toFixed(2)}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Budgets;
