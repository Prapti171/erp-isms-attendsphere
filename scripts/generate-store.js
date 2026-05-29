const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");

const DATA_FILE = path.join(__dirname, "..", "data", "store.json");
const DEFAULT_HASH = bcrypt.hashSync("Pass@123", 10);

const maleFirstNames = [
  "Aarav","Abhay","Akshat","Ankit","Ayushman","Harsh","Karan","Rahul","Ritesh","Rohit",
  "Sourav","Sumedh","Tanish","Vikram","Vivek","Arjun","Dev","Kunal","Manish","Nikhil"
];
const femaleFirstNames = [
  "Aditi","Ananya","Diya","Isha","Ishita","Madhumita","Mallika","Megha","Naina","Neha",
  "Pooja","Priya","Riya","Sanjana","Shweta","Sunita","Trina","Kavita","Pallavi","Sneha"
];
const lastNames = [
  "Verma","Singh","Roy","Sarkar","Shukla","Kapoor","Mishra","Tiwari","Gupta","Sinha",
  "Das","Pal","Kashyap","Malhotra","Mudgalkar","Sharma","Mehta","Kumar","Jain","Bose"
];
const fatherFirstNames = [
  "Rajesh","Suresh","Ramesh","Mahesh","Dinesh","Mukesh","Sanjay","Ajay","Vijay","Manoj",
  "Ashok","Prakash","Harish","Girish","Naresh","Deepak","Sunil","Anil","Ravi","Vinod",
  "Pankaj","Rupesh","Kapil","Akhilesh","Santosh","Satish","Devesh","Subhash","Praveen","Rakesh"
];
const motherFirstNames = [
  "Sunita","Priya","Kavita","Anjali","Poonam","Rekha","Meena","Geeta","Lata","Usha",
  "Shanti","Radha","Sarita","Neelam","Manju","Asha","Nirmala","Kamla","Sushma","Vidya",
  "Mamta","Seeta","Nisha","Archana","Rita","Smita","Bindhu","Sanjana","Nalini","Mridula"
];

const maleFaces = ["face-03","face-05","face-07","face-08","face-11","face-12","face-17","face-19","face-22","face-24","face-26"];
const femaleFaces = ["face-01","face-02","face-04","face-06","face-09","face-10","face-13","face-14","face-15","face-16","face-18","face-20","face-21","face-23","face-25","face-28"];

const branches = ["CSE","IT","ECE","ME","Civil"];
const courses  = ["B.Tech CSE","B.Tech IT","M.Tech","MBA","BCA","MCA"];
const lectures = ["DBMS","JAVA","Python","IWT","OS","DSA"];
const semesters = ["I","II","III","IV"];

// ── Subject catalogue ──────────────────────────────────────────────────────────
// prefix: BT=B.Tech, MT=M.Tech, MB=MBA, BC=BCA, MC=MCA
// sem number appended: 1xx=Sem I, 2xx=Sem II, 3xx=Sem III, 4xx=Sem IV

const SUBJECTS = {
  "B.Tech CSE": {
    "I":  [
      {code:"BT-CS101",name:"Engineering Mathematics I",          credits:4},
      {code:"BT-CS102",name:"Programming in C",                   credits:4},
      {code:"BT-CS103",name:"Engineering Physics",                credits:3},
      {code:"BT-CS104",name:"Engineering Graphics & Drawing",     credits:3},
      {code:"BT-CS105",name:"Communication Skills",               credits:2},
      {code:"BT-CS106",name:"Workshop / Manufacturing Practices", credits:2},
    ],
    "II": [
      {code:"BT-CS201",name:"Engineering Mathematics II",         credits:4},
      {code:"BT-CS202",name:"Data Structures",                    credits:4},
      {code:"BT-CS203",name:"Digital Electronics",                credits:3},
      {code:"BT-CS204",name:"Object-Oriented Programming (Java)", credits:3},
      {code:"BT-CS205",name:"Environmental Science",              credits:2},
      {code:"BT-CS206",name:"Computer Organization",              credits:2},
    ],
    "III":[
      {code:"BT-CS301",name:"Discrete Mathematics",               credits:4},
      {code:"BT-CS302",name:"Operating Systems",                  credits:4},
      {code:"BT-CS303",name:"Database Management Systems",        credits:3},
      {code:"BT-CS304",name:"Computer Networks",                  credits:3},
      {code:"BT-CS305",name:"Theory of Computation",              credits:3},
      {code:"BT-CS306",name:"Software Engineering",               credits:3},
    ],
    "IV": [
      {code:"BT-CS401",name:"Design & Analysis of Algorithms",    credits:4},
      {code:"BT-CS402",name:"Compiler Design",                    credits:3},
      {code:"BT-CS403",name:"Artificial Intelligence",            credits:3},
      {code:"BT-CS404",name:"Web Technologies",                   credits:3},
      {code:"BT-CS405",name:"Microprocessors & Interfacing",      credits:3},
      {code:"BT-CS406",name:"Elective I (Machine Learning)",      credits:3},
    ],
  },
  "B.Tech IT": {
    "I":  [
      {code:"BT-IT101",name:"Engineering Mathematics I",          credits:4},
      {code:"BT-IT102",name:"Programming Fundamentals (C/C++)",   credits:4},
      {code:"BT-IT103",name:"Engineering Chemistry",              credits:3},
      {code:"BT-IT104",name:"Engineering Graphics & Drawing",     credits:3},
      {code:"BT-IT105",name:"Technical Communication",            credits:2},
      {code:"BT-IT106",name:"Workshop Practice",                  credits:2},
    ],
    "II": [
      {code:"BT-IT201",name:"Engineering Mathematics II",         credits:4},
      {code:"BT-IT202",name:"Data Structures Using C",            credits:4},
      {code:"BT-IT203",name:"Digital Logic Design",               credits:3},
      {code:"BT-IT204",name:"Python Programming",                 credits:3},
      {code:"BT-IT205",name:"Environmental Studies",              credits:2},
      {code:"BT-IT206",name:"Fundamentals of IT",                 credits:2},
    ],
    "III":[
      {code:"BT-IT301",name:"Operating Systems",                  credits:4},
      {code:"BT-IT302",name:"Database Management Systems",        credits:4},
      {code:"BT-IT303",name:"Computer Networks",                  credits:3},
      {code:"BT-IT304",name:"Object-Oriented Systems",            credits:3},
      {code:"BT-IT305",name:"Software Engineering",               credits:3},
      {code:"BT-IT306",name:"Internet Technologies",              credits:3},
    ],
    "IV": [
      {code:"BT-IT401",name:"Algorithms & Complexity",            credits:4},
      {code:"BT-IT402",name:"Artificial Intelligence",            credits:3},
      {code:"BT-IT403",name:"Information Security",               credits:3},
      {code:"BT-IT404",name:"Cloud Computing",                    credits:3},
      {code:"BT-IT405",name:"Mobile Application Development",     credits:3},
      {code:"BT-IT406",name:"Elective I (Big Data Analytics)",    credits:3},
    ],
  },
  "M.Tech": {
    "I":  [
      {code:"MT-101",name:"Advanced Algorithms",                  credits:4},
      {code:"MT-102",name:"Research Methodology",                 credits:3},
      {code:"MT-103",name:"Advanced Computer Architecture",       credits:3},
      {code:"MT-104",name:"Machine Learning Techniques",          credits:4},
      {code:"MT-105",name:"High-Performance Computing",           credits:3},
    ],
    "II": [
      {code:"MT-201",name:"Deep Learning",                        credits:4},
      {code:"MT-202",name:"Natural Language Processing",          credits:3},
      {code:"MT-203",name:"Advanced Database Systems",            credits:3},
      {code:"MT-204",name:"Distributed Systems",                  credits:4},
      {code:"MT-205",name:"Elective I (IoT & Embedded Systems)",  credits:3},
    ],
    "III":[
      {code:"MT-301",name:"Computer Vision",                      credits:4},
      {code:"MT-302",name:"Big Data Analytics",                   credits:3},
      {code:"MT-303",name:"Cyber Security",                       credits:3},
      {code:"MT-304",name:"Elective II (Blockchain Technology)",  credits:3},
      {code:"MT-305",name:"Mini Project",                         credits:4},
    ],
    "IV": [
      {code:"MT-401",name:"Dissertation / Major Project",         credits:10},
      {code:"MT-402",name:"Seminar & Technical Presentation",     credits:4},
      {code:"MT-403",name:"Internship / Industry Project",        credits:6},
    ],
  },
  "MBA": {
    "I":  [
      {code:"MB-101",name:"Principles of Management",             credits:4},
      {code:"MB-102",name:"Business Economics",                   credits:4},
      {code:"MB-103",name:"Financial Accounting",                 credits:3},
      {code:"MB-104",name:"Organisational Behaviour",             credits:3},
      {code:"MB-105",name:"Business Communication",               credits:2},
      {code:"MB-106",name:"Quantitative Techniques",              credits:3},
    ],
    "II": [
      {code:"MB-201",name:"Marketing Management",                 credits:4},
      {code:"MB-202",name:"Financial Management",                 credits:4},
      {code:"MB-203",name:"Human Resource Management",            credits:3},
      {code:"MB-204",name:"Operations Management",                credits:3},
      {code:"MB-205",name:"Business Research Methods",            credits:3},
      {code:"MB-206",name:"Business Law & Ethics",                credits:2},
    ],
    "III":[
      {code:"MB-301",name:"Strategic Management",                 credits:4},
      {code:"MB-302",name:"Entrepreneurship & Innovation",        credits:3},
      {code:"MB-303",name:"International Business",               credits:3},
      {code:"MB-304",name:"Elective I (Digital Marketing)",       credits:3},
      {code:"MB-305",name:"Elective II (Investment Analysis)",    credits:3},
      {code:"MB-306",name:"Summer Internship Report",             credits:4},
    ],
    "IV": [
      {code:"MB-401",name:"Project Management",                   credits:3},
      {code:"MB-402",name:"Elective III (Supply Chain Mgmt)",     credits:3},
      {code:"MB-403",name:"Corporate Governance",                 credits:3},
      {code:"MB-404",name:"Dissertation / Major Project",         credits:8},
      {code:"MB-405",name:"Viva Voce",                            credits:3},
    ],
  },
  "BCA": {
    "I":  [
      {code:"BC-101",name:"Mathematical Foundation of CS",        credits:4},
      {code:"BC-102",name:"Programming in C",                     credits:4},
      {code:"BC-103",name:"Introduction to IT",                   credits:3},
      {code:"BC-104",name:"Digital Electronics Fundamentals",     credits:3},
      {code:"BC-105",name:"Communication Skills",                 credits:2},
      {code:"BC-106",name:"PC Software & Office Tools",           credits:2},
    ],
    "II": [
      {code:"BC-201",name:"Data Structures",                      credits:4},
      {code:"BC-202",name:"Object-Oriented Programming (C++)",    credits:4},
      {code:"BC-203",name:"Operating Systems",                    credits:3},
      {code:"BC-204",name:"Relational Database Systems",          credits:3},
      {code:"BC-205",name:"Multimedia & Web Designing",           credits:3},
      {code:"BC-206",name:"Discrete Mathematics",                 credits:2},
    ],
    "III":[
      {code:"BC-301",name:"Java Programming",                     credits:4},
      {code:"BC-302",name:"Computer Networks",                    credits:3},
      {code:"BC-303",name:"Software Engineering",                 credits:3},
      {code:"BC-304",name:"Visual Programming (VB.NET)",          credits:3},
      {code:"BC-305",name:"Internet & Web Technologies",          credits:3},
      {code:"BC-306",name:"Minor Project",                        credits:4},
    ],
    "IV": [
      {code:"BC-401",name:"Advanced Java (J2EE)",                 credits:4},
      {code:"BC-402",name:"PHP & MySQL Web Development",          credits:4},
      {code:"BC-403",name:"Information Security",                 credits:3},
      {code:"BC-404",name:"Cloud Computing Fundamentals",         credits:3},
      {code:"BC-405",name:"Major Project",                        credits:6},
    ],
  },
  "MCA": {
    "I":  [
      {code:"MC-101",name:"Discrete Mathematics & Logic",         credits:4},
      {code:"MC-102",name:"C & Data Structures",                  credits:4},
      {code:"MC-103",name:"Computer Organisation & Architecture", credits:3},
      {code:"MC-104",name:"Database Management Systems",          credits:4},
      {code:"MC-105",name:"Professional Communication",           credits:2},
      {code:"MC-106",name:"Statistical Methods",                  credits:3},
    ],
    "II": [
      {code:"MC-201",name:"Design & Analysis of Algorithms",      credits:4},
      {code:"MC-202",name:"Object-Oriented Programming (Java)",   credits:4},
      {code:"MC-203",name:"Operating Systems",                    credits:3},
      {code:"MC-204",name:"Computer Networks",                    credits:3},
      {code:"MC-205",name:"Software Engineering",                 credits:3},
      {code:"MC-206",name:"Python for Data Science",              credits:3},
    ],
    "III":[
      {code:"MC-301",name:"Web Application Development",          credits:4},
      {code:"MC-302",name:"Artificial Intelligence",              credits:3},
      {code:"MC-303",name:"Machine Learning",                     credits:3},
      {code:"MC-304",name:"Mobile Computing",                     credits:3},
      {code:"MC-305",name:"Information Security",                 credits:3},
      {code:"MC-306",name:"Mini Project",                         credits:4},
    ],
    "IV": [
      {code:"MC-401",name:"Cloud Computing & DevOps",             credits:4},
      {code:"MC-402",name:"Big Data Technologies",                credits:3},
      {code:"MC-403",name:"Elective (Blockchain / IoT)",          credits:3},
      {code:"MC-404",name:"Dissertation / Major Project",         credits:8},
      {code:"MC-405",name:"Viva Voce",                            credits:2},
    ],
  },
};

// ── Helpers ────────────────────────────────────────────────────────────────────
const pick  = (arr, i) => arr[i % arr.length];
const grade = (marks) => {
  if (marks >= 90) return {grade:"O",  gp:10};
  if (marks >= 80) return {grade:"A+", gp:9};
  if (marks >= 70) return {grade:"A",  gp:9};
  if (marks >= 60) return {grade:"B+", gp:8};
  if (marks >= 50) return {grade:"B",  gp:7};
  if (marks >= 40) return {grade:"C",  gp:6};
  return            {grade:"F",  gp:0};
};
const cgpaComment = (cgpa) => {
  if (cgpa >= 9.0) return "OUTSTANDING";
  if (cgpa >= 8.0) return "EXCELLENT";
  if (cgpa >= 7.0) return "VERY GOOD";
  if (cgpa >= 6.0) return "GOOD";
  return "AVERAGE";
};

const branchPrefix = (branch, course) => {
  if (course.includes("M.Tech")) return "MT";
  if (branch === "ECE")  return "EC";
  if (branch === "Civil")return "CV";
  return branch;
};

const branchCounters = {};
const nextEnrollment = (branch, course) => {
  const pfx = branchPrefix(branch, course);
  branchCounters[pfx] = (branchCounters[pfx] || 1000) + 1;
  return `${pfx}${branchCounters[pfx]}`;
};

const photoFor = (gender, idx) =>
  `/assets/faces/${gender === "male" ? pick(maleFaces,idx) : pick(femaleFaces,idx)}.png`;

// ── Build users ────────────────────────────────────────────────────────────────
const users = [
  { id:"ADMIN-001", role:"admin",  name:"Dr. Anjali Sharma",  branch:"Admin", course:"",
    enrollment:"ADMIN001", phone:"9999999999", passwordHash:DEFAULT_HASH,
    photo:"/assets/faces/face-04.png", fatherName:"NA", motherName:"NA", dob:"NA" },
];
const attendance = [];
const results    = [];

let maleIdx = 0, femaleIdx = 0;

for (let i = 1; i <= 340; i++) {
  const gender   = i % 2 === 0 ? "female" : "male";
  const firstName= gender==="male" ? pick(maleFirstNames,maleIdx++) : pick(femaleFirstNames,femaleIdx++);
  const lastName = pick(lastNames, i);
  const name     = `${firstName} ${lastName}`;
  const branch   = pick(branches, i-1);
  const course   = pick(courses,  i-1);
  const enrollment = nextEnrollment(branch, course);
  const id       = `STD-${String(i).padStart(4,"0")}`;
  const photo    = photoFor(gender, gender==="male" ? maleIdx : femaleIdx);

  const fatherFirst = pick(fatherFirstNames, i);
  const motherFirst = pick(motherFirstNames, i + 7);

  users.push({
    id, role:"student", gender, name, branch, course, enrollment,
    phone: `9${String(800000000+i).padStart(9,"0")}`,
    passwordHash: DEFAULT_HASH,
    photo,
    fatherName: `${fatherFirst} ${lastName}`,
    motherName: `${motherFirst} ${lastName}`,
    dob: `${String(1+(i%28)).padStart(2,"0")}/0${1+(i%9)}/200${2+(i%5)}`
  });

  // Attendance
  const months = ["2026-01","2026-02","2026-03","2026-04","2026-05"];
  months.forEach((month,mi) => {
    for (let d=1;d<=4;d++) {
      const day  = String(5+d*5).padStart(2,"0");
      const date = `${month}-${day}`;
      lectures.forEach((lecture,li) => {
        if ((i+mi+d+li)%11===0) return;
        attendance.push({
          studentId:id, date, month, lecture,
          status: (i+mi+d+li)%9===0 ? "A" : "P"
        });
      });
    }
  });

  // Results — one per semester
  const subjectList = SUBJECTS[course] || SUBJECTS["B.Tech CSE"];
  semesters.forEach((sem, si) => {
    const semSubjects = subjectList[sem] || subjectList["I"];
    let totalMarks = 0, totalCredits = 0, totalGradePoints = 0;
    const subjectResults = semSubjects.map((sub, j) => {
      const marks = 45 + ((i + si*10 + j*7) % 50);
      const {grade:g, gp} = grade(marks);
      totalMarks       += marks;
      totalCredits     += sub.credits;
      totalGradePoints += gp * sub.credits;
      return { code:sub.code, name:sub.name, credits:sub.credits, marks, grade:g, gradePoint:gp };
    });
    const sgpa = (totalGradePoints / totalCredits).toFixed(2);
    const cgpa = ((parseFloat(sgpa) + 0.3*(si%3 - 1)) || parseFloat(sgpa)).toFixed(2);
    const fg   = grade(Math.round(totalMarks/semSubjects.length));

    results.push({
      studentId:id, enrollment, branch, semester:sem,
      studentName:name, photo, course,
      sgpa, cgpa,
      totalMarks,
      finalGrade: fg.grade,
      comment: cgpaComment(parseFloat(cgpa)),
      subjects: subjectResults,
    });
  });
}

// ── Static data ────────────────────────────────────────────────────────────────
const alumni = [
  {name:"Trina Saha",       branch:"CSE", year:"2024", company:"Google",     packageLpa:44, photo:"/assets/faces/face-16.png"},
  {name:"Madhumita Sarkar", branch:"IT",  year:"2023", company:"Microsoft",  packageLpa:24, photo:"/assets/faces/face-18.png"},
  {name:"Abhay Verma",      branch:"CSE", year:"2022", company:"Capgemini",  packageLpa:11, photo:"/assets/faces/face-24.png"},
  {name:"Sumedh Mudgalkar", branch:"ECE", year:"2024", company:"Infosys",    packageLpa:9,  photo:"/assets/faces/face-12.png"},
  {name:"Shweta Tiwari",    branch:"IT",  year:"2023", company:"Wipro",      packageLpa:12, photo:"/assets/faces/face-27.png"},
];

const books = [
  {id:"B001",title:"Introduction to Algorithms",author:"Cormen",available:true},
  {id:"B002",title:"Operating System Concepts",author:"Silberschatz",available:false},
  {id:"B003",title:"Database System Concepts",author:"Korth",available:true},
  {id:"B004",title:"Computer Networks",author:"Tanenbaum",available:true},
  {id:"B005",title:"Artificial Intelligence",author:"Russell & Norvig",available:false},
];

const hostels = [
  {id:"H1",name:"Sunrise Boys Hostel",  lat:22.7200,lng:75.8600,type:"boys",  fees:4000,amenities:["WiFi","Mess","Gym"]},
  {id:"H2",name:"Moonlight Girls Hostel",lat:22.7220,lng:75.8580,type:"girls", fees:4500,amenities:["WiFi","Mess","Library"]},
  {id:"H3",name:"Green Valley Hostel",  lat:22.7180,lng:75.8620,type:"mixed", fees:3800,amenities:["WiFi","Canteen"]},
];

const transportRoutes = [
  {hostelId:"H1",route:"Route A",stops:["Main Gate","Library","Boys Hostel"],timing:"7:30 AM & 5:00 PM"},
  {hostelId:"H2",route:"Route B",stops:["Main Gate","Admin Block","Girls Hostel"],timing:"7:30 AM & 5:00 PM"},
  {hostelId:"H3",route:"Route C",stops:["City Centre","Market","Green Valley"],timing:"8:00 AM & 4:30 PM"},
];

const fees = users
  .filter(u => u.role==="student")
  .map(u => ({
    studentId: u.id,
    total: 85000,
    paid:  65000,
    newCharges: 5000,
    dueDate: "2026-06-30",
    transactions: [
      {date:"2026-01-10",amount:35000,mode:"Online",ref:"TXN001"},
      {date:"2026-03-15",amount:30000,mode:"DD",    ref:"TXN002"},
    ]
  }));

const reminders = [
  {id:"R1",title:"Fee Payment Due",    date:"2026-06-30",type:"finance"},
  {id:"R2",title:"Mid-Semester Exams", date:"2026-07-10",type:"exam"},
  {id:"R3",title:"Library Book Return",date:"2026-06-15",type:"library"},
];

const store = { users, attendance, results, alumni, books, hostels, transportRoutes, fees, reminders };
fs.mkdirSync(path.dirname(DATA_FILE), {recursive:true});
fs.writeFileSync(DATA_FILE, JSON.stringify(store, null, 2));
console.log(`Store generated: ${users.filter(u=>u.role==="student").length} students, ${results.length} results`);
