'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { toast } from 'sonner';
import { ArrowLeft, Eye, FileText, CheckCircle, Lock } from 'lucide-react';
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
  isPaidMonth,
  formatMonthYear,
  parseMonthYearSlug,
} from '@/lib/billing-utils';

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
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

// ── Papers Table ──────────────────────────────────────────────────────────────

function PapersTable({ papers }) {
  const [viewPaper, setViewPaper] = useState(null);

  return (
    <>
      <div className="rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Paper Name</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Grade</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>View</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {papers.map((paper) => (
                <TableRow key={paper.id}>
                  <TableCell className="font-semibold text-gray-900">{paper.paper_name}</TableCell>
                  <TableCell className="text-sm text-gray-500">{formatDate(paper.due_date)}</TableCell>
                  <TableCell>
                    {paper.submission_status === 'GRADED' && paper.grade ? (
                      <span className="font-semibold text-amber-600">{paper.grade}</span>
                    ) : paper.submission_status === 'SUBMITTED' ? (
                      <span className="text-sm text-gray-400">Pending</span>
                    ) : (
                      <span className="text-sm text-gray-300">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <SubmissionStatusBadge status={paper.submission_status} />
                  </TableCell>
                  <TableCell>
                    <button
                      onClick={() => setViewPaper(paper)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-600 transition-colors"
                      title="View paper"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
      <ViewPaperDialog
        open={!!viewPaper}
        onOpenChange={(o) => !o && setViewPaper(null)}
        paper={viewPaper}
      />
    </>
  );
}

// ── Locked State ──────────────────────────────────────────────────────────────

function LockedState({ classId, monthLabel }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-5 text-center px-4">
      <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
        <Lock className="h-8 w-8 text-gray-400" />
      </div>
      <div className="space-y-2">
        <h2 className="text-base font-semibold text-gray-900">No Content Available</h2>
        <p className="text-sm text-gray-500 max-w-sm leading-relaxed">
          You have not paid for {monthLabel}. Purchase this month to view these papers.
        </p>
      </div>
      <Button
        className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold h-9 px-5"
        onClick={() => toast.info('Payment flow coming soon')}
      >
        Pay Now
      </Button>
      <Link
        href={`/student/dashboard/classes/${classId}`}
        className="text-sm text-gray-400 hover:text-indigo-600 transition-colors"
      >
        ← Back to Class
      </Link>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function MonthDetailPage() {
  const { classId, monthYear } = useParams();
  const { classes } = useEnrolledClasses();

  const cls = classes.find((c) => c.id === classId);
  const { month, year } = parseMonthYearSlug(monthYear ?? '');
  const monthLabel = month > 0 ? formatMonthYear(month, year) : null;

  if (!cls || !monthLabel) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <p className="text-gray-500 text-sm">Page not found.</p>
        <Button variant="outline" asChild>
          <Link href="/student/dashboard">
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            Back to My Classes
          </Link>
        </Button>
      </div>
    );
  }

  const paid = isPaidMonth(cls.monthly_payments, month, year);

  const monthEntry = (cls.papers_by_month ?? []).find(
    (e) => e.month === month && e.year === year,
  );
  const papers = monthEntry?.papers ?? [];

  return (
    <div className="space-y-6">
      {/* Top bar */}
      <div className="bg-white rounded-xl border border-border px-5 py-4 flex items-center gap-4">
        <Link
          href={`/student/dashboard/classes/${classId}`}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-indigo-600 transition-colors shrink-0"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
        <div className="w-px h-5 bg-gray-200 shrink-0" />
        <div className="min-w-0">
          <h1 className="text-base font-bold text-gray-900 leading-tight truncate">
            {cls.class_name} — {monthLabel}
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">{cls.teacher_name} · {cls.subject} · {cls.class_year}</p>
        </div>
      </div>

      {/* Content */}
      {!paid ? (
        <LockedState classId={classId} monthLabel={monthLabel} />
      ) : papers.length === 0 ? (
        <div className="py-16 text-center text-sm text-gray-400 bg-white rounded-xl border border-border">
          No papers available for {monthLabel}.
        </div>
      ) : (
        <PapersTable papers={papers} />
      )}
    </div>
  );
}
