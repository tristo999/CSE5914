import { debug } from "util";

  // SPOTIFY FLOW  
  export function addSongs(artist: string, track: string, album:string, num_Songs: number, playlistID: any, spotifyInstance: any) {
    //var token = localStorage.getItem("spotifyAccessToken");
    //var s = new window.SpotifyWebApi();
    // s.setAccessToken(token);
    //Logic to create query
    var started = false;
    var queue = "";
    if (artist != "Undefined") {
      queue += "artist:" +  artist;
      started = true;
    }
    if (track != "Undefined") {
      if (started) {
        queue += " AND ";
      }
      queue += "track:" +  track;
      started = true;
    }
    if (album != "Undefined") {
      if (started) {
        queue += " AND ";
      }
      queue += "album:" +  album;
    }
    console.log("Search: " + queue);
    var searchType = ["track"];
    var searchBody = { "limit": num_Songs.toString() };
    spotifyInstance.search(queue, searchType, searchBody).then((results : any) => {
        var songArray = [];
        for (var i = 0; i < results.tracks.items.length - 1; i++) {
            songArray[i] = results.tracks.items[i].uri;
        }
        spotifyInstance.addTracksToPlaylist(playlistID, songArray);
    });
  }
