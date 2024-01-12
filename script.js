let selectedPokemons = [];

const btnaddPoke = document.getElementById("addPoke");
btnaddPoke.addEventListener('click', afegirPoke);

const btnFight = document.getElementById("fight");
btnFight.addEventListener('click', pelear);

const filterType = document.getElementById("filterType");
filterType.addEventListener('change', filtrarPorTipo);

const searchPokemonInput = document.getElementById("searchPokemon");
searchPokemonInput.addEventListener('input', function () {
    buscarPokemonPorNombre(this.value);
});

let contador = document.getElementById("numPoke");
let numerosGenerados = new Set();

let currentPage = 1;
const cardsPerPage = 8;

function generarNumeroAleatorio() {
    let numeroAleatorio;
    do {
        numeroAleatorio = Math.floor(Math.random() * 1017) + 1;
    } while (numerosGenerados.has(numeroAleatorio));

    numerosGenerados.add(numeroAleatorio);
    return numeroAleatorio;
}

function afegirPoke() {
    const pokeList = document.getElementById("pokeList");
    const pagination = document.getElementById("pagination");

    limpiarContenedores(pokeList, pagination);

    const totalCards = contador.value;
    const totalPages = Math.ceil(totalCards / cardsPerPage);
    const maxPagesToShow = 5;

    let startPage = 1;
    let endPage = totalPages;

    if (totalPages > maxPagesToShow) {
        const halfMaxPages = Math.floor(maxPagesToShow / 2);
        const isNearStart = currentPage <= halfMaxPages;
        const isNearEnd = currentPage > totalPages - halfMaxPages;

        if (isNearStart) {
            endPage = maxPagesToShow;
        } else if (isNearEnd) {
            startPage = totalPages - maxPagesToShow + 1;
        } else {
            startPage = currentPage - halfMaxPages;
            endPage = currentPage + halfMaxPages;
        }
    }

    for (let i = startPage; i <= endPage; i++) {
        const pageButton = document.createElement('button');
        pageButton.innerText = i;
        pageButton.addEventListener('click', function () {
            currentPage = i;
            afegirPoke();
        });
        pagination.appendChild(pageButton);
    }

    const prevButton = document.createElement('button');
    prevButton.innerText = '<';
    prevButton.addEventListener('click', function () {
        if (currentPage > 1) {
            currentPage--;
            afegirPoke();
        }
    });
    pagination.appendChild(prevButton);

    const nextButton = document.createElement('button');
    nextButton.innerText = '>';
    nextButton.addEventListener('click', function () {
        if (currentPage < totalPages) {
            currentPage++;
            afegirPoke();
        }
    });
    pagination.appendChild(nextButton);

    for (let i = (currentPage - 1) * cardsPerPage; i < currentPage * cardsPerPage; i++) {
        if (i < totalCards) {
            const numeroAleatorio = generarNumeroAleatorio();

            fetch(`https://pokeapi.co/api/v2/pokemon/${numeroAleatorio}`)
                .then(x => x.json())
                .then(poke => {
                    mostrarPokemon(poke, pokeList);
                });
        }
    }
}

function seleccionarPokemon(pokeCard, pokemon) {
    if (selectedPokemons.length < 2) {
        selectedPokemons.push(pokemon);

        pokeCard.classList.add('selected');

        console.log("Pokemon seleccionado:", pokemon.name);

        if (selectedPokemons.length === 2) {
            btnFight.disabled = false;
        }
    }
}

function pelear() {
    if (selectedPokemons.length === 2) {
        const pokemon1 = selectedPokemons[0];
        const pokemon2 = selectedPokemons[1];

        const statsPokemon1 = pokemon1.stats[1].base_stat;
        const statsPokemon2 = pokemon2.stats[2].base_stat;

        const resultadoPelea = document.getElementById("result");

        resultadoPelea.innerHTML = `${pokemon1.name} (A: ${statsPokemon1}) vs ${pokemon2.name} (D: ${statsPokemon2})<br>`;

        if (statsPokemon1 > statsPokemon2) {
            resultadoPelea.innerHTML += `${pokemon1.name} es el ganador`;
        } else if (statsPokemon1 < statsPokemon2) {
            resultadoPelea.innerHTML += `${pokemon2.name} es el ganador`;
        } else {
            resultadoPelea.innerHTML += "¡Es un empate!";
        }

        resultadoPelea.classList.remove("visible");
        void resultadoPelea.offsetWidth; 
        resultadoPelea.classList.add("visible");

        selectedPokemons.forEach(pokemon => {
            const selectedCard = document.querySelector('.selected');
            if (selectedCard) {
                selectedCard.classList.remove('selected');
            }
        });

        selectedPokemons = [];
        btnFight.disabled = true;
    }
}

function filtrarPorTipo() {
    const selectedType = filterType.value;
    const pokeCards = document.querySelectorAll('.poke-card');

    pokeCards.forEach(card => {
        const types = card.querySelector('#types').innerText;
        if (selectedType === "all" || types.includes(selectedType)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

function buscarPokemonPorNombre(nombre) {
    const pokeList = document.getElementById("pokeList");
    const pagination = document.getElementById("pagination");

    limpiarContenedores(pokeList, pagination);

    fetch(`https://pokeapi.co/api/v2/pokemon/${nombre.toLowerCase()}`)
        .then(x => x.json())
        .then(poke => {
            if (!poke || poke.detail === "Not found.") {
                mostrarResultadoBusqueda("No se encontró el Pokémon.");
                return;
            }

            mostrarResultadoBusqueda("Pokémon encontrado.");

            limpiarContenedores(pokeList);

            mostrarPokemon(poke, pokeList);
        })
        .catch(error => {
            console.error('Error al buscar el Pokémon:', error);
            mostrarResultadoBusqueda("Hubo un error en la búsqueda.");
        });
}

function mostrarResultadoBusqueda(mensaje) {
    const resultadoBusqueda = document.getElementById("result");
    resultadoBusqueda.innerText = mensaje;

    resultadoBusqueda.classList.remove("visible");
    void resultadoBusqueda.offsetWidth; 
    resultadoBusqueda.classList.add("visible");
}

function limpiarContenedores(...contenedores) {
    contenedores.forEach(contenedor => {
        while (contenedor.firstChild) {
            contenedor.removeChild(contenedor.firstChild);
        }
    });
}

function mostrarPokemon(poke, pokeList) {
    const temp = document.getElementById("poke-template");
    const clonedTemplate = temp.content.cloneNode(true);

    let name = clonedTemplate.querySelector('#name');
    name.innerText = poke.name;
    let img = clonedTemplate.querySelector('img');
    img.setAttribute("src", poke.sprites.front_default);
    let types = clonedTemplate.querySelector('#types');
    temporalTypes = [];
    poke.types.forEach(type => {
        temporalTypes.push(type.type.name);
    });
    console.log(temporalTypes);
    types.innerHTML = temporalTypes.join(" | ");

    let stats = clonedTemplate.querySelector('#stats');
    temporalStats = [];
    poke.stats.forEach(stat => {
        temporalStats.push(stat.base_stat);
    });
    stats.innerHTML = "A: " + temporalStats[1] + " |  D: " + temporalStats[2];

    const pokeCard = clonedTemplate.querySelector('.poke-card');
    pokeCard.addEventListener('click', () => seleccionarPokemon(pokeCard, poke));

    pokeList.appendChild(clonedTemplate);
}
