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

    // ------------- Sign In Button & Dropdown ---------------
    const signInButton = document.getElementById("sign-in-button");
    const loginDropdown = document.getElementById("login-dropdown");
    signInButton.addEventListener('click', function () {
        loginDropdown.classList.toggle('hidden');
    });

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
