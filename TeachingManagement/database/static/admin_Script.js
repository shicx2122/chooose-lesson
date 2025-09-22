document.addEventListener('DOMContentLoaded', function () {
    // 切换到学生账号管理
    document.getElementById('student-account-link').addEventListener('click', function () {
        document.getElementById('student-account-management').style.display = 'block';
        document.getElementById('teacher-account-management').style.display = 'none';
        document.getElementById('admin-account-management').style.display = 'none';
        document.getElementById('course-list-management').style.display = 'none';
        document.getElementById('student-account-header').style.display = 'flex';
        document.getElementById('teacher-account-header').style.display = 'none';
        document.getElementById('admin-account-header').style.display = 'none';
        document.getElementById('course-list-header').style.display = 'none';
        this.classList.add('active');
        document.getElementById('teacher-account-link').classList.remove('active');
        document.getElementById('admin-account-link').classList.remove('active');
        document.getElementById('course-list-link').classList.remove('active');
    });

    // 切换到教师账号管理
    document.getElementById('teacher-account-link').addEventListener('click', function () {
        document.getElementById('student-account-management').style.display = 'none';
        document.getElementById('teacher-account-management').style.display = 'block';
        document.getElementById('admin-account-management').style.display = 'none';
        document.getElementById('course-list-management').style.display = 'none';
        document.getElementById('student-account-header').style.display = 'none';
        document.getElementById('teacher-account-header').style.display = 'flex';
        document.getElementById('admin-account-header').style.display = 'none';
        document.getElementById('course-list-header').style.display = 'none';
        this.classList.add('active');
        document.getElementById('student-account-link').classList.remove('active');
        document.getElementById('admin-account-link').classList.remove('active');
        document.getElementById('course-list-link').classList.remove('active');
    });

    // 切换到管理员账号管理
    document.getElementById('admin-account-link').addEventListener('click', function () {
        document.getElementById('student-account-management').style.display = 'none';
        document.getElementById('teacher-account-management').style.display = 'none';
        document.getElementById('admin-account-management').style.display = 'block';
        document.getElementById('course-list-management').style.display = 'none';
        document.getElementById('student-account-header').style.display = 'none';
        document.getElementById('teacher-account-header').style.display = 'none';
        document.getElementById('admin-account-header').style.display = 'flex';
        document.getElementById('course-list-header').style.display = 'none';
        this.classList.add('active');
        document.getElementById('student-account-link').classList.remove('active');
        document.getElementById('teacher-account-link').classList.remove('active');
        document.getElementById('course-list-link').classList.remove('active');
    });

    // 切换到课程列表管理
    document.getElementById('course-list-link').addEventListener('click', function () {
        document.getElementById('student-account-management').style.display = 'none';
        document.getElementById('teacher-account-management').style.display = 'none';
        document.getElementById('admin-account-management').style.display = 'none';
        document.getElementById('course-list-management').style.display = 'block';
        document.getElementById('student-account-header').style.display = 'none';
        document.getElementById('teacher-account-header').style.display = 'none';
        document.getElementById('admin-account-header').style.display = 'none';
        document.getElementById('course-list-header').style.display = 'flex';
        this.classList.add('active');
        document.getElementById('student-account-link').classList.remove('active');
        document.getElementById('teacher-account-link').classList.remove('active');
        document.getElementById('admin-account-link').classList.remove('active');
    });

    // 更改管理员密码功能
    document.getElementById('change-password-btn').addEventListener('click', function () {
        const newPassword = document.getElementById('admin-password').value;
        alert(`密码已更改为：${newPassword}`);
        // 这里可以添加实际的更改密码逻辑，例如通过 AJAX 请求将新密码发送到服务器
    });

    // 处理加入或退出选课列表按钮点击事件
    document.querySelectorAll('.toggle-selection-btn').forEach(button => {
        button.addEventListener('click', function () {
            const courseId = this.getAttribute('data-course-id');
            const isInSelectionList = this.classList.contains('in-selection-list');

            if (isInSelectionList) {
                // 发送请求将课程从选课列表中移除
                fetch(`/api/removeFromSelectionList?courseId=${courseId}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                })
                    .then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            this.classList.remove('in-selection-list');
                            this.innerHTML = '<i class="fas fa-plus-circle"></i>';
                        } else {
                            alert('操作失败');
                        }
                    })
                    .catch(error => {
                        console.error('Error:', error);
                        alert('操作失败');
                    });
            } else {
                // 发送请求将课程加入选课列表
                fetch(`/api/addToSelectionList?courseId=${courseId}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                })
                    .then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            this.classList.add('in-selection-list');
                            this.innerHTML = '<i class="fas fa-minus-circle"></i>';
                        } else {
                            alert('操作失败');
                        }
                    })
                    .catch(error => {
                        console.error('Error:', error);
                        alert('操作失败');
                    });
            }
        });
    });

    //添加学生功能
    document.getElementById('add-student-btn').addEventListener('click', function () {
        document.getElementById('add-student-modal').style.display = 'block';
    });

    document.getElementById('close-student-modal').addEventListener('click', function () {
        document.getElementById('add-student-modal').style.display = 'none';
    });

    document.getElementById('cancel-student-btn').addEventListener('click', function () {
        document.getElementById('add-student-modal').style.display = 'none';
    });

    document.getElementById('add-student-form').addEventListener('submit', function (event) {
        event.preventDefault();

        const studentData = {
            student_id: document.getElementById('student-id').value,
            name: document.getElementById('student-name').value,
            gender: document.getElementById('student-gender').value,
            enrollment_year: document.getElementById('enrollment-year').value,
            major: document.getElementById('student-major').value,
            password: document.getElementById('student-password').value
        };

        fetch('/api/addStudent', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(studentData)
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert('学生添加成功');
                    document.getElementById('add-student-modal').style.display = 'none';
                    // 这里可以添加代码来更新学生列表
                } else {
                    alert('学生添加失败');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('学生添加失败');
            });
    });

    // 搜索学生账号功能
    document.getElementById('search-student-btn').addEventListener('click', function () {
        const query = document.getElementById('search-student-input').value.trim();
        const isValidQuery = /^[a-zA-Z0-9\u4e00-\u9fa5]+$/.test(query); // 只允许字母、数字和汉字

        if (!isValidQuery) {
            alert('请输入有效的学号或姓名'); // 提示用户输入有效的学号或姓名
            return;
        }

        fetch(`/api/searchStudent?query=${encodeURIComponent(query)}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    const students = data.students;
                    const tbody = document.querySelector('#student-account-management tbody');
                    tbody.innerHTML = ''; // 清空现有内容

                    students.forEach(student => {
                        const tr = document.createElement('tr');
                        tr.innerHTML = `
                        <td>${student.student_id}</td>
                        <td>${student.name}</td>
                        <td>${student.gender}</td>
                        <td>${student.class}</td>
                        <td>${student.major}</td>
                        <td>${student.enrollment_year}</td>
                        <td>
                            <button class="action-btn edit-btn"><i class="fas fa-edit"></i></button>
                            <button class="action-btn delete-btn"><i class="fas fa-trash-alt"></i></button>
                        </td>
                    `;
                        tbody.appendChild(tr);
                    });
                } else {
                    alert('未找到学生');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('搜索失败');
            });
    });

    //添加教师功能
    document.getElementById('add-teacher-btn').addEventListener('click', function () {
        document.getElementById('add-teacher-modal').style.display = 'block';
    });

    document.getElementById('close-teacher-modal').addEventListener('click', function () {
        document.getElementById('add-teacher-modal').style.display = 'none';
    });

    document.getElementById('cancel-teacher-btn').addEventListener('click', function () {
        document.getElementById('add-teacher-modal').style.display = 'none';
    });

    document.getElementById('add-teacher-form').addEventListener('submit', function (event) {
        event.preventDefault();

        const teacherData = {
            teacher_id: document.getElementById('teacher-id').value,
            name: document.getElementById('teacher-name').value,
            gender: document.getElementById('teacher-gender').value,
            title: document.getElementById('teacher-title').value,
            department: document.getElementById('teacher-department').value,
            password: document.getElementById('teacher-password').value
        };

        fetch('/api/addTeacher', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(teacherData)
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert('教师添加成功');
                    document.getElementById('add-teacher-modal').style.display = 'none';
                    // 这里可以添加代码来更新教师列表
                } else {
                    alert('教师添加失败');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('教师添加失败');
            });
    });

    // 搜索教师账号功能
    document.getElementById('search-teacher-btn').addEventListener('click', function () {
        const query = document.getElementById('search-teacher-input').value.trim();
        const isValidQuery = /^[a-zA-Z0-9\u4e00-\u9fa5]+$/.test(query); // 只允许字母、数字和汉字

        if (!isValidQuery) {
            alert('请输入有效的教师编号或姓名'); // 提示用户输入有效的教师编号或姓名
            return;
        }

        fetch(`/api/searchTeacher?query=${encodeURIComponent(query)}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    const teachers = data.teachers;
                    const tbody = document.querySelector('#teacher-account-management tbody');
                    tbody.innerHTML = ''; // 清空现有内容

                    teachers.forEach(teacher => {
                        const tr = document.createElement('tr');
                        tr.innerHTML = `
                        <td>${teacher.teacher_id}</td>
                        <td>${teacher.name}</td>
                        <td>${teacher.gender}</td>
                        <td>${teacher.department}</td>
                        <td>${teacher.title}</td>
                        <td>
                            <button class="action-btn edit-btn"><i class="fas fa-edit"></i></button>
                            <button class="action-btn delete-btn"><i class="fas fa-trash-alt"></i></button>
                        </td>
                    `;
                        tbody.appendChild(tr);
                    });
                } else {
                    alert('未找到教师');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('搜索失败');
            });
    });

    //添加课程功能
    document.getElementById('add-course-btn').addEventListener('click', function () {
        document.getElementById('add-course-modal').style.display = 'block';
    });

    document.getElementById('close-course-modal').addEventListener('click', function () {
        document.getElementById('add-course-modal').style.display = 'none';
    });

    document.getElementById('cancel-course-btn').addEventListener('click', function () {
        document.getElementById('add-course-modal').style.display = 'none';
    });

    document.getElementById('add-course-form').addEventListener('submit', function (event) {
        event.preventDefault();

        const formData = new FormData(document.getElementById('add-course-form'));
        const courseData = {
            course_id: formData.get('course_id'),
            name: formData.get('name'),
            credit: formData.get('credit'),
            teacher_id: formData.get('teacher_id'),
            capacity: formData.get('capacity')
        };

        fetch('/api/courses', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(courseData)
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert('课程添加成功');
                    document.getElementById('add-course-modal').style.display = 'none';
                    // 这里可以添加刷新课程列表的代码
                } else {
                    alert('课程添加失败: ' + data.message);
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('课程添加失败');
            });
    });
});
    function fetchStudents() {
    console.log("🔄 正在获取学生数据...");  // Debugging: 确保函数被调用

    fetch("/getStudents")
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                console.log("✅ 学生数据获取成功:", data.students);  // Debugging: 检查返回的数据

                const studentTable = document.getElementById("studentTableBody");
                if (!studentTable) {
                    console.error("❌ studentTableBody 元素未找到！");
                    return;
                }

                studentTable.innerHTML = "";  // **清空表格**，避免重复数据

                data.students.forEach(student => {
                    let row = `<tr>
                        <td>${student.student_id}</td>
                        <td>${student.name}</td>
                        <td>${student.gender}</td>
                        <td>${student.class || "未填写"}</td>  
                        <td>${student.major || "未填写"}</td>  
                        <td>${student.enrollment_year || "未填写"}</td>  
                        <td>
                            <button onclick="deleteStudent(${student.student_id})">🗑️</button>
                        </td>
                    </tr>`;
                    studentTable.innerHTML += row;
                });

            } else {
                console.error("❌ 获取学生数据失败:", data.message);
            }
        })
        .catch(error => console.error("❌ 获取数据错误:", error));
}


    function addStudent() {
    let studentData = {
        student_id: document.getElementById("student-id").value,
        name: document.getElementById("student-name").value,
        gender: document.getElementById("student-gender").value,
        enrollment_year: document.getElementById("enrollment-year").value,
        major: document.getElementById("student-major").value
    };

    console.log("📤 发送学生数据:", studentData); // Debugging: 确保数据正确发送

    fetch("/api/addStudent", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(studentData)
    })
    .then(response => response.json())
    .then(data => {
        console.log("✅ 服务器返回:", data);  // Debugging: 检查后端返回的数据
        alert(data.message);
        if (data.success) {
            setTimeout(fetchStudents, 500);  // ✅ **成功后 500ms 刷新**
            document.getElementById('add-student-modal').style.display = 'none';  // 关闭模态框
        }
    })
    .catch(error => console.error("❌ 添加失败:", error));
}



    function deleteStudent(student_id) {
    fetch(`/api/deleteStudent?student_id=${student_id}`, {
        method: "DELETE",
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message);
        if (data.success) {
            setTimeout(fetchStudents, 500);  // ✅ 删除成功后 **500ms 后** 刷新列表
        }
    })
    .catch(error => console.error("删除失败:", error));
}


document.addEventListener("DOMContentLoaded", function () {
    fetchTeachers();
});

function fetchTeachers() {
    console.log("🔄 获取教师数据...");  // Debugging: 确保这个函数被调用了

    fetch("/api/teachers")
        .then(response => response.json())
        .then(data => {
            console.log("✅ 教师数据获取成功:", data); // Debugging: 检查返回的 JSON 数据

            if (data.success) {
                const teacherTable = document.querySelector("#teacher-account-management tbody");
                if (!teacherTable) {
                    console.error("❌ teacherTable 元素未找到！");
                    return;
                }

                teacherTable.innerHTML = "";  // 清空旧数据

                data.teachers.forEach(teacher => {
                    let row = `<tr>
                        <td>${teacher.teacher_id}</td>
                        <td>${teacher.name}</td>
                        <td>${teacher.gender}</td>
                        <td>${teacher.department}</td>
                        <td>${teacher.title}</td>
                        <td>
                            <button onclick="deleteTeacher(${teacher.teacher_id})">🗑️</button>
                        </td>
                    </tr>`;
                    teacherTable.innerHTML += row;
                });
            } else {
                console.error("❌ 获取教师数据失败:", data.message);
            }
        })
        .catch(error => console.error("❌ 获取教师数据错误:", error));
}

function addTeacher() {
    let teacherData = {
        teacher_id: document.getElementById("teacher-id").value,
        name: document.getElementById("teacher-name").value,
        gender: document.getElementById("teacher-gender").value,
        title: document.getElementById("teacher-title").value,
        department: document.getElementById("teacher-department").value,
        password: document.getElementById("teacher-password").value
    };

    console.log("📤 发送教师数据:", teacherData); // Debugging: 确保数据正确发送

    fetch("/api/addTeacher", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(teacherData)
    })
    .then(response => response.json())
    .then(data => {
        console.log("✅ 服务器返回:", data);  // Debugging: 检查后端返回的数据
        alert(data.message);
        if (data.success) {
            setTimeout(fetchTeachers, 500);  // ✅ **成功后 500ms 刷新**
            document.getElementById('add-teacher-modal').style.display = 'none';  // 关闭模态框
        }
    })
    .catch(error => console.error("❌ 添加失败:", error));
}
function deleteTeacher(teacher_id) {
    fetch(`/api/deleteTeacher?teacher_id=${teacher_id}`, {
        method: "DELETE",
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message);
        if (data.success) {
            setTimeout(fetchTeachers, 500);  // ✅ 删除成功后 **500ms 后** 刷新列表
        }
    })
    .catch(error => console.error("❌ 删除失败:", error));
}

document.addEventListener("DOMContentLoaded", function() {
    console.log("🔄 页面加载完成，准备获取数据...");
    setTimeout(fetchStudents, 1000);  // ✅ **加载学生数据**
    setTimeout(fetchTeachers, 1000);  // ✅ **加载教师数据**
});
function fetchCourses() {
    console.log("🔄 正在获取课程数据...");

    fetch("/api/getCourses")
        .then(response => response.json())
        .then(data => {
            console.log("✅ 课程数据获取成功:", data);

            if (data.success) {
                const courseTable = document.querySelector("#course-list-management tbody");
                if (!courseTable) {
                    console.error("❌ courseTable 元素未找到！");
                    return;
                }

                courseTable.innerHTML = "";  // **清空表格**

                data.courses.forEach(course => {
                    let row = `<tr>
                        <td>${course.course_id}</td>
                        <td>${course.name}</td>
                        <td>${course.credit}</td>
                        <td>${course.teacher_id}</td>
                        <td>${course.capacity}</td>
                        <td>
                            <button class="action-btn edit-btn"><i class="fas fa-edit"></i></button>
                            <button class="action-btn delete-btn"><i class="fas fa-trash-alt"></i></button>
                        </td>
                    </tr>`;
                    courseTable.innerHTML += row;
                });

            } else {
                console.error("❌ 获取课程数据失败:", data.message);
            }
        })
        .catch(error => console.error("❌ 获取课程数据错误:", error));
}

// 在页面加载时自动调用
document.addEventListener("DOMContentLoaded", function() {
    setTimeout(fetchCourses, 1000);  // ✅ **页面加载后 1 秒再执行 fetchCourses()**
});
document.getElementById('add-course-btn').addEventListener('click', function () {
    document.getElementById('add-course-modal').style.display = 'block';
});

document.getElementById('close-course-modal').addEventListener('click', function () {
    document.getElementById('add-course-modal').style.display = 'none';
});

document.getElementById('cancel-course-btn').addEventListener('click', function () {
    document.getElementById('add-course-modal').style.display = 'none';
});

document.getElementById('add-course-form').addEventListener('submit', function (event) {
    event.preventDefault();

    const formData = new FormData(document.getElementById('add-course-form'));
    const courseData = {
        course_id: formData.get('course_id'),
        name: formData.get('name'),
        credit: formData.get('credit'),
        teacher_id: formData.get('teacher_id'),
        capacity: formData.get('capacity')
    };

    fetch('/api/courses', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(courseData)
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('课程添加成功');
                document.getElementById('add-course-modal').style.display = 'none';
                setTimeout(fetchCourses, 500);  // ✅ **成功后 500ms 刷新**
            } else {
                alert('课程添加失败: ' + data.message);
            }
        })
        .catch(error => {
            console.error("❌ 添加课程失败:", error);
            alert('课程添加失败');
        });
});
