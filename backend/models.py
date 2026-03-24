from flask_sqlalchemy import SQLAlchemy
from datetime import date

db = SQLAlchemy()


class User(db.Model):
    __tablename__ = "users"
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    role = db.Column(db.String(20), default="student")
    bio = db.Column(db.Text, default="")
    phone = db.Column(db.String(20), default="")
    linkedin = db.Column(db.String(200), default="")
    github = db.Column(db.String(200), default="")
    graduation = db.Column(db.String(10), default="")
    student = db.relationship("Student", backref="user", uselist=False)


class Student(db.Model):
    __tablename__ = "students"
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), unique=True)
    roll_no = db.Column(db.String(20))
    branch = db.Column(db.String(50))
    cgpa = db.Column(db.Float, default=0.0)
    year = db.Column(db.Integer, default=4)
    skills = db.Column(db.Text, default="")
    profile_completion = db.Column(db.Integer, default=0)
    applications = db.relationship("Application", backref="student", lazy=True)


class Company(db.Model):
    __tablename__ = "companies"
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    industry = db.Column(db.String(100))
    domain = db.Column(db.String(100))
    location = db.Column(db.String(100))
    website = db.Column(db.String(200))
    contact_email = db.Column(db.String(120))
    contact_phone = db.Column(db.String(20))
    roles = db.Column(db.Integer, default=1)
    openings = db.Column(db.Integer, default=1)
    required_skills = db.Column(db.Text, default="")
    jobs = db.relationship("Job", backref="company", lazy=True, cascade="all, delete-orphan")


class Job(db.Model):
    __tablename__ = "jobs"
    id = db.Column(db.Integer, primary_key=True)
    company_id = db.Column(db.Integer, db.ForeignKey("companies.id"), nullable=False)
    role_title = db.Column(db.String(100), nullable=False)
    type = db.Column(db.String(20), default="Internship")
    stipend = db.Column(db.Float)
    ctc = db.Column(db.Float)
    drive_date = db.Column(db.Date)
    required_skills = db.Column(db.Text, default="")
    eligibility_cgpa = db.Column(db.Float, default=0.0)
    status = db.Column(db.String(20), default="Open")
    applications = db.relationship("Application", backref="job", lazy=True)


class Application(db.Model):
    __tablename__ = "applications"
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey("students.id"), nullable=False)
    job_id = db.Column(db.Integer, db.ForeignKey("jobs.id"), nullable=False)
    status = db.Column(db.String(20), default="Applied")
    applied_on = db.Column(db.Date, default=date.today)
    match_score = db.Column(db.Float, default=0.0)


def calculate_match_score(student_skills_str, job_skills_str):
    if not job_skills_str:
        return 0.0, [], []
    student_skills = {s.strip().lower() for s in student_skills_str.split(",") if s.strip()}
    job_skills = [s.strip() for s in job_skills_str.split(",") if s.strip()]
    if not job_skills:
        return 0.0, [], []
    matched = [s for s in job_skills if s.lower() in student_skills]
    missing = [s for s in job_skills if s.lower() not in student_skills]
    score = round((len(matched) / len(job_skills)) * 100, 1)
    return score, matched, missing
