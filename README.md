# Homework 3 - Pokedex - Project Specification

## Overview
Pokedex is an encyclopedia (or album) of different Pokemon
species, representing each Pokemon as a small "sprite" image. In this assignment, a **Pokedex** entry (referenced
by the sprite image) will link directly to a **Pokemon card**, which is a card of information for a single Pokemon
species, containing a larger image of the Pokemon, its type and weakness information, its set of moves, health
point data, and a short description.

Each Pokemon has one of 18 types (fire, water, grass, normal, electric, fighting, psychic, fairy, dark, bug, steel,
ice, ghost, poison, flying, rock, ground, and dragon) and one weakness type (also from this set of 18 types).
Again, you don’t need to know about the strength/weakness of different types - this information will be provided
to you as needed.

Here, we will simplify things by assuming that each Pokemon has no more than 4 moves (some have fewer, but
all Pokemon have at least one move). In addition, we assume that the complete Pokedex has 151 Pokemon
(more have been added over the game’s history, but these comprise the original set of Pokemon species).


### API Data
Program reads data from the following two web services we have provided for the assignment:

* https://courses.cs.washington.edu/courses/cse154/webservices/pokedex/pokedex.php
* https://courses.cs.washington.edu/courses/cse154/webservices/pokedex/game.php


#### Game Play

Each move that you make has an effect on the game state which is handled by the server.
<img src="http://courses.cs.washington.edu/courses/cse154/23sp/homework/hw3/screenshots/loading-view.png" width="50%" alt="Loading view">

Once the server responds with the data successfully, this animation should become hidden again. The
returned game data includes a `results` object that provides the results of both Pokemon's moves
(which moves were played and whether they were a hit or miss) and you should display these in the
`#p1-turn-results` and `#p2-turn-results` paragraphs in the `#results-container` in the center of the
page, as shown in the above example.

**Damage is dealt to your Pokemon and/or the opponent's Pokemon**: The returned game
    state provides data about the current health of both Pokemon. If the percentage is less than 20% (this includes 0), the health-bar should have a class of `.low-health` added to make it red (see image above for an example). When the health is greater than or equal to 20% of the total health, it should never have a `.low-health` class.

**Winning/Losing:** The game ends when one of the Pokemon has 0 hp points (this includes fleeing, discussed later). t this point, all move buttons in
`#p1` should be disabled (using the `disabled` property) so that no fetch requests are made when clicked (these buttons
will need to be re-enabled in a new game).

Below is an example output after you have won the game.

<img src="http://courses.cs.washington.edu/courses/cse154/23sp/homework/hw3/screenshots/results-v2.png" width="60%" alt="Win case screenshot">

Below is an example output after you have lost the game.

<img src="http://courses.cs.washington.edu/courses/cse154/23sp/homework/hw3/screenshots/lose-case.png" width="60%" alt="Lose case screenshot">

If you win the game and the opponent has a Pokemon that you have
not found, you should add it to your Pokedex by adding it to your collection of found Pokemon (ie.
adding the `.found` class to the corresponding sprite icon in the Pokedex). You should also
add a click event handler to the found sprite to allow it to be chosen for another game (similar to
how you did with the three starter Pokemon).

**Fleeing:** There is a button under your card during the game labeled "Flee the Battle". "Flee" is
a move that causes you to lose the game immediately.
The screenshot below is an example expected output after a player clicks the flee button and updates the view
based on a successful response from `game.php`.

<img src="http://courses.cs.washington.edu/courses/cse154/23sp/homework/hw3/screenshots/flee-case.png" width="50%" alt="Flee case screenshot">