'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ChevronLeft, FileText, Loader2, PenLine, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { MOCK_TEACHER_CLASSES } from '@/lib/mock-data';
import {
  getClasses,
  submitTutorGrades,
  editTutorSubmissionGrade,
  getPendingRegradeRequests,
} from '@/lib/api-client';

const GRADE_TEXT_COLOR = {
  green: 'text-green-600',
  blue: 'text-blue-600',
  amber: 'text-amber-600',
  orange: 'text-orange-500',
  red: 'text-red-600',
};

const GRADE_BADGE_COLOR = {
  green: 'bg-green-100 text-green-700',
  blue: 'bg-blue-100 text-blue-700',
  amber: 'bg-amber-100 text-amber-700',
  orange: 'bg-orange-100 text-orange-700',
  red: 'bg-red-100 text-red-700',
};

function buildInitialGradeState(submission) {
  const marks = {};
  const comments = {};
  const commentOpen = {};
  (submission?.awarded_marks ?? []).forEach((a) => {
    marks[a.question_id] = a.marks_awarded != null ? String(a.marks_awarded) : '';
    if (a.comment) {
      comments[a.question_id] = a.comment;
      commentOpen[a.question_id] = true;
    }
  });
  return { marks, comments, commentOpen };
}

// Labels come from the backend as "7", "7(a)", or "7(a)(i)" — deterministic
// enough to rebuild the 3-level tree by parsing the string itself.
function parseQuestionLabel(label) {
  const match = String(label).match(/^(\d+)(?:\(([a-z]+)\))?(?:\(([ivxlcdm]+)\))?$/i);
  if (!match) return null;
  const [, qNum, letter, roman] = match;
  return { qNum, letter: letter || null, roman: roman || null };
}

function getGrade(score, totalMarks) {
  const percentage = (score / totalMarks) * 100;
  if (percentage >= 75) return { grade: 'A', color: 'green' };
  if (percentage >= 65) return { grade: 'B', color: 'blue' };
  if (percentage >= 50) return { grade: 'C', color: 'amber' };
  if (percentage >= 35) return { grade: 'S', color: 'orange' };
  return { grade: 'F', color: 'red' };
}

function QuestionRow({
  question,
  value,
  comment,
  commentOpen,
  exceeded,
  showEmptyError,
  onMarksChange,
  onCommentChange,
  onToggleComment,
}) {
  const invalid = exceeded || showEmptyError;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-semibold text-gray-900">{question.question_label}</span>
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-gray-400">/ {question.max_marks}</span>
          <Tooltip open={exceeded}>
            <TooltipTrigger
              render={
                <Input
                  type="number"
                  min={0}
                  max={question.max_marks}
                  placeholder="0"
                  value={value}
                  onChange={(e) => onMarksChange(question, e.target.value)}
                  className={cn(
                    'w-20 text-right',
                    invalid && 'border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500/30'
                  )}
                />
              }
            />
            <TooltipContent>Maximum {question.max_marks} marks</TooltipContent>
          </Tooltip>
        </div>
      </div>
      {commentOpen ? (
        <Textarea
          rows={2}
          placeholder="Add comment (optional)"
          value={comment}
          onChange={(e) => onCommentChange(question, e.target.value)}
          className="text-xs"
        />
      ) : (
        <button
          type="button"
          onClick={() => onToggleComment(question)}
          className="text-xs text-indigo-600 hover:underline"
        >
          Add comment
        </button>
      )}
    </div>
  );
}

export default function GradeSubmissionPage() {
  const { classId, paperId, submissionId } = useParams();
  const router = useRouter();


const [classes, setClasses] = useState([]);
const [loading, setLoading] = useState(true);
const [submission, setSubmission] = useState(null);
const [regradeRequest, setRegradeRequest] = useState(null);

  useEffect(() => {
    loadData();
    loadRegradeRequest();
  }, []);

  async function loadRegradeRequest() {
    try {
      const requests = await getPendingRegradeRequests();
      const match = (requests ?? []).find((r) => String(r.submission_id) === String(submissionId));
      setRegradeRequest(match ?? null);
    } catch (error) {
      console.error('Failed to load regrade request:', error);
    }
  }

  async function loadData() {
    try {
      setLoading(true);

      const data = await getClasses();

      console.log("Backend classes:", data);

      setClasses(data);

      const foundClass = data.find(
        (c) => String(c.id) === String(classId)
      );

      const paper = foundClass?.papers?.find(
        (p) => String(p.id) === String(paperId)
      );

      const foundSubmission = paper?.submissions?.find(
        (s) => String(s.id) === String(submissionId)
      );

      console.log("Found class:", foundClass);
      console.log("Found paper:", paper);
      console.log("Found submission:", foundSubmission);

      setSubmission(foundSubmission ?? null);

    } catch (error) {
      console.error("Failed to load submission:", error);
      toast.error("Failed to load submission");
    } finally {
      setLoading(false);
    }
  }

  const foundClass = classes.find(
    (c) => String(c.id) === String(classId)
  );

  const paper = foundClass?.papers?.find(
    (p) => String(p.id) === String(paperId)
  );

  // const foundClass = MOCK_TEACHER_CLASSES.find((c) => c.id === classId);
  // const paper = foundClass?.papers?.find((p) => p.id === paperId);
  // const submission = paper?.submissions?.find((s) => s.id === submissionId);

  const questions = useMemo(
    () => (paper?.questions ? [...paper.questions].sort((a, b) => a.display_order - b.display_order) : []),
    [paper]
  );

  const groups = useMemo(() => {
    const order = [];
    const map = new Map();

    for (const q of questions) {
      const parsed = parseQuestionLabel(q.question_label);
      if (!parsed) continue;
      const { qNum, letter, roman } = parsed;

      if (!map.has(qNum)) {
        map.set(qNum, { key: qNum, self: null, max: 0, subOrder: [], subMap: new Map() });
        order.push(qNum);
      }
      const qEntry = map.get(qNum);
      qEntry.max += q.max_marks;

      if (!letter) {
        qEntry.self = q;
        continue;
      }

      if (!qEntry.subMap.has(letter)) {
        qEntry.subMap.set(letter, { key: `${qNum}(${letter})`, self: null, max: 0, subsubparts: [] });
        qEntry.subOrder.push(letter);
      }
      const spEntry = qEntry.subMap.get(letter);
      spEntry.max += q.max_marks;

      if (!roman) {
        spEntry.self = q;
      } else {
        spEntry.subsubparts.push(q);
      }
    }

    return order.map((qNum) => {
      const qEntry = map.get(qNum);
      return {
        key: qEntry.key,
        self: qEntry.self,
        max: qEntry.max,
        subparts: qEntry.subOrder.map((letter) => {
          const sp = qEntry.subMap.get(letter);
          return { key: sp.key, self: sp.self, max: sp.max, subsubparts: sp.subsubparts };
        }),
      };
    });
  }, [questions]);

  const [marks, setMarks] = useState({});
  const [comments, setComments] = useState({});
  const [commentOpen, setCommentOpen] = useState({});
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);
  const [loadedSubmissionId, setLoadedSubmissionId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Once the real submission data arrives, seed the mark-entry state from it.
  // Done here (during render, gated on the id changing) rather than in a
  // useEffect, since `submission` starts null and only resolves after an
  // async fetch — a useState initializer would have already run against null.
  if (submission && submission.id !== loadedSubmissionId) {
    const initial = buildInitialGradeState(submission);
    setLoadedSubmissionId(submission.id);
    setMarks(initial.marks);
    setComments(initial.comments);
    setCommentOpen(initial.commentOpen);
  }

  const totalMax = questions.reduce((sum, q) => sum + q.max_marks, 0);
  const totalAwarded = questions.reduce((sum, q) => {
    const value = Number(marks[q.id]);
    return sum + (Number.isFinite(value) ? value : 0);
  }, 0);
  const gradeInfo = getGrade(totalAwarded, totalMax || 1);

  function isExceeded(q) {
    const value = marks[q.id];
    return value !== undefined && value !== '' && Number(value) > q.max_marks;
  }

  function isEmpty(q) {
    return marks[q.id] === undefined || marks[q.id] === '';
  }

  function handleMarksChange(q, rawValue) {
    if (rawValue !== '' && !/^\d*$/.test(rawValue)) return;
    setMarks((prev) => ({ ...prev, [q.id]: rawValue }));
  }

  function handleCommentChange(q, value) {
    setComments((prev) => ({ ...prev, [q.id]: value }));
  }

  function toggleComment(q) {
    setCommentOpen((prev) => ({ ...prev, [q.id]: !prev[q.id] }));
  }

  async function handleSubmit() {
    if (submitting) return;

    const hasExceeded = questions.some((q) => isExceeded(q));
    const hasEmpty = questions.some((q) => isEmpty(q));
    if (hasExceeded || hasEmpty) {
      setAttemptedSubmit(true);
      toast.error('Please fix the errors before submitting');
      return;
    }

    const gradeRequest = {
      submissionId: Number(submission.id),
      paperId: Number(paperId),
      totalMarks: totalAwarded,
      maxMarks: totalMax,
      grade: gradeInfo.grade,
      gradedAt: new Date().toISOString(),
      questions: questions.map((q) => {
        const isSubSubQuestion = q.subSubQuestionSeq != null;
        const isSubQuestion = !isSubSubQuestion && q.subQuestionSeq != null;
        return {
          questionId: q.id,
          marksAwarded: Number(marks[q.id]),
          subquestionSeq: q.subQuestionSeq != null ? Number(q.subQuestionSeq) : null,
          subsubquestionSeq: q.subSubQuestionSeq != null ? Number(q.subSubQuestionSeq) : null,
          mainQuestionSeq: Number(q.mainQuestionSeq),
          isSubQuestion,
          isSubSubQuestion,
          comment: comments[q.id] || '',
        };
      }),
    };

    const isEditingGradedSubmission = submission.graded;

    setSubmitting(true);
    try {
      const response = isEditingGradedSubmission
        ? await editTutorSubmissionGrade(gradeRequest)
        : await submitTutorGrades(gradeRequest);

      if (response?.isSuccess === false) {
        toast.error(response.message || (isEditingGradedSubmission ? 'Failed to update grades' : 'Failed to submit grades'));
        return;
      }

      toast.success(
        isEditingGradedSubmission
          ? regradeRequest
            ? 'Regrade completed successfully'
            : 'Grades updated successfully'
          : 'Grades submitted successfully'
      );
      router.push(`/teacher/dashboard/classes/${classId}/papers/${paperId}`);
    } catch (error) {
      console.error('Failed to save grades:', error);
      toast.error(isEditingGradedSubmission ? 'Failed to update grades' : 'Failed to submit grades');
    } finally {
      setSubmitting(false);
    }
  }

  if (!foundClass || !paper || !submission) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 text-center">
        <h2 className="text-xl font-semibold text-gray-900">Submission not found</h2>
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

  const actionLabel = regradeRequest ? 'Complete Regrade' : submission.graded ? 'Update Grades' : 'Submit Grades';
  const submittingLabel = regradeRequest
    ? 'Completing regrade...'
    : submission.graded
      ? 'Updating grades...'
      : 'Submitting grades...';

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-gray-50">
      {/* Minimal top bar */}
      <div className="flex h-12 shrink-0 items-center justify-between gap-3 border-b border-border bg-white px-4">
        <Button
          variant="ghost"
          size="sm"
          nativeButton={false}
          className="shrink-0 gap-1 text-gray-500 hover:text-gray-900"
          render={<Link href={`/teacher/dashboard/classes/${classId}/papers/${paperId}`} />}
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Back to Submissions</span>
        </Button>

        <div className="hidden min-w-0 flex-1 items-baseline justify-center gap-2 overflow-hidden text-center sm:flex">
          <span className="truncate font-semibold text-gray-900">{paper.paper_name}</span>
          <span className="text-gray-300">·</span>
          <span className="truncate text-sm text-gray-500">{submission.student_name}</span>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <span
            className={cn(
              'hidden text-sm font-semibold whitespace-nowrap sm:inline',
              GRADE_TEXT_COLOR[gradeInfo.color]
            )}
          >
            Total: {totalAwarded} / {totalMax} ({gradeInfo.grade})
          </span>
          <Button
            size="sm"
            className={cn(
              'text-white',
              regradeRequest ? 'bg-purple-600 hover:bg-purple-700' : 'bg-indigo-600 hover:bg-indigo-700'
            )}
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting && <Loader2 className="h-4 w-4 animate-spin mr-1.5" />}
            {submitting ? submittingLabel : actionLabel}
          </Button>
        </div>
      </div>

      {regradeRequest && (
        <div className="flex shrink-0 items-start gap-2.5 border-b border-purple-100 bg-purple-50 px-4 py-2.5">
          <RotateCcw className="mt-0.5 h-4 w-4 shrink-0 text-purple-600" />
          <div className="min-w-0 space-y-0.5">
            <p className="text-xs font-semibold text-purple-900">
              Regrade Requested
              {regradeRequest.previous_total_marks != null && regradeRequest.previous_max_marks != null && (
                <span className="ml-1.5 font-normal text-purple-700">
                  · Previously graded {regradeRequest.previous_total_marks} / {regradeRequest.previous_max_marks}
                  {regradeRequest.previous_grade ? ` (${regradeRequest.previous_grade})` : ''}
                </span>
              )}
            </p>
            <p className="text-xs text-purple-700">
              <span className="font-semibold">Student's remark: </span>
              {regradeRequest.reason}
            </p>
            <p className="text-[11px] text-purple-500">
              The marks below are pre-filled with the previous marking — adjust and resubmit to complete the regrade.
            </p>
          </div>
        </div>
      )}

      {/* Two panel split */}
      <div className="flex flex-1 flex-col overflow-hidden md:flex-row">
        {/* PDF viewer */}
        <div className="h-[45vh] shrink-0 overflow-hidden border-b border-border bg-gray-100 md:h-[calc(100vh-3rem)] md:flex-1 md:border-b-0">
          {submission.file_url ? (
            <iframe src={submission.file_url} title="Student submission" className="h-full w-full border-0" />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-2 px-6 text-center">
              <FileText className="h-16 w-16 text-gray-300" />
              <p className="text-sm font-medium text-gray-500">Student submission would appear here</p>
              <p className="text-xs text-gray-400">PDF viewer renders the uploaded answer sheet</p>
            </div>
          )}
        </div>

        {/* Marks panel */}
        <div className="flex h-[calc(55vh-3rem)] flex-col bg-white md:h-[calc(100vh-3rem)] md:w-[360px] md:shrink-0 md:border-l md:border-border">
          <div className="shrink-0 border-b border-border px-4 py-3">
            <div className="flex items-center gap-1.5">
              <PenLine className="h-4 w-4 text-indigo-600" />
              <h3 className="text-sm font-semibold text-gray-900">Mark Entry</h3>
            </div>
            <p className="mt-0.5 text-xs text-gray-500">
              {submission.student_name} <span className="text-gray-300">·</span> {submission.student_number}
            </p>
          </div>

          <ScrollArea className="min-h-0 flex-1">
            <div className="space-y-4 p-4">
              {groups.map((group) => {
                if (group.subparts.length === 0 && group.self) {
                  const q = group.self;
                  return (
                    <QuestionRow
                      key={q.id}
                      question={q}
                      value={marks[q.id] ?? ''}
                      comment={comments[q.id] ?? ''}
                      commentOpen={!!commentOpen[q.id]}
                      exceeded={isExceeded(q)}
                      showEmptyError={attemptedSubmit && isEmpty(q)}
                      onMarksChange={handleMarksChange}
                      onCommentChange={handleCommentChange}
                      onToggleComment={toggleComment}
                    />
                  );
                }

                return (
                  <div key={group.key} className="space-y-3">
                    <div className="-mx-1 rounded-md bg-gray-50 px-3 py-1.5">
                      <span className="text-sm font-semibold text-gray-600">{group.key}</span>
                      <span className="ml-1.5 text-xs text-gray-400">/ {group.max}</span>
                    </div>
                    <div className="ml-2 space-y-3 border-l border-border pl-3">
                      {group.subparts.map((sp) => {
                        if (sp.subsubparts.length === 0 && sp.self) {
                          const q = sp.self;
                          return (
                            <QuestionRow
                              key={q.id}
                              question={q}
                              value={marks[q.id] ?? ''}
                              comment={comments[q.id] ?? ''}
                              commentOpen={!!commentOpen[q.id]}
                              exceeded={isExceeded(q)}
                              showEmptyError={attemptedSubmit && isEmpty(q)}
                              onMarksChange={handleMarksChange}
                              onCommentChange={handleCommentChange}
                              onToggleComment={toggleComment}
                            />
                          );
                        }

                        return (
                          <div key={sp.key} className="space-y-2">
                            <div className="-mx-1 rounded-md bg-gray-50/70 px-3 py-1">
                              <span className="text-xs font-semibold text-gray-500">{sp.key}</span>
                              <span className="ml-1.5 text-[11px] text-gray-400">/ {sp.max}</span>
                            </div>
                            <div className="ml-2 space-y-3 border-l border-border pl-3">
                              {sp.subsubparts.map((q) => (
                                <QuestionRow
                                  key={q.id}
                                  question={q}
                                  value={marks[q.id] ?? ''}
                                  comment={comments[q.id] ?? ''}
                                  commentOpen={!!commentOpen[q.id]}
                                  exceeded={isExceeded(q)}
                                  showEmptyError={attemptedSubmit && isEmpty(q)}
                                  onMarksChange={handleMarksChange}
                                  onCommentChange={handleCommentChange}
                                  onToggleComment={toggleComment}
                                />
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
              
            </div>
          </ScrollArea>

          <div className="shrink-0 space-y-2 border-t border-border p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">
                Total: <span className="font-semibold text-gray-900">{totalAwarded} / {totalMax}</span>
              </span>
              <span className={cn('rounded-full px-2 py-0.5 text-xs font-bold', GRADE_BADGE_COLOR[gradeInfo.color])}>
                {gradeInfo.grade}
              </span>
            </div>
            <Button
              className={cn(
                'w-full text-white',
                regradeRequest ? 'bg-purple-600 hover:bg-purple-700' : 'bg-indigo-600 hover:bg-indigo-700'
              )}
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting && <Loader2 className="h-4 w-4 animate-spin mr-1.5" />}
              {submitting ? submittingLabel : actionLabel}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
