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
    const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
    const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
    const [amount, setAmount] = useState('');
    const [editingId, setEditingId] = useState<number | null>(null);
    const [saving, setSaving] = useState(false);

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

    // Effect to check for existing budget when selection changes
    useEffect(() => {
        const existingInfo = budgets.find(b =>
            b.month === selectedMonth &&
            (selectedCategoryId ? b.category?.id === parseInt(selectedCategoryId) : b.category === null)
        );

        if (existingInfo) {
            setAmount(existingInfo.amount.toString());
            setEditingId(existingInfo.id);
        } else {
            setAmount('');
            setEditingId(null);
        }
    }, [selectedMonth, selectedCategoryId, budgets]);

    const filteredBudgets = budgets.filter(b => b.month === selectedMonth);

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

    const handleDeleteBudget = async () => {
        if (!editingId) return;
        if (!window.confirm('Are you sure you want to delete this budget?')) return;

        try {
            await api.delete(`/budgets/${editingId}`);
            setBudgets(prev => prev.filter(b => b.id !== editingId));
            setAmount('');
            setEditingId(null);
        } catch (err) {
            console.error('Failed to delete budget', err);
            alert('Failed to delete budget');
        }
    };

    const handleSaveBudget = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const payload = {
                amount: parseFloat(amount),
                month: selectedMonth,
                category: selectedCategoryId ? { id: parseInt(selectedCategoryId) } : null
            };

            let updatedBudget: Budget;
            if (editingId) {
                // Update existing
                const response = await api.put(`/budgets/${editingId}`, payload);
                updatedBudget = response.data;
                setBudgets(prev => prev.map(b => b.id === editingId ? updatedBudget : b));
            } else {
                // Create new
                const response = await api.post('/budgets', payload);
                updatedBudget = response.data;
                setBudgets(prev => [...prev, updatedBudget]);
            }

            // Logic handled by useEffect will update state, but we might want to ensure it reflects
        } catch (err) {
            console.error('Failed to save budget', err);
            alert('Failed to save budget');
        } finally {
            setSaving(false);
        }
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

                    {/* Budget Form */}
                    <form onSubmit={handleSaveBudget} className="flex flex-col gap-3 mb-6 p-4 bg-gray-50 rounded-lg border border-gray-100">
                        <div className="flex gap-2">
                            <input
                                type="month"
                                value={selectedMonth}
                                onChange={(e) => setSelectedMonth(e.target.value)}
                                className="px-3 py-2 border rounded-md text-sm outline-none w-40"
                                required
                            />
                            <select
                                value={selectedCategoryId}
                                onChange={(e) => setSelectedCategoryId(e.target.value)}
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
                                placeholder="Limit Amount ($)"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="flex-1 px-3 py-2 border rounded-md text-sm outline-none"
                                required
                                min="0"
                                step="0.01"
                            />
                            <button
                                type="submit"
                                disabled={saving}
                                className={`px-4 py-2 text-white rounded-md text-sm font-medium disabled:opacity-50 transition-colors ${editingId ? 'bg-orange-600 hover:bg-orange-700' : 'bg-green-600 hover:bg-green-700'
                                    }`}
                            >
                                {saving ? 'Saving...' : editingId ? 'Update Limit' : 'Set Limit'}
                            </button>
                            {editingId && (
                                <button
                                    type="button"
                                    onClick={handleDeleteBudget}
                                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm font-medium transition-colors"
                                >
                                    Delete
                                </button>
                            )}
                        </div>
                    </form>

                    <div className="space-y-3 max-h-[400px] overflow-y-auto">
                        {filteredBudgets.length === 0 ? (
                            <p className="text-gray-500 text-center text-sm">No budgets set for {selectedMonth}.</p>
                        ) : (
                            filteredBudgets.map((budget) => (
                                <div key={budget.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                                    <div>
                                        <p className="font-semibold text-gray-800">
                                            {budget.category ? budget.category.name : 'Overall Budget'}
                                        </p>
                                        <p className="text-xs text-gray-500">{budget.month}</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="font-bold text-gray-900">
                                            ${budget.amount.toFixed(2)}
                                        </div>
                                        <button
                                            onClick={() => {
                                                setSelectedMonth(budget.month);
                                                setSelectedCategoryId(budget.category ? budget.category.id.toString() : '');
                                            }}
                                            className="text-xs text-blue-600 hover:underline"
                                        >
                                            Edit
                                        </button>
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
