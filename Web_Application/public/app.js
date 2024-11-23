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

        dropdownButton.addEventListener('click', async () => {
            if (gameDetails.style.display === 'none') {
                if (!gameDetails.innerHTML) {
                    const details = await fetchGameDetails(game.name);

                    // Populate details only if empty
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
                }

                gameDetails.style.display = 'flex';
                dropdownButton.textContent = '▲'; // Change arrow direction
            } else {
                gameDetails.style.display = 'none';
                dropdownButton.textContent = '▼'; // Reset arrow
            }
        });

        gameDiv.appendChild(gameDetails);
        gameListDiv.appendChild(gameDiv);
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
                rating: gameDetails.rating || 'N/A',
                platforms: gameDetails.platforms || [],
                genres: gameDetails.genres || [],
                comp_time: gameDetails.comp_time_in_secs
                    ? `${(gameDetails.comp_time_in_secs / 3600).toFixed(1)} Hours`
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
