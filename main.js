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
  const displaySize = { width: video.width, height: video.height };
  faceapi.matchDimensions(canvas, displaySize);

  setInterval(async () => {
    const detections = await faceapi
      .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks();

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    detections.forEach(result => {
      const resized = faceapi.resizeResults(result, displaySize);
      const landmarks = resized.landmarks;

      const nose = landmarks.getNose()[0];
      const x = nose.x;
      const y = nose.y;

      // 🐱 猫耳画像を描画
      const nekomimi = new Image();
      nekomimi.src = 'assets/nekomimi.png';
      nekomimi.onload = () => {
        ctx.drawImage(nekomimi, x - 50, y - 150, 100, 100);
      };

      // 💖 ランダム画像リストから1枚選ぶ
      const randomImages = ['zuttomo.png', 'sukipi.png', 'heart.png'];
      const selectedImage = randomImages[Math.floor(Math.random() * randomImages.length)];

      const effectImg = new Image();
      effectImg.src = 'assets/' + selectedImage;
      effectImg.onload = () => {
        ctx.drawImage(effectImg, x - 60, y + 80, 120, 40);
      };
    });
  }, 100);
});
