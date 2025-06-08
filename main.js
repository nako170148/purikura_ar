const video = document.getElementById('video');
const canvas = document.getElementById('overlay');
const ctx = canvas.getContext('2d');

// many_hearts画像の読み込みとフラグ設定
const manyHearts = new Image();
let manyHeartsLoaded = false;
manyHearts.src = 'assets/many_hearts.png';
manyHearts.onload = () => {
  manyHeartsLoaded = true;
};

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

// カメラ映像サイズが確定してから描画処理を開始
video.addEventListener('loadedmetadata', () => {
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
      const landmarks = resized.landmarks;
      const nose = landmarks.getNose()[0];
      const x = nose.x;
      const y = nose.y;

      // 💗 顔の周囲に many_hearts を表示（画像が読み込まれている場合のみ）
      if (manyHeartsLoaded) {
        const heartSize = 180;
        ctx.drawImage(manyHearts, x - heartSize-500 / 2, y - heartSize / 2, heartSize, heartSize);
      }

      // 🐱 猫耳
      const nekomimi = new Image();
      nekomimi.src = 'assets/nekomimi.png';
      nekomimi.onload = () => {
        ctx.drawImage(nekomimi, x - 50, y - 150, 100, 100);
      };

      // 🖼 ランダム画像
      const images = ['zuttomo.png', 'sukipi.png', 'heart.png'];
      const selected = images[Math.floor(Math.random() * images.length)];
      const img = new Image();
      img.src = 'assets/' + selected;
      img.onload = () => {
        ctx.drawImage(img, x - 60, y + 80, 120, 40);
      };
    });
  }, 100);
});
