/* get Elements*/
const toggle = document.querySelector(".toggle");
const video = document.querySelector(".outer");
const innerVideo = document.querySelector(".inner");
const skipButtons = document.querySelectorAll(".skip");
const fullscreenButton = document.querySelector(".fullscreen");
const player = document.querySelector(".player");
const inputs = document.querySelectorAll("input");
const progress = document.querySelector(".progress");
const progressFill = document.querySelector(".progress_fill");
const volumeHint = document.querySelector(".volume_dialog");
const outer_volumeIcon = document.querySelector(".volume_icon");
const outer_speedIcon = document.querySelector(".speed_icon");
const inner_volumeIcon = document.querySelector(".sound");
const selectedFile = document.getElementById("file_input");
const previewTime = document.querySelector(".player_controls .video_preview p");

//accessing selected files
const inputElement = document.getElementById("file_input");

/*set functions*/

//Handle toggle
function togglePlay() {
  const method = video.paused ? "play" : "pause";
  video[method]();
}

function toggleIcon() {
  const icon = video.paused ? "▶" : "❚ ❚";
  toggle.textContent = icon;
}

//Handle skipButtons
function skipPress() {
  video.currentTime += parseFloat(this.dataset.skip);
}

//Handle fullscreen
function fullscreenPress() {
  if (document.fullscreenElement != null) {
    document.exitFullscreen();
  } else {
    player.requestFullscreen();
  }
}

//Handle inputs
function inputChanged() {
  video[this.name] = this.value;
  const percent = ((this.value - this.min) / (this.max - this.min)) * 100;
  this.style.setProperty(
    "--gradient",
    `linear-gradient(to right,green 0%,
                                                            green ${percent}%,
                                                            #fff ${percent}%, 
                                                            #fff 100%)`
  );
  isVolumeZero();
}

function updateRunnable() {
  inputs.forEach((input) => {
    const percent = ((input.value - input.min) / (input.max - input.min)) * 100;
    input.style.setProperty(
      "--gradient",
      `linear-gradient(to right,green 0%,
                                                            green ${percent}%,
                                                            #fff ${percent}%, 
                                                            #fff 100%)`
    );
  });
}

function volumeArrowKeys(nowInput, key) {
  inputs[0].value = nowInput;
  video.volume = parseFloat(inputs[0].value);
  updateRunnable();
  volumeShow(key);
}

function volumeShow(volume) {
  const volumeIcon = volume === "up" ? "🔊" : "🔉";
  const percent =
    ((inputs[0].value - inputs[0].min) / (inputs[0].max - inputs[0].min)) * 100;
  volumeHint.textContent = `${volumeIcon} ${percent.toFixed(0)}%`;
  volumeHint.style.opacity = "1";
  isVolumeZero();
}

function transitionEnd() {
  volumeHint.style.opacity = "0";
}

function isVolumeZero() {
  if (video.volume === 0) {
    inner_volumeIcon.src = "no sound.png";
    return;
  }

  if (inputs[0].value > 0) {
    inner_volumeIcon.src = "sound.png";
  }
}

//Handle progress
function progressPressed(e) {
  const pressedPortion = e.offsetX / progress.offsetWidth;
  const pressedVideoTime = pressedPortion * video.duration;
  video.currentTime = pressedVideoTime;
}

function progressBarChanged(e) {
  const pressedPercent = (e.offsetX / progress.offsetWidth) * 100;
  progressFill.style.flexBasis = `${pressedPercent}%`;
}

function progressTimeChanged() {
  const timePercent = (video.currentTime / video.duration) * 100;
  progressFill.style.flexBasis = `${timePercent}%`;
}

const innerVideoWidth =innerVideo.offsetWidth/2;
const previewTimeWidth = previewTime.offsetWidth/2;
function progressHoverPreview(e) {
  const evtOffsetX = e.offsetX;
  const progressWidth = progress.offsetWidth;

  let prePercent = evtOffsetX / progressWidth;
  let preTime = video.duration * prePercent;

  let preHour = (Math.floor(preTime / 3600) || "" )+ ":";
  let preMin = Math.floor((preTime % 3600) / 60) || "0";
  let preSec = Math.floor((preTime % 3600) % 60);

  preHour = preHour === ":" ? "" : preHour;
  preSec = preSec < 10 ? `0${preSec}` : preSec;

  let innerVideoML = (evtOffsetX-innerVideoWidth) > 0 ? (evtOffsetX-innerVideoWidth): 0;
  innerVideoML = (evtOffsetX+innerVideoWidth) > progressWidth ? (progressWidth-2*innerVideoWidth) : innerVideoML;

  let previewTimeML = (evtOffsetX-previewTimeWidth) > 0 ? (evtOffsetX-previewTimeWidth): 0;
  previewTimeML = (evtOffsetX+previewTimeWidth) > progressWidth ? (progressWidth-2*previewTimeWidth) : previewTimeML;

  innerVideo.style.marginLeft =  `${innerVideoML}px`; //e.offsetX-innerVideoWidth
  previewTime.style.marginLeft = `${previewTimeML}px`; //e.offsetX-previewTimeWidth

  innerVideo.currentTime = preTime;
  previewTime.textContent = `${preHour}${preMin}:${preSec}`;

  innerVideo.style.display = "block";
  previewTime.style.display = "block";

  
}

function progressHoverEnd(){
    innerVideo.style.display = "none";
    previewTime.style.display = "none"
}

//press Icons
let lastVolume = 1;
function pressIcon_volume() {
  if (video.volume === 0) {
    video.volume = lastVolume;
    inner_volumeIcon.src = "sound.png";
    inputs[0].value = lastVolume;
    updateRunnable();
  } else {
    lastVolume = video.volume;
    video.volume = 0;
    inner_volumeIcon.src = "no sound.png";
    inputs[0].value = 0;
    updateRunnable();
  }
}

//Handle keyPress
function keyPress(e) {
  //press ArrowUp
  if (e.key === "ArrowUp") {
    e.preventDefault();
    const nowInput = parseFloat(inputs[0].value) + parseFloat(inputs[0].step);
    volumeArrowKeys(nowInput, "up");
  }

  //press ArrowDown
  if (e.key === "ArrowDown") {
    e.preventDefault();
    const nowInput = parseFloat(inputs[0].value) - parseFloat(inputs[0].step);
    volumeArrowKeys(nowInput, "down");
  }

  //check if Inputs focus, when focusing go to return (if not doing this will trigger some bugs)
  let isInputFocus = false;
  inputs.forEach((input) => {
    if (document.activeElement === input) {
      isInputFocus = true;
      return;
    }
  });

  if (isInputFocus) {
    return;
  }

  // press Space
  if (e.key === " ") {
    e.preventDefault();
    togglePlay();
    toggleIcon();
  }

  //press ArrowRight
  if (e.key === "ArrowRight") {
    video.currentTime += 5;
  }

  //press ArrowLeft
  if (e.key === "ArrowLeft") {
    video.currentTime -= 5;
  }
}

/*add EventListener*/

// toggle play
toggle.addEventListener("click", togglePlay);
toggle.addEventListener("click", toggleIcon);
video.addEventListener("click", togglePlay);
video.addEventListener("click", toggleIcon);

//skip buttons
skipButtons.forEach((skipButton) =>
  skipButton.addEventListener("click", skipPress)
);

//fullscreen button
fullscreenButton.addEventListener("click", fullscreenPress);

//inputs
inputs.forEach((input) => input.addEventListener("input", inputChanged));
window.addEventListener("load", updateRunnable);
volumeHint.addEventListener("transitionend", transitionEnd);

//progress
let isMouseDown = false;
progress.addEventListener("click", progressPressed);
progress.addEventListener("click", progressBarChanged);
video.addEventListener("timeupdate", progressTimeChanged);
progress.addEventListener("mousedown", () => {
  isMouseDown = true;
});
progress.addEventListener("mousemove", (e) => {
  isMouseDown && progressPressed(e);
});
window.addEventListener("mouseup", () => {
  isMouseDown = false;
});

progress.addEventListener("mousemove", progressHoverPreview);
progress.addEventListener("mouseleave",progressHoverEnd);

//Icons press
outer_volumeIcon.addEventListener("click", pressIcon_volume);

//keypress
window.addEventListener("keydown", keyPress);

//fileInput
inputElement.addEventListener("change", handleFiles, false);
function handleFiles() {
  const fileList = this.files; /* now you can work with the file list */
  let URL = window.URL || window.webkitURL;
  let fileURL = URL.createObjectURL(fileList[0]);
  video.src = fileURL;
  innerVideo.src = fileURL;
}
