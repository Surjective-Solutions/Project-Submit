'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Clock,
  Eye,
  FileText,
  CheckCircle,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';
import { useEnrolledClasses } from '@/context/EnrolledClassesContext';
import {
  getCurrentMonthStatus,
  getMonthStatus,
  formatMonthYear,
  toMonthYearSlug,
} from '@/lib/billing-utils';

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function isPast(iso) {
  return new Date(iso) < new Date();
}

// ── Badges ────────────────────────────────────────────────────────────────────

function SubmissionStatusBadge({ status }) {
  if (status === 'GRADED') {
    return (
      <span className="inline-flex items-center text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-green-100 text-green-700 border border-green-200">
        Graded
      </span>
    );
  }
  if (status === 'SUBMITTED') {
    return (
      <span className="inline-flex items-center text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200">
        Submitted
      </span>
    );
  }
  return (
    <span className="inline-flex items-center text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-red-100 text-red-700 border border-red-200">
      Not Submitted
    </span>
  );
}

// ── View Paper Dialog ─────────────────────────────────────────────────────────

function ViewPaperDialog({ open, onOpenChange, paper }) {
  if (!paper) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg p-0 gap-0 overflow-hidden">
        <div
          className="px-6 py-5 flex items-center gap-3"
          style={{ background: 'linear-gradient(135deg, #3940A0 0%, #5a62ff 100%)' }}
        >
          <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
            <FileText className="h-5 w-5 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <DialogTitle className="text-white text-sm font-semibold leading-tight m-0 truncate">
              {paper.paper_name}
            </DialogTitle>
            <p className="text-white/60 text-xs mt-0.5">Due {formatDate(paper.due_date)}</p>
          </div>
        </div>

        {paper.submission_status === 'GRADED' && paper.grade && (
          <div className="mx-6 mt-5 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-green-50 border border-green-200">
            <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center shrink-0">
              <span className="text-green-600 text-base font-bold">A</span>
            </div>
            <div>
              <p className="text-[10px] font-semibold text-green-600 uppercase tracking-wider">Your Grade</p>
              <p className="text-lg font-bold text-green-700 leading-tight">{paper.grade}</p>
            </div>
          </div>
        )}

        <div className="px-6 py-5 grid sm:grid-cols-2 gap-4">
          <div className="rounded-xl border border-gray-200 p-4 space-y-3">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Exam Paper</p>
            {paper.exam_pdf_url ? (
              <Button
                variant="outline"
                size="sm"
                className="w-full gap-2 border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                onClick={() => window.open(paper.exam_pdf_url, '_blank')}
              >
                <FileText className="h-3.5 w-3.5" />
                Open Exam Paper
              </Button>
            ) : (
              <p className="text-sm text-gray-400">Exam paper not available.</p>
            )}
          </div>

          <div className="rounded-xl border border-gray-200 p-4 space-y-3">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Your Submission</p>
            {paper.submission_status === 'NOT_SUBMITTED' ? (
              <p className="text-sm text-gray-400">You did not submit this paper.</p>
            ) : paper.submission_url ? (
              <Button
                variant="outline"
                size="sm"
                className="w-full gap-2 border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                onClick={() => window.open(paper.submission_url, '_blank')}
              >
                <Eye className="h-3.5 w-3.5" />
                Open My Submission
              </Button>
            ) : (
              <p className="text-sm text-gray-400">Submission file not available.</p>
            )}
          </div>

          {paper.submission_status === 'GRADED' && (
            <div className="sm:col-span-2 rounded-xl border border-green-200 bg-green-50/40 p-4 space-y-3">
              <p className="text-xs font-semibold text-green-700 uppercase tracking-wider">Graded Submission</p>
              {paper.graded_pdf_url ? (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full gap-2 border-green-200 text-green-700 hover:bg-green-50"
                  onClick={() => window.open(paper.graded_pdf_url, '_blank')}
                >
                  <CheckCircle className="h-3.5 w-3.5" />
                  Open Graded Submission
                </Button>
              ) : (
                <p className="text-sm text-gray-400">Graded submission not available yet.</p>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end px-6 py-4 border-t bg-gray-50/60">
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── Current Papers — Paid ─────────────────────────────────────────────────────

function PaidCurrentPapersSection({ monthLabel, papers }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <div className="w-1 h-5 rounded-full bg-indigo-500" />
        <h2 className="text-base font-semibold text-gray-900">Current Papers — {monthLabel}</h2>
      </div>

      {papers.length === 0 ? (
        <div className="py-10 text-center text-sm text-gray-400 bg-white rounded-xl border border-border">
          No papers available this month.
        </div>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Paper Name</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {papers.map((paper) => (
                  <TableRow key={paper.id}>
                    <TableCell className="font-medium text-gray-900">{paper.paper_name}</TableCell>
                    <TableCell>
                      <span className={`flex items-center gap-1.5 text-sm ${isPast(paper.due_date) ? 'text-red-500' : 'text-gray-600'}`}>
                        <Clock className="h-3.5 w-3.5 shrink-0" />
                        {formatDate(paper.due_date)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <SubmissionStatusBadge status={paper.submission_status} />
                    </TableCell>
                    <TableCell>
                      {paper.submission_status === 'NOT_SUBMITTED' ? (
                        <Button
                          size="sm"
                          className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs h-7 px-3"
                          onClick={() => toast.info('Exam flow coming soon')}
                        >
                          Start Exam
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs h-7 px-3 border-gray-300 text-gray-600 hover:bg-gray-50"
                          onClick={() => toast.info('Submission view coming soon')}
                        >
                          View Submission
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Current Papers — Unpaid Banner ────────────────────────────────────────────

const BANNER_CONFIG = {
  PENDING: {
    containerClass: 'bg-amber-50 border-amber-200',
    titleClass:     'text-amber-800',
    bodyClass:      'text-amber-700',
  },
  REJECTED: {
    containerClass: 'bg-red-50 border-red-200',
    titleClass:     'text-red-800',
    bodyClass:      'text-red-700',
  },
  NOT_PAID: {
    containerClass: 'bg-gray-50 border-gray-200',
    titleClass:     'text-gray-800',
    bodyClass:      'text-gray-600',
  },
};

function UnpaidCurrentSection({ status, monthLabel }) {
  const cfg = BANNER_CONFIG[status] ?? BANNER_CONFIG.NOT_PAID;

  const bannerBody = {
    PENDING:  `Your ${monthLabel} payment is under review. You will get access once approved.`,
    REJECTED: `Your ${monthLabel} payment was rejected. Please resubmit your payment.`,
    NOT_PAID: `You have not paid for ${monthLabel}. Pay now to access this month's papers.`,
  }[status] ?? `You have not paid for ${monthLabel}.`;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="w-1 h-5 rounded-full bg-indigo-500" />
        <h2 className="text-base font-semibold text-gray-900">Current Papers</h2>
      </div>

      <div className={`rounded-xl border px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 ${cfg.containerClass}`}>
        <p className={`text-sm font-semibold ${cfg.titleClass}`}>{bannerBody}</p>
        <Button
          size="sm"
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs h-8 shrink-0 self-start sm:self-auto"
          onClick={() => toast.info('Payment flow coming soon')}
        >
          Pay Now
        </Button>
      </div>
    </div>
  );
}

// ── Previous Papers — Monthly Navigation ─────────────────────────────────────

function buildMonthList(cls) {
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  return (cls.papers_by_month ?? [])
    .filter((entry) => {
      if (entry.month === currentMonth && entry.year === currentYear) return false;
      return getMonthStatus(cls.monthly_payments, entry.month, entry.year) === 'PAID';
    })
    .map((entry) => ({
      month: entry.month,
      year: entry.year,
      month_label: entry.month_label ?? formatMonthYear(entry.month, entry.year),
      paperCount: entry.papers.length,
    }))
    .sort((a, b) => a.year !== b.year ? b.year - a.year : b.month - a.month);
}

function PreviousPapersSection({ cls }) {
  const router = useRouter();
  const monthList = buildMonthList(cls);

  if (monthList.length === 0) {
    return (
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-5 rounded-full bg-slate-400" />
          <h2 className="text-base font-semibold text-gray-900">Previous Papers</h2>
        </div>
        <div className="py-10 text-center text-sm text-gray-400 bg-white rounded-xl border border-border">
          No previous months available.
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <div className="w-1 h-5 rounded-full bg-slate-400" />
        <h2 className="text-base font-semibold text-gray-900">Previous Papers</h2>
      </div>

      <div className="rounded-xl border border-border overflow-hidden divide-y divide-border bg-white">
        {monthList.map((m) => (
          <button
            key={`${m.year}-${m.month}`}
            onClick={() => router.push(`/student/dashboard/classes/${cls.id}/${toMonthYearSlug(m.month, m.year)}`)}
            className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-indigo-50/60 transition-colors"
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 leading-tight">{m.month_label}</p>
              <p className="text-xs text-gray-400 mt-0.5">
                {m.paperCount} {m.paperCount === 1 ? 'paper' : 'papers'}
              </p>
            </div>
            <ChevronRight className="h-4 w-4 shrink-0 text-gray-400" />
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ClassDetailPage() {
  const { classId } = useParams();
  const { classes } = useEnrolledClasses();
  const cls = classes.find((c) => c.id === classId);

  if (!cls) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <p className="text-gray-500 text-sm">Class not found.</p>
        <Button variant="outline" asChild>
          <Link href="/student/dashboard">
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            Back to My Classes
          </Link>
        </Button>
      </div>
    );
  }

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();
  const currentMonthLabel = formatMonthYear(currentMonth, currentYear);
  const currentStatus = getCurrentMonthStatus(cls.monthly_payments);

  const currentMonthEntry = (cls.papers_by_month ?? []).find(
    (e) => e.month === currentMonth && e.year === currentYear,
  );
  const currentPapers = currentMonthEntry?.papers ?? [];

  return (
    <div className="space-y-6">
      {/* Top bar */}
      <div className="bg-white rounded-xl border border-border px-5 py-4 flex items-center gap-4">
        <Link
          href="/student/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-indigo-600 transition-colors shrink-0"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
        <div className="w-px h-5 bg-gray-200 shrink-0" />
        <div className="min-w-0">
          <h1 className="text-base font-bold text-gray-900 leading-tight truncate">{cls.class_name}</h1>
          <p className="text-xs text-gray-400 mt-0.5">{cls.teacher_name} · {cls.subject} · {cls.class_year}</p>
        </div>
      </div>

      {/* Current Papers */}
      {currentStatus === 'PAID' ? (
        <PaidCurrentPapersSection monthLabel={currentMonthLabel} papers={currentPapers} />
      ) : (
        <UnpaidCurrentSection
          status={currentStatus}
          monthLabel={currentMonthLabel}
        />
      )}

      {/* Divider */}
      <div className="h-px bg-gray-200" />

      {/* Previous Papers — monthly navigation */}
      <PreviousPapersSection cls={cls} />
    </div>
  );
}
