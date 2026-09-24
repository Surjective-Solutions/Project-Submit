'use client';

import { useState, useEffect, useMemo } from "react";
import { Plus, Search, Eye, Pencil, GraduationCap, Wallet, UserCheck } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import StaffCard from "@/components/admin/StaffCard";
import AddTutorDialog from "@/components/admin/AddTutorDialog";
import AddCashierDialog from "@/components/admin/AddCashierDialog";
import ViewStaffDialog from "@/components/admin/ViewStaffDialog";
import EditStaffDialog from "@/components/admin/EditStaffDialog";
import ViewAdminInstructorDialog from "@/components/admin/ViewAdminInstructorDialog";
import EditAdminInstructorDialog from "@/components/admin/EditAdminInstructorDialog";
import {
  deleteTutor, getTutors, updateTutor,
  deleteCashier, getCashiers, updateCashier,
  getInstructors,
} from "@/lib/api-client";

const TABS = [
  { key: "academic", label: "Academic Staff", icon: GraduationCap },
  { key: "cashiers", label: "Cashiers", icon: Wallet },
  { key: "instructors", label: "Instructors", icon: UserCheck },
];

export default function StaffPage() {
  const [activeTab, setActiveTab] = useState("academic");

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Staff</h2>
        <p className="text-sm text-gray-500 mt-0.5">
          Manage academic staff, cashiers, and instructors
        </p>
      </div>

      {/* Tab bar */}
      <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-gray-100">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              activeTab === key
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </button>
        ))}
      </div>

      {activeTab === "academic" && <AcademicStaffTab />}
      {activeTab === "cashiers" && <CashiersTab />}
      {activeTab === "instructors" && <InstructorsTab />}
    </div>
  );
}

// ── Academic Staff tab (unchanged logic from the old page) ─────────────────

function AcademicStaffTab() {
  const [tutors, setTutors] = useState([]);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [viewPerson, setViewPerson] = useState(null);
  const [editPerson, setEditPerson] = useState(null);
  const [editLoading, setEditLoading] = useState(false);

  useEffect(() => {
    loadTutors();
  }, []);

  function handleAddSuccess(data) {
    const newTutor = { ...data, id: Date.now().toString() };
    setTutors((prev) => [newTutor, ...prev]);
  }

  async function handleDelete(id) {
    await deleteTutor(id);
    toast.success("Tutor deleted");
  }

  async function loadTutors() {
    try {
      const data = await getTutors();
      setTutors(data);
    } catch (error) {
      toast.error("Failed to load Tutors");
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
                profilePhotoUrl: data.profilePhotoUrl ?? t.profilePhotoUrl ?? null,
                ...(data.newUsername ? { username: data.newUsername } : {}),
                ...(data.newPassword ? { password: data.newPassword } : {}),
              }
            : t
        )
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
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold text-gray-900">Academic Staff</h3>
          <p className="text-sm text-gray-500 mt-0.5">Manage your tutors and instructors</p>
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

      <AddTutorDialog open={addDialogOpen} onOpenChange={setAddDialogOpen} onSuccess={handleAddSuccess} />
      <ViewStaffDialog
        open={!!viewPerson}
        onOpenChange={(o) => !o && setViewPerson(null)}
        person={viewPerson}
        variant="tutor"
        onDelete={handleDelete}
      />
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

// ── Cashiers tab (unchanged logic from the old page) ────────────────────────

function CashiersTab() {
  const [cashiers, setCashiers] = useState([]);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [viewPerson, setViewPerson] = useState(null);
  const [editPerson, setEditPerson] = useState(null);
  const [editLoading, setEditLoading] = useState(false);

  useEffect(() => {
    loadCashiers();
  }, []);

  function handleAddSuccess() {
    loadCashiers();
  }

  async function handleDelete(id) {
    await deleteCashier(id);
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
            : c
        )
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
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold text-gray-900">Cashiers</h3>
          <p className="text-sm text-gray-500 mt-0.5">Manage payment desk staff</p>
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

      <AddCashierDialog open={addDialogOpen} onOpenChange={setAddDialogOpen} onSuccess={handleAddSuccess} />
      <ViewStaffDialog
        open={!!viewPerson}
        onOpenChange={(o) => !o && setViewPerson(null)}
        person={viewPerson}
        variant="cashier"
        onDelete={handleDelete}
      />
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

// ── Instructors tab (unchanged logic from the old page) ─────────────────────

const SUBJECT_COLORS = {
  Mathematics: "bg-blue-50 text-blue-700",
  Physics: "bg-orange-50 text-orange-700",
  Chemistry: "bg-purple-50 text-purple-700",
  Biology: "bg-green-50 text-green-700",
  "English Literature": "bg-pink-50 text-pink-700",
  default: "bg-gray-100 text-gray-600",
};

function InstructorAvatar({ firstName, lastName }) {
  const f = (firstName || "").trim();
  const l = (lastName || "").trim();
  const initials = f && l ? (f[0] + l[0]).toUpperCase() : (f.slice(0, 2) || "?").toUpperCase();
  return (
    <div
      className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0"
      style={{ background: "linear-gradient(135deg, #E9D848 0%, #d4c030 100%)", color: "#1a1a00" }}
      aria-hidden="true"
    >
      {initials}
    </div>
  );
}

function InstructorsTab() {
  const [instructors, setInstructors] = useState([]);
  const [search, setSearch] = useState("");
  const [viewInstructor, setViewInstructor] = useState(null);
  const [editInstructor, setEditInstructor] = useState(null);
  const [editLoading, setEditLoading] = useState(false);

  useEffect(() => {
    loadInstructors();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return instructors;
    return instructors.filter((i) => {
      const fullName = `${i.first_name} ${i.last_name}`.toLowerCase();
      return (
        fullName.includes(q) ||
        i.employee_id.toLowerCase().includes(q) ||
        (i.email ?? "").toLowerCase().includes(q) ||
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
      toast.success("Instructor updated successfully");
      setEditInstructor(null);
    } finally {
      setEditLoading(false);
    }
  }

  async function loadInstructors() {
    try {
      const data = await getInstructors();
      setInstructors(data);
    } catch (error) {
      toast.error("Failed to load Instructors");
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2.5">
          <h3 className="text-base font-semibold text-gray-900">Instructors</h3>
          <span className="text-sm text-gray-400">•&nbsp;{instructors.length} total</span>
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
                  {search ? `No results found for "${search}"` : "No instructors yet."}
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((i) => {
                const subjectColor = SUBJECT_COLORS[i.subject_area] ?? SUBJECT_COLORS.default;
                const isActive = i.status === "ACTIVE";
                return (
                  <TableRow key={i.id}>
                    <TableCell className="pl-4">
                      <InstructorAvatar firstName={i.first_name} lastName={i.last_name} />
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
                        {i.email ?? "—"}
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
                          isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
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