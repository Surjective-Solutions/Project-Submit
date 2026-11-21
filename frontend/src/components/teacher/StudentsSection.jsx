'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Search,
  Phone,
  Mail,
  X,
  Loader2,
  UserSearch,
  User,
  GraduationCap,
  Users,
  BookOpen,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { getMyStudents } from '@/lib/teacher-students';

// Surjective Solutions brand palette (the same one as the admin Students page)
const TEAL = '#053A34';
const TERRACOTTA = '#C24C28';
const HARBOUR = '#244F6F';
const SEARCH_RED = '#E5242B';

const STATUS_STYLES = {
  ACTIVE: { backgroundColor: 'rgba(34,197,94,0.1)', color: '#16a34a' },
  INACTIVE: { backgroundColor: 'rgba(107,114,128,0.1)', color: '#6b7280' },
  SUSPENDED: { backgroundColor: 'rgba(239,68,68,0.1)', color: '#dc2626' },
  GRADUATED: { backgroundColor: 'rgba(59,130,246,0.1)', color: '#2563eb' },
  DEVICE_LOCKED: { backgroundColor: 'rgba(245,158,11,0.12)', color: '#b45309' },
  LEFT: { backgroundColor: 'rgba(107,114,128,0.1)', color: '#6b7280' },
};

// Strip everything but digits, then drop a leading "94" (country code) or a leading "0" (local trunk prefix), so
// "+94 77 123 4567", "0771234567" and "771234567" all match.
function normalizePhone(value) {
  const digits = (value || '').replace(/\D/g, '');
  if (digits.startsWith('94')) return digits.slice(2);
  if (digits.startsWith('0')) return digits.slice(1);
  return digits;
}

function getInitials(firstName, lastName) {
  const f = (firstName || '').trim();
  const l = (lastName || '').trim();
  if (f && l) return (f[0] + l[0]).toUpperCase();
  if (f) return f.slice(0, 2).toUpperCase();
  return '?';
}

// Sri Lankan "name with initials" convention: initial per given name + surname.
function getNameWithInitials(firstName, lastName) {
  const first = (firstName || '').trim();
  const last = (lastName || '').trim();
  if (!first) return last;
  const initials = first
    .split(/\s+/)
    .map((part) => `${part[0].toUpperCase()}.`)
    .join(' ');
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
        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: iconBg }}>
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

// The teacher's Students section: the admin's student lookup, limited to the students enrolled in this teacher's
// own classes (the server only returns those) and without the admin controls (edit, device lock, address, NIC).
export default function StudentsSection() {
  const [students, setStudents] = useState(null); // null while loading
  const [loadFailed, setLoadFailed] = useState(false);
  const [mode, setMode] = useState('phone'); // 'phone' | 'email'
  const [query, setQuery] = useState('');
  const [searched, setSearched] = useState(false);
  const [student, setStudent] = useState(null);

  const load = useCallback(() => {
    setStudents(null);
    setLoadFailed(false);
    let cancelled = false;
    getMyStudents()
      .then((list) => !cancelled && setStudents(list))
      .catch(() => !cancelled && setLoadFailed(true));
    return () => {
      cancelled = true;
    };
  }, []);
  useEffect(() => load(), [load]);

  function switchMode(next) {
    if (next === mode) return;
    setMode(next);
    setQuery('');
    setSearched(false);
    setStudent(null);
  }

  function fillExample(nextMode, value) {
    setMode(nextMode);
    setQuery(value);
  }

  function handleSearch(e) {
    e?.preventDefault();
    const raw = query.trim();
    if (!raw || !students) return;

    let match;
    if (mode === 'phone') {
      const target = normalizePhone(raw);
      match = students.find(
        (s) => normalizePhone(s.contact_number) === target || normalizePhone(s.whatsapp_number) === target,
      );
    } else {
      const target = raw.toLowerCase();
      match = students.find((s) => (s.email ?? '').toLowerCase() === target);
    }
    setSearched(true);
    setStudent(match ?? null);
    if (!match) toast.error(`No student in your classes found for that ${mode === 'phone' ? 'phone number' : 'email'}`);
  }

  const fullName = student ? `${student.first_name} ${student.last_name}` : '';
  const loading = students === null && !loadFailed;

  return (
    <div className="space-y-5">
      {/* Page header */}
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-gray-900">Students</h2>
        <p className="text-sm text-gray-500 mt-0.5">
          Search by registered mobile number or email to view a student in one of your classes.
        </p>
      </div>

      {loadFailed && (
        <div
          role="alert"
          className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 flex items-center gap-3 flex-wrap text-sm text-red-700"
        >
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span className="flex-1 min-w-[200px]">Couldn&rsquo;t load your students. Check the connection and try again.</span>
          <Button variant="outline" className="gap-2" onClick={load}>
            <RefreshCw className="h-3.5 w-3.5" />
            Try again
          </Button>
        </div>
      )}

      {/* Search card */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4">
        <form onSubmit={handleSearch} className="flex items-center gap-3 flex-wrap">
          {/* Mode toggle */}
          <div className="inline-flex items-center gap-1 rounded-full bg-gray-100 p-1 shrink-0">
            <button
              type="button"
              onClick={() => switchMode('phone')}
              className={`inline-flex items-center gap-1.5 text-sm font-medium px-3.5 py-2 rounded-full transition-colors ${
                mode === 'phone' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Phone className="h-3.5 w-3.5" />
              Phone
            </button>
            <button
              type="button"
              onClick={() => switchMode('email')}
              className={`inline-flex items-center gap-1.5 text-sm font-medium px-3.5 py-2 rounded-full transition-colors ${
                mode === 'email' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Mail className="h-3.5 w-3.5" />
              Email
            </button>
          </div>

          {/* Input */}
          <div className="flex-1 min-w-[220px] flex items-center gap-2 rounded-xl bg-gray-50 border border-gray-200 px-4 h-11 focus-within:border-current transition-colors">
            {mode === 'phone' && (
              <span className="text-gray-400 font-medium text-sm shrink-0 pr-2.5 border-r border-gray-200">+94</span>
            )}
            <input
              type={mode === 'phone' ? 'tel' : 'email'}
              inputMode={mode === 'phone' ? 'tel' : 'email'}
              aria-label={mode === 'phone' ? 'Phone number' : 'Email'}
              placeholder={mode === 'phone' ? '77 123 4567' : 'name@example.com'}
              maxLength={mode === 'phone' ? 9 : undefined}
              className="flex-1 bg-transparent outline-none text-sm text-gray-800 placeholder:text-gray-400"
              value={query}
              onChange={(e) => {
                const next = mode === 'phone' ? e.target.value.replace(/\D/g, '').slice(0, 9) : e.target.value;
                setQuery(next);
              }}
            />
            {query && (
              <button type="button" aria-label="Clear" onClick={() => setQuery('')} className="text-gray-400 hover:text-gray-600 shrink-0">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <Button
            type="submit"
            disabled={loading || !students || !query.trim()}
            className="h-11 px-6 gap-2 text-white shrink-0 rounded-xl"
            style={{ backgroundColor: SEARCH_RED }}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            Search
          </Button>
        </form>
      </div>

      {/* Empty state */}
      {!searched && (
        <div className="rounded-2xl border border-gray-200 bg-white py-16 px-6 flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: 'rgba(36,79,111,0.08)' }}>
            <UserSearch className="h-7 w-7" style={{ color: HARBOUR }} />
          </div>
          <h3 className="text-base font-semibold text-gray-900">No student selected</h3>
          <p className="text-sm text-gray-500 mt-1.5 max-w-sm">
            Enter the mobile number or email the student used when registering. You can see students enrolled in
            your own classes only.
          </p>
          <div className="flex items-center gap-2 mt-5 flex-wrap justify-center">
            <span className="text-xs text-gray-400">Try:</span>
            <button
              type="button"
              onClick={() => fillExample('phone', '77 123 4567')}
              className="text-xs font-medium px-3 py-1.5 rounded-full transition-colors hover:opacity-80"
              style={{ backgroundColor: 'rgba(156,238,249,0.3)', color: HARBOUR }}
            >
              77 123 4567
            </button>
            <button
              type="button"
              onClick={() => fillExample('email', 'name@example.com')}
              className="text-xs font-medium px-3 py-1.5 rounded-full transition-colors hover:opacity-80"
              style={{ backgroundColor: 'rgba(156,238,249,0.3)', color: HARBOUR }}
            >
              name@example.com
            </button>
          </div>
        </div>
      )}

      {/* No match */}
      {searched && !student && (
        <div className="rounded-2xl border border-gray-200 bg-white py-16 px-6 flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: 'rgba(194,76,40,0.08)' }}>
            <UserSearch className="h-7 w-7" style={{ color: TERRACOTTA }} />
          </div>
          <h3 className="text-base font-semibold text-gray-900">No student found</h3>
          <p className="text-sm text-gray-500 mt-1.5 max-w-sm">
            None of your classes has a student matching &ldquo;{query}&rdquo;. Double-check the number or email. Students
            who are not enrolled in one of your classes can&rsquo;t be shown.
          </p>
        </div>
      )}

      {/* Result */}
      {student && (
        <div className="space-y-4">
          {/* Header */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 flex items-center gap-4 flex-wrap">
            <div
              className="w-14 h-14 rounded-full overflow-hidden flex items-center justify-center text-base font-bold shrink-0"
              style={{ backgroundColor: 'rgba(156,238,249,0.35)', color: HARBOUR }}
            >
              {student.profile_photo_url ? (
                <img src={student.profile_photo_url} alt={fullName} className="w-full h-full object-cover" />
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
                {student.status_description || student.status}
              </span>
              <div className="flex items-center flex-wrap gap-2 mt-1.5">
                {student.student_number && (
                  <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-gray-100 text-gray-500">{student.student_number}</span>
                )}
                {(student.grade || student.subject_stream) && (
                  <span className="text-xs text-gray-500">{[student.grade, student.subject_stream].filter(Boolean).join(' · ')}</span>
                )}
              </div>
            </div>
          </div>

          {/* Personal details + Your classes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DetailCard icon={User} iconBg="rgba(36,79,111,0.08)" iconColor={HARBOUR} title="Personal details">
              <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                <Field label="Full name" value={fullName} />
                <Field label="Name with initials" value={getNameWithInitials(student.first_name, student.last_name)} />
                <Field label="Date of birth" value={student.date_of_birth} />
                <Field label="Gender" value={student.gender} />
              </div>
            </DetailCard>

            <DetailCard
              icon={BookOpen}
              iconBg="rgba(184,255,143,0.25)"
              iconColor={TEAL}
              title="Your classes"
              subtitle="The classes of yours this student is enrolled in"
            >
              {(student.classes || []).length > 0 ? (
                <ul className="flex flex-wrap gap-2" aria-label="Enrolled classes">
                  {student.classes.map((c) => (
                    <li key={c.id}>
                      <Link
                        href={`/teacher/dashboard/classes/${c.id}`}
                        className="inline-block text-xs font-medium px-3 py-1.5 rounded-full transition-colors hover:opacity-80"
                        style={{ backgroundColor: 'rgba(156,238,249,0.3)', color: HARBOUR }}
                      >
                        {c.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-400 py-2">No classes listed.</p>
              )}
            </DetailCard>
          </div>

          {/* Contact + Academic */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DetailCard icon={Phone} iconBg="rgba(184,255,143,0.25)" iconColor={TEAL} title="Contact details">
              <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                <Field label="Contact number" value={student.contact_number} />
                <Field label="WhatsApp" value={student.whatsapp_number} />
                <Field label="Email" value={student.email} />
              </div>
            </DetailCard>

            <DetailCard icon={GraduationCap} iconBg="rgba(247,205,165,0.35)" iconColor="#8a5a2b" title="Academic details">
              <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                <Field label="School" value={student.school_name} />
                <Field label="Grade" value={student.grade} />
                <Field label="Stream" value={student.subject_stream} />
                <Field label="District" value={student.district} />
              </div>
            </DetailCard>
          </div>

          {/* Guardian */}
          {(student.guardian_name || student.guardian_contact) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DetailCard icon={Users} iconBg="rgba(36,79,111,0.08)" iconColor={HARBOUR} title="Guardian details">
                <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                  <Field label="Name" value={student.guardian_name} />
                  <Field label="Contact" value={student.guardian_contact} />
                </div>
              </DetailCard>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
