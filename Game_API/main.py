# remember to start this server with  uvicorn Game_API.main:app --reload --host 0.0.0.0 --port 8000 from the QuestLog folder

from fastapi import FastAPI
from pydantic import BaseModel
from Game_API.igdbclient import IGDBClient
from starlette.middleware.cors import CORSMiddleware
import os
import subprocess

import json

import ast

import sqlite3

con = sqlite3.connect("Game_API/database.db")

cur = con.cursor()




app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins, change this if needed
    allow_credentials=True,
    allow_methods=["*"],  # Allows all HTTP methods
    allow_headers=["*"],  # Allows all headers
)

class NameRequest(BaseModel):
    name: str

class CreateAccountRequest(BaseModel):
    username: str
    password: str
    email: str

class GetLibraryRequest(BaseModel):
    user_id: str

class RegisterGame(BaseModel):
    user_id: int
    game_name: str

class ChangeAvailability(BaseModel):
    user_id: int
    availability: int # in hours

class LogIn(BaseModel):
    username: str
    password: str

class GetGames(BaseModel):
    user_id: int

class SortGames(BaseModel):
    user_id: int   
    availability: int
    algorithm: int # int representing algorithm

# Replace these with your actual credentials
client_id = 'chxawvc6ihkixiq1trn5kjenh9cavm'
client_secret = 'w7tyvuosembzb62awb0gww80oosvc3'

# Instantiate the IGDBClient
igdb = IGDBClient(client_id, client_secret)

# Refresh the access token
igdb.refresh_token()




@app.get("/")
async def read_root():
    return {"Hello": "World (v2)"}

@app.get("/search")
async def get_games():
    return {"error": "this is a post-only endpoint"}


@app.post("/search")
async def get_games(request: NameRequest):
    # Get search results (only game names) from IGDB
    search_results = igdb.get_game_matches(request.name)
    print("Search Results:", search_results)

    # Return only the game names
    return {"Matches": [{"name": name} for name in search_results]}



@app.get("/get-info")
async def get_info():
    return {"error": "this is a post-only endpoint"}


@app.post("/get-info")
async def get_info(request: NameRequest):
    game_name = request.name
    game_info = igdb.get_game_info(game_name)

    game = game_info[0]

    game_id = game.get('id')
    game_name = game.get('name')
    game_rating = game.get('rating')
    game_rating_count = game.get('rating_count')
    
    completion_time_in_seconds = igdb.get_completion_time(game_id)

    genre_ids = game.get('genres', [])



    if type(genre_ids) is int:
        tmp = genre_ids
        genre_ids = [tmp]

    print(genre_ids)

    if genre_ids:
        print(type(genre_ids))
        genres = igdb.get_genres(genre_ids)
        print("Genres:", genres)
    else:
        print(type(genre_ids))
        print("Genres: None")



    platform_ids = game.get('platforms', [])

    if type(platform_ids) is int:
        tmp = platform_ids
        platform_ids = [tmp]

    if platform_ids:
        platforms = igdb.get_platforms(platform_ids)
        print("Platforms:", platforms)
    else:
        print("Platforms: None")


    # cover_ids works if the db is being hit
    # covers works if the api is being hit

    cover_ids = game.get('cover', [])
    if type(cover_ids) is int:
        tmp = cover_ids
        cover_ids = [tmp]

        if cover_ids:
            print(f"Maincoverids:{cover_ids}")
            covers = igdb.get_covers(cover_ids)
            print("Covers:", covers)
        else:
            print("Covers: None")
    # https://images.igdb.com/igdb/image/upload/t_cover_big/{cover_id}.webp

    try:
        rounded_game_rating=round(game_rating,0)
    except:
        rounded_game_rating="N/A"


    if type(cover_ids) is list:
        cover_ids = covers


    return_dict = {"id": game_id,
            "name": game_name,
            "rating": rounded_game_rating,
            "rating_count": game_rating_count,
            'genres': genres,
            'platforms': platforms,
            'cover': cover_ids,
            'comp_time_in_secs': completion_time_in_seconds}

    print(return_dict)

    return return_dict

# @app.post("/create-account")
# async def create_account(request: CreateAccountRequest):
#     look_for_user = cur.execute(f"SELECT username FROM users WHERE username = '{request.username}'")
#     if look_for_user.fetchone() is None:

#         cur.execute(f"""
#                     INSERT INTO users(username, password) VALUES
#                     ("{request.username}", "{request.password}")
#                     """)
#         con.commit()
#         return {"status" :"success",
#                 "message": f"Created User {request.username}"}
#     else:
#         print(look_for_user.fetchone())
#         return {"status" :"error",
#                 "message": "User Already Exists"}
        


# @app.post("/get-library")
# async def get_library(request: GetLibraryRequest):
#     # Looks for the user's ID and the game_id in the libraries table
#     # Formats those as a wonderful little piece of JSON output

#     look_for_user = cur.execute(f"SELECT game_id FROM libraries WHERE user_id = {request.user_id}")
#     user_games = look_for_user.fetchall()
#     print(user_games)

#     return {"WIP": "WIP"}

@app.post("/register-game")
async def register_game(request: RegisterGame):

    user_id = request.user_id
    game_name = request.game_name

    results = cur.execute(f"""
                        SELECT id FROM games WHERE name = "{game_name}" 
                        """)
    game_id = results.fetchone()[0]

    print(game_id)

    cur.execute(f"""
                INSERT INTO libraries VALUES ({user_id}, {game_id})
                """)

    con.commit()


    return {"status": "success",
            "message": f"Added game {game_name} to user's library."}

@app.post("/create-user")
async def create_user(request: CreateAccountRequest):
    username = request.username
    password = request.password
    email = request.email

    # check if user exists
    results = cur.execute(f"""
                        SELECT username FROM users WHERE username = "{username}"
                        """)
    try:
        found_username = results.fetchone()[0]
    except:
        found_username = None

    if found_username is None:
        cur.execute(f"""
                    INSERT INTO users (username, password, email) VALUES ("{username}", "{password}", "{email}")
                    """)
        con.commit()
        return {"status" :"success",
                "message": f"Created user {request.username}"}
    else: 
        return {"status" :"failure",
                "message": f"User {request.username} already exists"}

# @app.post("/log-in")  # Corrected route
# async def log_in(request: LogIn):
#     username = request.username
#     password = request.password

#     # Query the database to check for the username and password
#     results = cur.execute(f"""
#         SELECT id FROM users WHERE username = ? AND password = ?
#     """, (username, password))

#     # Try to fetch the user ID
#     user = results.fetchone()

#     if user:
#         user_id = user[0]
#         return {
#             "status": "success",
#             "message": "Login successful",
#             "user_id": user_id
#         }
#     else:
#         return {
#             "status": "failure",
#             "message": "Username or password is incorrect"
#         }

@app.post("/change-availability")
async def change_availability(request: ChangeAvailability):
    user_id = request.user_id
    availability = request.availability


    cur.execute(f"""
                UPDATE users SET availability = {availability} WHERE id = {user_id}
                """)
    con.commit()

    return {"status": "success",
            "message": "User's availability updated."}
    

@app.post("/log-in")
async def log_in(request: LogIn):
    username = request.username
    password = request.password

    results = cur.execute(f"""
        SELECT id FROM users WHERE (username = "{username}" AND password = "{password}")
    """)

    try:
        found_user_id = results.fetchone()[0]
    except:
        found_user_id = 0
        return {'status': 'failure',
                'message': 'user/password not found'}

    # When I get it more fixed, this would be a good time to retrive the list of games
    # Just call whatever function is used for that endpoint

    return {"status":"success",
            "message": "log in successful",
            "user_id": found_user_id}

@app.post("/get-games")
async def get_games(request: GetGames):
    user_id = request.user_id
    


    look_for_user = cur.execute(f"""
                                SELECT usr.id AS user_id, game.id AS game_id, usr.username, game.name, game.rating, game.rating_count, game.cover, game.genres AS game_genres, game.platforms AS game_platforms, game.completion_time FROM libraries lib INNER JOIN users usr ON lib.user_id = usr.id INNER JOIN games game ON lib.game_id = game.id WHERE usr.id = {user_id};
                                """)

    user_games = look_for_user.fetchall()

    # [(1, 1011, 'wilki', 'Borderlands 2', 83.95323371904513, 1639, '94379', '[5, 12]', '[3, 6, 9, 12, 14, 34, 46, 48, 49, 130]', 202800), (1, 2181, 'wilki', 'Wii Sports', 75.25894294402642, 354, '180734', '[13, 14]', '[5]', 0)]


    # output = {"status": "success",
    #         "data" : {}}
    
    # for x in range(0,len(user_games)):

    #     data = user_games[x]
    #     print(data)
    #     output["data"][x] = {"user_id": data[0],
    #                         "game_id": data[1],
    #                         "username": f"{data[2]}",
    #                         "game_name": f"{data[3]}",
    #                         "rating": data[4],
    #                         "rating_count": data[5],
    #                         "cover": igdb.get_details('covers', data[6], 'id, image_id'),
    #                         "genres": igdb.get_details('genres', data[7], 'id, name'),
    #                         "game_platforms": igdb.get_details('platforms', data[8], 'id, name'),
    #                         "completion_time": data[9]}

    # get_details(self, endpoint, ids, fields)



    try:
        output = {"status": "success",
                    "data" : {}}
            
        for x in range(0,len(user_games)):

            data = user_games[x]
            print(data)
            output["data"][int(x)] = {"user_id": data[0],
                                "game_id": data[1],
                                "username": f"{data[2]}",
                                "game_name": f"{data[3]}",
                                "rating": data[4],
                                "rating_count": data[5],
                                "cover": igdb.get_details('covers', data[6], 'id, image_id'),
                                "genres": igdb.get_details('genres', data[7], 'id, name'),
                                "game_platforms": igdb.get_details('platforms', data[8], 'id, name'),
                                "completion_time": data[9]}
    except:
        return {"status": "fail"}

    #         # May need to grab the cover ID with the SQL, we'll see

    # except Exception as error:
    #     print("An exception occurred:", type(error).__name__)
    #     return {"status": "error"}
    

    print(user_games)
    json_output = json.dumps(output)
    print(json_output)
    return json_output


@app.post("/sort-games")
async def sort_games(request: SortGames):
    availability = request.availability
    algorithm = request.algorithm
    user_id = request.user_id

    # executable_path = "C:\\Users\\wpaxt\\Documents\\Projects\\QuestLog\\Game_API"

    # args = ""

    # command = [executable_path]
    # if args:
    #     command.extend(args)

    # executable_path = ".\\Game_API\\exe\\AlgFinalTestC.exe"

    # command = [executable_path]

    # try:
    #     # Run the executable and capture the output
    #     result = subprocess.run(
    #         command,
    #         stdout=subprocess.PIPE,
    #         stderr=subprocess.PIPE,
    #         text=True,
    #         shell=False  # Use False for security when passing a list
    #     )
        
    #     print(result.stdout)

    # except FileNotFoundError as e:
    #     print(f"Error: {e}")

    # Run get_games()
    request = {"user_id": user_id}

    
    games = await get_games(GetGames(user_id=user_id))

    games_dict = ast.literal_eval(games)
    print(games)

    # Append Other data
    games_dict["algorithm"] = algorithm
    games_dict["availability"] = availability

    print(games_dict)
    # Write Results to File

    data_to_write = json.dumps(games_dict)
    file_path = os.path.join("Game_API", "exe", "data.json")
    # Open the file in write mode ('w') and write the data
    try:
        with open(file_path, "w") as file:
            file.write(data_to_write)
    except FileNotFoundError:
        print("The folder 'exe' does not exist.")
    except PermissionError:
        print("Permission denied: Unable to write to the file.")
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        print("Data written to file successfully.")




    # Subprocess to Sort

    # Get return value from file

    # 

    return {"WIP": "WIP"}
