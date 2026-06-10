'use client';

import { useState } from 'react';
import { Eye } from 'lucide-react';
import { toast } from 'sonner';

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import ReviewPaymentDialog from './ReviewPaymentDialog';
import ViewPaymentDetailDialog from './ViewPaymentDetailDialog';
import { MOCK_PAYMENTS } from '@/lib/mock-data';

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatLKR(amount) {
  return `LKR ${Number(amount).toLocaleString('en-LK')}`;
}

function relativeDate(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);
  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (mins > 0) return `${mins} min${mins > 1 ? 's' : ''} ago`;
  return 'just now';
}

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

function Initials({ name }) {
  const parts = (name ?? '').trim().split(' ');
  const abbr =
    parts.length >= 2
      ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      : (parts[0]?.slice(0, 2) ?? '?').toUpperCase();
  return (
    <div
      className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold text-white shrink-0"
      style={{ background: 'linear-gradient(135deg, #3940A0 0%, #34A0C5 100%)' }}
    >
      {abbr}
    </div>
  );
}

function DateCell({ iso }) {
  return (
    <Tooltip>
      <TooltipTrigger className="text-sm text-gray-600 cursor-default text-left">
        {relativeDate(iso)}
      </TooltipTrigger>
      <TooltipContent>{formatFullDate(iso)}</TooltipContent>
    </Tooltip>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function PaymentsSection() {
  const [payments, setPayments] = useState(MOCK_PAYMENTS);
  const [reviewPayment, setReviewPayment] = useState(null);
  const [viewDetail, setViewDetail] = useState(null);

  const pending = payments
    .filter((p) => p.status === 'PENDING')
    .sort((a, b) => new Date(a.submitted_at) - new Date(b.submitted_at));
  const approved = payments
    .filter((p) => p.status === 'APPROVED')
    .sort((a, b) => new Date(b.reviewed_at) - new Date(a.reviewed_at));
  const rejected = payments
    .filter((p) => p.status === 'REJECTED')
    .sort((a, b) => new Date(b.reviewed_at) - new Date(a.reviewed_at));

  function handleApprove(id, referenceNumber) {
    setPayments((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              status: 'APPROVED',
              reference_number: referenceNumber,
              reviewed_at: new Date().toISOString(),
              reviewed_by: 'Current Cashier',
            }
          : p
      )
    );
    setReviewPayment(null);
    toast.success('Payment approved successfully');
  }

  function handleReject(id, reason) {
    setPayments((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              status: 'REJECTED',
              rejection_reason: reason,
              reviewed_at: new Date().toISOString(),
              reviewed_by: 'Current Cashier',
            }
          : p
      )
    );
    setReviewPayment(null);
    toast.success('Payment rejected');
  }

  return (
    <div className="space-y-4">
      <Tabs defaultValue="pending">
        {/* ── Tab bar ──────────────────────────────────────────────── */}
        <TabsList className="h-10">
          <TabsTrigger value="pending" className="gap-2">
            Pending
            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700">
              {pending.length}
            </span>
          </TabsTrigger>
          <TabsTrigger value="approved" className="gap-2">
            Approved
            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-green-100 text-green-700">
              {approved.length}
            </span>
          </TabsTrigger>
          <TabsTrigger value="rejected" className="gap-2">
            Rejected
            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-red-100 text-red-700">
              {rejected.length}
            </span>
          </TabsTrigger>
        </TabsList>

        {/* ── Pending tab ──────────────────────────────────────────── */}
        <TabsContent value="pending">
          <div className="rounded-xl border border-border bg-white shadow-sm overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="odd:bg-gray-50 even:bg-gray-50 hover:bg-gray-50">
                  <TableHead className="w-10 pl-4" />
                  <TableHead>Student No.</TableHead>
                  <TableHead>Teacher</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead className="pr-4">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pending.length === 0 ? (
                  <TableRow className="odd:bg-white even:bg-white hover:bg-white">
                    <TableCell colSpan={7} className="py-14 text-center text-gray-400 text-sm">
                      No pending payments.
                    </TableCell>
                  </TableRow>
                ) : (
                  pending.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="pl-4">
                        <Initials name={p.student_name} />
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-gray-900 text-sm whitespace-nowrap">{p.student_name}</p>
                          <p className="font-mono text-[10px] text-gray-400">{p.student_number}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-700 whitespace-nowrap">{p.teacher_name}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-700">{p.class_name}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm font-semibold text-gray-900 whitespace-nowrap">{formatLKR(p.amount)}</span>
                      </TableCell>
                      <TableCell>
                        <DateCell iso={p.submitted_at} />
                      </TableCell>
                      <TableCell className="pr-4">
                        <button
                          onClick={() => setReviewPayment(p)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors whitespace-nowrap"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          Review
                        </button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* ── Approved tab ─────────────────────────────────────────── */}
        <TabsContent value="approved">
          <div className="rounded-xl border border-border bg-white shadow-sm overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="odd:bg-gray-50 even:bg-gray-50 hover:bg-gray-50">
                  <TableHead className="w-10 pl-4" />
                  <TableHead>Student No.</TableHead>
                  <TableHead>Teacher</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Reference No.</TableHead>
                  <TableHead>Approved</TableHead>
                  <TableHead className="pr-4 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {approved.length === 0 ? (
                  <TableRow className="odd:bg-white even:bg-white hover:bg-white">
                    <TableCell colSpan={8} className="py-14 text-center text-gray-400 text-sm">
                      No approved payments yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  approved.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="pl-4">
                        <Initials name={p.student_name} />
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-gray-900 text-sm whitespace-nowrap">{p.student_name}</p>
                          <p className="font-mono text-[10px] text-gray-400">{p.student_number}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-700 whitespace-nowrap">{p.teacher_name}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-700">{p.class_name}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm font-semibold text-gray-900 whitespace-nowrap">{formatLKR(p.amount)}</span>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-green-100 text-green-700 font-semibold whitespace-nowrap">
                          {p.reference_number}
                        </span>
                      </TableCell>
                      <TableCell>
                        <DateCell iso={p.reviewed_at} />
                      </TableCell>
                      <TableCell className="pr-4 text-right">
                        <Tooltip>
                          <TooltipTrigger
                            onClick={() => setViewDetail(p)}
                            className="inline-flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            <span className="sr-only">View</span>
                          </TooltipTrigger>
                          <TooltipContent>View</TooltipContent>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* ── Rejected tab ─────────────────────────────────────────── */}
        <TabsContent value="rejected">
          <div className="rounded-xl border border-border bg-white shadow-sm overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="odd:bg-gray-50 even:bg-gray-50 hover:bg-gray-50">
                  <TableHead className="w-10 pl-4" />
                  <TableHead>Student No.</TableHead>
                  <TableHead>Teacher</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Rejection Reason</TableHead>
                  <TableHead>Rejected</TableHead>
                  <TableHead className="pr-4 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rejected.length === 0 ? (
                  <TableRow className="odd:bg-white even:bg-white hover:bg-white">
                    <TableCell colSpan={8} className="py-14 text-center text-gray-400 text-sm">
                      No rejected payments.
                    </TableCell>
                  </TableRow>
                ) : (
                  rejected.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="pl-4">
                        <Initials name={p.student_name} />
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-gray-900 text-sm whitespace-nowrap">{p.student_name}</p>
                          <p className="font-mono text-[10px] text-gray-400">{p.student_number}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-700 whitespace-nowrap">{p.teacher_name}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-700">{p.class_name}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm font-semibold text-gray-900 whitespace-nowrap">{formatLKR(p.amount)}</span>
                      </TableCell>
                      <TableCell className="max-w-[180px]">
                        <Tooltip>
                          <TooltipTrigger className="text-sm text-gray-600 text-left line-clamp-1 cursor-default">
                            {(p.rejection_reason ?? '').slice(0, 40)}
                            {(p.rejection_reason ?? '').length > 40 ? '…' : ''}
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs">{p.rejection_reason}</TooltipContent>
                        </Tooltip>
                      </TableCell>
                      <TableCell>
                        <DateCell iso={p.reviewed_at} />
                      </TableCell>
                      <TableCell className="pr-4 text-right">
                        <Tooltip>
                          <TooltipTrigger
                            onClick={() => setViewDetail(p)}
                            className="inline-flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            <span className="sr-only">View</span>
                          </TooltipTrigger>
                          <TooltipContent>View</TooltipContent>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>

      {/* ── Dialogs ──────────────────────────────────────────────────── */}
      <ReviewPaymentDialog
        open={!!reviewPayment}
        onOpenChange={(o) => !o && setReviewPayment(null)}
        payment={reviewPayment}
        onApprove={handleApprove}
        onReject={handleReject}
      />
      <ViewPaymentDetailDialog
        open={!!viewDetail}
        onOpenChange={(o) => !o && setViewDetail(null)}
        payment={viewDetail}
      />
    </div>
  );
}
