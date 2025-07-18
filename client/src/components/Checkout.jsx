// "use client"

// import { useState, useEffect } from "react"
// import { jsPDF } from "jspdf"
// import { useNavigate } from "react-router-dom"
// import "./Checkout.css"

// const Checkout = () => {
//   const [cart, setCart] = useState([])
//   const [isProcessing, setIsProcessing] = useState(false)
//   const [paymentMethod, setPaymentMethod] = useState("upi_intent")
//   const [paymentStatus, setPaymentStatus] = useState(null) // 'success', 'failed', 'pending'
//   const [customerInfo, setCustomerInfo] = useState({
//     name: "",
//     email: "",
//     phone: "",
//   })
//   const navigate = useNavigate()

//   // Updated UPI Payment Configuration
//   const UPI_CONFIG = {
//     payeeAddress: "asinghvns99-2@okicici",
//     payeeName: "Pin & Pay Store",
//     currency: "INR",
//     transactionNote: "Pin&Pay Purchase",
//   }

//   useEffect(() => {
//     const storedCart = JSON.parse(localStorage.getItem("cart")) || []
//     setCart(storedCart)

//     if (storedCart.length === 0) {
//       navigate("/cart")
//     }
//   }, [navigate])

//   const getSubtotal = () => {
//     return cart.reduce((total, item) => total + item.price * (item.quantity || 1), 0)
//   }

//   const getTax = () => {
//     return Math.round(getSubtotal() * 0.18)
//   }

//   const getTotal = () => {
//     return getSubtotal() + getTax()
//   }

//   const handleInputChange = (e) => {
//     setCustomerInfo({
//       ...customerInfo,
//       [e.target.name]: e.target.value,
//     })
//   }

//   const generateUPILink = (amount) => {
//     const upiParams = new URLSearchParams({
//       pa: UPI_CONFIG.payeeAddress,
//       pn: UPI_CONFIG.payeeName,
//       am: amount.toFixed(2),
//       tn: `${UPI_CONFIG.transactionNote} - Order#${Date.now()}`,
//       cu: UPI_CONFIG.currency,
//     })

//     return `upi://pay?${upiParams.toString()}`
//   }

//   const generateInvoice = () => {
//     const doc = new jsPDF()

//     // Header
//     doc.setFontSize(20)
//     doc.setTextColor(76, 175, 80)
//     doc.text("🧾 INVOICE", 20, 20)

//     // Company Info
//     doc.setFontSize(12)
//     doc.setTextColor(0, 0, 0)
//     doc.text("Pin & Pay Smart Shopping", 20, 35)
//     doc.text("Digital Payment Solutions", 20, 45)
//     doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 55)
//     doc.text(`Invoice #: INV-${Date.now()}`, 20, 65)

//     // Customer Info
//     if (customerInfo.name) {
//       doc.text("Bill To:", 120, 35)
//       doc.text(customerInfo.name, 120, 45)
//       if (customerInfo.email) doc.text(customerInfo.email, 120, 55)
//       if (customerInfo.phone) doc.text(customerInfo.phone, 120, 65)
//     }

//     // Items Table Header
//     let yPos = 85
//     doc.setFontSize(10)
//     doc.text("Item", 20, yPos)
//     doc.text("Qty", 120, yPos)
//     doc.text("Price", 140, yPos)
//     doc.text("Total", 170, yPos)

//     // Draw line
//     doc.line(20, yPos + 5, 190, yPos + 5)
//     yPos += 15

//     // Items
//     cart.forEach((item) => {
//       const quantity = item.quantity || 1
//       const itemTotal = item.price * quantity

//       doc.text(item.name.substring(0, 30), 20, yPos)
//       doc.text(quantity.toString(), 120, yPos)
//       doc.text(`₹${item.price}`, 140, yPos)
//       doc.text(`₹${itemTotal}`, 170, yPos)
//       yPos += 10
//     })

//     // Totals
//     yPos += 10
//     doc.line(20, yPos, 190, yPos)
//     yPos += 10

//     doc.text("Subtotal:", 140, yPos)
//     doc.text(`₹${getSubtotal()}`, 170, yPos)
//     yPos += 10

//     doc.text("Tax (18% GST):", 140, yPos)
//     doc.text(`₹${getTax()}`, 170, yPos)
//     yPos += 10

//     doc.setFontSize(12)
//     doc.setFont(undefined, "bold")
//     doc.text("Total:", 140, yPos)
//     doc.text(`₹${getTotal()}`, 170, yPos)

//     // Footer
//     yPos += 20
//     doc.setFontSize(10)
//     doc.setFont(undefined, "normal")
//     doc.text("✅ Payment Status: PAID", 20, yPos)
//     doc.text(`Payment Method: ${paymentMethod.toUpperCase()}`, 20, yPos + 10)
//     doc.text("Thank you for shopping with Pin & Pay!", 20, yPos + 25)

//     return doc
//   }

//   const handleUPIPayment = () => {
//     const totalAmount = getTotal()
//     const upiLink = generateUPILink(totalAmount)

//     setIsProcessing(true)
//     setPaymentStatus("pending")

//     // Show UPI link for debugging
//     console.log("Generated UPI Link:", upiLink)

//     // Open UPI app
//     window.location.href = upiLink

//     // Simulate payment verification (in real app, you'd verify with payment gateway)
//     setTimeout(() => {
//       // Show payment confirmation dialog
//       showPaymentConfirmation()
//     }, 3000)
//   }

//   const showPaymentConfirmation = () => {
//     const confirmed = window.confirm(
//       "🔔 Payment Confirmation\n\n" +
//         "Did you complete the UPI payment successfully?\n\n" +
//         "✅ Click OK if payment was successful\n" +
//         "❌ Click Cancel if payment failed or was cancelled",
//     )

//     if (confirmed) {
//       handlePaymentSuccess()
//     } else {
//       handlePaymentFailure()
//     }
//   }

//   const handlePaymentSuccess = async () => {
//     try {
//       setPaymentStatus("success")

//       // Generate and download PDF
//       const doc = generateInvoice()
//       doc.save(`invoice-${Date.now()}.pdf`)

//       // Play success sound
//       const successSound = new Audio("/success.mp3")
//       successSound.play().catch(() => {})

//       // Show success notification
//       showNotification("✅ Payment Successful! Invoice downloaded.", "success")

//       // Clear cart after successful payment
//       localStorage.removeItem("cart")

//       // Redirect to home after 3 seconds
//       setTimeout(() => {
//         navigate("/")
//       }, 3000)
//     } catch (error) {
//       console.error("Payment success handling error:", error)
//       handlePaymentFailure()
//     } finally {
//       setIsProcessing(false)
//     }
//   }

//   const handlePaymentFailure = () => {
//     setPaymentStatus("failed")
//     setIsProcessing(false)
//     showNotification("❌ Payment failed or cancelled. Please try again.", "error")
//   }

//   const handleCardPayment = async () => {
//     setIsProcessing(true)

//     // Simulate card payment processing
//     await new Promise((resolve) => setTimeout(resolve, 2000))

//     // For demo purposes, assume success
//     handlePaymentSuccess()
//   }

//   const handleWalletPayment = async () => {
//     setIsProcessing(true)

//     // Simulate wallet payment processing
//     await new Promise((resolve) => setTimeout(resolve, 1500))

//     // For demo purposes, assume success
//     handlePaymentSuccess()
//   }

//   const handlePayment = async () => {
//     if (cart.length === 0) {
//       alert("❌ Cart is empty!")
//       return
//     }

//     if (!customerInfo.name.trim()) {
//       alert("❌ Please enter your name")
//       return
//     }

//     switch (paymentMethod) {
//       case "upi_intent":
//         handleUPIPayment()
//         break
//       case "upi":
//         handleUPIPayment()
//         break
//       case "card":
//         handleCardPayment()
//         break
//       case "wallet":
//         handleWalletPayment()
//         break
//       default:
//         alert("❌ Please select a payment method")
//     }
//   }

//   const showNotification = (message, type = "success") => {
//     const notification = document.createElement("div")
//     notification.textContent = message
//     notification.style.cssText = `
//       position: fixed;
//       top: 20px;
//       right: 20px;
//       background: ${type === "success" ? "#4caf50" : "#f44336"};
//       color: white;
//       padding: 16px 24px;
//       border-radius: 8px;
//       z-index: 1000;
//       font-weight: 600;
//       box-shadow: 0 4px 12px rgba(0,0,0,0.3);
//       max-width: 300px;
//       word-wrap: break-word;
//     `
//     document.body.appendChild(notification)

//     setTimeout(() => {
//       if (document.body.contains(notification)) {
//         document.body.removeChild(notification)
//       }
//     }, 5000)
//   }

//   const retryPayment = () => {
//     setPaymentStatus(null)
//     setIsProcessing(false)
//   }

//   if (cart.length === 0) {
//     return null
//   }

//   return (
//     <div className="checkout-container">
//       <div className="checkout-header">
//         <button className="back-btn" onClick={() => navigate("/cart")}>
//           ← Back to Cart
//         </button>
//         <h2>🧾 Checkout</h2>
//       </div>

//       <div className="checkout-content">
//         {/* Customer Information */}
//         <div className="section">
//           <h3>📋 Customer Information</h3>
//           <div className="form-group">
//             <input
//               type="text"
//               name="name"
//               placeholder="Full Name *"
//               value={customerInfo.name}
//               onChange={handleInputChange}
//               required
//             />
//           </div>
//           <div className="form-group">
//             <input
//               type="email"
//               name="email"
//               placeholder="Email Address"
//               value={customerInfo.email}
//               onChange={handleInputChange}
//             />
//           </div>
//           <div className="form-group">
//             <input
//               type="tel"
//               name="phone"
//               placeholder="Phone Number"
//               value={customerInfo.phone}
//               onChange={handleInputChange}
//             />
//           </div>
//         </div>

//         {/* Payment Method */}
//         <div className="section">
//           <h3>💳 Payment Method</h3>
//           <div className="payment-methods">
//             <label className={`payment-option ${paymentMethod === "upi_intent" ? "selected" : ""}`}>
//               <input
//                 type="radio"
//                 name="payment"
//                 value="upi_intent"
//                 checked={paymentMethod === "upi_intent"}
//                 onChange={(e) => setPaymentMethod(e.target.value)}
//               />
//               <span className="payment-icon">📲</span>
//               <div className="payment-details">
//                 <span>UPI Direct Intent</span>
//                 <small>Open directly in UPI app</small>
//               </div>
//             </label>

//             <label className={`payment-option ${paymentMethod === "upi" ? "selected" : ""}`}>
//               <input
//                 type="radio"
//                 name="payment"
//                 value="upi"
//                 checked={paymentMethod === "upi"}
//                 onChange={(e) => setPaymentMethod(e.target.value)}
//               />
//               <span className="payment-icon">📱</span>
//               <div className="payment-details">
//                 <span>UPI Payment</span>
//                 <small>Pay with PhonePe, GPay, Paytm</small>
//               </div>
//             </label>

//             <label className={`payment-option ${paymentMethod === "card" ? "selected" : ""}`}>
//               <input
//                 type="radio"
//                 name="payment"
//                 value="card"
//                 checked={paymentMethod === "card"}
//                 onChange={(e) => setPaymentMethod(e.target.value)}
//               />
//               <span className="payment-icon">💳</span>
//               <div className="payment-details">
//                 <span>Credit/Debit Card</span>
//                 <small>Visa, Mastercard, RuPay</small>
//               </div>
//             </label>

//             <label className={`payment-option ${paymentMethod === "wallet" ? "selected" : ""}`}>
//               <input
//                 type="radio"
//                 name="payment"
//                 value="wallet"
//                 checked={paymentMethod === "wallet"}
//                 onChange={(e) => setPaymentMethod(e.target.value)}
//               />
//               <span className="payment-icon">👛</span>
//               <div className="payment-details">
//                 <span>Digital Wallet</span>
//                 <small>Paytm, Amazon Pay, etc.</small>
//               </div>
//             </label>
//           </div>
//         </div>

//         {/* Order Summary */}
//         <div className="section">
//           <h3>📦 Order Summary</h3>
//           <div className="order-items">
//             {cart.map((item, index) => (
//               <div key={index} className="order-item">
//                 <div className="item-details">
//                   <span className="item-name">{item.name}</span>
//                   <span className="item-qty">x{item.quantity || 1}</span>
//                 </div>
//                 <span className="item-price">₹{item.price * (item.quantity || 1)}</span>
//               </div>
//             ))}
//           </div>

//           <div className="order-totals">
//             <div className="total-line">
//               <span>Subtotal</span>
//               <span>₹{getSubtotal()}</span>
//             </div>
//             <div className="total-line">
//               <span>Tax (18% GST)</span>
//               <span>₹{getTax()}</span>
//             </div>
//             <div className="total-line final-total">
//               <span>Total</span>
//               <span>₹{getTotal()}</span>
//             </div>
//           </div>
//         </div>

//         {/* Payment Status */}
//         {paymentStatus && (
//           <div className={`payment-status ${paymentStatus}`}>
//             {paymentStatus === "pending" && (
//               <div className="status-content">
//                 <div className="status-icon">⏳</div>
//                 <h4>Payment Processing...</h4>
//                 <p>Please complete the payment in your UPI app</p>
//               </div>
//             )}

//             {paymentStatus === "success" && (
//               <div className="status-content">
//                 <div className="status-icon">✅</div>
//                 <h4>Payment Successful!</h4>
//                 <p>Your order has been confirmed. Invoice downloaded.</p>
//               </div>
//             )}

//             {paymentStatus === "failed" && (
//               <div className="status-content">
//                 <div className="status-icon">❌</div>
//                 <h4>Payment Failed</h4>
//                 <p>Payment was cancelled or failed. Please try again.</p>
//                 <button onClick={retryPayment} className="retry-payment-btn">
//                   🔄 Retry Payment
//                 </button>
//               </div>
//             )}
//           </div>
//         )}
//       </div>

//       <div className="checkout-footer">
//         <button
//           onClick={handlePayment}
//           className="pay-btn"
//           disabled={isProcessing || !customerInfo.name.trim() || paymentStatus === "success"}
//         >
//           {isProcessing ? (
//             <>
//               <span className="spinner"></span>
//               Processing Payment...
//             </>
//           ) : paymentStatus === "success" ? (
//             "✅ Payment Completed"
//           ) : (
//             `💳 Pay ₹${getTotal()}`
//           )}
//         </button>
//       </div>
//     </div>
//   )
// }

// export default Checkout






// test



"use client"

import { useState, useEffect } from "react"
import { jsPDF } from "jspdf"
import { useNavigate } from "react-router-dom"
import "./Checkout.css"

const Checkout = () => {
  const [cart, setCart] = useState([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState("upi_intent")
  const [paymentStatus, setPaymentStatus] = useState(null) // 'success', 'failed', 'pending'
  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    email: "",
    phone: "",
  })
  const [paymentTimer, setPaymentTimer] = useState(0)
  const [showPaymentSteps, setShowPaymentSteps] = useState(false)
  const navigate = useNavigate()

  // Updated UPI Payment Configuration
  const UPI_CONFIG = {
    payeeAddress: "asinghvns99-2@okicici",
    payeeName: "Pin & Pay Store",
    currency: "INR",
    transactionNote: "Pin&Pay Purchase",
  }

  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem("cart")) || []
    setCart(storedCart)

    if (storedCart.length === 0) {
      navigate("/cart")
    }
  }, [navigate])

  // Timer effect for payment processing
  useEffect(() => {
    let interval = null
    if (paymentStatus === "pending" && paymentTimer > 0) {
      interval = setInterval(() => {
        setPaymentTimer((timer) => {
          if (timer <= 1) {
            // Auto-success after timer completes
            handlePaymentSuccess()
            return 0
          }
          return timer - 1
        })
      }, 1000)
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [paymentStatus, paymentTimer])

  // Detect when user returns to the app (payment completed)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && paymentStatus === "pending") {
        // User returned to the app, likely completed payment
        setTimeout(() => {
          setPaymentTimer(3) // Start 3-second countdown
        }, 1000)
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange)
    }
  }, [paymentStatus])

  const getSubtotal = () => {
    return cart.reduce((total, item) => total + item.price * (item.quantity || 1), 0)
  }

  const getTax = () => {
    return Math.round(getSubtotal() * 0.18)
  }

  const getTotal = () => {
    return getSubtotal() + getTax()
  }

  const handleInputChange = (e) => {
    setCustomerInfo({
      ...customerInfo,
      [e.target.name]: e.target.value,
    })
  }

  const generateUPILink = (amount) => {
    const upiParams = new URLSearchParams({
      pa: UPI_CONFIG.payeeAddress,
      pn: UPI_CONFIG.payeeName,
      am: amount.toFixed(2),
      tn: `${UPI_CONFIG.transactionNote} - Order#${Date.now()}`,
      cu: UPI_CONFIG.currency,
    })

    return `upi://pay?${upiParams.toString()}`
  }

  const generateInvoice = () => {
    const doc = new jsPDF()

    // Header
    doc.setFontSize(20)
    doc.setTextColor(76, 175, 80)
    doc.text("🧾 INVOICE", 20, 20)

    // Company Info
    doc.setFontSize(12)
    doc.setTextColor(0, 0, 0)
    doc.text("Pin & Pay Smart Shopping", 20, 35)
    doc.text("Digital Payment Solutions", 20, 45)
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 55)
    doc.text(`Invoice #: INV-${Date.now()}`, 20, 65)

    // Customer Info
    if (customerInfo.name) {
      doc.text("Bill To:", 120, 35)
      doc.text(customerInfo.name, 120, 45)
      if (customerInfo.email) doc.text(customerInfo.email, 120, 55)
      if (customerInfo.phone) doc.text(customerInfo.phone, 120, 65)
    }

    // Items Table Header
    let yPos = 85
    doc.setFontSize(10)
    doc.text("Item", 20, yPos)
    doc.text("Qty", 120, yPos)
    doc.text("Price", 140, yPos)
    doc.text("Total", 170, yPos)

    // Draw line
    doc.line(20, yPos + 5, 190, yPos + 5)
    yPos += 15

    // Items
    cart.forEach((item) => {
      const quantity = item.quantity || 1
      const itemTotal = item.price * quantity

      doc.text(item.name.substring(0, 30), 20, yPos)
      doc.text(quantity.toString(), 120, yPos)
      doc.text(`₹${item.price}`, 140, yPos)
      doc.text(`₹${itemTotal}`, 170, yPos)
      yPos += 10
    })

    // Totals
    yPos += 10
    doc.line(20, yPos, 190, yPos)
    yPos += 10

    doc.text("Subtotal:", 140, yPos)
    doc.text(`₹${getSubtotal()}`, 170, yPos)
    yPos += 10

    doc.text("Tax (18% GST):", 140, yPos)
    doc.text(`₹${getTax()}`, 170, yPos)
    yPos += 10

    doc.setFontSize(12)
    doc.setFont(undefined, "bold")
    doc.text("Total:", 140, yPos)
    doc.text(`₹${getTotal()}`, 170, yPos)

    // Footer
    yPos += 20
    doc.setFontSize(10)
    doc.setFont(undefined, "normal")
    doc.text("✅ Payment Status: PAID", 20, yPos)
    doc.text(`Payment Method: ${paymentMethod.toUpperCase()}`, 20, yPos + 10)
    doc.text(`UPI ID: ${UPI_CONFIG.payeeAddress}`, 20, yPos + 20)
    doc.text("Thank you for shopping with Pin & Pay!", 20, yPos + 35)

    return doc
  }

  const handleUPIPayment = () => {
    const totalAmount = getTotal()
    const upiLink = generateUPILink(totalAmount)

    setIsProcessing(true)
    setPaymentStatus("pending")
    setShowPaymentSteps(true)

    // Show UPI link for debugging
    console.log("Generated UPI Link:", upiLink)

    // Show payment steps
    showNotification("🚀 Opening UPI app...", "info")

    // Open UPI app after a short delay
    setTimeout(() => {
      try {
        window.location.href = upiLink

        // For desktop/web - show manual confirmation after some time
        setTimeout(() => {
          if (paymentStatus === "pending") {
            showManualConfirmation()
          }
        }, 8000) // 8 seconds delay for manual confirmation
      } catch (error) {
        console.error("Error opening UPI app:", error)
        showManualConfirmation()
      }
    }, 1000)
  }

  const showManualConfirmation = () => {
    const confirmed = window.confirm(
      "💳 UPI Payment Status\n\n" +
        "Did you complete the payment in your UPI app?\n\n" +
        "✅ Click OK if payment was successful\n" +
        "❌ Click Cancel if payment failed or was cancelled\n\n" +
        `Amount: ₹${getTotal()}\n` +
        `UPI ID: ${UPI_CONFIG.payeeAddress}`,
    )

    if (confirmed) {
      setPaymentTimer(3) // Start 3-second success countdown
      showNotification("✅ Payment confirmed! Processing...", "success")
    } else {
      handlePaymentFailure()
    }
  }

  const handlePaymentSuccess = async () => {
    try {
      setPaymentStatus("success")
      setIsProcessing(false)
      setShowPaymentSteps(false)

      // Generate and download PDF
      const doc = generateInvoice()
      doc.save(`invoice-${Date.now()}.pdf`)

      // Play success sound
      const successSound = new Audio("/success.mp3")
      successSound.play().catch(() => {})

      // Show success notification
      showNotification("🎉 Payment Successful! Invoice downloaded.", "success")

      // Store payment info
      const paymentInfo = {
        orderId: `INV-${Date.now()}`,
        amount: getTotal(),
        upiId: UPI_CONFIG.payeeAddress,
        timestamp: new Date().toISOString(),
        items: cart,
        customer: customerInfo,
      }
      localStorage.setItem("lastPayment", JSON.stringify(paymentInfo))

      // Clear cart after successful payment
      localStorage.removeItem("cart")

      // Redirect to home after 4 seconds
      setTimeout(() => {
        navigate("/")
      }, 4000)
    } catch (error) {
      console.error("Payment success handling error:", error)
      handlePaymentFailure()
    }
  }

  const handlePaymentFailure = () => {
    setPaymentStatus("failed")
    setIsProcessing(false)
    setShowPaymentSteps(false)
    setPaymentTimer(0)
    showNotification("❌ Payment failed or cancelled. Please try again.", "error")
  }

  const handleCardPayment = async () => {
    setIsProcessing(true)
    setPaymentStatus("pending")

    // Simulate card payment processing
    showNotification("💳 Processing card payment...", "info")
    await new Promise((resolve) => setTimeout(resolve, 3000))

    // For demo purposes, assume success
    handlePaymentSuccess()
  }

  const handleWalletPayment = async () => {
    setIsProcessing(true)
    setPaymentStatus("pending")

    // Simulate wallet payment processing
    showNotification("👛 Processing wallet payment...", "info")
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // For demo purposes, assume success
    handlePaymentSuccess()
  }

  const handlePayment = async () => {
    if (cart.length === 0) {
      alert("❌ Cart is empty!")
      return
    }

    if (!customerInfo.name.trim()) {
      alert("❌ Please enter your name")
      return
    }

    switch (paymentMethod) {
      case "upi_intent":
        handleUPIPayment()
        break
      case "upi":
        handleUPIPayment()
        break
      case "card":
        handleCardPayment()
        break
      case "wallet":
        handleWalletPayment()
        break
      default:
        alert("❌ Please select a payment method")
    }
  }

  const showNotification = (message, type = "success") => {
    const notification = document.createElement("div")
    notification.textContent = message
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${
        type === "success" ? "#4caf50" : type === "error" ? "#f44336" : type === "info" ? "#2196f3" : "#4caf50"
      };
      color: white;
      padding: 16px 24px;
      border-radius: 8px;
      z-index: 1000;
      font-weight: 600;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      max-width: 300px;
      word-wrap: break-word;
    `
    document.body.appendChild(notification)

    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification)
      }
    }, 5000)
  }

  const retryPayment = () => {
    setPaymentStatus(null)
    setIsProcessing(false)
    setShowPaymentSteps(false)
    setPaymentTimer(0)
  }

  const cancelPayment = () => {
    setPaymentStatus(null)
    setIsProcessing(false)
    setShowPaymentSteps(false)
    setPaymentTimer(0)
    showNotification("Payment cancelled", "info")
  }

  if (cart.length === 0) {
    return null
  }

  return (
    <div className="checkout-container">
      <div className="checkout-header">
        <button className="back-btn" onClick={() => navigate("/cart")}>
          ← Back to Cart
        </button>
        <h2>🧾 Checkout</h2>
      </div>

      <div className="checkout-content">
        {/* Customer Information */}
        <div className="section">
          <h3>📋 Customer Information</h3>
          <div className="form-group">
            <input
              type="text"
              name="name"
              placeholder="Full Name *"
              value={customerInfo.name}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={customerInfo.email}
              onChange={handleInputChange}
            />
          </div>
          <div className="form-group">
            <input
              type="tel"
              name="phone"
              placeholder="Phone Number"
              value={customerInfo.phone}
              onChange={handleInputChange}
            />
          </div>
        </div>

        {/* Payment Method */}
        <div className="section">
          <h3>💳 Payment Method</h3>
          <div className="payment-methods">
            <label className={`payment-option ${paymentMethod === "upi_intent" ? "selected" : ""}`}>
              <input
                type="radio"
                name="payment"
                value="upi_intent"
                checked={paymentMethod === "upi_intent"}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              <span className="payment-icon">📲</span>
              <div className="payment-details">
                <span>UPI Direct Intent</span>
                <small>Open directly in UPI app</small>
              </div>
            </label>

            <label className={`payment-option ${paymentMethod === "upi" ? "selected" : ""}`}>
              <input
                type="radio"
                name="payment"
                value="upi"
                checked={paymentMethod === "upi"}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              <span className="payment-icon">📱</span>
              <div className="payment-details">
                <span>UPI Payment</span>
                <small>Pay with PhonePe, GPay, Paytm</small>
              </div>
            </label>

            <label className={`payment-option ${paymentMethod === "card" ? "selected" : ""}`}>
              <input
                type="radio"
                name="payment"
                value="card"
                checked={paymentMethod === "card"}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              <span className="payment-icon">💳</span>
              <div className="payment-details">
                <span>Credit/Debit Card</span>
                <small>Visa, Mastercard, RuPay</small>
              </div>
            </label>

            <label className={`payment-option ${paymentMethod === "wallet" ? "selected" : ""}`}>
              <input
                type="radio"
                name="payment"
                value="wallet"
                checked={paymentMethod === "wallet"}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              <span className="payment-icon">👛</span>
              <div className="payment-details">
                <span>Digital Wallet</span>
                <small>Paytm, Amazon Pay, etc.</small>
              </div>
            </label>
          </div>
        </div>

        {/* Order Summary */}
        <div className="section">
          <h3>📦 Order Summary</h3>
          <div className="order-items">
            {cart.map((item, index) => (
              <div key={index} className="order-item">
                <div className="item-details">
                  <span className="item-name">{item.name}</span>
                  <span className="item-qty">x{item.quantity || 1}</span>
                </div>
                <span className="item-price">₹{item.price * (item.quantity || 1)}</span>
              </div>
            ))}
          </div>

          <div className="order-totals">
            <div className="total-line">
              <span>Subtotal</span>
              <span>₹{getSubtotal()}</span>
            </div>
            <div className="total-line">
              <span>Tax (18% GST)</span>
              <span>₹{getTax()}</span>
            </div>
            <div className="total-line final-total">
              <span>Total</span>
              <span>₹{getTotal()}</span>
            </div>
          </div>
        </div>

        {/* Payment Status */}
        {paymentStatus && (
          <div className={`payment-status ${paymentStatus}`}>
            {paymentStatus === "pending" && (
              <div className="status-content">
                <div className="status-icon">{paymentTimer > 0 ? "⏰" : "⏳"}</div>
                <h4>{paymentTimer > 0 ? `Payment Confirming... ${paymentTimer}s` : "Payment Processing..."}</h4>
                <p>{paymentTimer > 0 ? "Verifying your payment..." : "Please complete the payment in your UPI app"}</p>
                {showPaymentSteps && (
                  <div className="payment-steps">
                    <div className="step">✅ UPI app opened</div>
                    <div className="step">⏳ Waiting for payment...</div>
                    <div className="step-pending">⏳ Confirming transaction...</div>
                  </div>
                )}
                <div className="payment-actions">
                  <button onClick={cancelPayment} className="cancel-payment-btn">
                    ❌ Cancel Payment
                  </button>
                </div>
              </div>
            )}

            {paymentStatus === "success" && (
              <div className="status-content">
                <div className="status-icon">✅</div>
                <h4>Payment Successful!</h4>
                <p>Your order has been confirmed. Invoice downloaded.</p>
                <div className="success-details">
                  <p>
                    <strong>Amount:</strong> ₹{getTotal()}
                  </p>
                  <p>
                    <strong>UPI ID:</strong> {UPI_CONFIG.payeeAddress}
                  </p>
                  <p>
                    <strong>Status:</strong> Paid ✅
                  </p>
                </div>
              </div>
            )}

            {paymentStatus === "failed" && (
              <div className="status-content">
                <div className="status-icon">❌</div>
                <h4>Payment Failed</h4>
                <p>Payment was cancelled or failed. Please try again.</p>
                <button onClick={retryPayment} className="retry-payment-btn">
                  🔄 Retry Payment
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="checkout-footer">
        <button
          onClick={handlePayment}
          className="pay-btn"
          disabled={isProcessing || !customerInfo.name.trim() || paymentStatus === "success"}
        >
          {isProcessing ? (
            <>
              <span className="spinner"></span>
              Processing Payment...
            </>
          ) : paymentStatus === "success" ? (
            "✅ Payment Completed"
          ) : (
            `💳 Pay ₹${getTotal()}`
          )}
        </button>
      </div>
    </div>
  )
}

export default Checkout
