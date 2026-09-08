'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Clock,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import DeleteConfirmDialog from '@/components/admin/DeleteConfirmDialog';
import { useEnrolledClasses } from '@/context/EnrolledClassesContext';
import { useCountdownTimer } from '@/hooks/use-countdown-timer';
import { EXAM_DURATION_SECONDS, EXAM_MOCK_PAGE_COUNT, findPaperInClass } from '@/lib/exam-utils';

import { Document, Page, pdfjs } from "react-pdf";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export default function ExamViewingPage() {
  const { classId, paperId } = useParams();
  const router = useRouter();
  const { classes } = useEnrolledClasses();
  const [currentPage, setCurrentPage] = useState(1);
  const [endExamOpen, setEndExamOpen] = useState(false);
  const [totalPages, setTotalPages] = useState(0);

  const cls = classes.find((c) => c.id === Number(classId));
  const paper = findPaperInClass(cls, paperId);

  const timer = useCountdownTimer(EXAM_DURATION_SECONDS, {
    onExpire: () => {
      toast.warning("Time's up! Submitting you to the answer upload page.");
      router.push(
        `/student/dashboard/classes/${classId}/exam/${paperId}/upload`,
      );
    },
  });

  if (!cls || !paper) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <p className="text-gray-500 text-sm">Exam paper not found.</p>
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

  function handleEndExamConfirmed() {
    timer.pause();
    setEndExamOpen(false);
    router.push(`/student/dashboard/classes/${classId}/exam/${paperId}/upload`);
  }

  const lowTime = timer.secondsLeft <= 5 * 60;

  return (
    <div className="space-y-4">
      {/* Sticky top bar */}
      <div className="sticky top-0 z-10 -mx-6 -mt-6 px-6 pt-4 pb-3 bg-[#F8FAFC]/95 backdrop-blur-sm border-b border-border">
        <div className="bg-white rounded-xl border border-border px-5 py-3 flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="min-w-0 flex-1">
            <h1 className="text-sm font-bold text-gray-900 leading-tight truncate">
              {paper.paper_name}
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">{cls.class_name}</p>
          </div>

          {/* Page navigation */}
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="icon-sm"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-semibold text-gray-700 tabular-nums min-w-[4.5rem] text-center">
              {currentPage} / {totalPages}
            </span>
            <button
              className="h-10 w-10 shrink-0 rounded-full border border-border bg-white flex items-center justify-center text-gray-400 hover:text-indigo-600 hover:border-indigo-300 disabled:opacity-30 disabled:pointer-events-none transition-colors"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          {/* Timer + End Exam */}
          <div className="flex items-center gap-3 shrink-0">
            <span
              className={`inline-flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-lg tabular-nums ${
                lowTime
                  ? "bg-red-50 text-red-600 border border-red-200"
                  : "bg-indigo-50 text-indigo-700 border border-indigo-200"
              }`}
            >
              <Clock className="h-3.5 w-3.5" />
              {timer.formatted}
            </span>
            <Button
              size="sm"
              variant="destructive"
              className="gap-1.5"
              onClick={() => setEndExamOpen(true)}
            >
              <LogOut className="h-3.5 w-3.5" />
              End Exam
            </Button>
          </div>
        </div>
      </div>

      {/* Paper viewer */}
      <div className="flex items-center justify-center gap-3">
        <button
          className="h-10 w-10 shrink-0 rounded-full border border-border bg-white flex items-center justify-center text-gray-400 hover:text-indigo-600 hover:border-indigo-300 disabled:opacity-30 disabled:pointer-events-none transition-colors"
          disabled={currentPage <= 1}
          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        {/* <div
          className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden"
          style={{ aspectRatio: "3/4", maxHeight: "75vh" }}
        >
          <img
            key={currentPage}
            src={`https://placehold.co/700x933?text=${encodeURIComponent(paper.paper_name)}+%E2%80%94+Page+${currentPage}`}
            alt={`${paper.paper_name} — page ${currentPage}`}
            className="h-full w-full object-contain"
          />

          <iframe
            key={currentPage}
            src={`http://localhost:8080${paper.exam_pdf_url}#page=${currentPage}`}
            className="h-full w-full"
            title={`${paper.paper_name} page ${currentPage}`}
          />
        </div> */}

        {/* <div
          className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden"
          style={{
            height: "80vh",
            width: "60vw",
          }}
        >
          <iframe
            key={currentPage}
            src={`http://localhost:8080${encodeURI(paper.exam_pdf_url)}#page=${currentPage}`}
            className="h-full w-full"
            title={paper.paper_name}
          />
        </div> */}

        <div
          className="bg-white rounded-2xl border border-border shadow-sm overflow-auto flex items-center justify-center"
          style={{
            width: "75%",
            height: "60%",
          }}
        >
          <Document
            file={
              paper.exam_pdf_url?.startsWith('http')
                ? paper.exam_pdf_url
                : `http://localhost:8080${paper.exam_pdf_url}`
            }
            onLoadSuccess={({ numPages }) => {
              setTotalPages(numPages);
              setCurrentPage(1);
            }}
            loading="Loading paper..."
          >
            <Page
              pageNumber={currentPage}
              width={750}
              renderTextLayer={false}
              renderAnnotationLayer={false}
            />
          </Document>
        </div>

        <button
          className="h-10 w-10 shrink-0 rounded-full border border-border bg-white flex items-center justify-center text-gray-400 hover:text-indigo-600 hover:border-indigo-300 disabled:opacity-30 disabled:pointer-events-none transition-colors"
          disabled={currentPage >= totalPages}
          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      <DeleteConfirmDialog
        open={endExamOpen}
        onOpenChange={setEndExamOpen}
        title="End Exam"
        description="Are you sure you want to end the exam? Your timer will stop and you'll be taken to upload your answer sheet."
        confirmLabel="Yes, End Exam"
        onConfirm={handleEndExamConfirmed}
      />
    </div>
  );
}
