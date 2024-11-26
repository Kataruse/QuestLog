document.addEventListener('DOMContentLoaded', function () {
    const goToGameListButton = document.getElementById("go-to-game-list-button");
    if (goToGameListButton) {
        goToGameListButton.addEventListener('click', function() {
            // Check if the user is logged in
            const userId = localStorage.getItem('user_id');
            if (userId) {
                // User is logged in, proceed to list page
                window.location.href = 'list.html';
            } else {
                // User is not logged in, show alert
                alert('You must be logged in to view the game list.');
            }
        });
    }

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
                    window.location.href = 'index.html';
                } else {
                    alert(`Error: ${data.error}`);
                }
            } catch (error) {
                console.error("Error during password hashing:", error);
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

    // Handle the login dropdown visibility toggle
    const goToIndexButton = document.getElementById("go-to-index-button");
    const signInButton = document.getElementById("sign-in-button");
    const loginDropdown = document.getElementById("login-dropdown");

    // Go to the index page if the button is clicked
    if (goToIndexButton) {
        goToIndexButton.addEventListener('click', function() {
            window.location.href = 'index.html'; // Navigate to the index page
        });
    }

    signInButton.addEventListener('click', () => {
        // Toggle the 'hidden' class on the dropdown
        loginDropdown.classList.toggle('hidden');
    });

    // Toggle dropdown visibility
    loginDropdownToggle.addEventListener('click', () => {
        loginDropdownContent.classList.toggle('show');
    });

    // Update the sign-in button and dropdown based on login status
    function updateSignInButton() {
        const storedUsername = localStorage.getItem("username");

        // Clear and reset the dropdown to avoid inconsistencies
        loginDropdown.innerHTML = ''; // Clear previous content

        if (storedUsername) {
            // User is logged in
            signInButton.textContent = storedUsername; // Show username

            // Create logout button
            const logoutButton = document.createElement("button");
            logoutButton.textContent = "Log Out";
            logoutButton.addEventListener("click", logout);
            loginDropdown.appendChild(logoutButton);
        } else {
            // User is not logged in
            signInButton.textContent = "Sign In"; // Default Sign In text

            // Add login form
            const loginForm = document.createElement('form');
            loginForm.id = 'login-form';

            loginForm.innerHTML = `
                <label for="username">Username:</label>
                <input type="text" id="username" name="username" placeholder="Enter your username" required>
                <label for="password">Password:</label>
                <input type="password" id="password" name="password" placeholder="Enter your password" required>
                <button type="submit">Log In</button>
                <a href="signup.html" class="signup-link">Create an account</a>
            `;

            loginForm.addEventListener("submit", login);
            loginDropdown.appendChild(loginForm);
        }
    }

    // Handle logout process
    function logout() {
        localStorage.removeItem('user_id');
        localStorage.removeItem('username');
        updateSignInButton(); // Update the UI after logout
        alert('You have logged out.');
        window.location.href = 'index.html'; // Redirect to home page after logging out
    }

    // Initialize the sign-in button on page load
    updateSignInButton();
});