const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3078;
const LASTFM_API_KEY = process.env.LASTFM_API_KEY;
const LASTFM_USERNAME = process.env.LASTFM_USERNAME;
const LASTFM_BASE = 'https://ws.audioscrobbler.com/2.0';
const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

let spotifyToken = null;
let spotifyTokenExpiry = 0;

async function getSpotifyToken() {
    if (spotifyToken && Date.now() < spotifyTokenExpiry) return spotifyToken;
    const creds = Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64');
    const res = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
            'Authorization': `Basic ${creds}`,
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: 'grant_type=client_credentials'
    });
    if (!res.ok) throw new Error(`Spotify token request failed: ${res.status}`);
    const data = await res.json();
    spotifyToken = data.access_token;
    spotifyTokenExpiry = Date.now() + (data.expires_in - 60) * 1000;
    return spotifyToken;
}

app.use(cors({
    origin: process.env.ALLOWED_ORIGIN || '*'
}));

app.get('/api/lastfm/top-track', async (req, res) => {
    const period = req.query.period || '7day';

    if (!LASTFM_API_KEY || !LASTFM_USERNAME) {
        return res.status(500).json({ error: 'Last.fm API key or username not configured' });
    }

    const url = `${LASTFM_BASE}/?method=user.gettoptracks&user=${encodeURIComponent(LASTFM_USERNAME)}&api_key=${LASTFM_API_KEY}&period=${period}&limit=1&format=json`;

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Last.fm responded with ${response.status}`);
        const data = await response.json();

        if (data.error) {
            return res.status(400).json({ error: data.message });
        }

        const tracks = data.toptracks?.track;
        if (!tracks || tracks.length === 0) {
            return res.json({ track: null });
        }

        const top = tracks[0];

        let image = null;
        if (SPOTIFY_CLIENT_ID && SPOTIFY_CLIENT_SECRET) {
            try {
                const token = await getSpotifyToken();
                const q = `track:${top.name} artist:${top.artist?.name || ''}`;
                const searchUrl = `https://api.spotify.com/v1/search?q=${encodeURIComponent(q)}&type=track&limit=1`;
                const spotifyRes = await fetch(searchUrl, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const spotifyData = await spotifyRes.json();
                const spotifyTrack = spotifyData.tracks?.items?.[0];
                image = spotifyTrack?.album?.images?.[0]?.url || null;
            } catch (imgErr) {
                console.warn('Spotify image fetch failed:', imgErr.message);
            }
        }

        return res.json({
            track: {
                name: top.name,
                artist: top.artist?.name || null,
                plays: parseInt(top.playcount, 10),
                url: top.url,
                image
            }
        });
    } catch (err) {
        console.error('Last.fm fetch error:', err);
        return res.status(500).json({ error: 'Failed to fetch Last.fm data' });
    }
});

app.get('/api/lastfm/top-album', async (req, res) => {
    const period = req.query.period || '7day';

    if (!LASTFM_API_KEY || !LASTFM_USERNAME) {
        return res.status(500).json({ error: 'Last.fm API key or username not configured' });
    }

    const url = `${LASTFM_BASE}/?method=user.gettopalbums&user=${encodeURIComponent(LASTFM_USERNAME)}&api_key=${LASTFM_API_KEY}&period=${period}&limit=1&format=json`;

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Last.fm responded with ${response.status}`);
        const data = await response.json();

        if (data.error) {
            return res.status(400).json({ error: data.message });
        }

        const albums = data.topalbums?.album;
        if (!albums || albums.length === 0) {
            return res.json({ album: null });
        }

        const top = albums[0];

        let image = null;
        if (SPOTIFY_CLIENT_ID && SPOTIFY_CLIENT_SECRET) {
            try {
                const token = await getSpotifyToken();
                const q = `album:${top.name} artist:${top.artist?.name || ''}`;
                const searchUrl = `https://api.spotify.com/v1/search?q=${encodeURIComponent(q)}&type=album&limit=1`;
                const spotifyRes = await fetch(searchUrl, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const spotifyData = await spotifyRes.json();
                const spotifyAlbum = spotifyData.albums?.items?.[0];
                image = spotifyAlbum?.images?.[0]?.url || null;
            } catch (imgErr) {
                console.warn('Spotify image fetch failed:', imgErr.message);
            }
        }

        return res.json({
            album: {
                name: top.name,
                artist: top.artist?.name || null,
                plays: parseInt(top.playcount, 10),
                url: top.url,
                image
            }
        });
    } catch (err) {
        console.error('Last.fm fetch error:', err);
        return res.status(500).json({ error: 'Failed to fetch Last.fm data' });
    }
});

app.get('/api/lastfm/top-artist', async (req, res) => {
    const period = req.query.period || '7day';

    if (!LASTFM_API_KEY || !LASTFM_USERNAME) {
        return res.status(500).json({ error: 'Last.fm API key or username not configured' });
    }

    const url = `${LASTFM_BASE}/?method=user.gettopartists&user=${encodeURIComponent(LASTFM_USERNAME)}&api_key=${LASTFM_API_KEY}&period=${period}&limit=1&format=json`;
    
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Last.fm responded with ${response.status}`);
        const data = await response.json();

        if (data.error) {
            return res.status(400).json({ error: data.message });
        }

        const artists = data.topartists?.artist;
        if (!artists || artists.length === 0) {
            return res.json({ artist: null });
        }

            const top = artists[0];

        let image = null;
        if (SPOTIFY_CLIENT_ID && SPOTIFY_CLIENT_SECRET) {
            try {
                const token = await getSpotifyToken();
                const searchUrl = `https://api.spotify.com/v1/search?q=${encodeURIComponent(top.name)}&type=artist&limit=1`;
                const spotifyRes = await fetch(searchUrl, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const spotifyData = await spotifyRes.json();
                const spotifyArtist = spotifyData.artists?.items?.[0];
                image = spotifyArtist?.images?.[0]?.url || null;
            } catch (imgErr) {
                console.warn('Spotify image fetch failed:', imgErr.message);
            }
        }

        return res.json({
            artist: {
                name: top.name,
                scrobbles: parseInt(top.playcount, 10),
                url: top.url,
                image
            }
        });
    } catch (err) {
        console.error('Last.fm fetch error:', err);
        return res.status(500).json({ error: 'Failed to fetch Last.fm data' });
    }
});

app.listen(PORT, () => {
    console.log(`API server running on port ${PORT}`);
});
