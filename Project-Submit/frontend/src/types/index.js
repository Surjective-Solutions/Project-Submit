/**
 * @typedef {Object} StudentLoginPayload
 * @property {string} identifier - Email or contact number
 * @property {string} password
 */

/**
 * @typedef {Object} StudentStep1Payload
 * @property {string} firstName
 * @property {string} lastName
 * @property {string} contactNumber - Sri Lanka phone (+94XXXXXXXXX)
 * @property {string} dateOfBirth - ISO date string
 * @property {'Male'|'Female'|'Prefer not to say'} gender
 * @property {string} guardianName
 * @property {string} guardianContactNumber
 * @property {string} address
 * @property {string} [email]
 * @property {string} [whatsappNumber]
 * @property {string} [schoolName]
 * @property {string} [grade]
 * @property {'Maths'|'Bio'|'Commerce'|'Arts'|'Technology'} [subjectStream]
 * @property {string} [district]
 */

/**
 * @typedef {Object} StudentStep2Payload
 * @property {string} password
 * @property {string} confirmPassword
 * @property {boolean} [marketingConsent]
 * @property {true} termsAccepted
 */

/**
 * @typedef {StudentStep1Payload & StudentStep2Payload} StudentRegisterPayload
 */

/**
 * @typedef {Object} OtpPayload
 * @property {string} phone
 * @property {string} otp
 */

/**
 * @typedef {Object} InstructorLoginPayload
 * @property {string} email
 * @property {string} password
 */

/**
 * @typedef {Object} InstructorRegisterPayload
 * @property {string} fullName
 * @property {string} email
 * @property {string} contactNumber
 * @property {string} nicNumber
 * @property {string} address
 * @property {string} password
 * @property {string} confirmPassword
 * @property {true} termsAccepted
 */

/**
 * @typedef {Object} ApiResponse
 * @property {boolean} success
 * @property {string} message
 * @property {any} [data]
 */
