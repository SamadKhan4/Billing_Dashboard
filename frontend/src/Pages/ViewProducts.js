import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import Tooltip from '@mui/material/Tooltip';
import { TextField, InputAdornment, Pagination } from "@mui/material";
import SearchIcon from '@mui/icons-material/Search';

const ITEMS_PER_PAGE = 5;

const ViewProducts = () => {
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [userType, setUserType] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const token = localStorage.getItem("token");
        const type = localStorage.getItem("userType")?.toLowerCase();
        setUserType(type);

        const route =
          type === "admin"
            ? "http://localhost:5000/api/items/all"
            : "http://localhost:5000/api/items/my-items";

        const res = await axios.get(route, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (Array.isArray(res.data)) {
          setItems(res.data);
          setFilteredItems(res.data);
        }
      } catch (err) {
        console.error("Error fetching items:", err);
      }
    };

    fetchItems();
  }, []);

  const handleSearchChange = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchValue(value);
    const filtered = items.filter((item) =>
      item.name.toLowerCase().includes(value)
    );
    setFilteredItems(filtered);
    setCurrentPage(1);
  };

  const handleSelect = (item) => {
    const already = selectedItems.find((i) => i._id === item._id);
    if (already) {
      setSelectedItems(selectedItems.filter((i) => i._id !== item._id));
    } else {
      setSelectedItems([...selectedItems, { ...item, quantity: 1 }]);
    }
  };

  const handleQuantityChange = (id, value, stock) => {
    setSelectedItems((prev) =>
      prev.map((item) =>
        item._id === id
          ? { ...item, quantity: Math.max(1, Math.min(stock, Number(value))) }
          : item
      )
    );
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this item?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/items/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const updated = items.filter((i) => i._id !== id);
      setItems(updated);
      setFilteredItems(updated);
    } catch (err) {
      console.error("Failed to delete item", err);
    }
  };

  const goToBill = () => {
    navigate("/bill-form", {
      state: {
        selectedItems: selectedItems.map(({ _id, name, costPrice, salePrice, quantity, stock }) => ({
          _id, name, costPrice, salePrice, quantity, stock,
        })),
      },
    });
  };

  const calculateTotal = () =>
    selectedItems.reduce((sum, i) => sum + i.quantity * i.salePrice, 0);

  const pageCount = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);
  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
        <h2 className="text-3xl font-bold text-gray-800">📦 Product List</h2>
        <TextField
          value={searchValue}
          onChange={handleSearchChange}
          variant="outlined"
          size="small"
          placeholder="Search product"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
        />
      </div>

      {/* Product List */}
      {paginatedItems.length === 0 ? (
        <p className="text-red-500 font-medium">❌ No products found.</p>
      ) : (
        <div className="space-y-4">
          {paginatedItems.map((item) => {
            const selected = selectedItems.find((i) => i._id === item._id);
            return (
              <div
                key={item._id}
                className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition flex justify-between items-start gap-4"
              >
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{item.name}</h3>
                  <p className="text-gray-700 text-sm">₹{item.salePrice} | Stock: {item.stock}</p>
                  <p className="text-sm text-gray-600">Category: {item.category || "N/A"}</p>
                  {item.stock <= 5 && (
                    <p className="text-sm text-red-600 font-semibold">⚠ Low stock</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">Created by: {item.createdBy}</p>

                  {userType === "editor" && (
                    <div className="mt-3">
                      <label className="text-sm font-medium">Quantity:</label>
                      <input
                        type="number"
                        min="1"
                        max={item.stock}
                        value={selected?.quantity || 1}
                        onChange={(e) =>
                          handleQuantityChange(item._id, e.target.value, item.stock)
                        }
                        className="border px-3 py-1 rounded w-24 text-sm ml-2"
                      />
                      <button
                        onClick={() => handleSelect(item)}
                        className={`ml-3 px-3 py-1 rounded text-sm font-medium transition ${
                          selected
                            ? "bg-black text-yellow-300 hover:bg-yellow-300 hover:text-black"
                            : "bg-yellow-400 text-black hover:bg-yellow-500"
                        }`}
                      >
                        {selected ? "Remove" : "Add to Bill"}
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex flex-col items-end space-y-2">
                  <img
                    src={`http://localhost:5000/uploads/${item.image}`}
                    alt={item.name}
                    className="w-24 h-24 object-cover rounded border"
                  />
                  <div className="flex space-x-3">
                    <Tooltip title="Edit">
                      <EditIcon
                        className="text-gray-600 hover:text-yellow-600 cursor-pointer"
                        onClick={() => navigate("/add-items", { state: { itemToUpdate: item } })}
                      />
                    </Tooltip>
                    <Tooltip title="Delete">
                      <DeleteIcon
                        className="text-red-600 hover:text-red-800 cursor-pointer"
                        onClick={() => handleDelete(item._id)}
                      />
                    </Tooltip>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {pageCount > 1 && (
        <div className="mt-6 flex justify-center">
          <Pagination
            count={pageCount}
            page={currentPage}
            onChange={(_, page) => setCurrentPage(page)}
            color="primary"
          />
        </div>
      )}

      {/* Billing Footer */}
      {userType === "editor" && selectedItems.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-yellow-100 border-t border-yellow-300 shadow-md px-6 py-4 z-50">
          <div className="max-w-5xl mx-auto flex justify-between items-center">
            <p className="font-semibold text-lg text-black">
              🧾 Total: ₹{calculateTotal()}
            </p>
            <button
              onClick={goToBill}
              className="bg-black text-yellow-300 px-5 py-2 rounded-lg hover:bg-yellow-400 hover:text-black transition"
            >
              Proceed to Billing
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewProducts;
