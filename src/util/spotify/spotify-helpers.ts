  // SPOTIFY FLOW  

  export function addSongsArtist(name: string, numberOfSongs: number, playlistID: any, spotifyInstance: any) {
    var token = localStorage.getItem("spotifyAccessToken");
    // var s = new windowRef.SpotifyWebApi();
    // s.setAccessToken(token);
    var query = "artist:" + name;
    var searchType = ["track"];
    var searchBody = { "limit": numberOfSongs.toString() };
    spotifyInstance.search(query, searchType, searchBody).then((results: any) => {
        console.log(results);
        var songArray = [];
        for (var i = 0; i < 9; i++) {
            songArray[i] = results.tracks.items[i].uri;
        }
        spotifyInstance.addTracksToPlaylist(playlistID, songArray);
    });
  }