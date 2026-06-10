'use client';

import { CheckCircle2, XCircle, Receipt, ExternalLink } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

function formatFullDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatLKR(amount) {
  return `LKR ${Number(amount).toLocaleString('en-LK')}`;
}

function Initials({ name }) {
  const parts = (name ?? '').trim().split(' ');
  const abbr = parts.length >= 2
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : (parts[0]?.slice(0, 2) ?? '?').toUpperCase();
  return (
    <div
      className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
      style={{ background: 'linear-gradient(135deg, #3940A0 0%, #34A0C5 100%)' }}
    >
      {abbr}
    </div>
  );
}

export default function ViewPaymentDetailDialog({ open, onOpenChange, payment }) {
  if (!payment) return null;

  const isApproved = payment.status === 'APPROVED';
  const headerBg = isApproved
    ? 'linear-gradient(135deg, #14532d 0%, #16a34a 100%)'
    : 'linear-gradient(135deg, #7f1d1d 0%, #991b1b 100%)';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-xl p-0 gap-0 overflow-hidden max-h-[90vh]"
        style={{ display: 'flex', flexDirection: 'column' }}
      >
        {/* ── Fixed header ────────────────────────────────────────── */}
        <div
          className="px-6 py-5 flex items-center gap-3 shrink-0"
          style={{ background: headerBg }}
        >
          <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
            <Receipt className="h-5 w-5 text-white" />
          </div>
          <div>
            <DialogTitle className="text-white text-base font-semibold leading-tight m-0">
              {isApproved ? 'Approved Payment' : 'Rejected Payment'}
            </DialogTitle>
            <DialogDescription className="text-white/60 text-xs mt-0.5 m-0">
              {payment.student_number}
            </DialogDescription>
          </div>
        </div>

        {/* ── Scrollable body ─────────────────────────────────────── */}
        <div className="flex-1 min-h-0 overflow-y-auto">
          <div className="px-6 py-5 space-y-5">

            {/* Student summary */}
            <div className="flex items-start gap-3 p-4 rounded-xl bg-gray-50 border border-gray-200">
              <Initials name={payment.student_name} />
              <div className="min-w-0 flex-1 space-y-2">
                <div>
                  <p className="font-semibold text-gray-900 text-sm leading-tight">{payment.student_name}</p>
                  <p className="font-mono text-[11px] text-gray-400">{payment.student_number}</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-xs text-gray-600">
                  <span><span className="text-gray-400">Teacher:</span> {payment.teacher_name}</span>
                  <span><span className="text-gray-400">Class:</span> {payment.class_name}</span>
                  <span>
                    <span className="text-gray-400">Amount:</span>{' '}
                    <span className="font-semibold text-gray-900">{formatLKR(payment.amount)}</span>
                  </span>
                  <span><span className="text-gray-400">Submitted:</span> {formatFullDate(payment.submitted_at)}</span>
                </div>
              </div>
            </div>

            {/* Receipt */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Payment Slip</p>
              <div className="rounded-xl border border-gray-200 overflow-hidden bg-gray-50">
                <img
                  src={payment.receipt_url}
                  alt="Payment receipt"
                  className="w-full object-contain"
                  style={{ maxHeight: '320px' }}
                />
              </div>
              <a
                href={payment.receipt_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 hover:underline"
              >
                <ExternalLink className="h-3 w-3" />
                Open Full Size
              </a>
            </div>

            {/* Status banner + details */}
            {isApproved ? (
              <div className="rounded-xl border border-green-200 bg-green-50 p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
                  <span className="text-sm font-semibold text-green-800">Payment Approved</span>
                </div>
                <div className="space-y-1.5 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500 text-xs w-32 shrink-0">Reference No.</span>
                    <span className="font-mono text-xs px-2 py-0.5 rounded bg-green-100 text-green-800 font-semibold">
                      {payment.reference_number}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500 text-xs w-32 shrink-0">Approved on</span>
                    <span className="text-gray-800 text-xs">{formatFullDate(payment.reviewed_at)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500 text-xs w-32 shrink-0">Reviewed by</span>
                    <span className="text-gray-800 text-xs">{payment.reviewed_by}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <XCircle className="h-5 w-5 text-red-600 shrink-0" />
                  <span className="text-sm font-semibold text-red-800">Payment Rejected</span>
                </div>
                <div className="space-y-1.5 text-sm">
                  <div className="flex flex-col gap-1">
                    <span className="text-gray-500 text-xs">Rejection Reason</span>
                    <p className="text-gray-800 text-sm leading-relaxed">{payment.rejection_reason}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500 text-xs w-28 shrink-0">Rejected on</span>
                    <span className="text-gray-800 text-xs">{formatFullDate(payment.reviewed_at)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500 text-xs w-28 shrink-0">Reviewed by</span>
                    <span className="text-gray-800 text-xs">{payment.reviewed_by}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="h-1" />
          </div>
        </div>

        {/* ── Fixed footer ────────────────────────────────────────── */}
        <div className="shrink-0 flex items-center justify-end px-6 py-4 border-t bg-gray-50/60 rounded-b-xl">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
