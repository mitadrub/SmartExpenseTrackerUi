const axios = require('axios');

async function testApi() {
    try {
        // 1. Register/Login to get token
        console.log('Logging in...');
        // Try login first
        let token;
        try {
            const loginRes = await axios.post('http://localhost:8080/api/v1/auth/login', {
                username: 'testuser',
                password: 'password'
            });
            token = loginRes.data.token;
        } catch (e) {
            // Register if login fails
            console.log('Login failed, registering...');
            await axios.post('http://localhost:8080/api/v1/auth/register', {
                username: 'testuser',
                password: 'password'
            });
            const loginRes = await axios.post('http://localhost:8080/api/v1/auth/login', {
                username: 'testuser',
                password: 'password'
            });
            token = loginRes.data.token;
        }

        console.log('Got token:', token ? 'Yes' : 'No');

        const api = axios.create({
            baseURL: 'http://localhost:8080/api/v1',
            headers: { Authorization: `Bearer ${token}` }
        });

        // 2. Add Expense
        console.log('Adding expense...');
        const expense = {
            description: 'Debug Expense',
            amount: 123.45,
            date: '2025-12-13'
        };
        const createRes = await api.post('/expenses', expense);
        console.log('Expense Created:', createRes.data.id);

        // 3. Fetch Expenses (current month default)
        console.log('Fetching default expenses...');
        const listRes = await api.get('/expenses');
        console.log('Default List Count:', listRes.data.length);
        if (listRes.data.length > 0) console.log('First Item:', listRes.data[0]);

        // 4. Fetch Expenses (Wide Range)
        console.log('Fetching wide range expenses...');
        const wideRes = await api.get('/expenses?from=2025-01-01&to=2025-12-31');
        console.log('Wide List Count:', wideRes.data.length);

    } catch (err) {
        console.error('Error:', err.message);
        if (err.response) {
            console.error('Status:', err.response.status);
            console.error('Data:', err.response.data);
        }
    }
}

testApi();
