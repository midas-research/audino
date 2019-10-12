document.addEventListener('DOMContentLoaded', function() {

  var wavesurfer = WaveSurfer.create({
    container: document.querySelector('#waveform'),
    barWidth: 2,
    barHeight: 1,
    barGap: null,
    mediaControls: false
  });

  wavesurfer.load('/audio/' + audio_id);

  var playpauseButton = document.querySelector('#playpause');
  var backwardButton = document.querySelector('#skip-backward');
  var forwardButton = document.querySelector('#skip-forward');

  playpauseButton.style.display = 'none';
  backwardButton.style.display = 'none';
  forwardButton.style.display = 'none';

  playpauseButton.addEventListener('click', function() {
    wavesurfer.playPause();
  });

  backwardButton.addEventListener('click', function() {
    wavesurfer.skipBackward(5);
  });
  forwardButton.addEventListener('click', function() {
    wavesurfer.skipForward(5);
  });

  wavesurfer.on('ready', function() {
    playpauseButton.style.display = '';
    backwardButton.style.display = '';
    forwardButton.style.display = '';
  });

});
