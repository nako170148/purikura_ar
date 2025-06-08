const video = document.getElementById('video');  
const canvas = document.getElementById('overlay');
const ctx = canvas.getContext('2d');

// モデルの読み込み
Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri('models/tiny_face_detector'),
  faceapi.nets.faceLandmark68Net.loadFromUri('models/face_landmark_68')
]).then(startVideo);

// カメラ起動
function startVideo() {
  navigator.mediaDevices.getUserMedia({ video: true })
    .then(stream => {
      video.srcObject = stream;
    })
    .catch(err => {
      console.error('カメラにアクセスできません:', err);
    });
}

// 描画ループ
video.addEventListener('play', () => {
  const displaySize = {
    width: video.videoWidth,
    height: video.videoHeight
  };

  canvas.width = displaySize.width;
  canvas.height = displaySize.height;

  faceapi.matchDimensions(canvas, displaySize);

  setInterval(async () => {
    const detections = await faceapi
      .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks();

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    detections.forEach(result => {
      const resized = faceapi.resizeResults(result, displaySize);
      ...
    });
  }, 100);
});
