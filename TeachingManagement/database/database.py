import MySQLdb

def get_db_connection():
    return MySQLdb.connect(
        host="mysql.railway.internal",
        user="root",
        passwd="yRlzTBHrKdPYsZVrbTgqLIbWBNyTSJNL",#L密码
        db="railway",
        charset="utf8"
    )