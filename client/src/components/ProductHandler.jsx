"use client"

import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import axios from "axios"
import "./ProductHandler.css"

const ProductHandler = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchAndAddProduct = async () => {
      try {
        // Use environment variable for API URL
        const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000"
        const res = await axios.get(`${apiUrl}/api/products/${id}`)

        if (!res.data.success) {
          throw new Error(res.data.message || "Product not found")
        }

        const productData = res.data.data
        const cart = JSON.parse(localStorage.getItem("cart")) || []

        // Check if product already exists in cart
        const existingItem = cart.find((item) => item._id === productData._id)
        if (existingItem) {
          existingItem.quantity = (existingItem.quantity || 1) + 1
        } else {
          cart.push({ ...productData, quantity: 1 })
        }

        localStorage.setItem("cart", JSON.stringify(cart))

        // Redirect to cart page
        navigate("/cart")
      } catch (error) {
        console.error("Error fetching product:", error)
        setError("Product not found or server error")
        setTimeout(() => {
          navigate("/")
        }, 3000)
      } finally {
        setIsLoading(false)
      }
    }

    if (id) {
      fetchAndAddProduct()
    }
  }, [id, navigate])

  return (
    <div className="product-handler">
      <div className="loading-container">
        {isLoading ? (
          <>
            <div className="loading-spinner"></div>
            <h2>Adding product to cart...</h2>
            <p>Please wait while we fetch the product details.</p>
          </>
        ) : error ? (
          <>
            <h2>Error</h2>
            <p>{error}</p>
            <p>Redirecting to home...</p>
          </>
        ) : null}
      </div>
    </div>
  )
}

export default ProductHandler
