'use client';

import { useState, useMemo } from 'react';
import { Search, Eye, Pencil, UserPlus } from 'lucide-react';
import { toast } from 'sonner';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import ViewStudentDialog from '@/components/admin/ViewStudentDialog';
import EditStudentDialog from '@/components/admin/EditStudentDialog';
import AddStudentDialog from './AddStudentDialog';
import { MOCK_STUDENTS } from '@/lib/mock-data';

const STATUS_STYLES = {
  ACTIVE: 'bg-green-100 text-green-700',
  INACTIVE: 'bg-gray-100 text-gray-600',
  SUSPENDED: 'bg-red-100 text-red-700',
  GRADUATED: 'bg-blue-100 text-blue-700',
};

const STREAM_COLORS = {
  'Physical Science': 'bg-blue-50 text-blue-700',
  'Biological Science': 'bg-green-50 text-green-700',
  Commerce: 'bg-amber-50 text-amber-700',
  Arts: 'bg-pink-50 text-pink-700',
  Technology: 'bg-violet-50 text-violet-700',
  'Combined Mathematics': 'bg-cyan-50 text-cyan-700',
  default: 'bg-gray-100 text-gray-600',
};

function Avatar({ firstName, lastName }) {
  const f = (firstName || '').trim();
  const l = (lastName || '').trim();
  const initials = f && l ? (f[0] + l[0]).toUpperCase() : (f.slice(0, 2) || '?').toUpperCase();
  return (
    <div
      className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold text-white shrink-0"
      style={{ background: 'linear-gradient(135deg, #3940A0 0%, #34A0C5 100%)' }}
      aria-hidden="true"
    >
      {initials}
    </div>
  );
}

let nextStudentId = MOCK_STUDENTS.length + 1;

function generateStudentNumber() {
  return `SUBMITX-2026-${String(nextStudentId).padStart(6, '0')}`;
}

export default function CashierStudentsSection() {
  const [students, setStudents] = useState(MOCK_STUDENTS);
  const [search, setSearch] = useState('');
  const [viewStudent, setViewStudent] = useState(null);
  const [editStudent, setEditStudent] = useState(null);
  const [addOpen, setAddOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [addLoading, setAddLoading] = useState(false);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return students;
    return students.filter((s) => {
      const fullName = `${s.first_name} ${s.last_name}`.toLowerCase();
      return (
        fullName.includes(q) ||
        s.student_number.toLowerCase().includes(q) ||
        (s.email ?? '').toLowerCase().includes(q) ||
        s.contact_number.includes(q)
      );
    });
  }, [students, search]);

  async function handleEdit(data) {
    if (!editStudent) return;
    setEditLoading(true);
    try {
      setStudents((prev) =>
        prev.map((s) =>
          s.id === editStudent.id
            ? { ...s, ...data, profile_photo_url: data.profile_photo_url ?? s.profile_photo_url ?? null }
            : s
        )
      );
      toast.success('Student updated successfully');
      setEditStudent(null);
    } finally {
      setEditLoading(false);
    }
  }

  async function handleAdd(data) {
    setAddLoading(true);
    try {
      const newStudent = {
        id: String(nextStudentId),
        student_number: generateStudentNumber(),
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email ?? '',
        contact_number: data.contact_number,
        date_of_birth: data.date_of_birth ?? '',
        gender: data.gender,
        whatsapp_number: data.whatsapp_number ?? '',
        school_name: data.school_name ?? '',
        grade: data.grade ?? '',
        subject_stream: data.subject_stream ?? '',
        guardian_name: data.guardian_name ?? '',
        guardian_contact: data.guardian_contact ?? '',
        address: data.address ?? '',
        district: data.district ?? '',
        profile_photo_url: null,
        status: 'ACTIVE',
      };
      nextStudentId++;
      setStudents((prev) => [newStudent, ...prev]);
      toast.success(`Student added — ${newStudent.student_number}`);
      setAddOpen(false);
    } finally {
      setAddLoading(false);
    }
  }

  return (
    <div className="space-y-5">
      {/* Page header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2.5">
          <h2 className="text-xl font-semibold text-gray-900">Students</h2>
          <span className="text-sm text-gray-400">•&nbsp;{students.length} total</span>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            <Input
              type="search"
              placeholder="Search by name, number, email…"
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button
            onClick={() => setAddOpen(true)}
            className="text-white shrink-0"
            style={{ background: 'linear-gradient(135deg, #3940A0 0%, #5a62ff 100%)' }}
          >
            <UserPlus className="h-4 w-4 mr-1.5" />
            Add New Student
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="odd:bg-gray-50 even:bg-gray-50 hover:bg-gray-50">
              <TableHead className="w-10 pl-4" />
              <TableHead>Student No.</TableHead>
              <TableHead>Full Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Grade / Stream</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="pr-4 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow className="odd:bg-white even:bg-white hover:bg-white">
                <TableCell colSpan={8} className="py-14 text-center text-gray-400 text-sm">
                  {search ? `No results found for "${search}"` : 'No students yet.'}
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((s) => {
                const statusClass = STATUS_STYLES[s.status] ?? STATUS_STYLES.INACTIVE;
                const streamColor = STREAM_COLORS[s.subject_stream] ?? STREAM_COLORS.default;
                return (
                  <TableRow key={s.id}>
                    <TableCell className="pl-4">
                      <Avatar firstName={s.first_name} lastName={s.last_name} />
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 whitespace-nowrap">
                        {s.student_number}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium text-gray-900 whitespace-nowrap">
                        {s.first_name} {s.last_name}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-gray-500 text-sm max-w-[160px] truncate block">
                        {s.email ?? '—'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-gray-700 text-sm whitespace-nowrap">{s.contact_number}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        {s.grade && (
                          <span className="text-[11px] px-1.5 py-0.5 rounded-full font-medium bg-indigo-50 text-indigo-700 w-fit">
                            {s.grade}
                          </span>
                        )}
                        {s.subject_stream && (
                          <span className={`text-[11px] px-1.5 py-0.5 rounded-full font-medium w-fit ${streamColor}`}>
                            {s.subject_stream}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${statusClass}`}>
                        {s.status}
                      </span>
                    </TableCell>
                    <TableCell className="pr-4 text-right">
                      <div className="flex items-center justify-end gap-0.5">
                        <Tooltip>
                          <TooltipTrigger
                            onClick={() => setViewStudent(s)}
                            className="inline-flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            <span className="sr-only">View</span>
                          </TooltipTrigger>
                          <TooltipContent>View</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger
                            onClick={() => setEditStudent(s)}
                            className="inline-flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            <span className="sr-only">Edit</span>
                          </TooltipTrigger>
                          <TooltipContent>Edit</TooltipContent>
                        </Tooltip>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Dialogs */}
      <ViewStudentDialog
        open={!!viewStudent}
        onOpenChange={(o) => !o && setViewStudent(null)}
        student={viewStudent}
      />
      <EditStudentDialog
        open={!!editStudent}
        onOpenChange={(o) => !o && setEditStudent(null)}
        student={editStudent}
        onSave={handleEdit}
        isLoading={editLoading}
      />
      <AddStudentDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        onAdd={handleAdd}
        isLoading={addLoading}
      />
    </div>
  );
}
