from flask import Blueprint, request, jsonify, session
from database import get_db_connection
import MySQLdb.cursors

# 创建蓝图对象
user_teacher_bp = Blueprint('user_teacher', __name__, url_prefix='/api')

# 获取某课程的学生名单
@user_teacher_bp.route('/getStudentsByCourse/<int:course_id>', methods=['GET'])
def get_students_by_course(course_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor(MySQLdb.cursors.DictCursor)

        # 查询选修该课程的学生信息和成绩
        cursor.execute("""
            SELECT Student.student_id, Student.name, IFNULL(StudentScore.score, '') AS score
            FROM Enrollment
            JOIN Student ON Enrollment.student_id = Student.student_id
            LEFT JOIN StudentScore ON Enrollment.student_id = StudentScore.student_id AND Enrollment.course_id = StudentScore.course_id
            WHERE Enrollment.course_id = %s
        """, (course_id,))
        students = cursor.fetchall()

        cursor.close()
        conn.close()

        return jsonify({'success': True, 'students': students}), 200
    except MySQLdb.Error as err:
        print(f"数据库错误: {err}")
        return jsonify({'success': False, 'message': f"数据库错误: {str(err)}"}), 500

# 保存学生成绩
@user_teacher_bp.route('/saveGrade', methods=['POST'])
def save_grade():
    if session.get("role") != "teacher":
        return jsonify({"success": False, "message": "权限不足"}), 403

    data = request.get_json()
    student_id = data.get("student_id")
    course_id = data.get("course_id")
    score = data.get("score")

    if not student_id or not course_id or score is None:
        return jsonify({"success": False, "message": "缺少参数"}), 400

    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # 检查是否已有成绩记录
        cursor.execute("SELECT score_id FROM StudentScore WHERE student_id = %s AND course_id = %s",
                       (student_id, course_id))
        score_record = cursor.fetchone()

        if score_record:
            # 更新成绩
            cursor.execute("UPDATE StudentScore SET score = %s WHERE score_id = %s", (score, score_record['score_id']))
        else:
            # 插入新成绩
            cursor.execute("INSERT INTO StudentScore (student_id, course_id, score) VALUES (%s, %s, %s)",
                           (student_id, course_id, score))

        conn.commit()

        cursor.close()
        conn.close()

        return jsonify({"success": True, "message": "成绩保存成功"}), 200
    except MySQLdb.Error as err:
        print(f"数据库错误: {err}")
        return jsonify({"success": False, "message": f"成绩保存失败: {str(err)}"}), 500

# 获取教师的课程列表
@user_teacher_bp.route('/getTeacherCourses', methods=['GET'])
def get_teacher_courses():
    if session.get("role") != "teacher":
        return jsonify({"success": False, "message": "权限不足"}), 403

    teacher_id = session.get("user_id")

    try:
        conn = get_db_connection()
        cursor = conn.cursor(MySQLdb.cursors.DictCursor)

        # 查询教师的课程列表
        cursor.execute("""
            SELECT course_id, name
            FROM Course
            WHERE teacher_id = %s
        """, (teacher_id,))
        courses = cursor.fetchall()

        cursor.close()
        conn.close()

        return jsonify({'success': True, 'courses': courses}), 200
    except MySQLdb.Error as err:
        print(f"数据库错误: {err}")
        return jsonify({'success': False, 'message': f"数据库错误: {str(err)}"}), 500

# 获取所有课程安排
@user_teacher_bp.route('/getAllCourseSchedule', methods=['GET'])
def get_all_course_schedule():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(MySQLdb.cursors.DictCursor)

        # 查询所有课程的安排
        cursor.execute("""
            SELECT Course.course_id, Course.name, Teacher.name AS teacher_name
            FROM Course
            JOIN Teacher ON Course.teacher_id = Teacher.teacher_id
        """)
        courses = cursor.fetchall()

        cursor.close()
        conn.close()

        return jsonify({'success': True, 'courses': courses}), 200
    except MySQLdb.Error as err:
        print(f"数据库错误: {err}")
        return jsonify({'success': False, 'message': f"数据库错误: {str(err)}"}), 500