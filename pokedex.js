/*
 * Name: Hanyang Yu
 * Date: May 10, 2023
 * Section: CSE 154 AF
 *
 * This is the JS to implement the UI for my emoji generator and providing
 * different way to change emoji's appearence. it is a very famous chinese
 * emoji and u can add border by clicking and zoom in or out with your mosue hover.
 * It also includes fetch toward pokemon and Amiibo API that allows user to search
 * pokemon or amiibo and provided information and picture.
 */
"use strict";

(function() {

  window.addEventListener("load", init);
  let currentPokemon;
  let guid;
  let pid;

  /**
   * initiate event listener when the window is loaded
   */
  function init() {
    let moveButtons = qsa('#p1 .moves button');
    for (let button of moveButtons) {
      button.addEventListener('click', async function() {
        let move = button.querySelector('.move').textContent.replace(/\s/g, '');
        await playMove(move);
      });
    }
    id('flee-btn').addEventListener('click', async function() {
        await playMove("flee");
    });
    id('endgame').addEventListener('click', function() {
      id('start-btn').classList.remove('hidden');
      reset();
    });
    reset();
    id('start-btn').addEventListener('click', gameView);
    pokedexBuild();
  }

  function reset() {
    id('pokedex-view').classList.remove('hidden');
    id('p2').classList.add('hidden');
    qs('#p1 .hp-info').classList.add('hidden');
    id('results-container').classList.add('hidden');
    id('flee-btn').classList.add('hidden');
    id('endgame').classList.add('hidden');
    let moveButtons = qsa('#p1 .moves button');
    for (let button of moveButtons) {
      button.disabled = true;
    }
    id('p2-turn-results').classList.add('hidden');
    id('p1-turn-results').classList.add('hidden');
    qs('h1').textContent = 'Your Pokedex';
  }

  function endGame(playerWon, pokeName) {
    qs('h1').textContent = playerWon ? 'You won!' : 'You lost!';
    let moveButtons = qsa('#p1 .moves button');
    for (let button of moveButtons) {
      button.disabled = true;
    }
    id('endgame').classList.remove('hidden');
    id('flee-btn').classList.add('hidden');
    if (playerWon && !id(pokeName).classList.contains('found')) {
      let spriteFound = id(pokeName);
      spriteFound.classList.add('found');
      spriteFound.addEventListener('click', function() {
        displayPokemonData(pokeName, '#p1');
      });
    }
  }

  /**
   * Returns the element with the specified id attribute.
   * @param {string} id string representing the id attribute of the element to be returned.
   * @returns {HTMLElement} The element with the specified id attribute.
   */
  function id(id) {
    return document.getElementById(id);
  }

  async function pokedexBuild() {
    id("pokedex-view").innerHTML = "";
    const POKEDEX_URL = 'https://courses.cs.washington.edu/courses/cse154/webservices/pokedex/pokedex.php?pokedex=all';
    try {
      let response = await fetch(POKEDEX_URL);
      await statusCheck(response);
      let pokeObj = await response.text();
      addPokedex(pokeObj);
    } catch (err) {
      console.log(err);
    }
  }

  function addPokedex(data) {
    let foundPokemon = ["bulbasaur", "charmander", "squirtle"];
    let pokemonData = data.split("\n");
    for (let i = 0; i < pokemonData.length; i++) {
      let pokemon = pokemonData[i].split(":");
      let pokemonFullName = pokemon[0];
      let pokemonShortName = pokemon[1];
      let img = document.createElement("img");
      img.src = "https://courses.cs.washington.edu/courses/cse154/webservices/pokedex/sprites/"
      + pokemonShortName + ".png";
      img.alt = pokemonFullName;
      img.classList.add("sprite");
      img.id = pokemonShortName;
      img.addEventListener("click", function() {
        if (this.classList.contains("found")) {
          currentPokemon = pokemonShortName;
          id('start-btn').classList.remove('hidden');
          displayPokemonData(pokemonShortName, '#p1');
        }
      });

      if (foundPokemon.includes(pokemonShortName)) {
        img.classList.add("found");
      }

      id("pokedex-view").append(img);
    }
  }

  async function displayPokemonData(pokemonShortName, playerId) {
    const API_URL = "https://courses.cs.washington.edu/courses/cse154/webservices/pokedex/";
    try {
      let response = await fetch(API_URL + 'pokedex.php?pokemon=' + pokemonShortName);
      await statusCheck(response);
      let data = await response.json();
      qs(playerId + ' .name').textContent = data.name;
      qs(playerId + ' .pokepic').src = API_URL + data.images.photo;
      qs(playerId + ' .type').src = API_URL + data.images.typeIcon;
      qs(playerId + ' .weakness').src = API_URL + data.images.weaknessIcon;
      qs(playerId + ' .hp').textContent = data.hp + 'HP';
      qs(playerId + ' .info').textContent = data.info.description;
      // Populate moves
      let moves = qsa(playerId + ' .moves button');
      for (let i = 0; i < moves.length; i++) {
        if (i < data.moves.length) {
          moves[i].querySelector('.dp').innerHTML = '';
          moves[i].querySelector('.move').textContent = data.moves[i].name;
          moves[i].querySelector('img').src = API_URL + "icons/" + data.moves[i].type + ".jpg";
          if (data.moves[i].dp) {
            moves[i].querySelector('.dp').textContent = data.moves[i].dp + ' DP';
          }
          moves[i].classList.remove('hidden');
        } else {
          moves[i].classList.add('hidden');
        }
      }
      // Make the start button visible only for player 1
      if (playerId === '#p1') {
        id('start-btn').classList.remove('hidden');
      }
    } catch (err) {
      console.error(err);
    }
}

  async function gameView() {
    qs('#p1 .health-bar').classList.remove('low-health');
    qs('#p2 .health-bar').classList.remove('low-health');
    qs('#p1 .health-bar').style.width = `100%`;
    qs('#p2 .health-bar').style.width = `100%`;
    id('pokedex-view').classList.add('hidden');
    id('p2').classList.remove('hidden');
    qs('#p1 .hp-info').classList.remove('hidden');
    id('results-container').classList.remove('hidden');
    id('flee-btn').classList.remove('hidden');
    id('start-btn').classList.add('hidden');
    let moveButtons = qsa('#p1 .moves button');
    for (let button of moveButtons) {
      button.disabled = false;
    }
    const GAME_URL = "https://courses.cs.washington.edu/courses/cse154/webservices/pokedex/game.php";
    document.querySelector('h1').textContent = 'Pokemon Battle!';
    let pokeData = new FormData();
    pokeData.append("startgame", true);
    pokeData.append("mypokemon", currentPokemon);
    let response = await fetch(GAME_URL, {method: 'POST', body: pokeData});
    await statusCheck(response);
    let data = await response.json();
    guid = data.guid;
    pid = data.pid;
    displayPokemonData(data.p2.shortname, '#p2');
  }

  async function playMove(move) {
    const GAME_URL = "https://courses.cs.washington.edu/courses/cse154/webservices/pokedex/game.php";
    document.querySelector('#loading').classList.remove('hidden');
    const formData = new FormData();
    formData.append('guid', guid);
    formData.append('pid', pid);
    formData.append('movename', move);
    try {
      let response = await fetch(GAME_URL, {method: 'POST', body: formData});
      await statusCheck(response);
      let data = await response.json();
      updateGameState(data);
    } catch (err) {
      console.error(err);
    } finally {
      document.querySelector('#loading').classList.add('hidden');
    }
}

function updateGameState(data) {
  const PERCENT_NUM = 100;
  id('p1-turn-results').classList.remove('hidden');
  id('p2-turn-results').classList.remove('hidden');
  console.log(data);
  let p1HP = data.p1['current-hp'];
  qs('#p1 .card .hp').textContent = `${p1HP}HP`;
  let p2HP = data.p2['current-hp'];
  qs('#p2 .card .hp').textContent = `${p2HP}HP`;
  qs('#p1 .health-bar').style.width = `${p1HP / data.p1.hp * PERCENT_NUM}%`;
  if (p1HP / data.p1.hp <= 0.2) {
    qs('#p1 .health-bar').classList.add('low-health');
  }
  qs('#p2 .health-bar').style.width = `${p2HP / data.p2.hp * PERCENT_NUM}%`;
  if (p2HP / data.p2.hp <= 0.2) {
    qs('#p2 .health-bar').classList.add('low-health');
  }
  id('p1-turn-results').textContent = `Player 1 played ${data.results['p1-move']} and ${data.results['p1-result']}!`;
  if (data.results['p2-move'] && data.results['p2-result']) {
    id('p2-turn-results').textContent = `Player 2 played ${data.results['p2-move']} and ${data.results['p2-result']}!`;
  } else {
    id('p2-turn-results').classList.add('hidden');
  }
  if (p1HP === 0) {
    endGame(false, data.p2.shortname);
  } else if (p2HP === 0) {
    endGame(true, data.p2.shortname);
  }
}

  /**
   * Checks the response status and throws an error if it's not OK.
   * @param {Response} res - The fetch response object
   * @throws {Error} If the response status is not OK
   * @returns {Response} The original response object if the status is OK
   */
  async function statusCheck(res) {
    if (!res.ok) {
      throw new Error(await res.text());
    }
    return res;
  }

  /**
   * A function that simplify calling document.querySelectorAll
   * @param {selectors} query: A query of selector
   * @returns {NodeList} An Element object representing the all elements in the document
   * that matches the specified set of CSS selectors, or null is returned if there are no matches.
   */
  function qsa(query) {
    return document.querySelectorAll(query);
  }

  /**
   * A function that simplify calling document.querySelector
   * @param {selectors} query: A query of selectors
   * @returns {Element} An Element object representing the first element in the
   * document that matches the specified set of CSS selectors, or null is returned
   * if there are no matches.
   */
  function qs(query) {
    return document.querySelector(query);
  }
})();