export function playSound(name) {
  const audio = new Audio(`/sounds/${name}.mp3`);
  audio.volume = 0.5;
  audio.play();
}
