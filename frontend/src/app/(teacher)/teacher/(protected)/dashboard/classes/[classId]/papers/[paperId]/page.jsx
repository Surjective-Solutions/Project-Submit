'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  Activity,
  Award,
  BarChart2,
  CheckCircle,
  ChevronLeft,
  Clock,
  TrendingDown,
  TrendingUp,
  Trophy,
  UserCheck,
  Users,
} from 'lucide-react';
import { toast } from 'sonner';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { MOCK_TEACHER_CLASSES } from '@/lib/mock-data';

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MOCK_NOW = new Date('2026-06-19T18:30:00.000Z');
const SRI_LANKA_OFFSET_MS = 5.5 * 60 * 60 * 1000;

const SCORE_RANGES = [
  { label: '0–24',   min: 0,  max: 24,  barColor: 'bg-red-500' },
  { label: '25–49',  min: 25, max: 49,  barColor: 'bg-red-400' },
  { label: '50–64',  min: 50, max: 64,  barColor: 'bg-amber-400' },
  { label: '65–74',  min: 65, max: 74,  barColor: 'bg-amber-500' },
  { label: '75–84',  min: 75, max: 84,  barColor: 'bg-indigo-500' },
  { label: '85–94',  min: 85, max: 94,  barColor: 'bg-green-500' },
  { label: '95–100', min: 95, max: 100, barColor: 'bg-green-600' },
];

function initials(name) {
  const parts = (name ?? '').trim().split(/\s+/);
  if (parts.length >= 2) return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  return (parts[0]?.slice(0, 2) || '?').toUpperCase();
}

function formatRelativeDate(value) {
  const date = new Date(value);
  const diffMs = MOCK_NOW.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / 86400000);
  const diffHours = Math.floor(diffMs / 3600000);
  if (diffDays > 0) return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
  if (diffHours > 0) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
  return 'Today';
}

function formatFullDate(value) {
  const date = new Date(new Date(value).getTime() + SRI_LANKA_OFFSET_MS);
  const month = MONTH_NAMES[date.getUTCMonth()];
  const day = date.getUTCDate();
  const year = date.getUTCFullYear();
  const hour24 = date.getUTCHours();
  const minute = String(date.getUTCMinutes()).padStart(2, '0');
  const period = hour24 >= 12 ? 'PM' : 'AM';
  const hour12 = hour24 % 12 || 12;
  return `${month} ${day}, ${year}, ${hour12}:${minute} ${period}`;
}

function formatGrade(grade) {
  return grade?.replace('/', ' / ') ?? '-';
}

function parseScore(grade) {
  if (!grade) return null;
  const parts = grade.split('/');
  if (parts.length !== 2) return null;
  const score = Number(parts[0]);
  const total = Number(parts[1]);
  if (isNaN(score) || isNaN(total)) return null;
  return { score, total };
}

function StudentCell({ submission }) {
  return (
    <div className="flex min-w-48 items-center gap-2.5">
      <Avatar className="h-8 w-8">
        <AvatarFallback className="bg-indigo-50 text-xs font-semibold text-indigo-700">
          {initials(submission.student_name)}
        </AvatarFallback>
      </Avatar>
      <span className="font-medium text-gray-900">{submission.student_name}</span>
    </div>
  );
}

export default function TeacherPaperSubmissionsPage() {
  const { classId, paperId } = useParams();
  const [statsOpen, setStatsOpen] = useState(false);

  const foundClass = MOCK_TEACHER_CLASSES.find((c) => c.id === classId);
  const paper = foundClass?.papers?.find((p) => p.id === paperId);

  const stats = useMemo(() => {
    if (!paper) return null;
    const allSubmissions = paper.submissions ?? [];
    const gradedSubs = allSubmissions.filter((s) => s.graded);
    const pendingSubs = allSubmissions.filter((s) => !s.graded);

    const parsedScores = gradedSubs
      .map((s) => ({ ...parseScore(s.grade), student_name: s.student_name }))
      .filter((s) => s.score != null);

    const scoreValues = parsedScores.map((s) => s.score);
    const totalMarks = parsedScores.length > 0 ? parsedScores[0].total : 100;
    const gradedCount = gradedSubs.length;
    const totalCount = allSubmissions.length;
    const pendingCount = pendingSubs.length;

    let mean = 0, median = 0, stdDev = 0;
    let highest = null, lowest = null;

    if (scoreValues.length > 0) {
      mean = scoreValues.reduce((a, b) => a + b, 0) / gradedCount;

      const sorted = [...scoreValues].sort((a, b) => a - b);
      const mid = Math.floor(sorted.length / 2);
      median = sorted.length % 2 === 0
        ? (sorted[mid - 1] + sorted[mid]) / 2
        : sorted[mid];

      const variance = scoreValues.reduce((sum, s) => sum + Math.pow(s - mean, 2), 0) / gradedCount;
      stdDev = Math.sqrt(variance);

      const maxScore = Math.max(...scoreValues);
      const minScore = Math.min(...scoreValues);
      highest = { score: maxScore, name: parsedScores.find((s) => s.score === maxScore)?.student_name };
      lowest  = { score: minScore, name: parsedScores.find((s) => s.score === minScore)?.student_name };
    }

    const passThreshold = totalMarks * 0.5;
    const passCount = scoreValues.filter((s) => s >= passThreshold).length;
    const passRate = gradedCount > 0 ? Math.round((passCount / gradedCount) * 100) : 0;

    const distribution = SCORE_RANGES.map((range) => ({
      ...range,
      count: scoreValues.filter((s) => s >= range.min && s <= range.max).length,
    }));
    const maxDistCount = Math.max(...distribution.map((d) => d.count), 1);

    const sortedBreakdown = [...allSubmissions].sort((a, b) => {
      if (!a.graded && !b.graded) return 0;
      if (!a.graded) return 1;
      if (!b.graded) return -1;
      return (parseScore(b.grade)?.score ?? 0) - (parseScore(a.grade)?.score ?? 0);
    });

    return {
      totalCount,
      gradedCount,
      pendingCount,
      mean: gradedCount > 0 ? mean.toFixed(2) : 'N/A',
      median: gradedCount > 0 ? median.toFixed(2) : 'N/A',
      stdDev: gradedCount > 0 ? stdDev.toFixed(2) : 'N/A',
      highest,
      lowest,
      passRate,
      distribution,
      maxDistCount,
      sortedBreakdown,
      hasGraded: gradedCount > 0,
    };
  }, [paper]);

  if (!foundClass || !paper) {
    return (
      <div className="mx-auto flex min-h-[50vh] max-w-xl flex-col items-center justify-center gap-4 text-center">
        <h2 className="text-xl font-semibold text-gray-900">Paper not found</h2>
        <Button
          variant="outline"
          nativeButton={false}
          className="border-indigo-200 text-indigo-700 hover:bg-indigo-50"
          render={<Link href={foundClass ? `/teacher/dashboard/classes/${classId}` : '/teacher/dashboard'} />}
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </Button>
      </div>
    );
  }

  const pendingSubmissions = (paper.submissions ?? []).filter((s) => !s.graded);
  const gradedSubmissions  = (paper.submissions ?? []).filter((s) => s.graded);

  const passRateColor = stats?.passRate >= 60
    ? 'text-green-600'
    : stats?.passRate >= 40
      ? 'text-amber-600'
      : 'text-red-600';

  return (
    <div className="space-y-5">
      {/* Top bar */}
      <div className="rounded-2xl border border-border bg-white p-4 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <Button
              variant="ghost"
              nativeButton={false}
              className="mb-3 h-8 px-2 text-gray-500 hover:text-gray-900"
              render={<Link href={`/teacher/dashboard/classes/${classId}`} />}
            >
              <ChevronLeft className="h-4 w-4" />
              Back
            </Button>
            <h2 className="text-xl font-semibold text-gray-900">{paper.paper_name}</h2>
            <p className="mt-1 text-sm text-gray-500">
              {foundClass.display_name} <span className="text-gray-300">·</span> {paper.month_label}
            </p>
          </div>
          <div className="shrink-0 pt-1">
            <Button
              variant="outline"
              className="gap-2 border-indigo-200 text-indigo-700 hover:bg-indigo-50 hover:text-indigo-800"
              onClick={() => setStatsOpen(true)}
            >
              <BarChart2 className="h-4 w-4" />
              Statistics
            </Button>
          </div>
        </div>
      </div>

      {/* Pending Grading */}
      <section className="rounded-2xl border border-border bg-white shadow-sm overflow-x-auto">
        <div className="border-l-4 border-amber-400 px-4 py-3">
          <h3 className="text-base font-semibold text-gray-900">
            Pending Grading <span className="font-normal text-gray-400">•&nbsp;{pendingSubmissions.length}</span>
          </h3>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead>Student No.</TableHead>
              <TableHead>Submitted</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pendingSubmissions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="py-10 text-center text-sm text-gray-400">
                  All submissions have been graded.
                </TableCell>
              </TableRow>
            ) : (
              pendingSubmissions.map((submission) => (
                <TableRow key={submission.id}>
                  <TableCell>
                    <StudentCell submission={submission} />
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-mono text-[11px] text-gray-500">
                      {submission.student_number}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-gray-500">
                    <span title={formatFullDate(submission.submitted_at)}>
                      {formatRelativeDate(submission.submitted_at)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      className="bg-indigo-600 text-white hover:bg-indigo-700"
                      onClick={() => toast.info('Grading flow coming soon')}
                    >
                      Grade
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </section>

      {/* Graded */}
      <section className="rounded-2xl border border-border bg-white shadow-sm overflow-x-auto">
        <div className="border-l-4 border-green-500 px-4 py-3">
          <h3 className="text-base font-semibold text-gray-900">
            Graded <span className="font-normal text-gray-400">•&nbsp;{gradedSubmissions.length}</span>
          </h3>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead>Student No.</TableHead>
              <TableHead>Grade</TableHead>
              <TableHead>Graded By</TableHead>
              <TableHead>Graded At</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {gradedSubmissions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-sm text-gray-400">
                  No submissions graded yet.
                </TableCell>
              </TableRow>
            ) : (
              gradedSubmissions.map((submission) => (
                <TableRow key={submission.id}>
                  <TableCell>
                    <StudentCell submission={submission} />
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-mono text-[11px] text-gray-500">
                      {submission.student_number}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-semibold text-amber-600">{formatGrade(submission.grade)}</TableCell>
                  <TableCell className="min-w-48 text-gray-500">
                    <span className="inline-flex items-center gap-1.5">
                      <UserCheck className="h-3.5 w-3.5 text-green-600" />
                      {submission.graded_by}
                    </span>
                  </TableCell>
                  <TableCell className="text-gray-500">
                    <span title={formatFullDate(submission.graded_at)}>
                      {formatRelativeDate(submission.graded_at)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-indigo-200 text-indigo-700 hover:bg-indigo-50 hover:text-indigo-800"
                      onClick={() => toast.info('Submission view coming soon')}
                    >
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </section>

      {/* Statistics Dialog */}
      <Dialog open={statsOpen} onOpenChange={setStatsOpen}>
        <DialogContent className="sm:max-w-2xl p-0 gap-0" showCloseButton={false}>
          {/* Gradient header */}
          <div
            className="flex items-center gap-3 rounded-t-xl px-5 py-4"
            style={{ background: 'linear-gradient(135deg, #3940A0 0%, #5a62ff 100%)' }}
          >
            <BarChart2 className="h-5 w-5 shrink-0 text-white" />
            <DialogTitle className="m-0 text-base font-semibold leading-none text-white">
              Paper Statistics
            </DialogTitle>
          </div>

          {/* Scrollable content */}
          <ScrollArea className="max-h-[70vh]">
            <div className="space-y-6 p-5">

              {/* Section 1: Overview cards */}
              <div>
                <h4 className="mb-3 text-sm font-semibold text-gray-700">Overview</h4>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  <div className="flex items-center gap-3 rounded-xl border border-border bg-gray-50 p-3">
                    <div className="shrink-0 rounded-lg bg-indigo-100 p-2">
                      <Users className="h-4 w-4 text-indigo-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Total Submissions</p>
                      <p className="text-xl font-bold text-gray-900">{stats?.totalCount ?? 0}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 rounded-xl border border-border bg-gray-50 p-3">
                    <div className="shrink-0 rounded-lg bg-green-100 p-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Graded</p>
                      <p className="text-xl font-bold text-green-600">{stats?.gradedCount ?? 0}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 rounded-xl border border-border bg-gray-50 p-3">
                    <div className="shrink-0 rounded-lg bg-amber-100 p-2">
                      <Clock className="h-4 w-4 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Pending</p>
                      <p className="text-xl font-bold text-amber-600">{stats?.pendingCount ?? 0}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 rounded-xl border border-border bg-gray-50 p-3">
                    <div className="shrink-0 rounded-lg bg-indigo-100 p-2">
                      <TrendingUp className="h-4 w-4 text-indigo-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Mean Score</p>
                      <p className="text-xl font-bold text-gray-900">{stats?.mean ?? 'N/A'}</p>
                    </div>
                  </div>

                  <div className="flex min-w-0 items-center gap-3 rounded-xl border border-border bg-gray-50 p-3">
                    <div className="shrink-0 rounded-lg bg-yellow-100 p-2">
                      <Trophy className="h-4 w-4 text-yellow-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-gray-500">Highest Score</p>
                      {stats?.highest ? (
                        <>
                          <p className="text-xl font-bold text-yellow-600">{stats.highest.score}</p>
                          <p className="truncate text-[11px] text-gray-400">{stats.highest.name}</p>
                        </>
                      ) : (
                        <p className="text-xl font-bold text-gray-400">N/A</p>
                      )}
                    </div>
                  </div>

                  <div className="flex min-w-0 items-center gap-3 rounded-xl border border-border bg-gray-50 p-3">
                    <div className="shrink-0 rounded-lg bg-red-100 p-2">
                      <TrendingDown className="h-4 w-4 text-red-500" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-gray-500">Lowest Score</p>
                      {stats?.lowest ? (
                        <>
                          <p className="text-xl font-bold text-red-500">{stats.lowest.score}</p>
                          <p className="truncate text-[11px] text-gray-400">{stats.lowest.name}</p>
                        </>
                      ) : (
                        <p className="text-xl font-bold text-gray-400">N/A</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 rounded-xl border border-border bg-gray-50 p-3">
                    <div className="shrink-0 rounded-lg bg-indigo-100 p-2">
                      <BarChart2 className="h-4 w-4 text-indigo-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Median</p>
                      <p className="text-xl font-bold text-gray-900">{stats?.median ?? 'N/A'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 rounded-xl border border-border bg-gray-50 p-3">
                    <div className="shrink-0 rounded-lg bg-purple-100 p-2">
                      <Activity className="h-4 w-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Std Deviation</p>
                      <p className="text-xl font-bold text-gray-900">{stats?.stdDev ?? 'N/A'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 rounded-xl border border-border bg-gray-50 p-3">
                    <div className="shrink-0 rounded-lg bg-green-100 p-2">
                      <Award className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Pass Rate</p>
                      <p className={`text-xl font-bold ${stats?.hasGraded ? passRateColor : 'text-gray-400'}`}>
                        {stats?.hasGraded ? `${stats.passRate}%` : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 2: Score Distribution */}
              <div>
                <h4 className="mb-3 text-sm font-semibold text-gray-700">Score Distribution</h4>
                {!stats?.hasGraded ? (
                  <p className="py-6 text-center text-sm text-gray-400">
                    No graded submissions yet. Stats will appear once papers are graded.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {stats.distribution.map((range) => (
                      <div key={range.label} className="flex items-center gap-3">
                        <span className="w-16 shrink-0 text-right text-xs font-medium text-gray-600">
                          {range.label}
                        </span>
                        <div className="h-6 flex-1 overflow-hidden rounded bg-gray-100">
                          <div
                            className={`h-full rounded transition-all ${range.barColor}`}
                            style={{ width: `${(range.count / stats.maxDistCount) * 100}%` }}
                          />
                        </div>
                        <span className="w-20 shrink-0 text-xs text-gray-500">
                          {range.count} {range.count === 1 ? 'student' : 'students'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Section 3: Student Breakdown */}
              <div>
                <h4 className="mb-3 text-sm font-semibold text-gray-700">Student Scores</h4>
                <div className="overflow-x-auto rounded-xl border border-border">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-gray-50">
                        <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">Student</th>
                        <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">Score</th>
                        <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(stats?.sortedBreakdown ?? []).map((submission) => {
                        const parsed = parseScore(submission.grade);
                        const scoreColor = !parsed
                          ? 'text-gray-400'
                          : parsed.score >= 75
                            ? 'text-green-600'
                            : parsed.score >= 50
                              ? 'text-amber-600'
                              : 'text-red-600';
                        return (
                          <tr
                            key={submission.id}
                            className="border-b border-border last:border-0 hover:bg-gray-50"
                          >
                            <td className="px-3 py-2">
                              <div className="flex items-center gap-2">
                                <Avatar className="h-6 w-6">
                                  <AvatarFallback className="bg-indigo-50 text-[10px] font-semibold text-indigo-700">
                                    {initials(submission.student_name)}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-xs font-medium text-gray-900">
                                  {submission.student_name}
                                </span>
                              </div>
                            </td>
                            <td className="px-3 py-2">
                              <span className={`font-semibold ${scoreColor}`}>
                                {parsed ? `${parsed.score} / ${parsed.total}` : '—'}
                              </span>
                            </td>
                            <td className="px-3 py-2">
                              {submission.graded ? (
                                <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-[11px] font-semibold text-green-700">
                                  Graded
                                </span>
                              ) : (
                                <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-700">
                                  Pending
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          </ScrollArea>

          {/* Footer */}
          <div className="flex justify-end rounded-b-xl border-t border-border bg-muted/50 px-5 py-3">
            <DialogClose render={<Button variant="outline" />}>
              Close
            </DialogClose>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
