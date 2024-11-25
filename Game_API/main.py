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

class RegisterGame(BaseModel):
    name: str


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
    
    genre_ids = game.get('genres', [])

    completion_time_in_seconds = igdb.get_completion_time(game_id)

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

    try:
        rounded_game_rating=round(game_rating,0)
    except:
        rounded_game_rating="N/A"

    return {"id": game_id,
            "name": game_name,
            "rating": rounded_game_rating,
            "rating_count": game_rating_count,
            'genres': genres,
            'platforms': platforms,
            'cover': covers[0],
            'comp_time_in_secs': completion_time_in_seconds}

@app.post("/register-game")
async def register_game(request: RegisterGame):
    game_name = request
    resp = await get_info(game_name)

    print('resp is below')
    print(resp)

    game_id = resp.get('id')
    game_name = resp.get('name')
    game_rating = resp.get('rating')
    game_comptime = resp.get('comp_time_in_secs')

    if game_comptime is None:
        game_comptime = 0

    cur.execute(f"""
    INSERT INTO registered_games VALUES
        ({game_id},"{game_name}",{game_rating},{game_comptime})
    """)
    
    con.commit()

    return {"Success": f"Game {game_name} added to library."}

# This could honestly just be a get request tbh.
@app.get("/sort-games")
async def sort_games():

    # select first :D







    return {"WIP": "WIP"}