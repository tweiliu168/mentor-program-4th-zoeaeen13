/* eslint-disable prefer-destructuring */

const requestTopGame = new XMLHttpRequest();
const requestStreams = new XMLHttpRequest();
const url = 'https://api.twitch.tv/kraken';
const template = `<img src="$banner" onerror="if (this.src != './default.jpg') this.src = './default.jpg';">
<a href="$url"></a>
<div class="itemInfo">
  <div class="itemAvator">
    <img src="$logo" onerror="if (this.src != 'error.jpg') this.src = './default.jpg';">
  </div>
  <div class="itemDetail">
    <h3>$status</h3>
    <p>$username</p>
  </div>
</div>`;
const body = document.querySelector('body');
const navbar = document.querySelector('.navbar');
const gameList = document.querySelector('.gameList');
const btnShowList = document.querySelector('.btn-show-list');
const btnMore = document.querySelector('.btn-more');
let recentGame;

// add navbar items
function setNavbar(arr) {
  for (let i = 0; i < arr.length; i += 1) {
    const navItem = document.createElement('div');
    navItem.classList.add('navItem');
    navItem.innerText = arr[i].game.name;
    navbar.appendChild(navItem);
  }
}

// add stream item
function setStreamItem(arr) {
  for (let i = 0; i < arr.length; i += 1) {
    const channel = arr[i].channel;
    const streamItem = document.createElement('div');
    const content = template
      .replace('$url', channel.url)
      .replace('$banner', channel.video_banner)
      .replace('$logo', channel.logo)
      .replace('$status', channel.status)
      .replace('$username', channel.name);
    streamItem.classList.add('streamItem');
    streamItem.innerHTML = content;
    gameList.appendChild(streamItem);
  }
}

function addEmptyItem() {
  const emptyItem = document.createElement('div');
  emptyItem.classList.add('streamItem-empty');
  gameList.appendChild(emptyItem);
}

function removeEmptyItem() {
  const elements = document.querySelectorAll('.streamItem-empty');
  for (let i = 0; i < elements.length; i += 1) {
    gameList.removeChild(elements[i]);
  }
}

// call API and set streams
function updateStreams(gameName) {
  requestStreams.onload = () => {
    if (requestStreams.status >= 200 && requestStreams.status < 400) {
      const response = JSON.parse(requestStreams.responseText);
      const streamList = response.streams;
      setStreamItem(streamList);
      addEmptyItem();
      addEmptyItem();
    } else {
      console.log('error');
    }
  };

  requestStreams.onError = () => {
    console.log('error');
  };

  const offset = gameList.childElementCount;
  requestStreams.open('GET', `${url}/streams?game=${gameName}&limit=20&offset=${offset}`, true);
  requestStreams.setRequestHeader('Accept', 'application/vnd.twitchtv.v5+json');
  requestStreams.setRequestHeader('Client-ID', '0n4il3nmibawzxq23hqdbid338v15p');
  requestStreams.send();
}

// show top 5 games
function getTopGame() {
  requestTopGame.onload = () => {
    if (requestTopGame.status >= 200 && requestTopGame.status < 400) {
      const response = JSON.parse(requestTopGame.responseText);
      const games = response.top;
      setNavbar(games);
      // select the first item
      document.querySelector('.navItem').classList.add('select');
      recentGame = document.querySelector('.navItem').innerText;
      updateStreams(recentGame);
    } else {
      console.log('error');
    }
  };

  requestTopGame.onError = () => {
    console.log('error');
  };

  requestTopGame.open('GET', `${url}/games/top?limit=5`, true);
  requestTopGame.setRequestHeader('Accept', 'application/vnd.twitchtv.v5+json');
  requestTopGame.setRequestHeader('Client-ID', '0n4il3nmibawzxq23hqdbid338v15p');
  requestTopGame.send();
}

getTopGame();

// click
btnShowList.addEventListener('click', () => {
  gameList.scrollIntoView();
});

btnMore.addEventListener('click', () => {
  removeEmptyItem();
  updateStreams(recentGame);
});

body.addEventListener('click', (e) => {
  // navbar
  if (e.target.closest('.navItem')) {
    recentGame = e.target.closest('.navItem').innerText;
    gameList.innerHTML = '';
    updateStreams(recentGame);

    // update the recent navbar
    const navItems = document.querySelectorAll('.navItem');
    for (let i = 0; i < navItems.length; i += 1) {
      if (navItems[i] === e.target) {
        navItems[i].classList.add('select');
      } else if (e.target.classList.contains('navItem')) {
        navItems[i].classList.remove('select');
      }
    }
  }

  // item
  if (e.target.closest('.streamItem')) {
    const streamUrl = e.target.closest('.streamItem').querySelector('a').href;
    window.location.href = streamUrl;
  }
});
