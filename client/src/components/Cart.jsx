"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import "./Cart.css"

const Cart = () => {
  const [cart, setCart] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem("cart")) || []
    setCart(storedCart)
  }, [])

  const updateQuantity = (index, newQuantity) => {
    if (newQuantity <= 0) {
      removeItem(index)
      return
    }

    const updatedCart = [...cart]
    updatedCart[index].quantity = newQuantity
    setCart(updatedCart)
    localStorage.setItem("cart", JSON.stringify(updatedCart))
  }

  const removeItem = (index) => {
    const updatedCart = cart.filter((_, i) => i !== index)
    setCart(updatedCart)
    localStorage.setItem("cart", JSON.stringify(updatedCart))
  }

  const clearCart = () => {
    if (window.confirm("Are you sure you want to clear the cart?")) {
      setCart([])
      localStorage.removeItem("cart")
    }
  }

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + item.price * (item.quantity || 1), 0)
  }

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + (item.quantity || 1), 0)
  }

  const handleCheckout = () => {
    if (cart.length === 0) {
      alert("Your cart is empty!")
      return
    }
    setIsLoading(true)
    setTimeout(() => {
      navigate("/checkout")
    }, 500)
  }

  return (
    <div className="cart-container">
      <div className="cart-header">
        <button className="back-btn" onClick={() => navigate("/")}>
          ← Back to Scan
        </button>
        <h2>🛒 Your Cart</h2>
        <div className="cart-summary">
          {getTotalItems()} items • ₹{getTotalPrice()}
        </div>
      </div>

      {cart.length === 0 ? (
        <div className="empty-cart">
          <div className="empty-cart-icon">🛒</div>
          <h3>Your cart is empty</h3>
          <p>Start scanning products to add them to your cart</p>
          <button onClick={() => navigate("/")} className="start-shopping-btn">
            Start Shopping
          </button>
        </div>
      ) : (
        <>
          <div className="cart-items">
            {cart.map((item, index) => (
              <div key={index} className="cart-item">
                <div className="item-info">
                  <h4 className="item-name">{item.name}</h4>
                  <p className="item-desc">{item.description}</p>
                  <div className="item-price">₹{item.price}</div>
                </div>

                <div className="item-controls">
                  <div className="quantity-controls">
                    <button className="qty-btn" onClick={() => updateQuantity(index, (item.quantity || 1) - 1)}>
                      −
                    </button>
                    <span className="quantity">{item.quantity || 1}</span>
                    <button className="qty-btn" onClick={() => updateQuantity(index, (item.quantity || 1) + 1)}>
                      +
                    </button>
                  </div>

                  <button className="remove-btn" onClick={() => removeItem(index)} title="Remove item">
                    🗑️
                  </button>
                </div>

                <div className="item-total">₹{item.price * (item.quantity || 1)}</div>
              </div>
            ))}
          </div>

          <div className="cart-footer">
            <div className="cart-total">
              <div className="total-breakdown">
                <div className="total-line">
                  <span>Subtotal ({getTotalItems()} items)</span>
                  <span>₹{getTotalPrice()}</span>
                </div>
                <div className="total-line">
                  <span>Tax (18% GST)</span>
                  <span>₹{Math.round(getTotalPrice() * 0.18)}</span>
                </div>
                <div className="total-line final-total">
                  <span>Total</span>
                  <span>₹{Math.round(getTotalPrice() * 1.18)}</span>
                </div>
              </div>
            </div>

            <div className="cart-actions">
              <button onClick={clearCart} className="clear-btn">
                🗑️ Clear Cart
              </button>
              <button onClick={handleCheckout} className="checkout-btn" disabled={isLoading}>
                {isLoading ? "Processing..." : "✅ Proceed to Checkout"}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default Cart
