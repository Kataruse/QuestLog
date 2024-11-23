using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Algorithm_Test
{
    internal class Game
    {
        public int gameID { get; private set; }
        public int timeToBeat { get; private set; }

        public string coverArtURL { get; private set; }

        public string[] genres { get; private set; }

        public string[] platforms { get; private set; }

        public double numericalRating { get; private set; }

        public int amountOfRatings { get; private set; }

        public string title { get; private set; }

        public Game()
        {
            gameID = 6706;
            timeToBeat = 2;
            coverArtURL = "https://images.igdb.com/igdb/image/upload/t_cover_big/mc1l9crq1rm2ykd37gza.webp";
            genres = new string[2] {"Strategy", "Adventure"};
            platforms = new string[1] { "Atari 2600" };
            numericalRating = 48.44874012050111;
            amountOfRatings = 36;
            title = "E.T. the Extra-Terrestrial";
        }

        public Game(int _gameID, int _timeToBeat, string _coverArtURL, string[] _genres, string[] _platforms, double _numericalRating, int _amountofRatings, string _title)
        {
            timeToBeat = Convert.ToInt32(Math.Round((double)_timeToBeat / 3600));
            gameID = _gameID;
            coverArtURL = "https://images.igdb.com/igdb/image/upload/t_cover_big/" + _coverArtURL + ".webp";
            genres = _genres;
            platforms = _platforms;
            numericalRating = _numericalRating;
            amountOfRatings = _amountofRatings;
            title = _title;
        }
    }
}
