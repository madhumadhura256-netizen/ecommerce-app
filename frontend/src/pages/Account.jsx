import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export default function Account() {
  const { user, logout } = useContext(AuthContext);

  return (
    <div className="account-page">
      <div className="account-card">
        <div className="profile-avatar">
          {user?.name?.charAt(0) || "U"}
        </div>

        <h1>{user?.name || "Guest User"}</h1>

        <p>{user?.email || "No email found"}</p>

        <div className="account-info">
          <div className="info-box">
            <span>📧</span>
            <div>
              <h4>Email</h4>
              <p>{user?.email}</p>
            </div>
          </div>

          <div className="info-box">
            <span>📱</span>
            <div>
              <h4>Phone</h4>
              <p>{user?.phone || "Not added"}</p>
            </div>
          </div>
        </div>

        <button
          onClick={logout}
          className="logout-btn"
        >
          Logout
        </button>
      </div>

      <style>{`
        .account-page {
          min-height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 30px;
        }

        .account-card {
          width: 100%;
          max-width: 500px;
          background: white;
          border-radius: 28px;
          padding: 40px;
          text-align: center;
          box-shadow: 0 10px 40px rgba(0,0,0,0.08);
        }

        .profile-avatar {
          width: 100px;
          height: 100px;
          border-radius: 50%;
          background: linear-gradient(135deg,#FF6B35,#ff9f43);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 20px;
          font-size: 2.5rem;
          font-weight: 800;
        }

        .account-card h1 {
          margin-bottom: 8px;
        }

        .account-card p {
          color: #777;
        }

        .account-info {
          margin-top: 30px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .info-box {
          display: flex;
          align-items: center;
          gap: 16px;
          background: #f9fafb;
          padding: 16px;
          border-radius: 16px;
          text-align: left;
        }

        .info-box span {
          font-size: 1.6rem;
        }

        .info-box h4 {
          margin: 0;
        }

        .info-box p {
          margin: 4px 0 0;
        }

        .logout-btn {
          margin-top: 28px;
          width: 100%;
          border: none;
          padding: 14px;
          border-radius: 14px;
          background: #ef4444;
          color: white;
          font-weight: 700;
          cursor: pointer;
          font-size: 1rem;
        }
      `}</style>
    </div>
  );
}