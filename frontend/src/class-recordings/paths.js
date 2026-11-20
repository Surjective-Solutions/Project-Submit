// Where the Class Recordings screens live. The tutor page and its folders are real routes, so a refresh or the
// back button keeps you in the same place.
export const BASE_PATH = '/admin/class-recordings';

export const directoryHref = () => BASE_PATH;
export const tutorHref = (tutorId) => `${BASE_PATH}/tutors/${tutorId}`;
export const folderHref = (tutorId, folderId) => (folderId ? `${tutorHref(tutorId)}/folders/${folderId}` : tutorHref(tutorId));
