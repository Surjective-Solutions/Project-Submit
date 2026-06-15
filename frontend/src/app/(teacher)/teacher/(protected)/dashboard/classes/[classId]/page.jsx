'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, PlusCircle, Upload, EyeOff, Pencil, Trash2, FileText } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import DeleteConfirmDialog from '@/components/admin/DeleteConfirmDialog';
import UploadPaperDialog from '@/components/teacher/UploadPaperDialog';
import EditPaperDialog from '@/components/teacher/EditPaperDialog';
import { MOCK_TEACHER_CLASSES } from '@/lib/mock-data';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function formatRelativeDate(dateStr) {
  const now = new Date('2026-06-15T00:00:00.000Z');
  const date = new Date(dateStr);
  const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return '1 day ago';
  if (diffDays < 30) return `${diffDays} days ago`;
  const months = Math.floor(diffDays / 30);
  if (diffDays < 365) return `${months} month${months > 1 ? 's' : ''} ago`;
  const years = Math.floor(diffDays / 365);
  return `${years} year${years > 1 ? 's' : ''} ago`;
}

function formatFullDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

let nextPaperId = 9000;

export default function ClassDetailPage() {
  const { classId } = useParams();
  const foundClass = MOCK_TEACHER_CLASSES.find((c) => c.id === classId);

  const [papers, setPapers] = useState(
    foundClass
      ? [...foundClass.papers].sort((a, b) => new Date(b.uploaded_at) - new Date(a.uploaded_at))
      : []
  );
  const [uploadOpen, setUploadOpen] = useState(false);
  const [editPaper, setEditPaper] = useState(null);
  const [deletePaper, setDeletePaper] = useState(null);

  if (!foundClass) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
        <FileText className="h-12 w-12 text-gray-300" />
        <p className="text-base font-medium text-gray-500">Class not found.</p>
        <Button variant="outline" nativeButton={false} render={<Link href="/teacher/dashboard" />}>
          ← Back to Classes
        </Button>
      </div>
    );
  }

  function handleUpload(data) {
    const file = data.pdf_file?.[0];
    const month = Number(data.month);
    const year = Number(data.year);
    const newPaper = {
      id: `paper-new-${nextPaperId++}`,
      paper_name: data.paper_name,
      month,
      year,
      month_label: `${MONTHS[month - 1]} ${year}`,
      number_of_questions: Number(data.number_of_questions),
      pdf_url: file ? `mock://${file.name}` : null,
      uploaded_at: new Date().toISOString(),
      status: data.status,
    };
    setPapers((prev) => [newPaper, ...prev]);
    toast.success('Paper uploaded successfully');
    setUploadOpen(false);
  }

  function handleEditSave(data) {
    const newFile = data.pdf_file?.[0];
    const month = Number(data.month);
    const year = Number(data.year);
    setPapers((prev) =>
      prev.map((p) =>
        p.id === editPaper.id
          ? {
              ...p,
              paper_name: data.paper_name,
              month,
              year,
              month_label: `${MONTHS[month - 1]} ${year}`,
              number_of_questions: Number(data.number_of_questions),
              status: data.status,
              ...(newFile ? { pdf_url: `mock://${newFile.name}` } : {}),
            }
          : p
      )
    );
    toast.success('Paper updated');
    setEditPaper(null);
  }

  function handleDelete() {
    setPapers((prev) => prev.filter((p) => p.id !== deletePaper.id));
    toast.success('Paper deleted');
    setDeletePaper(null);
  }

  function handleTogglePublish(paper) {
    const next = paper.status === 'DRAFT' ? 'PUBLISHED' : 'DRAFT';
    setPapers((prev) => prev.map((p) => (p.id === paper.id ? { ...p, status: next } : p)));
    toast.success(next === 'PUBLISHED' ? 'Paper published' : 'Paper unpublished');
  }

  return (
    <div className="space-y-6">
      {/* Top bar */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-start gap-3">
          <Button
            variant="ghost"
            size="sm"
            nativeButton={false}
            className="gap-1.5 text-gray-500 hover:text-gray-900 mt-0.5 shrink-0"
            render={<Link href="/teacher/dashboard" />}
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-xl font-bold text-gray-900 leading-tight">{foundClass.display_name}</h1>
            <p className="text-sm text-gray-500 mt-0.5">{foundClass.subject_name}</p>
          </div>
        </div>
        <Button
          onClick={() => setUploadOpen(true)}
          className="gap-2 text-white shrink-0"
          style={{ background: 'linear-gradient(135deg, #3940A0 0%, #5a62ff 100%)' }}
        >
          <PlusCircle className="h-4 w-4" />
          Upload Paper
        </Button>
      </div>

      {/* Papers table card */}
      <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center gap-2">
          <h2 className="text-sm font-semibold text-gray-900">Papers</h2>
          <span className="text-gray-300">•</span>
          <span className="text-sm text-gray-500">{papers.length}</span>
        </div>

        {papers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
            <FileText className="h-10 w-10 text-gray-300" />
            <p className="text-sm font-medium text-gray-500">No papers uploaded yet.</p>
            <p className="text-xs text-gray-400">Click Upload Paper to add the first paper for this class.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Paper Name</TableHead>
                <TableHead>Month</TableHead>
                <TableHead>Questions</TableHead>
                <TableHead>Uploaded</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right pr-4">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {papers.map((paper) => (
                <TableRow key={paper.id}>
                  <TableCell className="font-semibold text-gray-900 max-w-[200px] truncate">
                    {paper.paper_name}
                  </TableCell>
                  <TableCell className="text-gray-700">{paper.month_label}</TableCell>
                  <TableCell>
                    <span className="text-gray-900">{paper.number_of_questions}</span>
                    <span className="text-gray-400 text-xs ml-1">questions</span>
                  </TableCell>
                  <TableCell>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger
                          render={<span className="cursor-default text-sm text-gray-700" />}
                        >
                          {formatRelativeDate(paper.uploaded_at)}
                        </TooltipTrigger>
                        <TooltipContent>{formatFullDate(paper.uploaded_at)}</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableCell>
                  <TableCell>
                    {paper.status === 'PUBLISHED' ? (
                      <span className="inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                        Published
                      </span>
                    ) : (
                      <span className="inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                        Draft
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right pr-4">
                    <TooltipProvider>
                      <div className="flex items-center justify-end gap-0.5">
                        {/* View PDF */}
                        <Tooltip>
                          <TooltipTrigger
                            render={
                              <button
                                type="button"
                                onClick={() => {
                                  const url = paper.pdf_url;
                                  if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
                                    window.open(url, '_blank');
                                  } else {
                                    toast.info('No PDF uploaded for this paper.');
                                  }
                                }}
                                className="p-1.5 rounded-md hover:bg-gray-100 transition-colors"
                              />
                            }
                          >
                            <FileText className="h-3.5 w-3.5 text-indigo-500" />
                          </TooltipTrigger>
                          <TooltipContent>View Paper</TooltipContent>
                        </Tooltip>

                        {/* Publish / Unpublish */}
                        <Tooltip>
                          <TooltipTrigger
                            render={
                              <button
                                type="button"
                                onClick={() => handleTogglePublish(paper)}
                                className="p-1.5 rounded-md hover:bg-gray-100 transition-colors"
                              />
                            }
                          >
                            {paper.status === 'DRAFT' ? (
                              <Upload className="h-3.5 w-3.5 text-green-600" />
                            ) : (
                              <EyeOff className="h-3.5 w-3.5 text-gray-400" />
                            )}
                          </TooltipTrigger>
                          <TooltipContent>
                            {paper.status === 'DRAFT' ? 'Publish' : 'Unpublish'}
                          </TooltipContent>
                        </Tooltip>

                        {/* Edit */}
                        <Tooltip>
                          <TooltipTrigger
                            render={
                              <button
                                type="button"
                                onClick={() => setEditPaper(paper)}
                                className="p-1.5 rounded-md hover:bg-gray-100 transition-colors"
                              />
                            }
                          >
                            <Pencil className="h-3.5 w-3.5 text-gray-500" />
                          </TooltipTrigger>
                          <TooltipContent>Edit</TooltipContent>
                        </Tooltip>

                        {/* Delete */}
                        <Tooltip>
                          <TooltipTrigger
                            render={
                              <button
                                type="button"
                                onClick={() => setDeletePaper(paper)}
                                className="p-1.5 rounded-md hover:bg-red-50 transition-colors"
                              />
                            }
                          >
                            <Trash2 className="h-3.5 w-3.5 text-red-500" />
                          </TooltipTrigger>
                          <TooltipContent>Delete</TooltipContent>
                        </Tooltip>
                      </div>
                    </TooltipProvider>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Dialogs */}
      <UploadPaperDialog
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        onSuccess={handleUpload}
      />
      <EditPaperDialog
        open={!!editPaper}
        onOpenChange={(v) => { if (!v) setEditPaper(null); }}
        paper={editPaper}
        onSave={handleEditSave}
      />
      <DeleteConfirmDialog
        open={!!deletePaper}
        onOpenChange={(v) => { if (!v) setDeletePaper(null); }}
        name={deletePaper?.paper_name}
        onConfirm={handleDelete}
      />
    </div>
  );
}
