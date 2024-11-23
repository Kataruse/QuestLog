# Nov 22 2024
# ChatGPT 4o? (whatever like the one where you get a few things a day for is)
# Refactor this python code to clean it up and let it be an implementable class with the properties of Client_ID and Client_Secret. Also let me call the definite functions as methods of each object


from igdbclient import IGDBClient

def main():
    # Replace these with your actual credentials
    client_id = 'chxawvc6ihkixiq1trn5kjenh9cavm'
    client_secret = 'w7tyvuosembzb62awb0gww80oosvc3'

    # Instantiate the IGDBClient
    igdb = IGDBClient(client_id, client_secret)

    # Refresh the access token
    igdb.refresh_token()

    # Example: Get information about a game
    game_name = "Baldur's Gate 3"
    game_info = igdb.get_game_info(game_name)

    if game_info:
        # Extract the first game's information
        game = game_info[0]

        game_id = game.get('id')

        # Display basic game info
        print("Game Name:", game.get('name'))
        print("Rating:", game.get('rating'))
        print("Rating Count:", game.get('rating_count'))

        # Resolve and display genres
        genre_ids = game.get('genres', [])

        if type(genre_ids) is int:
            tmp = genre_ids
            genre_ids = [tmp]

        if genre_ids:
            genres = igdb.get_genres(genre_ids)
            print("Genres:", genres)
        else:
            print("Genres: None")

        # Resolve and display platforms
        platform_ids = game.get('platforms', [])

        if type(platform_ids) is int:
            tmp = platform_ids
            platform_ids = [tmp]

        if platform_ids:
            platforms = igdb.get_platforms(platform_ids)
            print("Platforms:", platforms)
        else:
            print("Platforms: None")

        # Resolve and display artwork URLs
        # artwork_ids = game.get('artworks', [])
        
        # if artwork_ids:
        #     artworks = igdb.get_artwork(artwork_ids)
        #     print("Artworks:", artworks)
        # else:
        #    print("Artworks: None")        
            
            
        # Resolve and display artwork URLs
        cover_ids = game.get('cover', [])
        
        if type(cover_ids) is int:
            tmp = cover_ids
            cover_ids = [tmp]

        if cover_ids:
            covers = igdb.get_covers(cover_ids)
            print("Covers:", covers)
        else:
            print("Covers: None")
        # https://images.igdb.com/igdb/image/upload/t_cover_big/{cover_id}.webp

        # Retrieve and display the completion time
        game_id = game.get('id')
        if game_id:
            completion_time = igdb.get_completion_time(game_id)
            print("Completion Time (normally):", completion_time, "seconds")
        else:
            print("No game ID available to fetch completion time.")
    else:
        print("No game found with the specified name.")

if __name__ == "__main__":
    main()
