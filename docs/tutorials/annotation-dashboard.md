## Annotation Dashboard

Annotation Dashboard allows users to annotate the audio datapoints assigned to them. Each audio is represented as a waveform. To create segments, mouseclick on the waveform to define starting point and drag till you reach the end point of segment. To play a specific segment, mouseclick on it. This will also open segment transcription as well as labels associated with this segment.

Below the waveform is a control panel to `pause/play`, `forward` and `backward` audios. You can also use `zoom slider` to zoom in and out of waveform. This is particularly useful when annotations have to be made at granular level.

Below the control panel, `reference transcription` is shown, if provided. This can be used to segment long audios to smaller segments for training a speech recognition model. This is followed by `segment transcription`. This can be used to annotate text spoken in a segment (optional). [Labels](./label-dashboard.md) associated with a project are displayed at the bottom and are optional to fill in. Given the flexibility of defining labels, one can use the tool for tasks like Emotion Recognition, Voice Activity Detection and Disfluency detection.

After defining a segment, it is necessary for a user to save it else progress will be lost. `Save` and `Delete` button are provided below `Labels` section for this purpose. Finally, we also provide `marked for review` option in case certain audio needs to be reviewed in future. This applies to audio in general and not to a segment.

[![Annotation Dashboard](../assets/annotation-dashboard.png)](../assets/annotation-dashboard.png)
