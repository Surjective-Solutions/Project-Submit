'use client';

import { useState } from "react";
import {
  Search,
  Phone,
  Mail,
  X,
  Loader2,
  Lock,
  FlaskConical,
  Pencil,
  UserSearch,
  User,
  Smartphone,
  GraduationCap,
  Users,
  MapPin,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import EditStudentDialog from "@/components/admin/EditStudentDialog";
import { getStudents } from "@/lib/api-client";

// Surjective Solutions brand palette
const TEAL = "#053A34"; // Proof Teal — primary
const LIME = "#B8FF8F"; // Infinite Lime — accent
const SANDSTONE = "#F7CDA5";
const TERRACOTTA = "#C24C28"; // used for locked/alert states
const SKY_CYAN = "#9CEEF9"; // used for tints (avatars, badges)
const HARBOUR = "#244F6F"; // Deep Harbour — secondary actions, section icons
const SEARCH_RED = "#E5242B"; // search button CTA

const STATUS_STYLES = {
  ACTIVE: { backgroundColor: "rgba(34,197,94,0.1)", color: "#16a34a" },
  INACTIVE: { backgroundColor: "rgba(107,114,128,0.1)", color: "#6b7280" },
  SUSPENDED: { backgroundColor: "rgba(239,68,68,0.1)", color: "#dc2626" },
  GRADUATED: { backgroundColor: "rgba(59,130,246,0.1)", color: "#2563eb" },
};

// Strip everything but digits, then drop a leading "94" (country code) or a
// leading "0" (local trunk prefix) so "+94 77 123 4567", "0771234567" and
// "771234567" all normalize to the same 9-digit value for matching.
function normalizePhone(value) {
  const digits = (value || "").replace(/\D/g, "");
  if (digits.startsWith("94")) return digits.slice(2);
  if (digits.startsWith("0")) return digits.slice(1);
  return digits;
}

function getInitials(firstName, lastName) {
  const f = (firstName || "").trim();
  const l = (lastName || "").trim();
  if (f && l) return (f[0] + l[0]).toUpperCase();
  if (f) return f.slice(0, 2).toUpperCase();
  return "?";
}

// Sri Lankan "name with initials" convention: initial per given name + surname.
function getNameWithInitials(firstName, lastName) {
  const first = (firstName || "").trim();
  const last = (lastName || "").trim();
  if (!first) return last;
  const initials = first
    .split(/\s+/)
    .map((part) => `${part[0].toUpperCase()}.`)
    .join(" ");
  return last ? `${initials} ${last}` : initials;
}

function Field({ label, value }) {
  if (!value) return null;
  return (
    <div>
      <p className="text-xs text-gray-400 mb-0.5">{label}</p>
      <p className="text-sm font-medium text-gray-800">{value}</p>
    </div>
  );
}

function DetailCard({ icon: Icon, iconBg, iconColor, title, subtitle, children }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5">
      <div className="flex items-center gap-2.5 mb-4">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
          style={{ backgroundColor: iconBg }}
        >
          <Icon className="h-4 w-4" style={{ color: iconColor }} />
        </div>
        <div>
          <h4 className="text-sm font-semibold text-gray-900">{title}</h4>
          {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
        </div>
      </div>
      {children}
    </div>
  );
}

export default function StudentsPage() {
  const [mode, setMode] = useState("phone"); // 'phone' | 'email'
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [student, setStudent] = useState(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [unlockOpen, setUnlockOpen] = useState(false);
  const [unlockLoading, setUnlockLoading] = useState(false);

  function switchMode(next) {
    if (next === mode) return;
    setMode(next);
    setQuery("");
    setSearched(false);
    setStudent(null);
  }

  function fillExample(nextMode, value) {
    setMode(nextMode);
    setQuery(value);
  }

  async function handleSearch(e) {
    e?.preventDefault();
    const raw = query.trim();
    if (!raw) return;

    setLoading(true);
    setSearched(true);
    try {
      // NOTE: no dedicated search-by-phone/email endpoint exists yet, so this
      // pulls the full list and filters client-side. Swap this for a real
      // `searchStudent(mode, raw)` API call once the backend supports it —
      // nothing else below needs to change.
      const all = await getStudents();
      let match;
      if (mode === "phone") {
        const target = normalizePhone(raw);
        match = all.find(
          (s) =>
            normalizePhone(s.contact_number) === target ||
            normalizePhone(s.whatsapp_number) === target,
        );
      } else {
        const target = raw.toLowerCase();
        match = all.find((s) => (s.email ?? "").toLowerCase() === target);
      }
      setStudent(match ?? null);
      if (!match) {
        toast.error(
          `No student found for that ${mode === "phone" ? "phone number" : "email"}`,
        );
      }
    } catch (error) {
      toast.error("Failed to search students");
      setStudent(null);
    } finally {
      setLoading(false);
    }
  }

  async function handleEdit(data) {
    if (!student) return;
    setEditLoading(true);
    try {
      // TODO: wire to a real update-student endpoint once available
      setStudent((prev) => ({ ...prev, ...data }));
      toast.success("Student updated successfully");
      setEditOpen(false);
    } finally {
      setEditLoading(false);
    }
  }

  function handleUnlockConfirm() {
    setUnlockLoading(true);
    // Frontend-only stub for now. No backend call yet — single-device login
    // enforcement and the real unlock endpoint come later. Once the backend
    // exists, this should clear `device_locked` / `device_bound_*` for the
    // student and let them sign in from a new device.
    setTimeout(() => {
      setUnlockLoading(false);
      setUnlockOpen(false);
      setStudent((prev) =>
        prev ? { ...prev, device_locked: false, lock_attempt_device: null } : prev,
      );
      toast.success(`${student.first_name}'s account has been unlocked`);
    }, 500);
  }

  // TEMPORARY — testing only. Simulates a second-device lock so the "Device
  // lock" panel and the locked badge can be checked without a real backend.
  // Remove this once the backend actually flags `device_locked`.
  function handleLockForTesting() {
    setStudent((prev) =>
      prev
        ? {
            ...prev,
            device_locked: true,
            device_bound_name: prev.device_bound_name ?? "Samsung Galaxy Tab A8",
            device_bound_browser: prev.device_bound_browser ?? "Chrome",
            device_bound_since: prev.device_bound_since ?? "12 Jan 2026",
            lock_attempt_device: "Redmi Note 12",
            lock_attempt_browser: "Chrome",
            lock_attempt_at: new Date().toLocaleString("en-GB", {
              day: "2-digit",
              month: "short",
              hour: "numeric",
              minute: "2-digit",
              hour12: true,
            }),
          }
        : prev,
    );
    toast.success("Account locked (test only)");
  }

  const fullName = student ? `${student.first_name} ${student.last_name}` : "";
  const isLocked = !!student?.device_locked;

  return (
    <div className="space-y-5">
      {/* Page header */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Students</h2>
        <p className="text-sm text-gray-500 mt-0.5">
          Search by registered mobile number or email to view and manage a student account.
        </p>
      </div>

      {/* Search card */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4">
        <form onSubmit={handleSearch} className="flex items-center gap-3 flex-wrap">
          {/* Mode toggle */}
          <div className="inline-flex items-center gap-1 rounded-full bg-gray-100 p-1 shrink-0">
            <button
              type="button"
              onClick={() => switchMode("phone")}
              className={`inline-flex items-center gap-1.5 text-sm font-medium px-3.5 py-2 rounded-full transition-colors ${
                mode === "phone"
                  ? "bg-white shadow-sm text-gray-900"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Phone className="h-3.5 w-3.5" />
              Phone
            </button>
            <button
              type="button"
              onClick={() => switchMode("email")}
              className={`inline-flex items-center gap-1.5 text-sm font-medium px-3.5 py-2 rounded-full transition-colors ${
                mode === "email"
                  ? "bg-white shadow-sm text-gray-900"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Mail className="h-3.5 w-3.5" />
              Email
            </button>
          </div>

          {/* Input */}
          <div
            className="flex-1 min-w-[220px] flex items-center gap-2 rounded-xl bg-gray-50 border border-gray-200 px-4 h-11 focus-within:border-current transition-colors"
            style={{ "--tw-border-opacity": 1 }}
          >
            {mode === "phone" && (
              <span className="text-gray-400 font-medium text-sm shrink-0 pr-2.5 border-r border-gray-200">
                +94
              </span>
            )}
            <input
              type={mode === "phone" ? "tel" : "email"}
              inputMode={mode === "phone" ? "tel" : "email"}
              placeholder={mode === "phone" ? "77 123 4567" : "name@example.com"}
              maxLength={mode === "phone" ? 9 : undefined}
              className="flex-1 bg-transparent outline-none text-sm text-gray-800 placeholder:text-gray-400"
              value={query}
              onChange={(e) => {
                const next =
                  mode === "phone"
                    ? e.target.value.replace(/\D/g, "").slice(0, 9)
                    : e.target.value;
                setQuery(next);
              }}
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="text-gray-400 hover:text-gray-600 shrink-0"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <Button
            type="submit"
            disabled={loading || !query.trim()}
            className="h-11 px-6 gap-2 text-white shrink-0 rounded-xl"
            style={{ backgroundColor: SEARCH_RED }}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
            Search
          </Button>
        </form>
      </div>

      {/* Empty state */}
      {!searched && (
        <div className="rounded-2xl border border-gray-200 bg-white py-16 px-6 flex flex-col items-center text-center">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
            style={{ backgroundColor: "rgba(36,79,111,0.08)" }}
          >
            <UserSearch className="h-7 w-7" style={{ color: HARBOUR }} />
          </div>
          <h3 className="text-base font-semibold text-gray-900">No student selected</h3>
          <p className="text-sm text-gray-500 mt-1.5 max-w-sm">
            Enter the mobile number or email the student used when registering. Their full
            registration record and account status will appear here.
          </p>
          <div className="flex items-center gap-2 mt-5 flex-wrap justify-center">
            <span className="text-xs text-gray-400">Try:</span>
            <button
              type="button"
              onClick={() => fillExample("phone", "77 123 4567")}
              className="text-xs font-medium px-3 py-1.5 rounded-full transition-colors hover:opacity-80"
              style={{ backgroundColor: "rgba(156,238,249,0.3)", color: HARBOUR }}
            >
              77 123 4567
            </button>
            <button
              type="button"
              onClick={() => fillExample("email", "name@example.com")}
              className="text-xs font-medium px-3 py-1.5 rounded-full transition-colors hover:opacity-80"
              style={{ backgroundColor: "rgba(156,238,249,0.3)", color: HARBOUR }}
            >
              name@example.com
            </button>
          </div>
        </div>
      )}

      {/* No match */}
      {searched && !loading && !student && (
        <div className="rounded-2xl border border-gray-200 bg-white py-16 px-6 flex flex-col items-center text-center">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
            style={{ backgroundColor: "rgba(194,76,40,0.08)" }}
          >
            <UserSearch className="h-7 w-7" style={{ color: TERRACOTTA }} />
          </div>
          <h3 className="text-base font-semibold text-gray-900">No student found</h3>
          <p className="text-sm text-gray-500 mt-1.5 max-w-sm">
            No registration matches &ldquo;{query}&rdquo;. Double-check the number or email and
            try again.
          </p>
        </div>
      )}

      {/* Result */}
      {student && (
        <div className="space-y-4">
          {/* Header */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4">
              <div
                className="w-14 h-14 rounded-full overflow-hidden flex items-center justify-center text-base font-bold shrink-0"
                style={{ backgroundColor: "rgba(156,238,249,0.35)", color: HARBOUR }}
              >
                {student.profile_photo_url ? (
                  <img
                    src={student.profile_photo_url}
                    alt={fullName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  getInitials(student.first_name, student.last_name)
                )}
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">{fullName}</h3>
                <span
                  className="inline-block text-[11px] font-semibold px-2 py-0.5 rounded-full mt-1"
                  style={STATUS_STYLES[student.status] ?? STATUS_STYLES.INACTIVE}
                >
                  {student.status}
                </span>
                <div className="flex items-center flex-wrap gap-2 mt-1.5">
                  {student.student_number && (
                    <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-gray-100 text-gray-500">
                      {student.student_number}
                    </span>
                  )}
                  {(student.grade || student.subject_stream) && (
                    <span className="text-xs text-gray-500">
                      {[student.grade, student.subject_stream].filter(Boolean).join(" · ")}
                    </span>
                  )}
                  {isLocked && (
                    <span
                      className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: "rgba(194,76,40,0.1)", color: TERRACOTTA }}
                    >
                      <Lock className="h-3 w-3" />
                      Locked · device limit
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {/* TEMPORARY test-only button — remove once backend sets device_locked for real */}
              <Button
                variant="outline"
                className="gap-2 border-dashed disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ borderColor: "#d97706", color: "#d97706" }}
                onClick={handleLockForTesting}
                disabled={isLocked}
                title="Testing only — simulates a device lock"
              >
                <FlaskConical className="h-3.5 w-3.5" />
                Lock account (test)
              </Button>
              <Button
                className="gap-2 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: HARBOUR }}
                onClick={() => setUnlockOpen(true)}
                disabled={!isLocked}
              >
                <Lock className="h-3.5 w-3.5" />
                Unlock account
              </Button>
              <Button
                variant="outline"
                className="gap-2"
                style={{ borderColor: HARBOUR, color: HARBOUR }}
                onClick={() => setEditOpen(true)}
              >
                <Pencil className="h-3.5 w-3.5" />
                Edit details
              </Button>
            </div>
          </div>

          {/* Personal details + Device lock */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DetailCard
              icon={User}
              iconBg="rgba(36,79,111,0.08)"
              iconColor={HARBOUR}
              title="Personal details"
            >
              <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                <Field label="Full name" value={fullName} />
                <Field
                  label="Name with initials"
                  value={getNameWithInitials(student.first_name, student.last_name)}
                />
                <Field label="Date of birth" value={student.date_of_birth} />
                <Field label="Gender" value={student.gender} />
                <Field label="NIC number" value={student.nic_number} />
              </div>
            </DetailCard>

            <DetailCard
              icon={Smartphone}
              iconBg="rgba(194,76,40,0.08)"
              iconColor={TERRACOTTA}
              title="Device lock"
              subtitle="One device per student account"
            >
              {student.device_bound_name ? (
                <div className="flex items-center justify-between gap-3 rounded-xl border border-gray-100 bg-gray-50 px-3 py-2.5">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Smartphone className="h-4 w-4 text-gray-400 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">
                        {student.device_bound_name}
                        {student.device_bound_browser ? ` · ${student.device_bound_browser}` : ""}
                      </p>
                      <p className="text-xs text-gray-400">
                        Bound since {student.device_bound_since}
                      </p>
                    </div>
                  </div>
                  <span
                    className="text-[11px] font-semibold px-2 py-0.5 rounded-full shrink-0"
                    style={{ backgroundColor: "rgba(156,238,249,0.35)", color: HARBOUR }}
                  >
                    Bound device
                  </span>
                </div>
              ) : (
                <p className="text-sm text-gray-400 py-2">No device bound yet.</p>
              )}

              {isLocked && (
                <div
                  className="mt-3 flex items-start gap-2.5 rounded-xl px-3 py-2.5"
                  style={{
                    backgroundColor: "rgba(194,76,40,0.06)",
                    border: "1px solid rgba(194,76,40,0.2)",
                  }}
                >
                  <Lock className="h-4 w-4 shrink-0 mt-0.5" style={{ color: TERRACOTTA }} />
                  <div>
                    <p className="text-sm font-semibold" style={{ color: TERRACOTTA }}>
                      Locked — second device detected.
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Sign-in attempt from {student.lock_attempt_device}
                      {student.lock_attempt_browser ? ` · ${student.lock_attempt_browser}` : ""}
                      {student.lock_attempt_at ? ` on ${student.lock_attempt_at}` : ""}.
                    </p>
                  </div>
                </div>
              )}
            </DetailCard>
          </div>

          {/* Contact + Academic */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DetailCard
              icon={Phone}
              iconBg="rgba(184,255,143,0.25)"
              iconColor={TEAL}
              title="Contact details"
            >
              <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                <Field label="Contact number" value={student.contact_number} />
                <Field label="WhatsApp" value={student.whatsapp_number} />
                <Field label="Email" value={student.email} />
              </div>
            </DetailCard>

            <DetailCard
              icon={GraduationCap}
              iconBg="rgba(247,205,165,0.35)"
              iconColor="#8a5a2b"
              title="Academic details"
            >
              <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                <Field label="School" value={student.school_name} />
                <Field label="Grade" value={student.grade} />
                <Field label="Stream" value={student.subject_stream} />
                <Field label="District" value={student.district} />
              </div>
            </DetailCard>
          </div>

          {/* Guardian + Address */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DetailCard
              icon={Users}
              iconBg="rgba(36,79,111,0.08)"
              iconColor={HARBOUR}
              title="Guardian details"
            >
              <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                <Field label="Name" value={student.guardian_name} />
                <Field label="Contact" value={student.guardian_contact} />
              </div>
            </DetailCard>

            {student.address && (
              <DetailCard
                icon={MapPin}
                iconBg="rgba(156,238,249,0.3)"
                iconColor={HARBOUR}
                title="Address"
              >
                <p className="text-sm text-gray-800 leading-relaxed">{student.address}</p>
              </DetailCard>
            )}
          </div>
        </div>
      )}

      {/* Edit dialog */}
      <EditStudentDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        student={student}
        onSave={handleEdit}
        isLoading={editLoading}
      />

      {/* Unlock account confirm dialog */}
      <Dialog open={unlockOpen} onOpenChange={setUnlockOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Unlock account?</DialogTitle>
            <DialogDescription>
              This clears {student?.first_name}&rsquo;s bound device so they can log in again
              from a new one. Their previous device will no longer be treated as the only
              allowed device.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUnlockOpen(false)}>
              Cancel
            </Button>
            <Button
              className="text-white"
              style={{ backgroundColor: HARBOUR }}
              onClick={handleUnlockConfirm}
              disabled={unlockLoading}
            >
              {unlockLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Unlock"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}