function filtergames() {
    const searchTerm = document.getElementById('game').value.trim(); // Trim to handle accidental spaces
    const gameItems = document.querySelectorAll('.game-item');
    const gameList = document.getElementById('game-list');

    let anyVisible = false;

    gameItems.forEach(function (item) {
        const gameName = item.querySelector('span').textContent;

        if (gameName.toLowerCase().includes(searchTerm.toLowerCase())) {
            item.style.display = 'block';
            anyVisible = true;
        } else {
            item.style.display = 'none';
        }
    });

    gameList.style.display = anyVisible ? 'block' : 'none';
}

function openNav() {
    document.getElementById("mySidebar").style.width = "250px";
}

function closeNav() {
    document.getElementById("mySidebar").style.width = "0";
}

/*function adjustFooter() {
    const footer = document.querySelector('.footer');
    const bodyHeight = document.documentElement.scrollHeight;
    const viewportHeight = window.innerHeight;

    if (bodyHeight <= viewportHeight) {
        footer.style.position = 'absolute';
        footer.style.bottom = '0';

    } else {
        footer.style.position = 'relative';
    }

    footer.style.left = '0';
}
 */

function handleCookieConsent() {
    const cookieConsentPopup = document.getElementById('cookie-consent-popup');
    const acceptCookiesButton = document.getElementById('accept-cookies');
    const currentUrl = window.location.pathname;


    if (!localStorage.getItem('cookiesAccepted')) {
        if (currentUrl !== '/cookie-policy') {
            cookieConsentPopup.style.display = 'block';
        }
    }

    acceptCookiesButton.addEventListener('click', () => {
        localStorage.setItem('cookiesAccepted', 'true');
        cookieConsentPopup.style.display = 'none';
    });
}

function filterGamesList() {
    const searchTerm = document.getElementById('search').value.trim().toLowerCase();
    const gameItems = document.querySelectorAll('#game-list .game-item');
    const gameList = document.getElementById('game-list');

    let anyVisible = false;

    if (searchTerm) {
        gameItems.forEach(item => {
            const gameName = item.textContent.trim().toLowerCase();
            const isVisible = searchTerm ?  gameName.includes(searchTerm) : true;
            item.style.display = isVisible ? 'grid' : 'none';
            anyVisible = anyVisible || isVisible;
        });
    }

    gameList.style.display = anyVisible ? 'grid' : 'none';
}


function resetGameList() {
    const gameItems = document.querySelectorAll('#game-list .game-item');
    gameItems.forEach(item => item.style.display = 'grid');
    document.getElementById('game-list').style.display = 'grid';
}


function handleGameSelection(event) {
    const gameList = document.getElementById('game-list');
    const gameInput = document.getElementById('game');
    const hiddenGameIdInput = document.getElementById('selected-game-id');

    if (event.target.closest('.game-item')) {
        // Clicked on a dropdown item
        const selectedGame = event.target.closest('.game-item');
        const gameName = selectedGame.querySelector('span').textContent;
        const gameId = selectedGame.querySelector('.game-id').value;

        // Update input fields
        gameInput.value = gameName; // Set visible input to the game name
        hiddenGameIdInput.value = gameId; // Store game ID for form submission

        gameList.style.display = 'none'; // Hide dropdown
    } else if (!event.target.closest('#game')) {
        gameList.style.display = 'none';
    }
}


document.addEventListener('DOMContentLoaded', () => {
    //adjustFooter();
    handleCookieConsent();
    document.querySelector('.hamburger').addEventListener('click', openNav);
    document.querySelector('.closebtn').addEventListener('click', closeNav);

    const searchBar = document.getElementById('search-bar');
    const gameInput = document.getElementById('game');
    const gameList = document.getElementById('game-list');
    const searchInput = document.getElementById('search');

    if (searchBar) {
        //searchBar.addEventListener('input', adjustFooter);
    }

    if (gameInput) {
        gameInput.addEventListener('focus', () => {
            if (gameInput.value.trim() !== '') {
                gameList.style.display = 'grid';
            }
        });
        const hiddenGameIdInput = document.getElementById('selected-game-id');

        if (event && event.game && event.game._id) {
            // Set the visible game input field with the game's name
            gameInput.value = event.game.name;
            // Set the hidden input with the game's ID
            hiddenGameIdInput.value = event.game._id;
        }
    }

    if (searchInput) {
        searchInput.addEventListener('input', () => {
            const searchTerm = searchInput.value.trim();
                if (searchTerm === '') {
                    resetGameList(); // Laat alle spellen zien
                } else {
                    filterGamesList(); // Filter spellen
                }
        });

        searchInput.addEventListener('focus', () => {
            if (searchInput.value.trim() === '') {
                gameList.style.display = 'grid';  // Always show the list when focusing if search is empty
            }
        });
    }

    document.addEventListener('click', (event) => {
        const layout = document.querySelector('.body-container');

        if (searchInput.contains(event.target) || gameList.contains(event.target)) {
            gameList.style.display = 'grid';  // Keep list visible if clicking inside
        } else if (layout.contains(event.target)) {
            // Only hide the list if clicking outside the layout (and search field)
            gameList.style.display = 'grid';  // Hide game list when clicking outside
        }
    });

    document.addEventListener('click', handleGameSelection);
    //window.addEventListener('resize', adjustFooter);
    //document.getElementById('search').addEventListener('input', filtergames);
    //document.getElementById('search').addEventListener('input', filterGamesList);
});



