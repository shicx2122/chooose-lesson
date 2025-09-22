document.addEventListener('DOMContentLoaded', function () {
    // 获取所有导航栏按钮
    const navItems = document.querySelectorAll('.nav-item');

    // 为每个导航栏按钮添加点击事件监听器
    navItems.forEach(item => {
        item.addEventListener('click', function () {
            // 移除所有按钮的 active 类
            navItems.forEach(nav => nav.classList.remove('active'));

            // 为当前点击的按钮添加 active 类
            this.classList.add('active');

            // 切换内容区域的显示
            const targetId = this.id.replace('-link', '');
            document.querySelectorAll('.content-section').forEach(section => {
                section.style.display = 'none';
            });
            document.getElementById(targetId).style.display = 'block';

            // 动态加载课程安排
            if (targetId === 'course-schedule') {
                loadAllCourseSchedule();
            }
        });
    });

    // 查看学生按钮点击事件
    function addViewStudentButtonListeners() {
        document.querySelectorAll('.view-students-btn').forEach(button => {
            button.addEventListener('click', function () {
                // 获取课程编号
                const courseId = this.getAttribute('data-course-id');

                // 切换到学生名单页面
                document.querySelectorAll('.content-section').forEach(section => {
                    section.style.display = 'none';
                });
                document.getElementById('student-list').style.display = 'block';

                // 获取学生名单并填充表格
                fetch(`/api/getStudentsByCourse/${courseId}`)
                    .then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            renderStudentList(data.students, courseId);
                        } else {
                            alert(data.message);
                        }
                    })
                    .catch(error => {
                        console.error('Error fetching student list:', error);
                        alert('获取学生名单失败');
                    });
            });
        });
    }

    // 渲染课程列表
    function renderCourseList(courses) {
        const courseListBody = document.getElementById('course-list-body');
        courseListBody.innerHTML = ''; // 清空现有内容
        courses.forEach(course => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${course.course_id}</td>
                <td>${course.name}</td>
                <td>
                    <button class="action-btn view-students-btn" data-course-id="${course.course_id}"><i class="fas fa-eye"></i> 查看学生</button>
                </td>
            `;
            courseListBody.appendChild(row);
        });

        // 添加查看学生按钮事件监听
        addViewStudentButtonListeners();
    }

    // 渲染学生名单
    function renderStudentList(students, courseId) {
        const studentListBody = document.getElementById('student-list-body');
        studentListBody.innerHTML = ''; // 清空现有内容
        students.forEach(student => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${student.student_id}</td>
                <td>${student.name}</td>
                <td><input type="text" value="${student.score}" class="grade-input"></td>
                <td>
                    <button class="action-btn save-grade-btn" data-student-id="${student.student_id}" data-course-id="${courseId}"><i class="fas fa-save"></i> 保存</button>
                </td>
            `;
            studentListBody.appendChild(row);
        });

        // 为每个保存按钮添加点击事件监听器
        document.querySelectorAll('.save-grade-btn').forEach(saveButton => {
            saveButton.addEventListener('click', function () {
                const studentId = this.getAttribute('data-student-id');
                const courseId = this.getAttribute('data-course-id');
                const score = this.closest('tr').querySelector('.grade-input').value;

                // 发送请求保存成绩
                fetch(`/api/saveGrade`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ student_id: studentId, course_id: courseId, score: score })
                })
                    .then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            alert('成绩保存成功');
                        } else {
                            alert('成绩保存失败');
                        }
                    })
                    .catch(error => {
                        console.error('Error:', error);
                        alert('成绩保存失败');
                    });
            });
        });
    }

    // 获取教师的课程列表
    fetch('/api/getTeacherCourses')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                renderCourseList(data.courses);
            } else {
                alert(data.message);
            }
        })
        .catch(error => {
            console.error('Error fetching course list:', error);
            alert('获取课程列表失败');
        });

    // 返回课程列表按钮点击事件
    document.getElementById('back-to-courses-btn').addEventListener('click', function () {
        document.querySelectorAll('.content-section').forEach(section => {
            section.style.display = 'none';
        });
        document.getElementById('course-list').style.display = 'block';
    });

    // 按学生成绩排序
    const sortByGradeButton = document.getElementById('sort-by-grade-btn');
    const studentListBody = document.getElementById('student-list-body');

    sortByGradeButton.addEventListener('click', function () {
        const rows = Array.from(studentListBody.querySelectorAll('tr'));

        rows.sort((a, b) => {
            const gradeA = parseFloat(a.querySelector('.grade-input').value) || 0; // 将空值视为0
            const gradeB = parseFloat(b.querySelector('.grade-input').value) || 0; // 将空值视为0
            return gradeB - gradeA; // 降序排序
        });

        // 清空表格内容并重新插入排序后的行
        studentListBody.innerHTML = '';
        rows.forEach(row => studentListBody.appendChild(row));

        // 提示排序完成
        alert('学生成绩排序完成');
    });

    // 动态加载所有课程安排
    function loadAllCourseSchedule() {
        fetch('/api/getAllCourseSchedule')
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    const courseScheduleBody = document.getElementById('course-schedule-body');
                    courseScheduleBody.innerHTML = ''; // 清空现有内容
                    data.courses.forEach(course => {
                        const row = document.createElement('tr');
                        row.innerHTML = `
                            <td>${course.course_id}</td>
                            <td>${course.name}</td>
                            <td>${course.teacher_name}</td>
                        `;
                        courseScheduleBody.appendChild(row);
                    });
                } else {
                    alert('获取课程安排失败');
                }
            })
            .catch(error => {
                console.error('Error fetching course schedule:', error);
                alert('获取课程安排失败');
            });
    }
});