export const DEFAULT_USER_TYPE = "u";
export const ADMIN_USER_TYPE = "a";
export const PROJECT_MANAGER_USER_TYPE = "pm";
export const AUDINO_ORG = "audino-org";

export const DATASET_MAPING = {
  is_librivox: "Gender, Language/Locale, Start, End, Transcription",
  is_vctx: "Gender, Accent, Age, Start, End, Transcription",
  is_voxceleb: "Gender, Nationality, Age, Start, End, Transcription",
  is_librispeech: "Gender, Start, End, Transcription",
  is_voxpopuli: "Gender, Age, Language/Locale, Start, End, Transcription",
  is_tedlium: "Gender, Language/Locale, Start, End, Transcription",
  is_commonvoice:
    "Gender, Age, Accent, Language/Locale, Start, End, Transcription",
};

export const OPTIONS_TASK_TYPE = [
  {name : 'Speech Recognition(ASR)', datasets: ['is_librivox', 'is_vctx', 'is_voxceleb', 'is_librispeech', 'is_voxpopuli', 'is_tedlium','is_commonvoice' ]},
  {name : 'Language Identification',datasets: ['is_voxpopuli','is_commonvoice']},
  {name : 'Accent & dialect identification',datasets: ['is_commonvoice']},
  {name : 'Multilingual speech processing', datasets: ['is_commonvoice']},
  {name : 'Speech Synthesis(TTS)', datasets: ['is_commonvoice','is_librispeech','is_librivox']},
  {name : 'Speaker Identification', datasets: [ 'is_voxpopuli', 'is_tedlium','is_librispeech','is_voxceleb','is_vctx']},
  {name : 'Speech Segmentation', datasets: ['is_tedlium']},
  {name : 'Language Modeling', datasets: ['is_tedlium','is_librispeech','is_librivox']},
  {name : 'ASR Error Analysis', datasets: ['is_tedlium']},
  {name : 'Speech translation', datasets: ['is_voxpopuli']},
  {name : 'Political Speech Analysis', datasets: ['is_voxpopuli']},
  {name : 'Acoustic Modeling', datasets: ['is_librispeech']},
  {name : 'Speaker Verification', datasets: ['is_voxceleb','is_vctx']},
  {name : 'Emotion Recognition', datasets: ['is_voxceleb','is_vctx']},
  {name : 'Multimodal Learning', datasets: ['is_voxceleb','is_vctx']},
  {name : 'Text Alignment', datasets: ['is_librivox']},
  {name : 'Narrative Analysis', datasets: ['is_librivox']}
]