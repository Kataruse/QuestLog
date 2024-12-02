document.addEventListener('DOMContentLoaded', function () {
    // ------------- Go to Game List ---------------
    const goToGameListButton = document.getElementById("go-to-game-list-button");
    if (goToGameListButton) {
        goToGameListButton.addEventListener('click', function () {
            const userId = localStorage.getItem('user_id');
            if (userId) {
                window.location.href = 'list.html';
            } else {
                alert('You must be logged in to view the game list.');
            }
        });
    }

    // ------------- Go to Home --------------------
    const homeButton = document.getElementById('home-button');
    if (homeButton) {
        homeButton.addEventListener('click', function () {
            window.location.href = 'index.html';
        });
    }

    // ------------- Fetch and Display All Games ---------------
    const savedGameListDiv = document.getElementById('saved-game-list');

    async function fetchAllGames() {
        try {
            const response = await fetch('http://127.0.0.1:8000/get-games'); // You need to set up this endpoint
            const data = await response.json();

            if (data && data.games && data.games.length > 0) {
                console.log('Games found:', data.games);
                displayGames(data.games);
            } else {
                savedGameListDiv.innerHTML = '<p>No games found.</p>';
            }
        } catch (error) {
            console.error('Error fetching games:', error);
            savedGameListDiv.innerHTML = '<p>Error fetching games. Please try again later.</p>';
        }
    }

    function displayGames(games) {
        const savedGameListDiv = document.getElementById('saved-game-list');
    savedGameListDiv.innerHTML = ''; // Clear any existing content

        games.forEach(game => {
            const gameDiv = document.createElement('div');
            gameDiv.classList.add('game-item');
            const gameTitle = document.createElement('h3');
            gameTitle.textContent = game.name;

            gameDiv.appendChild(gameTitle);
            savedGameListDiv.appendChild(gameDiv);
        });
    }

    // ------------- Logout Function ---------------
    function logout() {
        localStorage.removeItem('user_id');
        localStorage.removeItem('username');
        updateSignInButton();
        alert('You have logged out.');
        document.cookie = 'authToken=; Max-Age=0; path=/';
        window.location.href = 'index.html';
    }

    // ------------- Cookie Authentication Check ---------------
    const authToken = document.cookie.split('; ').find(row => row.startsWith('authToken='))
        ?.split('=')[1];
    if (authToken) {
        document.getElementById('login-status').textContent = 'Logged in';
    }

    // ------------- Login Function ---------------
    async function login(event) {
        event.preventDefault();
        const username = document.getElementById("username").value;
        const password = document.getElementById("password").value;

        try {
            const response = await fetch('http://127.0.0.1:8000/log-in', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();
            if (response.ok && data.status === 'success') {
                localStorage.setItem('user_id', data.user_id);
                localStorage.setItem('username', username);
                updateSignInButton();
                alert('Logged in successfully!');
            } else {
                alert(`Login failed: ${data.message}`);
            }
        } catch (error) {
            console.error('Error logging in:', error);
            alert('Login failed. Please try again.');
        }
    }

    // ------------- Signup Function ---------------
    const signupForm = document.getElementById("signup-form");
    if (signupForm) {
        signupForm.addEventListener("submit", async function (event) {
            event.preventDefault();
            const username = document.getElementById("username").value;
            const email = document.getElementById("email").value;
            const password = document.getElementById("password").value;
            const confirmPassword = document.getElementById("confirmPassword").value;

            if (password !== confirmPassword) return;

            try {
                const response = await fetch('http://127.0.0.1:8000/create-user', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, email, password })
                });

                const data = await response.json();
                if (response.ok) {
                    window.location.href = 'index.html';
                } else {
                    alert(`Error: ${data.error}`);
                }
            } catch (error) {
                console.error("Error during signup:", error);
            }
        });
    }

    // ------------- Search Function ---------------
    const searchInput = document.getElementById('search-bar');
    const gameListDiv = document.getElementById('gameList');
    if (searchInput) {
        let debounceTimer;
        function handleInput() {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                const query = searchInput.value.trim();
                if (!query) {
                    gameListDiv.innerHTML = '';
                    return;
                }

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
            }, 500);
        }

        // ------------- Display Search Results ---------------
        function displayGameResults(games) {
            gameListDiv.innerHTML = '';
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
                gameDetails.style.display = 'none';

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
                                    <p><strong>Platforms:</strong> ${details.platforms.join(', ') || 'No platforms available'}</p>
                                    <p><strong>Genres:</strong> ${details.genres.join(', ') || 'No genres available'}</p>
                                    <p><strong>Time to Beat:</strong> ${details.comp_time || 'No Time Listed'}</p>
                                </div>
                                <div class="game-details-right">
                                    <img src="${details.cover || 'https://via.placeholder.com/150'}" alt="${game.name} Cover" class="game-cover">
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

        // ------------- Fetch Game Details ---------------
        function fetchGameDetails(gameName) {
            return fetch(`http://127.0.0.1:8000/get-info`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: gameName }),
            })
                .then(response => response.json())
                .then(data => ({
                    cover: data.cover ? `https://images.igdb.com/igdb/image/upload/t_cover_big/${data.cover}.webp` : '',
                    rating: data.rating || 'N/A',
                    platforms: data.platforms || [],
                    genres: data.genres || [],
                    comp_time: data.comp_time_in_secs ? `${(data.comp_time_in_secs / 3600).toFixed(1)} Hours` : 'N/A',
                }))
                .catch(error => {
                    console.error('Error fetching game details:', error);
                    return {};
                });
        }

        // ------------- Debounce Search Input ---------------
        searchInput.addEventListener('input', handleInput);
    }

    // ------------- Add game to List ---------------
    function addGameToDatabase(game) {
        const userId = localStorage.getItem('user_id');
        if (!userId) {
            alert('You must be logged in to add games to your list.');
            return;
        }
    
        fetch('http://127.0.0.1:8000/register-game', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                user_id: userId,
                game_name: game.name
            })
        })
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    alert(`Game "${game.name}" added to your list!`);
                } else {
                    alert(`Failed to add game: ${data.message}`);
                }
            })
            .catch(error => {
                console.error('Error adding game:', error);
                alert('An error occurred while adding the game to your list.');
            });
    }

    // ------------- Sign In Button & Dropdown ---------------
    const signInButton = document.getElementById("sign-in-button");
    const loginDropdown = document.getElementById("login-dropdown");
    signInButton.addEventListener('click', function () {
        loginDropdown.classList.toggle('hidden');
    });

    // ------------- Search and Fetch All Games for List Page ---------------
    if (document.location.pathname.includes("list.html")) {
    // Fetch games only if on list.html
    
    async function fetchAllGames() {
        const userId = localStorage.getItem('user_id');
        
        if (!userId) {
            savedGameListDiv.innerHTML = '<p>You must be logged in to view your game list.</p>';
            return;
        }

        try {
            const response = await fetch('http://127.0.0.1:8000/get-games', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: userId })
            });

            if (!response.ok) {
                console.error('Failed to fetch games:', response.status);
                savedGameListDiv.innerHTML = '<p>Error fetching games. Please try again later.</p>';
                return;
            }

            const data = await response.json();
            console.log('Data received:', data); // Log the data received from the server

            // Ensure the data is in the correct format (in case it's a stringified JSON)
            const parsedData = typeof data === 'string' ? JSON.parse(data) : data;
            console.log('Parsed Data:', parsedData); // Log parsed data

            if (parsedData && parsedData.data) {
                const games = Object.values(parsedData.data); // Convert the object into an array of games
                displayGames(games);
            } else {
                savedGameListDiv.innerHTML = '<p>No games found.</p>';
            }
        } catch (error) {
            console.error('Error fetching games:', error);
            savedGameListDiv.innerHTML = '<p>Error fetching games. Please try again later.</p>';
        }
    }

    const applyTimeFilterButton = document.getElementById('apply-time-filter');
    const completionTimeFilterInput = document.getElementById('completion-time-filter');
    const savedGameListDiv = document.getElementById('saved-game-list');

    // ------------- Apply Completion Time Filter ---------------
    if (applyTimeFilterButton) {
        applyTimeFilterButton.addEventListener('click', function () {
            const timeFilter = parseFloat(completionTimeFilterInput.value);
            if (isNaN(timeFilter) || timeFilter <= 0) {
                alert('Please enter a valid completion time.');
                return;
            }

            // Pass the time filter to the backend to get filtered games
            fetchFilteredGames(timeFilter);
        });
    }

    // ------------- Fetch Filtered Games by Completion Time ---------------
    async function fetchFilteredGames(timeFilter) {
        const userId = localStorage.getItem('user_id');
        if (!userId) {
            savedGameListDiv.innerHTML = '<p>You must be logged in to view your game list.</p>';
            return;
        }

        try {
            const response = await fetch('http://127.0.0.1:8000/filter-games', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: userId, completion_time: timeFilter })
            });

            if (!response.ok) {
                console.error('Failed to fetch filtered games:', response.status);
                savedGameListDiv.innerHTML = '<p>Error fetching filtered games. Please try again later.</p>';
                return;
            }

            const data = await response.json();
            if (data && data.games && data.games.length > 0) {
                displayGames(data.games);
            } else {
                savedGameListDiv.innerHTML = '<p>No games found for the specified completion time.</p>';
            }
        } catch (error) {
            console.error('Error fetching filtered games:', error);
            savedGameListDiv.innerHTML = '<p>Error fetching filtered games. Please try again later.</p>';
        }
    }

    function displayGames(games) {
        savedGameListDiv.innerHTML = ''; // Clear previous content
    
        if (games.length === 0) {
            savedGameListDiv.innerHTML = '<p>No games found.</p>';
            return;
        }
    
        games.forEach(game => {
            const gameDiv = document.createElement('div');
            gameDiv.classList.add('game-item');
        
            // Game Title with Dropdown Button
            const gameTitleDiv = document.createElement('div');
            gameTitleDiv.classList.add('game-title-container');
    
            // Game title
            const gameTitle = document.createElement('h3');
            gameTitle.textContent = game.game_name; // Use the 'game_name' field
            gameTitleDiv.appendChild(gameTitle);
    
            // Dropdown Button
            const dropdownButton = document.createElement('button');
            dropdownButton.textContent = '▼';
            dropdownButton.classList.add('button');
            gameTitleDiv.appendChild(dropdownButton);
    
            gameDiv.appendChild(gameTitleDiv);
        
            // Game Details (hidden by default)
            const gameDetailsDiv = document.createElement('div');
            gameDetailsDiv.classList.add('game-details');
            gameDetailsDiv.style.display = 'none'; // Initially hidden
        
            // Add rating
            const gameRating = document.createElement('p');
            gameRating.textContent = `Rating: ${game.rating ? game.rating.toFixed(2) : 'N/A'} (${game.rating_count || 0} ratings)`;
            gameDetailsDiv.appendChild(gameRating);
        
            // Add cover image if available
            if (game.cover && game.cover[0]) {
                const gameImage = document.createElement('img');
                gameImage.src = `https://images.igdb.com/igdb/image/upload/t_cover_big/${game.cover[0]}.jpg`;
                gameImage.alt = game.game_name;
                gameImage.classList.add('game-image');
                gameDetailsDiv.appendChild(gameImage);
            }
        
            // Display genres
            const genresList = document.createElement('p');
            genresList.textContent = `Genres: ${game.genres ? game.genres.map(genre => genre[0]).join(', ') : 'N/A'}`;
            gameDetailsDiv.appendChild(genresList);
        
            // Display platforms
            const platformsList = document.createElement('p');
            platformsList.textContent = `Platforms: ${game.game_platforms ? game.game_platforms.map(platform => platform[0]).join(', ') : 'N/A'}`;
            gameDetailsDiv.appendChild(platformsList);
        
            // Completion time if available
            if (game.completion_time && game.completion_time > 0) {
                const completionTime = document.createElement('p');
                completionTime.textContent = `Completion time: ${(game.completion_time / 3600).toFixed(1)} hours`;
                gameDetailsDiv.appendChild(completionTime);
            }
        
            // Remove from List Button (Initially hidden)
            const removeButton = document.createElement('button');
            removeButton.textContent = 'Remove from List';
            removeButton.classList.add('button', 'remove-button');
            removeButton.style.display = 'none'; // Hide initially
            gameDetailsDiv.appendChild(removeButton); // Append the button to the gameDetailsDiv
    
            // Add remove button functionality
            removeButton.addEventListener('click', () => {
                // Remove the game from the DOM
                savedGameListDiv.removeChild(gameDiv);
                // Optionally, you can also handle removing the game from the game array or database here.
            });
    
            gameDiv.appendChild(gameDetailsDiv);
            savedGameListDiv.appendChild(gameDiv);
        
            // Toggle visibility of game details and remove button on button click
            dropdownButton.addEventListener('click', () => {
                if (gameDetailsDiv.style.display === 'none') {
                    gameDetailsDiv.style.display = 'block';
                    removeButton.style.display = 'inline-block'; // Show remove button
                    dropdownButton.textContent = '▲'; // Change to '▲' when expanded
                } else {
                    gameDetailsDiv.style.display = 'none';
                    removeButton.style.display = 'none'; // Hide remove button
                    dropdownButton.textContent = '▼'; // Change to '▼' when collapsed
                }
            });
        });
    }
    
    
    

    fetchAllGames(); // Fetch the games when the page loads
}

    // ------------- Update Sign In Button & Dropdown Content ---------------
    function updateSignInButton() {
        const storedUsername = localStorage.getItem("username");
        const loginDropdown = document.getElementById("login-dropdown");
        const signInButton = document.getElementById("sign-in-button");
        loginDropdown.innerHTML = "";

        if (storedUsername) {
            signInButton.textContent = storedUsername;
            const loggedInMessage = document.createElement("p");
            loggedInMessage.textContent = `Logged in as ${storedUsername}`;
            loggedInMessage.style.margin = "10px 0";
            loginDropdown.appendChild(loggedInMessage);

            const logoutButton = document.createElement("button");
            logoutButton.textContent = "Log Out";
            logoutButton.classList.add("logout-button");
            logoutButton.addEventListener("click", logout);
            loginDropdown.appendChild(logoutButton);
        } else {
            signInButton.textContent = "Sign In";
            const loginForm = document.createElement("form");
            loginForm.innerHTML = `
                <label for="username">Username:</label>
                <input type="text" id="username" name="username" placeholder="Enter your username" required>
                <label for="password">Password:</label>
                <input type="password" id="password" name="password" placeholder="Enter your password" required>
                <div class="button-container">
                    <button type="submit" class="login-button">Log In</button>
                    <a href="signup.html" class="signup-link">Create an Account</a>
                </div>
            `;
            loginForm.addEventListener("submit", login);
            loginDropdown.appendChild(loginForm);
        }
    }

    updateSignInButton();
});
