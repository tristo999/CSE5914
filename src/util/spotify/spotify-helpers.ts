import { debug } from "util";
import * as WordToNumber from "../wordToNumber";

  // SPOTIFY FLOW  
  export function addSongs(artist: string, track: string, album:string, num_Songs: any, playlistID: any, spotifyInstance: any) {
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
    console.log(num_Songs)
    var limit = num_Songs;
    if(isNaN(parseInt(num_Songs))) {
      limit = WordToNumber.text2num(num_Songs);
    }
    var searchBody = { "limit": limit };
    console.log(searchBody);
    spotifyInstance.search(queue, searchType, searchBody).then((results : any) => {
        var songArray = [];
        for (var i = 0; i < results.tracks.items.length; i++) {
            songArray[i] = results.tracks.items[i].uri;
        }
        spotifyInstance.addTracksToPlaylist(playlistID, songArray);
    });
  }
