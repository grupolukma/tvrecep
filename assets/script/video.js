const videoPlayer = document.getElementById('video-player');
const videoSource = document.getElementById('video-source');

const videoList = [
    'assets/videos/01.mp4',
    'assets/videos/02.mp4',
    'assets/videos/03.mp4',
    'assets/videos/04.mp4',
    'assets/videos/05.mp4',
    'assets/videos/07.mp4',
    'assets/videos/08.mp4',
    'assets/videos/09.mp4',
    'assets/videos/10.mp4',
    'assets/videos/11.mp4',
    'assets/videos/12.mp4',
    'assets/videos/13.mp4',
    'assets/videos/14.mp4'
];

let currentVideoIndex = 0;

function playRandomVideo() {
    const randomIndex = Math.floor(Math.random() * videoList.length);
    currentVideoIndex = randomIndex;
    videoSource.src = videoList[currentVideoIndex];
    videoPlayer.load();
    videoPlayer.play();
}

videoPlayer.addEventListener('ended', () => {
    currentVideoIndex = (currentVideoIndex + 1) % videoList.length;
    videoSource.src = videoList[currentVideoIndex];
    videoPlayer.load();
    videoPlayer.play();
});

playRandomVideo();
