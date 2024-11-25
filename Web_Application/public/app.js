const searchInput = document.getElementById('search-bar'); // Search bar input
const gameListDiv = document.getElementById('gameList'); // Container for game results

// Debounce timer to delay search requests
let debounceTimer;

// Function to handle search input
function handleInput() {
    clearTimeout(debounceTimer); // Clear any existing debounce timers

    // Set a new debounce timer
    debounceTimer = setTimeout(() => {
        const query = searchInput.value.trim();
        if (!query) {
            gameListDiv.innerHTML = ''; // Clear results if input is empty
            return;
        }

        // Send the query to the backend
        fetch(`http://127.0.0.1:8000/search`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: query }),
        })
            .then(response => response.json())
            .then(data => {
                if (data.Matches && data.Matches.length > 0) {
                    displayGameResults(data.Matches);
                } else {
                    gameListDiv.innerHTML = '<p>No games found.</p>';
                }
            })
            .catch(error => {
                console.error('Error fetching games:', error);
                gameListDiv.innerHTML = '<p>Error fetching results. Please try again later.</p>';
            });
    }, 500); // Debounce delay of 500ms
}

// Function to display search results
function displayGameResults(games) {
    gameListDiv.innerHTML = ''; // Clear previous results

    games.forEach(game => {
        const gameDiv = document.createElement('div');
        gameDiv.classList.add('game-item');

        // Game header (title + dropdown arrow)
        const gameHeader = document.createElement('div');
        gameHeader.classList.add('game-header');

        const gameTitle = document.createElement('h3');
        gameTitle.textContent = game.name;

        const dropdownButton = document.createElement('button');
        dropdownButton.classList.add('dropdown-arrow');
        dropdownButton.textContent = '▼';

        gameHeader.appendChild(gameTitle);
        gameHeader.appendChild(dropdownButton);
        gameDiv.appendChild(gameHeader);

        // Game details (hidden by default)
        const gameDetails = document.createElement('div');
        gameDetails.classList.add('game-details');
        gameDetails.style.display = 'none'; // Hide details by default

        // Event listener for dropdown toggle
        dropdownButton.addEventListener('click', async () => {
            const isVisible = gameDetails.style.display === 'flex';

            if (isVisible) {
                gameDetails.style.display = 'none';
                dropdownButton.textContent = '▼';
            } else {
                if (!gameDetails.innerHTML) {
                    const details = await fetchGameDetails(game.name);

                    gameDetails.innerHTML = `
                        <div class="game-details-left">
                            <p><strong>Rating:</strong> ${details.rating || 'No Rating Available'}</p>
                            <p><strong>Platforms:</strong> ${details.platforms.length > 0 ? details.platforms.join(', ') : 'No platforms available'}</p>
                            <p><strong>Genres:</strong> ${details.genres.length > 0 ? details.genres.join(', ') : 'No genres available'}</p>
                            <p><strong>Time to Beat:</strong> ${details.comp_time || 'No Time Listed'}</p>
                        </div>
                        <div class="game-details-right">
                            <img src="${details.cover ? `https://images.igdb.com/igdb/image/upload/t_cover_big/${details.cover}.webp` : 'https://via.placeholder.com/150'}" alt="${game.name} Cover" class="game-cover">
                        </div>
                    `;

                    const addToListButton = document.createElement('button');
                    addToListButton.classList.add('add-to-list-button');
                    addToListButton.textContent = 'Add to List';
                    addToListButton.addEventListener('click', () => {
                        addGameToDatabase(game);
                    });

                    gameDetails.appendChild(addToListButton);
                }

                gameDetails.style.display = 'flex';
                dropdownButton.textContent = '▲';
            }
        });

        gameDiv.appendChild(gameDetails);
        gameListDiv.appendChild(gameDiv);
    });
}

// Function to add a game to the database
function addGameToDatabase(game) {
    fetch(`http://127.0.0.1:8000/add-game`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            name: game.name,
        }),
    })
        .then(response => {
            if (!response.ok) throw new Error('Failed to add game to the database');
            return response.json();
        })
        .then(data => {
            alert(`"${game.name}" has been added to your list!`);
        })
        .catch(error => {
            console.error('Error adding game to database:', error);
            alert('Failed to add game. Please try again.');
        });
}

// Function to fetch detailed game information
async function fetchGameDetails(gameName) {
    try {
        const response = await fetch(`http://127.0.0.1:8000/get-info`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: gameName }),
        });

        if (!response.ok) throw new Error('Failed to fetch game details');

        const data = await response.json();

        if (data.name && data.name.length > 0) {
            const gameDetails = data.name[0];
            return {
                cover: data.cover,
                rating: data.rating || 'N/A',
                platforms: data.platforms || [],
                genres: data.genres || [],
                comp_time: data.comp_time_in_secs
                    ? `${(data.comp_time_in_secs / 3600).toFixed(1)} Hours`
                    : 'N/A',
            };
        } else {
            console.warn('No matches found for game:', gameName);
            return {};
        }
    } catch (error) {
        console.error('Error fetching game details:', error);
        return {};
    }
}

// Attach the event listener to the search input
searchInput.addEventListener('input', handleInput);

// Toggle Login Dropdown
const signInButton = document.getElementById('sign-in-button');
const loginDropdown = document.getElementById('login-dropdown');

// Toggle dropdown visibility on button click
signInButton.addEventListener('click', () => {
    loginDropdown.classList.toggle('hidden');
});

// Close the dropdown when clicking outside
document.addEventListener('click', (event) => {
    if (!loginDropdown.contains(event.target) && event.target !== signInButton) {
        loginDropdown.classList.add('hidden');
    }
});

// Handle login form submission
const loginForm = document.getElementById('login-form');
loginForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    fetch('http://127.0.0.1:8000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
    })
        .then(response => {
            if (!response.ok) throw new Error('Login failed');
            return response.json();
        })
        .then(data => {
            alert('Login successful!');
            loginDropdown.classList.add('hidden');
        })
        .catch(error => {
            console.error('Error logging in:', error);
            alert('Login failed. Please try again.');
        });
});
