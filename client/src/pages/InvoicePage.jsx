import React, { useEffect, useState } from "react";
import "./InvoicePage.css"; // Optional custom styling

const InvoicePage = () => {
  const [cartItems, setCartItems] = useState([]);
  const [invoiceDate, setInvoiceDate] = useState(new Date().toLocaleDateString());

  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem("cartItems")) || [];
    setCartItems(storedCart);
  }, []);

  const handleDownload = () => {
    const content = document.getElementById("invoice-content").innerHTML;
    const blob = new Blob([content], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "invoice.html";
    link.click();
    URL.revokeObjectURL(url);
  };

  const totalAmount = cartItems.reduce((sum, item) => sum + item.price, 0);

  return (
    <div className="invoice-wrapper">
      <div id="invoice-content" className="invoice-box">
        <h2>🧾 Invoice</h2>
        <p>Date: {invoiceDate}</p>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Product</th>
              <th>Price (₹)</th>
            </tr>
          </thead>
          <tbody>
            {cartItems.map((item, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{item.name}</td>
                <td>{item.price}</td>
              </tr>
            ))}
            <tr className="total">
              <td colSpan="2">Total</td>
              <td>₹{totalAmount}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <button className="download-btn" onClick={handleDownload}>📥 Download Invoice</button>
    </div>
  );
};

export default InvoicePage;
