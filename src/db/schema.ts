import { pgTable, uuid, varchar, boolean, timestamp, integer, numeric, text, date, serial, decimal } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// 1. Users Table
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  fullName: varchar('full_name', { length: 150 }).notNull(),
  admissionNo: varchar('admission_no', { length: 50 }),
  email: varchar('email', { length: 150 }).unique().notNull(),
  phone: varchar('phone', { length: 20 }),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  role: varchar('role', { length: 30 }).notNull(), // Student, Trainer, Assessor, Internal Verifier, External Verifier, Administrator, client, provider
  courseId: integer('course_id'),
  hasConsentedToPrivacy: boolean('has_consented_to_privacy').default(true),
  privacyConsentTimestamp: timestamp('privacy_consent_timestamp', { withTimezone: true }),
  dataProtectionStatus: varchar('data_protection_status', { length: 30 }).default('ACTIVE'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

// 2. Courses Table
export const courses = pgTable('courses', {
  id: serial('id').primaryKey(),
  courseName: varchar('course_name', { length: 150 }).notNull(),
  level: varchar('level', { length: 30 }),
  duration: varchar('duration', { length: 30 }),
});

// 3. Units Table
export const units = pgTable('units', {
  id: serial('id').primaryKey(),
  unitCode: varchar('unit_code', { length: 30 }).unique(),
  unitName: varchar('unit_name', { length: 150 }),
  courseId: integer('course_id').references(() => courses.id, { onDelete: 'cascade' }),
});

// 4. Student Enrollments Table
export const enrollments = pgTable('enrollments', {
  id: serial('id').primaryKey(),
  studentId: uuid('student_id').references(() => users.id, { onDelete: 'cascade' }),
  unitId: integer('unit_id').references(() => units.id, { onDelete: 'cascade' }),
  enrolledOn: date('enrolled_on').defaultNow(),
});

// 5. Evidence Uploads Table
export const evidence = pgTable('evidence', {
  id: serial('id').primaryKey(),
  studentId: uuid('student_id').references(() => users.id, { onDelete: 'cascade' }),
  unitId: integer('unit_id').references(() => units.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 200 }),
  description: text('description'),
  fileUrl: text('file_url'),
  status: varchar('status', { length: 30 }).default('Pending'),
  uploadedAt: timestamp('uploaded_at', { withTimezone: true }).defaultNow(),
});

// 6. Assessments Table
export const assessments = pgTable('assessments', {
  id: serial('id').primaryKey(),
  evidenceId: integer('evidence_id').references(() => evidence.id, { onDelete: 'cascade' }),
  assessorId: uuid('assessor_id').references(() => users.id, { onDelete: 'cascade' }),
  result: varchar('result', { length: 50 }),
  score: decimal('score', { precision: 5, scale: 2 }),
  remarks: text('remarks'),
  assessedAt: timestamp('assessed_at', { withTimezone: true }).defaultNow(),
});

// 7. Verification Table
export const verification = pgTable('verification', {
  id: serial('id').primaryKey(),
  assessmentId: integer('assessment_id').references(() => assessments.id, { onDelete: 'cascade' }),
  verifierId: uuid('verifier_id').references(() => users.id, { onDelete: 'cascade' }),
  status: varchar('status', { length: 30 }),
  comments: text('comments'),
  verifiedAt: timestamp('verified_at', { withTimezone: true }).defaultNow(),
});

// 8. Notifications Table
export const notifications = pgTable('notifications', {
  id: serial('id').primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 150 }),
  message: text('message'),
  isRead: boolean('is_read').default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

// 9. Audit Logs Table
export const auditLogs = pgTable('audit_logs', {
  id: serial('id').primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
  action: text('action'),
  logTime: timestamp('log_time', { withTimezone: true }).defaultNow(),
});

// 10. Workspaces Table
export const workspaces = pgTable('workspaces', {
  id: uuid('id').primaryKey().defaultRandom(),
  ownerId: uuid('owner_id').references(() => users.id, { onDelete: 'cascade' }),
  workspaceName: varchar('workspace_name', { length: 100 }).notNull(),
  status: varchar('status', { length: 20 }).default('INACTIVE'),
  activatedAt: timestamp('activated_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

// 11. Project Attachments Table
export const projectAttachments = pgTable('project_attachments', {
  id: uuid('id').primaryKey().defaultRandom(),
  uploadedBy: uuid('uploaded_by').references(() => users.id, { onDelete: 'cascade' }),
  fileName: varchar('file_name', { length: 255 }).notNull(),
  storageUrl: varchar('storage_url', { length: 512 }).notNull(),
  mimeType: varchar('mime_type', { length: 100 }).notNull(),
  fileSizeBytes: integer('file_size_bytes').notNull(),
  securityScanStatus: varchar('security_scan_status', { length: 20 }).default('PENDING'),
  checksumSha256: varchar('checksum_sha256', { length: 64 }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

// 12. M-Pesa Transactions Audit Log Table
export const mpesaTransactions = pgTable('mpesa_transactions', {
  id: uuid('id').primaryKey().defaultRandom(),
  checkoutRequestId: varchar('checkout_request_id', { length: 100 }).unique().notNull(),
  merchantRequestId: varchar('merchant_request_id', { length: 100 }).notNull(),
  mpesaReceiptNumber: varchar('mpesa_receipt_number', { length: 50 }),
  amount: numeric('amount', { precision: 10, scale: 2 }).notNull(),
  phoneNumber: varchar('phone_number', { length: 20 }).notNull(),
  status: varchar('status', { length: 20 }).default('PENDING'),
  rawPayloadHash: varchar('raw_payload_hash', { length: 64 }).notNull(),
  verifiedAt: timestamp('verified_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  course: one(courses, { fields: [users.courseId], references: [courses.id] }),
  enrollments: many(enrollments),
  evidence: many(evidence),
  notifications: many(notifications),
  auditLogs: many(auditLogs),
  workspaces: many(workspaces),
  projectAttachments: many(projectAttachments),
}));

export const workspacesRelations = relations(workspaces, ({ one }) => ({
  owner: one(users, {
    fields: [workspaces.ownerId],
    references: [users.id],
  }),
}));

export const projectAttachmentsRelations = relations(projectAttachments, ({ one }) => ({
  uploader: one(users, {
    fields: [projectAttachments.uploadedBy],
    references: [users.id],
  }),
}));

export const coursesRelations = relations(courses, ({ many }) => ({
  units: many(units),
  users: many(users),
}));

export const unitsRelations = relations(units, ({ one, many }) => ({
  course: one(courses, { fields: [units.courseId], references: [courses.id] }),
  enrollments: many(enrollments),
  evidence: many(evidence),
}));

export const evidenceRelations = relations(evidence, ({ one, many }) => ({
  student: one(users, { fields: [evidence.studentId], references: [users.id] }),
  unit: one(units, { fields: [evidence.unitId], references: [units.id] }),
  assessments: many(assessments),
}));

export const assessmentsRelations = relations(assessments, ({ one, many }) => ({
  evidenceItem: one(evidence, { fields: [assessments.evidenceId], references: [evidence.id] }),
  assessor: one(users, { fields: [assessments.assessorId], references: [users.id] }),
  verifications: many(verification),
}));

export const verificationRelations = relations(verification, ({ one }) => ({
  assessment: one(assessments, { fields: [verification.assessmentId], references: [assessments.id] }),
  verifier: one(users, { fields: [verification.verifierId], references: [users.id] }),
}));

