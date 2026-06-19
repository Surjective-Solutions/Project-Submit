'use client';

import { useState, useMemo } from 'react';
import { Search, Eye, Pencil } from 'lucide-react';
import { toast } from 'sonner';

import { Input } from '@/components/ui/input';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import ViewAdminInstructorDialog from '@/components/admin/ViewAdminInstructorDialog';
import EditAdminInstructorDialog from '@/components/admin/EditAdminInstructorDialog';
import { MOCK_ADMIN_INSTRUCTORS } from '@/lib/mock-data';

const SUBJECT_COLORS = {
  Mathematics: 'bg-blue-50 text-blue-700',
  Physics: 'bg-orange-50 text-orange-700',
  Chemistry: 'bg-purple-50 text-purple-700',
  Biology: 'bg-green-50 text-green-700',
  'English Literature': 'bg-pink-50 text-pink-700',
  default: 'bg-gray-100 text-gray-600',
};

function Avatar({ firstName, lastName }) {
  const f = (firstName || '').trim();
  const l = (lastName || '').trim();
  const initials = f && l ? (f[0] + l[0]).toUpperCase() : (f.slice(0, 2) || '?').toUpperCase();
  return (
    <div
      className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0"
      style={{ background: 'linear-gradient(135deg, #E9D848 0%, #d4c030 100%)', color: '#1a1a00' }}
      aria-hidden="true"
    >
      {initials}
    </div>
  );
}

export default function InstructorsPage() {
  const [instructors, setInstructors] = useState(MOCK_ADMIN_INSTRUCTORS);
  const [search, setSearch] = useState('');
  const [viewInstructor, setViewInstructor] = useState(null);
  const [editInstructor, setEditInstructor] = useState(null);
  const [editLoading, setEditLoading] = useState(false);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return instructors;
    return instructors.filter((i) => {
      const fullName = `${i.first_name} ${i.last_name}`.toLowerCase();
      return (
        fullName.includes(q) ||
        i.employee_id.toLowerCase().includes(q) ||
        (i.email ?? '').toLowerCase().includes(q) ||
        i.contact_number.includes(q)
      );
    });
  }, [instructors, search]);

  async function handleEdit(data) {
    if (!editInstructor) return;
    setEditLoading(true);
    try {
      setInstructors((prev) =>
        prev.map((i) => (i.id === editInstructor.id ? { ...i, ...data } : i))
      );
      toast.success('Instructor updated successfully');
      setEditInstructor(null);
    } finally {
      setEditLoading(false);
    }
  }

  return (
    <div className="space-y-5">
      {/* Page header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2.5">
          <h2 className="text-xl font-semibold text-gray-900">Instructors</h2>
          <span className="text-sm text-gray-400">
            •&nbsp;{instructors.length} total
          </span>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          <Input
            type="search"
            placeholder="Search by name, ID, email…"
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="odd:bg-gray-50 even:bg-gray-50 hover:bg-gray-50">
              <TableHead className="w-10 pl-4" />
              <TableHead>Employee ID</TableHead>
              <TableHead>Full Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="pr-4 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow className="odd:bg-white even:bg-white hover:bg-white">
                <TableCell colSpan={8} className="py-14 text-center text-gray-400 text-sm">
                  {search
                    ? `No results found for "${search}"`
                    : 'No instructors yet.'}
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((i) => {
                const subjectColor = SUBJECT_COLORS[i.subject_area] ?? SUBJECT_COLORS.default;
                const isActive = i.status === 'ACTIVE';
                return (
                  <TableRow key={i.id}>
                    <TableCell className="pl-4">
                      <Avatar firstName={i.first_name} lastName={i.last_name} />
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 whitespace-nowrap">
                        {i.employee_id}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium text-gray-900 whitespace-nowrap">
                        {i.first_name} {i.last_name}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-gray-500 text-sm max-w-[160px] truncate block">
                        {i.email ?? '—'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-gray-700 text-sm whitespace-nowrap">{i.contact_number}</span>
                    </TableCell>
                    <TableCell>
                      {i.subject_area && (
                        <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${subjectColor}`}>
                          {i.subject_area}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${
                          isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {i.status}
                      </span>
                    </TableCell>
                    <TableCell className="pr-4 text-right">
                      <div className="flex items-center justify-end gap-0.5">
                        <Tooltip>
                          <TooltipTrigger
                            onClick={() => setViewInstructor(i)}
                            className="inline-flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            <span className="sr-only">View</span>
                          </TooltipTrigger>
                          <TooltipContent>View</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger
                            onClick={() => setEditInstructor(i)}
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
      <ViewAdminInstructorDialog
        open={!!viewInstructor}
        onOpenChange={(o) => !o && setViewInstructor(null)}
        instructor={viewInstructor}
      />
      <EditAdminInstructorDialog
        open={!!editInstructor}
        onOpenChange={(o) => !o && setEditInstructor(null)}
        instructor={editInstructor}
        onSave={handleEdit}
        isLoading={editLoading}
      />
    </div>
  );
}
