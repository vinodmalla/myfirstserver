import React, { useState } from 'react';
import axios from 'axios';

function Lyrics() {
  const [artist, setArtist] = useState("");
  const [song, setSong] = useState("");
  const [lyrics, setLyrics] = useState("");
  function getLyrics(e) {
    e.preventDefault();  // Prevent form submission

    if (song.trim() === "" || artist.trim() === "") {
      return 
    }

    axios.get(`https://api.lyrics.ovh/v1/${artist}/${song}`)
      .then(res => setLyrics(res.data.lyrics))
      .catch(err => setLyrics("Lyrics not found"));
  }

  return (
    <div>
      <form onSubmit={getLyrics}>
        <h1 className='m-12 font-bold text-3xl text-start text-green-500'>Lyrics Finder</h1>
        <div>
          <input
            type="text"
            value={artist}
            onChange={(e) => setArtist(e.target.value)}
            placeholder='Artist Name'
            className="m-4 flex justify-end w-1/4 p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div className='py-2'>
          <input
            type="text"
            value={song}
            onChange={(e) => setSong(e.target.value)}
            placeholder='Song Name'
            className="m-4 w-1/4 p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <button
          type="submit"
          className="m-4 w-1/4 py-2 px-4 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Search
        </button>
      </form>
      <pre className='text-center animate-float'>{lyrics}</pre>
    </div>
  );
}

export default Lyrics;
