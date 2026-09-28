'use client';

import { useMemo, useState } from 'react';
import Icon from '@/components/admin/Icon';
import { CATEGORIES, STAFF_DATA } from '@/mocks/staff';
import CategoryCard from './CategoryCard';
import StaffTable from './StaffTable';
import StaffDrawer from './StaffDrawer';
import AddStaffDialog from './AddStaffDialog';
import Toast from './Toast';
import styles from './staff.module.css';

export default function StaffPage() {
  const [data, setData] = useState(STAFF_DATA);
  const [categoryKey, setCategoryKey] = useState('teachers');
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [addOpen, setAddOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const category = CATEGORIES.find((c) => c.key === categoryKey);
  const people = data[categoryKey];

  function showToast(message) {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage((current) => (current === message ? '' : current));
    }, 3500);
  }

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

  function updatePerson(id, updater) {
    setData((prev) => ({
      ...prev,
      [categoryKey]: prev[categoryKey].map((p) => (p.id === id ? updater(p) : p)),
    }));
  }

  function handleResetPassword(person) {
    showToast(`Password reset link sent to ${person.mobile}.`);
  }

  function handleToggleActive(person) {
    const nextStatus = person.status === 'Inactive' ? 'Active' : 'Inactive';
    updatePerson(person.id, (p) => ({ ...p, status: nextStatus }));
    showToast(
      nextStatus === 'Inactive'
        ? `${person.fullName}'s account deactivated.`
        : `${person.fullName}'s account reactivated.`,
    );
  }

  function handleEditProfile() {
    // TODO: wire to a real edit-profile flow once designed/backed by the API.
    showToast("Editing isn't available yet.");
  }

  function handleAddStaff(targetCategoryKey, formValues) {
    const targetCategory = CATEGORIES.find((c) => c.key === targetCategoryKey);
    const existingCount = data[targetCategoryKey].length;
    const idCode = `${targetCategory.idPrefix}-01${String(existingCount + 1).padStart(2, '0')}`;

    const newPerson = {
      id: `${targetCategoryKey}-${Date.now()}`,
      idCode,
      fullName: formValues.fullName,
      mobile: formValues.mobile,
      email: formValues.email,
      status: 'Inactive',
      joined: '—',
      permissions: Object.fromEntries(targetCategory.permissions.map((perm) => [perm.key, false])),
      ...(targetCategoryKey === 'teachers' && {
        subject: formValues.roleField,
        stream: '',
        medium: '',
        weeklyLoad: '',
        enrolledStudents: 0,
      }),
      ...(targetCategoryKey === 'instructors' && {
        assists: formValues.roleField,
        subject: '',
        role: '',
        focus: '',
        hours: 0,
      }),
      ...(targetCategoryKey === 'cashiers' && {
        desk: formValues.roleField,
        location: '',
        shift: '',
        days: '',
        today: 'LKR 0',
      }),
    };

    setData((prev) => ({ ...prev, [targetCategoryKey]: [newPerson, ...prev[targetCategoryKey]] }));
    setAddOpen(false);
    switchCategory(targetCategoryKey);
    showToast(`Invite sent to ${formValues.fullName}.`);
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

        <StaffTable
          category={category}
          people={filteredPeople}
          selectedId={selectedId}
          onSelect={(person) => setSelectedId(person.id)}
          emptyLabel={`No ${category.label.toLowerCase()} match this search.`}
        />
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

      <Toast message={toastMessage} />
    </div>
  );
}