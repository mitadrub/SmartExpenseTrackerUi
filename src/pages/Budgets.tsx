import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../api/axiosConfig';
import { Plus, Tag, Loader2 } from 'lucide-react';

interface Category {
    id: number;
    name: string;
}

const Budgets = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [newCategory, setNewCategory] = useState('');
    const [loading, setLoading] = useState(true);
    const [adding, setAdding] = useState(false);
    const [error, setError] = useState('');

    const fetchCategories = async () => {
        try {
            const response = await api.get('/categories');
            setCategories(response.data);
        } catch (err) {
            console.error('Failed to fetch categories', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
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
                <div className="bg-white rounded-xl shadow-sm p-6 opacity-75">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Monthly Budgets</h2>
                    <p className="text-gray-500">Budget management features are coming soon. You will be able to set limits for each category here.</p>
                </div>
            </div>
        </div>
    );
};

export default Budgets;
