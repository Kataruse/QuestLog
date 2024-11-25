import requests
import sqlite3
import ast

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

        game_in_db_resp = self.cur.execute(f"""
                                            SELECT name FROM games WHERE name="{name}"
                                            """)
        game_in_db = game_in_db_resp.fetchone()
        print(game_in_db)

        if game_in_db is None:
            data = f'fields name, genres, platforms, rating, rating_count, cover; where name ~ "{name}"; limit 1;'
            
            response = requests.post(url, headers=headers, data=data)

            response_json = response.json()
            print(response_json)

            game_id = response_json[0].get('id')
            game_cover = response_json[0].get('cover')
            game_name = response_json[0].get('name')
            game_rating = response_json[0].get('rating')
            game_rating_count = response_json[0].get('rating_count')
            game_genres = response_json[0].get('genres')
            game_platforms = response_json[0].get('platforms')
            # where completion time?
            game_completion_time = self.get_completion_time(game_id)
            # this returns None

            sql = f"""
                    INSERT INTO games VALUES ({game_id}, "{game_name}", {game_rating}, {game_rating_count}, "{game_cover}", {game_completion_time}, "{game_genres}", "{game_platforms}")
                    """
            
            print(sql)

            self.cur.execute(sql)
            self.con.commit()


            # process over genre platform lists

            if response.status_code == 200:
                return response_json
            else:
                print(f"Error fetching game info: {response.status_code} - {response.text}")
                return []
        else:

            resp = self.cur.execute(f"""
                                    SELECT gm.id, gm.name, gm.rating, gm.rating_count, cs.cover, gm.genres, gm.platforms, gm.completion_time FROM games gm LEFT OUTER JOIN covers cs ON gm.cover = cs.cover_id WHERE name = "{name}"
                                    """)
            # JOINS, USE AN OUTER JOIN


            return_game = resp.fetchall()
            print(f"return_game: {return_game}")
            print(f"return_id: {return_game[0][0]}")
            return_object = []
            return_dict = {
                'id': return_game[0][0],
                'name': return_game[0][1],
                'rating': return_game[0][2],
                'rating_count': return_game[0][3],
                'cover': return_game[0][4],
                'genres': return_game[0][5],
                'platforms': return_game[0][6],
                'completion_time': return_game[0][7]
                
            }
            print(return_dict)
            return_object.append(return_dict)
            return return_object

    def get_completion_time(self, game_id):
        """Retrieve the average completion time for a game."""
        url = 'https://api.igdb.com/v4/game_time_to_beats'
        headers = self._get_headers()
        data = f'fields game_id, normally; where game_id = {game_id};'
        
        response = requests.post(url, headers=headers, data=data)
        print(game_id)
        print(f"get_comp_time_code: {response.status_code}")
        if response.status_code == 200:
            result = response.json()
            return result[0].get('normally') if result else 0
        else:
            print(f"Error fetching completion time: {response.status_code} - {response.text}")
            return 0

    def get_details(self, endpoint, ids, fields):
        """Fetch details like genres, platforms, or artworks."""
        url = f'https://api.igdb.com/v4/{endpoint}'
        headers = self._get_headers()
        details = []

        table_name = endpoint[:-1]
        print(type(ids))
        if endpoint != "covers":
            try:
                ids = ast.literal_eval(ids)
            except: ids = ids
        else:
            tmp = ids
            ids = [tmp]
        print(f"ids: {ids}")
        print(type(ids))
        print(type(ids[0]))
        print(ids[0])

        

        for _id in ids:
            sql_statement=f"SELECT {table_name} from {endpoint} WHERE {table_name}_id='{_id}'"
            print(sql_statement)
            selection = self.cur.execute(sql_statement)
            result = selection.fetchall()
            if result == []:
                if endpoint == "covers":
                    data = f'fields {fields}; where id = {_id[0]};'
                else:
                    data = f'fields {fields}; where id = {_id};'
                response = requests.post(url, headers=headers, data=data)

                if response.status_code == 200:
                    
                    result = response.json()
                    if endpoint == "covers":
                        details.append(result[0].get('image_id') if result else None)
                        print(f"""
                                        INSERT INTO {endpoint} VALUES ({_id}, "{result[0].get('image_id') if result else None}")
                                        """)
                        self.cur.execute(f"""
                                        INSERT INTO {endpoint} VALUES ({_id[0]}, "{result[0].get('image_id') if result else None}")
                                        """)
                        self.con.commit()
                        
                        print(result[0].get('image_id'))
                        return result[0].get('image_id')
                    else:
                        details.append(result[0].get('name') if result else None)
                        print(result)
                        print(data)
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
