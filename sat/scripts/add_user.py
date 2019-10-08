import argparse
import os
import sys

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

load_dotenv(
    dotenv_path=os.path.abspath(
        os.path.join(os.path.dirname(__file__), "..", "..", ".flaskenv")
    )
)

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

from sat.models import User

parser = argparse.ArgumentParser(description="Adds user to the application")

parser.add_argument("--email", type=str, help="User email", required=True)
parser.add_argument("--password", type=str, help="User password", required=True)

args = parser.parse_args()

engine = create_engine(os.getenv('DATABASE_URL'))
Session = sessionmaker(bind=engine)

session = Session()

email = args.email
password = args.password

print(f"Creating account for {email} with password: {password}")

try:
    user = User(email=email)
    user.set_password(password)
    session.add(user)
    session.commit()
    print("Account created!")
except Exception as e:
    print("Error creating account")
    print(e)
