using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Algorithm_Test
{
    internal class User
    {
        public string username { get; private set; }
        public int id { get; private set; }
        public List<Game> library { get; private set; }

        public int availability { get; private set; }

        public User()
        {
            username = "username";
            id = -1;
            library = new List<Game>();
            availability = 20;
        }

        public User(string _username, int _id, List<Game> _library, int _availability)
        {
            username = _username;
            id = _id;
            library = _library;
            availability = _availability;
        }

        // O(n) Time Complexity & game id is -1 if no game can be selected
        public Game PickOneToPlay()
        {
            Game pickedGame = null;

            for (int i = 1; i <= library.Count - 1; i++)
            {
                if (pickedGame == null)
                {
                    if (library[i].timeToBeat <= availability)
                    {
                        pickedGame = library[i];
                    }
                }
                else
                {
                    if (library[i].timeToBeat <= availability && pickedGame.timeToBeat < library[i].timeToBeat || 
                        library[i].timeToBeat == pickedGame.timeToBeat && library[i].numericalRating > pickedGame.numericalRating)
                    {
                        pickedGame = library[i];
                    }
                }
            }

            if (pickedGame != null)
            {
                return pickedGame;
            }
            {
                string[] stringArray1 = new string[2];
                string[] stringsArray2 = new string[2];
                Game dummyGame = new Game(-1, -1, "Failed To Pick Game", stringArray1, stringsArray2, 0, 0, "Failed To Pick Game");
                return dummyGame;
            }

        }

        // O(n log n) Time Complexity & game list is empty if no game can be played
        public List<Game> PickMultipleToPlay() 
        {
            List<Game> sortedLibrary = library.OrderBy(game => game.timeToBeat).ThenByDescending(game => game.numericalRating).ToList();

            List<Game> pickedGamesList = new List<Game>();
            int totalTimeSpent = 0;

            foreach (var game in sortedLibrary)
            {
                if (totalTimeSpent + game.timeToBeat <= availability)
                {
                    pickedGamesList.Add(game);
                    totalTimeSpent += game.timeToBeat;
                }
                else
                {
                    break;
                }
            }
            return pickedGamesList;
        }

        
    }
}
