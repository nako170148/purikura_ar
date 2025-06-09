const video = document.getElementById('video');
const canvas = document.getElementById('overlay');
const ctx = canvas.getContext('2d');

// many_hearts画像の読み込み
const manyHearts = new Image();
let manyHeartsLoaded = false;
manyHearts.src = 'assets/many_hearts.png';
manyHearts.onload = () => {
  manyHeartsLoaded = true;
};

// sparkle画像の読み込み
const sparkle = new Image();
let sparkleLoaded = false;
sparkle.src = 'assets/sparkle.png';
sparkle.onload = () => {
  sparkleLoaded = true;
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

// 揺れ判定用の変数
let lastNoseX = null;
let shakeThreshold = 5;     // 敏感さのしきい値（px）
let shakeCounter = 0;       // 揺れ検出フレーム数
let isShaking = false;      // 現在の揺れ状態

// カメラ映像のサイズが確定してから描画開始
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

      //  ハート（耳あたり）
      if (manyHeartsLoaded) {
        const heartSize = 120;
        const offsetX = 80;
        const offsetY = -60;

        ctx.drawImage(manyHearts, x - offsetX - heartSize / 2, y + offsetY - heartSize / 2, heartSize, heartSize);
        ctx.drawImage(manyHearts, x + offsetX - heartSize / 2, y + offsetY - heartSize / 2, heartSize, heartSize);
      }

      //  猫耳
      const nekomimi = new Image();
      nekomimi.src = 'assets/nekomimi.png';
      nekomimi.onload = () => {
        ctx.drawImage(nekomimi, x - 50, y - 150, 100, 100);
      };

      //  ランダム画像
      const images = ['zuttomo.png', 'sukipi.png', 'heart.png'];
      const selected = images[Math.floor(Math.random() * images.length)];
      const img = new Image();
      img.src = 'assets/' + selected;
      img.onload = () => {
        ctx.drawImage(img, x - 60, y + 80, 120, 40);
      };

      //  揺れ検出とフレーム持続処理
      if (lastNoseX !== null) {
        const dx = Math.abs(x - lastNoseX);
        if (dx > shakeThreshold) {
          shakeCounter = 5; // 揺れを5フレーム持続
        } else if (shakeCounter > 0) {
          shakeCounter--;
        }
        isShaking = shakeCounter > 0;
      }
      lastNoseX = x;

      //  sparkle表示（顔の外側に4つ）
      if (isShaking && sparkleLoaded) {
        const size = 50;
        const offset = 120;

        ctx.drawImage(sparkle, x - offset - size / 2, y - offset - size / 2, size, size); // 左上
        ctx.drawImage(sparkle, x + offset - size / 2, y - offset - size / 2, size, size); // 右上
        ctx.drawImage(sparkle, x - offset - size / 2, y + offset - size / 2, size, size); // 左下
        ctx.drawImage(sparkle, x + offset - size / 2, y + offset - size / 2, size, size); // 右下
      }
    });
  }, 100);
});
