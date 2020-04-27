import argparse
import os
import sys

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

from backend.models import User

parser = argparse.ArgumentParser(description="Adds admin user to the application")

parser.add_argument("--username", type=str, help="Admin username", required=True)
parser.add_argument("--password", type=str, help="Admin password", required=True)

args = parser.parse_args()

engine = create_engine(os.getenv("DATABASE_URL"))
Session = sessionmaker(bind=engine)

session = Session()

username = args.username
password = args.password

print(f"Creating account for {username}")

try:
    user = User(username=username, role_id=1)
    user.set_password(password)
    session.add(user)
    session.commit()
    print("Account created!")
except Exception as e:
    print("Error creating admin user")
    print(e)
