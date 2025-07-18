import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Cart.css"; // Optional: your custom styling

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const storedCart = localStorage.getItem("cartItems");
    if (storedCart) {
      setCartItems(JSON.parse(storedCart));
    }
  }, []);

  const handleClearCart = () => {
    localStorage.removeItem("cartItems");
    setCartItems([]);
  };

  const total = cartItems.reduce((sum, item) => sum + item.price, 0);

  return (
    <div className="cart-container">
      <h2>🛒 Your Cart</h2>

      {cartItems.length === 0 ? (
        <p>🗑️ Cart is empty</p>
      ) : (
        <div className="cart-list">
          {cartItems.map((item, index) => (
            <div className="cart-item" key={index}>
              <h4>{item.name}</h4>
              <p>Price: ₹{item.price}</p>
              <p>{item.description}</p>
            </div>
          ))}

          <hr />
          <h3>Total: ₹{total}</h3>
          <div className="cart-buttons">
            <button onClick={handleClearCart}>🧹 Clear Cart</button>
            <button onClick={() => navigate("/checkout")}>💳 Checkout</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
