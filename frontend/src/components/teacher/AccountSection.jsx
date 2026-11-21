'use client';

import { useCallback, useEffect, useState } from 'react';
import { Geist } from 'next/font/google';
import { Pencil } from 'lucide-react';
import { toast } from 'sonner';
import EditTeacherProfileDialog from './EditTeacherProfileDialog';
import { getTokenPayload } from '@/lib/auth';
import { API_BASE, getTutorById, updateTeacherProfile } from '@/lib/api-client';
import { filled, readMediums, readOnlyValues } from '@/lib/teacher-profile';
import s from './account.module.css';

const font = Geist({ subsets: ['latin'], display: 'swap', fallback: ['system-ui', 'sans-serif'] });

// The name shown under the photo.
const nameOf = (t) =>
  (t.displayName || [t.first_name, t.last_name].filter(Boolean).join(' ') || t.username || '').trim();

// The server sends the photo as a path on itself ("/uploads/profile_photos/..."), so it needs the server's address.
const withPhotoAddress = (t) =>
  t?.profile_image_url?.startsWith('/') ? { ...t, profile_image_url: `${API_BASE}${t.profile_image_url}` } : t;

// The letter shown when there is no photo.
const initialOf = (t) => (t.displayName || t.first_name || t.username || '?').trim().charAt(0).toUpperCase() || '?';

function Field({ label, value, full }) {
  return (
    <div className={full ? `${s.field} ${s.full}` : s.field}>
      <dt className={s.label}>{label}</dt>
      <dd className={s.value}>{filled(value) ? value : <span className={s.empty}>Not set</span>}</dd>
    </div>
  );
}

// A titled panel. The pill counts how many of its fields have a value.
function Panel({ id, title, fields }) {
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
      <dl className={s.body}>
        {fields.map((f) => (
          <Field key={f.label} label={f.label} value={f.value} full={f.full} />
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
      setTeacher(withPhotoAddress(await getTutorById(userSeq)));
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
      const form = new FormData();
      form.append('firstName', data.first_name ?? '');
      form.append('lastName', data.last_name ?? '');
      form.append('email', data.email ?? '');
      form.append('bio', data.bio ?? '');
      form.append('mediums', (data.mediums ?? []).join(','));
      if (data.photo_file) form.append('photo', data.photo_file);
      form.append('removePhoto', String(Boolean(data.remove_photo)));
      if (data.new_password) {
        form.append('currentPassword', data.current_password ?? '');
        form.append('newPassword', data.new_password);
      }
      const result = await updateTeacherProfile(form);
      if (!result?.isSuccess) {
        toast.error(result?.message || 'Could not save your profile');
        return;
      }
      // Show what the server now holds (the new photo address, the cleaned-up values).
      const userSeq = getTokenPayload()?.userSeq;
      setTeacher(withPhotoAddress(await getTutorById(userSeq)));
      toast.success('Profile updated');
      setEditOpen(false);
    } catch {
      toast.error('Could not save your profile. Check the connection and try again.');
    } finally {
      setEditLoading(false);
    }
  }

  const locked = readOnlyValues(teacher);

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
              <div className={s.identity}>
                <p className={s.name}>{nameOf(teacher)}</p>
                {locked.tutor_id ? <p className={s.tutorId}>
                    Tutor ID: <strong>{locked.tutor_id}</strong>
                  </p> : null}
              </div>
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
                  { label: 'Contact number', value: locked.contact_number },
                ]}
              />
              <Panel
                id="acct-professional"
                title="Professional information"
                fields={[
                  { label: 'Subject', value: locked.subject_area },
                  { label: 'Exam level', value: locked.exam_level },
                  { label: 'Medium', value: readMediums(teacher).join(', ') },
                  { label: 'Bio', value: teacher.bio },
                ]}
              />
              <Panel
                id="acct-account"
                title="Account"
                fields={[
                  { label: 'Tutor ID', value: locked.tutor_id },
                  { label: 'Username', value: locked.username },
                  { label: 'Member since', value: locked.member_since },
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
