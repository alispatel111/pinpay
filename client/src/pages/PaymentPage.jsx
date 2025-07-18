import { useEffect, useState } from "react";
import axios from "axios";

const PaymentPage = () => {
  const [cart, setCart] = useState([]);
  const [invoiceLink, setInvoiceLink] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem("cart")) || [];
    setCart(storedCart);
  }, []);

  const getTotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const handlePayment = async () => {
    if (cart.length === 0) {
      alert("Cart is empty");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/orders/checkout`, {
        items: cart,
        totalAmount: getTotal()
      });

      if (res.data.invoiceUrl) {
        setInvoiceLink(`${import.meta.env.VITE_BACKEND_URL}${res.data.invoiceUrl}`);
        localStorage.removeItem("cart");
      }
    } catch (error) {
      alert("Payment failed or server error");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>💳 Payment Page</h2>
      <p>Total: ₹{getTotal()}</p>
      <button onClick={handlePayment} disabled={loading}>
        {loading ? "Processing..." : "Pay Now"}
      </button>

      {invoiceLink && (
        <div>
          <h4>✅ Payment Successful!</h4>
          <a href={invoiceLink} target="_blank" rel="noopener noreferrer">
            📄 Download Invoice
          </a>
        </div>
      )}
    </div>
  );
};

export default PaymentPage;
