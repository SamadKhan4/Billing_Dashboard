/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, FileText, DollarSign, UserCheck, Repeat,
} from 'lucide-react';

const AdminPanel = () => {
  const [totalCustomers, setTotalCustomers] = useState(null);
  const [totalBills, setTotalBills] = useState(null);
  const [totalSales, setTotalSales] = useState(null);
  const [totalEditors, setTotalEditors] = useState(null);
  const [topEditors, setTopEditors] = useState([]);
  const [topCustomers, setTopCustomers] = useState([]);
  const [weeklySales, setWeeklySales] = useState(0);
  const [exchangeCount, setExchangeCount] = useState(0);
  const [returnCount, setReturnCount] = useState(0);
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();
  const API_BASE = 'http://localhost:5000';

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        const storedUsername = localStorage.getItem('username');
        if (!token) throw new Error('Not authenticated');
        if (storedUsername) setUsername(storedUsername);

        const [
          resSummary,
          resCustomers,
          resEditors,
          resTopEditors,
          resTopCustomers,
          resWeeklySales,
          resExchangeCount,
          resReturnCount,
        ] = await Promise.all([
          fetch(`${API_BASE}/api/bills/summary`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_BASE}/api/bills/unique-customers`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_BASE}/users/editors-count`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_BASE}/api/bills/top-editors`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_BASE}/api/bills/top-customers`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_BASE}/api/bills/weekly-sales`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_BASE}/api/bills/count/exchange`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_BASE}/api/bills/count/return`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        const summary = await resSummary.json();
        const customerData = await resCustomers.json();
        const editorData = await resEditors.json();
        const topEditorsData = await resTopEditors.json();
        const topCustomersData = await resTopCustomers.json();
        const weeklySalesData = await resWeeklySales.json();
        const exchangeData = await resExchangeCount.json();
        const returnData = await resReturnCount.json();

        setTotalBills(summary.totalBills ?? 0);
        setTotalSales(summary.totalSales ?? 0);
        setTotalCustomers(customerData.count ?? 0);
        setTotalEditors(editorData.count ?? 0);
        setTopEditors(topEditorsData ?? []);
        setTopCustomers(topCustomersData ?? []);
        setWeeklySales(weeklySalesData.totalRevenue ?? 0);
        setExchangeCount(exchangeData.count ?? 0);
        setReturnCount(returnData.count ?? 0);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const cards = [
    {
      title: 'Total Editors',
      value: totalEditors,
      icon: <UserCheck className="text-blue-500 w-6 h-6" />,
      onClick: () => navigate('/total-editors'),
    },
    {
      title: 'Total Customers',
      value: totalCustomers,
      icon: <Users className="text-yellow-500 w-6 h-6" />,
      onClick: () => navigate('/total-customers'),
    },
    {
      title: 'Total Bills',
      value: totalBills,
      icon: <FileText className="text-orange-500 w-6 h-6" />,
      onClick: () => navigate('/total-bills'),
    },
    {
      title: 'Total Sales',
      value: `₹${(totalSales ?? 0).toFixed(2)}`,
      icon: <DollarSign className="text-green-500 w-6 h-6" />,
      onClick: () => navigate('/total-sales'),
    },
    {
      title: 'Exchange Bills',
      value: exchangeCount,
      icon: <Repeat className="text-purple-500 w-6 h-6" />,
      onClick: () => navigate('/exchanged-bills'),
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <p className="text-gray-500 text-lg animate-pulse">Loading Admin Dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 text-red-700 p-4 rounded-md max-w-md mx-auto mt-10">
        <p className="font-semibold">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="mb-6">
        <h1 className="text-3xl font-semibold text-gray-800">Admin Dashboard</h1>
        <p className="text-gray-600">Welcome, <span className="text-gray-900 font-medium">{username}</span></p>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card, idx) => (
          <div
            key={idx}
            onClick={card.onClick}
            className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{card.title}</p>
                <p className="text-xl font-bold text-gray-800 mt-1">{card.value}</p>
              </div>
              <div className="p-2 bg-gray-50 rounded-full shadow-inner">{card.icon}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Insights Section */}
      <div className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Editors */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">🛠️ Top Editors</h3>
          {topEditors.length > 0 ? (
            <ul className="text-sm text-gray-700 space-y-1">
              {topEditors.map((editor, idx) => (
                <li key={idx}>{editor.username} — {editor.billCount} bills</li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-400 italic">No editor data available</p>
          )}
        </div>

        {/* Top Customers */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">👑 Favourite Customers</h3>
          {topCustomers.length > 0 ? (
            <ul className="text-sm text-gray-700 space-y-1">
              {topCustomers.map((cust, idx) => (
                <li key={idx}>{cust._id} — {cust.billCount} bills</li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-400 italic">No customer data available</p>
          )}
        </div>

        {/* Weekly Sales */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">📅 Weekly Sales</h3>
          <p className="text-2xl font-bold text-green-600">₹{weeklySales.toFixed(2)}</p>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
