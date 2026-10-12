import React, { useState } from 'react';
import { productService } from '../../services/productService';
import { Product } from '../../models/types';
import {
  Plus,
  Minus,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  X,
} from 'lucide-react';

export const ProductCatalog: React.FC = () => {
  const [products, setProducts] = useState<Product[]>(() => productService.getProducts());
  const [showAddModal, setShowAddModal] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  // New product form
  const [name, setName] = useState('');
  const [category, setCategory] = useState<any>('pads');
  const [priceInr, setPriceInr] = useState(299);
  const [stock, setStock] = useState(25);
  const [description, setDescription] = useState('');
  const [requiresPharmacist, setRequiresPharmacist] = useState(false);

  const refreshProducts = () => {
    setProducts(productService.getProducts());
  };

  const handleStockChange = (id: string, delta: number) => {
    const p = products.find(prod => prod.id === id);
    if (!p) return;
    const newStock = Math.max(0, p.stock + delta);
    productService.updateStock(id, newStock);
    refreshProducts();
    setNotice(`Updated stock for ${p.name}`);
    setTimeout(() => setNotice(null), 1500);
  };

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !description) return;

    productService.createProduct({
      name,
      category,
      priceInr,
      stock,
      description,
      requiresPharmacistGuidance: requiresPharmacist,
      pharmacistNoticeText: requiresPharmacist
        ? 'Check local pharmacist or doctor guidance before use. User confirmation required.'
        : undefined,
    });

    refreshProducts();
    setShowAddModal(false);
    // Reset form
    setName('');
    setDescription('');
    setRequiresPharmacist(false);
    setNotice('Product created successfully');
    setTimeout(() => setNotice(null), 2000);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Delete this product from catalog?')) {
      productService.deleteProduct(id);
      refreshProducts();
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-[#4A1525]">Product Catalog Management</h1>
          <p className="text-xs text-[#7A6E73]">
            Manage stock levels, categories, and mandatory pharmacist guidance safety flags.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 rounded-2xl bg-[#8A5A44] hover:bg-[#6E4431] text-white text-xs font-bold shadow-xs flex items-center gap-1.5 min-h-[44px]"
        >
          <Plus className="w-4 h-4" />
          <span>Add Product</span>
        </button>
      </div>

      {notice && (
        <div className="p-3 bg-[#EBF4F0] border border-[#D2E7DE] rounded-2xl text-xs font-bold text-[#2F614C] flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{notice}</span>
        </div>
      )}

      {/* Product List */}
      <div className="space-y-3">
        {products.map(p => (
          <div
            key={p.id}
            className="bg-white rounded-3xl p-5 border border-[#F3ECE8] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div className="space-y-1 min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#4A1525] truncate">{p.name}</span>
                {p.requiresPharmacistGuidance && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FFF2EE] text-[#C8374D] border border-[#F5C7BC] flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    <span>Pharmacist Check</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-[#7A6E73] line-clamp-1">{p.description}</p>
              <div className="flex items-center gap-3 text-xs text-[#5C4A50]">
                <span>Category: <strong>{p.category}</strong></span>
                <span>•</span>
                <span>Price: <strong className="text-[#4A1525]">₹{p.priceInr}</strong></span>
              </div>
            </div>

            {/* Stock Control */}
            <div className="flex items-center gap-4 shrink-0">
              <div className="flex items-center gap-2 bg-[#FAF7F5] rounded-xl border border-[#E5DAD4] px-2 py-1">
                <span className="text-xs text-[#7A6E73] mr-1">Stock:</span>
                <button
                  type="button"
                  onClick={() => handleStockChange(p.id, -1)}
                  className="w-6 h-6 rounded-lg bg-white flex items-center justify-center text-[#7A6E73] hover:text-[#C8374D] shadow-xs"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="text-xs font-bold w-6 text-center">{p.stock}</span>
                <button
                  type="button"
                  onClick={() => handleStockChange(p.id, 1)}
                  className="w-6 h-6 rounded-lg bg-white flex items-center justify-center text-[#7A6E73] hover:text-[#3F755E] shadow-xs"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>

              <button
                type="button"
                onClick={() => handleDelete(p.id)}
                className="text-[#A18A92] hover:text-[#C8374D] p-2"
                title="Delete product"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 shadow-xl border border-[#F3ECE8] animate-fade-in">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-bold text-[#4A1525]">Add New Care Product</h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-full bg-[#FAF7F5] flex items-center justify-center text-[#7A6E73]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-[#4A1525] block mb-1">Product Title</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Lavender Herbal Cramp Balm"
                  className="w-full p-2.5 rounded-xl bg-[#FAF7F5] border border-[#E5DAD4]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-[#4A1525] block mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-[#FAF7F5] border border-[#E5DAD4]"
                  >
                    <option value="pads">Pads</option>
                    <option value="liners">Liners</option>
                    <option value="cups">Cups</option>
                    <option value="heat_relief">Heat Relief</option>
                    <option value="hydration">Hydration</option>
                    <option value="snacks">Snacks</option>
                    <option value="otc_comfort">Comfort OTC</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-[#4A1525] block mb-1">Price (INR)</label>
                  <input
                    type="number"
                    min="1"
                    value={priceInr}
                    onChange={(e) => setPriceInr(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl bg-[#FAF7F5] border border-[#E5DAD4]"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-[#4A1525] block mb-1">Initial Stock</label>
                <input
                  type="number"
                  min="0"
                  value={stock}
                  onChange={(e) => setStock(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl bg-[#FAF7F5] border border-[#E5DAD4]"
                />
              </div>

              <div>
                <label className="font-semibold text-[#4A1525] block mb-1">Description</label>
                <textarea
                  rows={2}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Product description and usage guidance..."
                  className="w-full p-2.5 rounded-xl bg-[#FAF7F5] border border-[#E5DAD4]"
                />
              </div>

              <div className="p-3 bg-[#FFF5F7] rounded-xl border border-[#FCE8ED]">
                <label className="flex items-start gap-2 cursor-pointer text-xs">
                  <input
                    type="checkbox"
                    checked={requiresPharmacist}
                    onChange={(e) => setRequiresPharmacist(e.target.checked)}
                    className="w-4 h-4 mt-0.5 accent-[#781D42] rounded"
                  />
                  <div>
                    <span className="font-bold text-[#781D42]">Requires Pharmacist Guidance Flag</span>
                    <p className="text-[11px] text-[#7A6E73]">
                      Enforces medical notice & explicit checkbox confirmation in Care Shop before user can add to bag.
                    </p>
                  </div>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#7A6E73] hover:bg-[#FAF7F5]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#8A5A44] hover:bg-[#6E4431] text-white text-xs font-bold"
                >
                  Add to Catalog
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
