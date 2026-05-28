import { createSlice } from '@reduxjs/toolkit';

const loadCart = () => {
  try { return JSON.parse(localStorage.getItem('cart')) || []; } catch { return []; }
};
const saveCart = (items) => localStorage.setItem('cart', JSON.stringify(items));

const cartSlice = createSlice({
  name: 'cart',
  initialState: { items: loadCart(), shippingAddress: null, paymentMethod: 'stripe' },
  reducers: {
    addToCart(state, action) {
      const item = action.payload;
      const exists = state.items.find((i) => i._id === item._id);
      if (exists) { exists.qty = Math.min(exists.qty + 1, item.stock); }
      else { state.items.push({ ...item, qty: 1 }); }
      saveCart(state.items);
    },
    removeFromCart(state, action) {
      state.items = state.items.filter((i) => i._id !== action.payload);
      saveCart(state.items);
    },
    updateQty(state, action) {
      const { id, qty } = action.payload;
      const item = state.items.find((i) => i._id === id);
      if (item) { item.qty = qty; if (item.qty <= 0) state.items = state.items.filter((i) => i._id !== id); }
      saveCart(state.items);
    },
    clearCart(state) { state.items = []; saveCart([]); },
    setShippingAddress(state, action) { state.shippingAddress = action.payload; },
    setPaymentMethod(state, action) { state.paymentMethod = action.payload; },
  },
});

export const { addToCart, removeFromCart, updateQty, clearCart, setShippingAddress, setPaymentMethod } = cartSlice.actions;
export default cartSlice.reducer;
