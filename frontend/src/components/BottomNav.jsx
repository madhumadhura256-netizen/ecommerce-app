import { Link, useLocation } from "react-router-dom";

export default function BottomNav() {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <div style={styles.nav}>

      <Link to="/" style={styles.item}>
        <span style={isActive("/") ? styles.active : styles.icon}>
          🏠
        </span>
        <small>Home</small>
      </Link>

      <Link to="/new" style={styles.item}>
        <span style={isActive("/new") ? styles.active : styles.icon}>
          ✨
        </span>
        <small>New</small>
      </Link>

      <Link to="/cart" style={styles.item}>
        <span style={isActive("/cart") ? styles.active : styles.icon}>
          🛒
        </span>
        <small>Cart</small>
      </Link>

    </div>
  );
}

const styles = {
  nav: {
    position: "fixed",
    bottom: 0,
    left: 0,
    right: 0,
    height: 65,
    background: "var(--bg-card)",
    display: "flex",
    justifyContent: "space-around",
    alignItems: "center",
    borderTop: "1px solid var(--border)",
    zIndex: 999,
  },

  item: {
    textDecoration: "none",
    color: "var(--text-muted)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    fontSize: 12,
  },

  icon: {
    fontSize: 20,
    color: "var(--text-muted)",
  },

  active: {
    fontSize: 20,
    color: "#FF6B35",
    transform: "scale(1.2)",
  },
};