import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { productService } from '../../services/productService';
import { cartService, CartItem } from '../../services/cartService';
import { Product } from '../../models/types';
import {
  Search,
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  X,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';

export const CareShopScreen: React.FC = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const products = productService.getProducts(selectedCategory, searchQuery);

  // Cart State
  const [cartItems, setCartItems] = useState<CartItem[]>(() => cartService.getItems());
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [discreetPackaging, setDiscreetPackaging] = useState<boolean>(true);

  // Pharmacist Warning Modal State
  const [pendingPharmacistProduct, setPendingPharmacistProduct] = useState<Product | null>(null);
  const [pharmacistConsentGiven, setPharmacistConsentGiven] = useState<boolean>(false);

  // Product Details Drawer
  const [selectedProductDetails, setSelectedProductDetails] = useState<Product | null>(null);

  const refreshCart = () => {
    setCartItems(cartService.getItems());
  };

  const handleAddToCart = (product: Product) => {
    if (product.requiresPharmacistGuidance) {
      setPendingPharmacistProduct(product);
      setPharmacistConsentGiven(false);
      return;
    }
    cartService.addItem(product, 1);
    refreshCart();
    setIsCartOpen(true);
  };

  const confirmPharmacistAdd = () => {
    if (pendingPharmacistProduct && pharmacistConsentGiven) {
      cartService.addItem(pendingPharmacistProduct, 1);
      refreshCart();
      setPendingPharmacistProduct(null);
      setIsCartOpen(true);
    }
  };

  const updateQuantity = (productId: string, delta: number) => {
    const item = cartItems.find(i => i.product.id === productId);
    if (!item) return;
    const newQty = item.quantity + delta;
    cartService.updateQuantity(productId, newQty);
    refreshCart();
  };

  const removeItem = (productId: string) => {
    cartService.removeItem(productId);
    refreshCart();
  };

  const totals = cartService.calculateTotals(cartItems);

  const categories = [
    { key: 'all', label: 'All Items' },
    { key: 'pads', label: 'Pads' },
    { key: 'liners', label: 'Liners' },
    { key: 'cups', label: 'Cups' },
    { key: 'heat_relief', label: 'Heat Relief' },
    { key: 'hydration', label: 'Hydration' },
    { key: 'snacks', label: 'PMS Treats' },
    { key: 'otc_comfort', label: 'Comfort OTC' },
  ];

  return (
    <div className="space-y-5">
      {/* Header & Floating Cart Button */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-[#4A1525]">Period Care Shop</h1>
          <p className="text-xs text-[#7A6E73]">
            Curated cycle essentials with discreet local delivery.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsCartOpen(true)}
          className="relative px-3.5 py-2 rounded-2xl bg-[#781D42] text-white flex items-center gap-2 shadow-sm hover:bg-[#4A1525] transition-colors min-h-[44px]"
          aria-label="View shopping cart"
        >
          <ShoppingBag className="w-4 h-4" />
          <span className="text-xs font-bold">Cart</span>
          {totals.itemCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-white text-[#781D42] text-xs font-black flex items-center justify-center">
              {totals.itemCount}
            </span>
          )}
        </button>
      </div>

      {/* Search & Categories Bar */}
      <div className="space-y-2.5">
        <div className="relative">
          <Search className="w-4 h-4 text-[#8E7E84] absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search organic pads, cramp patches, tea..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white border border-[#F3ECE8] text-xs text-[#2D2327] placeholder:text-[#A18A92] focus:outline-none focus:ring-1 focus:ring-[#781D42] shadow-xs"
          />
        </div>

        {/* Category Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {categories.map(cat => (
            <button
              key={cat.key}
              type="button"
              onClick={() => setSelectedCategory(cat.key)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all min-h-[36px] ${
                selectedCategory === cat.key
                  ? 'bg-[#781D42] text-white shadow-xs'
                  : 'bg-white text-[#7A6E73] border border-[#F3ECE8] hover:border-[#DE738A]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {products.map(product => (
          <div
            key={product.id}
            className="bg-white rounded-3xl p-4 border border-[#F3ECE8] shadow-xs hover:border-[#DE738A] transition-all flex flex-col justify-between space-y-3"
          >
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#8E7E84]">
                  {product.category.replace('_', ' ')}
                </span>
                {product.badge && (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    product.requiresPharmacistGuidance
                      ? 'bg-[#FFF2EE] text-[#C8374D] border border-[#F5C7BC]'
                      : 'bg-[#FFF5F7] text-[#781D42] border border-[#FCE8ED]'
                  }`}>
                    {product.badge}
                  </span>
                )}
              </div>

              <h3
                onClick={() => setSelectedProductDetails(product)}
                className="text-sm font-bold text-[#4A1525] hover:text-[#781D42] cursor-pointer line-clamp-2"
              >
                {product.name}
              </h3>

              <p className="text-xs text-[#7A6E73] line-clamp-2 leading-relaxed">
                {product.description}
              </p>
            </div>

            <div className="pt-2 border-t border-[#F3ECE8] flex items-center justify-between">
              <div>
                <span className="text-base font-black text-[#4A1525]">₹{product.priceInr}</span>
                <span className="text-[10px] text-[#8E7E84] block">In Stock ({product.stock})</span>
              </div>

              <button
                type="button"
                onClick={() => handleAddToCart(product)}
                className="px-3.5 py-2 rounded-xl bg-[#FFF5F7] text-[#781D42] border border-[#FCE8ED] hover:bg-[#781D42] hover:text-white font-bold text-xs transition-colors flex items-center gap-1.5 min-h-[44px]"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Slide-Over Shopping Cart Sheet */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-xs flex justify-end">
          <div className="w-full sm:max-w-md h-full bg-white shadow-2xl flex flex-col justify-between animate-slide-left">
            {/* Cart Header */}
            <div className="p-4 border-b border-[#F3ECE8] flex items-center justify-between bg-[#FAF7F5]">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-[#781D42]" />
                <h3 className="text-base font-bold text-[#4A1525]">Your Care Bag</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCartOpen(false)}
                className="w-8 h-8 rounded-full bg-white border border-[#E5DAD4] flex items-center justify-center text-[#7A6E73]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {cartItems.length === 0 ? (
                <div className="text-center py-16 space-y-3">
                  <div className="w-14 h-14 rounded-full bg-[#FAF7F5] flex items-center justify-center mx-auto text-[#A18A92]">
                    <ShoppingBag className="w-7 h-7" />
                  </div>
                  <h4 className="font-bold text-sm text-[#4A1525]">Your bag is empty</h4>
                  <p className="text-xs text-[#7A6E73]">Add soothing products for your cycle comfort.</p>
                </div>
              ) : (
                <>
                  {cartItems.map(item => (
                    <div
                      key={item.product.id}
                      className="p-3 rounded-2xl bg-[#FAF7F5] border border-[#F3ECE8] flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-[#4A1525] truncate">{item.product.name}</p>
                        <p className="text-xs text-[#7A6E73]">₹{item.product.priceInr} each</p>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2 bg-white rounded-xl border border-[#E5DAD4] px-1.5 py-0.5">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.product.id, -1)}
                          className="w-6 h-6 flex items-center justify-center text-[#7A6E73] hover:text-[#C8374D]"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.product.id, 1)}
                          className="w-6 h-6 flex items-center justify-center text-[#7A6E73] hover:text-[#781D42]"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeItem(item.product.id)}
                        className="text-[#A18A92] hover:text-[#C8374D] p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}

                  {/* Discreet Packaging Option Toggle */}
                  <div className="p-3.5 bg-[#FFF5F7] rounded-2xl border border-[#FCE8ED] space-y-1">
                    <label className="flex items-start gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={discreetPackaging}
                        onChange={(e) => setDiscreetPackaging(e.target.checked)}
                        className="w-4 h-4 mt-0.5 accent-[#781D42] rounded"
                      />
                      <div>
                        <p className="text-xs font-bold text-[#781D42]">Discreet Brown Box Packaging</p>
                        <p className="text-[11px] text-[#7A6E73]">
                          Delivered in plain, unbranded boxes with zero outward labels of contents.
                        </p>
                      </div>
                    </label>
                  </div>
                </>
              )}
            </div>

            {/* Cart Footer Checkout Bar */}
            {cartItems.length > 0 && (
              <div className="p-4 border-t border-[#F3ECE8] bg-white space-y-3">
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between text-[#7A6E73]">
                    <span>Subtotal</span>
                    <span>₹{totals.subtotalInr}</span>
                  </div>
                  <div className="flex justify-between text-[#7A6E73]">
                    <span>Delivery Fee</span>
                    <span>{totals.deliveryFeeInr === 0 ? 'FREE' : `₹${totals.deliveryFeeInr}`}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-[#4A1525] pt-1 border-t border-[#F3ECE8]">
                    <span>Total Amount</span>
                    <span>₹{totals.totalInr}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setIsCartOpen(false);
                    navigate('/app/orders?checkout=true');
                  }}
                  className="w-full py-3.5 rounded-2xl bg-[#781D42] hover:bg-[#4A1525] text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 min-h-[48px]"
                >
                  <span>Proceed to Mock Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mandatory Pharmacist Guidance Warning Modal */}
      {pendingPharmacistProduct && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-xl border border-[#F3ECE8] animate-fade-in">
            <div className="w-12 h-12 rounded-full bg-[#FFF2EE] flex items-center justify-center text-[#C8374D]">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div>
              <h3 className="font-bold text-base text-[#4A1525]">Pharmacist Guidance Notice</h3>
              <p className="text-xs text-[#7A6E73] mt-1 leading-relaxed">
                {pendingPharmacistProduct.pharmacistNoticeText ||
                  'Comfort medications require professional consultation. Period Love does not recommend dosages.'}
              </p>
            </div>

            <div className="p-3 bg-[#FAF7F5] rounded-xl border border-[#F3ECE8]">
              <label className="flex items-start gap-2 cursor-pointer text-xs text-[#2D2327]">
                <input
                  type="checkbox"
                  checked={pharmacistConsentGiven}
                  onChange={(e) => setPharmacistConsentGiven(e.target.checked)}
                  className="w-4 h-4 mt-0.5 accent-[#781D42] rounded"
                />
                <span>
                  I confirm that I understand this notice and will verify with a licensed pharmacist or doctor.
                </span>
              </label>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setPendingPharmacistProduct(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[#7A6E73] hover:bg-[#FAF7F5] min-h-[40px]"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!pharmacistConsentGiven}
                onClick={confirmPharmacistAdd}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all min-h-[40px] ${
                  pharmacistConsentGiven
                    ? 'bg-[#781D42] text-white hover:bg-[#4A1525]'
                    : 'bg-[#FAF7F5] text-[#A18A92] cursor-not-allowed'
                }`}
              >
                Confirm & Add
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Product Details Drawer */}
      {selectedProductDetails && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex justify-end">
          <div className="w-full sm:max-w-md h-full bg-white shadow-2xl p-6 flex flex-col justify-between animate-slide-left">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold uppercase tracking-wider text-[#8E7E84]">
                  {selectedProductDetails.category.replace('_', ' ')}
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedProductDetails(null)}
                  className="w-8 h-8 rounded-full bg-[#FAF7F5] flex items-center justify-center text-[#7A6E73]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <h2 className="text-xl font-black text-[#4A1525]">{selectedProductDetails.name}</h2>
              <p className="text-2xl font-black text-[#781D42]">₹{selectedProductDetails.priceInr}</p>

              <div className="space-y-2 text-xs text-[#5C4A50] leading-relaxed">
                <h4 className="font-bold text-[#4A1525]">Description & Materials</h4>
                <p>{selectedProductDetails.description}</p>
              </div>

              <div className="p-3.5 bg-[#FAF7F5] rounded-2xl border border-[#F3ECE8] text-xs text-[#7A6E73] space-y-1">
                <p className="flex items-center gap-1.5 font-semibold text-[#4A1525]">
                  <ShieldCheck className="w-4 h-4 text-[#3F755E]" />
                  <span>Discreet & Verified Delivery</span>
                </p>
                <p>Packaged in unbranded secure boxes. Track delivery partner in real-time.</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                handleAddToCart(selectedProductDetails);
                setSelectedProductDetails(null);
              }}
              className="w-full py-3.5 rounded-2xl bg-[#781D42] text-white font-bold text-xs shadow-md hover:bg-[#4A1525] transition-all min-h-[48px]"
            >
              Add to Care Bag (₹{selectedProductDetails.priceInr})
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
