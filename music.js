let currentAudio = null;
let seekBar = document.querySelector(".seek-bar");
let timeDisplay = document.querySelector(".time-display");
let songName = document.querySelector(".songname");
let songCover = document.getElementById("song-cover");
let playBtn = document.querySelector(".play-btn img");
let prevBtn = document.querySelector(".prev-btn img");
let nextBtn = document.querySelector(".next-btn img");
let image = document.querySelector(".images");
let list = document.querySelector(".list");
let svg = document.querySelector("#svgs img")
let currentIndex = 0;
let musicFiles = [];



svg.addEventListener("click", () => {
    if (svg.src.includes("arrow-down.svg")) {
        list.style.top = "0"; 
        svg.src = "https://unpkg.com/feather-icons/dist/icons/arrow-up.svg";
    } else {
        list.style.top = "-100vh"; 
        svg.src = "https://unpkg.com/feather-icons/dist/icons/arrow-down.svg";
    }
});

async function loadMusic() {
    try {
        let res = await fetch("public/music.json");
        musicFiles = await res.json();
        let ul = document.querySelector(".music ul");

        ul.innerHTML = musicFiles.map((file, index) =>
            `<li data-index="${index}" data-file="${file.file}" data-image="${file.image}">
                <span class="song">${file.file}</span> <br> 
                <span class="singer">${file.singer}</span>
            </li>`
        ).join("");

      ul.addEventListener("click", (e) => {
            if (e.target.closest("li")) {
                let li = e.target.closest("li");
                currentIndex = parseInt(li.dataset.index);
                playMusic(currentIndex);
            
            }
        });

        if (musicFiles.length > 0) {
            playMusic(0);
        }
    } catch (error) {
        console.error("Error fetching music files:", error);
    }
}

function playMusic(index) {
    if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
    }

    let song = musicFiles[index];
    currentAudio = new Audio(`public/music/${song.file}`);
    currentAudio.play();

    songName.textContent = song.file;
    songCover.src = `public/img/${song.image}`;
    timeDisplay.textContent = "0:00 / 0:00";
    seekBar.value = 0;

    currentAudio.addEventListener("loadedmetadata", () => {
        seekBar.max = currentAudio.duration;
        timeDisplay.textContent = `0:00 / ${formatTime(currentAudio.duration)}`;
    });

    currentAudio.addEventListener("timeupdate", updateSeekBar);
    currentAudio.addEventListener("ended", () => {
        currentIndex = (currentIndex + 1) % musicFiles.length;
        playMusic(currentIndex);
    });

    playBtn.src = `public/pause.svg`;
}

function updateSeekBar() {
    if (!currentAudio) return;

    seekBar.value = currentAudio.currentTime;
    timeDisplay.textContent = `${formatTime(currentAudio.currentTime)} / ${formatTime(currentAudio.duration)}`;
}

seekBar.addEventListener("input", () => {
    if (currentAudio) {
        currentAudio.currentTime = seekBar.value;
    }
});

playBtn.addEventListener("click", () => {
    if (!currentAudio) return;

    if (currentAudio.paused) {
        currentAudio.play();
        playBtn.src = `public/pause.svg`;
    } else {
        currentAudio.pause();
        playBtn.src = `public/play.svg`;
    }
});

nextBtn.addEventListener("click", () => {
    currentIndex = (currentIndex + 1) % musicFiles.length;
    playMusic(currentIndex);
});

prevBtn.addEventListener("click", () => {
    currentIndex = (currentIndex - 1 + musicFiles.length) % musicFiles.length;
    playMusic(currentIndex);
});

function formatTime(seconds) {
    let min = Math.floor(seconds / 60);
    let sec = Math.floor(seconds % 60);
    return `${min}:${sec < 10 ? "0" + sec : sec}`;
}

loadMusic();
