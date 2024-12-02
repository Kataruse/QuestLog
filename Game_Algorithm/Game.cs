using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Algorithm_Test
{
    internal class Game
    {
        public int userID { get; private set; }
        public int gameID { get; private set; }
        public string username { get; private set; }
        public string gameName { get; private set; }
        public double rating { get; private set; }
        public int ratingCount { get; private set; }
        public string[] cover { get; private set; }
        public string[] genres { get; private set; }
        public string[] gamePlatforms { get; private set; }
        public int completionTime { get; private set; }
        

        public Game()
        {
            userID = -1;
            gameID = -1;
            username = "invalid";
            gameName = "invalid";
            rating = -1;
            ratingCount = -1;
            cover = new string[0];
            genres = new string[0];
            gamePlatforms = new string[0];
            completionTime = -1;
        }

        public Game(int _userID, int _gameID, string _username, string _gameName, double _rating, int _ratingCount, string[] _cover, string[] _genres, string[] _gamePlatforms, int _completionTime)
        {
            userID = _userID;
            gameID = _gameID;
            username = _username;
            gameName = _gameName;
            rating = _rating;
            ratingCount = ratingCount;
            cover = _cover;
            genres = _genres;
            gamePlatforms = _gamePlatforms;
            completionTime = Convert.ToInt32(Math.Round((double)_completionTime / 3600));
        }
    }
}
