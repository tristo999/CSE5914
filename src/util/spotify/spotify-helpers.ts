  // SPOTIFY FLOW  
  export function addSongs(artist: string, track: string, album:string, num_Songs: number, playlistID: any, spotifyInstance: any) {
    var token = localStorage.getItem("spotifyAccessToken");
    //var s = new window.SpotifyWebApi();
    // s.setAccessToken(token);
    //Logic to create query
    var started = false;
    var queue = "";
    if (artist != "Undefined") {
      artist = artist.replace(" ", "%20");
      queue += "artist:" +  artist;
      started = true;
    }
    if (started) {
      queue += "&";
    }
    if (track != "Undefined") {
      track = track.replace(" ", "%20");
      queue += "track:" +  track;
      started = true;
    }
    if (started) {
      queue += "&";
    }
    if (album != "Undefined") {
      album = album.replace(" ", "%20");
      queue += "album:" +  album;
    }
    var searchType = ["track"];
    var searchBody = { "limit": num_Songs.toString() };
    spotifyInstance.search(queue, searchType, searchBody).then((results : any) => {
        var songArray = [];
        for (var i = 0; i < num_Songs - 1; i++) {
            songArray[i] = results.tracks.items[i].uri;
        }
        spotifyInstance.addTracksToPlaylist(playlistID, songArray);
    });
  }
