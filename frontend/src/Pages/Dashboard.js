/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  FileText,
  DollarSign,
  Repeat,
} from "lucide-react";

const Dashboard = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [customerCount, setCustomerCount] = useState(0);
  const [billsCreatedByMe, setBillsCreatedByMe] = useState(0);
  const [totalSales, setTotalSales] = useState(0);
  const [topCustomers, setTopCustomers] = useState([]);
  const [weeklySales, setWeeklySales] = useState(0);
  const [loading, setLoading] = useState(true);
  const [exchangeBillCount, setExchangeBillCount] = useState(0);
  const [returnBillCount, setReturnBillCount] = useState(0);

  useEffect(() => {
    const storedUsername = localStorage.getItem("username") || "User";
    setUsername(storedUsername);

    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem("token");
        const config = {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        };

        const [
          customersRes,
          billsRes,
          salesRes,
          topCustomersRes,
          weeklySalesRes,
          exchangeRes,
          returnRes
        ] = await Promise.all([
          fetch("http://localhost:5000/api/bills/customers/my", config),
          fetch("http://localhost:5000/api/bills/my/count", config),
          fetch("http://localhost:5000/api/bills/summary/my", config),
          fetch("http://localhost:5000/api/bills/top-customers/my", config),
          fetch("http://localhost:5000/api/bills/editor-sales-detail", config),
          fetch("http://localhost:5000/api/bills/count/my/exchange", config),
          fetch("http://localhost:5000/api/bills/count/my/return", config),
        ]);

        const customersData = await customersRes.json();
        const billsData = await billsRes.json();
        const salesData = await salesRes.json();
        const topCustomersData = await topCustomersRes.json();
        const weeklySalesData = await weeklySalesRes.json();
        const exchangeData = await exchangeRes.json();
        const returnData = await returnRes.json();

        setCustomerCount(customersData.customers?.length || 0);
        setBillsCreatedByMe(billsData.count || 0);
        setTotalSales(Number(salesData.totalSales || 0));
        setTopCustomers(topCustomersData || []);
        setWeeklySales(Number(weeklySalesData.totalRevenue || 0));
        setExchangeBillCount(exchangeData.count || 0);
        setReturnBillCount(returnData.count || 0);
      } catch (error) {
        console.error("❌ Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const cardData = [
    {
      title: "Customers",
      value: customerCount,
      icon: <Users className="text-blue-600 w-6 h-6" />,
      bg: "bg-blue-50",
      onClick: () => navigate("/editor/customers"),
    },
    {
      title: "Bills Created",
      value: billsCreatedByMe,
      icon: <FileText className="text-purple-600 w-6 h-6" />,
      bg: "bg-purple-50",
      onClick: () => navigate("/editor-bills"),
    },
    {
      title: "Total Sales",
      value: `₹${Number(totalSales).toFixed(2)}`,
      icon: <DollarSign className="text-green-600 w-6 h-6" />,
      bg: "bg-green-50",
      onClick: () => navigate("/editor/sales"),
    },
    {
      title: "Exchange Bills",
      value: exchangeBillCount,
      icon: <Repeat className="text-orange-600 w-6 h-6" />,
      bg: "bg-orange-50",
      onClick: () => navigate("/exchanged-bills"),
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <p className="text-gray-600 text-lg animate-pulse">Loading Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-6 py-10 bg-gray-50">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-semibold text-gray-800 mb-2">Editor Dashboard</h1>
        <p className="text-gray-600">Welcome, <span className="font-semibold text-gray-900">{username}</span> 👋</p>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cardData.map((card, index) => (
          <div
            key={index}
            onClick={card.onClick}
            className={`p-5 rounded-2xl cursor-pointer shadow-sm border border-gray-100 hover:shadow-md transition ${card.bg}`}
          >
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-500">{card.title}</p>
                <p className="text-2xl font-bold text-gray-800">{card.value}</p>
              </div>
              <div className="p-2 bg-white rounded-full shadow">
                {card.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Top Customers */}
      <div className="mt-10 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-xl font-semibold mb-3 text-gray-800">👑 Top 3 Customers</h2>
        {topCustomers.length > 0 ? (
          <ul className="space-y-2 text-gray-700">
            {topCustomers.map((cust, idx) => (
              <li key={idx} className="text-sm">
                {cust._id} — <span className="font-medium">{cust.billCount}</span> bills
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 italic">No customer data yet.</p>
        )}
      </div>

      {/* Weekly Sales */}
      <div className="mt-6 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-xl font-semibold mb-1 text-gray-800">📅 Weekly Sales</h2>
        <p className="text-2xl font-bold text-green-600">₹{weeklySales.toFixed(2)}</p>
      </div>
    </div>
  );
};

export default Dashboard;
  