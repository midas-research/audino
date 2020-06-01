# Upload datapoints

The tool provides an end point to upload datapoints. You would need an API Key which can be found on the admin dashboard for all projects. To upload datapoints for a project, you would need to make a `POST` request to `/api/data` end point. API Key should be passed in `Authorization` header.

For every datapoint, we need to provide the following required information:

1. `audio_file`: The audio binary file of `mp3`, `wav` or `ogg` format along with filename.
2. `username`: The username to whom this audio needs to be assigned for annotation. It should be one of the users created.

You can also provide the following optional information:

1. `reference_transcription`: Transcription of audio for reference.
2. `is_marked_for_review`:  Whether this audio should be marked for review or not.

We provide an [example CLI script](../../example/upload_data) to show how to upload the datapoints.
