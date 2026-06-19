'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import InstructorCard from './InstructorCard';
import AddInstructorDialog from './AddInstructorDialog';
import EditInstructorDialog from './EditInstructorDialog';
import ViewInstructorDialog from './ViewInstructorDialog';
import DeleteConfirmDialog from '@/components/admin/DeleteConfirmDialog';
import { MOCK_INSTRUCTORS } from '@/lib/mock-data';

let nextId = MOCK_INSTRUCTORS.length + 1;

export default function InstructorsSection() {
  const [instructors, setInstructors] = useState(MOCK_INSTRUCTORS);
  const [addOpen, setAddOpen] = useState(false);
  const [viewItem, setViewItem] = useState(null);
  const [editItem, setEditItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);

  function handleAdd(data) {
    const newInstructor = {
      ...data,
      id: String(nextId++),
      name: data.employee_id,
      status: 'ACTIVE',
    };
    setInstructors((prev) => [newInstructor, ...prev]);
  }

  function handleSave(updated) {
    setInstructors((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
  }

  function handleDelete() {
    if (!deleteItem) return;
    setInstructors((prev) => prev.filter((i) => i.id !== deleteItem.id));
    toast.success(`${deleteItem.name} removed`);
    setDeleteItem(null);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Instructors</h2>
          <p className="text-sm text-gray-500 mt-0.5">{instructors.length} instructor{instructors.length !== 1 ? 's' : ''}</p>
        </div>
        <Button
          onClick={() => setAddOpen(true)}
          className="gap-2 text-white"
          style={{ background: 'linear-gradient(135deg, #053A34 0%, #0d6b5e 100%)' }}
        >
          <Plus className="h-4 w-4" />
          Add Instructor
        </Button>
      </div>

      {/* Grid */}
      {instructors.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-gray-400 text-sm">No instructors yet. Add your first instructor.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {instructors.map((instructor) => (
            <InstructorCard
              key={instructor.id}
              instructor={instructor}
              onView={setViewItem}
              onEdit={setEditItem}
              onDelete={setDeleteItem}
            />
          ))}
        </div>
      )}

      {/* Dialogs */}
      <AddInstructorDialog open={addOpen} onOpenChange={setAddOpen} onSuccess={handleAdd} />
      <ViewInstructorDialog
        open={!!viewItem}
        onOpenChange={(v) => { if (!v) setViewItem(null); }}
        instructor={viewItem}
      />
      <EditInstructorDialog
        open={!!editItem}
        onOpenChange={(v) => { if (!v) setEditItem(null); }}
        instructor={editItem}
        onSave={handleSave}
      />
      <DeleteConfirmDialog
        open={!!deleteItem}
        onOpenChange={(v) => { if (!v) setDeleteItem(null); }}
        name={deleteItem?.name}
        onConfirm={handleDelete}
      />
    </div>
  );
}
