document.addEventListener('DOMContentLoaded', function () {
    // Handle signup form submission
    const signupForm = document.getElementById("signup-form");

    if (signupForm) {
        signupForm.addEventListener("submit", async function(event) {
            event.preventDefault();

            const username = document.getElementById("username").value;
            const email = document.getElementById("email").value;
            const password = document.getElementById("password").value;
            const confirmPassword = document.getElementById("confirmPassword").value;

            if (password !== confirmPassword) {
                alert("Passwords do not match!");
                return;
            }

            try {
                const response = await fetch('http://127.0.0.1:8000/create-user', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        username,
                        email,
                        password: password
                    })
                });

                const data = await response.json();

                if (response.ok) {
                    alert("Signup successful!");
                    window.location.href = 'index.html';
                } else {
                    alert(`Error: ${data.error}`);
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
            // Check if the game details are already displayed
            const isVisible = gameDetails.style.display === 'flex';

            if (isVisible) {
                // Hide the game details if already open
                gameDetails.style.display = 'none';
                dropdownButton.textContent = '▼'; // Reset the arrow to down
            } else {
                // Show the game details if they are hidden
                if (!gameDetails.innerHTML) {
                    // Fetch game details only if they haven't been loaded yet
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

                    // Add the "Add to List" button after loading the details
                    const addToListButton = document.createElement('button');
                    addToListButton.classList.add('add-to-list-button');
                    addToListButton.textContent = 'Add to List';

                    // Add functionality to the "Add to List" button
                    addToListButton.addEventListener('click', () => {
                        addGameToDatabase(game);
                    });

                    // Append the button to the details div
                    gameDetails.appendChild(addToListButton);
                }

                gameDetails.style.display = 'flex';
                dropdownButton.textContent = '▲'; // Change the arrow to up
            }
        });
    }

    // Handle login form submission
    const loginForm = document.getElementById("login-form");

    if (loginForm) {
        loginForm.addEventListener('submit', async function (event) {
            event.preventDefault();

            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;

            try {
                const response = await fetch('http://127.0.0.1:8000/log-in', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        username,
                        password
                    })
                });

                const data = await response.json();

                if (response.ok && data.status === 'success') {
                    alert('Login successful!');

                    // Store user_id and username in localStorage
                    localStorage.setItem('user_id', data.user_id);
                    localStorage.setItem('username', username);

                    // Update the UI with the username
                    updateSignInButton();
                } else {
                    alert(`Login failed: ${data.message}`);
                }
            } catch (error) {
                console.error('Error logging in:', error);
                alert('Login failed. Please try again.');
            }
        });
    }

    // Handle search input functionality (only if the search bar exists)
    const searchInput = document.getElementById('search-bar'); // Search bar input
    const gameListDiv = document.getElementById('gameList'); // Container for game results

    if (searchInput) {
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

                const gameDetails = document.createElement('div');
                gameDetails.classList.add('game-details');
                gameDetails.style.display = 'none'; // Hide details by default

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

        function fetchGameDetails(gameName) {
            return fetch(`http://127.0.0.1:8000/get-info`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: gameName }),
            })
                .then(response => response.json())
                .then(data => {
                    return {
                        cover: data.cover,
                        rating: data.rating || 'N/A',
                        platforms: data.platforms || [],
                        genres: data.genres || [],
                        comp_time: data.comp_time_in_secs
                            ? `${(data.comp_time_in_secs / 3600).toFixed(1)} Hours`
                            : 'N/A',
                    };
                })
                .catch(error => {
                    console.error('Error fetching game details:', error);
                    return {};
                });
        }

        // Attach the event listener to the search input
        searchInput.addEventListener('input', handleInput);
    }

// Attach the event listener to the search input
searchInput.addEventListener('input', handleInput);
