import MySQLdb
import os

def get_db_connection():
    return MySQLdb.connect(
        host=os.environ.get("MYSQL_HOST"),
        user=os.environ.get("MYSQL_USER"),
        passwd=os.environ.get("MYSQL_PASSWORD"),
        db=os.environ.get("MYSQL_DB"),
        charset="utf8"
    )