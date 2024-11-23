const searchInput = document.getElementById('search-bar');
const gameListDiv = document.getElementById('gameList');

// Debounce timer
let debounceTimer;

// Function to handle search input and display games
function handleInput() {
    // Clear the previous debounce timer if the user is still typing
    clearTimeout(debounceTimer);

    // Set a new debounce timer
    debounceTimer = setTimeout(() => {
        const query = searchInput.value;
        if (!query) return;

        // Fetch game matches from the backend
        fetch(`http://127.0.0.1:8000/search`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: query }),
        })
        .then(response => response.json())
        .then(data => {
            if (data.Matches) {
                displayGameResults(data.Matches);
            } else {
                gameListDiv.innerHTML = '<p>No games found.</p>';
            }
        })
        .catch(error => {
            console.error('Error fetching games:', error);
            gameListDiv.innerHTML = '<p>Error fetching results. Try again later.</p>';
        });
    }, 500); // Wait 500ms after the user stops typing before searching
}

// Function to display the search results
async function displayGameResults(games) {
    gameListDiv.innerHTML = ''; // Clear previous results
    if (games.length === 0) {
        gameListDiv.innerHTML = '<p>No games found.</p>';
        return;
    }

    games.forEach(game => {
        const gameDiv = document.createElement('div');
        gameDiv.className = 'game-item';

        // Game Name (Clickable)
        const gameTitle = document.createElement('h3');
        gameTitle.innerText = game.name;
        gameDiv.appendChild(gameTitle);

        // Dropdown Button to show game details
        const detailsButton = document.createElement('button');
        detailsButton.innerText = 'Show Details';
        gameDiv.appendChild(detailsButton);

        // Details Section (Initially Hidden)
        const detailsDiv = document.createElement('div');
        detailsDiv.className = 'game-details';
        detailsDiv.style.display = 'none'; // Initially hidden

        // Append to the gameDiv
        gameDiv.appendChild(detailsDiv);

        // Toggle details visibility when button is clicked
        detailsButton.addEventListener('click', async () => {
            // Fetch additional details if not already loaded
            if (detailsDiv.style.display === 'none' || detailsDiv.style.display === '') {
                const gameDetails = await fetchGameDetails(game.name);  // Fetch game details

                // Update the details section with the fetched data
                detailsDiv.innerHTML = `
                    <p><strong>Rating:</strong> ${gameDetails.rating || 'No Rating Available'}</p>
                    <p><strong>Platforms:</strong> ${gameDetails.platforms.length > 0 ? gameDetails.platforms.join(', ') : 'No platforms available'}</p>
                    <p><strong>Genres:</strong> ${gameDetails.genres.length > 0 ? gameDetails.genres.join(', ') : 'No genres available'}</p>
                    <p><strong>Time to Beat:</strong> ${gameDetails.comp_time_in_secs > 0 ? gameDetails.comp_time_in_secs + ' seconds' : 'No Time Listed'}</p>
                `;

                // Create the cover image
                const coverArt = document.createElement('img');
                coverArt.alt = `${game.name} Cover Art`;
                coverArt.style.width = '150px';  // Adjust the size
                if (gameDetails.cover) {
                    coverArt.src = `https://images.igdb.com/igdb/image/upload/t_cover_big/${gameDetails.cover}.webp`;
                } else {
                    coverArt.src = 'https://via.placeholder.com/150';  // Placeholder if no cover
                }

                detailsDiv.appendChild(coverArt); // Append the cover art image to detailsDiv
                detailsDiv.style.display = 'block';
                detailsButton.innerText = 'Hide Details';
            } else {
                detailsDiv.style.display = 'none';
                detailsButton.innerText = 'Show Details';
            }
        });

        // Append the game div to the game list
        gameListDiv.appendChild(gameDiv);
    });
}

// Function to fetch additional game details
async function fetchGameDetails(gameId) {
    try {
        const response = await fetch(`http://127.0.0.1:8000/get-info`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: gameId }),
        });

        if (!response.ok) {
            throw new Error('Failed to fetch game details');
        }

        const data = await response.json();

        console.log('API Response Data:', data);  // Log the full API response

        console.log(data.name);
        console.log(data.name.length);

        // Check if the API returns valid data
        if (data.name && data.name.length > 0) {
            const gameDetails = data.name[0];
            console.log('Game Details:', gameDetails);
            console.log('Game Cover:', data.cover);

            return {
                cover: data.cover,
                rating: data.rating || 'N/A',
                platforms: data.platforms,
                genres: data.genres,
                comp_time_in_secs: data.comp_time_in_secs || 'N/A', // Ensure comp_time_in_secs is correctly fetched
            };
        } else {
            console.log('No matches found');
            return {};
        }
    } catch (error) {
        console.error(error);
        return {};
    }
}
