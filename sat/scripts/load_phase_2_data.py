import argparse
import os
import random
import sys

from pathlib import Path

import pandas as pd

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

load_dotenv(
    dotenv_path=os.path.abspath(
        os.path.join(os.path.dirname(__file__), "..", "..", ".flaskenv")
    )
)

MAIN_DATA_DIR = "/media/data_dump_1/Manraj/sopi/"

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

audio_mapping = dict(
    {
        os.path.basename(file_path): file_path.resolve()
        for file_path in Path(os.path.join(data_dir)).glob("**/*.mp3")
    }
)

all_data = pd.read_csv(os.path.join(MAIN_DATA_DIR, "all.csv"))
all_data.loc[:, 'response_end'] = pd.to_datetime(all_data['response_end'], format='%m/%d/%Y %H:%M:%S %p')
all_data.loc[:, 'response_begin'] = pd.to_datetime(all_data['response_begin'], format='%m/%d/%Y %H:%M:%S %p')

print(all_data.shape)

all_data = all_data[all_data['final_status'] == 'Final'].copy()

# Uncomment for filtering on grades

# all_data = all_data[all_data['cheating_status'] != 'Cheating'].copy()
# all_data = all_data[all_data['test_assessed_level'] != 'Unratable'].copy()
# all_data = all_data[all_data['item_assessed_level'] != 'Unrated'].copy()

print(all_data.shape)

all_data = all_data[(all_data['response_end'] >= '2019-08-01') & (all_data['response_end'] <= '2019-08-31')]

print(all_data.shape)

print(f"Adding data")

audios = list([audio_mapping[filename] for filename in set(all_data.filename.values)])

print(len(audios))

common_audios = audios[: int((1 * len(audios)) / 19)]
user1_audios = audios[int((1 * len(audios)) / 19) : int((10 * len(audios)) / 19)]
user2_audios = audios[int((10 * len(audios)) / 19) :]

user1_audios.extend(common_audios)
user2_audios.extend(common_audios)

print(len(user1_audios))
print(len(user2_audios))

random.shuffle(user1_audios)
random.shuffle(user2_audios)

user1 = (
    session.query(User).filter(User.email == "srimoyee.chaudhury@midas.center").first()
)
user2 = session.query(User).filter(User.email == "sakshi.labhane@midas.center").first()


for audio in user1_audios:
    audio_file = audio.as_posix()
    print(audio_file)
    # datapoint = Data(file=audio_file, user_id=user1.id)

    # try:
    #     session.add(datapoint)
    #     session.commit()
    # except:
    #     session.rollback()
    #     print("Error")
print("Adding data completed for user 1")


for audio in user2_audios:
    audio_file = audio.as_posix()
    print(audio_file)
    # datapoint = Data(file=audio_file, user_id=user2.id)

    # try:
    #     session.add(datapoint)
    #     session.commit()
    # except:
    #     session.rollback()
    #     print("Error")
print("Adding data completed for user 2")
