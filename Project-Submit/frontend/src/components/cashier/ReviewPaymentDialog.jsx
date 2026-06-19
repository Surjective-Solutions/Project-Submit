'use client';

import { useState } from 'react';
import { ExternalLink, Receipt } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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

export default function ReviewPaymentDialog({ open, onOpenChange, payment, onApprove, onReject }) {
  const [approvalRef, setApprovalRef] = useState('');
  const [approvalError, setApprovalError] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejectionError, setRejectionError] = useState('');

  function handleApprove() {
    if (!approvalRef.trim()) {
      setApprovalError('Reference number is required');
      return;
    }
    setApprovalError('');
    onApprove(payment.id, approvalRef.trim());
    setApprovalRef('');
    setRejectionReason('');
  }

  function handleReject() {
    if (!rejectionReason.trim() || rejectionReason.trim().length < 10) {
      setRejectionError('Reason must be at least 10 characters');
      return;
    }
    setRejectionError('');
    onReject(payment.id, rejectionReason.trim());
    setApprovalRef('');
    setRejectionReason('');
  }

  function handleClose(open) {
    if (!open) {
      setApprovalRef('');
      setApprovalError('');
      setRejectionReason('');
      setRejectionError('');
    }
    onOpenChange(open);
  }

  if (!payment) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        className="sm:max-w-xl p-0 gap-0 overflow-hidden max-h-[90vh]"
        style={{ display: 'flex', flexDirection: 'column' }}
      >
        {/* ── Fixed header ────────────────────────────────────────── */}
        <div
          className="px-6 py-5 flex items-center gap-3 shrink-0"
          style={{ background: 'linear-gradient(135deg, #3940A0 0%, #5a62ff 100%)' }}
        >
          <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
            <Receipt className="h-5 w-5 text-white" />
          </div>
          <div>
            <DialogTitle className="text-white text-base font-semibold leading-tight m-0">
              Review Payment
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

            {/* Decision section */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Decision</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                {/* APPROVE block */}
                <div className="rounded-xl border border-green-200 bg-green-50/60 p-4 space-y-3">
                  <p className="text-sm font-semibold text-green-800">Approve Payment</p>
                  <div className="space-y-1.5">
                    <Label htmlFor="approval-ref" className={approvalError ? 'text-destructive' : 'text-gray-700'}>
                      Reference Number <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="approval-ref"
                      placeholder="Enter bank reference number"
                      value={approvalRef}
                      onChange={(e) => { setApprovalRef(e.target.value); setApprovalError(''); }}
                    />
                    {approvalError && (
                      <p className="text-xs text-destructive" role="alert">{approvalError}</p>
                    )}
                  </div>
                  <Button
                    type="button"
                    className="w-full text-white"
                    style={{ background: '#16a34a' }}
                    onClick={handleApprove}
                  >
                    Approve
                  </Button>
                </div>

                {/* REJECT block */}
                <div className="rounded-xl border border-red-200 bg-red-50/60 p-4 space-y-3">
                  <p className="text-sm font-semibold text-red-800">Reject Payment</p>
                  <div className="space-y-1.5">
                    <Label htmlFor="rejection-reason" className={rejectionError ? 'text-destructive' : 'text-gray-700'}>
                      Rejection Reason <span className="text-destructive">*</span>
                    </Label>
                    <textarea
                      id="rejection-reason"
                      rows={3}
                      placeholder="Explain why this receipt is invalid..."
                      value={rejectionReason}
                      onChange={(e) => { setRejectionReason(e.target.value); setRejectionError(''); }}
                      className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:border-ring resize-none"
                    />
                    {rejectionError && (
                      <p className="text-xs text-destructive" role="alert">{rejectionError}</p>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="destructive"
                    className="w-full"
                    onClick={handleReject}
                  >
                    Reject
                  </Button>
                </div>

              </div>
            </div>

            <div className="h-1" />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
