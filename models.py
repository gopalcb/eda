from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.sql import expression

db = SQLAlchemy()


class StudentModel(db.Model):
    __tablename__ = 'students'

    id = db.Column(db.Integer, primary_key=True)
    firstname = db.Column(db.String(30), nullable=False)
    lastname = db.Column(db.String(30), nullable=False)
    app_date_time_from = db.Column(db.DateTime)
    app_date_time_to = db.Column(db.DateTime)
    email = db.Column(db.String(50), nullable=False)
    address = db.Column(db.String(100), nullable=False)
    phone = db.Column(db.String(20), nullable=False)

    def __init__(self, firstname, lastname, app_date_time_from, app_date_time_to, email, address, phone):
        self.firstname = firstname
        self.lastname = lastname
        self.app_date_time_from = app_date_time_from
        self.app_date_time_to = app_date_time_to
        self.email = email
        self.address = address
        self.phone = phone

    def __repr__(self):
        return f"{self.firstname}:{self.lastname}"


class ScheduleModel(db.Model):
    __tablename__ = 'schedules'
    id = db.Column(db.Integer, primary_key=True)
    description = db.Column(db.String(500), nullable=False)
    time_from = db.Column(db.DateTime)
    time_to = db.Column(db.DateTime)

    def __init__(self, description, time_from, time_to):
        self.description = description
        self.time_from = time_from
        self.time_to = time_to


class RatingsModel(db.Model):
    __tablename__ = 'ratings'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), nullable=False)
    star = db.Column(db.Integer, nullable=False)
    comments = db.Column(db.String(500), nullable=False)
    approve = db.Column(db.Boolean, server_default=expression.false(), nullable=False)

    def __init__(self, username, star, comments, approve):
        self.username = username
        self.star = star
        self.comments = comments
        self.approve = approve

    def __repr__(self):
        return self.id
