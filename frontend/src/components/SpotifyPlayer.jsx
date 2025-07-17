import React, { useState, useEffect, useCallback } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Play, Pause, Search, Music, Volume2, VolumeX } from 'lucide-react';
import api from '../services/api';
import { useTranslation } from 'react-i18next';

const SpotifyPlayer = ({ onSpotifyReady }) => {
  const { t } = useTranslation();
  const [isConnected, setIsConnected] = useState(false);
  const [accessToken, setAccessToken] = useState(localStorage.getItem('spotify_access_token'));
  const [profile, setProfile] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [wellnessPlaylists, setWellnessPlaylists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [volume, setVolume] = useState(0.3);
  const [isMuted, setIsMuted] = useState(false);

  // Initialize Spotify connection
  useEffect(() => {
    if (accessToken) {
      checkSpotifyConnection();
      fetchWellnessPlaylists();
    }
  }, [accessToken]);

  const checkSpotifyConnection = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/spotify/profile?access_token=${accessToken}`);
      setProfile(response.data);
      setIsConnected(true);
      onSpotifyReady && onSpotifyReady(true);
    } catch (error) {
      console.error('Spotify connection failed:', error);
      // Try to refresh token
      const refreshToken = localStorage.getItem('spotify_refresh_token');
      if (refreshToken) {
        await refreshSpotifyToken(refreshToken);
      }
    } finally {
      setLoading(false);
    }
  };

  const refreshSpotifyToken = async (refreshToken) => {
    try {
      const response = await api.post('/spotify/refresh', { refresh_token: refreshToken });
      const newToken = response.data.access_token;
      setAccessToken(newToken);
      localStorage.setItem('spotify_access_token', newToken);
      await checkSpotifyConnection();
    } catch (error) {
      console.error('Token refresh failed:', error);
      handleLogout();
    }
  };

  const handleSpotifyLogin = async () => {
    try {
      const response = await api.get('/spotify/login');
      window.location.href = response.data.auth_url;
    } catch (error) {
      console.error('Spotify login error:', error);
    }
  };

  const handleLogout = () => {
    setAccessToken(null);
    setProfile(null);
    setIsConnected(false);
    setCurrentTrack(null);
    setIsPlaying(false);
    localStorage.removeItem('spotify_access_token');
    localStorage.removeItem('spotify_refresh_token');
    onSpotifyReady && onSpotifyReady(false);
  };

  const searchTracks = async () => {
    if (!searchQuery.trim() || !accessToken) return;
    
    try {
      setLoading(true);
      const response = await api.get(`/spotify/search?q=${encodeURIComponent(searchQuery)}&access_token=${accessToken}&limit=10`);
      setSearchResults(response.data.tracks);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchWellnessPlaylists = async () => {
    try {
      const response = await api.get(`/spotify/wellness-playlists?access_token=${accessToken}`);
      setWellnessPlaylists(response.data.playlists.slice(0, 6));
    } catch (error) {
      console.error('Wellness playlists error:', error);
    }
  };

  const playTrack = async (trackUri, trackData) => {
    if (!accessToken) return;
    
    try {
      await api.post('/spotify/play', {
        track_uri: trackUri,
        access_token: accessToken,
        position_ms: 0
      });
      setCurrentTrack(trackData);
      setIsPlaying(true);
    } catch (error) {
      console.error('Play error:', error);
      // If premium required, show message
      if (error.response?.status === 400) {
        alert('Spotify Premium é necessário para reproduzir música através do app. Você pode usar o Spotify diretamente no seu dispositivo.');
      }
    }
  };

  const pauseTrack = async () => {
    if (!accessToken) return;
    
    try {
      await api.post('/spotify/pause', { access_token: accessToken });
      setIsPlaying(false);
    } catch (error) {
      console.error('Pause error:', error);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  // Handle auth callback
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    
    if (code && !accessToken) {
      handleAuthCallback(code);
    }
  }, []);

  const handleAuthCallback = async (code) => {
    try {
      const response = await api.post('/spotify/callback', { code });
      const { access_token, refresh_token } = response.data;
      
      setAccessToken(access_token);
      localStorage.setItem('spotify_access_token', access_token);
      localStorage.setItem('spotify_refresh_token', refresh_token);
      
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
      
      await checkSpotifyConnection();
    } catch (error) {
      console.error('Auth callback error:', error);
    }
  };

  if (loading) {
    return (
      <Card className="mb-6">
        <CardContent className="p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-2"></div>
          <p>{t('common.loading', 'Carregando...')}</p>
        </CardContent>
      </Card>
    );
  }

  if (!isConnected || !accessToken) {
    return (
      <Card className="mb-6 bg-gradient-to-r from-green-600 to-emerald-600">
        <CardHeader className="text-center">
          <CardTitle className="text-white flex items-center justify-center gap-3">
            <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-green-500">
                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.3z"/>
              </svg>
            </div>
            <Music className="w-6 h-6" />
            🎵 {t('spotify.title')}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-white/90 mb-4">
            {t('spotify.description')}
          </p>
          <Button 
            onClick={handleSpotifyLogin}
            className="bg-white text-green-600 hover:bg-gray-100 font-semibold"
          >
            <div className="w-4 h-4 bg-black rounded-full flex items-center justify-center mr-2">
              <svg viewBox="0 0 24 24" className="w-3 h-3 fill-green-500">
                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.3z"/>
              </svg>
            </div>
            {t('spotify.connectButton')}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <Music className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold">{t('spotify.greeting')}, {profile?.display_name}!</h3>
                <div className="flex items-center gap-2">
                  <Badge variant={profile?.is_premium ? "secondary" : "destructive"} className="text-xs">
                    {profile?.is_premium ? t('spotify.premium') : t('spotify.free')}
                  </Badge>
                  {!profile?.is_premium && (
                    <span className="text-xs text-white/80">
                      ({t('spotify.premiumRequired')})
                    </span>
                  )}
                </div>
              </div>
            </div>
            <Button 
              onClick={handleLogout}
              variant="ghost"
              className="text-white hover:bg-white/20"
              size="sm"
            >
              {t('spotify.disconnect')}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Current Track */}
      {currentTrack && (
        <Card className="bg-emerald-50 border-emerald-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {currentTrack.album?.images?.[2] && (
                  <img 
                    src={currentTrack.album.images[2].url} 
                    alt={currentTrack.name}
                    className="w-12 h-12 rounded-lg"
                  />
                )}
                <div>
                  <h4 className="font-semibold text-emerald-900">{currentTrack.name}</h4>
                  <p className="text-emerald-700 text-sm">
                    {currentTrack.artists?.map(a => a.name).join(', ')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  onClick={toggleMute}
                  variant="ghost"
                  size="sm"
                  className="text-emerald-700"
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </Button>
                <Button
                  onClick={isPlaying ? pauseTrack : () => playTrack(currentTrack.uri, currentTrack)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  size="sm"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            {t('spotify.search')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && searchTracks()}
              placeholder={t('spotify.searchPlaceholder')}
              className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:border-emerald-500"
            />
            <Button onClick={searchTracks} disabled={loading}>
              {loading ? '...' : t('spotify.searchButton')}
            </Button>
          </div>

          {searchResults.length > 0 && (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {searchResults.map((track) => (
                <div key={track.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    {track.album?.images?.[2] && (
                      <img 
                        src={track.album.images[2].url} 
                        alt={track.name}
                        className="w-10 h-10 rounded"
                      />
                    )}
                    <div>
                      <h5 className="font-medium text-sm">{track.name}</h5>
                      <p className="text-gray-600 text-xs">
                        {track.artists?.map(a => a.name).join(', ')}
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={() => playTrack(track.uri, track)}
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-700"
                  >
                    <Play className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Wellness Playlists */}
      {wellnessPlaylists.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🧘‍♀️ {t('spotify.playlistsRecommended')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              {wellnessPlaylists.map((playlist) => (
                <div key={playlist.id} className="flex items-center gap-3 p-3 bg-emerald-50 rounded-lg">
                  {playlist.images?.[0] && (
                    <img 
                      src={playlist.images[0].url} 
                      alt={playlist.name}
                      className="w-12 h-12 rounded-lg"
                    />
                  )}
                  <div className="flex-1">
                    <h5 className="font-medium text-emerald-900 text-sm">{playlist.name}</h5>
                    <p className="text-emerald-700 text-xs">
                      {playlist.tracks_count} {t('spotify.tracksCount')}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-emerald-600 hover:bg-emerald-100"
                    onClick={() => window.open(`https://open.spotify.com/playlist/${playlist.id}`, '_blank')}
                  >
                    {t('spotify.openPlaylist')}
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SpotifyPlayer;