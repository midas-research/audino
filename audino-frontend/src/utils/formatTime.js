function formatTime(currentTime) {
  const minutes = Math.floor(currentTime / 60);
  const seconds = Math.floor(currentTime % 60);
  return `${minutes ? minutes : "00"}:${seconds < 10 ? "0" : ""}${seconds}`;
}

export default formatTime;
