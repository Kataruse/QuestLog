using Algorithm_Test;
using System;
using System.Collections.Generic;
using System.IO;
using System.Text.Json;

namespace Algorithm_Test
{
    internal class Program
    {
        static void Main(string[] args)
        {
            try
            {
                List<Game> gameList = new List<Game>();

                string jsonFilePath = "..\\..\\..\\UserGameListData.json"; // File path
                string jsonData = File.ReadAllText(jsonFilePath);
                JsonDocument jsonDocument = JsonDocument.Parse(jsonData);

                // Obtain availability and algorithm from JSON file
                int availability = jsonDocument.RootElement.GetProperty("availability").GetInt32();
                int algorithm = jsonDocument.RootElement.GetProperty("algorithm").GetInt32();
                string status = jsonDocument.RootElement.GetProperty("status").ToString();

                var data = jsonDocument.RootElement.GetProperty("data").EnumerateObject();

                // Obtain data from JSON file
                foreach (var game in data)
                {
                    JsonElement gameDetails = game.Value;
                    int userId = gameDetails.GetProperty("user_id").GetInt32();
                    int gameId = gameDetails.GetProperty("game_id").GetInt32();
                    string username = gameDetails.GetProperty("username").GetString();
                    string gameName = gameDetails.GetProperty("game_name").GetString();
                    double rating = gameDetails.GetProperty("rating").GetDouble();
                    int ratingCount = gameDetails.GetProperty("rating_count").GetInt32();

                    // Parse nested arrays for cover, genres, and game platforms
                    string[] cover = gameDetails.GetProperty("cover").EnumerateArray()
                                                  .SelectMany(coverArray => coverArray.EnumerateArray()
                                                  .Select(element => element.GetString()))
                                                  .Where(value => value != null)
                                                  .ToArray();

                    string[] genres = gameDetails.GetProperty("genres").EnumerateArray()
                                                   .SelectMany(genreArray => genreArray.EnumerateArray()
                                                   .Select(element => element.GetString()))
                                                   .Where(value => value != null)
                                                   .ToArray();

                    string[] gamePlatforms = gameDetails.GetProperty("game_platforms").EnumerateArray()
                                                         .SelectMany(platformArray => platformArray.EnumerateArray()
                                                         .Select(element => element.GetString()))
                                                         .Where(value => value != null)
                                                         .ToArray();

                    int completionTime = gameDetails.GetProperty("completion_time").GetInt32();

                    // Create Game object with properly parsed arrays
                    Game newGame = new Game(userId, gameId, username, gameName, rating, ratingCount, cover, genres, gamePlatforms, completionTime);
                    gameList.Add(newGame);
                }


                User user = new User(gameList, availability);

                if (algorithm == 0)
                {
                    Game gamePicked = user.PickOneToPlay();

                    var updatedJson = new
                    {
                        status = "success",
                        availability = availability,
                        algorithm = algorithm,
                        data = new Dictionary<string, object>
        {
            {
                "0", new
                {
                    user_id = gamePicked.userID,
                    game_id = gamePicked.gameID,
                    username = gamePicked.username,
                    game_name = gamePicked.gameName,
                    rating = gamePicked.rating,
                    rating_count = gamePicked.ratingCount,
                    cover = new List<List<string>> { new List<string>(gamePicked.cover) },
                    genres = new List<List<string>> { new List<string>(gamePicked.genres) },
                    game_platforms = new List<List<string>> { new List<string>(gamePicked.gamePlatforms) },
                    completion_time = gamePicked.completionTime * 3600 // Convert back to seconds
                }
            }
        }
                    };

                    string jsonString = JsonSerializer.Serialize(updatedJson, new JsonSerializerOptions { WriteIndented = true });
                    File.WriteAllText(jsonFilePath, jsonString);
                }
                else if (algorithm == 1)
                {
                    List<Game> gamePickedList = user.PickMultipleToPlay();

                    var dataDictionary = new Dictionary<string, object>();
                    for (int i = 0; i < gamePickedList.Count; i++)
                    {
                        Game game = gamePickedList[i];
                        dataDictionary.Add(i.ToString(), new
                        {
                            user_id = game.userID,
                            game_id = game.gameID,
                            username = game.username,
                            game_name = game.gameName,
                            rating = game.rating,
                            rating_count = game.ratingCount,
                            cover = new List<List<string>> { new List<string>(game.cover) },
                            genres = new List<List<string>> { new List<string>(game.genres) },
                            game_platforms = new List<List<string>> { new List<string>(game.gamePlatforms) },
                            completion_time = game.completionTime * 3600 // Convert back to seconds
                        });
                    }

                    var updatedJson = new
                    {
                        status = "success",
                        availability = availability,
                        algorithm = algorithm,
                        data = dataDictionary
                    };

                    string jsonString = JsonSerializer.Serialize(updatedJson, new JsonSerializerOptions { WriteIndented = true });
                    File.WriteAllText(jsonFilePath, jsonString);
                }
                else
                {
                    Console.WriteLine("Uh oh, not a valid algorithm D:");

                    var updatedJson = new
                    {
                        status = "success",
                        availability = availability,
                        algorithm = algorithm
                    };

                    string jsonString = JsonSerializer.Serialize(updatedJson, new JsonSerializerOptions { WriteIndented = true });
                    File.WriteAllText(jsonFilePath, jsonString);
                }

            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.ToString());
            }
        }

        static void WriteJsonToFile(object updatedJson, string filePath)
        {
            try
            {
                string jsonString = JsonSerializer.Serialize(updatedJson, new JsonSerializerOptions { WriteIndented = true });
                File.WriteAllText(filePath, jsonString);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Failed to write JSON file: {ex.Message}");
            }
        }
    }
}
