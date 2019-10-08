var wavesurfer = WaveSurfer.create({
  container: '#waveform',
  waveColor: 'violet',
  progressColor: 'purple'
});

var file_path = '/audios/';

wavesurfer.load(file_path);
