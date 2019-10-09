document.addEventListener('DOMContentLoaded', function() {

  var wavesurfer = WaveSurfer.create({
    container: document.querySelector('#waveform'),
    barWidth: 2,
    barHeight: 1,
    barGap: null,
    backend: 'MediaElement',
    mediaControls: false
  });

  wavesurfer.load('/audio' + audio_path);

  var playButton = document.querySelector('#play');
  var pauseButton = document.querySelector('#pause');
  var backwardButton = document.querySelector('#skip-backward');
  var forwarButton = document.querySelector('#skip-forward');

  playButton.addEventListener('click', function() {
    wavesurfer.play();
  });
  pauseButton.addEventListener('click', function() {
    wavesurfer.pause();
  });

  backwardButton.addEventListener('click', function() {
    wavesurfer.skipBackward(5);
  });
  forwarButton.addEventListener('click', function() {
    wavesurfer.skipForward(5);
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
