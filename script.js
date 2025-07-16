let selectedClothing = new Image();
selectedClothing.src = "assets/clothes/tshirt1.png";
selectedClothing.onload = () => {
  console.log("Clothing loaded");
};

document.querySelectorAll('.clothing-thumb').forEach(el => {
  el.onclick = () => {
    selectedClothing.src = el.dataset.src;
  };
});

const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// Start webcam
navigator.mediaDevices.getUserMedia({ video: true }).then(stream => {
  video.srcObject = stream;
});

// Initialize Pose
const pose = new Pose({
  locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5/${file}`,
});

pose.setOptions({
  modelComplexity: 0,
  smoothLandmarks: true,
  enableSegmentation: false,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5
});

// Handle Results
pose.onResults(results => {
  if (!results.poseLandmarks) return;

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);

  const landmarks = results.poseLandmarks;
  const leftShoulder = landmarks[11];
  const rightShoulder = landmarks[12];
    // 👇 هنا تضيف console.log لمراقبة القيم
  console.log("Left Shoulder:", leftShoulder);
  console.log("Right Shoulder:", rightShoulder);

  if (leftShoulder && rightShoulder) {
    const x1 = leftShoulder.x * canvas.width;
    const y1 = leftShoulder.y * canvas.height;
    const x2 = rightShoulder.x * canvas.width;
    const y2 = rightShoulder.y * canvas.height;

    const centerX = (x1 + x2) / 2;
    const centerY = (y1 + y2) / 2;

    const shoulderWidth = Math.abs(x2 - x1);
    const imageWidth = shoulderWidth * 2.4; // عرض التيشيرت
    const imageHeight = imageWidth * (selectedClothing.height / selectedClothing.width); // نسبة الطول


    const verticalOffset = 0.25 * canvas.height; // يمكنك تعديل الرقم

    ctx.drawImage(
      selectedClothing,
      centerX - imageWidth / 2,
      centerY - imageHeight / 2 + verticalOffset,
      imageWidth,
      imageHeight
    );
  }
  ctx.fillStyle = "red";
ctx.beginPath();
ctx.arc(leftShoulder.x * canvas.width, leftShoulder.y * canvas.height, 10, 0, 2 * Math.PI);
ctx.fill();

ctx.fillStyle = "blue";
ctx.beginPath();
ctx.arc(rightShoulder.x * canvas.width, rightShoulder.y * canvas.height, 10, 0, 2 * Math.PI);
ctx.fill();

});

// Start camera and send frames
const camera = new Camera(video, {
  onFrame: async () => {
    await pose.send({ image: video });
  },
  width: 640,
  height: 480
});
camera.start();
