"use client"

import { useState, useEffect, useRef } from "react"
import { Html5QrcodeScanner } from "html5-qrcode"
import axios from "axios"
import { useNavigate } from "react-router-dom"
import "./QRScanner.css"

const QRScanner = () => {
  const [productAdded, setProductAdded] = useState(false)
  const [scanningStarted, setScanningStarted] = useState(false)
  const [flashOn, setFlashOn] = useState(false)
  const [nfcSupported, setNfcSupported] = useState(false)
  const [nfcReading, setNfcReading] = useState(false)
  const [scanMode, setScanMode] = useState("qr") // "qr" or "nfc"
  const [lastScannedProduct, setLastScannedProduct] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showBounce, setShowBounce] = useState(false)
  const [cameraError, setCameraError] = useState(null)
  const [retryCount, setRetryCount] = useState(0)
  const [cameraPermission, setCameraPermission] = useState("unknown") // "granted", "denied", "unknown"
  const [availableCameras, setAvailableCameras] = useState([])
  const [selectedCamera, setSelectedCamera] = useState(null)
  const [isMobile, setIsMobile] = useState(false)
  const [isHttps, setIsHttps] = useState(false)
  const scannerRef = useRef(null)
  const navigate = useNavigate()
  const scanSound = new Audio("/success.mp3")

  useEffect(() => {
    // Detect mobile device
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor || window.opera
      const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i
      return mobileRegex.test(userAgent.toLowerCase())
    }

    // Check HTTPS
    const checkHttps = () => {
      return window.location.protocol === "https:" || window.location.hostname === "localhost"
    }

    setIsMobile(checkMobile())
    setIsHttps(checkHttps())

    // Check NFC support
    if ("NDEFReader" in window) {
      setNfcSupported(true)
    }

    // Check camera permission and devices
    checkCameraPermission()

    if (scanMode === "qr" && cameraPermission === "granted") {
      initQRScanner()
    }

    return () => {
      cleanupScanner()
    }
  }, [scanMode, productAdded, retryCount, selectedCamera])

  const checkCameraPermission = async () => {
    try {
      // For mobile, we need to be more careful with permissions
      if (!isHttps && isMobile) {
        setCameraError("HTTPS required for camera access on mobile devices")
        return
      }

      // Check if camera permission is already granted
      const permission = await navigator.permissions.query({ name: "camera" })
      setCameraPermission(permission.state)

      // Get available cameras with mobile-specific handling
      const devices = await navigator.mediaDevices.enumerateDevices()
      const cameras = devices.filter((device) => device.kind === "videoinput")
      setAvailableCameras(cameras)

      if (cameras.length > 0 && !selectedCamera) {
        // For mobile, prefer back camera for QR scanning
        let preferredCamera
        if (isMobile) {
          preferredCamera =
            cameras.find(
              (camera) =>
                camera.label.toLowerCase().includes("back") ||
                camera.label.toLowerCase().includes("rear") ||
                camera.label.toLowerCase().includes("environment"),
            ) || cameras[cameras.length - 1] // Last camera is usually back camera
        } else {
          preferredCamera = cameras[0]
        }
        setSelectedCamera(preferredCamera.deviceId)
      }

      permission.addEventListener("change", () => {
        setCameraPermission(permission.state)
      })
    } catch (error) {
      console.error("Permission check error:", error)
      setCameraPermission("unknown")
      if (isMobile) {
        setCameraError("Camera permission check failed. Please allow camera access manually.")
      }
    }
  }

  const requestCameraPermission = async () => {
    try {
      setIsLoading(true)
      setCameraError(null)

      // Mobile-specific camera constraints
      const constraints = {
        video: {
          facingMode: isMobile ? { ideal: "environment" } : "user",
          width: isMobile ? { ideal: 1280, max: 1920 } : { ideal: 640 },
          height: isMobile ? { ideal: 720, max: 1080 } : { ideal: 480 },
        },
      }

      if (selectedCamera) {
        constraints.video.deviceId = { exact: selectedCamera }
        delete constraints.video.facingMode // Remove facingMode when using specific device
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints)

      // Stop the stream immediately - we just needed permission
      stream.getTracks().forEach((track) => track.stop())

      setCameraPermission("granted")
      setRetryCount((prev) => prev + 1)
    } catch (error) {
      console.error("Camera permission error:", error)
      handleCameraPermissionError(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCameraPermissionError = (error) => {
    if (error.name === "NotAllowedError") {
      setCameraError(
        isMobile
          ? "Camera permission denied. Please allow camera access in browser settings and refresh the page."
          : "Camera permission denied. Please allow camera access in browser settings.",
      )
      setCameraPermission("denied")
    } else if (error.name === "NotFoundError") {
      setCameraError("No camera found on this device.")
    } else if (error.name === "NotReadableError") {
      setCameraError(
        isMobile
          ? "Camera is being used by another app. Please close other camera apps and try again."
          : "Camera is being used by another application. Please close other camera apps.",
      )
    } else if (error.name === "OverconstrainedError") {
      setCameraError("Camera constraints not supported. Trying with different settings...")
      // Try with basic constraints
      setSelectedCamera(null)
      setTimeout(() => setRetryCount((prev) => prev + 1), 1000)
    } else {
      setCameraError(`Camera error: ${error.message}`)
    }
  }

  const cleanupScanner = () => {
    if (scannerRef.current) {
      try {
        scannerRef.current.clear().catch(console.error)
        scannerRef.current = null
      } catch (error) {
        console.error("Scanner cleanup error:", error)
      }
    }

    // Stop all video tracks - important for mobile
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then((stream) => {
          stream.getTracks().forEach((track) => {
            track.stop()
            console.log("Video track stopped")
          })
        })
        .catch(() => {})
    }

    setScanningStarted(false)
  }

  const initQRScanner = async () => {
    if (productAdded || cameraPermission !== "granted") return

    try {
      setCameraError(null)
      setIsLoading(true)

      // Clear any existing scanner first
      cleanupScanner()

      // Wait a bit before initializing new scanner - important for mobile
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Mobile-optimized configuration
      const config = {
        qrbox: isMobile
          ? { width: Math.min(250, window.innerWidth - 40), height: Math.min(250, window.innerWidth - 40) }
          : { width: 250, height: 250 },
        fps: isMobile ? 10 : 5, // Higher FPS for mobile
        aspectRatio: 1.0,
        rememberLastUsedCamera: false,
        showTorchButtonIfSupported: isMobile, // Show torch button on mobile
        showZoomSliderIfSupported: false,
        defaultZoomValueIfSupported: 1,
        disableFlip: false,
        // Mobile-specific video constraints
        videoConstraints: {
          facingMode: isMobile ? { ideal: "environment" } : "user",
          width: isMobile ? { ideal: 1280, max: 1920 } : { ideal: 640 },
          height: isMobile ? { ideal: 720, max: 1080 } : { ideal: 480 },
        },
      }

      // Add camera constraint only if we have a selected camera
      if (selectedCamera) {
        config.videoConstraints.deviceId = { exact: selectedCamera }
        delete config.videoConstraints.facingMode // Remove facingMode when using specific device
      }

      const scanner = new Html5QrcodeScanner("reader", config, false)

      scanner.render(handleScanSuccess, handleScanError)
      scannerRef.current = scanner
      setScanningStarted(true)
      setIsLoading(false)

      // Mobile-specific: Add touch event listeners
      if (isMobile) {
        const readerElement = document.getElementById("reader")
        if (readerElement) {
          readerElement.addEventListener("touchstart", handleTouchStart, { passive: true })
        }
      }
    } catch (error) {
      console.error("Scanner initialization error:", error)
      setCameraError(`Failed to initialize camera: ${error.message}`)
      setIsLoading(false)
    }
  }

  const handleTouchStart = (e) => {
    // Prevent zoom on double tap for mobile
    e.preventDefault()
  }

  const handleScanSuccess = async (decodedText) => {
    if (productAdded || isLoading) return

    // Stop scanner immediately after successful scan
    if (scannerRef.current) {
      try {
        await scannerRef.current.clear()
        scannerRef.current = null
        setScanningStarted(false)
      } catch (error) {
        console.error("Error stopping scanner:", error)
      }
    }

    await addProductToCart(decodedText)
  }

  const handleScanError = (error) => {
    // Handle specific camera errors
    if (error.includes("NotReadableError") || error.includes("Device in use")) {
      setCameraError(
        isMobile
          ? "Camera is being used by another app. Please close other camera apps and try again."
          : "Camera is being used by another application. Please close other camera apps and try again.",
      )
      return
    }

    if (error.includes("NotAllowedError")) {
      setCameraError(
        isMobile
          ? "Camera permission denied. Please allow camera access in browser settings and refresh the page."
          : "Camera permission denied. Please allow camera access and refresh the page.",
      )
      setCameraPermission("denied")
      return
    }

    if (error.includes("NotFoundError")) {
      setCameraError("No camera found on this device.")
      return
    }

    // Suppress frequent scan errors in console
    if (
      !error.includes("No MultiFormat Readers") &&
      !error.includes("NotFoundException") &&
      !error.includes("No QR code found")
    ) {
      console.warn("Scan error:", error)
    }
  }

  const retryCamera = () => {
    setCameraError(null)
    setRetryCount((prev) => prev + 1)
    cleanupScanner()

    if (cameraPermission !== "granted") {
      requestCameraPermission()
    }
  }

  const switchCamera = (cameraId) => {
    setSelectedCamera(cameraId)
    cleanupScanner()
    setRetryCount((prev) => prev + 1)
  }

  const startNFCReading = async () => {
    if (!("NDEFReader" in window)) {
      alert("❌ NFC is not supported on this device")
      return
    }

    try {
      setNfcReading(true)
      const ndef = new window.NDEFReader()
      await ndef.scan()

      ndef.addEventListener("reading", ({ message }) => {
        const record = message.records[0]
        if (record.recordType === "text") {
          const textDecoder = new TextDecoder(record.encoding || "utf-8")
          const productId = textDecoder.decode(record.data)
          addProductToCart(productId)
        }
      })

      alert("📱 NFC Ready! Tap your device on an NFC tag")
    } catch (error) {
      console.error("NFC Error:", error)
      alert("❌ NFC permission denied or error occurred")
      setNfcReading(false)
    }
  }

  const addProductToCart = async (productId) => {
    try {
      setIsLoading(true)

      // Use environment variable for API URL
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000"
      const res = await axios.get(`${apiUrl}/api/products/${productId}`)

      if (!res.data.success) {
        throw new Error(res.data.message || "Product not found")
      }

      const productData = res.data.data

      const cart = JSON.parse(localStorage.getItem("cart")) || []

      // Check if product already exists in cart
      const existingItem = cart.find((item) => item._id === productData._id)
      if (existingItem) {
        existingItem.quantity = (existingItem.quantity || 1) + 1
        showNotification(`✅ ${productData.name} quantity updated in cart!`)
      } else {
        cart.push({ ...productData, quantity: 1 })
        showNotification(`✅ ${productData.name} added to cart!`)
      }

      localStorage.setItem("cart", JSON.stringify(cart))
      setLastScannedProduct(productData)
      setProductAdded(true)
      setNfcReading(false)

      // Trigger bounce animation
      setShowBounce(true)
      setTimeout(() => setShowBounce(false), 600)

      // Play success sound
      scanSound.play().catch(() => {})

      // Add screen flash effect
      triggerScreenFlash()
    } catch (err) {
      console.error("Product fetch error:", err)

      // Show specific error messages
      if (err.response?.status === 404) {
        alert("❌ Product not found in database. Please check the QR code.")
      } else if (err.response?.status === 500) {
        alert("❌ Server error. Please try again later.")
      } else {
        alert(`❌ Error: ${err.message || "Failed to add product to cart"}`)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const triggerScreenFlash = () => {
    const flash = document.createElement("div")
    flash.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(76, 175, 80, 0.3);
      z-index: 9999;
      pointer-events: none;
      animation: flashEffect 0.3s ease-out;
    `

    // Add flash animation keyframes
    const style = document.createElement("style")
    style.textContent = `
      @keyframes flashEffect {
        0% { opacity: 0; }
        50% { opacity: 1; }
        100% { opacity: 0; }
      }
    `
    document.head.appendChild(style)
    document.body.appendChild(flash)

    setTimeout(() => {
      if (document.body.contains(flash)) document.body.removeChild(flash)
      if (document.head.contains(style)) document.head.removeChild(style)
    }, 300)
  }

  const showNotification = (message) => {
    // Create a temporary notification element
    const notification = document.createElement("div")
    notification.textContent = message
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #4caf50;
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      z-index: 1000;
      font-weight: 600;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      animation: slideInBounce 0.5s ease-out;
      max-width: ${isMobile ? "280px" : "300px"};
      word-wrap: break-word;
    `

    // Add notification animation
    const style = document.createElement("style")
    style.textContent = `
      @keyframes slideInBounce {
        0% { 
          transform: translateX(100%) scale(0.8);
          opacity: 0;
        }
        60% { 
          transform: translateX(-10px) scale(1.05);
          opacity: 1;
        }
        100% { 
          transform: translateX(0) scale(1);
          opacity: 1;
        }
      }
    `
    document.head.appendChild(style)
    document.body.appendChild(notification)

    setTimeout(() => {
      if (document.body.contains(notification)) document.body.removeChild(notification)
      if (document.head.contains(style)) document.head.removeChild(style)
    }, 3000)
  }

  const toggleFlash = () => {
    const videoTrack = document.querySelector("video")?.srcObject?.getVideoTracks?.()?.[0]
    if (!videoTrack) {
      alert("🔦 Camera track not found")
      return
    }

    const capabilities = videoTrack.getCapabilities?.()
    if (capabilities?.torch) {
      videoTrack
        .applyConstraints({ advanced: [{ torch: !flashOn }] })
        .then(() => setFlashOn(!flashOn))
        .catch(() => alert("⚠️ Flash toggle failed"))
    } else {
      alert("🚫 Flash not supported on this device.")
    }
  }

  const resetScanning = () => {
    setProductAdded(false)
    setLastScannedProduct(null)
    setNfcReading(false)
    setShowBounce(false)
    setCameraError(null)
  }

  const getCartItemCount = () => {
    const cart = JSON.parse(localStorage.getItem("cart")) || []
    return cart.reduce((total, item) => total + (item.quantity || 1), 0)
  }

  // Manual QR input for testing
  const handleManualInput = () => {
    const qrCode = prompt("Enter QR Code or Product ID for testing:")
    if (qrCode && qrCode.trim()) {
      addProductToCart(qrCode.trim())
    }
  }

  return (
    <div className="qr-scanner-container">
      <div className="header">
        <h1>🛒 Pin & Pay</h1>
        <p className="subtitle">Scan or Tap to Add Products</p>
        {isMobile && (
          <div className="mobile-indicator">
            📱 Mobile Mode {!isHttps && <span className="https-warning">⚠️ HTTPS Required</span>}
          </div>
        )}
      </div>

      {/* Mode Toggle */}
      <div className="mode-toggle">
        <button className={`mode-btn ${scanMode === "qr" ? "active" : ""}`} onClick={() => setScanMode("qr")}>
          📷 QR Scan
        </button>
        <button
          className={`mode-btn ${scanMode === "nfc" ? "active" : ""}`}
          onClick={() => setScanMode("nfc")}
          disabled={!nfcSupported}
        >
          📱 NFC Tap {!nfcSupported && "(Not Supported)"}
        </button>
      </div>

      {/* Scanner Area */}
      <div className="scanner-area">
        {scanMode === "qr" && (
          <>
            {!isHttps && isMobile ? (
              <div className="https-container">
                <div className="https-icon">🔒❌</div>
                <h3>HTTPS Required</h3>
                <p>Camera access requires HTTPS on mobile devices</p>
                <div className="https-solutions">
                  <h4>Solutions:</h4>
                  <ul>
                    <li>Use HTTPS URL (https://your-domain.com)</li>
                    <li>Test on localhost (http://localhost:3000)</li>
                    <li>Deploy to Vercel/Netlify (automatic HTTPS)</li>
                  </ul>
                </div>
              </div>
            ) : cameraPermission === "denied" ? (
              <div className="permission-container">
                <div className="permission-icon">📷🚫</div>
                <h3>Camera Permission Required</h3>
                <p>Please allow camera access to scan QR codes</p>
                <div className="permission-steps">
                  <h4>How to enable {isMobile ? "(Mobile)" : ""}:</h4>
                  <ol>
                    {isMobile ? (
                      <>
                        <li>Tap the lock/info icon in address bar</li>
                        <li>Select "Permissions" or "Site Settings"</li>
                        <li>Allow "Camera" permission</li>
                        <li>Refresh the page</li>
                      </>
                    ) : (
                      <>
                        <li>Click the camera icon in address bar</li>
                        <li>Select "Always allow" for camera</li>
                        <li>Refresh the page</li>
                      </>
                    )}
                  </ol>
                </div>
                <button onClick={requestCameraPermission} className="permission-btn">
                  📷 Request Camera Access
                </button>
              </div>
            ) : cameraError ? (
              <div className="error-container">
                <div className="error-icon">📷❌</div>
                <h3>Camera Error</h3>
                <p className="error-message">{cameraError}</p>
                <div className="error-solutions">
                  <h4>Solutions {isMobile ? "(Mobile)" : ""}:</h4>
                  <ul>
                    {isMobile ? (
                      <>
                        <li>Close other camera apps (WhatsApp, Instagram, etc.)</li>
                        <li>Refresh the browser page</li>
                        <li>Try Chrome browser (recommended for mobile)</li>
                        <li>Allow camera permission in browser settings</li>
                        <li>Restart your browser app</li>
                      </>
                    ) : (
                      <>
                        <li>Close other camera apps (WhatsApp, Instagram, etc.)</li>
                        <li>Refresh the browser page (Ctrl+Shift+R)</li>
                        <li>Allow camera permission in browser settings</li>
                        <li>Try a different browser (Chrome recommended)</li>
                        <li>Restart your browser completely</li>
                      </>
                    )}
                  </ul>
                </div>

                {/* Camera Selection */}
                {availableCameras.length > 1 && (
                  <div className="camera-selection">
                    <h4>Try Different Camera:</h4>
                    <div className="camera-buttons">
                      {availableCameras.map((camera, index) => (
                        <button
                          key={camera.deviceId}
                          onClick={() => switchCamera(camera.deviceId)}
                          className={`camera-btn ${selectedCamera === camera.deviceId ? "active" : ""}`}
                        >
                          📷 {isMobile ? (index === 0 ? "Front" : "Back") : `Camera ${index + 1}`}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="manual-input">
                  <button onClick={handleManualInput} className="manual-btn">
                    ⌨️ Enter QR Code Manually
                  </button>
                </div>

                <button onClick={retryCamera} className="retry-btn" disabled={isLoading}>
                  {isLoading ? "🔄 Retrying..." : "🔄 Retry Camera"}
                </button>
              </div>
            ) : (
              <div className={`scanner-wrapper ${showBounce ? "bounce-animation" : ""}`}>
                <div id="reader"></div>
                {scanningStarted && !productAdded && (
                  <div className="scanner-overlay">
                    <div className="scanner-line"></div>
                    {isMobile && (
                      <div className="mobile-instructions">
                        <p>📱 Hold steady and point at QR code</p>
                      </div>
                    )}
                  </div>
                )}
                {isLoading && <div className="loading-overlay">Initializing Camera...</div>}
              </div>
            )}
          </>
        )}

        {scanMode === "nfc" && (
          <div className="nfc-area">
            <div className={`nfc-circle ${nfcReading ? "reading" : ""} ${showBounce ? "bounce-animation" : ""}`}>
              <div className="nfc-icon">📱</div>
              <p>{nfcReading ? "Ready to tap..." : "Tap to start NFC"}</p>
            </div>
            {!nfcReading && (
              <button className="nfc-start-btn" onClick={startNFCReading}>
                Start NFC Reading
              </button>
            )}
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="controls">
        {scanMode === "qr" && scanningStarted && !cameraError && (
          <button className="control-btn flash-btn" onClick={toggleFlash}>
            {flashOn ? "🔦 Flash OFF" : "💡 Flash ON"}
          </button>
        )}

        {scanMode === "qr" && (
          <button className="control-btn manual-btn" onClick={handleManualInput}>
            ⌨️ Manual Input
          </button>
        )}

        <button className="control-btn nfc-writer-btn" onClick={() => navigate("/nfc-writer")}>
          📱 NFC Writer Tool
        </button>
      </div>

      {/* Product Added Success */}
      {productAdded && lastScannedProduct && (
        <div className={`success-card ${showBounce ? "success-bounce" : ""}`}>
          <div className="success-header">
            <span className="success-icon">✅</span>
            <h3>Product Added!</h3>
          </div>
          <div className="product-info">
            <h4>{lastScannedProduct.name}</h4>
            <p className="product-price">₹{lastScannedProduct.price}</p>
            <p className="product-desc">{lastScannedProduct.description}</p>
          </div>
          <div className="action-buttons">
            <button onClick={() => navigate("/cart")} className="cart-btn">
              🛒 View Cart ({getCartItemCount()})
            </button>
            <button onClick={resetScanning} className="continue-btn">
              ➕ Add More Items
            </button>
          </div>
        </div>
      )}

      {/* Quick Cart Access */}
      {!productAdded && getCartItemCount() > 0 && (
        <div className="quick-cart">
          <button onClick={() => navigate("/cart")} className="quick-cart-btn">
            🛒 Cart ({getCartItemCount()})
          </button>
        </div>
      )}
    </div>
  )
}

export default QRScanner
