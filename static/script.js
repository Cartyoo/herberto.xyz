document.addEventListener('DOMContentLoaded', function() {
    const tags = document.querySelectorAll('.tag');
    tags.forEach((tag, index) => {
        tag.style.opacity = '0';
        tag.style.transform = 'translateY(10px)';
        
        setTimeout(() => {
            tag.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
            tag.style.opacity = '1';
            tag.style.transform = 'translateY(0)';
        }, 100 + (index * 50));
    });

    const akaNames = document.querySelectorAll('.aka-name');
    akaNames.forEach(name => {
        name.addEventListener('mouseover', () => {
            name.style.textShadow = '0 0 8px rgba(245, 194, 231, 0.6)';
        });
        
        name.addEventListener('mouseout', () => {
            name.style.textShadow = 'none';
        });
    });
    
    const projectLinks = document.querySelectorAll('.tag.project');
    projectLinks.forEach(link => {
        link.addEventListener('mouseover', () => {
            link.style.boxShadow = '0 0 10px rgba(203, 166, 247, 0.3)';
        });
        
        link.addEventListener('mouseout', () => {
            link.style.boxShadow = 'none';
        });
        
        link.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            ripple.classList.add('ripple');
            link.appendChild(ripple);
            
            const x = e.clientX - link.getBoundingClientRect().left;
            const y = e.clientY - link.getBoundingClientRect().top;
            
            ripple.style.left = `${x}px`;
            ripple.style.top = `${y}px`;
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });

    const hakatimeUrl = 'https://hackatime.hackclub.com/api/v1/users/herberto/stats';
    const timeEl = document.getElementById('haka-time');
    const langEl = document.getElementById('haka-lang');
    
    if (timeEl && langEl) {
        fetch(hakatimeUrl)
            .then(res => {
                if (!res.ok) throw new Error('API fetch failed');
                return res.json();
            })
            .then(data => {
                const stats = data.data || data;
                timeEl.textContent = stats.human_readable_total || '0 hrs';

                if (stats.languages && stats.languages.length > 0) {
                    const topLang = stats.languages.find(l => l.name !== "Other") || stats.languages[0];
                    langEl.textContent = topLang.name;
                } else {
                    langEl.textContent = 'None';
                }
            })
            .catch(err => {
                console.error('Error fetching Hackatime stats:', err);
                timeEl.textContent = 'Unavailable';
                langEl.textContent = 'Unavailable';
            });
    }

    const LASTFM_API = 'https://api.foxes.cool';
    const artistNameEl = document.getElementById('lastfm-artist-name');
    const artistScrobblesEl = document.getElementById('lastfm-artist-scrobbles');
    const artistImgEl = document.getElementById('lastfm-artist-img');
    const artistPlaceholderEl = document.getElementById('lastfm-artist-placeholder');

    if (artistNameEl) {
        fetch(`${LASTFM_API}/api/lastfm/top-artist?period=7day`)
            .then(res => {
                if (!res.ok) throw new Error('API fetch failed');
                return res.json();
            })
            .then(data => {
                if (!data.artist) {
                    artistNameEl.textContent = 'No data';
                    return;
                }
                const { name, scrobbles, image } = data.artist;
                artistNameEl.textContent = name;
                artistScrobblesEl.textContent = `${scrobbles.toLocaleString()} plays this week`;

                if (image) {
                    artistImgEl.src = image;
                    artistImgEl.alt = name;
                    artistImgEl.classList.remove('hidden');
                    artistPlaceholderEl.style.display = 'none';
                }
            })
            .catch(err => {
                console.error('Error fetching Last.fm data:', err);
                artistNameEl.textContent = 'Unavailable';
            });
    }

    const trackNameEl = document.getElementById('lastfm-track-name');
    const trackArtistEl = document.getElementById('lastfm-track-artist');
    const trackPlaysEl = document.getElementById('lastfm-track-plays');
    const trackImgEl = document.getElementById('lastfm-track-img');
    const trackPlaceholderEl = document.getElementById('lastfm-track-placeholder');

    if (trackNameEl) {
        fetch(`${LASTFM_API}/api/lastfm/top-track?period=7day`)
            .then(res => {
                if (!res.ok) throw new Error('API fetch failed');
                return res.json();
            })
            .then(data => {
                if (!data.track) {
                    trackNameEl.textContent = 'No data';
                    return;
                }
                const { name, artist, plays, image } = data.track;
                trackNameEl.textContent = name;
                if (artist) trackArtistEl.textContent = artist;
                trackPlaysEl.textContent = `${plays.toLocaleString()} plays this week`;
                if (image) {
                    trackImgEl.src = image;
                    trackImgEl.alt = name;
                    trackImgEl.classList.remove('hidden');
                    trackPlaceholderEl.style.display = 'none';
                }
            })
            .catch(err => {
                console.error('Error fetching Last.fm track data:', err);
                trackNameEl.textContent = 'Unavailable';
            });
    }

    const albumNameEl = document.getElementById('lastfm-album-name');
    const albumArtistEl = document.getElementById('lastfm-album-artist');
    const albumPlaysEl = document.getElementById('lastfm-album-plays');
    const albumImgEl = document.getElementById('lastfm-album-img');
    const albumPlaceholderEl = document.getElementById('lastfm-album-placeholder');

    if (albumNameEl) {
        fetch(`${LASTFM_API}/api/lastfm/top-album?period=7day`)
            .then(res => {
                if (!res.ok) throw new Error('API fetch failed');
                return res.json();
            })
            .then(data => {
                if (!data.album) {
                    albumNameEl.textContent = 'No data';
                    return;
                }
                const { name, artist, plays, image } = data.album;
                albumNameEl.textContent = name;
                if (artist) albumArtistEl.textContent = artist;
                albumPlaysEl.textContent = `${plays.toLocaleString()} plays this week`;
                if (image) {
                    albumImgEl.src = image;
                    albumImgEl.alt = name;
                    albumImgEl.classList.remove('hidden');
                    albumPlaceholderEl.style.display = 'none';
                }
            })
            .catch(err => {
                console.error('Error fetching Last.fm album data:', err);
                albumNameEl.textContent = 'Unavailable';
            });
    }
});