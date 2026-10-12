import React, { useState } from 'react';
import { orderService } from '../../services/orderService';
import { Order, OrderStatus } from '../../models/types';
import { formatFriendlyDate } from '../../utils/dateUtils';
import {
  Package,
  Search,
  Filter,
  CheckCircle2,
} from 'lucide-react';

export const OrdersAdmin: React.FC = () => {
  const [orders] = useState<Order[]>(() => orderService.getOrders());
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredOrders = orders.filter(o => {
    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
    const matchesSearch = o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (o.deliveryPartnerName || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-black text-[#4A1525]">Orders & Dispatch Fulfillment</h1>
        <p className="text-xs text-[#7A6E73]">
          Monitor active deliveries, discreet packaging adherence, and order statuses.
        </p>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-[#8E7E84] absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search order ID or partner..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-[#F3ECE8] text-xs focus:outline-none focus:ring-1 focus:ring-[#8A5A44]"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {['all', 'requested', 'accepted', 'picked_up', 'out_for_delivery', 'delivered', 'cancelled'].map(st => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                statusFilter === st
                  ? 'bg-[#8A5A44] text-white'
                  : 'bg-white text-[#7A6E73] border border-[#F3ECE8] hover:border-[#8A5A44]'
              }`}
            >
              {st.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table / Cards */}
      <div className="space-y-3">
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 border border-[#F3ECE8] text-center text-xs text-[#7A6E73]">
            No orders found matching the filter criteria.
          </div>
        ) : (
          filteredOrders.map(order => (
            <div
              key={order.id}
              className="bg-white rounded-3xl p-5 border border-[#F3ECE8] shadow-xs space-y-3"
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-[#4A1525]">{order.id}</span>
                  <span className="text-[11px] text-[#7A6E73] ml-2">
                    {formatFriendlyDate(order.createdAt.split('T')[0])}
                  </span>
                </div>

                <span className={`text-[11px] font-bold px-3 py-1 rounded-full uppercase ${
                  order.status === 'delivered'
                    ? 'bg-[#EBF4F0] text-[#2F614C]'
                    : order.status === 'cancelled'
                    ? 'bg-[#FFF2EE] text-[#C8374D]'
                    : 'bg-[#FFF5F7] text-[#781D42]'
                }`}>
                  {order.status.replace(/_/g, ' ')}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-[#5C4A50] bg-[#FAF7F5] p-3 rounded-2xl border border-[#F3ECE8]">
                <div>
                  <span className="text-[10px] text-[#7A6E73] block uppercase">Package Contents</span>
                  <span className="font-semibold">{order.items.length} item types (₹{order.totalInr})</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#7A6E73] block uppercase">Assigned Partner</span>
                  <span className="font-semibold">{order.deliveryPartnerName || 'Pending partner pickup'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#7A6E73] block uppercase">Discreet Packaging</span>
                  <span className="font-semibold text-[#3F755E]">
                    {order.discreetPackaging ? '✓ Verified Unbranded Box' : 'Standard'}
                  </span>
                </div>
              </div>

              {/* Items Breakdown */}
              <div className="text-xs text-[#7A6E73] divide-y divide-[#F3ECE8] pt-1">
                {order.items.map((it, idx) => (
                  <div key={idx} className="py-1 flex justify-between">
                    <span>{it.quantity}x {it.productName || it.productId}</span>
                    <span>₹{it.unitPriceInr * it.quantity}</span>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
