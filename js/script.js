let songs;
const currentSong = new Audio();
let currFolder;

function convertSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}


// --------------------------------------get data function purposely used to fetch the songs
async function getData(folder) {

    currFolder = folder;

    // first we have to fetch and convert it into text form
    let a = await fetch(`/${folder}/`);
    let response = await a.text();

    //Now that its convert we have to grab the url means hrf 
    let div = document.createElement("div");
    div.innerHTML = response;

    let as = div.getElementsByTagName("a")

    songs = [];
    //now we have to target href
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1]);
        }
    }

    //show all songs in the playlist

    let songList = document.querySelector(".songList").getElementsByTagName("ul")[0];
    songList.innerHTML = " "

    for (const song of songs) {
        songList.innerHTML = songList.innerHTML + `<li> ${song.replaceAll("%20", " ")} </li>`
    }


    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach((e) => {
        e.addEventListener("click", element => {
            playMusic(e.innerHTML.trim());
        })
    })

    return songs;
}

// ----------------------------------------play music function

const playMusic = (track, pause = false) => {
    // let audio = new Audio( "/songs/" +track)
    currentSong.src = `${currFolder}/` + track

    if (!pause) {
        currentSong.play();
        play.src = "img/pause.svg"
    }

    document.querySelector('.songInfo').innerHTML = decodeURI(track);
    document.querySelector('.songTime').innerHTML = '00:00 / 00:00'


}

// ----------------------------------------------display albums folder

async function displayAlbums() { 
        //we want to populate the albums inside the card container
        let a = await fetch(`/songs/`);
        let response = await a.text();
        let div = document.createElement('div');
        div.innerHTML = response;

        let anchors = div.getElementsByTagName('a');
        let cardContainer = document.querySelector('.card-container');
        let array = Array.from(anchors);

        for (let index = 0; index < array.length; index++) {
            const element = array[index];
            if (element.href.includes('/songs') && !element.href.includes('.htaccess')) {
                let folders = element.href.split('/').slice(-2)[0]
                //Now we have to get the meta data for the folder 
                let a = await fetch(`/songs/${folders}/info.json`)
                let response = await a.json();
                // console.log(response);


                
                cardContainer.innerHTML = cardContainer.innerHTML + `<div data-folder = "${folders}" class="card">

            <div class="circle-container">
                <svg class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24"
                    height="24">
                    <path
                        d="M18.8906 12.846C18.5371 14.189 16.8667 15.138 13.5257 17.0361C10.296 18.8709 8.6812 19.7884 7.37983 19.4196C6.8418 19.2671 6.35159 18.9776 5.95624 18.5787C5 17.6139 5 15.7426 5 12C5 8.2574 5 6.3861 5.95624 5.42132C6.35159 5.02245 6.8418 4.73288 7.37983 4.58042C8.6812 4.21165 10.296 5.12907 13.5257 6.96393C16.8667 8.86197 18.5371 9.811 18.8906 11.154C19.0365 11.7084 19.0365 12.2916 18.8906 12.846Z"
                        fill="currentColor" stroke="currentColor" stroke-width="1.5"
                        stroke-linejoin="round" />
                </svg>
            </div>
            <img src='songs/${folders}/cover.jpg' alt="">
            <h3>${response.title}</h3>
            <p>${response.description}</p>
        </div>`

            }
        }
        Array.from(document.getElementsByClassName('card')).forEach(e => {
            e.addEventListener("click", async item => {
                console.log('fething songs data');
                // console.log(item, item.target, item.currentTarget,item.target.dataset); -->  just for checking
                songs = await getData(`songs/${item.currentTarget.dataset.folder}`)
                playMusic(songs[0])
            })
        })
    }
// ------------------------------------------------main function

async function main() {
    let songs = await getData('songs/Shubh');
    playMusic(songs[0], true)

    var audio = new Audio(songs[0]);
    // audio.play();

    await displayAlbums();

    document.querySelector("#play").addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "img/pause.svg"
        } else {
            currentSong.pause();
            play.src = "img/play.svg"
        }
    })

    //add event listener to the currentSong

    currentSong.addEventListener("timeupdate", e => {
        // console.log(currentSong.currentTime , currentSong.duration);

        document.querySelector('.songTime').innerHTML = ` ${convertSeconds(currentSong.currentTime)}/ ${convertSeconds(currentSong.duration)} `

        document.querySelector('.circle').style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";

    })

    document.querySelector('.seekbar').addEventListener('click', e => {
        document.querySelector(".circle").style.left = (e.offsetX / e.target.getBoundingClientRect().width * 100) + "%";

        var percent = (e.offsetX / e.target.getBoundingClientRect().width * 100);
        currentSong.currentTime = (currentSong.duration * percent) / 100;
    })

    //Add event listener to the hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = '0'
    })

    //Add event listener to the cross image
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-300%"
    })

    //Add event listener to the prev image
    prev.addEventListener("click", () => {
        let index = songs.indexOf((currentSong.src.split("/").slice(-1)[0]))
        if (index - 1 >= 0) {
            playMusic(songs[index - 1])
        }
    })

    //Add event listener to the next image
    next.addEventListener("click", () => {

        let index = songs.indexOf((currentSong.src.split("/").slice(-1)[0]))
        if (index + 1 < songs.length) {
            playMusic(songs[index + 1])
        }
    })

    //add event listener to the volume range button
    document.querySelector('.range').getElementsByTagName('input')[0].addEventListener('change', (e) => {
        // console.log((e.target.value) / 100);
        currentSong.volume = (e.target.value) / 100;
    })

   

    let restoreVolLevel;

    document.querySelector('.volume>img').addEventListener("click", (e) => {
        if (e.target.src.includes('volume.svg')) {
            e.target.src = e.target.src.replace("volume.svg", 'mute.svg');
            restoreVolLevel = currentSong.volume;
            currentSong.volume = 0;
            document.querySelector('.range').getElementsByTagName('input')[0].value = 0;
        }
        else {
            e.target.src = e.target.src.replace('mute.svg', "volume.svg");
            currentSong.volume = restoreVolLevel;
            document.querySelector('.range').getElementsByTagName('input')[0].value = restoreVolLevel * 100;
            console.log(currentSong.volume, restoreVolLevel);
        }
    })

}

main();  