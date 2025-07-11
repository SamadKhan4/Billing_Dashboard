import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import {
    Box,
    Typography,
    Paper,
    Button,
    Divider,
} from "@mui/material";

const API_BASE = "http://localhost:5000";

const UserDetails = () => {
    const { state } = useLocation();
    const user = state?.user;

    const [bills, setBills] = useState([]);
    const [showBills, setShowBills] = useState(false);
    const [loadingBills, setLoadingBills] = useState(false);
    const [error, setError] = useState(null);

    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const limit = 5;

    const fetchBills = async (page = 1) => {
        setLoadingBills(true);
        setError(null);
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(
                `${API_BASE}/api/bills/editor/${user._id}?page=${page}&limit=${limit}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            if (!res.ok) throw new Error("Failed to fetch bills");
            const data = await res.json();
            setBills(data.bills);
            setTotalPages(data.totalPages);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoadingBills(false);
        }
    };

    const handleToggleBills = () => {
        if (showBills) {
            setShowBills(false);
        } else {
            fetchBills(currentPage);
            setShowBills(true);
        }
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
            fetchBills(newPage);
        }
    };

    if (!user) return <Typography>User data not available.</Typography>;

    const registrationDate = user.registeredAt || user.createdAt;

    return (
        <Box p={4}>
            <Typography variant="h5" gutterBottom>
                👤 User Details
            </Typography>

            <Paper sx={{ mt: 2, p: 3 }}>
                <Typography>
                    <strong>Username:</strong> {user.username}
                </Typography>
                <Typography>
                    <strong>Email:</strong> {user.email}
                </Typography>
                <Typography>
                    <strong>User Type:</strong> {user.userType}
                </Typography>
                <Typography>
                    <strong>Registered At:</strong>{" "}
                    {registrationDate ? new Date(registrationDate).toLocaleString() : "N/A"}
                </Typography>
                <Typography sx={{ mt: 1 }}>
                    <strong>Total Bills Created:</strong> {user.billCount ?? 0} bills
                </Typography>

                {(user.billCount ?? 0) > 0 && (
                    <Button
                        variant="contained"
                        color={showBills ? "secondary" : "primary"}
                        sx={{ mt: 2 }}
                        onClick={handleToggleBills}
                        disabled={loadingBills}
                    >
                        {loadingBills
                            ? "Loading Bills..."
                            : showBills
                                ? "Hide All Bills"
                                : "View All Bills"}
                    </Button>
                )}
            </Paper>

            {showBills && (
                <Paper sx={{ mt: 4, p: 3 }}>
                    <Typography variant="h6" gutterBottom>
                        🧾 Bills Created
                    </Typography>

                    {error && <Typography color="error">{error}</Typography>}

                    {bills.length === 0 ? (
                        <Typography>No bills found.</Typography>
                    ) : (
                        bills.map((bill) => (
                            <Box key={bill._id} sx={{ mb: 2 }}>
                                <Divider sx={{ my: 1 }} />
                                <Typography>
                                    <strong>Bill Number:</strong> {bill.billNumber}
                                </Typography>
                                <Typography>
                                    <strong>Customer:</strong> {bill.customerName}
                                </Typography>
                                <Typography>
                                    <strong>Status:</strong> {bill.paymentStatus}
                                </Typography>
                                <Typography>
                                    <strong>Date:</strong>{" "}
                                    {new Date(bill.billDate).toLocaleString()}
                                </Typography>
                            </Box>
                        ))
                    )}

                    {/* 🔁 Pagination */}
                    <div className="mt-4 flex justify-between items-center">
                        <Button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                        >
                            ⬅️ Previous
                        </Button>
                        <Typography>
                            Page {currentPage} of {totalPages}
                        </Typography>
                        <Button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                        >
                            Next ➡️
                        </Button>
                    </div>
                </Paper>
            )}
        </Box>
    );
};

export default UserDetails;
