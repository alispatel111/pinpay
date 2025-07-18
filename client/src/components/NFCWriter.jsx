"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import "./NFCWriter.css"

const NFCWriter = () => {
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [products, setProducts] = useState([])
  const [nfcSupported, setNfcSupported] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState("")
  const [backendUrl, setBackendUrl] = useState("https://pinpay-znin.vercel.app")
  const [frontendUrl, setFrontendUrl] = useState("https://pinpay-red.vercel.app")
  const navigate = useNavigate()

  useState(() => {
    // Check NFC support
    if ("NDEFReader" in window) {
      setNfcSupported(true)
      setStatus("✅ NFC is supported on this device!")
    } else {
      setStatus("❌ NFC is not supported on this device/browser. Please use Chrome on Android.")
    }
  }, [])

  const loadProducts = async () => {
    if (!backendUrl) {
      setStatus("❌ Please enter Backend URL")
      return
    }

    setIsLoading(true)
    setStatus("Loading products...")

    try {
      const response = await fetch(`${backendUrl}/api/products`)
      const data = await response.json()

      if (data.success && data.data.length > 0) {
        setProducts(data.data)
        setStatus(`✅ Loaded ${data.data.length} products successfully!`)
      } else {
        setStatus("❌ No products found in database.")
      }
    } catch (error) {
      console.error("Error loading products:", error)
      setStatus(`❌ Error loading products: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  const selectProduct = (product) => {
    setSelectedProduct(product)
  }

  const writeNFC = async () => {
    if (!selectedProduct) {
      alert("Please select a product first!")
      return
    }

    if (!nfcSupported) {
      alert("NFC is not supported on this device")
      return
    }

    setIsLoading(true)
    setStatus("Writing to NFC tag...")

    try {
      const ndef = new window.NDEFReader()
      const productUrl = `${frontendUrl}/product/${selectedProduct._id}`

      await ndef.write({
        records: [
          {
            recordType: "url",
            data: productUrl,
          },
        ],
      })

      setStatus(`✅ NFC tag written successfully! Product: ${selectedProduct.name}`)
    } catch (error) {
      console.error("NFC Write Error:", error)
      setStatus(`❌ Error writing NFC tag: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="nfc-writer-container">
      <div className="nfc-header">
        <button className="back-btn" onClick={() => navigate("/")}>
          ← Back to Scanner
        </button>
        <h1>📱 NFC Tag Writer</h1>
        <p>Write product URLs to NFC tags for Pin & Pay</p>
      </div>

      <div className="nfc-content">
        {/* Configuration */}
        <div className="section">
          <h2>⚙️ Configuration</h2>
          <div className="config-section">
            <label>
              <strong>Backend URL:</strong>
              <input
                type="text"
                value={backendUrl}
                onChange={(e) => setBackendUrl(e.target.value)}
                className="config-input"
                placeholder="https://your-backend.vercel.app"
              />
            </label>

            <label>
              <strong>Frontend URL:</strong>
              <input
                type="text"
                value={frontendUrl}
                onChange={(e) => setFrontendUrl(e.target.value)}
                className="config-input"
                placeholder="https://your-frontend.vercel.app"
              />
            </label>
          </div>
        </div>

        {/* Status */}
        <div className="section">
          <h2>🔍 Status</h2>
          <div className={`status ${status.includes("✅") ? "success" : status.includes("❌") ? "error" : "info"}`}>
            {status}
          </div>
        </div>

        {/* Load Products */}
        <div className="section">
          <h2>📦 Load Products</h2>
          <button onClick={loadProducts} className="btn" disabled={isLoading}>
            {isLoading ? "Loading..." : "Load Products from Database"}
          </button>
        </div>

        {/* Products List */}
        {products.length > 0 && (
          <div className="section">
            <h2>📋 Select Product</h2>
            <div className="product-list">
              {products.map((product) => (
                <div
                  key={product._id}
                  className={`product-item ${selectedProduct?._id === product._id ? "selected" : ""}`}
                  onClick={() => selectProduct(product)}
                >
                  <div className="product-name">{product.name}</div>
                  <div className="product-price">₹{product.price}</div>
                  <div className="product-desc">{product.description}</div>
                  <div className="product-id">ID: {product._id}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Selected Product */}
        {selectedProduct && (
          <div className="section">
            <h2>✅ Selected Product</h2>
            <div className="selected-product">
              <div className="product-name">{selectedProduct.name}</div>
              <div className="product-price">₹{selectedProduct.price}</div>
              <div className="product-desc">{selectedProduct.description}</div>
            </div>
            <div className="url-display">{`${frontendUrl}/product/${selectedProduct._id}`}</div>
          </div>
        )}

        {/* Write NFC */}
        <div className="section">
          <h2>📝 Write NFC Tag</h2>
          <button
            onClick={writeNFC}
            className="btn write-btn"
            disabled={!selectedProduct || !nfcSupported || isLoading}
          >
            {isLoading ? "Writing..." : "Write to NFC Tag"}
          </button>
        </div>

        {/* Instructions */}
        <div className="section">
          <h2>📋 Instructions</h2>
          <div className="instructions">
            <ol>
              <li>Update the Backend and Frontend URLs above</li>
              <li>Click "Load Products from Database" to fetch your products</li>
              <li>Select a product from the list</li>
              <li>Click "Write to NFC Tag"</li>
              <li>Touch your NFC tag to the device when prompted</li>
              <li>Test the tag by tapping it with your phone</li>
            </ol>
            <div className="note">
              <strong>Note:</strong> NFC writing only works on Android devices with Chrome browser and requires HTTPS.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NFCWriter
