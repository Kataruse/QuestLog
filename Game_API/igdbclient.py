import requests
import sqlite3

class IGDBClient:
    def __init__(self, client_id, client_secret):
        self.client_id = client_id
        self.client_secret = client_secret
        self.access_token = None
        self.token_type = None
        self.con = sqlite3.connect("Game_API/database.db")
        self.cur = self.con.cursor()

    def refresh_token(self):
        """Refresh and retrieve the access token from the Twitch API."""
        url = 'https://id.twitch.tv/oauth2/token'
        data = {
            'client_id': self.client_id,
            'client_secret': self.client_secret,
            'grant_type': 'client_credentials'
        }
        response = requests.post(url, data=data)

        if response.status_code == 200:
            resp_json = response.json()
            self.access_token = resp_json.get('access_token')
            print(self.access_token)
            self.token_type = resp_json.get('token_type')
            print("Access Token refreshed successfully.")
        else:
            print(f"Error refreshing token: {response.status_code} - {response.text}")

    def _get_headers(self):
        """Generate the headers for API requests."""
        if not self.access_token:
            raise ValueError("Access token is missing. Call refresh_token() first.")
        return {
            'Client-ID': self.client_id,
            'Authorization': f'Bearer {self.access_token}'
        }

    def get_game_matches(self, name):
        url = 'https://api.igdb.com/v4/games'
        headers = self._get_headers()
        data = f'search "{name}"; fields name; limit 10;'

        response = requests.post(url, headers=headers, data=data)
        if response.status_code == 200:
            unclean = response.json()
            clean = []
            for x in unclean:
                clean.append(x['name'])
                
            return clean
        else:
            print(f"Error?????")
            return []


    def get_game_info(self, name):
        """Retrieve game information by name."""
        url = 'https://api.igdb.com/v4/games'
        headers = self._get_headers()
        data = f'fields name, genres, platforms, rating, rating_count, cover; where name ~ "{name}"; limit 1;'
        
        response = requests.post(url, headers=headers, data=data)
        if response.status_code == 200:
            return response.json()
        else:
            print(f"Error fetching game info: {response.status_code} - {response.text}")
            return []

    def get_completion_time(self, game_id):
        """Retrieve the average completion time for a game."""
        url = 'https://api.igdb.com/v4/game_time_to_beats'
        headers = self._get_headers()
        data = f'fields game_id, normally; where game_id = {game_id};'
        
        response = requests.post(url, headers=headers, data=data)
        if response.status_code == 200:
            result = response.json()
            return result[0].get('normally') if result else None
        else:
            print(f"Error fetching completion time: {response.status_code} - {response.text}")
            return None

    def get_details(self, endpoint, ids, fields):
        """Fetch details like genres, platforms, or artworks."""
        url = f'https://api.igdb.com/v4/{endpoint}'
        headers = self._get_headers()
        details = []

        table_name = endpoint[:-1]

        for _id in ids:
            sql_statement=f"SELECT {table_name} from {endpoint} WHERE {table_name}_id='{_id}'"
            print(sql_statement)
            selection = self.cur.execute(sql_statement)
            result = selection.fetchall()

            if result == []:
                data = f'fields {fields}; where id = {_id};'
                response = requests.post(url, headers=headers, data=data)

                if response.status_code == 200:
                    result = response.json()
                    if endpoint == "covers":
                        details.append(result[0].get('image_id') if result else None)
                        self.cur.execute(f"""
                                        INSERT INTO {endpoint} VALUES ({_id}, "{result[0].get('image_id') if result else None}")
                                        """)
                        self.con.commit()
                    else:
                        details.append(result[0].get('name') if result else None)
                        print(result[0].get('name'))
                        print()
                        self.cur.execute(f"""
                                        INSERT INTO {endpoint} VALUES ({_id}, "{result[0].get('name') if result else None}")
                                        """)
                        self.con.commit()

                    

                else:
                    print(f"Error fetching details from {endpoint}: {response.status_code} - {response.text}")

                


            else: 
                details.append(result[0])
                
            


            
        return details

    def get_genres(self, genre_ids):
        """Retrieve genre names by their IDs."""
        return self.get_details('genres', genre_ids, 'id, name')

    def get_platforms(self, platform_ids):
        """Retrieve platform names by their IDs."""
        return self.get_details('platforms', platform_ids, 'id, name')

    # def get_artwork(self, artwork_ids):
    #     """Retrieve artwork URLs by their IDs."""
        
    #     return self.get_details('artworks', artwork_ids, 'id, url')
    # 
    def get_covers(self, cover_ids):
        """Retrieve artwork URLs by their IDs."""
        print(cover_ids)
        return self.get_details('covers', cover_ids, 'id, image_id')


# Example usage
def main():
    client_id = "YOUR_CLIENT_ID"  # Replace with your Client ID
    client_secret = "YOUR_CLIENT_SECRET"  # Replace with your Client Secret

    igdb = IGDBClient(client_id, client_secret)
    igdb.refresh_token()

    game_name = "Old School RuneScape"
    game_info = igdb.get_game_info(game_name)

    if game_info:
        game_id = game_info[0]['id']
        genres = igdb.get_genres(game_info[0].get('genres', []))
        platforms = igdb.get_platforms(game_info[0].get('platforms', []))
        artworks = igdb.get_artwork(game_info[0].get('artworks', []))
        completion_time = igdb.get_completion_time(game_id)

        print(f"Game Info: {game_info[0]}")
        print(f"Genres: {genres}")
        print(f"Platforms: {platforms}")
        print(f"Artworks: {artworks}")
        print(f"Completion Time: {completion_time}")
    else:
        print("Game not found.")

if __name__ == "__main__":
    main()
