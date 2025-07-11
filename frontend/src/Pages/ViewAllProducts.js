import React, { useEffect, useState } from "react";
import axios from "axios";

const ViewAllProducts = () => {
  const [items, setItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/items/all", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setItems(res.data);
      } catch (err) {
        console.error("Error fetching all items:", err);
      }
    };

    fetchItems();
  }, []);

  const handleSelect = (item) => {
    const already = selectedItems.find((i) => i._id === item._id);
    if (already) {
      setSelectedItems(selectedItems.filter((i) => i._id !== item._id));
    } else {
      setSelectedItems([...selectedItems, { ...item, quantity: 1 }]);
    }
  };

  const handleQuantityChange = (itemId, quantity, stock) => {
    const updated = selectedItems.map((item) =>
      item._id === itemId
        ? {
            ...item,
            quantity: Number(quantity) > stock ? stock : Number(quantity),
          }
        : item
    );
    setSelectedItems(updated);
  };

  const calculateTotal = () =>
    selectedItems.reduce(
      (sum, item) => sum + Number(item.salePrice || 0) * item.quantity,
      0
    );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-gray-800">🛒 Product Inventory</h1>
          <p className="text-gray-600 mt-1">Manage and review all available products</p>
        </div>

        {items.length === 0 ? (
          <p className="text-center text-gray-600 mt-10">No items found.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => {
              const selected = selectedItems.find((i) => i._id === item._id);
              return (
                <div
                  key={item._id}
                  className="bg-white rounded-xl shadow hover:shadow-lg transition p-4 border border-gray-100"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-lg font-semibold text-gray-800 mb-1">{item.name}</h2>
                      <p className="text-sm text-gray-600">Cost: ₹{item.costPrice}</p>
                      <p className="text-sm text-gray-600">Sale: ₹{item.salePrice}</p>
                      <p className="text-sm text-gray-600">Stock: {item.stock}</p>
                      <p className="text-sm text-gray-500 mt-1">Added by: {item.createdBy}</p>
                    </div>
                    <div>
                      <input
                        type="checkbox"
                        checked={!!selected}
                        onChange={() => handleSelect(item)}
                        className="w-5 h-5 accent-yellow-500"
                      />
                    </div>
                  </div>

                  {selected && (
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Quantity
                      </label>
                      <input
                        type="number"
                        min="1"
                        max={item.stock}
                        value={selected.quantity}
                        onChange={(e) =>
                          handleQuantityChange(item._id, e.target.value, item.stock)
                        }
                        className="w-24 px-3 py-2 border rounded-lg focus:ring-yellow-400 focus:border-yellow-400"
                      />
                      {selected.quantity > item.stock && (
                        <p className="text-red-500 text-sm mt-1">
                          ❌ Only {item.stock} available
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {selectedItems.length > 0 && (
          <div className="mt-10 bg-white border border-gray-200 shadow p-6 rounded-xl">
            <h3 className="text-xl font-bold text-gray-800 mb-4">🧾 Selected Items</h3>
            <ul className="divide-y divide-gray-200 mb-4">
              {selectedItems.map((item) => (
                <li key={item._id} className="py-2 text-gray-700">
                  {item.name} — ₹{item.salePrice} × {item.quantity}
                </li>
              ))}
            </ul>
            <p className="text-lg font-bold text-green-600">
              Total Price: ₹{calculateTotal()}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewAllProducts;
