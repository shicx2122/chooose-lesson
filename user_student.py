from flask import Blueprint, request, jsonify, session
from database import get_db_connection
import MySQLdb.cursors

# 创建蓝图对象
user_student_bp = Blueprint('user_student', __name__, url_prefix='/api')

# 获取所有可选课程（学生界面用）
@user_student_bp.route('/getSelectableCourses', methods=['GET'])
def get_selectable_courses():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(MySQLdb.cursors.DictCursor)  # 使用DictCursor，不是dictionary=True

        # 只查询 `is_selectable = TRUE` 的课程，并关联教师信息和已选学生数量
        cursor.execute("""
            SELECT Course.course_id, Course.name, Course.credit, Course.capacity, 
                   Teacher.name AS teacher_name,
                   (Course.capacity - IFNULL(enrolled_count, 0)) AS remaining_capacity
            FROM Course
            JOIN Teacher ON Course.teacher_id = Teacher.teacher_id
            LEFT JOIN (
                SELECT course_id, COUNT(*) as enrolled_count
                FROM Enrollment
                GROUP BY course_id
            ) AS EnrollCount ON Course.course_id = EnrollCount.course_id
            WHERE Course.is_selectable = TRUE
        """)
        courses = cursor.fetchall()

        cursor.close()
        conn.close()

        return jsonify({'success': True, 'courses': courses}), 200
    except MySQLdb.Error as err:
        print(f"数据库错误: {err}")
        return jsonify({'success': False, 'message': f'数据库错误: {str(err)}'}), 500

# 选课接口
@user_student_bp.route('/enrollCourse', methods=['POST'])
def enroll_course():
    if session.get("role") != "student":
        return jsonify({"success": False, "message": "权限不足"}), 403

    data = request.get_json()
    student_id = session.get("user_id")
    course_id = data.get("course_id")

    if not course_id:
        return jsonify({"success": False, "message": "缺少课程编号"}), 400

    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # 检查课程是否存在且可选
        cursor.execute("SELECT capacity, (SELECT COUNT(*) FROM Enrollment WHERE course_id = %s) as enrolled_count FROM Course WHERE course_id = %s", (course_id, course_id))
        course = cursor.fetchone()
        if not course:
            return jsonify({"success": False, "message": "课程不存在"}), 400

        capacity, enrolled_count = course
        if enrolled_count >= capacity:
            return jsonify({"success": False, "message": "课容量不足，选课失败"}), 400

        # 插入选课记录
        cursor.execute("INSERT INTO Enrollment (student_id, course_id) VALUES (%s, %s)", (student_id, course_id))
        conn.commit()

        cursor.close()
        conn.close()

        return jsonify({"success": True, "message": "选课成功！"}), 200
    except MySQLdb.Error as err:
        print(f"数据库错误: {err}")
        return jsonify({"success": False, "message": f"选课失败: {str(err)}"}), 500

# 获取已选课程（学生界面用）
@user_student_bp.route('/getSelectedCourses', methods=['GET'])
def get_selected_courses():
    if session.get("role") != "student":
        return jsonify({"success": False, "message": "权限不足"}), 403

    try:
        conn = get_db_connection()
        cursor = conn.cursor(MySQLdb.cursors.DictCursor)

        student_id = session.get("user_id")

        cursor.execute("""
            SELECT Course.course_id, Course.name, Course.credit, Teacher.name AS teacher_name
            FROM Enrollment
            JOIN Course ON Enrollment.course_id = Course.course_id
            JOIN Teacher ON Course.teacher_id = Teacher.teacher_id
            WHERE Enrollment.student_id = %s
        """, (student_id,))
        selected_courses = cursor.fetchall()

        cursor.close()
        conn.close()

        return jsonify({'success': True, 'selected_courses': selected_courses}), 200
    except MySQLdb.Error as err:
        print(f"数据库错误: {err}")
        return jsonify({'success': False, 'message': f'数据库错误: {str(err)}'}), 500

# 退课接口
# 退课接口
@user_student_bp.route('/dropCourse', methods=['POST'])
def drop_course():
    if session.get("role") != "student":
        return jsonify({"success": False, "message": "权限不足"}), 403

    data = request.get_json()
    student_id = session.get("user_id")
    course_id = data.get("course_id")

    if not course_id:
        return jsonify({"success": False, "message": "缺少课程编号"}), 400

    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute("DELETE FROM Enrollment WHERE student_id = %s AND course_id = %s", (student_id, course_id))
        conn.commit()

        cursor.close()
        conn.close()

        return jsonify({"success": True, "message": "退课成功！"}), 200
    except MySQLdb.Error as err:
        print(f"数据库错误: {err}")
        return jsonify({"success": False, "message": f"退课失败: {str(err)}"}), 500

# 更改学生密码
@user_student_bp.route('/changePassword', methods=['POST'])
def change_password():
    if session.get("role") != "student":
        return jsonify({"success": False, "message": "权限不足"}), 403

    data = request.get_json()
    current_password = data.get("current_password")
    new_password = data.get("new_password")
    confirm_password = data.get("confirm_password")

    if not new_password or not confirm_password:
        return jsonify({"success": False, "message": "新密码不能为空"}), 400

    if new_password != confirm_password:
        return jsonify({"success": False, "message": "新密码和确认密码不一致"}), 400

    student_id = session.get("user_id")

    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # 检查当前密码是否正确
        cursor.execute("SELECT password FROM Student WHERE student_id=%s", (student_id,))
        current_db_password = cursor.fetchone()

        if not current_db_password or current_db_password[0] != current_password:
            return jsonify({"success": False, "message": "当前密码错误"}), 400

        # 更新密码
        cursor.execute("UPDATE Student SET password=%s WHERE student_id=%s", (new_password, student_id))
        conn.commit()

        cursor.close()
        conn.close()

        return jsonify({"success": True, "message": "密码更改成功"}), 200
    except MySQLdb.Error as err:
        print(f"数据库错误: {err}")
        return jsonify({"success": False, "message": f"数据库错误: {str(err)}"}), 500