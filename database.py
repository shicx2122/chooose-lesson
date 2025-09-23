import MySQLdb

def get_db_connection():
    return MySQLdb.connect(
        host="mainline.proxy.rlwy.net",
        port=40026,  # 1. 必须写端口
        user="root",
        passwd="yRlzTBHrKdPYsZVrbTgqLIbWBNyTSJNL",  # 2. 密码复制全
        db="railway",
        charset="utf8mb4",  # 3. 推荐 utf8mb4
        connect_timeout=10
    )
    