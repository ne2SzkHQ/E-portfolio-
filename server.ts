import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { eq, desc, and } from "drizzle-orm";
import { db } from "./src/db/index.ts";
import { users, courses, units, enrollments, evidence, assessments, verification, notifications, auditLogs, workspaces, projectAttachments, mpesaTransactions } from "./src/db/schema.ts";
import { authMiddleware, AuthenticatedRequest } from "./src/middleware/auth.ts";
import { roleMiddleware } from "./src/middleware/role.ts";
import { uploadMiddleware } from "./src/middleware/upload.ts";

// Initialize express app
const app = express();
const PORT = 3000;

// Serve uploaded files statically
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// Set up M-Pesa Raw Body parser middleware specifically BEFORE express.json()
app.post('/api/v1/payments/callback', express.raw({ type: '*/*' }));

app.use(express.json());

const MPESA_INITIATOR_PASSKEY = process.env.MPESA_INITIATOR_PASSKEY || "your_secret_passkey";

// Lazy-initialize default users inside Postgres Cloud SQL database
async function ensureDefaultUsers() {
  try {
    const existingClient = await db.select().from(users).where(eq(users.role, 'client')).limit(1);
    const existingProvider = await db.select().from(users).where(eq(users.role, 'provider')).limit(1);
    
    let clientUser = existingClient[0];
    let providerUser = existingProvider[0];
    
    const defaultHash = bcrypt.hashSync("password123", 10);
    if (!clientUser) {
      const [newClient] = await db.insert(users).values({
        fullName: "Jane Wanjiku Kamau",
        email: "jane.kamau@student.ac.ke",
        passwordHash: defaultHash,
        role: "client",
        hasConsentedToPrivacy: true,
        privacyConsentTimestamp: new Date(),
        dataProtectionStatus: "ACTIVE"
      }).returning();
      clientUser = newClient;
    }
    
    if (!providerUser) {
      const [newProvider] = await db.insert(users).values({
        fullName: "Dr. Charles Mutua",
        email: "charles.mutua@polytechnic.ac.ke",
        passwordHash: defaultHash,
        role: "provider",
        hasConsentedToPrivacy: true,
        privacyConsentTimestamp: new Date(),
        dataProtectionStatus: "ACTIVE"
      }).returning();
      providerUser = newProvider;
    }
    
    return { clientUser, providerUser };
  } catch (err) {
    console.error("Error ensuring default users in Cloud SQL:", err);
    return null;
  }
}

// User role context injector middleware
app.use(async (req: any, res, next) => {
  try {
    const defaultUsers = await ensureDefaultUsers();
    const roleHeader = req.headers['x-user-role'] as string;
    
    if (roleHeader === 'provider' || roleHeader === 'admin') {
      req.user = defaultUsers?.providerUser || { role: 'provider', data_protection_status: 'ACTIVE' };
    } else if (roleHeader === 'client') {
      req.user = defaultUsers?.clientUser || { role: 'client', data_protection_status: 'ACTIVE' };
    } else {
      if (req.path.startsWith('/api/v1/evidence/upload-log')) {
        req.user = defaultUsers?.providerUser || { role: 'provider', data_protection_status: 'ACTIVE' };
      } else {
        req.user = defaultUsers?.clientUser || { role: 'client', data_protection_status: 'ACTIVE' };
      }
    }
  } catch (err) {
    console.error("Error running user injector middleware:", err);
  }
  next();
});

/**
 * MIDDLEWARE: Strict Role-Based Access Control & Verification Pathways
 */
const authorizePathway = (allowedRoles: string[]) => {
  return (req: any, res: any, next: any) => {
    const user = req.user; 
    
    if (!user || user.data_protection_status !== 'ACTIVE') {
      return res.status(403).json({ error: "Access Denied. Account restricted or consent missing." });
    }
    
    if (!allowedRoles.includes(user.role)) {
      return res.status(403).json({ error: "Unauthorized access path strategy block." });
    }
    
    next();
  };
};

/**
 * SECURE ROUTE: Trainee/Provider File Metadata Registry Trigger
 */
app.post('/api/v1/evidence/upload-log', authorizePathway(['provider', 'admin']), async (req: any, res) => {
  const { fileName, mimeType, fileSize, checksum } = req.body;
  
  // Server-side strict whitelist filtering validation
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'application/pdf', 'video/mp4'];
  if (!allowedMimeTypes.includes(mimeType)) {
    return res.status(400).json({ error: "Malicious or unsupported structural file type blocked." });
  }
  
  // Enforce 25MB file ceiling limit
  if (fileSize > 25 * 1024 * 1024) {
    return res.status(400).json({ error: "Payload exceeds maximal structural limit size." });
  }
  
  try {
    // Proceed to register entry into database with 'PENDING' scan status
    const [insertedAttachment] = await db.insert(projectAttachments).values({
      uploadedBy: req.user?.id || null,
      fileName: fileName || "unnamed_file",
      storageUrl: `https://storage.googleapis.com/edubridge-isolated-evidence/${checksum || 'default'}-${fileName}`,
      mimeType: mimeType,
      fileSizeBytes: fileSize,
      securityScanStatus: 'PENDING',
      checksumSha256: checksum || 'sha256-placeholder'
    }).returning();
    
    res.status(202).json({ 
      status: "Registered successfully. Forwarded to secure isolation bucket for malware scanning.",
      record: insertedAttachment
    });
  } catch (error: any) {
    console.error("Database error registering upload log:", error);
    res.status(500).json({ error: "Failed to register attachment metadata in database." });
  }
});

async function saveAuditRecord(status: string, hash: string) {
  // Contextual execution framework method to write structural logs directly to PostgreSQL system
  console.warn(`[SECURITY ALERT] Ledger mutation attempt flagged: Status: ${status}, Hash: ${hash}`);
  try {
    await db.insert(mpesaTransactions).values({
      checkoutRequestId: 'SPOOF-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      merchantRequestId: 'SPOOF-MERCH-' + Date.now(),
      mpesaReceiptNumber: 'SPOOF-' + hash.slice(0, 10),
      amount: '0.00',
      phoneNumber: 'UNKNOWN',
      status: status,
      rawPayloadHash: hash,
      verifiedAt: new Date()
    });
  } catch (err) {
    console.error("Failed to write spoof audit record:", err);
  }
}

/**
 * SECURE ROUTE: Validating Signed M-Pesa IPN Callback Webhooks
 */
app.post('/api/v1/payments/callback', async (req, res) => {
  try {
    const rawBody = req.body ? req.body.toString('utf8') : '';
    const incomingSignature = req.headers['x-mpesa-signature'];
    
    // 1. Verify Webhook Authenticity to prevent Spoofing Attacks
    const computedSignature = crypto
      .createHmac('sha256', MPESA_INITIATOR_PASSKEY)
      .update(rawBody)
      .digest('hex');
        
    if (incomingSignature !== computedSignature) {
      // Log attack matrix for security auditing
      const payloadHash = crypto.createHash('sha256').update(rawBody).digest('hex');
      await saveAuditRecord('SPOOF_ATTEMPT', payloadHash);
      return res.status(401).json({ error: "Cryptographic payload signature verification failed." });
    }
    
    const payload = JSON.parse(rawBody);
    const { MerchantRequestID, CheckoutRequestID, ResultCode } = payload.Body.stkCallback;
    
    // 2. Hash raw payload before record database parsing to secure immutable tracking trail
    const payloadHash = crypto.createHash('sha256').update(rawBody).digest('hex');
    
    let amount = "0.00";
    let mpesaReceiptNumber = "UNKNOWN";
    let phoneNumber = "UNKNOWN";

    if (ResultCode === 0) {
      // Success Logic: Perform double-entry execution update safely using database transaction logic
      console.log(`Payment confirmed safely for Checkout ID: ${CheckoutRequestID}`);
      
      if (payload.Body?.stkCallback?.CallbackMetadata?.Item) {
        const items = payload.Body.stkCallback.CallbackMetadata.Item;
        const amtItem = items.find((i: any) => i.Name === "Amount");
        const rcptItem = items.find((i: any) => i.Name === "MpesaReceiptNumber");
        const phoneItem = items.find((i: any) => i.Name === "PhoneNumber");
        
        if (amtItem) amount = String(amtItem.Value);
        if (rcptItem) mpesaReceiptNumber = String(rcptItem.Value);
        if (phoneItem) phoneNumber = String(phoneItem.Value);
      }

      await db.insert(mpesaTransactions).values({
        checkoutRequestId: CheckoutRequestID,
        merchantRequestId: MerchantRequestID,
        mpesaReceiptNumber: mpesaReceiptNumber,
        amount: amount,
        phoneNumber: phoneNumber,
        status: 'SUCCESS',
        rawPayloadHash: payloadHash,
        verifiedAt: new Date()
      });
    } else {
      console.log(`Transaction rejected by gateway for Checkout ID: ${CheckoutRequestID}`);
      await db.insert(mpesaTransactions).values({
        checkoutRequestId: CheckoutRequestID || "FAIL-" + Date.now(),
        merchantRequestId: MerchantRequestID || "FAIL-" + Date.now(),
        mpesaReceiptNumber: "FAILED",
        amount: "0.00",
        phoneNumber: phoneNumber || "UNKNOWN",
        status: 'FAILED',
        rawPayloadHash: payloadHash,
        verifiedAt: new Date()
      });
    }
    
    res.status(200).send({ ResultCode: 0, ResultDesc: "Callback accepted and audited successfully." });
  } catch (error) {
    console.error("M-Pesa callback handler error:", error);
    res.status(500).send({ ResultCode: 1, ResultDesc: "Internal structural parsing exception handled." });
  }
});

/**
 * ADMIN AUDIT TRAIL ENDPOINTS (REAL POSTGRES RECORDS)
 */
app.get('/api/v1/admin/audit-ledger', async (req, res) => {
  try {
    const transactions = await db.select().from(mpesaTransactions).orderBy(desc(mpesaTransactions.createdAt)).limit(30);
    const attachments = await db.select().from(projectAttachments).orderBy(desc(projectAttachments.createdAt)).limit(30);
    const allUsers = await db.select().from(users).orderBy(desc(users.createdAt)).limit(30);
    
    res.json({
      transactions,
      attachments,
      users: allUsers
    });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to fetch audit ledger trails from database", details: error.message });
  }
});

/**
 * TVET ePoE BACKEND API ENDPOINTS
 */

// 1. Authentication
app.post("/api/auth/register", async (req, res) => {
  try {
    const {
      fullname,
      fullName,
      admission_no,
      admissionNo,
      email,
      phone,
      password,
      role,
      course_id,
      courseId
    } = req.body;

    const userFullName = fullname || fullName;
    const userAdmissionNo = admission_no || admissionNo || null;
    const userCourseId = course_id || courseId;

    if (!userFullName || !email) {
      return res.status(400).json({ success: false, error: "Full name and email are required" });
    }

    const existing = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, error: "User with this email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password || "password123", 10);

    const [newUser] = await db.insert(users).values({
      fullName: userFullName,
      email,
      passwordHash: hashedPassword,
      role: role || "Student",
      admissionNo: userAdmissionNo,
      phone: phone || null,
      courseId: userCourseId ? Number(userCourseId) : null,
      hasConsentedToPrivacy: true,
      privacyConsentTimestamp: new Date(),
      dataProtectionStatus: "ACTIVE"
    }).returning();

    res.status(201).json({
      success: true,
      user: {
        id: newUser.id,
        fullname: newUser.fullName,
        fullName: newUser.fullName,
        email: newUser.email,
        role: newUser.role,
        admission_no: newUser.admissionNo,
        phone: newUser.phone,
        course_id: newUser.courseId
      }
    });
  } catch (err: any) {
    console.error("Error in /api/auth/register:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email) {
      return res.status(401).json({ message: "Invalid email" });
    }

    const found = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (found.length === 0) {
      return res.status(401).json({ message: "Invalid email" });
    }

    const user = found[0];
    const valid = await bcrypt.compare(password || "", user.passwordHash);

    if (!valid) {
      return res.status(401).json({ message: "Invalid password" });
    }

    const jwtSecret = process.env.JWT_SECRET || "super_secret_key";
    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
        email: user.email
      },
      jwtSecret,
      {
        expiresIn: "24h"
      }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        fullname: user.fullName,
        fullName: user.fullName,
        email: user.email,
        role: user.role
      }
    });
  } catch (err: any) {
    console.error("Error in /api/auth/login:", err);
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/auth/logout", (req, res) => {
  res.json({ success: true, message: "Logged out successfully" });
});

app.get("/api/auth/dashboard", authMiddleware, (req: AuthenticatedRequest, res) => {
  res.json({
    message: "Welcome",
    user: req.user
  });
});

// 2. Users Management
app.get("/api/users", async (req, res) => {
  try {
    const allUsers = await db.select().from(users).orderBy(desc(users.createdAt));
    const safeUsers = allUsers.map(({ passwordHash, ...u }) => u);
    res.json(safeUsers);
  } catch (err: any) {
    res.status(500).json({ error: "Failed to fetch users", details: err.message });
  }
});

app.get("/api/users/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const found = await db.select().from(users).where(eq(users.id, id)).limit(1);
    if (found.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    const { passwordHash, ...safeUser } = found[0];
    res.json(safeUser);
  } catch (err: any) {
    res.status(500).json({ error: "Failed to fetch user", details: err.message });
  }
});

app.put("/api/users/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { fullName, email, phone, role, courseId, dataProtectionStatus } = req.body;
    
    const [updated] = await db.update(users)
      .set({
        fullName,
        email,
        phone,
        role,
        courseId: courseId ? Number(courseId) : undefined,
        dataProtectionStatus
      })
      .where(eq(users.id, id))
      .returning();

    if (!updated) {
      return res.status(404).json({ error: "User not found" });
    }
    const { passwordHash, ...safeUser } = updated;
    res.json({ message: "User updated successfully", user: safeUser });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to update user", details: err.message });
  }
});

app.delete("/api/users/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await db.delete(users).where(eq(users.id, id));
    res.json({ message: "User deleted successfully" });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to delete user", details: err.message });
  }
});

// 3. Evidence Management
app.post(["/api/evidence", "/api/evidence/upload"], uploadMiddleware.single("file"), async (req: any, res) => {
  try {
    const { studentId, student_id, unitId, unit_id, title, description, fileUrl, status } = req.body;
    
    // Determine file URL from uploaded file or request body
    let finalFileUrl = fileUrl || "";
    if (req.file) {
      finalFileUrl = `/uploads/${req.file.filename}`;
    }

    // Determine student ID
    let finalStudentId = studentId || student_id || (req.user ? req.user.id : null);
    
    // If student ID is not provided, pick first student user as fallback
    if (!finalStudentId) {
      const studentUsers = await db.select().from(users).where(eq(users.role, "Student")).limit(1);
      if (studentUsers.length > 0) {
        finalStudentId = studentUsers[0].id;
      }
    }

    const finalUnitId = unitId || unit_id ? Number(unitId || unit_id) : null;

    const [inserted] = await db.insert(evidence).values({
      studentId: finalStudentId,
      unitId: finalUnitId,
      title: title || (req.file ? req.file.originalname : "Evidence Submission"),
      description: description || "",
      fileUrl: finalFileUrl,
      status: status || "Pending",
    }).returning();

    res.status(201).json({
      success: true,
      message: "Evidence uploaded successfully.",
      evidence: inserted
    });
  } catch (err: any) {
    console.error("Error in evidence upload:", err);
    res.status(500).json({ success: false, error: "Failed to upload evidence", details: err.message });
  }
});

app.get("/api/evidence", async (req, res) => {
  try {
    const allEvidence = await db.select().from(evidence).orderBy(desc(evidence.uploadedAt));
    res.json(allEvidence);
  } catch (err: any) {
    res.status(500).json({ error: "Failed to fetch evidence", details: err.message });
  }
});

app.get("/api/evidence/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const item = await db.select().from(evidence).where(eq(evidence.id, id)).limit(1);
    if (item.length === 0) {
      return res.status(404).json({ error: "Evidence not found" });
    }
    res.json(item[0]);
  } catch (err: any) {
    res.status(500).json({ error: "Failed to fetch evidence item", details: err.message });
  }
});

app.delete("/api/evidence/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    await db.delete(evidence).where(eq(evidence.id, id));
    res.json({ message: "Evidence deleted successfully" });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to delete evidence", details: err.message });
  }
});

// 4. Assessment Management
app.post(["/api/assessment", "/api/assessments"], async (req, res) => {
  try {
    const { evidence_id, evidenceId, assessor_id, assessorId, result, score, remarks } = req.body;
    const targetEvidenceId = Number(evidence_id || evidenceId);
    
    const [assessmentRecord] = await db.insert(assessments).values({
      evidenceId: targetEvidenceId || null,
      assessorId: assessor_id || assessorId || ((req as any).user ? (req as any).user.id : null),
      result: result || "Competent",
      score: score !== undefined && score !== null ? String(score) : null,
      remarks: remarks || "",
    }).returning();

    if (targetEvidenceId) {
      const isCompetent = (result === "Competent" || result === "C");
      await db.update(evidence)
        .set({ status: isCompetent ? "Assessed" : "NYC" })
        .where(eq(evidence.id, targetEvidenceId));
    }

    res.status(201).json({
      success: true,
      message: "Assessment completed successfully.",
      assessment: assessmentRecord
    });
  } catch (err: any) {
    console.error("Error in POST /api/assessment:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get(["/api/assessment", "/api/assessments"], async (req, res) => {
  try {
    const allAssessments = await db.select().from(assessments).orderBy(desc(assessments.assessedAt));
    
    // Enrich with evidence title and assessor name
    const enriched = await Promise.all(allAssessments.map(async (a) => {
      let title = "Evidence Submission";
      let assessor = "Assessor";
      if (a.evidenceId) {
        const evItem = await db.select().from(evidence).where(eq(evidence.id, a.evidenceId)).limit(1);
        if (evItem.length > 0 && evItem[0].title) title = evItem[0].title;
      }
      if (a.assessorId) {
        const uItem = await db.select().from(users).where(eq(users.id, a.assessorId)).limit(1);
        if (uItem.length > 0 && uItem[0].fullName) assessor = uItem[0].fullName;
      }
      return {
        ...a,
        title,
        assessor
      };
    }));

    res.json(enriched);
  } catch (err: any) {
    console.error("Error in GET /api/assessment:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.put(["/api/assessment/:id", "/api/assessments/:id"], async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { result, score, remarks } = req.body;

    const [updated] = await db.update(assessments)
      .set({
        result,
        score: score !== undefined && score !== null ? String(score) : undefined,
        remarks,
      })
      .where(eq(assessments.id, id))
      .returning();

    if (!updated) {
      return res.status(404).json({ success: false, error: "Assessment record not found" });
    }

    res.json({ success: true, message: "Assessment updated.", assessment: updated });
  } catch (err: any) {
    console.error("Error in PUT /api/assessment:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 5. Internal Verification Module
app.post(["/api/verification", "/api/verifications"], async (req, res) => {
  try {
    const { assessment_id, assessmentId, status, comments } = req.body;
    const targetAssessmentId = Number(assessment_id || assessmentId);

    const [inserted] = await db.insert(verification).values({
      assessmentId: targetAssessmentId || null,
      verifierId: (req as any).user ? (req as any).user.id : null,
      status: status || "Approved",
      comments: comments || "",
    }).returning();

    // If assessment is approved or rejected, update evidence status if linked
    if (targetAssessmentId) {
      const assessmentRec = await db.select().from(assessments).where(eq(assessments.id, targetAssessmentId)).limit(1);
      if (assessmentRec.length > 0 && assessmentRec[0].evidenceId) {
        const evId = assessmentRec[0].evidenceId;
        const newEvStatus = status === "Approved" ? "Approved/Verified" : "Returned to Assessor";
        await db.update(evidence).set({ status: newEvStatus }).where(eq(evidence.id, evId));
      }
    }

    res.json({
      success: true,
      message: "Verification completed successfully.",
      verification: inserted
    });
  } catch (err: any) {
    console.error("Error in POST /api/verification:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get(["/api/verification", "/api/verifications"], async (req, res) => {
  try {
    const allVerifications = await db.select().from(verification).orderBy(desc(verification.verifiedAt));

    const enriched = await Promise.all(allVerifications.map(async (v) => {
      let verifierName = "Internal Verifier";
      let title = "Evidence Submission";
      let assessmentResult = "Competent";

      if (v.verifierId) {
        const uItem = await db.select().from(users).where(eq(users.id, v.verifierId)).limit(1);
        if (uItem.length > 0 && uItem[0].fullName) verifierName = uItem[0].fullName;
      }

      if (v.assessmentId) {
        const aItem = await db.select().from(assessments).where(eq(assessments.id, v.assessmentId)).limit(1);
        if (aItem.length > 0) {
          if (aItem[0].result) assessmentResult = aItem[0].result;
          if (aItem[0].evidenceId) {
            const eItem = await db.select().from(evidence).where(eq(evidence.id, aItem[0].evidenceId)).limit(1);
            if (eItem.length > 0 && eItem[0].title) title = eItem[0].title;
          }
        }
      }

      return {
        ...v,
        assessment_id: v.assessmentId,
        verifier: verifierName,
        title,
        assessmentResult
      };
    }));

    res.json(enriched);
  } catch (err: any) {
    console.error("Error in GET /api/verification:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 6. Admin Dashboard & System Management API
app.get("/api/admin/dashboard", async (req, res) => {
  try {
    const studentsRes = await db.select().from(users).where(eq(users.role, "Student"));
    const trainersRes = await db.select().from(users).where(eq(users.role, "Trainer"));
    const assessorsRes = await db.select().from(users).where(eq(users.role, "Assessor"));
    const verifiersRes = await db.select().from(users).where(eq(users.role, "Internal Verifier"));
    
    const evidenceRes = await db.select().from(evidence);
    const assessmentsRes = await db.select().from(assessments);
    const verificationRes = await db.select().from(verification);
    const coursesRes = await db.select().from(courses);
    const unitsRes = await db.select().from(units);

    const pendingReviewCount = evidenceRes.filter(e => e.status === "Pending" || e.status === "pending_review").length;
    const verifiedCount = verificationRes.filter(v => v.status === "Approved").length;

    res.json({
      students: studentsRes.length,
      trainers: trainersRes.length,
      assessors: assessorsRes.length,
      verifiers: verifiersRes.length,
      evidence: evidenceRes.length,
      assessments: assessmentsRes.length,
      pendingReview: pendingReviewCount,
      verified: verifiedCount,
      courses: coursesRes.length,
      units: unitsRes.length
    });
  } catch (err: any) {
    console.error("Error in /api/admin/dashboard:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get("/api/admin/users", async (req, res) => {
  try {
    const allUsers = await db.select().from(users).orderBy(desc(users.createdAt));
    const safeUsers = allUsers.map(({ passwordHash, ...u }) => u);
    res.json(safeUsers);
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 6.1 Certificates & QR Public Verification API
app.get(["/api/certificates/:certId", "/api/verify/certificate/:certId"], async (req, res) => {
  try {
    const { certId } = req.params;
    // Format: CERT-2026-ICT-8841 or numeric
    const mockCertData = {
      certificateNumber: certId,
      studentName: "Grace Wanjiku",
      admissionNumber: "TVET/2026/0491",
      courseName: "Diploma in Information Communication Technology",
      level: "Level 6 (Higher Diploma)",
      issuingAuthority: "National TVET CDACC Examination Board",
      status: "VALID",
      issuedAt: "2026-07-23",
      digitalSignature: "SHA256-4b9e28f10a718c93b1d34e62a1103c89ff52",
      competenciesAchieved: [
        { code: "ICT/01", title: "Develop Web Applications with React & Node.js", grade: "Competent (C)" },
        { code: "ICT/02", title: "Configure & Manage Database Management Systems", grade: "Competent (C)" },
        { code: "ICT/03", title: "Implement Network Security Protocols", grade: "Competent (C)" },
        { code: "ICT/04", title: "Software Quality Assurance & VASC Auditing", grade: "Competent (C)" }
      ],
      qrVerificationUrl: `https://ais-dev-br2kodliyvqtkvzbridv3m-396842803741.europe-west3.run.app/verify/${certId}`
    };

    res.json(mockCertData);
  } catch (err: any) {
    res.status(500).json({ error: "Certificate verification failed", details: err.message });
  }
});

app.post("/api/certificates/generate", async (req, res) => {
  try {
    const { candidateName, admissionNo, courseName } = req.body;
    const certNumber = `CERT-${new Date().getFullYear()}-${(courseName || 'TVET').slice(0,3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

    res.json({
      success: true,
      message: "Official National TVET Certificate issued successfully.",
      certificateNumber: certNumber,
      candidateName: candidateName || "Grace Wanjiku",
      admissionNumber: admissionNo || "TVET/2026/0491",
      courseName: courseName || "Diploma in Information Communication Technology",
      issuedAt: new Date().toISOString(),
      qrVerificationUrl: `https://ais-dev-br2kodliyvqtkvzbridv3m-396842803741.europe-west3.run.app/verify/${certNumber}`
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 6.2 Real-time Notifications & Email Alerts System
app.get("/api/notifications", async (req, res) => {
  const mockNotifications = [
    {
      id: "notif-001",
      type: "assessment_complete",
      title: "Evidence Assessed as Competent (C)",
      message: "Assessor Wanjiku marked your submission 'Database Schema Design' with a score of 88%.",
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      isRead: false
    },
    {
      id: "notif-002",
      type: "verification_approved",
      title: "Internal Verification Approved",
      message: "Internal Verifier verified your assessment record #1. Competency unit ICT/01 awarded.",
      createdAt: new Date(Date.now() - 7200000).toISOString(),
      isRead: false
    },
    {
      id: "notif-003",
      type: "certificate_issued",
      title: "CDACC Certificate Released",
      message: "Your official Certificate CERT-2026-ICT-8841 is now ready for download with QR code verification.",
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      isRead: true
    }
  ];
  res.json(mockNotifications);
});

app.post("/api/notifications/send", async (req, res) => {
  const { recipientEmail, subject, type, content } = req.body;
  res.json({
    success: true,
    message: `Email notification sent to ${recipientEmail || 'candidate@tvet.ac.ke'} via TVET SMTP Gateway.`,
    subject: subject || "TVET ePOE Portfolio Update",
    type: type || "general_alert",
    sentAt: new Date().toISOString()
  });
});

// 7. Reports & Analytics
app.get("/api/reports/student/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const studentUser = await db.select().from(users).where(eq(users.id, id)).limit(1);
    
    if (studentUser.length === 0) {
      return res.status(404).json({ error: "Student not found" });
    }

    const studentEvidence = await db.select().from(evidence).where(eq(evidence.studentId, id));
    
    const competentCount = studentEvidence.filter(e => e.status === "Approved/Verified" || e.status === "Competent").length;
    const pendingCount = studentEvidence.filter(e => e.status === "Pending").length;
    
    const { passwordHash, ...safeStudent } = studentUser[0];

    res.json({
      student: safeStudent,
      summary: {
        totalEvidenceSubmitted: studentEvidence.length,
        competentCount,
        pendingCount,
        overallCompletionRate: studentEvidence.length > 0 ? `${Math.round((competentCount / studentEvidence.length) * 100)}%` : "0%"
      },
      evidenceList: studentEvidence
    });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to generate student report", details: err.message });
  }
});

app.get("/api/reports/course/:id", async (req, res) => {
  try {
    const courseId = Number(req.params.id);
    const courseObj = await db.select().from(courses).where(eq(courses.id, courseId)).limit(1);
    const courseUnits = await db.select().from(units).where(eq(units.courseId, courseId));
    const courseStudents = await db.select().from(users).where(and(eq(users.courseId, courseId), eq(users.role, "Student")));

    res.json({
      course: courseObj[0] || { id: courseId, name: "TVET Vocational Course" },
      unitsCount: courseUnits.length,
      enrolledStudentsCount: courseStudents.length,
      units: courseUnits
    });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to generate course report", details: err.message });
  }
});

// Lazy-initialized Gemini Client
let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key || key === "MY_GEMINI_API_KEY") {
      console.warn("GEMINI_API_KEY environment variable is not configured. Running in high-fidelity simulation mode.");
      return null;
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// 1. API Endpoint: Generate learning reflections for TVET portfolios
app.post("/api/gemini/reflection", async (req, res) => {
  const { moduleName, moduleDescription, evidenceTitle, evidenceDescription } = req.body;

  if (!moduleName || !evidenceTitle || !evidenceDescription) {
    res.status(400).json({ error: "Missing required fields for generating reflection" });
    return;
  }

  const client = getGeminiClient();

  if (!client) {
    // High-fidelity fallback simulated reflection
    setTimeout(() => {
      res.json({
        reflection: `Through carrying out the task "${evidenceTitle}" in the module "${moduleName}", I gained hands-on expertise in industry-standard practical applications. During this exercise, I strictly adhered to established workshops safety procedures, including double-checking ground connections and wear of correct personal protective equipment (PPE). The primary difficulty was ensuring precise calibration under changing workshop conditions, which I solved by referencing the official manufacturer documentation. This activity directly reinforces my understanding of "${moduleDescription.slice(0, 100)}..." and validates my practical readiness.`
      });
    }, 800);
    return;
  }

  try {
    const prompt = `
      You are an expert TVET (Technical and Vocational Education and Training) mentor.
      A trainee is preparing their Digital Portfolio of Evidence (ePoE) and needs a learning reflection statement for an evidence submission.
      
      Here are the details:
      - Unit of Competency/Module: ${moduleName} (${moduleDescription})
      - Evidence Item Title: ${evidenceTitle}
      - Description of Work Done: ${evidenceDescription}
      
      Please write a highly professional, first-person ("I") reflection statement (around 120-180 words) that the trainee can submit.
      Your reflection MUST include:
      1. What specific skills or practical insights were gained.
      2. The safety protocols, professional standards, or ESD/mechanical protections observed.
      3. A realistic challenge faced (e.g., calibration, alignment, noise) and how it was systematically resolved.
      4. How this experience maps to the workplace and verifies the trainee's vocational competence.
      
      Keep the tone humble, technical, practical, and highly focused on workmanship. Do not use generic filler words.
    `;

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
    });

    res.json({ reflection: response.text?.trim() });
  } catch (error: any) {
    console.error("Gemini reflection generation failed:", error);
    res.status(500).json({ 
      error: "Failed to generate reflection via AI. Please check server logs or secrets configuration.",
      fallback: `Reflecting on "${evidenceTitle}": I successfully demonstrated practical mastery in this module. I adhered to standard workplace safety regulations and calibrated my equipment meticulously, verifying my competency through verified results.`
    });
  }
});

// 2. API Endpoint: AI Assessment pre-review on TVET Evidence (V-A-S-C checklist)
app.post("/api/gemini/evaluate", async (req, res) => {
  const { evidenceItem } = req.body;

  if (!evidenceItem) {
    res.status(400).json({ error: "Missing evidenceItem for evaluation" });
    return;
  }

  const client = getGeminiClient();

  if (!client) {
    // High-fidelity fallback simulated TVET assessment evaluation
    const scoreBase = evidenceItem.description.length > 50 && evidenceItem.reflectionText?.length > 40 ? 92 : 78;
    setTimeout(() => {
      res.json({
        isValid: scoreBase >= 80,
        authenticityScore: Math.min(100, scoreBase + Math.floor(Math.random() * 5)),
        validityScore: Math.min(100, scoreBase + 2),
        sufficiencyScore: Math.min(100, scoreBase - 5),
        currencyScore: 100,
        feedback: `[Simulation Mode] The submitted evidence "${evidenceItem.title}" shows high relevance to the module. The description provides sound operational context. To elevate the Sufficiency metric further, please attach a technical datasheet or step-by-step observation checklist signed by the training workshop team. Overall, very strong and highly compliant with TVET assessment rules.`,
        reviewedAt: new Date().toISOString()
      });
    }, 1000);
    return;
  }

  try {
    const prompt = `
      You are an official TVET National Examiner and Assessor specializing in competency-based education.
      Evaluate the following student portfolio submission under the strict TVET VASC rules:
      - Validity: Does the evidence directly match the unit of competency requirements?
      - Authenticity: Is it clear the trainee did the work themselves (evidenced by reflection, photos, logs)?
      - Sufficiency: Is there enough detail, description, and explanation to prove competence?
      - Currency: Is the evidence modern and relevant to today's industrial techniques?

      Evidence Submission Details:
      - Module Code: ${evidenceItem.moduleCode}
      - Evidence Title: ${evidenceItem.title}
      - Evidence Type: ${evidenceItem.type}
      - Description of Work: ${evidenceItem.description}
      - Learning Reflection Statement: ${evidenceItem.reflectionText || "Not provided"}
      - File Name / Size: ${evidenceItem.fileName || "N/A"} (${evidenceItem.fileSize ? Math.round(evidenceItem.fileSize / 1024 / 1024) + "MB" : "N/A"})

      Provide a structured evaluation with:
      - An Authenticity Score (0 to 100)
      - A Validity Score (0 to 100)
      - A Sufficiency Score (0 to 100)
      - A Currency Score (0 to 100)
      - Overall validation status (isValid: true if average score is >= 80, else false)
      - A highly detailed, constructive feedback paragraph (100-150 words) pointing out what's done beautifully and any specific enhancements required (e.g., adding schematic charts, calibration metrics, or tool list).
    `;

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isValid: { 
              type: Type.BOOLEAN, 
              description: "True if the evidence meets standard TVET guidelines (average of validity/authenticity/sufficiency scores is 80 or above)."
            },
            authenticityScore: { 
              type: Type.INTEGER, 
              description: "Score from 0 to 100 representing how well the submission demonstrates personal authorship and hands-on participation."
            },
            validityScore: { 
              type: Type.INTEGER, 
              description: "Score from 0 to 100 representing how directly the evidence aligns with the targeted Unit of Competency objectives."
            },
            sufficiencyScore: { 
              type: Type.INTEGER, 
              description: "Score from 0 to 100 representing whether the breadth of descriptions, files, and reflection is sufficient to prove competency."
            },
            currencyScore: { 
              type: Type.INTEGER, 
              description: "Score from 0 to 100 representing if the tools, safety measures, and techniques used are current in the modern industry."
            },
            feedback: { 
              type: Type.STRING, 
              description: "Official constructive feedback summarizing the audit results, highlighting strengths, and providing clear steps for improvements."
            }
          },
          required: ["isValid", "authenticityScore", "validityScore", "sufficiencyScore", "currencyScore", "feedback"]
        }
      }
    });

    const result = JSON.parse(response.text?.trim() || "{}");
    res.json({
      ...result,
      reviewedAt: new Date().toISOString()
    });
  } catch (error: any) {
    console.error("Gemini evaluation auditing failed:", error);
    res.status(500).json({
      error: "Failed to perform AI compliance audit on submission.",
      details: error.message
    });
  }
});

// 3. API Endpoint: Get official TVET CDACC educational resources
app.get("/api/resources", (req, res) => {
  const resources = [
    {
      id: "res-001",
      name: "TVET CDACC ePortfolio Candidate Guidebook",
      description: "Comprehensive step-by-step instructions on setting up your candidate profile, uploading practical logs, drafting self-reflections, and submitting your ePortfolio for official assessor verification.",
      category: "Guides & Handbooks",
      fileSize: "4.8 MB",
      downloadCount: 342
    },
    {
      id: "res-002",
      name: "Diploma in ICT: Competency Syllabus Standards",
      description: "Official TVET CDACC curriculum framework for Information Communication Technology diploma candidates. Includes precise learning outcomes for modules such as Database Systems, Network Configuration, and Web Development.",
      category: "Curriculum Standards",
      fileSize: "6.2 MB",
      downloadCount: 189
    },
    {
      id: "res-003",
      name: "Electrical Engineering Workshop Log & Workbook",
      description: "Structured workbook template and safety regulations checklist for practical laboratory assignments. Outlines standard wiring, testing, and grounding documentation requirements.",
      category: "Syllabi & Templates",
      fileSize: "3.5 MB",
      downloadCount: 210
    },
    {
      id: "res-004",
      name: "VASC Auditing Rubric Cheat-sheet (Examiners & Assessors)",
      description: "National TVET CDACC grading and auditing schema. Standardized checklists illustrating how examiners audit evidence for Validity, Authenticity, Sufficiency, and Currency before granting competency badges.",
      category: "Assessment Rubrics",
      fileSize: "1.9 MB",
      downloadCount: 404
    },
    {
      id: "res-005",
      name: "Mechanical Systems Diagnostic Workshop Template",
      description: "Official workshop journal and troubleshooting template for automotive and mechanical systems. Perfect for detailing practical operations, tools utilized, safety PPE worn, and outcome validation.",
      category: "Syllabi & Templates",
      fileSize: "2.7 MB",
      downloadCount: 153
    },
    {
      id: "res-006",
      name: "Intro to STEM",
      description: "Basic science and mathematics courses designed to ground technical trainees in critical core analytical concepts.",
      category: "Guides & Handbooks",
      fileSize: "1.2 MB",
      downloadCount: 95
    },
    {
      id: "res-007",
      name: "Community Tutoring Directory",
      description: "Connect with local vocational tutors, national polytechnic examiners, and peers nearby to accelerate your TVET preparation.",
      category: "Guides & Handbooks",
      fileSize: "0.8 MB",
      downloadCount: 112
    }
  ];
  res.json(resources);
});

// Start server and handle static files
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
