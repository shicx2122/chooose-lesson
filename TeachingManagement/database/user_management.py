from flask import Blueprint, request, jsonify, session
from database import get_db_connection
import MySQLdb.cursors

# 创建蓝图对象
user_management_bp = Blueprint('user_management', __name__, url_prefix='/api')

# 处理学生账户创建
@user_management_bp.route('/addStudent', methods=['POST'])
def add_student():
    data = request.get_json()

    # 获取前端传递的 JSON 数据
    student_id = data.get('student_id')
    name = data.get('name')
    gender = data.get('gender')
    enrollment_year = data.get('enrollment_year')
    major = data.get('major')
    password = data.get('password')

    # 检查字段是否为空
    if not all([student_id, name, gender, enrollment_year, major]):
        return jsonify({'success': False, 'message': '缺少必要的字段'}), 400

    # 确保性别字段符合ENUM('男', '女')的约束
    if gender not in ['男', '女']:
        return jsonify({'success': False, 'message': '性别必须是"男"或"女"'}), 400

    try:
        # 确保student_id是整数类型
        try:
            student_id = int(student_id)
        except ValueError:
            return jsonify({'success': False, 'message': '学号必须是数字'}), 400

        # 确保enrollment_year是有效的年份格式
        try:
            enrollment_year = int(enrollment_year)
            if enrollment_year < 1900 or enrollment_year > 2100:  # 合理的年份范围
                return jsonify({'success': False, 'message': '请输入有效的入学年份'}), 400
        except ValueError:
            return jsonify({'success': False, 'message': '入学年份必须是数字'}), 400

        # 连接数据库
        conn = get_db_connection()
        cursor = conn.cursor()

        # 如果没有提供密码，则设置默认密码
        if not password:
            password = '000000'  # 默认密码

        # 插入数据到Student表
        cursor.execute(
            "INSERT INTO Student (student_id, name, gender, enrollment_year, major, password) VALUES (%s, %s, %s, %s, %s, %s)",
            (student_id, name, gender, enrollment_year, major, password))
        conn.commit()

        # 关闭数据库连接
        cursor.close()
        conn.close()

        return jsonify({'success': True, 'message': '学生账户创建成功！'}), 200
    except MySQLdb.Error as err:
        print(f"数据库错误: {err}")
        # 检查是否是唯一键冲突错误
        if err.args[0] == 1062:  # MySQL错误码1062表示唯一键冲突
            return jsonify({'success': False, 'message': '该学号已存在'}), 400
        return jsonify({'success': False, 'message': f'数据库错误: {str(err)}'}), 500

# 处理删除学生
@user_management_bp.route('/deleteStudent', methods=['DELETE'])
def delete_student():
    student_id = request.args.get("student_id")

    if not student_id:
        return jsonify({"success": False, "message": "缺少 student_id"}), 400

    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM Student WHERE student_id = %s", (student_id,))
        conn.commit()
        cursor.close()
        conn.close()

        return jsonify({"success": True, "message": "学生删除成功！"}), 200
    except MySQLdb.Error as err:
        print(f"数据库错误: {err}")
        return jsonify({"success": False, "message": "删除学生失败"}), 500

# 处理教师账户创建
@user_management_bp.route('/addTeacher', methods=['POST'])
def add_teacher():
    data = request.get_json()

    # 获取前端传递的 JSON 数据
    teacher_id = data.get('teacher_id')
    name = data.get('name')
    gender = data.get('gender')
    title = data.get('title')
    department = data.get('department')
    password = data.get('password')

    # 检查字段是否为空
    if not all([teacher_id, name, gender, title, department]):
        return jsonify({'success': False, 'message': '缺少必要的字段'}), 400

    # 确保性别字段符合ENUM('男', '女')的约束
    if gender not in ['男', '女']:
        return jsonify({'success': False, 'message': '性别必须是"男"或"女"'}), 400

    try:
        # 确保teacher_id是整数类型
        try:
            teacher_id = int(teacher_id)
        except ValueError:
            return jsonify({'success': False, 'message': '教师编号必须是数字'}), 400

        # 连接数据库
        conn = get_db_connection()
        cursor = conn.cursor()

        # 如果没有提供密码，则设置默认密码
        if not password:
            password = '000000'  # 默认密码

        # 插入数据到Teacher表
        cursor.execute(
            "INSERT INTO Teacher (teacher_id, name, gender, title, department, password) VALUES (%s, %s, %s, %s, %s, %s)",
            (teacher_id, name, gender, title, department, password))
        conn.commit()

        # 关闭数据库连接
        cursor.close()
        conn.close()

        return jsonify({'success': True, 'message': '教师账户创建成功！'}), 200
    except MySQLdb.Error as err:
        print(f"数据库错误: {err}")
        # 检查是否是唯一键冲突错误
        if err.args[0] == 1062:  # MySQL错误码1062表示唯一键冲突
            return jsonify({'success': False, 'message': '该教师编号已存在'}), 400
        return jsonify({'success': False, 'message': f'数据库错误: {str(err)}'}), 500

@user_management_bp.route('/deleteTeacher', methods=['DELETE'])
def delete_teacher():
    teacher_id = request.args.get("teacher_id")

    if not teacher_id:
        return jsonify({"success": False, "message": "缺少 teacher_id"}), 400

    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM Teacher WHERE teacher_id = %s", (teacher_id,))
        conn.commit()
        cursor.close()
        conn.close()

        return jsonify({"success": True, "message": "教师删除成功！"}), 200
    except MySQLdb.Error as err:
        print(f"数据库错误: {err}")
        return jsonify({"success": False, "message": "删除教师失败"}), 500

# 处理课程添加
@user_management_bp.route('/courses', methods=['POST'])
def add_course():
    data = request.get_json()

    # 获取前端传递的 JSON 数据
    course_id = data.get('course_id')
    name = data.get('name')
    credit = data.get('credit')
    teacher_id = data.get('teacher_id')
    capacity = data.get('capacity')
    # is_selectable默认为True，前端可能不传
    is_selectable = data.get('is_selectable', True)

    # 检查字段是否为空
    if not all([course_id, name, credit, teacher_id, capacity]):
        return jsonify({'success': False, 'message': '缺少必要的字段'}), 400

    try:
        # 确保数值字段是整数类型
        try:
            course_id = int(course_id)
            credit = int(credit)
            teacher_id = int(teacher_id)
            capacity = int(capacity)
        except ValueError:
            return jsonify({'success': False, 'message': '课程ID、学分、教师ID和容量必须是数字'}), 400

        # 验证学分和容量是否大于0（数据库约束）
        if credit <= 0:
            return jsonify({'success': False, 'message': '学分必须大于0'}), 400
        if capacity <= 0:
            return jsonify({'success': False, 'message': '容量必须大于0'}), 400

        # 连接数据库
        conn = get_db_connection()
        cursor = conn.cursor()

        # 验证教师ID是否存在
        cursor.execute("SELECT COUNT(*) FROM Teacher WHERE teacher_id = %s", (teacher_id,))
        if cursor.fetchone()[0] == 0:
            cursor.close()
            conn.close()
            return jsonify({'success': False, 'message': '指定的教师ID不存在'}), 400

        # 插入数据到Course表
        cursor.execute(
            "INSERT INTO Course (course_id, name, credit, teacher_id, capacity, is_selectable) VALUES (%s, %s, %s, %s, %s, %s)",
            (course_id, name, credit, teacher_id, capacity, is_selectable))
        conn.commit()

        # 关闭数据库连接
        cursor.close()
        conn.close()

        return jsonify({'success': True, 'message': '课程添加成功！'}), 200
    except MySQLdb.Error as err:
        print(f"数据库错误: {err}")
        # 检查是否是唯一键冲突错误
        if err.args[0] == 1062:  # MySQL错误码1062表示唯一键冲突
            return jsonify({'success': False, 'message': '该课程ID已存在'}), 400
        # 检查是否是外键约束错误
        elif err.args[0] == 1452:  # MySQL错误码1452表示外键约束失败
            return jsonify({'success': False, 'message': '指定的教师ID不存在'}), 400
        return jsonify({'success': False, 'message': f'数据库错误: {str(err)}'}), 500

# 获取所有教师的列表（用于课程添加时选择教师）
@user_management_bp.route('/teachers', methods=['GET'])
def get_teachers():
    try:
        # 连接数据库
        conn = get_db_connection()
        cursor = conn.cursor(MySQLdb.cursors.DictCursor)  # 使用DictCursor，不是dictionary=True

        # 查询所有教师
        cursor.execute("SELECT * FROM Teacher")  # 查询所有教师数据
        teachers = cursor.fetchall()

        # 关闭数据库连接
        cursor.close()
        conn.close()

        return jsonify({'success': True, 'teachers': teachers}), 200
    except MySQLdb.Error as err:
        print(f"数据库错误: {err}")
        return jsonify({'success': False, 'message': f'数据库错误: {str(err)}'}), 500

@user_management_bp.route('/getCourses', methods=['GET'])
def get_courses():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(MySQLdb.cursors.DictCursor)  # 使用DictCursor，不是dictionary=True

        # 查询所有课程信息
        cursor.execute("SELECT course_id, name, credit, teacher_id, capacity FROM Course")
        courses = cursor.fetchall()

        cursor.close()
        conn.close()

        return jsonify({'success': True, 'courses': courses}), 200
    except MySQLdb.Error as err:
        print(f"数据库错误: {err}")
        return jsonify({'success': False, 'message': f'数据库错误: {str(err)}'}), 500

#搜索学生学号/姓名
@user_management_bp.route('/searchStudent', methods=['GET'])
def search_student():
    query = request.args.get('query', '').strip()

    # 检查query是否为空
    if not query:
        return jsonify({'success': False, 'message': '缺少搜索条件'}), 400

    try:
        conn = get_db_connection()
        cursor = conn.cursor(MySQLdb.cursors.DictCursor)

        # 查询学生数据
        cursor.execute("""
            SELECT student_id, name, gender, major, enrollment_year 
            FROM Student 
            WHERE student_id = %s OR name LIKE %s
        """, (query, f"%{query}%"))
        students = cursor.fetchall()

        cursor.close()
        conn.close()

        if students:
            return jsonify({'success': True, 'students': students}), 200
        else:
            return jsonify({'success': False, 'message': '未找到学生'}), 404
    except MySQLdb.Error as err:
        print(f"数据库错误: {err}")
        return jsonify({'success': False, 'message': '搜索失败'}), 500
# 权限检查装饰器函数
def admin_required(f):
    from functools import wraps
    from flask import session, jsonify

    @wraps(f)
    def decorated_function(*args, **kwargs):
        if session.get("role") != "admin":
            return jsonify({'success': False, 'message': '没有权限执行此操作'}), 403
        return f(*args, **kwargs)

    return decorated_function