# remember to start this server with  uvicorn Game_API.main:app --reload --host 0.0.0.0 --port 8000 from the QuestLog folder

from fastapi import FastAPI
from pydantic import BaseModel
from Game_API.igdbclient import IGDBClient
from starlette.middleware.cors import CORSMiddleware

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

class GetLibraryRequest(BaseModel):
    user_id: str

class RegisterGame(BaseModel):
    user_id: int
    game_id: int


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

@app.post("/create-account")
async def create_account(request: CreateAccountRequest):
    look_for_user = cur.execute(f"SELECT username FROM users WHERE username = '{request.username}'")
    if look_for_user.fetchone() is None:

        cur.execute(f"""
                    INSERT INTO users(username, password) VALUES
                    ("{request.username}", "{request.password}")
                    """)
        con.commit()
        return {"Success": f"Created User {request.username}"}
    else:
        print(look_for_user.fetchone())
        return {"Error": "User Already Exists"}


@app.post("/get-library")
async def get_library(request: GetLibraryRequest):
    # Looks for the user's ID and the game_id in the libraries table
    # Formats those as a wonderful little piece of JSON output

    look_for_user = cur.execute(f"SELECT game_id FROM libraries WHERE user_id = {request.user_id}")
    user_games = look_for_user.fetchall()
    print(user_games)

    return {"WIP": "WIP"}

@app.post("/register-library")
async def register_library(request: RegisterGame):
    user_id = request.user_id
    game_id = request.game_id

    sql = f"SELECT id FROM games WHERE id = {request.game_id}"
    print(sql)
    look_for_game = cur.execute(sql)
    user_games = look_for_game.fetchall()
    print(user_games)
    




    if user_games == []:
        game_info = igdb.get_game_info(game_name)

        game = game_info[0]
        game_id = game.get('id')
        game_name = game.get('name')
        game_rating = game.get('rating')
        game_rating_count = game.get('rating_count')
        completion_time_in_seconds = igdb.get_completion_time(game_id)



        cover_ids = game.get('cover', [])
        if type(cover_ids) is int:
            tmp = cover_ids
            cover_ids = [tmp]

        if cover_ids:
            covers = igdb.get_covers(cover_ids)
            print("Covers:", covers)
        else:
            print("Covers: None")
        cover = cover_ids[0]

        sql = f"""
                    INSERT INTO games VALUES
                    ("{game_id}", "{game_name}", {game_rating}, {game_rating_count}, {cover}, {completion_time_in_seconds})
                    """

        print(sql)

        cur.execute(sql)

        genre_ids = game.get('genres', [])

        if type(genre_ids) is int:
            tmp = genre_ids
            genre_ids = [tmp]

        if genre_ids:
            genres = igdb.get_genres(genre_ids)
            print("Genres:", genres)
        else:
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

    # if not:
        # input into games table

        # input into games/platforms table

        # input into games/genres table

    # create the user association









    return {"WIP": "WIP"}