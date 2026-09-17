'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Award,
  BarChart3,
  Calendar,
  CheckCircle,
  ChevronRight,
  Eye,
  ExternalLink,
  FileText,
  Info,
  Star,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEnrolledClasses } from '@/context/EnrolledClassesContext';
import { findPaperInClass } from '@/lib/exam-utils';
import { toMonthYearSlug } from '@/lib/billing-utils';
import { getGradeDetailsForPaper } from '@/lib/api-client';

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

// Parses a "98/100"-style fraction out of a grade string like "A (98/100)"
// so we can drive the score ring + performance message.
function parseScoreFromGrade(gradeStr) {
  if (!gradeStr) return null;
  const match = String(gradeStr).match(/(\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)/);
  if (!match) return null;
  const awarded = Number(match[1]);
  const total = Number(match[2]);
  if (!total) return null;
  return { awarded, total, percentage: Math.round((awarded / total) * 100) };
}

function getPerformanceMessage(percentage) {
  if (percentage >= 90) {
    return {
      title: 'Excellent work! 🎉',
      subtitle: "You've demonstrated a strong understanding of the concepts.",
    };
  }
  if (percentage >= 75) {
    return {
      title: 'Great job! 👏',
      subtitle: 'You have a solid grasp of the material.',
    };
  }
  if (percentage >= 60) {
    return {
      title: 'Good effort! 💪',
      subtitle: 'A bit more practice will take you far.',
    };
  }
  return {
    title: 'Keep practicing! 📚',
    subtitle: 'Review the feedback to strengthen weak areas.',
  };
}

// ── Circular Score Ring ─────────────────────────────────────────────────────

function CircularScore({ percentage }) {
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, percentage));
  const offset = circumference - (clamped / 100) * circumference;

  return (
    <div className="relative w-24 h-24 shrink-0">
      <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={radius} fill="none" stroke="#bbf7d0" strokeWidth="8" />
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke="#16a34a"
          strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-lg font-bold text-green-700">{clamped}%</span>
        <span className="text-[10px] text-gray-500">Score</span>
      </div>
    </div>
  );
}

// ── Document Card ─────────────────────────────────────────────────────────────

const ACCENT_STYLES = {
  indigo: {
    iconBg: 'bg-indigo-100',
    iconColor: 'text-indigo-600',
    button: 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100',
  },
  blue: {
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    button: 'bg-blue-50 text-blue-700 hover:bg-blue-100',
  },
  green: {
    iconBg: 'bg-green-100',
    iconColor: 'text-green-600',
    button: 'bg-green-50 text-green-700 hover:bg-green-100',
  },
};

function DocumentCard({ icon: Icon, title, url, actionLabel, unavailableText, accent = 'indigo' }) {
  const styles = ACCENT_STYLES[accent];
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 space-y-4">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl ${styles.iconBg} flex items-center justify-center shrink-0`}>
          <Icon className={`h-5 w-5 ${styles.iconColor}`} />
        </div>
        <p className="text-sm font-semibold text-gray-900">{title}</p>
      </div>
      {url ? (
        <button
          type="button"
          onClick={() => window.open(url, '_blank')}
          className={`w-full flex items-center justify-between rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors ${styles.button}`}
        >
          {actionLabel}
          <ExternalLink className="h-3.5 w-3.5" />
        </button>
      ) : (
        <p className="text-sm text-gray-400">{unavailableText}</p>
      )}
    </div>
  );
}

// ── Grade Breakdown ──────────────────────────────────────────────────────────

function GradeBreakdownSection({ classId, paperId, isGraded }) {
  const [gradeDetails, setGradeDetails] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isGraded) return;
    let cancelled = false;
    loadGradeDetails();
    return () => {
      cancelled = true;
    };

    async function loadGradeDetails() {
      try {
        setLoading(true);
        const data = await getGradeDetailsForPaper(paperId);
        if (!cancelled) setGradeDetails(data ?? []);
      } catch {
        if (!cancelled) toast.error('Failed to load grade breakdown.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
  }, [paperId, isGraded]);

  if (!isGraded) return null;

  if (loading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6 space-y-3 md:max-w-xl">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Grade Breakdown
        </p>
        <p className="text-sm text-gray-400">Loading grade breakdown...</p>
      </div>
    );
  }

  if (gradeDetails.length === 0) return null;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 space-y-5 md:max-w-xl">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-indigo-100 flex items-center justify-center shrink-0">
          <BarChart3 className="h-4.5 w-4.5 text-indigo-600" />
        </div>
        <p className="text-sm font-semibold text-gray-900">Grade Breakdown</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-100">
              <th className="py-2 pr-4 font-semibold">Question</th>
              <th className="py-2 font-semibold">Marks</th>
            </tr>
          </thead>
          <tbody>
            {gradeDetails.map((detail) => (
              <tr key={detail.question_id} className="border-b border-gray-50 last:border-0">
                <td className="py-3 pr-4 font-medium text-gray-900 align-top whitespace-nowrap">
                  {detail.question_id}
                </td>
                <td className="py-3 align-top whitespace-nowrap">
                  <span className="font-semibold text-green-700">{detail.marks_awarded}</span>
                  <span className="text-gray-400"> / {detail.max_marks}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Button
        variant="outline"
        size="sm"
        nativeButton={false}
        className="gap-1.5 border-0 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg"
        render={<Link href={`/student/dashboard/classes/${classId}/papers/${paperId}/feedback`} />}
      >
        View Detailed Feedback
        <ChevronRight className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function PaperSubmissionPage() {
  const { classId, paperId } = useParams();
  const { classes } = useEnrolledClasses();

  const cls = classes.find((c) => c.id === Number(classId));

  if (!cls) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <p className="text-gray-500 text-sm">Class not found.</p>
        <Button
          variant="outline"
          nativeButton={false}
          render={
            <Link href="/student/dashboard">
              <ArrowLeft className="h-4 w-4 mr-1.5" />
              Back to My Classes
            </Link>
          }
        />
      </div>
    );
  }

  const paper = findPaperInClass(cls, paperId);
  console.log('submission page paper.submission_url:', paper?.submission_url);

  if (!paper) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <p className="text-gray-500 text-sm">Paper not found.</p>
        <Button
          variant="outline"
          nativeButton={false}
          render={
            <Link href={`/student/dashboard/classes/${classId}`}>
              <ArrowLeft className="h-4 w-4 mr-1.5" />
              Back to Class
            </Link>
          }
        />
      </div>
    );
  }

  const monthEntry = (cls.papers_by_month ?? []).find((e) =>
    (e.papers ?? []).some((p) => String(p.id) === String(paperId)),
  );
  const now = new Date();
  const isCurrentMonth =
    monthEntry && monthEntry.month === now.getMonth() + 1 && monthEntry.year === now.getFullYear();
  const backHref = monthEntry && !isCurrentMonth
    ? `/student/dashboard/classes/${classId}/${toMonthYearSlug(monthEntry.month, monthEntry.year)}`
    : `/student/dashboard/classes/${classId}`;

  const isGraded = paper.submission_status === 'GRADED' || paper.submission_status === 'REGRADE_REQUESTED';
  const scoreInfo = isGraded ? parseScoreFromGrade(paper.grade) : null;
  const message = scoreInfo ? getPerformanceMessage(scoreInfo.percentage) : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Link
          href={backHref}
          className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3.5 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-50 transition-colors shrink-0"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
        <div className="min-w-0 pt-1">
          <h1 className="text-2xl font-bold text-gray-900 leading-tight truncate">
            {paper.paper_name}
          </h1>
          <div className="flex items-center gap-1.5 text-sm text-gray-400 mt-1">
            <Calendar className="h-3.5 w-3.5" />
            <span>
              {cls.class_name} · Due {formatDate(paper.due_date)}
            </span>
          </div>
        </div>
      </div>

      {/* Grade banner */}
      {isGraded && paper.grade && (
        <div className="rounded-2xl border border-green-200 bg-green-50 px-6 py-5 flex items-center gap-6 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center shrink-0">
              <Award className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-green-600 uppercase tracking-wider">
                Your Grade
              </p>
              <p className="text-2xl font-bold text-green-700 leading-tight">{paper.grade}</p>
            </div>
          </div>

          {scoreInfo && message && (
            <>
              <div className="w-px h-12 bg-green-200 hidden sm:block" />
              <div className="flex items-center gap-3 flex-1 min-w-[200px]">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                  <Star className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{message.title}</p>
                  <p className="text-sm text-gray-500">{message.subtitle}</p>
                </div>
              </div>
              <CircularScore percentage={scoreInfo.percentage} />
            </>
          )}
        </div>
      )}

      {/* Documents */}
      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
        <DocumentCard
          icon={FileText}
          title="Original Paper"
          url={paper.exam_pdf_url}
          actionLabel="Open Exam Paper"
          unavailableText="Exam paper not available."
          accent="indigo"
        />
        <DocumentCard
          icon={Eye}
          title="Your Submission"
          url={paper.submission_url}
          actionLabel="Open My Submission"
          unavailableText="Submission file not available."
          accent="blue"
        />
        {isGraded ? (
          <DocumentCard
            icon={CheckCircle}
            title="Graded Submission"
            url={paper.graded_pdf_url}
            actionLabel="Open Graded Submission"
            unavailableText="Graded submission not available yet."
            accent="green"
          />
        ) : (
          <div className="rounded-2xl border border-gray-200 bg-white p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                <CheckCircle className="h-5 w-5 text-gray-400" />
              </div>
              <p className="text-sm font-semibold text-gray-900">Graded Submission</p>
            </div>
            <p className="text-sm text-gray-400">Not graded yet.</p>
          </div>
        )}
      </div>

      {/* Grade Breakdown */}
      <GradeBreakdownSection classId={classId} paperId={paperId} isGraded={isGraded} />

      {/* Info banner */}
      {isGraded && paper.grade && (
        <div className="flex items-center gap-3 rounded-xl bg-indigo-50 border border-indigo-100 px-5 py-3.5">
          <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center shrink-0">
            <Info className="h-3.5 w-3.5 text-white" />
          </div>
          <p className="text-sm text-indigo-900">
            You can review your graded submission and feedback to understand your performance better.
          </p>
        </div>
      )}
    </div>
  );
}