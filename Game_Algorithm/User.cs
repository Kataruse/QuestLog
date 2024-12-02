using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Algorithm_Test
{
    internal class User
    {
        public List<Game> library { get; private set; }

        public int availability { get; private set; }

        public User()
        {
            library = new List<Game>();
            availability = 20;
        }

        public User(List<Game> _library, int _availability)
        {
            library = _library;
            availability = _availability;
        }

        // Algorithm 0; O(n) Time Complexity & gameID, timeToBeat, numericalRating is set to -1 if no game can be selected
        public Game PickOneToPlay()
        {
            Game pickedGame = null;

            for (int i = 1; i <= library.Count - 1; i++)
            {
                if (pickedGame == null)
                {
                    if (library[i].completionTime <= availability)
                    {
                        pickedGame = library[i];
                    }
                }
                else
                {
                    if (library[i].completionTime <= availability && pickedGame.completionTime < library[i].completionTime || 
                        library[i].completionTime == pickedGame.completionTime && library[i].rating > pickedGame.rating)
                    {
                        pickedGame = library[i];
                    }
                }
            }

            if (pickedGame != null)
            {
                return pickedGame;
            }
            else
            {
                Game dummyGame = new Game(-1, -1, "-1", "-1", -1, -1, new string[0], new string[0], new string[0], -1);
                return dummyGame;
            }

        }

        // Algorithm 1; O(n log n) Time Complexity & game list is empty if no game can be played
        public List<Game> PickMultipleToPlay() 
        {
            List<Game> sortedLibrary = library.OrderBy(game => game.completionTime).ThenByDescending(game => game.rating).ToList();

            List<Game> pickedGamesList = new List<Game>();
            int totalTimeSpent = 0;

            foreach (var game in sortedLibrary)
            {
                if (totalTimeSpent + game.completionTime <= availability)
                {
                    pickedGamesList.Add(game);
                    totalTimeSpent += game.completionTime;
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
