from app import create_app
from models import db, User, Student, Company, Job, Application
from werkzeug.security import generate_password_hash
from datetime import date, timedelta
import random

app = create_app()

with app.app_context():
    # Wipe and recreate
    db.drop_all()
    db.create_all()

    def make_user(name, email, password, role="student"):
        u = User(name=name, email=email, password=generate_password_hash(password), role=role)
        db.session.add(u)
        db.session.flush()
        return u

    # ── Admin ──────────────────────────────────────────────
    make_user("Admin User", "admin@college.edu", "admin123", "admin")

    # ── Companies ─────────────────────────────────────────
    companies_data = [
        ("Google",        "Technology",   "Bangalore",  "https://google.com",       "campus@google.com",    "+91 9000000001", 4, 12, "Python,ML,System Design,Go"),
        ("Microsoft",     "Technology",   "Hyderabad",  "https://microsoft.com",    "campus@microsoft.com", "+91 9000000002", 3, 8,  "C++,Azure,React,TypeScript"),
        ("Amazon",        "E-Commerce",   "Bangalore",  "https://amazon.com",       "campus@amazon.com",    "+91 9000000003", 5, 15, "Java,AWS,DSA,Python"),
        ("Infosys",       "Consulting",   "Pune",       "https://infosys.com",      "campus@infosys.com",   "+91 9000000004", 6, 30, "Java,SQL,Spring Boot"),
        ("TCS",           "Consulting",   "Chennai",    "https://tcs.com",          "campus@tcs.com",       "+91 9000000005", 8, 50, "Java,Python,SQL,Testing"),
        ("Wipro",         "Technology",   "Bangalore",  "https://wipro.com",        "campus@wipro.com",     "+91 9000000006", 4, 20, "Python,Java,Cloud,DevOps"),
        ("Flipkart",      "E-Commerce",   "Bangalore",  "https://flipkart.com",     "campus@flipkart.com",  "+91 9000000007", 3, 10, "React,Node.js,MongoDB,Redis"),
        ("Deloitte",      "Finance",      "Mumbai",     "https://deloitte.com",     "campus@deloitte.com",  "+91 9000000008", 3, 12, "Excel,SQL,Python,PowerBI"),
        ("HDFC Bank",     "Finance",      "Mumbai",     "https://hdfcbank.com",     "campus@hdfc.com",      "+91 9000000009", 2, 8,  "SQL,Excel,Python,Finance"),
        ("Zomato",        "Technology",   "Gurgaon",    "https://zomato.com",       "campus@zomato.com",    "+91 9000000010", 2, 6,  "React,Node.js,Python,SQL"),
    ]
    cos = []
    for name, domain, loc, web, email, phone, roles, openings, skills in companies_data:
        c = Company(name=name, domain=domain, industry=domain, location=loc,
                    website=web, contact_email=email, contact_phone=phone,
                    roles=roles, openings=openings, required_skills=skills)
        db.session.add(c)
        cos.append(c)
    db.session.flush()

    # ── Jobs ──────────────────────────────────────────────
    jobs_data = [
        (0, "Software Engineer Intern",      "Internship", 60000, None, "Python,ML,System Design",  7.5, date.today()+timedelta(days=20)),
        (0, "ML Engineer",                   "Placement",  None, 18.0, "Python,ML,Go",              8.0, date.today()+timedelta(days=25)),
        (1, "SDE Intern",                    "Internship", 80000, None, "C++,Azure,TypeScript",     7.0, date.today()+timedelta(days=15)),
        (1, "Full Stack Developer",          "Placement",  None, 20.0, "React,TypeScript,Azure",    7.5, date.today()+timedelta(days=30)),
        (2, "SDE-1",                         "Placement",  None, 22.0, "Java,AWS,DSA",              8.0, date.today()+timedelta(days=18)),
        (2, "Cloud Support Intern",          "Internship", 50000, None, "AWS,Python,DSA",           6.5, date.today()+timedelta(days=22)),
        (3, "Systems Engineer",              "Placement",  None, 6.5,  "Java,SQL,Spring Boot",      6.0, date.today()+timedelta(days=35)),
        (3, "Technology Analyst",            "Placement",  None, 8.0,  "Java,Python,SQL",           6.5, date.today()+timedelta(days=40)),
        (4, "Assistant System Engineer",     "Placement",  None, 7.0,  "Java,Python,SQL,Testing",   6.0, date.today()+timedelta(days=45)),
        (4, "Intern Engineer",               "Internship", 15000, None, "Python,SQL,Testing",       6.0, date.today()+timedelta(days=10)),
        (5, "DevOps Engineer",               "Placement",  None, 9.0,  "Python,Cloud,DevOps",       7.0, date.today()+timedelta(days=28)),
        (6, "Frontend Developer",            "Placement",  None, 12.0, "React,Node.js,MongoDB",     7.0, date.today()+timedelta(days=20)),
        (6, "Backend Intern",                "Internship", 40000, None, "Node.js,MongoDB,Redis",    6.5, date.today()+timedelta(days=12)),
        (7, "Business Analyst",              "Placement",  None, 10.0, "Excel,SQL,Python,PowerBI",  6.5, date.today()+timedelta(days=30)),
        (8, "Finance Analyst Intern",        "Internship", 25000, None, "SQL,Excel,Finance",        6.0, date.today()+timedelta(days=15)),
        (9, "Product Analyst",               "Placement",  None, 11.0, "React,Python,SQL",          7.0, date.today()+timedelta(days=25)),
    ]
    job_objs = []
    for ci, title, jtype, stipend, ctc, skills, cgpa, ddate in jobs_data:
        j = Job(company_id=cos[ci].id, role_title=title, type=jtype,
                stipend=stipend, ctc=ctc, required_skills=skills,
                eligibility_cgpa=cgpa, drive_date=ddate)
        db.session.add(j)
        job_objs.append(j)
    db.session.flush()

    # ── Students ──────────────────────────────────────────
    students_raw = [
        ("Rahul Sharma",   "rahul@college.edu",   "student123", "CSE",  8.5, "Python,React,Java,ML,SQL",              85),
        ("Priya Patel",    "priya@college.edu",   "student123", "ECE",  7.8, "C++,Python,VLSI,Embedded",              70),
        ("Amit Kumar",     "amit@college.edu",    "student123", "MBA",  7.2, "Excel,SQL,PowerBI,Finance,Python",       75),
        ("Sneha Reddy",    "sneha@college.edu",   "student123", "CSE",  9.1, "ML,Python,TensorFlow,Deep Learning,SQL", 90),
        ("Rohan Mehta",    "rohan@college.edu",   "student123", "BCA",  7.5, "JavaScript,React,Node.js,MongoDB",       65),
        ("Ananya Singh",   "ananya@college.edu",  "student123", "CSE",  8.2, "Java,Spring Boot,SQL,AWS",               80),
        ("Karan Verma",    "karan@college.edu",   "student123", "IT",   7.9, "Python,Django,React,PostgreSQL",         72),
        ("Divya Nair",     "divya@college.edu",   "student123", "ECE",  8.0, "C++,Python,DSP,MATLAB",                  68),
        ("Arjun Gupta",    "arjun@college.edu",   "student123", "CSE",  9.3, "Java,AWS,DSA,System Design,Python",      95),
        ("Meera Iyer",     "meera@college.edu",   "student123", "MCA",  8.1, "Java,SQL,Spring Boot,Hibernate",         78),
        ("Vikram Joshi",   "vikram@college.edu",  "student123", "CSE",  7.6, "React,Node.js,MongoDB,Docker",           60),
        ("Pooja Sharma",   "pooja@college.edu",   "student123", "MBA",  7.4, "Excel,SQL,Finance,PowerBI",              55),
        ("Nikhil Das",     "nikhil@college.edu",  "student123", "IT",   8.3, "Python,Flask,React,SQL",                 82),
        ("Riya Kapoor",    "riya@college.edu",    "student123", "CSE",  8.7, "ML,Python,NLP,TensorFlow,SQL",           88),
        ("Saurabh Tiwari", "saurabh@college.edu", "student123", "Mech", 6.8, "AutoCAD,MATLAB,Python,C++",              45),
    ]
    student_objs = []
    for name, email, pwd, branch, cgpa, skills, completion in students_raw:
        u = make_user(name, email, pwd)
        s = Student(user_id=u.id, branch=branch, cgpa=cgpa,
                    skills=skills, profile_completion=completion)
        db.session.add(s)
        student_objs.append(s)
    db.session.flush()

    # ── Applications (realistic spread) ───────────────────
    app_assignments = [
        # (student_idx, job_idx, status)
        (0,  0,  "Selected"),
        (0,  4,  "Applied"),
        (0,  11, "Rejected"),
        (1,  2,  "Selected"),
        (1,  7,  "Applied"),
        (2,  13, "Selected"),
        (2,  14, "Applied"),
        (3,  0,  "Selected"),
        (3,  1,  "Applied"),
        (3,  15, "Applied"),
        (4,  12, "Applied"),
        (4,  6,  "Rejected"),
        (5,  4,  "Selected"),
        (5,  3,  "Applied"),
        (6,  11, "Applied"),
        (6,  12, "Applied"),
        (7,  2,  "Rejected"),
        (7,  9,  "Applied"),
        (8,  4,  "Selected"),
        (8,  0,  "Applied"),
        (8,  1,  "Applied"),
        (9,  6,  "Selected"),
        (9,  7,  "Applied"),
        (10, 11, "Applied"),
        (10, 12, "Rejected"),
        (11, 13, "Applied"),
        (11, 14, "Applied"),
        (12, 15, "Applied"),
        (12, 11, "Selected"),
        (13, 0,  "Applied"),
        (13, 1,  "Selected"),
        (14, 8,  "Applied"),
    ]

    from models import calculate_match_score
    for si, ji, status in app_assignments:
        s = student_objs[si]
        j = job_objs[ji]
        score, _, _ = calculate_match_score(s.skills or "", j.required_skills or "")
        a = Application(student_id=s.id, job_id=j.id, status=status,
                        match_score=score,
                        applied_on=date.today() - timedelta(days=random.randint(1, 30)))
        db.session.add(a)

    db.session.commit()

    print("✅ Seed complete!")
    print(f"   Users:        {User.query.count()} (1 admin + 15 students)")
    print(f"   Companies:    {Company.query.count()}")
    print(f"   Jobs:         {Job.query.count()}")
    print(f"   Applications: {Application.query.count()}")
    print()
    print("Demo credentials:")
    print("  Student: rahul@college.edu / student123")
    print("  Admin:   admin@college.edu / admin123")
