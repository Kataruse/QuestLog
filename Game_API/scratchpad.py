from igdbclient import IGDBClient

# Replace these with your actual credentials
client_id = 'chxawvc6ihkixiq1trn5kjenh9cavm'
client_secret = 'w7tyvuosembzb62awb0gww80oosvc3'

# Instantiate the IGDBClient
igdb = IGDBClient(client_id, client_secret)

# Refresh the access token
igdb.refresh_token()

name = "runescape"

resp = igdb.get_game_matches(name)
print(resp)