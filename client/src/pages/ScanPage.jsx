import QRScanner from "../components/QRScanner";
import { useNavigate } from "react-router-dom";

const ScanPage = () => {
  const navigate = useNavigate();

  const handleScan = async (qrId) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/products/${qrId}`);
      const data = await res.json();
      let cart = JSON.parse(localStorage.getItem("cart")) || [];
      cart.push({ ...data, quantity: 1 });
      localStorage.setItem("cart", JSON.stringify(cart));
      alert(`${data.name} added to cart`);
    } catch (error) {
      alert("❌ Invalid QR or product not found");
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>📲 Pin & Pay</h1>
      <p style={styles.subheading}>Scan product QR to add items to your cart</p>

      <div style={styles.qrBox}>
        <QRScanner onScan={handleScan} />
      </div>

      <p style={styles.instructions}>
        <strong>How it works:</strong><br />
        ✅ Scan QR code on any product<br />
        ✅ Product gets added to cart<br />
        ✅ Click "Go to Cart" to review your items<br />
        ✅ Checkout & get invoice instantly
      </p>

      <button onClick={() => navigate("/cart")} style={styles.cartBtn}>🛒 Go to Cart</button>
    </div>
  );
};

const styles = {
  container: {
    textAlign: "center",
    padding: "2rem",
    backgroundColor: "#1e1e1e",
    color: "#f2f2f2",
    minHeight: "100vh",
  },
  heading: {
    fontSize: "2rem",
    marginBottom: "1rem",
  },
  subheading: {
    fontSize: "1.1rem",
    marginBottom: "1rem",
  },
  qrBox: {
    width: "300px",
    margin: "0 auto",
    border: "2px dashed #888",
    padding: "10px",
    borderRadius: "10px",
    background: "#000",
  },
  instructions: {
    marginTop: "1.5rem",
    textAlign: "left",
    maxWidth: "400px",
    margin: "1.5rem auto",
    fontSize: "0.95rem",
    lineHeight: "1.6",
  },
  cartBtn: {
    marginTop: "20px",
    padding: "10px 20px",
    fontSize: "1rem",
    background: "#00c853",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  }
};

export default ScanPage;
