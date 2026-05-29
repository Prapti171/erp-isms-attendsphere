const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { execSync } = require("child_process");

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || "attendsphere-super-secret-key";
const DATA_FILE = path.join(__dirname, "data", "store.json");

app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.static(path.join(__dirname, "public")));

const ensureStore = () => {
  if (!fs.existsSync(DATA_FILE)) {
    execSync("node scripts/generate-store.js", { cwd: __dirname, stdio: "inherit" });
  }
};
ensureStore();

let memoryStore = null;
const readStore = () => {
  if (memoryStore) return memoryStore;
  memoryStore = JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
  return memoryStore;
};
const writeStore = (data) => {
  memoryStore = data;
  if (!process.env.VERCEL) fs.writeFileSync(DATA_FILE, JSON.stringify(data));
};
const mkHash = (p) => bcrypt.hashSync(p, 10);

const tokenFor = (u) =>
  jwt.sign({ sub: u.id, role: u.role, name: u.name, enrollment: u.enrollment }, JWT_SECRET, {
    expiresIn: "12h"
  });

const auth = (req, res, next) => {
  try {
    const token = (req.headers.authorization || "").replace("Bearer ", "");
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ message: "Unauthorized" });
  }
};

const safeUser = (u) => ({
  id: u.id,
  name: u.name,
  role: u.role,
  enrollment: u.enrollment,
  branch: u.branch,
  course: u.course,
  phone: u.phone,
  photo: u.photo
});

const branchPrefix = (branch, course) => {
  if ((course || "").includes("M.Tech")) return "MT";
  if (branch === "ECE") return "EC";
  if (branch === "Civil") return "CV";
  return branch;
};

const nextEnrollmentForBranch = (store, branch, course) => {
  const prefix = branchPrefix(branch, course);
  const nums = store.users
    .filter((u) => u.role === "student" && String(u.enrollment || "").startsWith(prefix))
    .map((u) => Number(String(u.enrollment).replace(prefix, "")))
    .filter((n) => !Number.isNaN(n));
  const next = (nums.length ? Math.max(...nums) : 1000) + 1;
  return `${prefix}${next}`;
};

const attendanceSummary = (records) => {
  const total = records.length;
  const present = records.filter((r) => r.status === "P").length;
  const percent = total ? Number(((present / total) * 100).toFixed(2)) : 0;
  const byMonth = {};
  records.forEach((r) => {
    const month = r.month || String(r.date).slice(0, 7);
    if (!byMonth[month]) byMonth[month] = { month, records: [], present: 0, absent: 0 };
    byMonth[month].records.push(r);
    if (r.status === "P") byMonth[month].present += 1;
    else byMonth[month].absent += 1;
  });
  const months = Object.values(byMonth).map((m) => ({
    month: m.month,
    present: m.present,
    absent: m.absent,
    total: m.present + m.absent,
    percent: m.present + m.absent ? Number(((m.present / (m.present + m.absent)) * 100).toFixed(2)) : 0,
    records: m.records.sort((a, b) => a.date.localeCompare(b.date))
  }));
  return { total, present, absent: total - present, percent, byMonth: months };
};

app.post("/api/auth/signup", (req, res) => {
  const { name, enrollment, role, password, branch, course } = req.body;
  if (!name || !role || !password) return res.status(400).json({ message: "Required: name, role, password" });
  const store = readStore();
  const finalEnrollment =
    enrollment ||
    (role === "student" ? nextEnrollmentForBranch(store, branch || "CSE", course || "B.Tech CSE") : `USR${store.users.length + 100}`);
  if (store.users.some((u) => u.enrollment.toLowerCase() === String(finalEnrollment).toLowerCase())) {
    return res.status(409).json({ message: "Enrollment already exists." });
  }
  const idPrefix = role === "admin" ? "ADM" : role === "faculty" ? "FAC" : "STD";
  const id = `${idPrefix}-${String(store.users.length + 1).padStart(4, "0")}`;
  const photo = `/assets/faces/face-${String((store.users.length % 28) + 1).padStart(2, "0")}.png`;
  const newUser = {
    id,
    name,
    role,
    enrollment: finalEnrollment,
    email: req.body.email || "",
    phone: req.body.phone || "NA",
    branch: branch || "CSE",
    course: course || "B.Tech CSE",
    passwordHash: mkHash(password),
    photo,
    fatherName: req.body.fatherName || "NA",
    motherName: req.body.motherName || "NA",
    dob: req.body.dob || "01/01/2002"
  };
  store.users.push(newUser);
  if (role === "student") {
    store.fees.push({ studentId: id, total: 70000, paid: 0, newCharges: 0, nextSemesterFee: 30000 });
    ["I", "II", "III", "IV"].forEach((sem) => {
      store.results.push({
        studentId: id,
        enrollment: finalEnrollment,
        branch: newUser.branch,
        semester: sem,
        studentName: name,
        photo,
        course: newUser.course,
        sgpa: "0.00",
        cgpa: "0.00",
        totalMarks: 0,
        finalGrade: "-",
        comment: "NEW ADMISSION",
        subjects: []
      });
    });
  }
  writeStore(store);
  res.status(201).json({ token: tokenFor(newUser), user: safeUser(newUser) });
});

app.post("/api/auth/google", (req, res) => {
  const { gmail, role } = req.body;
  if (!gmail || !gmail.includes("@")) return res.status(400).json({ message: "Valid Gmail required." });
  const useRole = role || "student";
  const store = readStore();
  let user = store.users.find((u) => (u.email || "").toLowerCase() === gmail.toLowerCase());
  if (!user) {
    const baseName = gmail.split("@")[0].replace(/[._]/g, " ");
    const name = baseName
      .split(" ")
      .filter(Boolean)
      .map((s) => s[0].toUpperCase() + s.slice(1))
      .join(" ");
    const idPrefix = useRole === "admin" ? "ADM" : useRole === "faculty" ? "FAC" : "STD";
    const id = `${idPrefix}-${String(store.users.length + 1).padStart(4, "0")}`;
    const enrollment =
      useRole === "student" ? nextEnrollmentForBranch(store, "CSE", "B.Tech CSE") : `GOOG${store.users.length + 1000}`;
    user = {
      id,
      role: useRole,
      name: name || "Google User",
      enrollment,
      email: gmail,
      phone: "NA",
      passwordHash: mkHash("Google@Login1"),
      branch: "CSE",
      course: "B.Tech CSE",
      photo: `/assets/faces/face-${String((store.users.length % 28) + 1).padStart(2, "0")}.png`
    };
    store.users.push(user);
    if (useRole === "student") store.fees.push({ studentId: id, total: 70000, paid: 0, newCharges: 0, nextSemesterFee: 30000 });
    writeStore(store);
  }
  res.json({ token: tokenFor(user), user: safeUser(user), message: "Google login success." });
});

app.post("/api/auth/login", (req, res) => {
  const { identifier, password } = req.body;
  const store = readStore();
  const user = store.users.find(
    (u) =>
      String(u.enrollment).toLowerCase() === String(identifier).toLowerCase() ||
      String(u.name).toLowerCase() === String(identifier).toLowerCase()
  );
  if (!user) return res.status(404).json({ message: "User not found." });
  if (!bcrypt.compareSync(password || "", user.passwordHash)) return res.status(401).json({ message: "Incorrect password." });
  res.json({ token: tokenFor(user), user: safeUser(user) });
});

app.get("/api/session/me", auth, (req, res) => {
  const user = readStore().users.find((u) => u.id === req.user.sub);
  if (!user) return res.status(404).json({ message: "User not found." });
  res.json(safeUser(user));
});

app.get("/api/students", auth, (req, res) => {
  const page = Math.max(1, Number(req.query.page || 1));
  const limit = Math.min(100, Math.max(1, Number(req.query.limit || 20)));
  const q = String(req.query.q || "").toLowerCase();
  const list = readStore()
    .users.filter((u) => u.role === "student")
    .filter((u) => !q || [u.name, u.enrollment, u.course, u.branch, u.phone].some((x) => String(x || "").toLowerCase().includes(q)))
    .map((u) => safeUser(u));
  const start = (page - 1) * limit;
  res.json({ total: list.length, page, limit, data: list.slice(start, start + limit) });
});

app.post("/api/admissions", auth, (req, res) => {
  const { name, branch, course, phone } = req.body;
  let { enrollment } = req.body;
  if (!name || !branch || !course) return res.status(400).json({ message: "Missing fields." });
  const store = readStore();
  if (!enrollment) enrollment = nextEnrollmentForBranch(store, branch, course);
  if (store.users.some((u) => u.enrollment.toLowerCase() === String(enrollment).toLowerCase())) {
    return res.status(409).json({ message: "Enrollment exists." });
  }
  const id = `STD-${String(store.users.filter((u) => u.role === "student").length + 1).padStart(4, "0")}`;
  const photo = `/assets/faces/face-${String((store.users.length % 28) + 1).padStart(2, "0")}.png`;
  const user = {
    id,
    role: "student",
    name,
    enrollment,
    branch,
    course,
    phone: phone || "NA",
    passwordHash: mkHash("Pass@123"),
    photo,
    fatherName: "NA",
    motherName: "NA",
    dob: "01/01/2002"
  };
  store.users.push(user);
  store.admissions.push({ ...safeUser(user), admittedBy: req.user.name, admittedAt: new Date().toISOString() });
  store.fees.push({ studentId: id, total: 70000, paid: 0, newCharges: 0, nextSemesterFee: 30000 });
  writeStore(store);
  res.status(201).json({ message: "Admission registered.", student: safeUser(user) });
});

app.get("/api/attendance/:studentId", auth, (req, res) => {
  const records = readStore().attendance.filter((a) => a.studentId === req.params.studentId);
  res.json(records);
});

app.get("/api/attendance/:studentId/summary", auth, (req, res) => {
  const store = readStore();
  const student = store.users.find((u) => u.id === req.params.studentId);
  if (!student) return res.status(404).json({ message: "Student not found." });
  const records = store.attendance.filter((a) => a.studentId === student.id);
  res.json({ student: safeUser(student), ...attendanceSummary(records) });
});

app.get("/api/reminders", auth, (req, res) =>
  res.json(readStore().reminders.filter((r) => r.audience === req.user.role || r.audience === "all"))
);

app.get("/api/examinations/marksheet", auth, (req, res) => {
  const enrollment = String(req.query.enrollment || "");
  const branch = String(req.query.branch || "");
  const semester = String(req.query.semester || "II");
  const store = readStore();
  const student = store.users.find(
    (u) =>
      u.role === "student" &&
      u.enrollment.toLowerCase() === enrollment.toLowerCase() &&
      u.branch.toLowerCase() === branch.toLowerCase()
  );
  if (!student) return res.status(404).json({ message: "Student not found for this enrollment and branch." });
  const result = store.results.find(
    (r) =>
      r.enrollment.toLowerCase() === enrollment.toLowerCase() &&
      r.branch.toLowerCase() === branch.toLowerCase() &&
      r.semester === semester
  );
  if (!result) return res.status(404).json({ message: "Marksheet not found for selected semester." });
  res.json({
    university: "Institute of Engineering & Technology",
    title: "Result & OGPA details",
    gradeSheet: `Grade Sheet ${semester} Sem`,
    semesterNote: `Sem. = ${semester}, Marks in %, Credits`,
    student: {
      name: student.name,
      degree: student.course,
      enrollment: student.enrollment,
      fatherName: student.fatherName || "NA",
      motherName: student.motherName || "NA",
      dob: student.dob || "NA",
      photo: student.photo || result.photo
    },
    subjects: result.subjects,
    sgpa: result.sgpa,
    cgpa: result.cgpa,
    totalMarks: result.totalMarks,
    finalGrade: result.finalGrade || "A",
    comment: result.comment || "GOOD",
    qrData: `${student.enrollment}|${branch}|${semester}|${result.sgpa}`
  });
});

app.get("/api/library/search", auth, (req, res) => {
  const q = String(req.query.q || "").toLowerCase();
  const data = readStore().books.filter((b) => b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q));
  res.json({ count: data.length, data });
});

app.get("/api/hostel/search", auth, (req, res) => {
  const lat = Number(req.query.lat || 22.7196);
  const lng = Number(req.query.lng || 75.8577);
  const data = readStore()
    .hostels.map((h) => ({ ...h, distanceKm: Number((Math.sqrt((h.lat - lat) ** 2 + (h.lng - lng) ** 2) * 111).toFixed(2)) }))
    .sort((a, b) => a.distanceKm - b.distanceKm);
  res.json(data);
});

app.get("/api/transport/:hostelId", auth, (req, res) => {
  const route = readStore().transportRoutes.find((r) => r.hostelId === req.params.hostelId);
  if (!route) return res.status(404).json({ message: "Route not found." });
  res.json(route);
});

app.get("/api/finance/:studentId", auth, (req, res) => {
  const fee = readStore().fees.find((f) => f.studentId === req.params.studentId);
  if (!fee) return res.status(404).json({ message: "Finance record not found." });
  res.json({ ...fee, pending: Math.max(fee.total + fee.newCharges - fee.paid, 0) });
});

app.post("/api/finance/pay", auth, (req, res) => {
  const store = readStore();
  const idx = store.fees.findIndex((f) => f.studentId === req.body.studentId);
  const amount = Number(req.body.amount || 0);
  if (idx < 0 || amount <= 0) return res.status(400).json({ message: "Invalid payment." });
  store.fees[idx].paid += amount;
  writeStore(store);
  res.json({ message: "Payment successful.", paidNow: amount, qrText: `upi://pay?pn=AttendSphere&am=${amount}&tn=${req.body.studentId}` });
});

app.get("/api/hr/jobs", auth, (req, res) => {
  const q = String(req.query.role || "").toLowerCase();
  res.json(readStore().jobs.filter((j) => !q || j.role.toLowerCase().includes(q)));
});

app.get("/api/alumni", auth, (req, res) => res.json(readStore().alumni));

app.post("/api/chatbot", auth, (req, res) => {
  const q = String(req.body.question || "").toLowerCase();
  let response = "Hi! I am Nova. I can help with attendance, exams, fees, placements, and library.";
  if (q.includes("attendance")) response = "Open Students or Academics to view month-wise and lecture-wise attendance with percentage.";
  else if (q.includes("marksheet") || q.includes("exam")) response = "Go to Examinations, enter enrollment + branch, choose semester, and view your official marksheet.";
  else if (q.includes("fees") || q.includes("finance")) response = "Finance section shows paid, pending, and next semester fee with online payment.";
  else if (q.includes("placement") || q.includes("job")) response = "HR & Payroll lists companies and roles. Alumni section shows top placements.";
  res.json({ name: "Nova", avatar: "🤖", response });
});

app.get("/api/dashboard/summary", auth, (req, res) => {
  const store = readStore();
  const students = store.users.filter((u) => u.role === "student").length;
  const coursesCount = new Set(store.users.filter((u) => u.role === "student").map((u) => u.course)).size;
  const absents = store.attendance.filter((a) => a.status === "A").length;
  const total = store.attendance.length || 1;
  const attendancePercent = (((total - absents) / total) * 100).toFixed(2);
  const pendingTotal = store.fees.reduce((acc, f) => acc + Math.max(f.total + f.newCharges - f.paid, 0), 0);
  res.json({ students, courses: coursesCount, pendingFees: `₹${pendingTotal.toLocaleString("en-IN")}`, attendancePercent });
});

app.get("/", (_, res) => res.sendFile(path.join(__dirname, "public", "index.html")));

app.get("/api/health", (_, res) => res.json({ ok: true, service: "AttendSphere ERP" }));

if (require.main === module) {
  app.listen(PORT, "0.0.0.0", () => console.log(`AttendSphere ERP running on port ${PORT}`));
}

module.exports = app;
