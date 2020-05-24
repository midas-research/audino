import argparse
import os
import sys
import requests
import json

from pathlib import Path

parser = argparse.ArgumentParser(description="Upload sample data to project")

parser.add_argument(
    "--username",
    type=str,
    help="Username to which this data will be assigned for annotation",
    required=True,
)
parser.add_argument(
    "--audio_file",
    type=str,
    help="Path to audio file which is to be annotated (wav, mp3, ogg only)",
    default=False,
)
parser.add_argument(
    "--reference_transcription",
    type=str,
    help="Reference transcription associated with the data",
    default=None,
)
parser.add_argument(
    "--marked_review",
    type=bool,
    help="Whether datapoint should be marked for review",
    default=False,
)

args = parser.parse_args()

api_key = os.getenv("API_KEY", None)
headers = {"Authorization": api_key}

audio_path = Path(args.audio_file)
audio_filename = audio_path.name
if audio_path.is_file():
    audio_obj = open(audio_path.resolve(), "rb")
else:
    print("Audio file does not exist")
    exit()

reference_transcription = args.reference_transcription
username = args.username
marked_review = args.marked_review

file = {"audio_file": (audio_filename, audio_obj)}

values = {
    "reference_transcription": reference_transcription,
    "username": username,
    "marked_review": marked_review,
}

print("Creating datapoint")
response = requests.post(
    "http://localhost:5000/api/data", files=file, data=values, headers=headers
)
if response.status_code == 200:
    print("Datapoint created!")
else:
    response_json = response.json()
    print(response_json["message"])
