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
    console.log("start");
    id('pokedex-view').classList.remove('hidden');
    id('p2').classList.add('hidden');
    qs('#p1 .hp-info').classList.add('hidden');
    id('results-container').classList.add('hidden');
    id('flee-btn').classList.add('hidden');
    id('start-btn').classList.remove('hidden');
    pokedexBuild();
    id('start-btn').addEventListener('click', gameView);
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
    const POKEDEX_URL = 'https://courses.cs.washington.edu/courses/cse154/webservices/pokedex/pokedex.php?pokedex=all';
    console.log("1");
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
          displayPokemonData(pokemonShortName, '#p1');
        }
      });

      if (foundPokemon.includes(pokemonShortName)) {
        img.classList.add("found");
      }

      id("pokedex-view").append(img);
    }
  }

  /*async function displayPokemonData(pokemonShortName) {
    const API_BASE_URL = "https://courses.cs.washington.edu/courses/cse154/webservices/pokedex/";
    try {
      let response = await fetch(API_BASE_URL + 'pokedex.php?pokemon=' + pokemonShortName);
      await statusCheck(response);
      let data = await response.json();
      qs('#p1 .name').textContent = data.name;
      qs('#p1 .pokepic').src = API_BASE_URL + data.images.photo;
      qs('#p1 .type').src = API_BASE_URL + data.images.typeIcon;
      qs('#p1 .weakness').src = API_BASE_URL + data.images.weaknessIcon;
      qs('#p1 .hp').textContent = data.hp + 'HP';
      qs('#p1 .info').textContent = data.info.description;
      // Populate moves
      let moves = document.querySelectorAll('#p1 .moves button');
      for (let i = 0; i < moves.length; i++) {
        if (i < data.moves.length) {
          moves[i].querySelector('.move').textContent = data.moves[i].name;
          moves[i].querySelector('img').src = API_BASE_URL + "icons/" + data.moves[i].type + ".jpg";
          if (data.moves[i].dp) {
            moves[i].querySelector('.dp').textContent = data.moves[i].dp + ' DP';
          }
          moves[i].classList.remove('hidden');
        } else {
          moves[i].classList.add('hidden');
        }
      }
      // Make the start button visible
      id('start-btn').classList.remove('hidden');
    } catch (err) {
      console.error(err);
    }
  }*/

  async function displayPokemonData(pokemonShortName, playerId) {
    const API_BASE_URL = "https://courses.cs.washington.edu/courses/cse154/webservices/pokedex/";
    try {
      let response = await fetch(API_BASE_URL + 'pokedex.php?pokemon=' + pokemonShortName);
      await statusCheck(response);
      let data = await response.json();
      qs(playerId + ' .name').textContent = data.name;
      qs(playerId + ' .pokepic').src = API_BASE_URL + data.images.photo;
      qs(playerId + ' .type').src = API_BASE_URL + data.images.typeIcon;
      qs(playerId + ' .weakness').src = API_BASE_URL + data.images.weaknessIcon;
      qs(playerId + ' .hp').textContent = data.hp + 'HP';
      qs(playerId + ' .info').textContent = data.info.description;
      // Populate moves
      let moves = document.querySelectorAll(playerId + ' .moves button');
      for (let i = 0; i < moves.length; i++) {
        if (i < data.moves.length) {
          moves[i].querySelector('.move').textContent = data.moves[i].name;
          moves[i].querySelector('img').src = API_BASE_URL + "icons/" + data.moves[i].type + ".jpg";
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
    console.log("called");
    id('pokedex-view').classList.add('hidden');
    id('p2').classList.remove('hidden');
    qs('#p1 .hp-info').classList.remove('hidden');
    id('results-container').classList.remove('hidden');
    id('flee-btn').classList.remove('hidden');
    id('start-btn').classList.add('hidden');
    const moveButtons = document.querySelectorAll('#p1 .moves button');
    moveButtons.forEach(button => button.disabled = false);
    const GAME_URL = "https://courses.cs.washington.edu/courses/cse154/webservices/pokedex/game.php";
    document.querySelector('h1').textContent = 'Pokemon Battle!';
    let pokeData = new FormData();
    pokeData.append("startgame", true);
    //let shortName =  qs('#p1 .name').textContent.toLocaleLowerCase();
    pokeData.append("mypokemon", currentPokemon);
  // 发送POST请求以初始化游戏
    let response = await fetch(GAME_URL, {method: 'POST', body: pokeData});
    await statusCheck(response);
    let data = await response.json();

    // 保存guid和pid
    guid = data.guid;
    pid = data.pid;

    // 显示对手的卡片
    displayPokemonData(data.p2.shortname, '#p2');
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