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

function adjustFooter() {
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

function handleCookieConsent() {
    const cookieConsentPopup = document.getElementById('cookie-consent-popup');
    const acceptCookiesButton = document.getElementById('accept-cookies');

    if (!localStorage.getItem('cookiesAccepted')) {
        cookieConsentPopup.style.display = 'block';
    }

    acceptCookiesButton.addEventListener('click', () => {
        localStorage.setItem('cookiesAccepted', 'true');
        cookieConsentPopup.style.display = 'none';
    });
}

function filterGamesList() {
    const searchTerm = document.getElementById('search').value.trim().toLowerCase();
    const gameItems = document.querySelectorAll('#game-list li');
    const gameList = document.getElementById('game-list');

    let anyVisible = false;

    if (searchTerm) {
        gameItems.forEach(item => {
            const gameName = item.textContent.trim().toLowerCase();
            const isVisible = searchTerm ?  gameName.includes(searchTerm) : true;
            item.style.display = isVisible ? 'block' : 'none';
            anyVisible = anyVisible || isVisible;
        });
    }

    gameList.style.display = anyVisible ? 'block' : 'none';
}


function resetGameList() {
    const gameItems = document.querySelectorAll('#game-list li');
    gameItems.forEach(item => item.style.display = 'block');
    document.getElementById('game-list').style.display = 'block';
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
    adjustFooter();
    handleCookieConsent();

    const searchBar = document.getElementById('search-bar');
    const gameInput = document.getElementById('game');
    const gameList = document.getElementById('game-list');
    const searchInput = document.getElementById('search');

    if (searchBar) {
        searchBar.addEventListener('input', adjustFooter);
    }

    if (gameInput) {
        gameInput.addEventListener('focus', () => {
            if (gameInput.value.trim() !== '') {
                gameList.style.display = 'block';
            }
        });
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
                gameList.style.display = 'block';  // Always show the list when focusing if search is empty
            }
        });
    }

    document.addEventListener('click', (event) => {
        const layout = document.querySelector('.body-container');

        if (searchInput.contains(event.target) || gameList.contains(event.target)) {
            gameList.style.display = 'block';  // Keep list visible if clicking inside
        } else if (layout.contains(event.target)) {
            // Only hide the list if clicking outside the layout (and search field)
            gameList.style.display = 'block';  // Hide game list when clicking outside
        }
    });

    document.addEventListener('click', handleGameSelection);
    window.addEventListener('resize', adjustFooter);
    //document.getElementById('search').addEventListener('input', filtergames);
    //document.getElementById('search').addEventListener('input', filterGamesList);
});



