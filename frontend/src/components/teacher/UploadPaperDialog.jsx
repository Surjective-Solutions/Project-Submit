'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, PlusCircle, FileText } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { paperUploadSchema } from '@/lib/validations/teacher';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

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

export default function UploadPaperDialog({ open, onOpenChange, onSuccess }) {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(paperUploadSchema),
    defaultValues: {
      paper_name: '',
      month: '',
      year: 2026,
      number_of_questions: '',
      status: 'DRAFT',
    },
  });

  function handleClose() {
    onOpenChange(false);
    reset();
    setSelectedFileName(null);
  }

  async function onSubmit(data) {
    setIsLoading(true);
    try {
      onSuccess(data);
      reset();
      setSelectedFileName(null);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
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
            <PlusCircle className="h-5 w-5 text-white" />
          </div>
          <div>
            <DialogTitle className="text-white text-base font-semibold leading-tight m-0">Upload Paper</DialogTitle>
            <DialogDescription className="text-white/60 text-xs mt-0.5 m-0">Add a new paper for this class.</DialogDescription>
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

              <Field label="Number of Questions" required id="number_of_questions" error={errors.number_of_questions?.message}>
                <Input
                  id="number_of_questions"
                  type="number"
                  min="1"
                  max="100"
                  placeholder="e.g. 10"
                  {...register('number_of_questions')}
                />
              </Field>

              <Field label="Upload PDF" required id="pdf_file_input" error={errors.pdf_file?.message}>
                <div className="flex items-center gap-3 rounded-lg border border-input px-3 py-2">
                  <FileText className="h-4 w-4 text-gray-400 shrink-0" />
                  <span className="text-sm text-gray-500 flex-1 truncate min-w-0">
                    {selectedFileName ?? 'No file selected'}
                  </span>
                  <label
                    htmlFor="pdf_file_input"
                    className="cursor-pointer text-xs font-medium text-indigo-600 hover:text-indigo-700 shrink-0"
                  >
                    Choose file
                  </label>
                </div>
                <input
                  id="pdf_file_input"
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  {...register('pdf_file', {
                    onChange: (e) => setSelectedFileName(e.target.files?.[0]?.name ?? null),
                  })}
                />
              </Field>

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
            <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button
              type="submit"
              className="min-w-[120px] text-white"
              style={{ background: 'linear-gradient(135deg, #3940A0 0%, #5a62ff 100%)' }}
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Upload
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
