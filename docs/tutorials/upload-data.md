## Upload datapoints

The tool provides an end point to upload datapoints. You would need an API Key which can be found on the admin dashboard for all projects. To upload datapoints for a project, you would need to make a `POST` request to `/api/data` end point. API Key should be passed in `Authorization` header. Labels for data can also be uploaded.

Following are ways in which datapoints can be created and their respective requirements:

1. Using remote audio file url
   1. `data_url`: The URL to audio file accessable via a simple python request.
2. Using local audio files
   1. `audio_file`: The audio binary file of `mp3`, `wav` or `ogg` format along with filename.
   2. `username`: The username to whom this audio needs to be assigned for annotation. It should be one of the users created.

You can also provide the following optional information:

1. `reference_transcription`: Transcription of audio for reference.
2. `is_marked_for_review`: Whether this audio should be marked for review or not.
3. `segmentations` : The list of segmentation values for the given audio.

We provide an [example CLI script](../../examples/upload_data/upload_data.py) to show how to upload the datapoints.

For example, you can add data with reference transcripts:

```sh
// creating datapoint using local audio file
API_KEY=4369e45d3a94466b8fe1efb86b8a4392 python upload_data.py  --username admin --is_marked_for_review True --audio_file OSR_us_000_0010_8k.wav --host localhost --port 80 --reference_transcription "The birch canoe slid on the smooth planks. Glue the sheet to the dark blue background. It's easy to tell the depth of a well. These days a chicken leg is a rare dish. Rice is often served in round bowls. The juice of lemons makes fine punch. The box was thrown beside the parked truck. The hogs were fed chopped corn and garbage. Four hours of steady work faced us. Large size in stockings is hard to sell."
```

or

```sh
// creating datapoint using remote audio file url
API_KEY=67cf63744f0f444f98a4326f37b53b93 python3 upload_data.py  --username admin --is_marked_for_review True --host localhost --port 3000 --reference_transcription "Glue the sheet to the dark blue background." --data_url "https://static.wikia.nocookie.net/soundeffects/images/3/31/Bird_Singing_Chirp_Sound.ogg/revision/latest?cb=20210122103806"
```

or

add data with segmentation values:

```sh
API_KEY=cb0ac22ca0404fd19e89162bee8c462b python upload_data.py  --username admin --is_marked_for_review True --audio_file OSR_us_000_0010_8k.wav --host localhost --port 5000 --segmentations '[ { "annotations": { "testing this": { "values": [ "4", "5" ] } }, "end_time": 7.7407, "start_time": 3.8604, "transcription": "Sample transcription data" }, { "end_time": 17.7407, "start_time": 13.8604, "transcription": "Sample transcription data" }]'
```
