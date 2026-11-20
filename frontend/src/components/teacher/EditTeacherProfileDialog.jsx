'use client';

import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Geist } from 'next/font/google';
import { Loader2 } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { BorderTrail } from '@/components/core/border-trail';
import AvatarUpload from '@/components/admin/AvatarUpload';
import PasswordField from '@/components/admin/PasswordField';
import PasswordStrengthIndicator from '@/components/admin/PasswordStrengthIndicator';
import { teacherProfileSchema } from '@/lib/validations/teacher';
import { filled, readMediums, readOnlyValues } from '@/lib/teacher-profile';
import s from './editProfile.module.css';

const font = Geist({ subsets: ['latin'], display: 'swap', fallback: ['system-ui', 'sans-serif'] });

// The photo circle uses the same gradient as the panel headers (AvatarUpload's own default is a brighter blue).
const AVATAR_GRADIENT = 'linear-gradient(135deg, #1c2554 0%, #172c4e 55%, #0f3447 100%)';

// How long the border animation runs after Save is pressed, before the changes are handed over to be saved.
const TRAIL_MS = 1600;
// How wide the line of the border animation is, in px.
const TRAIL_THICKNESS = 3;

// What a teacher can change here: first name, last name, email, bio, medium, the photo and the password. Everything else
// on the form is shown but locked.
const EDITABLE = ['first_name', 'last_name', 'email', 'bio'];
const MEDIUMS = ['Sinhala', 'English', 'Tamil'];

// Fields that are locked can't be fixed by the teacher, so a problem with one of them (an old record with no contact
// number, say) must not stop the editable ones from being saved.
const LOCKED = ['contact_number', 'subject_area', 'username'];
const lockedTolerantResolver = (schema) => {
  const inner = zodResolver(schema);
  return async (values, context, options) => {
    const r = await inner(values, context, options);
    if (!r.errors || Object.keys(r.errors).length === 0) return r;
    const errors = Object.fromEntries(Object.entries(r.errors).filter(([k]) => !LOCKED.includes(k)));
    // A schema skips its cross-field rules while any single field is invalid, so with a locked field failing, the
    // "passwords match" rule would be skipped too. It is checked here instead.
    const { new_password: pw = '', confirm_password: confirm = '' } = values;
    if ((pw || confirm) && pw !== confirm && !errors.confirm_password) {
      errors.confirm_password = { type: 'validate', message: 'Passwords do not match' };
    }
    return Object.keys(errors).length ? { values: {}, errors } : { values, errors: {} };
  };
};

function Field({ label, required, error, id, hint, children }) {
  return (
    <div className={s.field}>
      <label htmlFor={id} className={s.label}>
        {label}
        {required && <span className={s.req} aria-hidden="true">*</span>}
      </label>
      {children}
      {hint && <p className={s.hint}>{hint}</p>}
      {error && (
        <p className={s.error} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

// A locked field: it looks like the others but is grey and can't be focused or edited.
function Locked({ label, value }) {
  return (
    <div className={s.field}>
      <span className={s.label}>{label}</span>
      <div className={s.locked} aria-readonly="true">
        {filled(value) ? value : <span className={s.empty}>Not set</span>}
      </div>
    </div>
  );
}

// Medium: any of the languages the teacher teaches in.
function MediumPicker({ options, selected, onToggle }) {
  return (
    <fieldset className={s.chips}>
      <legend className={s.label}>Medium</legend>
      <div className={s.chipRow}>
        {options.map((m) => (
          <label key={m} className={s.chip}>
            <input type="checkbox" className={s.chipInput} checked={selected.includes(m)} onChange={() => onToggle(m)} />
            <span>{m}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

// A titled panel with the same gradient strip as the My account page. `count` adds the "N of M set" pill.
function Panel({ id, title, count, single, children }) {
  return (
    <section className={s.panel} aria-labelledby={id}>
      <div className={s.strip}>
        <h3 id={id} className={s.title}>
          {title}
        </h3>
        {count && (
          <span className={s.pill}>
            {count.set} of {count.total} set
          </span>
        )}
      </div>
      <div className={single ? `${s.body} ${s.bodyOne}` : s.body}>{children}</div>
    </section>
  );
}

export default function EditTeacherProfileDialog({ open, onOpenChange, teacher, onSave, isLoading }) {
  const [photoUrl, setPhotoUrl] = useState(null);
  const [saving, setSaving] = useState(false); // the border animation is running
  const runRef = useRef(0); // changes whenever a save starts or the dialog closes, so a stale save can tell
  const mountedRef = useRef(true);

  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm({
    resolver: lockedTolerantResolver(teacherProfileSchema),
  });
  const [mediums, setMediums] = useState([]);

  useEffect(() => {
    if (!open) {
      runRef.current += 1;
      setSaving(false);
    }
  }, [open]);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const values = watch();
  const newPasswordValue = values.new_password ?? '';
  const firstNameValue = values.first_name ?? teacher?.first_name ?? '';
  const lastNameValue = values.last_name ?? teacher?.last_name ?? '';
  const locked = readOnlyValues(teacher);
  const valueOf = (k) => (k === 'mediums' ? mediums : k in locked ? locked[k] : values[k]);
  const countOf = (keys) => ({ set: keys.filter((k) => filled(valueOf(k))).length, total: keys.length });
  const mediumOptions = [...MEDIUMS, ...readMediums(teacher).filter((m) => !MEDIUMS.includes(m))];
  const toggleMedium = (m) => setMediums((cur) => (cur.includes(m) ? cur.filter((x) => x !== m) : [...cur, m]));

  useEffect(() => {
    if (teacher && open) {
      reset({
        first_name:       teacher.first_name ?? '',
        last_name:        teacher.last_name ?? '',
        email:            teacher.email ?? '',
        bio:              teacher.bio ?? '',
        new_password:     '',
        confirm_password: '',
      });
      setPhotoUrl(teacher.profile_image_url ?? null);
      setMediums(readMediums(teacher));
    }
  }, [teacher, open, reset]);

  // Only what can be changed is sent; the locked fields are not part of the save.
  // Pressing Save first lets the border animation run around the dialog, then the changes are handed to onSave.
  // Closing the dialog in the meantime cancels the save.
  async function onSubmit(data) {
    if (saving) return;
    const changes = Object.fromEntries(EDITABLE.map((k) => [k, data[k]]));
    const payload = {
      ...changes,
      mediums,
      new_password: data.new_password,
      confirm_password: data.confirm_password,
      profile_image_url: photoUrl,
    };
    const run = ++runRef.current;
    setSaving(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, TRAIL_MS));
      if (runRef.current !== run) return; // the dialog was closed meanwhile
      await onSave(payload);
    } finally {
      if (mountedRef.current) setSaving(false);
    }
  }

  const busy = saving || Boolean(isLoading);
  const cls = (name) => (errors[name] ? `${s.input} ${s.invalid}` : s.input);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={`${s.dialog} ${font.className} sm:max-w-2xl p-0 gap-0 overflow-hidden max-h-[90vh] rounded-[20px]`}
        style={{ display: 'flex', flexDirection: 'column' }}
      >
        {busy && (
          <BorderTrail
            className="bg-linear-to-l from-green-300 via-green-500 to-green-300"
            size={120}
            thickness={TRAIL_THICKNESS}
            transition={{ ease: [0, 0.5, 0.8, 0.5], duration: TRAIL_MS / 1000, repeat: Infinity }}
          />
        )}

        <div className={s.top}>
          <DialogTitle className={s.heading}>Edit profile</DialogTitle>
          <DialogDescription className={s.sub}>Fields shown in grey are locked and can’t be changed here.</DialogDescription>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col flex-1 overflow-hidden">
          <div className={s.scroll}>
            <div className={s.stack}>
              <div className={s.avatar}>
                <AvatarUpload
                  key={teacher?.id}
                  name={`${firstNameValue} ${lastNameValue}`}
                  initialUrl={teacher?.profile_image_url ?? null}
                  onChange={(_, url) => setPhotoUrl(url)}
                  size={80}
                  gradient={AVATAR_GRADIENT}
                />
              </div>

              <Panel
                id="edit-personal"
                title="Personal information"
                count={countOf(['first_name', 'last_name', 'email', 'contact_number'])}
              >
                <Field label="First name" required id="first_name" error={errors.first_name?.message}>
                  <input id="first_name" className={cls('first_name')} placeholder="First name" {...register('first_name')} />
                </Field>
                <Field label="Last name" required id="last_name" error={errors.last_name?.message}>
                  <input id="last_name" className={cls('last_name')} placeholder="Last name" {...register('last_name')} />
                </Field>
                <Field label="Email" id="email" error={errors.email?.message}>
                  <input id="email" type="email" className={cls('email')} placeholder="you@example.com" {...register('email')} />
                </Field>
                <Locked label="Contact number" value={locked.contact_number} />
              </Panel>

              <Panel
                id="edit-professional"
                title="Professional information"
                count={countOf(['subject_area', 'exam_level', 'mediums', 'bio'])}
              >
                <Locked label="Subject" value={locked.subject_area} />
                <Locked label="Exam level" value={locked.exam_level} />
                <div className={s.full}>
                  <MediumPicker options={mediumOptions} selected={mediums} onToggle={toggleMedium} />
                </div>
                <div className={s.full}>
                  <Field label="Bio" id="bio" error={errors.bio?.message}>
                    <textarea
                      id="bio"
                      className={errors.bio ? `${s.textarea} ${s.invalid}` : s.textarea}
                      placeholder="Short bio..."
                      rows={3}
                      {...register('bio')}
                    />
                  </Field>
                </div>
              </Panel>

              <Panel id="edit-account" title="Account" count={countOf(['tutor_id', 'username', 'member_since'])}>
                <Locked label="Tutor ID" value={locked.tutor_id} />
                <Locked label="Username" value={locked.username} />
                <Locked label="Member since" value={locked.member_since} />
              </Panel>

              <Panel id="edit-password" title="Change password">
                <p className={s.note}>Leave blank to keep current password.</p>
                <div className={s.pw}>
                  <PasswordField
                    id="new_password"
                    label="New password"
                    placeholder="New password (min 8 chars)"
                    error={errors.new_password?.message}
                    registration={register('new_password')}
                  />
                  <PasswordStrengthIndicator value={newPasswordValue} />
                </div>
                <div className={s.pw}>
                  <PasswordField
                    id="confirm_password"
                    label="Confirm password"
                    placeholder="Repeat new password"
                    error={errors.confirm_password?.message}
                    registration={register('confirm_password')}
                  />
                </div>
              </Panel>
            </div>
          </div>

          <div className={s.footer}>
            <button type="button" className={`${s.btn} ${s.cancel}`} onClick={() => onOpenChange(false)} disabled={busy}>
              Cancel
            </button>
            <button type="submit" className={`${s.btn} ${s.save}`} disabled={busy}>
              {busy && <Loader2 size={16} className={s.spin} aria-hidden="true" />}
              Save changes
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
