"use client"
import { useState } from "react"
import { Routes, Route } from "react-router-dom"
import ScanPage from "./pages/ScanPage"
import InvoicePage from "./pages/InvoicePage"
import NotFound from "./components/NotFound"
import QRScanner from "./components/QRScanner"
import Checkout from "./components/Checkout"
import ProductHandler from "./components/ProductHandler"
import Cart from "./components/Cart"
import "./App.css"

const App = () => {
  const [cart, setCart] = useState([])
  const [orderId, setOrderId] = useState(null)

  const addToCart = (product) => {
    setCart((prevCart) => {
      const existingProductIndex = prevCart.findIndex((item) => item.id === product.id)
      if (existingProductIndex !== -1) {
        const updatedCart = [...prevCart]
        updatedCart[existingProductIndex] = {
          ...updatedCart[existingProductIndex],
          quantity: updatedCart[existingProductIndex].quantity + 1,
        }
        return updatedCart
      } else {
        return [...prevCart, product]
      }
    })
  }

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId)
      return
    }

    setCart((prevCart) =>
      prevCart.map((item) => (item.id === productId ? { ...item, quantity: newQuantity } : item)),
    )
  }

  const removeFromCart = (productId) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId))
  }

  const clearCart = () => {
    setCart([])
  }

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0)
  }

  return (
    <Routes>
      <Route path="/" element={<QRScanner />} />
      <Route path="/scan" element={<ScanPage onAddToCart={addToCart} />} />
      <Route
        path="/cart"
        element={
          <Cart
            cart={cart}
            updateQuantity={updateQuantity}
            removeFromCart={removeFromCart}
            clearCart={clearCart}
            calculateTotal={calculateTotal}
            setOrderId={setOrderId}
          />
        }
      />
      <Route
        path="/checkout"
        element={<Checkout cart={cart} total={calculateTotal()} setOrderId={setOrderId} clearCart={clearCart} />}
      />
      <Route path="/invoice/:id" element={<InvoicePage orderId={orderId} />} />
      <Route path="/product/:id" element={<ProductHandler />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default App
