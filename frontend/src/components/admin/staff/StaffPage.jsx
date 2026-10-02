'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Icon from '@/components/admin/Icon';
import { CATEGORIES, STAFF_DATA } from '@/mocks/staff';
import { getTutors, createTutor, activateTutor, deactivateTutor, adminResetTutorPassword, adminUpdateTutor, createInstructor, getInstructors, adminUpdateInstructor, activateInstructor, deactivateInstructor } from '@/lib/api-client';
import CategoryCard from './CategoryCard';
import StaffTable from './StaffTable';
import StaffDrawer from './StaffDrawer';
import AddStaffDialog from './AddStaffDialog';
import Toast from './Toast';
import styles from './staff.module.css';
import EditStaffDialog from './EditStaffDialog';
import ResetPasswordDialog from './ResetPasswordDialog';

function formatJoinedDate(isoString) {
  if (!isoString) return '—';
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function mapTutorToPerson(tutor) {
  return {
    id: tutor.id,
    idCode: tutor.tutorCode,
    fullName: tutor.displayName,
    mobile: tutor.contactNumber,
    email: tutor.email,
    username: tutor.username,
    subject: tutor.subject,
    examLevel: tutor.examLevel,
    medium: tutor.medium,
    status: tutor.status === 2 ? 'Active' : 'Inactive',
    joined: formatJoinedDate(tutor.createdDateTime),
    enrolledStudents: tutor.enrolledStudentsCount ?? 0,
  };
}

function mapInstructorToPerson(instructor) {
  return {
    id: instructor.id,
    idCode: instructor.employee_id,
    fullName: instructor.name || `${instructor.first_name ?? ''} ${instructor.last_name ?? ''}`.trim(),
    mobile: instructor.contact_number,
    email: instructor.email,
    address: instructor.address,
    nic: instructor.nic_number,
    status: instructor.statusSeq === 2 ? 'Active' : 'Inactive',
    joined: formatJoinedDate(instructor.createdDateTime),
  };
}

export default function StaffPage() {
  const [data, setData] = useState(STAFF_DATA);
  const [categoryKey, setCategoryKey] = useState('teachers');
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [teachersLoading, setTeachersLoading] = useState(true);
  const [teachersError, setTeachersError] = useState('');
  const [resetPasswordOpen, setResetPasswordOpen] = useState(false);

  const category = CATEGORIES.find((c) => c.key === categoryKey);
  const people = data[categoryKey];

  function showToast(message) {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage((current) => (current === message ? '' : current));
    }, 3500);
  }

  const loadTeachers = useCallback(async () => {
    setTeachersLoading(true);
    setTeachersError('');
    try {
      const tutors = await getTutors();
      setData((prev) => ({ ...prev, teachers: tutors.map(mapTutorToPerson) }));
    } catch (err) {
      setTeachersError(err?.message || 'Could not load teachers.');
    } finally {
      setTeachersLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTeachers();
  }, [loadTeachers]);

  const [instructorsLoading, setInstructorsLoading] = useState(true);
  const [instructorsError, setInstructorsError] = useState('');

  const loadInstructors = useCallback(async () => {
    setInstructorsLoading(true);
    setInstructorsError('');
    try {
      const instructors = await getInstructors();
      setData((prev) => ({ ...prev, instructors: instructors.map(mapInstructorToPerson) }));
    } catch (err) {
      setInstructorsError(err?.message || 'Could not load instructors.');
    } finally {
      setInstructorsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInstructors();
  }, [loadInstructors]);

  function switchCategory(key) {
    setCategoryKey(key);
    setSearch('');
    setSelectedId(null);
  }

  const filteredPeople = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return people;
    return people.filter((p) => {
      const haystack = [p.fullName, p.subject, p.assists, p.desk, p.role]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [people, search]);

  const selectedPerson = people.find((p) => p.id === selectedId) ?? null;

  function handleResetPassword(person) {
    if (categoryKey !== 'teachers') {
      showToast("Password reset isn't wired up for this role yet.");
      return;
    }
    setResetPasswordOpen(true);
  }

  async function handleSubmitResetPassword(personId, payload) {
    const result = await adminResetTutorPassword(personId, payload);
    if (result?.isSuccess !== false) {
      showToast(result?.message || `Password reset for ${selectedPerson?.fullName ?? 'the account'}.`);
    }
    return result;
  }

  async function handleToggleActive(person) {
    if (categoryKey === 'teachers') {
      try {
        const result =
          person.status === 'Inactive' ? await activateTutor(person.id) : await deactivateTutor(person.id);
        showToast(result?.message || `${person.fullName}'s account updated.`);
        await loadTeachers();
      } catch (err) {
        showToast(err?.message || 'Could not update account status.');
      }
      return;
    }

    if (categoryKey === 'instructors') {
      try {
        const result =
          person.status === 'Inactive' ? await activateInstructor(person.id) : await deactivateInstructor(person.id);
        showToast(result?.message || `${person.fullName}'s account updated.`);
        await loadInstructors();
      } catch (err) {
        showToast(err?.message || 'Could not update account status.');
      }
      return;
    }

    showToast("Activation isn't wired up for this role yet.");
  }

  function handleEditProfile() {
    setEditOpen(true);
  }

  async function handleSaveProfile(personId, formValues) {
    if (categoryKey === 'teachers') {
      try {
        const result = await adminUpdateTutor(personId, {
          displayName: formValues.fullName,
          contactNumber: formValues.mobile,
          email: formValues.email,
          subject: formValues.subject,
          examLevel: formValues.examLevel,
          medium: formValues.medium,
        });

        if (result?.isSuccess === false) {
          showToast(result.message || 'Could not save changes.');
          return;
        }

        setEditOpen(false);
        showToast(result?.message || 'Profile updated.');
        await loadTeachers();
      } catch (err) {
        showToast(err?.message || 'Could not save changes.');
      }
      return;
    }

    if (categoryKey === 'instructors') {
      try {
        const result = await adminUpdateInstructor(personId, {
          fullName: formValues.fullName,
          email: formValues.email,
          contactNumber: formValues.mobile,
          nicNumber: formValues.nic,
          address: formValues.address,
        });

        if (result?.isSuccess === false) {
          showToast(result.message || 'Could not save changes.');
          return;
        }

        setEditOpen(false);
        showToast(result?.message || 'Profile updated.');
        await loadInstructors();
      } catch (err) {
        showToast(err?.message || 'Could not save changes.');
      }
      return;
    }

    showToast("Editing isn't wired up for this role yet.");
    setEditOpen(false);
  }

  async function handleAddStaff(targetCategoryKey, formValues) {
    if (targetCategoryKey === 'teachers') {
      try {
        const result = await createTutor({
          displayName: formValues.fullName,
          username: formValues.username,
          email: formValues.email,
          contactNumber: formValues.contactNumber,
          subject: formValues.subject,
          examLevel: formValues.examLevel,
          medium: formValues.medium,
          password: formValues.password,
          confirmPassword: formValues.confirmPassword,
        });

        if (result?.isSuccess === false) {
          showToast(result.message || 'Could not create account.');
          return;
        }

        setAddOpen(false);
        switchCategory('teachers');
        showToast(`${formValues.fullName} added — inactive until you activate them.`);
        await loadTeachers();
      } catch (err) {
        showToast(err?.message || 'Could not create account.');
      }
      return;
    }

    if (targetCategoryKey === 'instructors') {
      try {
        const result = await createInstructor({
          fullName: formValues.fullName,
          email: formValues.email,
          contactNumber: formValues.contactNumber,
          nicNumber: formValues.nic,
          address: formValues.address,
          password: formValues.password,
          confirmPassword: formValues.confirmPassword,
        });

        if (result?.isSuccess === false) {
          showToast(result.message || 'Could not create account.');
          return;
        }

        setAddOpen(false);
        switchCategory('instructors');
        showToast(`${formValues.fullName} added — inactive until you activate them.`);
        await loadInstructors();
      } catch (err) {
        showToast(err?.message || 'Could not create account.');
      }
      return;
    }

    // remaining categories (e.g. cashiers) are still mocked
    const targetCategory = CATEGORIES.find((c) => c.key === targetCategoryKey);
    const existingCount = data[targetCategoryKey].length;
    const idCode = `${targetCategory.idPrefix}-01${String(existingCount + 1).padStart(2, '0')}`;
    const newPerson = {
      id: `${targetCategoryKey}-${Date.now()}`,
      idCode,
      fullName: formValues.fullName,
      mobile: formValues.contactNumber,
      email: formValues.email,
      status: 'Inactive',
      joined: '—',
    };
    setData((prev) => ({ ...prev, [targetCategoryKey]: [newPerson, ...prev[targetCategoryKey]] }));
    setAddOpen(false);
    switchCategory(targetCategoryKey);
    showToast(`${formValues.fullName} added (mock — backend not wired up yet for this role).`);
  }

  return (
    <div className={styles.page}>
      <div className={styles.headerRow}>
        <div>
          <h1 className={styles.h1}>Staff</h1>
          <p className={styles.subtitle}>Teachers, instructors and cashiers with access to the academy.</p>
        </div>
        <button type="button" className={styles.addButton} onClick={() => setAddOpen(true)}>
          <Icon name="person_add" size={19} weight={600} />
          Add staff member
        </button>
      </div>

      <div className={styles.categoryGrid}>
        {CATEGORIES.map((cat) => (
          <CategoryCard
            key={cat.key}
            category={cat}
            count={data[cat.key].length}
            active={cat.key === categoryKey}
            onClick={() => switchCategory(cat.key)}
          />
        ))}
      </div>

      <div className={styles.listCard}>
        <div className={styles.listHeader}>
          <span className={styles.listTitle}>
            {category.label} <span className={styles.listCount}>· {filteredPeople.length} shown</span>
          </span>

          <div className={styles.listControls}>
            <div className={styles.searchBox}>
              <Icon name="search" size={18} style={{ color: 'var(--syz-muted)' }} />
              <input
                className={styles.searchInput}
                type="search"
                placeholder={category.searchPlaceholder}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>

        {categoryKey === 'teachers' && teachersLoading ? (
          <div className={styles.emptyState}>Loading teachers…</div>
        ) : categoryKey === 'teachers' && teachersError ? (
          <div className={styles.emptyState}>{teachersError}</div>
        ) : categoryKey === 'instructors' && instructorsLoading ? (
          <div className={styles.emptyState}>Loading instructors…</div>
        ) : categoryKey === 'instructors' && instructorsError ? (
          <div className={styles.emptyState}>{instructorsError}</div>
        ) : (
          <StaffTable
            category={category}
            people={filteredPeople}
            selectedId={selectedId}
            onSelect={(person) => setSelectedId(person.id)}
            emptyLabel={`No ${category.label.toLowerCase()} match this search.`}
          />
        )}
      </div>

      <StaffDrawer
        category={category}
        person={selectedPerson}
        onClose={() => setSelectedId(null)}
        onResetPassword={handleResetPassword}
        onToggleActive={handleToggleActive}
        onEditProfile={handleEditProfile}
      />

      <AddStaffDialog
        open={addOpen}
        defaultCategory={categoryKey}
        onClose={() => setAddOpen(false)}
        onSubmit={handleAddStaff}
      />

      <EditStaffDialog
        open={editOpen}
        category={category}
        person={selectedPerson}
        onClose={() => setEditOpen(false)}
        onSubmit={handleSaveProfile}
      />

      <ResetPasswordDialog
        open={resetPasswordOpen}
        person={selectedPerson}
        onClose={() => setResetPasswordOpen(false)}
        onSubmit={handleSubmitResetPassword}
      />

      <Toast message={toastMessage} />
    </div>
  );
}