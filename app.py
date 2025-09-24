from flask import Flask, render_template, request, redirect, url_for, session, jsonify
from database import get_db_connection
import MySQLdb

# 导入其他蓝图
from user_management import user_management_bp, admin_required
from user_student import user_student_bp
from user_teacher import user_teacher_bp  # 导入 user_teacher 蓝图

app = Flask(__name__)

app.secret_key = "your_secret_key"  # 保护 session 数据

# 注册蓝图
app.register_blueprint(user_management_bp)
app.register_blueprint(user_student_bp)
app.register_blueprint(user_teacher_bp)  # 注册 user_teacher 蓝图

# 为蓝图中的路由添加权限检查
# 这必须在注册蓝图后添加
for endpoint in ['user_management.add_student', 'user_management.add_teacher',
                'user_management.add_course', 'user_management.get_teachers',
                'user_management.delete_teacher']:  # ✅ 添加权限检查
    app.view_functions[endpoint] = admin_required(app.view_functions[endpoint])

# 主页（登录页面）
@app.route("/")
def home():
    return render_template("login.html")

# 处理登录
@app.route("/login", methods=["POST"])
def login():
    username = request.form.get("username")  # 获取输入的用户名（学号/管理员账号）
    password = request.form.get("password")  # 获取输入的密码
    role = request.form.get("role")  # 获取用户角色（admin/student/teacher）

    db = get_db_connection()
    cursor = db.cursor(MySQLdb.cursors.DictCursor)

    user = None

    if role == "admin":
        # 管理员账号固定为 1，密码 000000
        if username == "1" and password == "256":
            user = {"admin_id": 1, "name": "管理员"}
    elif role == "student":
        cursor.execute("SELECT * FROM Student WHERE student_id=%s AND password=%s", (username, password))
        user = cursor.fetchone()
    elif role == "teacher":
        cursor.execute("SELECT * FROM Teacher WHERE teacher_id=%s AND password=%s", (username, password))
        user = cursor.fetchone()

    cursor.close()
    db.close()

    if user:
        # 登录成功，保存 session
        session["user_id"] = user["admin_id"] if role == "admin" else user.get("student_id") or user.get("teacher_id")
        session["name"] = user["name"]
        session["role"] = role

        # 跳转到不同的页面
        if role == "admin":
            return jsonify({"success": True, "redirect_url": url_for("admin_page")})
        elif role == "student":
            return jsonify({"success": True, "redirect_url": url_for("student_page")})
        elif role == "teacher":
            return jsonify({"success": True, "redirect_url": url_for("teacher_page")})

    return jsonify({"success": False})  # 登录失败

# 管理员页面
@app.route("/admin")
def admin_page():
    if session.get("role") != "admin":
        return redirect(url_for("home"))  # 未登录或无权限，返回首页
    return render_template("admin.html", name=session["name"])

@app.route("/getStudents", methods=["GET"])
def get_students():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(MySQLdb.cursors.DictCursor)
        cursor.execute("SELECT * FROM Student")  # 查询所有学生数据
        students = cursor.fetchall()
        cursor.close()
        conn.close()

        return jsonify({"success": True, "students": students}), 200
    except MySQLdb.Error as err:
        print(f"数据库错误: {err}")
        return jsonify({"success": False, "message": "获取学生数据失败"}), 500


# 学生页面
@app.route("/student")
def student_page():
    if session.get("role") != "student" and session.get("role") != "teacher":
        return redirect(url_for("home"))  # 未登录或无权限，返回首页
    db = get_db_connection()
    cursor = db.cursor(MySQLdb.cursors.DictCursor)
    cursor.execute("SELECT * FROM Student WHERE student_id=%s", (session["user_id"],))
    student_info = cursor.fetchone()
    cursor.close()
    db.close()
    return render_template("student.html", student_name=session["name"], student_info=student_info)  # 先用 student

# 教师页面
@app.route("/teacher")
def teacher_page():
    if session.get("role") != "teacher":
        return redirect(url_for("home"))  # 未登录或无权限，返回首页
    db = get_db_connection()
    cursor = db.cursor(MySQLdb.cursors.DictCursor)
    cursor.execute("SELECT name FROM Teacher WHERE teacher_id=%s", (session["user_id"],))
    teacher_info = cursor.fetchone()
    cursor.close()
    db.close()
    if teacher_info is None:
        return redirect(url_for("home"))  # 如果没有找到教师信息，返回首页
    return render_template("teacher.html", teacher_name=teacher_info["name"])

# 退出登录
@app.route("/logout")
def logout():
    session.clear()
    return redirect(url_for("home"))

if __name__ == "__main__":
    app.run(debug=false, host='0.0.0.0', port=5000)
