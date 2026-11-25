// Instructors API for the teacher account. Stubbed with an in-memory store until the backend has these endpoints.
//
// Every function returns a Promise and throws an Error whose message is safe to show on screen, so the page doesn't
// change when real calls replace these. Nothing is saved anywhere: a page refresh puts the sample data back.
//
// Planned endpoints (tutor role, scoped to the signed-in teacher by the login token, never by an id in the request):
//   GET    /api/tutor/instructors                       -> [{ id: 'INS-48213', name, email, addedAt, lastActive }]
//   GET    /api/tutor/classes                           -> the teacher's classes [{ id, name }]
//   GET    /api/instructor/lookup/{instructorId}        -> { id, name, email, since, alreadyAdded } or 404
//   POST   /api/tutor/add/instructor { employee_id }    -> { isSuccess, message }   (this one already exists)
//   DELETE /api/tutor/instructors/{instructorId}        -> removes the teacher's access
// Notes for the backend:
//   - The lookup must never return more than the preview needs (name, masked or full email, member-since).
//   - Adding gives the instructor access to ALL of the teacher's classes straight away, including classes made later.
//   - Removing takes that access away at once. Only the teacher can add or remove; instructors can't.
//   - GET /api/tutor/get-engaged-instructors exists today and returns { id, name, employee_id, status } only, so email,
//     added date and last-active need adding before the table can use it.

import { DIRECTORY, SEED_CLASSES, SEED_INSTRUCTORS } from './mockData';
import { normaliseInstructorId } from './utils';

const LOOKUP_MS = 900;
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const clone = (value) => JSON.parse(JSON.stringify(value));

let instructors = clone(SEED_INSTRUCTORS);

export async function getInstructors() {
  await wait(250);
  return clone(instructors);
}

export async function getClasses() {
  await wait(150);
  return clone(SEED_CLASSES);
}

// The "Find" step: who is behind this ID? `alreadyAdded` tells the page to show the "already one of your instructors" message.
export async function lookupInstructor(rawId) {
  const { id, error } = normaliseInstructorId(rawId);
  if (error) throw new Error(error);
  await wait(LOOKUP_MS);
  const added = instructors.find((i) => i.id === id);
  if (added) return { id, name: added.name, email: added.email, since: '', alreadyAdded: true };
  const found = DIRECTORY.find((i) => i.id === id);
  if (!found) {
    throw Object.assign(
      new Error(`No instructor found with ID ${id}. Ask them to check the ID on their profile page.`),
      { code: 'NOT_FOUND' }
    );
  }
  return { ...clone(found), alreadyAdded: false };
}

export async function addInstructor(rawId) {
  const { id, error } = normaliseInstructorId(rawId);
  if (error) throw new Error(error);
  await wait(500);
  if (instructors.some((i) => i.id === id)) throw new Error(`${id} is already one of your instructors.`);
  const found = DIRECTORY.find((i) => i.id === id);
  if (!found) throw new Error(`No instructor found with ID ${id}.`);
  const today = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  const instructor = {
    id,
    name: found.name,
    email: found.email,
    addedAt: `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`,
    lastActive: 'Not yet',
  };
  instructors = [instructor, ...instructors];
  return clone(instructor);
}

export async function removeInstructor(id) {
  await wait(400);
  if (!instructors.some((i) => i.id === id)) throw new Error('That instructor is no longer on your list.');
  instructors = instructors.filter((i) => i.id !== id);
}
