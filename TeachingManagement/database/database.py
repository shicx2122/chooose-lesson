import MySQLdb

def get_db_connection():
    return MySQLdb.connect(
        host="localhost",
        user="root",
        passwd="120912",#L密码
        db="database",
        charset="utf8"
    )
