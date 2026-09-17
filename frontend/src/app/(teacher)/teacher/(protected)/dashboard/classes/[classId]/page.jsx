'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  PlusCircle,
  Upload,
  EyeOff,
  Pencil,
  Trash2,
  FileText,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import {
  getClasses,
  toggleClassPaperPublish,
  deleteUploadPaper,
  updatePaper,
} from "@/lib/api-client";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import DeleteConfirmDialog from "@/components/admin/DeleteConfirmDialog";
import UploadPaperDialog from "@/components/teacher/UploadPaperDialog";
import EditPaperDialog from "@/components/teacher/EditPaperDialog";
import { MOCK_TEACHER_CLASSES } from "@/lib/mock-data";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function formatRelativeDate(dateStr) {
  const now = new Date();
  const date = new Date(dateStr);
  const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "1 day ago";
  if (diffDays < 30) return `${diffDays} days ago`;
  const months = Math.floor(diffDays / 30);
  if (diffDays < 365) return `${months} month${months > 1 ? "s" : ""} ago`;
  const years = Math.floor(diffDays / 365);
  return `${years} year${years > 1 ? "s" : ""} ago`;
}

function formatFullDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

let nextPaperId = 9000;

export default function ClassDetailPage() {

  const router = useRouter();
  
  const [classes, setClasses] = useState([]);

  const { classId } = useParams();
  console.log(classId);
  // const foundClass = classes.find((c) => c.id === classId);
  const foundClass = classes.find((c) => c.id === Number(classId));

  const [papers, setPapers] = useState([]);

  useEffect(() => {
    if (foundClass?.papers) {
      setPapers(
        [...foundClass.papers].sort(
          (a, b) => new Date(b.uploaded_at) - new Date(a.uploaded_at),
        ),
      );
    }
  }, [foundClass]);

  const [uploadOpen, setUploadOpen] = useState(false);
  const [editPaper, setEditPaper] = useState(null);
  const [deletePaper, setDeletePaper] = useState(null);

  useEffect(() => {
    loadClasses();
  }, []);

  if (!foundClass) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
        <FileText className="h-12 w-12 text-gray-300" />
        <p className="text-base font-medium text-gray-500">Class not found.</p>
        <Button
          variant="outline"
          nativeButton={false}
          render={<Link href="/teacher/dashboard" />}
        >
          ← Back to Classes
        </Button>
      </div>
    );
  }

  function handleUpload(result) {
    if (result?.isSuccess) {
      toast.success('Paper uploaded successfully');
      setUploadOpen(false);
      loadClasses();
    } else {
      toast.error(result?.message ?? 'Failed to upload paper.');
    }
  }

  async function loadClasses() {
    try {
      const data = await getClasses();
      setClasses(data);
    } catch (error) {
      toast.error("Failed to load classes");
    }
  }

  async function handleEditSave(data) {
    const newFile = data.pdf_file?.[0];

    const formData = new FormData();
    formData.append("paper_name", data.paper_name);
    formData.append("month", data.month);
    formData.append("year", data.year);
    formData.append("status", data.status);
    formData.append("questions", JSON.stringify(data.questions ?? []));
    if (newFile) {
      formData.append("pdf_file", newFile);
    }

    try {
      const response = await updatePaper(editPaper.id, formData);
      if (response?.isSuccess === false) {
        toast.error(response?.message ?? "Failed to update paper");
        return;
      }
      toast.success("Paper updated");
      setEditPaper(null);
      loadClasses();
    } catch (error) {
      toast.error("Failed to update paper");
    }
  }

  async function handleDelete() {
    try {
      const response = await deleteUploadPaper(deletePaper.id);
      if (response?.isSuccess === false) {
        toast.error(response?.message ?? "Failed to delete paper");
        return;
      }
      setPapers((prev) => prev.filter((p) => p.id !== deletePaper.id));
      toast.success("Paper deleted");
      loadClasses();
    } catch (error) {
      toast.error("Failed to delete paper");
    } finally {
      setDeletePaper(null);
    }
  }

  async function handleTogglePublish(paper) {
    const next = paper.status === "DRAFT" ? "PUBLISHED" : "DRAFT";
    try {
      const response = await toggleClassPaperPublish(paper.id);
      if (response?.isSuccess === false) {
        toast.error(response?.message ?? "Failed to update paper status");
        return;
      }
      setPapers((prev) =>
        prev.map((p) => (p.id === paper.id ? { ...p, status: next } : p)),
      );
      toast.success(
        next === "PUBLISHED" ? "Paper published" : "Paper unpublished",
      );
    } catch (error) {
      toast.error("Failed to update paper status");
    }
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
            <h1 className="text-xl font-bold text-gray-900 leading-tight">
              {foundClass.display_name}
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {foundClass.subject_name}
            </p>
          </div>
        </div>
        <Button
          onClick={() => setUploadOpen(true)}
          className="gap-2 text-white shrink-0"
          style={{
            background: "linear-gradient(135deg, #3940A0 0%, #5a62ff 100%)",
          }}
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
            <p className="text-sm font-medium text-gray-500">
              No papers uploaded yet.
            </p>
            <p className="text-xs text-gray-400">
              Click Upload Paper to add the first paper for this class.
            </p>
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
                  <TableCell className="text-gray-700">
                    {paper.month_label}
                  </TableCell>
                  <TableCell>
                    <span className="text-gray-900">
                      {paper.number_of_questions}
                    </span>
                    <span className="text-gray-400 text-xs ml-1">
                      questions
                    </span>
                  </TableCell>
                  <TableCell>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger
                          render={
                            <span className="cursor-default text-sm text-gray-700" />
                          }
                        >
                          {formatRelativeDate(paper.uploaded_at)}
                        </TooltipTrigger>
                        <TooltipContent>
                          {formatFullDate(paper.uploaded_at)}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableCell>
                  <TableCell>
                    {paper.status === "PUBLISHED" ? (
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
                        {/* View Submissions */}
                        <Tooltip>
                          <TooltipTrigger
                            render={
                              <button
                                type="button"
                                onClick={() => {
                                  router.push(
                                    `/teacher/dashboard/classes/${classId}/papers/${paper.id}`,
                                  );
                                }}
                                className="p-1.5 rounded-md hover:bg-gray-100 transition-colors"
                              />
                            }
                          >
                            <Users className="h-3.5 w-3.5 text-indigo-600" />
                          </TooltipTrigger>
                          <TooltipContent>View Submissions</TooltipContent>
                        </Tooltip>

                        {/* View PDF */}
                        <Tooltip>
                          <TooltipTrigger
                            render={
                              <button
                                type="button"
                                onClick={() => {
                                  if (paper.pdf_url) {
                                    window.open(paper.pdf_url, "_blank");
                                  } else {
                                    toast.info(
                                      "No PDF uploaded for this paper.",
                                    );
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
                            {paper.status === "DRAFT" ? (
                              <Upload className="h-3.5 w-3.5 text-green-600" />
                            ) : (
                              <EyeOff className="h-3.5 w-3.5 text-gray-400" />
                            )}
                          </TooltipTrigger>
                          <TooltipContent>
                            {paper.status === "DRAFT" ? "Publish" : "Unpublish"}
                          </TooltipContent>
                        </Tooltip>

                        {/* Edit */}
                        <Tooltip>
                          <TooltipTrigger
                            render={
                              <button
                                type="button"
                                disabled={(paper.submissions?.length ?? 0) > 0}
                                onClick={() => {
                                  if ((paper.submissions?.length ?? 0) > 0) return;
                                  setEditPaper(paper);
                                }}
                                className="p-1.5 rounded-md hover:bg-gray-100 transition-colors disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
                              />
                            }
                          >
                            <Pencil className="h-3.5 w-3.5 text-gray-500" />
                          </TooltipTrigger>
                          <TooltipContent>
                            {(paper.submissions?.length ?? 0) > 0
                              ? "Can't edit — this paper already has submissions"
                              : "Edit"}
                          </TooltipContent>
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
        classId={classId}
      />
      <EditPaperDialog
        open={!!editPaper}
        onOpenChange={(v) => {
          if (!v) setEditPaper(null);
        }}
        paper={editPaper}
        onSave={handleEditSave}
      />
      <DeleteConfirmDialog
        open={!!deletePaper}
        onOpenChange={(v) => {
          if (!v) setDeletePaper(null);
        }}
        name={deletePaper?.paper_name}
        onConfirm={handleDelete}
      />
    </div>
  );
}