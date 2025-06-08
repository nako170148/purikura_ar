const video = document.getElementById('video');
const canvas = document.getElementById('overlay');
const ctx = canvas.getContext('2d');

// モデルの読み込み（modelsフォルダに保存しておくこと）
Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri('models/tiny_face_detector'),
  faceapi.nets.faceLandmark68Net.loadFromUri('models/face_landmark_68')
]).then(startVideo);

function startVideo() {
  navigator.mediaDevices.getUserMedia({ video: true })
    .then(stream => {
      video.srcObject = stream;
    })
    .catch(err => {
      console.error('カメラにアクセスできません:', err);
    });
}

video.addEventListener('play', () => {
  const displaySize = { width: video.width, height: video.height };
  faceapi.matchDimensions(canvas, displaySize);

  // 描画ループ
  setInterval(async () => {
    const detection = await faceapi
      .detectAllFace(video, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks();

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (detection) {
      const resized = faceapi.resizeResults(detection, displaySize);
      const landmarks = resized.landmarks;

      // 額の座標（鼻の上を基準に）
      const nose = landmarks.getNose()[0];
      const x = nose.x;
      const y = nose.y;

      // 猫耳画像を描画
      const nekomimi = new Image();
      nekomimi.src = 'assets/nekomimi.png';
      nekomimi.onload = () => {
        ctx.drawImage(nekomimi, x - 50, y - 150, 100, 100);
      };

      // 文字（ズッ友）を描画
      const textImg = new Image();
      textImg.src = 'assets/text_zuttomo.png';
      textImg.onload = () => {
        ctx.drawImage(textImg, x - 60, y + 80, 120, 40);
      };
    }
  }, 100); // 100msごとに描画
});