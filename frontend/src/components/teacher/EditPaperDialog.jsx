'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Pencil, FileText } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import QuestionStructureBuilder from '@/components/teacher/QuestionStructureBuilder';
import { useQuestionBuilder } from '@/hooks/use-question-builder';
import { paperEditSchema } from '@/lib/validations/teacher';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function toDateInputValue(dueDate) {
  if (!dueDate) return '';
  return String(dueDate).slice(0, 10);
}

const SELECT_CLASS = 'h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm transition-colors outline-none focus:border-ring focus:ring-3 focus:ring-ring/50 disabled:opacity-50';

function Field({ label, required, error, id, children }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className={error ? 'text-destructive' : 'text-gray-700'}>
        {label}{required && <span className="text-destructive ml-0.5">*</span>}
      </Label>
      {children}
      {error && <p className="text-xs text-destructive" role="alert">{error}</p>}
    </div>
  );
}

function SectionDivider({ label }) {
  return (
    <div className="flex items-center gap-3 pt-2 pb-1">
      <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest whitespace-nowrap">{label}</span>
      <div className="flex-1 h-px bg-gray-200" />
    </div>
  );
}

export default function EditPaperDialog({ open, onOpenChange, paper, onSave }) {
  const [isLoading, setIsLoading] = useState(false);
  const [showReplacePdf, setShowReplacePdf] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState(null);
  const qb = useQuestionBuilder(paper?.questions);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(paperEditSchema),
  });

  useEffect(() => {
    if (paper && open) {
      reset({
        paper_name: paper.paper_name,
        month:      String(paper.month),
        year:       paper.year,
        status:     paper.status,
        due_date:   toDateInputValue(paper.due_date),
        duration_minutes: paper.duration_minutes ?? 120,
      });
      qb.reset(paper.questions);
      setShowReplacePdf(false);
      setSelectedFileName(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paper, open, reset]);

  async function onSubmit(data) {
    const { error, count } = qb.submit();
    if (error) return;

    setIsLoading(true);
    try {
      // The backend's paper endpoints (create + edit) expect the builder's raw
      // {key, marks, subparts} shape, not the display-format payload qb.submit()
      // returns — matches what UploadPaperDialog already sends on create.
      onSave({
        ...data,
        number_of_questions: count,
        questions: qb.questions,
      });
    } finally {
      setIsLoading(false);
    }
  }

  const existingPdfName = paper?.pdf_url
    ? paper.pdf_url.startsWith('mock://')
      ? paper.pdf_url.replace('mock://', '')
      : 'uploaded-paper.pdf'
    : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-lg p-0 gap-0 overflow-hidden max-h-[90vh]"
        style={{ display: 'flex', flexDirection: 'column' }}
      >
        {/* Fixed header */}
        <div
          className="px-6 py-5 flex items-center gap-3 shrink-0"
          style={{ background: 'linear-gradient(135deg, #3940A0 0%, #5a62ff 100%)' }}
        >
          <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
            <Pencil className="h-5 w-5 text-white" />
          </div>
          <div>
            <DialogTitle className="text-white text-base font-semibold leading-tight m-0">Edit Paper</DialogTitle>
            <DialogDescription className="text-white/60 text-xs mt-0.5 m-0">{paper?.paper_name}</DialogDescription>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 min-h-0 overflow-y-auto">
            <div className="px-6 py-5 space-y-4">

              <Field label="Paper Name" required id="paper_name" error={errors.paper_name?.message}>
                <Input
                  id="paper_name"
                  placeholder="e.g. June 2026 — Paper 01"
                  {...register('paper_name')}
                />
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Month" required id="month" error={errors.month?.message}>
                  <select id="month" className={SELECT_CLASS} {...register('month')}>
                    <option value="">Month</option>
                    {MONTHS.map((m, i) => (
                      <option key={i} value={i + 1}>{m}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Year" required id="year" error={errors.year?.message}>
                  <Input
                    id="year"
                    type="number"
                    min="2020"
                    max="2030"
                    placeholder="2026"
                    {...register('year')}
                  />
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Due Date" required id="due_date" error={errors.due_date?.message}>
                  <Input
                    id="due_date"
                    type="date"
                    {...register('due_date')}
                  />
                </Field>
                <Field label="Duration (minutes)" required id="duration_minutes" error={errors.duration_minutes?.message}>
                  <Input
                    id="duration_minutes"
                    type="number"
                    min="1"
                    placeholder="e.g. 120"
                    {...register('duration_minutes', { valueAsNumber: true })}
                  />
                </Field>
              </div>

              {/* PDF section */}
              <div className="space-y-1.5">
                <Label className="text-gray-700">PDF File</Label>
                {existingPdfName && !showReplacePdf ? (
                  <div className="flex items-center gap-3 rounded-lg border border-input px-3 py-2">
                    <FileText className="h-4 w-4 text-indigo-400 shrink-0" />
                    <span className="text-sm text-gray-700 flex-1 truncate min-w-0">{existingPdfName}</span>
                    <button
                      type="button"
                      onClick={() => {
                        const url = paper?.pdf_url;
                        if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
                          window.open(url, '_blank');
                        }
                      }}
                      className="text-xs font-medium text-indigo-600 hover:text-indigo-700 shrink-0"
                    >
                      View
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowReplacePdf(true)}
                      className="text-xs font-medium text-gray-500 hover:text-gray-700 shrink-0"
                    >
                      Replace PDF
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-3 rounded-lg border border-input px-3 py-2">
                      <FileText className="h-4 w-4 text-gray-400 shrink-0" />
                      <span className="text-sm text-gray-500 flex-1 truncate min-w-0">
                        {selectedFileName ?? 'No file selected'}
                      </span>
                      <label
                        htmlFor="edit_pdf_file_input"
                        className="cursor-pointer text-xs font-medium text-indigo-600 hover:text-indigo-700 shrink-0"
                      >
                        Choose file
                      </label>
                    </div>
                    <input
                      id="edit_pdf_file_input"
                      type="file"
                      accept=".pdf"
                      className="hidden"
                      {...register('pdf_file', {
                        onChange: (e) => setSelectedFileName(e.target.files?.[0]?.name ?? null),
                      })}
                    />
                  </>
                )}
              </div>

              <SectionDivider label="Question Structure" />
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-500">Add each question and, if it has parts, split it into (a) / (b).</p>
                <span className="shrink-0 text-xs font-semibold text-gray-700">Total: {qb.totalMarks} marks</span>
              </div>
              {qb.error && (
                <p className="text-xs text-destructive" role="alert">{qb.error}</p>
              )}
              <QuestionStructureBuilder
                questions={qb.questions}
                showErrors={qb.showErrors}
                onAddQuestion={qb.addQuestion}
                onRemoveQuestion={qb.removeQuestion}
                onQuestionMarksChange={qb.changeQuestionMarks}
                onAddSubpart={qb.addSubpart}
                onRemoveSubpart={qb.removeSubpart}
                onSubpartMarksChange={qb.changeSubpartMarks}
              />

              <SectionDivider label="Status" />
              <div className="grid grid-cols-2 gap-3">
                <label className="flex items-center gap-2.5 cursor-pointer rounded-lg border border-input px-3 py-2.5 has-[:checked]:border-indigo-400 has-[:checked]:bg-indigo-50 transition-colors">
                  <input type="radio" value="DRAFT" className="accent-indigo-600" {...register('status')} />
                  <div>
                    <p className="text-sm font-medium text-gray-900 leading-none">Save as Draft</p>
                    <p className="text-xs text-gray-500 mt-0.5">Not visible to students</p>
                  </div>
                </label>
                <label className="flex items-center gap-2.5 cursor-pointer rounded-lg border border-input px-3 py-2.5 has-[:checked]:border-green-400 has-[:checked]:bg-green-50 transition-colors">
                  <input type="radio" value="PUBLISHED" className="accent-green-600" {...register('status')} />
                  <div>
                    <p className="text-sm font-medium text-gray-900 leading-none">Publish</p>
                    <p className="text-xs text-gray-500 mt-0.5">Visible to students</p>
                  </div>
                </label>
              </div>
              {errors.status && (
                <p className="text-xs text-destructive" role="alert">{errors.status.message}</p>
              )}

              <div className="h-1" />
            </div>
          </div>

          {/* Fixed footer */}
          <div className="shrink-0 flex items-center justify-end gap-3 px-6 py-4 border-t bg-gray-50/60 rounded-b-xl">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button
              type="submit"
              className="min-w-[120px] text-white"
              style={{ background: 'linear-gradient(135deg, #3940A0 0%, #5a62ff 100%)' }}
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Save Changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
