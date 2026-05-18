import { createContext, useContext, useReducer, useEffect } from "react";
import toast from "react-hot-toast";

export const CartContext = createContext();

const initialState = {
  items: [],
};

const cartReducer = (state, action) => {
  switch (action.type) {
    case "ADD_ITEM": {
      const exists = state.items.find(
        (item) => item._id === action.payload._id
      );

      if (exists) {
        return {
          ...state,
          items: state.items.map((item) =>
            item._id === action.payload._id
              ? {
                  ...item,
                  quantity: item.quantity + (action.payload.quantity || 1),
                }
              : item
          ),
        };
      }

      return {
        ...state,
        items: [
          ...state.items,
          {
            ...action.payload,
            quantity: action.payload.quantity || 1,
          },
        ],
      };
    }

    case "REMOVE_ITEM":
      return {
        ...state,
        items: state.items.filter((item) => item._id !== action.payload),
      };

    case "UPDATE_QTY":
      return {
        ...state,
        items: state.items.map((item) =>
          item._id === action.payload.id
            ? { ...item, quantity: action.payload.qty }
            : item
        ),
      };

    case "CLEAR_CART":
      return { ...state, items: [] };

    case "LOAD_CART":
      return { ...state, items: action.payload };

    default:
      return state;
  }
};

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  useEffect(() => {
    const saved = localStorage.getItem("sz-cart");
    if (saved) {
      dispatch({ type: "LOAD_CART", payload: JSON.parse(saved) });
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("sz-cart", JSON.stringify(state.items));
  }, [state.items]);

  const addToCart = (product, qty = 1) => {
    dispatch({
      type: "ADD_ITEM",
      payload: { ...product, quantity: qty },
    });

    toast.success("Added to cart 🛒");
  };

  const removeFromCart = (id) => {
    dispatch({ type: "REMOVE_ITEM", payload: id });
  };

  const updateQty = (id, qty) => {
    dispatch({
      type: "UPDATE_QTY",
      payload: { id, qty },
    });
  };

  const clearCart = () => dispatch({ type: "CLEAR_CART" });

  const cartCount = state.items.reduce((a, b) => a + b.quantity, 0);

  const cartTotal = state.items.reduce((acc, item) => {
    const price =
      item.discount > 0
        ? Math.round(item.price * (1 - item.discount / 100))
        : item.price;

    return acc + price * item.quantity;
  }, 0);

  return (
    <CartContext.Provider
      value={{
        cart: state.items,        // ✅ FIXED KEY
        cartItems: state.items,
        addToCart,
        removeFromCart,
        updateQty,
        clearCart,
        cartCount,
        cartTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
export const useCart = ()=>useContext(CartContext);