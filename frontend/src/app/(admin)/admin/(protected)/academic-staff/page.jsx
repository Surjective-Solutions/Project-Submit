'use client';

import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import StaffCard from "@/components/admin/StaffCard";
import AddTutorDialog from "@/components/admin/AddTutorDialog";
import ViewStaffDialog from "@/components/admin/ViewStaffDialog";
import EditStaffDialog from "@/components/admin/EditStaffDialog";
import { MOCK_TUTORS } from "@/lib/mock-data";
import { deleteTutor, getTutors, updateTutor } from "@/lib/api-client";

export default function AcademicStaffPage() {
  // const [tutors, setTutors] = useState(MOCK_TUTORS);
  const [tutors, setTutors] = useState([]);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [viewPerson, setViewPerson] = useState(null);
  const [editPerson, setEditPerson] = useState(null);
  const [editLoading, setEditLoading] = useState(false);

  useEffect(() => {
    loadTutors();
  }, []);

  function handleAddSuccess(data) {
    const newTutor = {
      ...data,
      id: Date.now().toString(),
    };
    setTutors((prev) => [newTutor, ...prev]);
  }

  async function handleDelete(id) {
    const data = await deleteTutor(id);
    toast.success("Tutor deleted");
  }

  async function loadTutors() {
    try {
      const data = await getTutors();
      setTutors(data);
    } catch (error) {
      toast.error("Failed to load cashiers");
    }
  }

  async function handleEdit(data) {
    if (!editPerson) return;
    setEditLoading(true);
    try {
      await updateTutor(editPerson.id, data);
      setTutors((prev) =>
        prev.map((t) =>
          t.id === editPerson.id
            ? {
                ...t,
                displayName: data.displayName,
                email: data.email,
                contactNumber: data.contactNumber,
                subject: data.subject,
                profilePhotoUrl:
                  data.profilePhotoUrl ?? t.profilePhotoUrl ?? null,
                ...(data.newUsername ? { username: data.newUsername } : {}),
                ...(data.newPassword ? { password: data.newPassword } : {}),
              }
            : t,
        ),
      );
      toast.success("Tutor updated successfully");
      setEditPerson(null);
    } catch {
      toast.error("Failed to update tutor.");
    } finally {
      setEditLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Academic Staff
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Manage your tutors and instructors
          </p>
        </div>
        <Button
          className="gap-2 text-white shrink-0"
          style={{ backgroundColor: "#3940A0" }}
          onClick={() => setAddDialogOpen(true)}
        >
          <Plus className="h-4 w-4" />
          Add New Tutor
        </Button>
      </div>

      {/* Cards grid */}
      {tutors.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-12">
          No tutors yet. Add your first tutor to get started.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {tutors.map((tutor) => (
            <StaffCard
              key={tutor.id}
              person={tutor}
              variant="tutor"
              onView={(p) => setViewPerson(p)}
              onEdit={(p) => setEditPerson(p)}
            />
          ))}
        </div>
      )}

      {/* Add dialog */}
      <AddTutorDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onSuccess={handleAddSuccess}
      />

      {/* View dialog */}
      <ViewStaffDialog
        open={!!viewPerson}
        onOpenChange={(o) => !o && setViewPerson(null)}
        person={viewPerson}
        variant="tutor"
        onDelete={handleDelete}
      />

      {/* Edit dialog */}
      <EditStaffDialog
        open={!!editPerson}
        onOpenChange={(o) => !o && setEditPerson(null)}
        person={editPerson}
        variant="tutor"
        onSave={handleEdit}
        isLoading={editLoading}
      />
    </div>
  );
}
