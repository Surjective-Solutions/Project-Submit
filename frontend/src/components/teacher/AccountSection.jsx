'use client';

import { useCallback, useEffect, useState } from 'react';
import { Geist } from 'next/font/google';
import { Pencil } from 'lucide-react';
import { toast } from 'sonner';
import EditTeacherProfileDialog from './EditTeacherProfileDialog';
import { getTokenPayload } from '@/lib/auth';
import { getTutorById } from '@/lib/api-client';
import s from './account.module.css';

const font = Geist({ subsets: ['latin'], display: 'swap', fallback: ['system-ui', 'sans-serif'] });

const filled = (v) => typeof v === 'string' ? v.trim() !== '' : v != null && v !== '';

function formatMemberSince(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

// The letter shown when there is no photo.
const initialOf = (t) => (t.displayName || t.first_name || t.username || '?').trim().charAt(0).toUpperCase() || '?';

function Field({ label, value }) {
  return (
    <div className={s.field}>
      <dt className={s.label}>{label}</dt>
      <dd className={s.value}>{filled(value) ? value : <span className={s.empty}>Not set</span>}</dd>
    </div>
  );
}

// A titled panel. The pill counts how many of its fields have a value.
function Panel({ id, title, fields, single }) {
  const set = fields.filter((f) => filled(f.value)).length;
  return (
    <section className={s.panel} aria-labelledby={id}>
      <div className={s.strip}>
        <h2 id={id} className={s.title}>
          {title}
        </h2>
        <span className={s.pill}>
          {set} of {fields.length} set
        </span>
      </div>
      <dl className={single ? `${s.body} ${s.bodyOne}` : s.body}>
        {fields.map((f) => (
          <Field key={f.label} label={f.label} value={f.value} />
        ))}
      </dl>
    </section>
  );
}

export default function AccountSection() {
  const [status, setStatus] = useState('loading'); // loading | ready | error
  const [teacher, setTeacher] = useState(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);

  const load = useCallback(async () => {
    setStatus('loading');
    try {
      const userSeq = getTokenPayload()?.userSeq;
      if (!userSeq) throw new Error('not signed in');
      setTeacher(await getTutorById(userSeq));
      setStatus('ready');
    } catch {
      toast.error('Failed to load profile');
      setStatus('error');
    }
  }, []);
  useEffect(() => {
    load();
  }, [load]);

  async function handleSave(data) {
    setEditLoading(true);
    try {
      setTeacher((prev) => ({ ...prev, ...data }));
      toast.success('Profile updated');
      setEditOpen(false);
    } finally {
      setEditLoading(false);
    }
  }

  return (
    <div className={`${s.page} ${font.className}`}>
      <div className={s.wrap}>
        {status === 'loading' && (
          <div className={s.card} role="status" aria-busy="true" aria-label="Loading profile">
            <div className={s.skeleton} />
            <div className={s.skeleton} />
            <div className={s.skeleton} />
          </div>
        )}

        {status === 'error' && (
          <div className={s.card} role="alert">
            <p className={s.message}>Couldn’t load your profile.</p>
            <div className={s.editRow} style={{ justifyContent: 'center', margin: 0 }}>
              <button type="button" className={s.edit} onClick={load}>
                Try again
              </button>
            </div>
          </div>
        )}

        {status === 'ready' && teacher && (
          <>
            <div className={s.hero}>
              <button type="button" className={s.avatarBtn} onClick={() => setEditOpen(true)} aria-label="Change profile photo">
                {teacher.profile_image_url ? (
                  <img src={teacher.profile_image_url} alt="" className={s.avatar} />
                ) : (
                  <span className={s.avatar} aria-hidden="true">
                    {initialOf(teacher)}
                  </span>
                )}
                <span className={s.avatarEdit} aria-hidden="true">
                  <Pencil size={13} />
                </span>
              </button>
              <button type="button" className={s.edit} onClick={() => setEditOpen(true)}>
                Edit profile
              </button>
            </div>

            <div className={s.card}>
              <Panel
                id="acct-personal"
                title="Personal information"
                fields={[
                  { label: 'First name', value: teacher.first_name },
                  { label: 'Last name', value: teacher.last_name },
                  { label: 'Email', value: teacher.email },
                  { label: 'Contact number', value: teacher.contact_number },
                ]}
              />
              <Panel
                id="acct-professional"
                title="Professional information"
                single
                fields={[
                  { label: 'Subject area', value: teacher.subject_area },
                  { label: 'Bio', value: teacher.bio },
                ]}
              />
              <Panel
                id="acct-account"
                title="Account"
                fields={[
                  { label: 'Username', value: teacher.username },
                  { label: 'Member since', value: formatMemberSince(teacher.created_at) },
                ]}
              />
            </div>

            <EditTeacherProfileDialog
              open={editOpen}
              onOpenChange={setEditOpen}
              teacher={teacher}
              onSave={handleSave}
              isLoading={editLoading}
            />
          </>
        )}
      </div>
    </div>
  );
}
