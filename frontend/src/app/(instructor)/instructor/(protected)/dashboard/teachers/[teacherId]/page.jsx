'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ChevronLeft, FileText } from 'lucide-react';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { MOCK_INSTRUCTOR_TEACHERS } from '@/lib/mock-data';

function initials(name) {
  const parts = (name ?? '').trim().split(/\s+/);
  if (parts.length >= 2) return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  return (parts[0]?.slice(0, 2) || '?').toUpperCase();
}

function subjectBadgeClass(subject) {
  const colors = {
    Mathematics: 'bg-blue-50 text-blue-700 border-blue-100',
    Physics: 'bg-orange-50 text-orange-700 border-orange-100',
    Chemistry: 'bg-purple-50 text-purple-700 border-purple-100',
  };
  return colors[subject] ?? 'bg-gray-100 text-gray-600 border-gray-200';
}

export default function InstructorTeacherPapersPage() {
  const { teacherId } = useParams();
  const teacher = MOCK_INSTRUCTOR_TEACHERS.find((item) => item.id === teacherId);

  if (!teacher) {
    return (
      <div className="mx-auto flex min-h-[50vh] max-w-xl flex-col items-center justify-center gap-4 text-center">
        <h2 className="text-xl font-semibold text-gray-900">Teacher not found</h2>
        <Button
          variant="outline"
          nativeButton={false}
          className="border-indigo-200 text-indigo-700 hover:bg-indigo-50"
          render={<Link href="/instructor/dashboard" />}
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </Button>
      </div>
    );
  }

  const papers = teacher.papers ?? [];

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 rounded-2xl border border-border bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <Button
            variant="ghost"
            nativeButton={false}
            className="h-8 px-2 text-gray-500 hover:text-gray-900"
            render={<Link href="/instructor/dashboard" />}
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </Button>
          <Avatar className="h-12 w-12">
            <AvatarFallback className="bg-gradient-to-br from-indigo-600 to-cyan-500 font-bold text-white">
              {initials(teacher.teacher_name)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <h2 className="truncate text-lg font-semibold text-gray-900">{teacher.teacher_name}</h2>
            <Badge variant="outline" className={subjectBadgeClass(teacher.subject_area)}>
              {teacher.subject_area}
            </Badge>
          </div>
        </div>
      </div>

      <section className="rounded-2xl border border-border bg-white shadow-sm">
        <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
          <h3 className="text-base font-semibold text-gray-900">
            Papers <span className="font-normal text-gray-400">•&nbsp;{papers.length}</span>
          </h3>
        </div>

        {papers.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <FileText className="h-12 w-12 text-gray-300" />
            <p className="text-sm text-gray-400">No papers uploaded by this teacher yet.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Paper Name</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Month</TableHead>
                <TableHead>Questions</TableHead>
                <TableHead>Pending</TableHead>
                <TableHead>Graded</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {papers.map((paper) => {
                const pendingCount = paper.submissions.filter((submission) => !submission.graded).length;
                const gradedCount = paper.submissions.filter((submission) => submission.graded).length;

                return (
                  <TableRow key={paper.id}>
                    <TableCell className="min-w-52 font-semibold text-gray-900">{paper.paper_name}</TableCell>
                    <TableCell className="min-w-56 text-gray-500">{paper.class_name}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="border-indigo-100 bg-indigo-50 text-indigo-700">
                        {paper.month_label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-500">{paper.number_of_questions} questions</TableCell>
                    <TableCell>
                      {pendingCount > 0 ? (
                        <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700">
                          {pendingCount} pending
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="border-green-200 bg-green-50 text-green-700">
                          All graded
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-gray-500">{gradedCount} graded</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        nativeButton={false}
                        className="border-indigo-200 text-indigo-700 hover:bg-indigo-50 hover:text-indigo-800"
                        render={<Link href={`/instructor/dashboard/teachers/${teacher.id}/papers/${paper.id}`} />}
                      >
                        View Submissions
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </section>
    </div>
  );
}
