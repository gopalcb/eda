import datetime
import os
from csv import DictReader
from datetime import datetime

import pandas as pd
from flask import Flask, render_template, request, redirect, url_for, g, jsonify
from flask_login import LoginManager
from flask_login import login_user, logout_user, login_required
from flask_marshmallow import Marshmallow
from sqlalchemy import create_engine, false
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from werkzeug.utils import send_file, secure_filename
from flask import send_file

from flask_session import Session
from models import db, StudentModel, ScheduleModel, RatingsModel
from pathlib import Path

Base = declarative_base()
login_manager = LoginManager()
login_manager.login_view = 'login'

basedir = os.path.abspath(os.path.dirname(__file__))
UPLOAD_FOLDER = "/Users/sumedhamajumdar/Downloads/eda/docs"

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
# connection_string = 'sqlite:///' + os.path.join(basedir, 'students.db')

app.config["SESSION_PERMANENT"] = True
app.config["SESSION_TYPE"] = "filesystem"
app.secret_key = 'why would I tell you my secret key?'
app.config.from_object(__name__)
Session(app)
connection_string = 'sqlite:///app.db'

app.config['SQLALCHEMY_DATABASE_URI'] = connection_string

app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)
ma = Marshmallow(app)
engine = create_engine(connection_string)
Base.metadata.create_all(engine)
sessions = sessionmaker(bind=engine)
s = sessions()
login_manager.init_app(app)

month_map_dict = {
    1: 'Jan', 2: 'Feb', 3: 'Mar', 4: 'Apr',
    5: 'May', 6: 'Jun', 7: 'Jul', 8: 'Aug',
    9: 'Sep', 10: 'Oct', 11: 'Nov', 12: 'Dec'
}


class StudentSchema(ma.Schema):
    class Meta:
        fields = ('id', 'firstname', 'lastname', 'app_date_time_from', 'app_date_time_to', 'email', 'address', 'phone')


student_schema = StudentSchema()
students_schema = StudentSchema(many=True)


class ScheduleSchema(ma.Schema):
    class Meta:
        fields = ('id', 'description', 'time_from', 'time_to')


schedule_schema = ScheduleSchema()
schedules_schema = ScheduleSchema(many=True)


class RatingSchema(ma.Schema):
    class Meta:
        fields = ('id', 'username', 'star', 'comments', 'approve')


rating_schema = RatingSchema()
ratings_schema = RatingSchema(many=True)


class User:
    username = 'Jacob'
    password = 'Test123'

    # is_active = True

    def is_active(self):
        return True

    def get_id(self):
        return True

    def is_authenticated(self):
        return True


user = User()
print(user.username, user.password)


@app.before_request
def create_table():
    db.create_all()


# @app.route('/', methods=['GET','POST'])
# def create_():
#     if request.method == 'GET':
#         return {'success': True, 'data': [], 'message': ''}
@app.route('/', methods=['GET'])
def home():
    return render_template('home.html')


@app.route('/book_appointment', methods=["POST"])
# @login_required
def book_appointment():
    request_data = request.json
    firstname = request_data['fname']
    lastname = request_data['lname']
    app_date_time_from = request_data['app_date_time_from']
    app_date_time_from_obj = datetime.strptime(app_date_time_from, '%b %d %Y %I:%M%p')
    app_date_time_to = request_data['app_date_time_to']
    app_date_time_to_obj = datetime.strptime(app_date_time_to, '%b %d %Y %I:%M%p')
    print(app_date_time_to_obj)
    print(type(app_date_time_to_obj))
    email = request_data['email']
    address = request_data['address']
    phone = request_data['phone']

    new_student = StudentModel(firstname, lastname, app_date_time_from_obj, app_date_time_to_obj, email, address, phone)

    db.session.add(new_student)
    db.session.commit()

    return {'ok': True}


@app.route("/list_appointments", methods=["GET"])
# @login_required
def list_appointments():
    all_students = StudentModel.query.all()
    results = students_schema.dump(all_students)

    response_dict_list = []

    for res_dict in results:
        response_dict = {}

        ftime = res_dict['app_date_time_from']
        ttime = res_dict['app_date_time_to']

        date, time = ftime.split('T')[0], ftime.split('T')[1]
        dates = date.split('-')

        time_from = datetime.strptime(f"{time.split(':')[0]}:{time.split(':')[1]}", "%H:%M")
        time_from = time_from.strftime("%I:%M%p")

        time_to = ttime.split('T')[1]
        time_to = datetime.strptime(f"{time_to.split(':')[0]}:{time_to.split(':')[1]}", "%H:%M")
        time_to = time_to.strftime("%I:%M%p")

        # JAN , ..
        month = month_map_dict[int(dates[1])]
        # 1, 2..
        day = dates[2]
        year = dates[0]

        date_string = f'{month} {day}, {year} {time_from} - {time_to}'

        response_dict['id'] = res_dict['id']
        response_dict['fname'] = res_dict['firstname']
        response_dict['lname'] = res_dict['lastname']
        response_dict['email'] = res_dict['email']
        response_dict['phone'] = res_dict['phone']
        response_dict['address'] = res_dict['address']
        response_dict['app_date'] = date_string

        response_dict_list.append(response_dict)

    return {'ok': True, 'data': response_dict_list}


@app.route("/update_booking/<id>", methods=["POST"])
# @login_required
def update_booking(id):
    student = StudentModel.query.get(id)
    request_data = request.json
    firstname = request_data['fname']
    lastname = request_data['lname']
    app_date_time_from = request_data['app_date_time_from']
    app_date_time_from_obj = datetime.strptime(app_date_time_from, '%b %d %Y %I:%M%p')
    app_date_time_to = request_data['app_date_time_to']
    app_date_time_to_obj = datetime.strptime(app_date_time_to, '%b %d %Y %I:%M%p')
    email = request_data['email']
    address = request_data['address']
    phone = request_data['phone']

    student.firstname = firstname
    student.lastname = lastname
    student.app_date_time_from = app_date_time_from_obj
    student.app_date_time_to = app_date_time_to_obj
    student.email = email
    student.address = address
    student.phone = phone

    db.session.commit()
    # return student_schema.jsonify(student)
    return {'ok': True}


@app.route("/delete_booking/<id>", methods=["POST"])
# @login_required
def delete_booking(id):
    student = StudentModel.query.get(id)
    db.session.delete(student)
    db.session.commit()

    return {'ok': True}


@app.route('/add_schedule', methods=["POST"])
# @login_required
def add_schedule():
    request_data = request.json
    description = request_data['title']
    time_from = request_data['ftime']
    time_from_obj = datetime.strptime(time_from, '%b %d %Y %I:%M%p')

    time_to = request_data['ttime']
    time_to_obj = datetime.strptime(time_to, '%b %d %Y %I:%M%p')

    new_schedule = ScheduleModel(description, time_from_obj, time_to_obj)

    db.session.add(new_schedule)
    db.session.commit()

    return {'ok': True}


@app.route("/list_schedules", methods=["GET"])
# @login_required
def list_schedules():
    all_schedules = ScheduleModel.query.all()
    results = schedules_schema.dump(all_schedules)

    response_dict_list = []

    for res_dict in results:
        response_dict = {}

        ftime = res_dict['time_from']
        ttime = res_dict['time_to']

        date, time = ftime.split('T')[0], ftime.split('T')[1]
        dates = date.split('-')

        time_from = datetime.strptime(f"{time.split(':')[0]}:{time.split(':')[1]}", "%H:%M")
        time_from = time_from.strftime("%I:%M%p")

        time_to = ttime.split('T')[1]
        time_to = datetime.strptime(f"{time_to.split(':')[0]}:{time_to.split(':')[1]}", "%H:%M")
        time_to = time_to.strftime("%I:%M%p")

        # JAN , ..
        month = month_map_dict[int(dates[1])]
        # 1, 2..
        day = dates[2]
        year = dates[0]

        date_string = f'{month} {day}, {year} {time_from} - {time_to}'

        response_dict['id'] = res_dict['id']
        response_dict['title'] = res_dict['description']
        response_dict['schedule'] = date_string
        print(type(date_string))

        response_dict_list.append(response_dict)

    return {'ok': True, 'data': response_dict_list}


@app.route("/active_schedules", methods=["GET"])
# @login_required
def get_schedule_by_date():
    present_date = datetime.now()
    schedule_dates = ScheduleModel.query.filter(ScheduleModel.time_from >= present_date).all()
    results = schedules_schema.dump(schedule_dates)

    response_dict_list = []

    for res_dict in results:
        response_dict = {}

        ftime = res_dict['time_from']
        ttime = res_dict['time_to']

        date, time = ftime.split('T')[0], ftime.split('T')[1]
        dates = date.split('-')

        time_from = datetime.strptime(f"{time.split(':')[0]}:{time.split(':')[1]}", "%H:%M")
        time_from = time_from.strftime("%I:%M%p")

        time_to = ttime.split('T')[1]
        time_to = datetime.strptime(f"{time_to.split(':')[0]}:{time_to.split(':')[1]}", "%H:%M")
        time_to = time_to.strftime("%I:%M%p")

        # JAN , ..
        month = month_map_dict[int(dates[1])]
        # 1, 2..
        day = dates[2]
        year = dates[0]

        date_string = f'{month} {day}, {year} {time_from} - {time_to}'

        response_dict['id'] = res_dict['id']
        response_dict['title'] = res_dict['description']
        response_dict['schedule'] = date_string
        print(type(date_string))

        response_dict_list.append(response_dict)

    return {'ok': True, 'data': response_dict_list}


@app.route("/schedule_delete/<id>", methods=["POST"])
# @login_required
def schedule_delete(id):
    schedule = ScheduleModel.query.get(id)
    db.session.delete(schedule)
    db.session.commit()
    return {'ok': True}


@app.route("/get_ratings", methods=["GET"])
# @login_required
def get_ratings():
    all_ratings = RatingsModel.query.all()
    result = ratings_schema.dump(all_ratings)

    return {'ok': True, 'data': result}


@app.route("/rating_delete/<id>", methods=["POST"])
# @login_required
def rating_delete(id):
    rating = RatingsModel.query.get(id)
    db.session.delete(rating)
    db.session.commit()
    return {'ok': True}


@app.route('/add_rating', methods=["POST"])
# @login_required
def add_rating():
    request_data = request.json
    username = request_data['username']
    star = request_data['star']
    comments = request_data['comments']
    approve = False

    new_rating = RatingsModel(username, star, comments, approve)

    db.session.add(new_rating)
    db.session.commit()

    return {'ok': True}


# @app.route('/get_comments_by_id/<id>', methods=['GET'])
# def get_comments_by_id(id):
#     rating = RatingsModel.query.get(id)
#     return rating_schema.jsonify(rating)


@app.route('/approve_comments/<id>', methods=['POST'])
@login_required
def approve_comments(id):
    rating = RatingsModel.query.get(id)
    request_data = request.json
    username = request_data['username']
    star = request_data['star']
    comments = request_data['comments']

    rating.approve = True
    rating.username = username
    rating.star = star
    rating.comments = comments
    db.session.commit()
    return {'ok': True}


@app.route('/approved_rating_list', methods=['GET'])
# @login_required
def approved_rating_list():
    approved_comments = RatingsModel.query.all()
    results = ratings_schema.dump(approved_comments)
    response_dict_list = []
    for res_dict in results:
        response_dict = {}

        comments_approved = res_dict['approve']
        if comments_approved:
            response_dict['id'] = res_dict['id']
            response_dict['username'] = res_dict['username']
            response_dict['star'] = res_dict['star']
            response_dict['comments'] = res_dict['comments']
            response_dict['approve'] = comments_approved

            response_dict_list.append(response_dict)

    return {'ok': True, 'data': response_dict_list}


@app.route('/unapproved_rating_list', methods=['GET'])
# @login_required
def unapproved_rating_list():
    unapproved_comments = RatingsModel.query.all()
    results = ratings_schema.dump(unapproved_comments)
    response_dict_list = []
    for res_dict in results:
        response_dict = {}

        comments_approved = res_dict['approve']
        if not comments_approved:
            response_dict['id'] = res_dict['id']
            response_dict['username'] = res_dict['username']
            response_dict['star'] = res_dict['star']
            response_dict['comments'] = res_dict['comments']
            response_dict['approve'] = comments_approved

            response_dict_list.append(response_dict)

    return {'ok': True, 'data': response_dict_list}


@app.route('/login', methods=['POST'])
def login():
    request_data = request.json
    username = request_data['username']
    password = request_data['password']

    if user.username == username and user.password == password:
        login_user(user)
        return {'ok': True}

    return {'ok': False}


@app.route('/logout', methods=['POST'])
# @login_required
def logout():
    logout_user()
    return {'ok': True}


@login_manager.user_loader
def load_user(user_id):
    return user


@app.route('/get_all_files', methods=['GET'])
def get_all_files():
    # cwd = Path(os.getcwd())
    # directory = cwd / Path('files')
    abs_path = os.getcwd()
    rel_path = Path(abs_path).joinpath('docs')
    for path, subdirs, docs in os.walk(rel_path):
        for name in docs:
            print(os.path.join(path, name))
    return {'ok': True, 'data': docs}


@app.route('/list_files_dict', methods=['GET'])
def list_files_dict():
    files = [{
        "name": "Ford",
        "age": 26,
    },
        {
            "name": "Heather",
            "age": 21
        },
        {
            "name": "Seth",
            "age": 19
        }]
    return {'ok': True, 'data': files}


@app.route('/book_an_appointment', methods=["GET"])
def book_an_appointment():
    return render_template('student.html')


@app.route('/my_schedule', methods=["GET"])
# @login_required
def my_schedule():
    return render_template('schedule.html')


@app.route('/my_appointments', methods=["GET"])
# @login_required
def my_appointments():
    return render_template('appointments.html')


@app.route('/instructor_login', methods=["GET"])
def instructor_login():
    return render_template('login.html')


@app.route('/instructor_logout', methods=["GET"])
# @login_required
def instructor_logout():
    logout_user()
    return render_template('home.html')


@app.route('/ratings', methods=["GET"])
# @login_required
def ratings():
    return render_template('ratings.html')


@app.route('/my_files', methods=["GET"])
# @login_required
def my_files():
    return render_template('files.html')


@app.route('/view_files', methods=["GET"])
# @login_required
def view_files():
    return render_template('view_xls_csv_file.html')


@app.route('/upload_files')
def upload_doc():
    return render_template('file-upload.html')


# @app.route('/delete_file/<filename>', methods=["POST"])
# def delete_file():
#     return render_template('files.html')


@app.route('/load_xls_file/<filename>', methods=["GET"])
def load_file(filename):
    abs_path = os.getcwd()
    rel_path = Path(abs_path).joinpath('docs').joinpath(filename)
    file_path = rel_path
    df = pd.read_excel(file_path)
    df_new = df.T.to_dict().values()
    data_dict_list = []
    for data_dict in df_new:
        data_dict_ = {}
        for key, val in data_dict.items():
            data_dict_[key] = val
        data_dict_list.append(data_dict_)

    print(data_dict_list)
    return {'ok': True, 'data': data_dict_list}


@app.route('/load_csv_file/<filename>', methods=['GET'])
def load_csv_file(filename):
    # global df_csv
    abs_path = os.getcwd()
    rel_path = Path(abs_path).joinpath('docs').joinpath(filename)
    filename_path = Path(rel_path).name
    if filename.endswith('.csv') and filename == filename_path:
        with open(rel_path, 'r') as f:
            dict_reader = DictReader(f)

            list_of_dict = list(dict_reader)

            print(list_of_dict)

    return {'ok': True, 'data': list_of_dict}


# ALLOWED_EXTENSIONS = set(['txt', 'pdf', 'png', 'jpg', 'jpeg', 'gif'])
#
#
# def allowed_file(filename):
#     return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


@app.route('/upload_docs', methods=['POST'])
def upload_docs():
    isthisFile = request.files.get('file')
    print(isthisFile)
    print(isthisFile.filename)
    if isthisFile.filename.endswith('.xls') or isthisFile.filename.endswith('.xlsx') or isthisFile.filename.endswith(
            'csv') or isthisFile.filename.endswith(
        '.pdf') or isthisFile.filename.endswith('.jpeg') or isthisFile.filename.endswith('.png') or \
            isthisFile.filename.endswith('.doc') or isthisFile.filename.endswith(
        '.docx') or isthisFile.filename.endswith('.txt'):
        with open(os.path.join(UPLOAD_FOLDER, isthisFile.filename), "wb") as fp:
            fp.write(request.data)

    # if 'files[]' not in request.files:
    #     resp = jsonify({'message': 'No file part in the request'})
    #     resp.status_code = 400
    #     return resp
    #
    # files = request.files.getlist('files[]')
    #
    # errors = {}
    # success = False
    #
    # for file in files:
    #     if file and allowed_file(file.filename):
    #         filename = secure_filename(file.filename)
    #         file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
    #         success = True
    #     else:
    #         errors[file.filename] = 'File type is not allowed'
    #
    # if success and errors:
    #     errors['message'] = 'File(s) successfully uploaded'
    #     resp = jsonify(errors)
    #     resp.status_code = 206
    #     return resp
    # if success:
    #     resp = jsonify({'message': 'Files successfully uploaded'})
    #     resp.status_code = 201
    #     return resp
    # else:
    #     resp = jsonify(errors)
    #     resp.status_code = 400
    #     return resp
    return {'ok': True}


@app.route('/download_file/<filename>', methods=['GET'])
def download_file(filename):
    abs_path = os.getcwd()
    rel_path = Path(abs_path).joinpath('docs').joinpath(filename)

    return send_file(rel_path, as_attachment=True)


@app.route('/delete_file/<filename>', methods=['POST'])
def delete_file(filename):
    abs_path = os.getcwd()
    rel_path = Path(abs_path).joinpath('docs').joinpath(filename)
    if rel_path:
        os.remove(rel_path)
    else:
        print("The file does not exist")
    return {'ok': True}


if __name__ == "__main__":
    app.run(host='0.0.0.0')
