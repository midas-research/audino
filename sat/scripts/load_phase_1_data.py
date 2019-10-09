import argparse
import os
import random
import sys

from pathlib import Path

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

load_dotenv(
    dotenv_path=os.path.abspath(
        os.path.join(os.path.dirname(__file__), "..", "..", ".flaskenv")
    )
)

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

from sat.models import Data, User

parser = argparse.ArgumentParser(description="Adds data to the application")

parser.add_argument(
    "--datadir", type=str, help="Directory containing files", required=True
)

args = parser.parse_args()

engine = create_engine(os.getenv("DATABASE_URL"))
Session = sessionmaker(bind=engine)

session = Session()

data_dir = args.datadir

audios = { os.path.basename(p): p.resolve() for p in Path(data_dir).glob("**/*.mp3")}
audios = audios.values()

print(f"Adding data")

audios = list(audios)
print(len(audios))

common_audios = audios[: int((3 * len(audios)) / 7)]
user1_audios = audios[int((3 * len(audios)) / 7) : int((5 * len(audios)) / 7)]
user2_audios = audios[int((5 * len(audios)) / 7) :]

user1_audios.extend(common_audios)
user2_audios.extend(common_audios)

random.shuffle(user1_audios)
random.shuffle(user2_audios)

user1 = (
    session.query(User).filter(User.email == "srimoyee.chaudhury@midas.center").first()
)
user2 = session.query(User).filter(User.email == "sakshi.labhane@midas.center").first()

for audio in user1_audios:
    audio_file = audio.as_posix()

    datapoint = Data(file=audio_file, user_id=user1.id)

    try:
        session.add(datapoint)
        session.commit()
    except:
        session.rollback()
        print("Error")
print("Adding data completed for user 1")

for audio in user2_audios:
    audio_file = audio.as_posix()

    datapoint = Data(file=audio_file, user_id=user2.id)

    try:
        session.add(datapoint)
        session.commit()
    except:
        session.rollback()
        print("Error")
print("Adding data completed for user 2")
