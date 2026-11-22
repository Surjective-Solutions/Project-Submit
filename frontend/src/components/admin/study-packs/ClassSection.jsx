'use client';

import Icon from '@/components/admin/Icon';
import { GRADES, SUBJECTS } from '@/study-packs/constants';
import { gradeAllowed } from '@/study-packs/examLevel';
import { ERROR_MESSAGES } from '@/study-packs/utils';
import FormSection, { Field } from './FormSection';
import styles from './study-packs.module.css';

// A select with a leading icon. The placeholder option is hidden, so with nothing chosen the
// control shows the prompt in the normal text colour.
function SelectField({ id, value, onChange, placeholder, options, invalid, disabled = false }) {
  return (
    <div className={styles.selectWrap}>
      <select
        id={id}
        className={invalid ? `${styles.select} ${styles.inputInvalid}` : styles.select}
        value={value}
        disabled={disabled}
        aria-invalid={invalid ? 'true' : undefined}
        aria-describedby={invalid ? `${id}-error` : undefined}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="" hidden>
          {placeholder}
        </option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <span className={styles.selectChevron} aria-hidden="true">
        <Icon name="expand_more" size={20} />
      </span>
    </div>
  );
}

// `hideTeacher` / `hideSubject` are set in the teacher account: the pack always belongs to the signed-in teacher and
// their own subject, so those two fields aren't shown (the form is already filled with them).
// `examLevels` (e.g. ['A/L']) limits the grades to the teacher's own level; empty or missing shows every grade.
export default function ClassSection({
  form,
  errors,
  teachers,
  classOptions = [],
  classesState = 'ready',
  onChange,
  onTeacherChange,
  onClassChange,
  hideTeacher = false,
  hideSubject = false,
  examLevels = [],
}) {
  const teacherOptions = teachers.map((teacher) => ({ value: String(teacher.id), label: teacher.name }));
  const gradeOptions = GRADES.filter((grade) => gradeAllowed(grade, examLevels)).map((grade) => ({
    value: grade,
    label: grade,
  }));
  const classChoices = classOptions.map((c) => ({ value: c.id, label: c.name }));
  const classPlaceholder =
    classesState === 'no-teacher'
      ? 'Select a teacher first'
      : classesState === 'loading'
        ? 'Loading classes…'
        : classesState === 'failed'
          ? 'Could not load classes'
          : classChoices.length
            ? 'Select a class'
            : 'This teacher has no active classes';
  const subjectOptions = SUBJECTS.map((subject) => ({ value: subject, label: subject }));

  return (
    <FormSection
      icon="school"
      title="Class"
      subtitle={hideTeacher ? 'Which students it is for.' : 'Who teaches it, and which students it is for.'}
    >
      <div className={styles.fieldGrid}>
        {hideTeacher ? null : (
          <Field id="sp-teacher" label="Teacher" required error={errors.teacherId ? ERROR_MESSAGES.teacherId : ''}>
            <SelectField
              id="sp-teacher"
              icon="co_present"
              value={form.teacherId}
              placeholder="Select a teacher"
              options={teacherOptions}
              invalid={errors.teacherId}
              onChange={onTeacherChange}
            />
          </Field>
        )}

        <Field id="sp-class" label="Class" required error={errors.classId ? ERROR_MESSAGES.classId : ''}>
          <SelectField
            id="sp-class"
            value={form.classId}
            placeholder={classPlaceholder}
            options={classChoices}
            invalid={errors.classId}
            disabled={classChoices.length === 0}
            onChange={onClassChange}
          />
        </Field>

        <Field id="sp-grade" label="Grade" required error={errors.grade ? ERROR_MESSAGES.grade : ''}>
          <SelectField
            id="sp-grade"
            icon="stairs"
            value={form.grade}
            placeholder="Select a grade"
            options={gradeOptions}
            invalid={errors.grade}
            onChange={(value) => onChange('grade', value)}
          />
        </Field>

        {hideSubject ? null : (
          <Field id="sp-subject" label="Subject" required error={errors.subject ? ERROR_MESSAGES.subject : ''}>
            <SelectField
              id="sp-subject"
              icon="menu_book"
              value={form.subject}
              placeholder="Select a subject"
              options={subjectOptions}
              invalid={errors.subject}
              onChange={(value) => onChange('subject', value)}
            />
          </Field>
        )}
      </div>
    </FormSection>
  );
}
