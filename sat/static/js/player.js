document.addEventListener('DOMContentLoaded', function() {

  var wavesurfer = WaveSurfer.create({
    container: document.querySelector('#waveform'),
    barWidth: 2,
    barHeight: 1,
    barGap: null,
    mediaControls: false
  });

  wavesurfer.load('/audio' + audio_path);

  var playButton = document.querySelector('#play');
  var pauseButton = document.querySelector('#pause');
  var backwardButton = document.querySelector('#skip-backward');
  var forwardButton = document.querySelector('#skip-forward');

  playButton.style.display = 'none';
  pauseButton.style.display = 'none';
  backwardButton.style.display = 'none';
  forwardButton.style.display = 'none';

  playButton.addEventListener('click', function() {
    wavesurfer.play();
  });
  pauseButton.addEventListener('click', function() {
    wavesurfer.pause();
  });

  backwardButton.addEventListener('click', function() {
    wavesurfer.skipBackward(5);
  });
  forwardButton.addEventListener('click', function() {
    wavesurfer.skipForward(5);
  });

  wavesurfer.on('ready', function() {
    playButton.style.display = '';
    backwardButton.style.display = '';
    forwardButton.style.display = '';
  });

  wavesurfer.on('play', function() {
    playButton.style.display = 'none';
    pauseButton.style.display = '';
  });
  wavesurfer.on('pause', function() {
    playButton.style.display = '';
    pauseButton.style.display = 'none';
  });

});
