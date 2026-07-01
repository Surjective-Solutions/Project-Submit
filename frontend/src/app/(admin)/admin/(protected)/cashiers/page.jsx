'use client';

import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import StaffCard from "@/components/admin/StaffCard";
import AddCashierDialog from "@/components/admin/AddCashierDialog";
import ViewStaffDialog from "@/components/admin/ViewStaffDialog";
import EditStaffDialog from "@/components/admin/EditStaffDialog";
import { MOCK_CASHIERS } from "@/lib/mock-data";
import { deleteCashier, getCashiers, updateCashier } from "@/lib/api-client";

export default function CashiersPage() {
  // const [cashiers, setCashiers] = useState(MOCK_CASHIERS);
  const [cashiers, setCashiers] = useState([]);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [viewPerson, setViewPerson] = useState(null);
  const [editPerson, setEditPerson] = useState(null);
  const [editLoading, setEditLoading] = useState(false);

  useEffect(() => {
    loadCashiers();
  }, []);

  function handleAddSuccess(data) {
    const newCashier = {
      ...data,
      id: Date.now().toString(),
    };
    setCashiers((prev) => [newCashier, ...prev]);
  }

  async function handleDelete(id) {
    const data = await deleteCashier(id);
    toast.success("Cashier deleted");
  }

  async function handleEdit(data) {
    if (!editPerson) return;
    setEditLoading(true);
    try {
      await updateCashier(editPerson.id, data);
      setCashiers((prev) =>
        prev.map((c) =>
          c.id === editPerson.id
            ? {
                ...c,
                fullName: data.fullName,
                email: data.email,
                ...(data.newUsername ? { username: data.newUsername } : {}),
                ...(data.newPassword ? { password: data.newPassword } : {}),
              }
            : c,
        ),
      );
      toast.success("Cashier updated successfully");
      setEditPerson(null);
    } catch {
      toast.error("Failed to update cashier.");
    } finally {
      setEditLoading(false);
    }
  }

  async function loadCashiers() {
    try {
      const data = await getCashiers();
      setCashiers(data);
    } catch (error) {
      toast.error("Failed to load cashiers");
    }
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Cashiers</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Manage payment desk staff
          </p>
        </div>
        <Button
          className="gap-2 text-white shrink-0"
          style={{ backgroundColor: "#3940A0" }}
          onClick={() => setAddDialogOpen(true)}
        >
          <Plus className="h-4 w-4" />
          Add New Cashier
        </Button>
      </div>

      {/* Cards grid */}
      {cashiers.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-12">
          No cashiers yet. Add your first cashier to get started.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {cashiers.map((cashier) => (
            <StaffCard
              key={cashier.id}
              person={cashier}
              variant="cashier"
              onView={(p) => setViewPerson(p)}
              onEdit={(p) => setEditPerson(p)}
            />
          ))}
        </div>
      )}

      {/* Add dialog */}
      <AddCashierDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onSuccess={handleAddSuccess}
      />

      {/* View dialog */}
      <ViewStaffDialog
        open={!!viewPerson}
        onOpenChange={(o) => !o && setViewPerson(null)}
        person={viewPerson}
        variant="cashier"
        onDelete={handleDelete}
      />

      {/* Edit dialog */}
      <EditStaffDialog
        open={!!editPerson}
        onOpenChange={(o) => !o && setEditPerson(null)}
        person={editPerson}
        variant="cashier"
        onSave={handleEdit}
        isLoading={editLoading}
      />
    </div>
  );
}
