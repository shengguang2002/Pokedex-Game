/*
 * Name: Hanyang Yu
 * Date: May 10, 2023
 * Section: CSE 154 AF
 * TA: Donovan Kong && Sonia Saitawdekar
 * This is the JS to implement the UI for the pokedex and two Pokemon cards.
 * A Pokedex is an encyclopedia (or album) of different Pokemon species, representing each
 * Pokemon as a small "sprite" image. Player can choose from the 3 default pokemon and fight
 * with others. There is a game system provided. Once they defeat a new pokemon, they can use it.
 */
"use strict";

(function() {

  window.addEventListener("load", init);
  let currentPokemon;
  let guid;
  let pid;

  /**
   * The init function initializes the event listeners for the move buttons, the flee button,
   * the end game button, and the start button. It also resets the game view to its initial state
   * and builds the Pokedex.
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

  /**
   * The reset function resets the game view to its initial state by hiding and showing
   * certain elements, disabling the move buttons,
   * and setting the h1 text content to "Your Pokedex".
   */
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

  /**
   * The endGame function is called when the game ends. It sets the h1 text content to "You won!"
   * or "You lost!" depending on the result of the game. It also disables the move buttons,
   * shows the endgame button, hides the flee button, and if the player won and found a new
   * Pokemon, adds the new Pokemon to the player's Pokedex and adds an event listener to the
   * new Pokemon sprite that will display the Pokemon data when clicked.
   *
   * @param {boolean} playerWon - true if the player won, false otherwise
   * @param {string} pokeName - the name of the Pokemon that the player fought against
   */
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

  /**
   * This function builds the Pokedex by fetching data from a URL and calling addPokedex() to add
   * the fetched data to the Pokedex.
   */
  async function pokedexBuild() {
    id("pokedex-view").innerHTML = "";
    const POKEDEX_URL = 'https://courses.cs.washington.edu/courses/cse154/webservices/pokedex/pokedex.php?pokedex=all';
    try {
      let response = await fetch(POKEDEX_URL);
      await statusCheck(response);
      let pokeObj = await response.text();
      addPokedex(pokeObj);
    } catch (err) {
      console.error(err);
    }
  }

  /**
   * This function adds Pokemon data to the Pokedex. It splits the fetched data into individual
   * Pokemon and adds their sprite images to the Pokedex. If the Pokemon is in the list of found
   * Pokemon, it is marked as found.
   *
   * @param {string} data - The fetched data from the Pokedex URL.
   */
  function addPokedex(data) {
    let foundPokemon = ["bulbasaur", "charmander", "squirtle"];
    let pokemonData = data.split("\n");
    for (let i = 0; i < pokemonData.length; i++) {
      let pokemon = pokemonData[i].split(":");
      let pokemonFullName = pokemon[0];
      let pokemonShortName = pokemon[1];
      let img = document.createElement("img");
      img.src = "https://courses.cs.washington.edu/courses/cse154/webservices/pokedex/sprites/" +
      pokemonShortName + ".png";
      img.alt = pokemonFullName;
      img.classList.add("sprite");
      img.id = pokemonShortName;
      img.addEventListener("click", function() {
        if (this.classList.contains("found")) {
          currentPokemon = pokemonShortName;
          displayPokemonData(pokemonShortName, '#p1');
        }
      });

      if (foundPokemon.includes(pokemonShortName)) {
        img.classList.add("found");
      }

      id("pokedex-view").append(img);
    }
  }

  /**
   * This function fetches and displays data for a specific Pokemon. It fetches the Pokemon data
   * from a URL and calls pokeDisplay() to display the fetched data.
   *
   * @param {string} pokemonShortName - The short name of the Pokemon.
   * @param {string} playerId - The id of the player.
   */
  async function displayPokemonData(pokemonShortName, playerId) {
    const API_URL = "https://courses.cs.washington.edu/courses/cse154/webservices/pokedex/";
    try {
      let response = await fetch(API_URL + 'pokedex.php?pokemon=' + pokemonShortName);
      await statusCheck(response);
      let data = await response.json();
      pokeDisplay(data, playerId);
      if (playerId === '#p1') {
        id('start-btn').classList.remove('hidden');
      }
    } catch (err) {
      console.error(err);
    }
  }

  /**
   * This function displays data for a specific Pokemon. It sets various elements in the player's
   * card to display the fetched Pokemon data.
   *
   * @param {Object} data - The fetched Pokemon data.
   * @param {string} playerId - The id of the player.
   */
  function pokeDisplay(data, playerId) {
    const API_URL = "https://courses.cs.washington.edu/courses/cse154/webservices/pokedex/";
    qs(playerId + ' .name').textContent = data.name;
    qs(playerId + ' .pokepic').src = API_URL + data.images.photo;
    qs(playerId + ' .type').src = API_URL + data.images.typeIcon;
    qs(playerId + ' .weakness').src = API_URL + data.images.weaknessIcon;
    qs(playerId + ' .hp').textContent = data.hp + 'HP';
    qs(playerId + ' .info').textContent = data.info.description;
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
  }

  /**
   * This function switches the view to the game view and initializes the game. It fetches game
   * data from a URL and calls displayPokemonData() to display the opponent's Pokemon data.
   */
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

  /**
   * This function sends a move to the server and updates the game state based on the server's
   * response.It fetches the response from the server and calls updateGameState() to
   * update the game state.
   *
   * @param {string} move - The move to be played.
   */
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

  /**
   * This function update the game state based on the server's response. It updates the HP of both
   * Pokemon and the results of the turn, and checks if either Pokemon has been defeated.
   *
   * @param {Object} data - The server's response.
   */
  function updateGameState(data) {
    const PERCENT_NUM = 100;
    const LOW_HP = 0.2;
    id('p1-turn-results').classList.remove('hidden');
    id('p2-turn-results').classList.remove('hidden');
    let p1HP = data.p1['current-hp'];
    qs('#p1 .card .hp').textContent = `${p1HP}HP`;
    let p2HP = data.p2['current-hp'];
    qs('#p2 .card .hp').textContent = `${p2HP}HP`;
    qs('#p1 .health-bar').style.width = `${p1HP / data.p1.hp * PERCENT_NUM}%`;
    if (p1HP / data.p1.hp <= LOW_HP) {
      qs('#p1 .health-bar').classList.add('low-health');
    }
    qs('#p2 .health-bar').style.width = `${p2HP / data.p2.hp * PERCENT_NUM}%`;
    if (p2HP / data.p2.hp <= LOW_HP) {
      qs('#p2 .health-bar').classList.add('low-health');
    }
    turnResult(data);
    if (p1HP === 0) {
      endGame(false, data.p2.shortname);
    } else if (p2HP === 0) {
      endGame(true, data.p2.shortname);
    }
  }

  /**
   * This function updates the text content of each player's turn results based on
   * the received data.
   * If there's no result for Player 2, it will hide Player 2's result.
   *
   * @param {Object} data - The server's response that includes the turn results for each player.
   */
  function turnResult(data) {
    id('p1-turn-results').textContent =
    `Player 1 played ${data.results['p1-move']} and ${data.results['p1-result']}!`;
    if (data.results['p2-move'] && data.results['p2-result']) {
      id('p2-turn-results').textContent =
      `Player 2 played ${data.results['p2-move']} and ${data.results['p2-result']}!`;
    } else {
      id('p2-turn-results').classList.add('hidden');
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