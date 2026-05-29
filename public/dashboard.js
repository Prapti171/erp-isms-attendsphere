const API = window.ERP_API || "/api";
const token = localStorage.getItem("erp_token");
if (!token) window.location.href = "/";

const state = { user: null, page: 1, limit: 15, total: 0, search: "" };

const authFetch = (url, options = {}) =>
  fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(options.headers || {})
    }
  });

const formatCurrency = (num) => `₹${Number(num || 0).toLocaleString("en-IN")}`;
const byId = (id) => document.getElementById(id);

const menu = byId("menu");
menu.addEventListener("click", (e) => {
  if (!e.target.dataset.page) return;
  document.querySelectorAll("#menu button").forEach((b) => b.classList.remove("active"));
  e.target.classList.add("active");
  document.querySelectorAll(".page").forEach((p) => p.classList.remove("active"));
  byId(e.target.dataset.page).classList.add("active");
});

const loadUser = async () => {
  const res = await authFetch(`${API}/session/me`);
  const user = await res.json();
  state.user = user;
  byId("userName").textContent = user.name;
  byId("userRole").textContent = user.role;
};

const loadSummary = async () => {
  const res = await authFetch(`${API}/dashboard/summary`);
  const summary = await res.json();
  byId("summaryStats").innerHTML = `
    <div class="stat"><h4>Total Students</h4><strong>${summary.students}</strong></div>
    <div class="stat"><h4>Courses</h4><strong>${summary.courses}</strong></div>
    <div class="stat"><h4>Pending Fees</h4><strong>${summary.pendingFees}</strong></div>
    <div class="stat"><h4>Attendance</h4><strong>${summary.attendancePercent}%</strong></div>
  `;
};

const loadStudents = async () => {
  const res = await authFetch(
    `${API}/students?page=${state.page}&limit=${state.limit}&q=${encodeURIComponent(state.search)}`
  );
  const payload = await res.json();
  state.total = payload.total;
  const students = payload.data || [];
  byId("studentTable").innerHTML = `
    <tr><th>Enrollment</th><th>Name</th><th>Course</th><th>Branch</th><th>Phone</th></tr>
    ${students
      .map(
        (s) =>
          `<tr><td>${s.enrollment}</td><td>${s.name}</td><td>${s.course || "-"}</td><td>${s.branch || "-"}</td><td>${s.phone || "-"}</td></tr>`
      )
      .join("")}
  `;
  byId("pageInfo").textContent = `Page ${payload.page} / ${Math.max(
    1,
    Math.ceil(payload.total / payload.limit)
  )} (${payload.total} students)`;
};

const loadReminders = async () => {
  const res = await authFetch(`${API}/reminders`);
  const reminders = await res.json();
  byId("reminderBox").innerHTML = `<strong>Reminder Box</strong><ul>${reminders
    .map((r) => `<li>${r.text}</li>`)
    .join("")}</ul>`;
};

const renderAttendancePanel = (summary) => {
  if (!summary) return "<p>Attendance data unavailable.</p>";
  const monthBlocks = summary.byMonth
    .map(
      (m) => `
      <div class="card" style="margin-top:10px;padding:12px">
        <h4>${m.month} — ${m.percent}% (${m.present} Present / ${m.absent} Absent)</h4>
        <table>
          <tr><th>Date</th><th>Lecture</th><th>Status</th></tr>
          ${m.records
            .map(
              (r) =>
                `<tr><td>${r.date}</td><td>${r.lecture}</td><td style="color:${r.status === "P" ? "#166534" : "#b91c1c"}">${r.status === "P" ? "Present" : "Absent"}</td></tr>`
            )
            .join("")}
        </table>
      </div>`
    )
    .join("");
  return `
    <div class="stat" style="margin-bottom:12px">
      <strong>${summary.student.name}</strong> (${summary.student.enrollment}) — Overall Attendance: <b>${summary.percent}%</b>
      (${summary.present} Present / ${summary.absent} Absent / ${summary.total} Lectures)
    </div>
    ${monthBlocks}
  `;
};

const loadAttendanceSummary = async (enrollment) => {
  const studentRes = await authFetch(`${API}/students?page=1&limit=5&q=${encodeURIComponent(enrollment)}`);
  const studentData = await studentRes.json();
  const student = (studentData.data || []).find((s) => s.enrollment.toLowerCase() === enrollment.toLowerCase());
  if (!student) return null;
  const res = await authFetch(`${API}/attendance/${student.id}/summary`);
  if (!res.ok) return null;
  return res.json();
};

const loadAcademicsPanel = async () => {
  if (!state.user?.enrollment || state.user.role !== "student") {
    byId("attendanceList").innerHTML = "<p>Login as student or search enrollment in Students section.</p>";
    return;
  }
  const summary = await loadAttendanceSummary(state.user.enrollment);
  byId("attendanceList").innerHTML = renderAttendancePanel(summary);
};

const loadAlumni = async () => {
  const res = await authFetch(`${API}/alumni`);
  const alumni = await res.json();
  byId("alumniGrid").innerHTML = alumni
    .map(
      (a) => `
      <div class="alumni-card">
        <img src="${a.photo}" alt="${a.name}" />
        <h4>${a.name}</h4>
        <p>Branch: ${a.branch} | Batch: ${a.year}</p>
        <p>Placed at <b>${a.company}</b></p>
        <strong>${a.packageLpa} LPA</strong>
      </div>
    `
    )
    .join("");
};

const renderMarksheet = (m) => {
  const qr = encodeURIComponent(m.qrData);
  return `
    <div class="marksheet-wrap">
      <h2>${m.university}</h2>
      <h3>${m.title}</h3>
      <p class="marksheet-note"><b>${m.gradeSheet}</b><br/>${m.semesterNote}</p>
      <div class="marksheet-grid">
        <div class="marksheet-info">
          <p><b>Student Name:</b> ${m.student.name}</p>
          <p><b>Degree:</b> ${m.student.degree}</p>
          <p><b>Enrollment:</b> ${m.student.enrollment}</p>
          <p><b>Father's Name:</b> ${m.student.fatherName}</p>
          <p><b>Mother's Name:</b> ${m.student.motherName}</p>
          <p><b>Date of Birth:</b> ${m.student.dob}</p>
          <p><b>SGPA:</b> ${m.sgpa} &nbsp; <b>CGPA:</b> ${m.cgpa}</p>
          <p><b>Total Marks:</b> ${m.totalMarks} &nbsp; <b>Final Grade:</b> ${m.finalGrade}</p>
        </div>
        <img class="marksheet-photo" src="${m.student.photo}" alt="Student Photo" />
      </div>
      <table class="marksheet-table">
        <tr><th>SUB CODE</th><th>SUB NAME</th><th>CREDITS</th><th>GRADE</th><th>GRADE POINT</th></tr>
        ${m.subjects
          .map(
            (s) =>
              `<tr><td>${s.code}</td><td>${s.name}</td><td>${s.credits}</td><td>${s.grade}</td><td>${s.gradePoint}</td></tr>`
          )
          .join("")}
      </table>
      <div class="marksheet-footer">
        <div>
          <p><b>Comment:</b></p>
          <div class="marksheet-comment">${m.comment}</div>
        </div>
        <div class="marksheet-qr">
          <img src="https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${qr}" alt="QR Code" />
          <p style="font-size:0.75rem;margin-top:4px">Scan to verify</p>
        </div>
      </div>
    </div>
  `;
};

const appendBotMessage = (text, mine = false) => {
  const div = document.createElement("div");
  div.style.marginBottom = "8px";
  div.innerHTML = mine ? `<strong>You:</strong> ${text}` : `<strong>Nova:</strong> ${text}`;
  byId("botMessages").appendChild(div);
};

byId("botToggle").onclick = () => byId("botPanel").classList.toggle("hidden");
byId("botSend").onclick = async () => {
  const question = byId("botInput").value.trim();
  if (!question) return;
  appendBotMessage(question, true);
  byId("botInput").value = "";
  const res = await authFetch(`${API}/chatbot`, {
    method: "POST",
    body: JSON.stringify({ question })
  });
  const ans = await res.json();
  appendBotMessage(ans.response);
};

byId("admissionSubmitBtn").onclick = async () => {
  const payload = {
    name: byId("admName").value.trim(),
    enrollment: byId("admEnrollment").value.trim(),
    branch: byId("admBranch").value.trim(),
    course: byId("admCourse").value.trim(),
    phone: byId("admPhone").value.trim()
  };
  const res = await authFetch(`${API}/admissions`, {
    method: "POST",
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  byId("admissionMsg").textContent = data.message;
  byId("admissionMsg").style.color = res.ok ? "#166534" : "#b91c1c";
  if (res.ok) {
    await loadSummary();
    await loadStudents();
  }
};

byId("loadStudentAttendanceBtn").onclick = async () => {
  const enrollment = byId("studentEnrollmentInput").value.trim();
  if (!enrollment) return;
  const summary = await loadAttendanceSummary(enrollment);
  byId("studentAttendanceBox").innerHTML = summary
    ? renderAttendancePanel(summary)
    : "<p>Student not found.</p>";
};

byId("examResultBtn").onclick = async () => {
  const enrollment = byId("examEnrollment").value.trim();
  const branch = byId("examBranch").value.trim();
  const semester = byId("examSemester").value;
  const res = await authFetch(
    `${API}/examinations/marksheet?enrollment=${encodeURIComponent(enrollment)}&branch=${encodeURIComponent(branch)}&semester=${encodeURIComponent(semester)}`
  );
  const data = await res.json();
  if (!res.ok) {
    byId("examResultBox").innerHTML = `<p>${data.message}</p>`;
    return;
  }
  byId("examResultBox").innerHTML = renderMarksheet(data);
};

byId("librarySearchBtn").onclick = async () => {
  const q = byId("libraryQuery").value.trim();
  const res = await authFetch(`${API}/library/search?q=${encodeURIComponent(q)}`);
  const data = await res.json();
  byId("libraryResultBox").innerHTML = `
    <p><strong>${data.count}</strong> books found</p>
    <table><tr><th>Title</th><th>Author</th><th>Available Copies</th></tr>${data.data
      .map((b) => `<tr><td>${b.title}</td><td>${b.author}</td><td>${b.copies}</td></tr>`)
      .join("")}</table>
  `;
};

byId("hostelLoadBtn").onclick = async () => {
  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      const res = await authFetch(
        `${API}/hostel/search?lat=${pos.coords.latitude}&lng=${pos.coords.longitude}`
      );
      const hostels = await res.json();
      const lines = [];
      for (const h of hostels) {
        const tRes = await authFetch(`${API}/transport/${h.id}`);
        const route = await tRes.json();
        lines.push(
          `<tr><td>${h.name}</td><td>${h.address}</td><td>${h.distanceKm} km</td><td>${h.roomsAvailable}</td><td>${route.routeName} (${route.buses} buses)</td><td>${route.shortestPathKm} km</td></tr>`
        );
      }
      byId("hostelResultBox").innerHTML = `<table><tr><th>Hostel</th><th>Address</th><th>Distance</th><th>Rooms</th><th>Transport</th><th>Shortest Path</th></tr>${lines.join("")}</table>`;
    },
    async () => {
      const res = await authFetch(`${API}/hostel/search`);
      const hostels = await res.json();
      byId("hostelResultBox").innerHTML = `<table><tr><th>Hostel</th><th>Address</th><th>Distance</th><th>Rooms</th></tr>${hostels
        .map((h) => `<tr><td>${h.name}</td><td>${h.address}</td><td>${h.distanceKm} km</td><td>${h.roomsAvailable}</td></tr>`)
        .join("")}</table>`;
    }
  );
};

byId("financeLoadBtn").onclick = async () => {
  const enrollment = byId("financeEnrollment").value.trim();
  let studentId = state.user.id;
  if (enrollment) {
    const sRes = await authFetch(`${API}/students?page=1&limit=1&q=${encodeURIComponent(enrollment)}`);
    const sData = await sRes.json();
    const found = (sData.data || []).find((s) => s.enrollment.toLowerCase() === enrollment.toLowerCase());
    if (!found) {
      byId("financeResultBox").innerHTML = "<p>Student not found.</p>";
      return;
    }
    studentId = found.id;
  }
  const res = await authFetch(`${API}/finance/${studentId}`);
  const data = await res.json();
  if (!res.ok) {
    byId("financeResultBox").innerHTML = `<p>${data.message}</p>`;
    return;
  }
  byId("financeResultBox").innerHTML = `
    <p>Total: <strong>${formatCurrency(data.total)}</strong> | Paid: <strong>${formatCurrency(data.paid)}</strong> | Pending: <strong>${formatCurrency(data.pending)}</strong></p>
    <p>Next Semester Fee: <strong>${formatCurrency(data.nextSemesterFee)}</strong> | New Charges: <strong>${formatCurrency(data.newCharges)}</strong></p>
    <input id="payAmountInput" placeholder="Enter amount to pay" />
    <button id="payNowBtn">Pay Now</button>
    <div id="payStatus"></div>
  `;
  byId("payNowBtn").onclick = async () => {
    const amt = Number(byId("payAmountInput").value || 0);
    const pRes = await authFetch(`${API}/finance/pay`, {
      method: "POST",
      body: JSON.stringify({ studentId, amount: amt })
    });
    const pData = await pRes.json();
    byId("payStatus").innerHTML = `<p>${pData.message}</p><code>${pData.qrText || ""}</code>`;
    await byId("financeLoadBtn").onclick();
  };
};

byId("jobSearchBtn").onclick = async () => {
  const role = byId("jobRoleQuery").value.trim();
  const res = await authFetch(`${API}/hr/jobs?role=${encodeURIComponent(role)}`);
  const data = await res.json();
  byId("jobsResultBox").innerHTML = `<table><tr><th>Role</th><th>Company</th><th>Type</th><th>Package/Stipend</th></tr>${data
    .map((j) => `<tr><td>${j.role}</td><td>${j.company}</td><td>${j.type}</td><td>${j.stipendOrCtc}</td></tr>`)
    .join("")}</table>`;
};

byId("refreshBtn").onclick = async () => {
  await Promise.all([loadSummary(), loadStudents(), loadReminders()]);
};

byId("globalSearch").addEventListener("input", async (e) => {
  state.search = e.target.value.trim();
  state.page = 1;
  await loadStudents();
});
byId("prevPageBtn").onclick = async () => {
  state.page = Math.max(1, state.page - 1);
  await loadStudents();
};
byId("nextPageBtn").onclick = async () => {
  if (state.page * state.limit < state.total) state.page += 1;
  await loadStudents();
};

byId("quickNewStudentBtn").onclick = () => {
  document.querySelector('#menu button[data-page="admissions"]').click();
};

byId("logoutBtn").onclick = () => {
  localStorage.clear();
  window.location.href = "/";
};

const init = async () => {
  await loadUser();
  await Promise.all([loadSummary(), loadStudents(), loadReminders(), loadAlumni(), loadAcademicsPanel()]);
  if (state.user.role === "student") {
    byId("financeEnrollment").value = state.user.enrollment;
    byId("examEnrollment").value = state.user.enrollment;
    byId("examBranch").value = state.user.branch || "";
  }
  byId("studentEnrollmentInput").value = state.user.enrollment || "";
};
init();
