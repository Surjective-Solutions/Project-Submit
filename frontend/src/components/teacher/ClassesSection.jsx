'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import ClassCard from './ClassCard';
import AddClassDialog from './AddClassDialog';
import EditClassDialog from './EditClassDialog';
import ViewClassDialog from './ViewClassDialog';
import { MOCK_TEACHER_CLASSES } from '@/lib/mock-data';

let nextId = MOCK_TEACHER_CLASSES.length + 1;

export default function ClassesSection() {
  const [classes, setClasses] = useState(MOCK_TEACHER_CLASSES);
  const [addOpen, setAddOpen] = useState(false);
  const [viewItem, setViewItem] = useState(null);
  const [editItem, setEditItem] = useState(null);

  function handleAdd(data) {
    const newClass = {
      ...data,
      id: String(nextId++),
      status: 'ACTIVE',
      fee: Number(data.fee),
    };
    setClasses((prev) => [newClass, ...prev]);
  }

  function handleSave(updated) {
    setClasses((prev) => prev.map((c) => (c.id === updated.id ? { ...c, ...updated, fee: Number(updated.fee) } : c)));
  }

  function handleToggleStatus(classItem) {
    const next = classItem.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    setClasses((prev) => prev.map((c) => (c.id === classItem.id ? { ...c, status: next } : c)));
    toast.success(`${classItem.title} marked as ${next === 'ACTIVE' ? 'Active' : 'Inactive'}`);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">My Classes</h2>
          <p className="text-sm text-gray-500 mt-0.5">{classes.length} class{classes.length !== 1 ? 'es' : ''}</p>
        </div>
        <Button
          onClick={() => setAddOpen(true)}
          className="gap-2 text-white"
          style={{ background: 'linear-gradient(135deg, #3940A0 0%, #5a62ff 100%)' }}
        >
          <Plus className="h-4 w-4" />
          Add Class
        </Button>
      </div>

      {/* Grid */}
      {classes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-gray-400 text-sm">No classes yet. Add your first class.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {classes.map((classItem) => (
            <ClassCard
              key={classItem.id}
              classItem={classItem}
              onView={setViewItem}
              onEdit={setEditItem}
              onToggleStatus={handleToggleStatus}
            />
          ))}
        </div>
      )}

      {/* Dialogs */}
      <AddClassDialog open={addOpen} onOpenChange={setAddOpen} onSuccess={handleAdd} />
      <ViewClassDialog
        open={!!viewItem}
        onOpenChange={(v) => { if (!v) setViewItem(null); }}
        classItem={viewItem}
      />
      <EditClassDialog
        open={!!editItem}
        onOpenChange={(v) => { if (!v) setEditItem(null); }}
        classItem={editItem}
        onSave={handleSave}
      />
    </div>
  );
}
