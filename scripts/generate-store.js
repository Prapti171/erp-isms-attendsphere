const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");

const DATA_FILE = path.join(__dirname, "..", "data", "store.json");
const DEFAULT_HASH = bcrypt.hashSync("Pass@123", 10);

const maleFirstNames = [
  "Aarav", "Abhay", "Akshat", "Ankit", "Ayushman", "Harsh", "Karan", "Rahul", "Ritesh", "Rohit",
  "Sourav", "Sumedh", "Tanish", "Vikram", "Vivek", "Arjun", "Dev", "Kunal", "Manish", "Nikhil"
];
const femaleFirstNames = [
  "Aditi", "Ananya", "Diya", "Isha", "Ishita", "Madhumita", "Mallika", "Megha", "Naina", "Neha",
  "Pooja", "Priya", "Riya", "Sanjana", "Shweta", "Sunita", "Trina", "Kavita", "Pallavi", "Sneha"
];
const lastNames = [
  "Verma", "Singh", "Roy", "Sarkar", "Shukla", "Kapoor", "Mishra", "Tiwari", "Gupta", "Sinha",
  "Das", "Pal", "Kashyap", "Malhotra", "Mudgalkar", "Sharma", "Mehta", "Kumar", "Jain", "Bose"
];
const fatherFirstNames = [
  "Rajesh", "Suresh", "Ramesh", "Mahesh", "Dinesh", "Mukesh", "Sanjay", "Ajay", "Vijay", "Manoj",
  "Ashok", "Prakash", "Harish", "Girish", "Naresh", "Deepak", "Sunil", "Anil", "Ravi", "Vinod"
];
const motherFirstNames = [
  "Sunita", "Priya", "Kavita", "Anjali", "Poonam", "Rekha", "Meena", "Geeta", "Lata", "Usha",
  "Shanti", "Radha", "Sarita", "Neelam", "Manju", "Asha", "Nirmala", "Kamla", "Sushma", "Vidya"
];

const maleFaces = [
  "face-03", "face-05", "face-07", "face-08", "face-11", "face-12", "face-17", "face-19",
  "face-22", "face-24", "face-26"
];
const femaleFaces = [
  "face-01", "face-02", "face-04", "face-06", "face-09", "face-10", "face-13", "face-14",
  "face-15", "face-16", "face-18", "face-20", "face-21", "face-23", "face-25", "face-27", "face-28"
];

const branches = ["CSE", "IT", "ECE", "ME", "Civil"];
const courses = ["B.Tech CSE", "B.Tech IT", "M.Tech", "MBA", "BCA", "MCA"];
const lectures = ["DBMS", "JAVA", "Python", "IWT", "OS", "DSA"];
const semesters = ["I", "II", "III", "IV"];

const branchPrefix = (branch, course) => {
  if (course.includes("M.Tech")) return "MT";
  if (branch === "ECE") return "EC";
  if (branch === "Civil") return "CV";
  return branch;
};

const branchCounters = {};
const nextEnrollment = (branch, course) => {
  const prefix = branchPrefix(branch, course);
  branchCounters[prefix] = (branchCounters[prefix] || 1000) + 1;
  return `${prefix}${branchCounters[prefix]}`;
};

const semSubjects = (sem) => {
  const base = [
    { code: "MT201", name: "Research Methodology", credits: 4 },
    { code: "MT202", name: "Advanced Computer Architecture", credits: 4 },
    { code: "MT203", name: "Advanced Data Mining", credits: 4 },
    { code: "MT204", name: "Advanced Image Processing", credits: 4 },
    { code: "MT205", name: "Research Review", credits: 4 }
  ];
  if (sem === "I") {
    return [
      { code: "CS101", name: "Programming Fundamentals", credits: 4 },
      { code: "MA101", name: "Engineering Mathematics I", credits: 4 },
      { code: "PH101", name: "Engineering Physics", credits: 3 },
      { code: "HS101", name: "Communication Skills", credits: 2 }
    ];
  }
  if (sem === "III") {
    return [
      { code: "CS301", name: "Operating Systems", credits: 4 },
      { code: "CS302", name: "Computer Networks", credits: 4 },
      { code: "CS303", name: "Theory of Computation", credits: 4 },
      { code: "CS304", name: "Software Engineering", credits: 3 }
    ];
  }
  if (sem === "IV") {
    return [
      { code: "CS401", name: "Machine Learning", credits: 4 },
      { code: "CS402", name: "Cloud Computing", credits: 4 },
      { code: "CS403", name: "Cyber Security", credits: 4 },
      { code: "CS404", name: "Major Project", credits: 6 }
    ];
  }
  return base;
};

const gradeFromMarks = (m) => {
  if (m >= 90) return { grade: "A+", point: 10 };
  if (m >= 80) return { grade: "A", point: 9 };
  if (m >= 70) return { grade: "B+", point: 8 };
  if (m >= 60) return { grade: "B", point: 7 };
  return { grade: "C", point: 6 };
};

const pick = (arr, i) => arr[i % arr.length];
const photoFor = (gender, i) => {
  const pool = gender === "male" ? maleFaces : femaleFaces;
  return `/assets/faces/${pick(pool, i)}.png`;
};

const users = [];
const attendance = [];
const results = [];
const fees = [];

let maleIdx = 0;
let femaleIdx = 0;

for (let i = 1; i <= 340; i += 1) {
  const gender = i % 2 === 0 ? "female" : "male";
  const firstName =
    gender === "male" ? pick(maleFirstNames, maleIdx++) : pick(femaleFirstNames, femaleIdx++);
  const lastName = pick(lastNames, i + 3);
  const name = `${firstName} ${lastName}`;
  const branch = branches[i % branches.length];
  const course = courses[i % courses.length];
  const enrollment = nextEnrollment(branch, course);
  const id = `STD-${String(i).padStart(4, "0")}`;
  const photo = photoFor(gender, gender === "male" ? maleIdx : femaleIdx);

  users.push({
    id,
    role: "student",
    gender,
    name,
    branch,
    course,
    enrollment,
    phone: `9${String(800000000 + i).padStart(9, "0")}`,
    passwordHash: DEFAULT_HASH,
    photo,
    fatherName: `${pick(fatherFirstNames, i)} ${lastName}`,
    motherName: `${pick(motherFirstNames, i + 11)} ${lastName}`,
    dob: `${String(1 + (i % 28)).padStart(2, "0")}/0${1 + (i % 9)}/200${2 + (i % 5)}`
  });

  const months = ["2026-01", "2026-02", "2026-03", "2026-04", "2026-05"];
  months.forEach((month, mi) => {
    for (let d = 1; d <= 4; d += 1) {
      const day = String(5 + d * 5).padStart(2, "0");
      const date = `${month}-${day}`;
      lectures.forEach((lecture, li) => {
        if ((i + mi + d + li) % 11 === 0) return;
        attendance.push({
          studentId: id,
          date,
          month,
          lecture,
          status: (i + mi + d + li) % 9 === 0 ? "A" : "P"
        });
      });
    }
  });

  semesters.forEach((sem) => {
    const subjects = semSubjects(sem).map((s, si) => {
      const marks = 62 + ((i + si * 7) % 35);
      const g = gradeFromMarks(marks);
      return { ...s, marks, grade: g.grade, gradePoint: g.point };
    });
    const totalMarks = subjects.reduce((a, s) => a + s.marks, 0);
    const sgpa = (7.5 + ((i + sem.charCodeAt(0)) % 20) / 10).toFixed(2);
    const cgpa = (7.2 + ((i + 2) % 25) / 10).toFixed(2);
    results.push({
      studentId: id,
      enrollment,
      branch,
      semester: sem,
      studentName: name,
      photo,
      course,
      sgpa,
      cgpa,
      totalMarks,
      finalGrade: Number(sgpa) >= 9 ? "A+" : "A",
      comment: "GOOD",
      subjects
    });
  });

  fees.push({
    studentId: id,
    total: 70000,
    paid: 32000 + (i % 6) * 3000,
    newCharges: 2500,
    nextSemesterFee: 30000
  });
}

users.push(
  {
    id: "ADM-001",
    role: "admin",
    gender: "female",
    name: "Prapti Roy",
    department: "Administration",
    enrollment: "ADMIN1",
    phone: "9000000000",
    passwordHash: DEFAULT_HASH,
    photo: "/assets/faces/face-06.png"
  },
  {
    id: "FAC-001",
    role: "faculty",
    gender: "female",
    name: "Dr. Meera Sinha",
    department: "Academics",
    enrollment: "FAC1001",
    phone: "9988776655",
    passwordHash: DEFAULT_HASH,
    photo: "/assets/faces/face-15.png"
  }
);

const store = {
  users,
  admissions: [],
  attendance,
  reminders: [
    { id: "REM-1", audience: "student", text: "Today's Java attendance has not been marked." },
    { id: "REM-2", audience: "faculty", text: "Please mark attendance for 2 lectures today." },
    { id: "REM-3", audience: "admin", text: "Attendance compliance is below 90% in 3 departments. Review required." }
  ],
  results,
  books: [
    { id: "B1", title: "Python for Beginners", author: "Abhay Verma", copies: 12 },
    { id: "B2", title: "Advanced Python", author: "Mallika Singh", copies: 8 },
    { id: "B3", title: "Python Data Science", author: "Trina Saha", copies: 9 },
    { id: "B4", title: "Java in Depth", author: "Madhumita Sarkar", copies: 6 },
    { id: "B5", title: "DBMS Practical Guide", author: "Riya Verma", copies: 10 }
  ],
  hostels: [
    { id: "H1", name: "City Center Hostel", lat: 22.7196, lng: 75.8577, roomsAvailable: 26, address: "City Center, Block A" },
    { id: "H2", name: "Green Valley Hostel", lat: 22.733, lng: 75.89, roomsAvailable: 11, address: "Green Valley Road" },
    { id: "H3", name: "Scholars Residency", lat: 22.701, lng: 75.842, roomsAvailable: 7, address: "University Link Road" }
  ],
  transportRoutes: [
    { hostelId: "H1", routeName: "Route 1", buses: 4, shortestPathKm: 3.8 },
    { hostelId: "H2", routeName: "Route 2", buses: 2, shortestPathKm: 5.1 },
    { hostelId: "H3", routeName: "Route 3", buses: 1, shortestPathKm: 6.4 }
  ],
  fees,
  jobs: [
    { role: "Software Developer", company: "Google", type: "Full Time", stipendOrCtc: "44 LPA" },
    { role: "Software Developer", company: "Microsoft", type: "Internship", stipendOrCtc: "1.3L / month" },
    { role: "Data Analyst", company: "Infosys", type: "Full Time", stipendOrCtc: "8 LPA" },
    { role: "Frontend Developer", company: "Wipro", type: "Full Time", stipendOrCtc: "9 LPA" },
    { role: "System Analyst", company: "Capgemini", type: "Full Time", stipendOrCtc: "10 LPA" }
  ],
  alumni: [
    { name: "Trina Saha", branch: "CSE", year: "2024", company: "Google", packageLpa: 44, photo: "/assets/faces/face-16.png" },
    { name: "Madhumita Sarkar", branch: "IT", year: "2023", company: "Microsoft", packageLpa: 24, photo: "/assets/faces/face-18.png" },
    { name: "Abhay Verma", branch: "CSE", year: "2022", company: "Capgemini", packageLpa: 11, photo: "/assets/faces/face-24.png" },
    { name: "Sumedh Mudgalkar", branch: "ECE", year: "2024", company: "Infosys", packageLpa: 9, photo: "/assets/faces/face-12.png" },
    { name: "Shweta Tiwari", branch: "IT", year: "2023", company: "Wipro", packageLpa: 12, photo: "/assets/faces/face-27.png" }
  ]
};

fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
fs.writeFileSync(DATA_FILE, JSON.stringify(store));
console.log(`Generated store with ${users.filter((u) => u.role === "student").length} students.`);
