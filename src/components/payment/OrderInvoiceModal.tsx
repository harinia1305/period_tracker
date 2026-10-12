import React from 'react';
import { Order } from '../../models/types';
import { formatFriendlyDate } from '../../utils/dateUtils';
import { X, Printer, Heart, CheckCircle2, ShieldCheck } from 'lucide-react';

interface OrderInvoiceModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
}

export const OrderInvoiceModal: React.FC<OrderInvoiceModalProps> = ({ order, isOpen, onClose }) => {
  if (!isOpen || !order) return null;

  const payment = order.payment;
  const isPaid = payment?.status === 'paid';

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 antialiased animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Toolbar */}
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50 print:hidden">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-700">Digital Tax Invoice & Care Receipt</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-gray-200 hover:bg-gray-100 text-xs font-semibold text-gray-700 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / PDF</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-gray-200 text-gray-500 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-[#2D2327]">
          {/* Brand & Invoice Header */}
          <div className="flex items-start justify-between pb-4 border-b border-gray-200">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-[#781D42] text-white flex items-center justify-center">
                <Heart className="w-5 h-5 fill-current" />
              </div>
              <div>
                <h1 className="text-base font-black text-[#4A1525] tracking-tight">Period Love</h1>
                <p className="text-[11px] text-[#7A6E73]">Empathetic Cycle & Discreet Care</p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs font-mono font-bold text-gray-900 block">
                {payment?.invoiceNumber || `INV-${order.id.slice(-6)}`}
              </span>
              <span className="text-[11px] text-gray-500 block">
                Date: {formatFriendlyDate(order.createdAt.split('T')[0])}
              </span>
            </div>
          </div>

          {/* Delivery & Security Details */}
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <p className="font-bold text-gray-500 uppercase tracking-wider text-[10px]">Delivered To</p>
              <p className="font-bold text-gray-900 mt-0.5">{order.addressLabel}</p>
              <p className="text-[11px] text-gray-600">Recipient Phone: {order.maskedPhone}</p>
            </div>

            <div className="text-right">
              <p className="font-bold text-gray-500 uppercase tracking-wider text-[10px]">Fulfillment Hub</p>
              <p className="font-bold text-gray-900 mt-0.5">Indiranagar Wellness Hub</p>
              <p className="text-[11px] text-emerald-700 flex items-center justify-end gap-1 mt-0.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Discreet Unbranded Kraft Box</span>
              </p>
            </div>
          </div>

          {/* Itemized Table */}
          <div className="space-y-2">
            <div className="border rounded-2xl overflow-hidden border-gray-200 text-xs">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold text-[10px] uppercase">
                  <tr>
                    <th className="py-2.5 px-3">Item Description</th>
                    <th className="py-2.5 px-3 text-center">Qty</th>
                    <th className="py-2.5 px-3 text-right">Price</th>
                    <th className="py-2.5 px-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {order.items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-gray-50/50">
                      <td className="py-2.5 px-3 font-medium text-gray-900">
                        {item.productName || 'Care Essential'}
                      </td>
                      <td className="py-2.5 px-3 text-center text-gray-600">{item.quantity}</td>
                      <td className="py-2.5 px-3 text-right text-gray-600">₹{item.unitPriceInr}</td>
                      <td className="py-2.5 px-3 text-right font-bold text-gray-900">
                        ₹{item.unitPriceInr * item.quantity}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals Summary */}
            <div className="p-3 bg-gray-50 rounded-2xl space-y-1.5 text-xs">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>₹{order.totalInr - order.deliveryFeeInr}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Discreet Delivery Fee</span>
                <span>{order.deliveryFeeInr === 0 ? 'FREE' : `₹${order.deliveryFeeInr}`}</span>
              </div>
              {payment?.usedWalletCreditInr ? (
                <div className="flex justify-between text-[#781D42] font-semibold">
                  <span>Care Wallet Credit Applied</span>
                  <span>-₹{payment.usedWalletCreditInr}</span>
                </div>
              ) : null}
              <div className="flex justify-between text-sm font-black text-gray-900 pt-1 border-t border-gray-200">
                <span>Total Paid / Due</span>
                <span>₹{order.totalInr - (payment?.usedWalletCreditInr || 0)}</span>
              </div>
            </div>
          </div>

          {/* Payment Stamp */}
          <div className="p-4 rounded-2xl border-2 border-dashed border-[#781D42]/30 bg-[#FFF5F7] flex items-center justify-between">
            <div className="space-y-0.5 text-xs">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span className="font-black text-[#781D42] uppercase tracking-wider text-xs">
                  {isPaid ? 'PAID & AUTHENTICATED' : 'CASH ON DELIVERY PENDING'}
                </span>
              </div>
              <p className="text-[11px] text-gray-700">
                Method: <strong>{payment?.methodLabel || 'Digital Payment'}</strong>
              </p>
              {payment?.transactionId && (
                <p className="text-[10px] text-gray-500 font-mono">
                  Txn ID: {payment.transactionId}
                </p>
              )}
            </div>

            {/* Decorative Official Stamp */}
            <div className="w-16 h-16 rounded-full border-2 border-[#781D42] text-[#781D42] flex flex-col items-center justify-center rotate-[-12deg] select-none opacity-80">
              <span className="text-[8px] font-black uppercase">PERIOD LOVE</span>
              <span className="text-[11px] font-black">VERIFIED</span>
              <span className="text-[7px]">CARE HUB</span>
            </div>
          </div>

          <p className="text-[10px] text-gray-400 text-center">
            This is a computer-generated tax invoice and care fulfillment receipt. No signature required.
          </p>
        </div>
      </div>
    </div>
  );
};
