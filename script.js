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
const mobilePreviewTime = document.querySelector(".mobile_time>h4");
const defaultVideoText=document.querySelector(".default_video");

//accessing selected files
const inputElement = document.getElementById("file_input");
const inputFileArea = document.querySelector('.input_file');
const inputAreaText = document.querySelector('.input_file>p');

const defaultUrl = 'https://player.vimeo.com/external/194837908.sd.mp4?s=c350076905b78c67f74d7ee39fdb4fef01d12420&profile_id=164';

function checkDefaultUrl(){
  if(video.src === defaultUrl){
  defaultVideoText.style.display = "block";
  return;
  }
  defaultVideoText.style.display = "none";
}

//Handle toggle
function togglePlay() {
  const method = video.paused ? "play" : "pause";
  video.setAttribute('webkit-playsinline',true);
  video.setAttribute('playsinline',true);
  video[method]();

  toggleIcon();
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
  const progessPercent = (video.currentTime / video.duration) * 100;
  progressFill.style.flexBasis = `${progessPercent}%`;
  
  // console.log(video.currentTime);
  let {previewHour,previewMin,previewSec} = getPreTime(video.currentTime);
  mobilePreviewTime.textContent = `${previewHour}${previewMin}:${previewSec}`;
}

function getPreTime(preTime){
  // let preTime = (evtOffsetX/progressWidth)*video.duration;
  return timeUnitConvert(preTime);
}

function timeUnitConvert(preTime){
  let previewHour = (Math.floor(preTime / 3600) || "" )+ ":";
  let previewMin = Math.floor((preTime % 3600) / 60) || "0";
  let previewSec = Math.floor((preTime % 3600) % 60);

  previewHour = previewHour === ":" ? "" : previewHour;
  previewSec = previewSec < 10 ? `0${previewSec}` : previewSec;
  return {previewHour,previewMin,previewSec}
}

function setPreviewMl({innerVideoWidth,previewTimeWidth,evtOffsetX,progressWidth}){
  let innerVideoML = (evtOffsetX-innerVideoWidth) > 0 ? (evtOffsetX-innerVideoWidth): 0;
  innerVideoML = (evtOffsetX+innerVideoWidth) > progressWidth ? (progressWidth-2*innerVideoWidth) : innerVideoML;

  let previewTimeML = (evtOffsetX-previewTimeWidth) > 0 ? (evtOffsetX-previewTimeWidth): 0;
  previewTimeML = (evtOffsetX+previewTimeWidth) > progressWidth ? (progressWidth-2*previewTimeWidth) : previewTimeML;

  innerVideo.style.marginLeft =  `${innerVideoML}px`; //e.offsetX-innerVideoWidth
  previewTime.style.marginLeft = `${previewTimeML}px`; //e.offsetX-previewTimeWidth
}

function progressHoverPreview(e) {
  e.preventDefault();

  const evtOffsetX = e.offsetX ||e.touches[0].clientX;
  const progressWidth = progress.offsetWidth;

  let preTime = (evtOffsetX/progressWidth)*video.duration;
  let {previewHour,previewMin,previewSec} = getPreTime(preTime);
  mobilePreviewTime.textContent = `${previewHour}${previewMin}:${previewSec}`;
  innerVideo.currentTime = preTime;

  if(e.type === "touchmove") return;
  
  previewTime.textContent = `${previewHour}${previewMin}:${previewSec}`;
  
  const innerVideoWidth =innerVideo.offsetWidth/2;
  const previewTimeWidth = previewTime.offsetWidth/2;

  setPreviewMl({innerVideoWidth,previewTimeWidth,evtOffsetX,progressWidth});

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

function getHtmlWidthAndHeight() {
  const htmlWidth =
    (window.innerWidth ||
      document.documentElement.clientWidth ||
      document.body.clientWidth) / 100;

  const htmlHeight =
    (window.innerHeight ||
      document.documentElement.clientHeight ||
      document.body.clientHeight) / 100;

  return { htmlWidth, htmlHeight };
}

/*add EventListener*/

// toggle play
toggle.addEventListener("click", togglePlay);
// toggle.addEventListener("click", toggleIcon);

video.addEventListener("click", togglePlay);
video.addEventListener("click", mobileFullscreen);

function mobileFullscreen(){
  video.removeAttribute('webkit-playsinline');
  video.removeAttribute('playsinline');
}

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
// progress.addEventListener("click", progressPressed);
// progress.addEventListener("click", progressBarChanged);
progress.addEventListener("pointerdown", progressPressed);
progress.addEventListener("pointerdown", progressBarChanged);
video.addEventListener("timeupdate", progressTimeChanged);
// progress.addEventListener("mousedown", () => {
//   isMouseDown = true;
// });
progress.addEventListener("pointerdown", () => {
  isMouseDown = true;
});
// progress.addEventListener("mousemove", (e) => {
//   isMouseDown && progressPressed(e);
// });
progress.addEventListener("pointermove", (e) => {
  isMouseDown && progressPressed(e);
});

// window.addEventListener("mouseup", () => {
//   isMouseDown = false;
// });
window.addEventListener("pointerup", () => {
  isMouseDown = false;
});

progress.addEventListener("mousemove", progressHoverPreview);
progress.addEventListener("touchmove", progressHoverPreview);
progress.addEventListener("mouseleave",progressHoverEnd);
// progress.addEventListener("pointerleave",progressHoverEnd);

//Icons press
outer_volumeIcon.addEventListener("click", pressIcon_volume);

//keypress
window.addEventListener("keydown", keyPress);

//fileInput
checkDefaultUrl();
video.currentTime = 3;

inputElement.addEventListener("change", handleFiles);
function handleFiles() {
  const fileList = this.files; /* now you can work with the file list */
  let URL = window.URL || window.webkitURL;
  let fileURL = URL.createObjectURL(fileList[0]);
  video.src = fileURL;
  innerVideo.src = fileURL;

  inputAreaText.textContent = '已匯入影片';
  inputFileArea.style.backgroundColor = '#b19af8';
  
  checkDefaultUrl();

  const nowSpeed = inputs[1].value; 
  video['playbackRate'] = nowSpeed;

  const nowVolume = inputs[0].value; 
  video['volume'] = nowVolume;

  progressFill.style.flexBasis = 0;
  toggleIcon();
}

