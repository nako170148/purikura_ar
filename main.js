const video = document.getElementById('video');
const canvas = document.getElementById('overlay');
const ctx = canvas.getContext('2d');

// ハート画像読み込み
const manyHearts = new Image();
let manyHeartsLoaded = false;
manyHearts.src = 'assets/many_hearts.png';
manyHearts.onload = () => {
  manyHeartsLoaded = true;
};

// キラキラ画像読み込み
const kirakira = new Image();
let kirakiraLoaded = false;
kirakira.src = 'assets/kirakira.png';
kirakira.onload = () => {
  kirakiraLoaded = true;
};

// MediaPipe Hands の設定
const hands = new Hands({
  locateFile: file => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
});
hands.setOptions({
  maxNumHands: 2,
  modelComplexity: 1,
  minDetectionConfidence: 0.7,
  minTrackingConfidence: 0.7
});

// 顔モデルの読み込み → カメラ起動
Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri('models/tiny_face_detector'),
  faceapi.nets.faceLandmark68Net.loadFromUri('models/face_landmark_68')
]).then(startCamera);

// カメラ映像と MediaPipe Hands を連携して処理
function startCamera() {
  const camera = new Camera(video, {
    onFrame: async () => {
      await hands.send({ image: video });
    },
    width: 640,
    height: 480
  });
  camera.start();
}

// Handsの検出結果を受け取るたびにこの関数が呼ばれる
hands.onResults(async results => {
  const displaySize = {
    width: video.videoWidth,
    height: video.videoHeight
  };

  canvas.width = displaySize.width;
  canvas.height = displaySize.height;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 顔の描画
  const detections = await faceapi
    .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
    .withFaceLandmarks();

  detections.forEach(result => {
    const resized = faceapi.resizeResults(result, displaySize);
    const landmarks = resized.landmarks;
    const nose = landmarks.getNose()[0];
    const x = nose.x;
    const y = nose.y;

    // 💗 顔の両耳上あたりに many_hearts を表示
    if (manyHeartsLoaded) {
      const heartSize = 120;
      const offsetX = 80;
      const offsetY = -60;

      ctx.drawImage(
        manyHearts,
        x - offsetX - heartSize / 2,
        y + offsetY - heartSize / 2,
        heartSize,
        heartSize
      );

      ctx.drawImage(
        manyHearts,
        x + offsetX - heartSize / 2,
        y + offsetY - heartSize / 2,
        heartSize,
        heartSize
      );
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

  // 🖐 手が検出されたらキラキラを描画
  if (kirakiraLoaded && results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
    results.multiHandLandmarks.forEach(landmarks => {
      const wrist = landmarks[0]; // 手首の位置
      const x = wrist.x * canvas.width;
      const y = wrist.y * canvas.height;

      ctx.drawImage(kirakira, x - 30, y - 30, 60, 60);
    });
  }
});
