using Algorithm_Test;
using Microsoft.VisualBasic;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.InteropServices;

Random random = new Random();

string[] stringArray1 = new string[2];
string[] stringsArray2 = new string[2];
List<Game> gameList = new List<Game>();


for (int i = 1; i <= 50; i++)
{
    int randomTimeToBeat = random.Next(10, 300 * 3600);
    int randomCoverID = random.Next(10, 3000);
    double randomRating = random.NextDouble() * 100;

    Game newGame = new Game(i, randomTimeToBeat, randomCoverID.ToString(), stringArray1, stringsArray2, randomRating, 0, "");
    gameList.Add(newGame);
}

User dummyUser = new User("Alice", 0, gameList, random.Next(10, 300));

Console.WriteLine("Games in library:");
foreach (var game in dummyUser.library)
{
    Console.WriteLine($"Game ID: {game.gameID}, Time to Beat: {game.timeToBeat}, Rating: {game.numericalRating}");
}

Console.WriteLine($"\nAvailability: {dummyUser.availability}");

Game pickedGame = dummyUser.PickOneToPlay();

Console.WriteLine($"Game ID: {pickedGame.gameID}, Time to Beat: {pickedGame.timeToBeat}, Rating: {pickedGame.numericalRating}\n");

List<Game> pickedGames = dummyUser.PickMultipleToPlay();
int totalTime = 0;
foreach (var game in pickedGames)
{
    Console.WriteLine($"Game ID: {game.gameID}, Time to Beat: {game.timeToBeat}, Rating: {game.numericalRating}");
    totalTime = totalTime + game.timeToBeat;
}
Console.WriteLine($"\nTotal Time Used: {totalTime}, Extra Time: {dummyUser.availability - totalTime}");
