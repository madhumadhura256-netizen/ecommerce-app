import { useEffect, useState } from "react";
import axios from "axios";

export default function AdminDashboard() {
  const [products, setProducts] = useState([]);

  const [formData, setFormData] = useState({
    name: "",
    price: "",
    category: "",
    stock: "",
    image: "",
    description: "",
  });

  // FETCH PRODUCTS
  const fetchProducts = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/products");
      setProducts(res.data.products || []);
    } catch (err) {
      console.log("Fetch error:", err);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // INPUT CHANGE
  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // ADD PRODUCT
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");

      const payload = {
        name: formData.name,
        description: formData.description,
        price: Number(formData.price),
        category: formData.category.toLowerCase().trim(),
        stock: Number(formData.stock),
        images: formData.image ? [formData.image] : [],
      };

      await axios.post("http://localhost:5000/api/products", payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      alert("Product added ✅");

      setFormData({
        name: "",
        price: "",
        category: "",
        stock: "",
        image: "",
        description: "",
      });

      fetchProducts();
    } catch (err) {
      console.log(err);
      alert(err.response?.data?.message || "Failed to add product");
    }
  };

  // DELETE PRODUCT
  const deleteProduct = async (id) => {
    try {
      const token = localStorage.getItem("token");

      await axios.delete(`http://localhost:5000/api/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      fetchProducts();
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard 🛠️</h1>

      {/* FORM */}
      <form className="admin-form" onSubmit={handleSubmit}>
        <input
          name="name"
          placeholder="Name"
          onChange={handleChange}
          value={formData.name}
        />
        <input
          name="description"
          placeholder="Description"
          onChange={handleChange}
          value={formData.description}
        />
        <input
          name="price"
          placeholder="Price"
          type="number"
          onChange={handleChange}
          value={formData.price}
        />
        <input
          name="category"
          placeholder="Category"
          onChange={handleChange}
          value={formData.category}
        />
        <input
          name="stock"
          placeholder="Stock"
          type="number"
          onChange={handleChange}
          value={formData.stock}
        />
        <input
          name="image"
          placeholder="Image URL"
          onChange={handleChange}
          value={formData.image}
        />

        <button type="submit">Add Product</button>
      </form>

      {/* PRODUCT LIST */}
      <h2>Products</h2>

      <div className="product-list">
        {products.map((p) => (
          <div key={p._id} className="product-card">
            <h3>{p.name}</h3>
            <p>₹{p.price}</p>
            <button onClick={() => deleteProduct(p._id)}>Delete</button>
          </div>
        ))}
      </div>

      {/* STYLE */}
      <style>{`
        .admin-dashboard {
          padding: 30px;
          min-height: 100vh;
          background: var(--bg, #ffffff);
          color: var(--text, #111);
          transition: all 0.3s ease;
        }

        h1, h2, h3, p {
          color: var(--text, #111);
        }

        .admin-form {
          display: flex;
          flex-direction: column;
          max-width: 400px;
          gap: 10px;
          margin-bottom: 30px;
        }

        input {
          padding: 10px;
          border-radius: 8px;
          border: 1px solid #ccc;
          background: var(--input-bg, #fff);
          color: var(--text, #111);
        }

        button {
          padding: 10px;
          border-radius: 8px;
          border: none;
          background: #ff6b35;
          color: white;
          cursor: pointer;
          font-weight: bold;
        }

        button:hover {
          opacity: 0.9;
        }

        .product-list {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 15px;
        }

        .product-card {
          padding: 15px;
          border-radius: 12px;
          border: 1px solid #ddd;
          background: var(--card, #fff);
        }

        /* DARK MODE FIX */
        .dark .admin-dashboard {
          background: #0f172a;
          color: #f1f5f9;
        }

        .dark input {
          background: #1e293b;
          color: #f1f5f9;
          border: 1px solid #334155;
        }

        .dark .product-card {
          background: #1e293b;
          border: 1px solid #334155;
        }

        .dark button {
          background: #ff6b35;
        }
      `}</style>
    </div>
  );
}