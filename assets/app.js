// ============================================
// Podcast Player PWA - App Logic
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    // --- State ---
    const appState = {
        episodes: [],
        currentEpisode: null,
        currentIndex: -1,
        audio: new Audio(),
        isPlaying: false
    };

    // --- DOM Elements ---
    const episodesList = document.getElementById('episodes-list');
    const audioPlayer = document.getElementById('audio-player');
    const playerTitle = document.getElementById('player-title');
    const playerDuration = document.getElementById('player-duration');
    const btnPlayPause = document.getElementById('btn-play-pause');
    const btnPrev = document.getElementById('btn-prev');
    const btnNext = document.getElementById('btn-next');
    const playIcon = document.getElementById('play-icon');
    const pauseIcon = document.getElementById('pause-icon');
    const progressBar = document.getElementById('progress-bar');
    const messageBanner = document.getElementById('message-banner');
    const updateBanner = document.getElementById('update-banner');
    const reloadButton = document.getElementById('reload-button');

    // --- Service Worker Registration ---
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js')
                .then(registration => {
                    console.log('Service Worker registered:', registration.scope);

                    registration.addEventListener('updatefound', () => {
                        const newWorker = registration.installing;
                        newWorker.addEventListener('statechange', () => {
                            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                updateBanner.classList.remove('hidden');
                            }
                        });
                    });
                })
                .catch(err => console.error('Service Worker registration failed:', err));

            navigator.serviceWorker.addEventListener('controllerchange', () => {
                window.location.reload();
            });
        });
    }

    // --- Update Handler ---
    if (reloadButton) {
        reloadButton.addEventListener('click', () => {
            navigator.serviceWorker.getRegistration().then(reg => {
                if (reg && reg.waiting) {
                    reg.waiting.postMessage({ type: 'SKIP_WAITING' });
                }
            });
        });
    }

    // --- Initialize ---
    async function init() {
        await loadEpisodes();
        renderEpisodes();
        setupAudioEventListeners();
        setupMediaSession();
        setupPlayerControls();
    }

    // --- Load Episodes from JSON ---
    async function loadEpisodes() {
        try {
            const response = await fetch('/assets/episodes.json');
            if (!response.ok) throw new Error('Failed to load episodes');
            appState.episodes = await response.json();
            console.log('Episodes loaded:', appState.episodes.length);
        } catch (error) {
            console.error('Error loading episodes:', error);
            showMessage('Fehler beim Laden der Episoden', 'error');
        }
    }

    // --- Render Episodes List ---
    function renderEpisodes() {
        if (!episodesList) return;

        episodesList.innerHTML = '';

        appState.episodes.forEach((episode, index) => {
            const episodeCard = document.createElement('div');
            episodeCard.className = 'episode-card';
            episodeCard.dataset.index = index;

            episodeCard.innerHTML = `
                <div class="episode-header">
                    <div class="episode-icon">🎧</div>
                    <div class="episode-info">
                        <h3 class="episode-card-title">${episode.title}</h3>
                        <p class="episode-meta">${episode.publishedAt} • ${episode.duration}</p>
                    </div>
                </div>
                <p class="episode-description">${episode.description}</p>
                <div class="episode-actions">
                    <button class="btn play-episode-btn" data-index="${index}">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M8 5v14l11-7z"/>
                        </svg>
                        Abspielen
                    </button>
                    <button class="btn download-btn" data-url="${episode.fileUrl}" data-title="${episode.title}">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M19 12v7H5v-7H3v7c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-7h-2zm-6 .67l2.59-2.58L17 11.5l-5 5-5-5 1.41-1.41L11 12.67V3h2z"/>
                        </svg>
                        Offline verfügbar machen
                    </button>
                </div>
            `;

            episodesList.appendChild(episodeCard);
        });

        // Add event listeners
        document.querySelectorAll('.play-episode-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.currentTarget.dataset.index);
                playEpisode(index);
            });
        });

        document.querySelectorAll('.download-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const url = e.currentTarget.dataset.url;
                const title = e.currentTarget.dataset.title;
                cacheEpisode(url, title, e.currentTarget);
            });
        });
    }

    // --- Play Episode ---
    function playEpisode(index) {
        if (index < 0 || index >= appState.episodes.length) return;

        const episode = appState.episodes[index];
        appState.currentEpisode = episode;
        appState.currentIndex = index;

        // Update player UI
        playerTitle.textContent = episode.title;
        audioPlayer.classList.remove('hidden');

        // Load and play audio
        appState.audio.src = episode.fileUrl;
        appState.audio.load();
        appState.audio.play()
            .then(() => {
                appState.isPlaying = true;
                updatePlayPauseButton();
                updateMediaSessionMetadata();

                // Cache on play
                cacheEpisodeOnPlay(episode.fileUrl);

                showMessage(`Spiele ab: ${episode.title}`, 'success');
            })
            .catch(err => {
                console.error('Playback error:', err);
                showMessage('Fehler beim Abspielen', 'error');
            });
    }

    // --- Audio Event Listeners ---
    function setupAudioEventListeners() {
        // Time update
        appState.audio.addEventListener('timeupdate', () => {
            if (appState.audio.duration) {
                const progress = (appState.audio.currentTime / appState.audio.duration) * 100;
                progressBar.value = progress;

                const currentTime = formatTime(appState.audio.currentTime);
                const duration = formatTime(appState.audio.duration);
                playerDuration.textContent = `${currentTime} / ${duration}`;
            }
        });

        // Ended
        appState.audio.addEventListener('ended', () => {
            playNext();
        });

        // Play
        appState.audio.addEventListener('play', () => {
            appState.isPlaying = true;
            updatePlayPauseButton();
        });

        // Pause
        appState.audio.addEventListener('pause', () => {
            appState.isPlaying = false;
            updatePlayPauseButton();
        });

        // Error
        appState.audio.addEventListener('error', (e) => {
            console.error('Audio error:', e);
            showMessage('Fehler beim Laden der Audio-Datei', 'error');
        });
    }

    // --- Player Controls ---
    function setupPlayerControls() {
        // Play/Pause
        btnPlayPause.addEventListener('click', togglePlayPause);

        // Previous
        btnPrev.addEventListener('click', playPrevious);

        // Next
        btnNext.addEventListener('click', playNext);

        // Progress bar
        progressBar.addEventListener('input', (e) => {
            const time = (e.target.value / 100) * appState.audio.duration;
            appState.audio.currentTime = time;
        });
    }

    function togglePlayPause() {
        if (appState.isPlaying) {
            appState.audio.pause();
        } else {
            appState.audio.play();
        }
    }

    function playPrevious() {
        if (appState.currentIndex > 0) {
            playEpisode(appState.currentIndex - 1);
        }
    }

    function playNext() {
        if (appState.currentIndex < appState.episodes.length - 1) {
            playEpisode(appState.currentIndex + 1);
        }
    }

    function updatePlayPauseButton() {
        if (appState.isPlaying) {
            playIcon.style.display = 'none';
            pauseIcon.style.display = 'block';
            btnPlayPause.title = 'Pause';
        } else {
            playIcon.style.display = 'block';
            pauseIcon.style.display = 'none';
            btnPlayPause.title = 'Abspielen';
        }
    }

    // --- Media Session API ---
    function setupMediaSession() {
        if ('mediaSession' in navigator) {
            navigator.mediaSession.setActionHandler('play', () => {
                appState.audio.play();
            });

            navigator.mediaSession.setActionHandler('pause', () => {
                appState.audio.pause();
            });

            navigator.mediaSession.setActionHandler('previoustrack', () => {
                playPrevious();
            });

            navigator.mediaSession.setActionHandler('nexttrack', () => {
                playNext();
            });

            navigator.mediaSession.setActionHandler('seekto', (details) => {
                if (details.seekTime) {
                    appState.audio.currentTime = details.seekTime;
                }
            });

            console.log('Media Session API initialized');
        }
    }

    function updateMediaSessionMetadata() {
        if ('mediaSession' in navigator && appState.currentEpisode) {
            navigator.mediaSession.metadata = new MediaMetadata({
                title: appState.currentEpisode.title,
                artist: 'Podcast',
                album: 'Episoden',
                artwork: [
                    { src: '/assets/icon-192.png', sizes: '192x192', type: 'image/png' },
                    { src: '/assets/icon-512.png', sizes: '512x512', type: 'image/png' }
                ]
            });
        }
    }

    // --- Cache Episode ---
    async function cacheEpisode(url, title, buttonElement) {
        if (!navigator.serviceWorker || !navigator.serviceWorker.controller) {
            showMessage('Service Worker nicht verfügbar', 'error');
            return;
        }

        try {
            // Send message to service worker to cache this file
            navigator.serviceWorker.controller.postMessage({
                type: 'CACHE_AUDIO',
                url: url
            });

            buttonElement.textContent = '✓ Wird gecacht...';
            buttonElement.disabled = true;

            showMessage(`${title} wird für Offline-Nutzung gespeichert`, 'success');

            // Check if cached after a delay
            setTimeout(async () => {
                const isCached = await checkIfCached(url);
                if (isCached) {
                    buttonElement.innerHTML = `
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                        </svg>
                        Offline verfügbar
                    `;
                    buttonElement.classList.add('cached');
                }
            }, 2000);

        } catch (error) {
            console.error('Error caching episode:', error);
            showMessage('Fehler beim Cachen', 'error');
            buttonElement.disabled = false;
        }
    }

    async function cacheEpisodeOnPlay(url) {
        if (!navigator.serviceWorker || !navigator.serviceWorker.controller) return;

        navigator.serviceWorker.controller.postMessage({
            type: 'CACHE_AUDIO',
            url: url
        });

        console.log('Caching on play:', url);
    }

    async function checkIfCached(url) {
        if (!('caches' in window)) return false;

        try {
            const cache = await caches.open('podcast-audio-v1');
            const response = await cache.match(url);
            return !!response;
        } catch (error) {
            console.error('Error checking cache:', error);
            return false;
        }
    }

    // --- Utility Functions ---
    function formatTime(seconds) {
        if (isNaN(seconds)) return '00:00';

        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    function showMessage(text, type = 'info') {
        if (!messageBanner) return;

        messageBanner.textContent = text;
        messageBanner.className = `message-banner ${type}`;
        messageBanner.classList.remove('hidden');

        setTimeout(() => {
            messageBanner.classList.add('hidden');
        }, 4000);
    }

    // --- Start App ---
    init();
});
