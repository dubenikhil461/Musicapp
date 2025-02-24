let currentAudio = null;
let seekBars = document.querySelectorAll(".seek-bar");
let timeDisplays = document.querySelectorAll(".time-display");
let songNames = document.querySelectorAll(".songname");
let songCover = document.getElementById("song-cover");
let playBtns = document.querySelectorAll(".play-btn");
let prevBtns = document.querySelectorAll(".prev-btn");
let nextBtns = document.querySelectorAll(".next-btn");
let image = document.querySelector(".images");
let list = document.querySelector(".list");
let backBtn = document.getElementById("back-btn");

let currentIndex = 0;
let musicFiles = [];

// Function to show image section when playing a song (for mobile)
function showImage() {
    if (window.innerWidth <= 640) {
        image.style.display = "block";
        setTimeout(() => {
            image.style.transform = "translateX(0)";
        }, 10);

        image.style.transition = "transform 0.5s ease-in-out";
        image.style.width = "95vw";
        list.style.display = "none";
        backBtn.style.display = "block";
    }
}

// Function to go back to song list (for mobile)
function showList() {
    if (window.innerWidth <= 640) {
        image.style.transform = "translateX(1000px)";
        setTimeout(() => {
            image.style.display = "none";
            list.style.display = "block";
            backBtn.style.display = "none";
        }, 500);
    }
}
backBtn.addEventListener("click", showList);

// Load music files
async function loadMusic() {
    try {
        let res = await fetch("music.json");
        musicFiles = await res.json();
        let ul = document.querySelector(".music ul");

        ul.innerHTML = musicFiles.map((file, index) =>
            `<li data-index="${index}" data-file="${file.file}" data-image="${file.image}">
                <span class="song">${file.file}</span> <br> 
                <span class="singer">${file.singer}</span>
            </li>`
        ).join("");

        document.querySelectorAll(".music ul li").forEach(li => {
            li.addEventListener("click", function () {
                currentIndex = parseInt(this.dataset.index);
                playMusic(currentIndex);
                showImage();
                document.querySelectorAll(".music ul li").forEach(item => item.classList.remove("active"));
                this.classList.add("active");
            });
        });

        if (musicFiles.length > 0) {
            playMusic(0);
        }

    } catch (error) {
        console.error("Error fetching music files:", error);
    }
}

// Play music function
function playMusic(index) {
    if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
    }

    let song = musicFiles[index];
    currentAudio = new Audio(`music/${song.file}`);
    currentAudio.play();

    // Update UI everywhere
    songNames.forEach(el => el.textContent = song.file);
    songCover.src = `img/${song.image}`;
    timeDisplays.forEach(el => el.textContent = "0:00 / 0:00");
    seekBars.forEach(el => el.value = 0);

    currentAudio.addEventListener("loadedmetadata", () => {
        seekBars.forEach(el => el.max = currentAudio.duration);
        timeDisplays.forEach(el => el.textContent = `0:00 / ${formatTime(currentAudio.duration)}`);
    });

    currentAudio.addEventListener("timeupdate", updateSeekBar);

    playBtns.forEach(btn => btn.textContent = "⏸");
}

function updateSeekBar() {
    if (!currentAudio) return;

    seekBars.forEach(el => el.value = currentAudio.currentTime);
    timeDisplays.forEach(el => el.textContent = `${formatTime(currentAudio.currentTime)} / ${formatTime(currentAudio.duration)}`);
}

seekBars.forEach(seekBar => {
    seekBar.addEventListener("input", () => {
        if (currentAudio) {
            currentAudio.currentTime = seekBar.value;
        }
    });
});

playBtns.forEach(playBtn => {
    playBtn.addEventListener("click", () => {
        if (!currentAudio) return;

        if (currentAudio.paused) {
            currentAudio.play();
            playBtns.forEach(btn => btn.textContent = "⏸");
        } else {
            currentAudio.pause();
            playBtns.forEach(btn => btn.textContent = "▶");
        }
    });
});

nextBtns.forEach(nextBtn => {
    nextBtn.addEventListener("click", () => {
        currentIndex = (currentIndex + 1) % musicFiles.length;
        playMusic(currentIndex);
    });
});

// Previous song
prevBtns.forEach(prevBtn => {
    prevBtn.addEventListener("click", () => {
        currentIndex = (currentIndex - 1 + musicFiles.length) % musicFiles.length;
        playMusic(currentIndex);
    });
});

// Format time function
function formatTime(seconds) {
    let min = Math.floor(seconds / 60);
    let sec = Math.floor(seconds % 60);
    return `${min}:${sec < 10 ? "0" + sec : sec}`;
}

// Load music on start
loadMusic();
