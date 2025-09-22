document.addEventListener('DOMContentLoaded', function () {
    // 获取所有导航栏按钮
    const navItems = document.querySelectorAll('.nav-item');
    const contentSections = document.querySelectorAll(".content-section");
    const availableCoursesTableBody = document.querySelector("#available-courses tbody");

    // 为每个导航栏按钮添加点击事件监听器
    navItems.forEach(item => {
        item.addEventListener('click', function () {
            // 移除所有按钮的 active 类
            navItems.forEach(nav => nav.classList.remove('active'));

            // 为当前点击的按钮添加 active 类
            this.classList.add('active');

            // 切换内容区域的显示
            const targetId = this.getAttribute('data-content');
            document.querySelectorAll('.content-section').forEach(section => {
                section.style.display = 'none';
            });
            document.getElementById(targetId).style.display = 'block';

            // 动态加载已选课程
            if (targetId === 'selected-courses') {
                loadSelectedCourses();
            }
            // 动态加载学分情况
            if (targetId === 'credit-status') {
                loadCreditStatus();
            }
        });
    });

    // 动态加载已选课程
    function loadSelectedCourses() {
        fetch('/api/getSelectedCourses')
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    const selectedCourseTableBody = document.getElementById('selectedCourseTableBody');
                    selectedCourseTableBody.innerHTML = ''; // 清空现有内容
                    data.selected_courses.forEach(course => {
                        const row = document.createElement('tr');
                        row.innerHTML = `
                            <td>${course.course_id}</td>
                            <td>${course.name}</td>
                            <td>${course.teacher_name}</td>
                            <td>${course.credit}</td>
                            <td>
                                <button class="action-btn delete-btn" data-course-id="${course.course_id}" title="取消选课"><i class="fas fa-times-circle"></i></button>
                                <button class="action-btn detail-btn" title="详情"><i class="fas fa-info-circle"></i></button>
                            </td>
                        `;
                        selectedCourseTableBody.appendChild(row);
                    });

                    // 添加取消选课按钮事件监听器
                    document.querySelectorAll('.delete-btn').forEach(button => {
                        button.addEventListener('click', function () {
                            const courseId = this.getAttribute('data-course-id');
                            // 发送请求取消选课
                            fetch(`/api/dropCourse`, {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({ course_id: courseId })
                            })
                                .then(response => response.json())
                                .then(data => {
                                    if (data.success) {
                                        alert('取消选课成功');
                                        loadSelectedCourses(); // 重新加载已选课程
                                    } else {
                                        alert('取消选课失败');
                                    }
                                })
                                .catch(error => {
                                    console.error('Error:', error);
                                    alert('取消选课失败');
                                });
                        });
                    });
                } else {
                    alert('获取已选课程失败');
                }
            })
            .catch(error => {
                console.error('Error fetching selected courses:', error);
                alert('获取已选课程失败');
            });
    }

    // 动态加载可选课程
    function loadSelectableCourses() {
        fetch('/api/getSelectableCourses')
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    availableCoursesTableBody.innerHTML = "";
                    data.courses.forEach(course => {
                        const row = `
                            <tr>
                                <td>${course.course_id}</td>
                                <td>${course.name}</td>
                                <td>${course.teacher_name}</td>
                                <td>${course.credit}</td>
                                <td>${course.remaining_capacity}/${course.capacity}</td>
                                <td>
                                    <button class="action-btn select-btn" data-course-id="${course.course_id}" title="选课">
                                        <i class="fas fa-plus-circle"></i>
                                    </button>
                                    <button class="action-btn detail-btn" title="详情">
                                        <i class="fas fa-info-circle"></i>
                                    </button>
                                </td>
                            </tr>
                        `;
                        availableCoursesTableBody.innerHTML += row;
                    });

                    // 绑定选课按钮事件
                    bindEnrollButtons();
                } else {
                    console.error("获取可选课程失败:", data.message);
                }
            })
            .catch(error => console.error("请求错误:", error));
    }

    // 绑定选课按钮事件
    function bindEnrollButtons() {
        document.querySelectorAll(".select-btn").forEach(button => {
            button.addEventListener("click", function () {
                const courseId = this.getAttribute("data-course-id");
                enrollCourse(courseId);
            });
        });
    }

    // 选课请求
    function enrollCourse(courseId) {
        fetch("/api/enrollCourse", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ course_id: courseId })
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert("选课成功！");
                    loadSelectableCourses(); // 重新加载课程列表，更新状态
                } else {
                    alert("选课失败：" + data.message);
                }
            })
            .catch(error => console.error("选课请求错误:", error));
    }

    // 动态加载学分情况
    /*function loadCreditStatus() {
        fetch('/api/getCreditStatus')
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    const creditTableBody = document.getElementById('credit-table-body');
                    creditTableBody.innerHTML = ''; // 清空现有内容
                    data.credits.forEach(credit => {
                        const row = document.createElement('tr');
                        row.innerHTML = `
                            <td>${credit.period}</td>
                            <td>${credit.credits}</td>
                        `;
                        creditTableBody.appendChild(row);
                    });
                } else {
                    alert('获取学分情况失败');
                }
            })
            .catch(error => {
                console.error('Error fetching credit status:', error);
                alert('获取学分情况失败');
            });
    }*/

    // GPA
    const gpaData = {
        all: [
            { period: "至今", gpa: 3.8 },

        ],
        year1: [
            { period: "第一学期", gpa: 3.8 },
            { period: "第二学期", gpa: 3.6 }
        ],
        year2: [
            { period: "第三学期", gpa: 3.9 },
            { period: "第四学期", gpa: 3.7 }
        ],
        year3: [
            { period: "第五学期", gpa: 3.8 },
            { period: "第六学期", gpa: 3.6 }
        ],
        year4: [
            { period: "第七学期", gpa: 3.9 },
            { period: "第八学期", gpa: 3.7 }
        ]
    };

    const Gpa_yearSelect = document.getElementById('Gpa_year-select');
    const gpaTableBody = document.getElementById('gpa-table-body');

    function updateGpaTable(year) {
        const data = gpaData[year];
        gpaTableBody.innerHTML = data.map(item => `
            <tr>
                <td>${item.period}</td>
                <td>${item.gpa}</td>
            </tr>
        `).join('');
    }

    Gpa_yearSelect.addEventListener('change', function () {
        updateGpaTable(this.value);
    });

    // 学分选择器
    const creditData = {
        all: [
            { period: "第一学期", credit: 20.5 },
            { period: "第二学期", credit: 20 },
            { period: "第三学期", credit: 30 },
            { period: "第四学期", credit: 20 },
            { period: "第五学期", credit: 20 },
            { period: "第六学期", credit: 20 },
            { period: "第七学期", credit: 20 },
            { period: "第八学期", credit: 20 }
        ],
        year1: [
            { period: "第一学期", credit: 20.5 },
            { period: "第二学期", credit: 20 }
        ],
        year2: [
            { period: "第三学期", credit: 30 },
            { period: "第四学期", credit: 20 }
        ],
        year3: [
            { period: "第五学期", credit: 20 },
            { period: "第六学期", credit: 20 }
        ],
        year4: [
            { period: "第七学期", credit: 20 },
            { period: "第八学期", credit: 20 }
        ]
    };

    const Credit_yearSelect = document.getElementById('credit_year-select');
    const CreditTableBody = document.getElementById('credit-table-body');

    function updateCreditTable(year) {
        const data = creditData[year];
        CreditTableBody.innerHTML = data.map(item => `
            <tr>
                <td>${item.period}</td>
                <td>${item.credit}</td>
            </tr>
        `).join('');
    }

    Credit_yearSelect.addEventListener('change', function () {
        updateCreditTable(this.value);
    });

    // Initialize the table with all data
    updateCreditTable('all');

    // Password change form validation
    const changePasswordForm = document.getElementById("change-password-form");
    const newPasswordInput = document.getElementById("new-password");
    const confirmPasswordInput = document.getElementById("confirm-password");
    const errorMessage = document.getElementById("error-message");

    changePasswordForm.addEventListener("submit", function (event) {
        if (newPasswordInput.value !== confirmPasswordInput.value) {
            errorMessage.style.display = "block";
            event.preventDefault();
        } else {
            errorMessage.style.display = "none";
        }
    });

    // 打印
    document.querySelector('.print-btn').onclick = function () {
        window.print(); // 调用浏览器的打印功能
    }

    // 初始加载可选课程
    loadSelectableCourses();
     // 密码修改表单提交
    changePasswordForm.addEventListener("submit", function (event) {
        event.preventDefault(); // 阻止表单默认提交行为

        const currentPassword = document.getElementById("current-password").value;
        const newPassword = document.getElementById("new-password").value;
        const confirmPassword = document.getElementById("confirm-password").value;

        if (newPassword !== confirmPassword) {
            alert("新密码和确认密码不匹配");
            return;
        }

        fetch('/api/changePassword', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                current_password: currentPassword,
                new_password: newPassword,
                confirm_password: confirmPassword
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert(data.message);
                // 清空表单
                document.getElementById("current-password").value = "";
                document.getElementById("new-password").value = "";
                document.getElementById("confirm-password").value = "";
            } else {
                alert(data.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('密码修改失败');
        });
    });
});