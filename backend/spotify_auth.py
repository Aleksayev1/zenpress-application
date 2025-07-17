from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import RedirectResponse
import spotipy
from spotipy.oauth2 import SpotifyOAuth
import os
from typing import Optional

router = APIRouter()

def get_spotify_oauth():
    return SpotifyOAuth(
        client_id=os.getenv("SPOTIFY_CLIENT_ID"),
        client_secret=os.getenv("SPOTIFY_CLIENT_SECRET"),
        redirect_uri=os.getenv("REDIRECT_URI"),
        scope="user-read-playback-state user-modify-playback-state user-read-private streaming user-read-recently-played playlist-read-private"
    )

@router.get("/spotify/login")
async def spotify_login():
    try:
        sp_oauth = get_spotify_oauth()
        auth_url = sp_oauth.get_authorize_url()
        return {"auth_url": auth_url}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Spotify login error: {str(e)}")

@router.post("/spotify/callback")
async def spotify_callback(code: str):
    try:
        sp_oauth = get_spotify_oauth()
        token_info = sp_oauth.get_access_token(code)
        return {
            "access_token": token_info["access_token"],
            "refresh_token": token_info["refresh_token"],
            "expires_in": token_info["expires_in"]
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Spotify callback error: {str(e)}")

@router.post("/spotify/refresh")
async def refresh_spotify_token(refresh_token: str):
    try:
        sp_oauth = get_spotify_oauth()
        token_info = sp_oauth.refresh_access_token(refresh_token)
        return {
            "access_token": token_info["access_token"],
            "expires_in": token_info.get("expires_in", 3600)
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Token refresh error: {str(e)}")

@router.get("/spotify/profile")
async def get_spotify_profile(access_token: str):
    try:
        sp = spotipy.Spotify(auth=access_token)
        profile = sp.me()
        return {
            "id": profile["id"],
            "display_name": profile["display_name"],
            "product": profile["product"],  # "free" or "premium"
            "is_premium": profile["product"] == "premium",
            "images": profile.get("images", [])
        }
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid Spotify token")

@router.get("/spotify/search")
async def search_spotify_tracks(q: str, access_token: str, limit: int = 20):
    try:
        sp = spotipy.Spotify(auth=access_token)
        results = sp.search(q, limit=limit, type='track')
        
        # Format results for frontend
        tracks = []
        for track in results['tracks']['items']:
            tracks.append({
                "id": track["id"],
                "name": track["name"],
                "uri": track["uri"],
                "preview_url": track["preview_url"],
                "duration_ms": track["duration_ms"],
                "artists": [{"name": artist["name"]} for artist in track["artists"]],
                "album": {
                    "name": track["album"]["name"],
                    "images": track["album"]["images"]
                }
            })
        
        return {"tracks": tracks}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Search error: {str(e)}")

@router.post("/spotify/play")
async def spotify_play_track(
    track_uri: str,
    access_token: str,
    position_ms: int = 0,
    device_id: Optional[str] = None
):
    try:
        sp = spotipy.Spotify(auth=access_token)
        
        # Get available devices if no device_id provided
        devices = sp.devices()
        if not device_id and devices["devices"]:
            device_id = devices["devices"][0]["id"]
        
        sp.start_playback(
            device_id=device_id,
            uris=[track_uri],
            position_ms=position_ms
        )
        return {"status": "playing", "position_ms": position_ms}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Playback error: {str(e)}")

@router.post("/spotify/pause")
async def spotify_pause_track(access_token: str, device_id: Optional[str] = None):
    try:
        sp = spotipy.Spotify(auth=access_token)
        sp.pause_playback(device_id=device_id)
        return {"status": "paused"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Pause error: {str(e)}")

@router.get("/spotify/playback")
async def get_spotify_playback_state(access_token: str):
    try:
        sp = spotipy.Spotify(auth=access_token)
        state = sp.current_playback()
        if state is None:
            return {"is_playing": False, "item": None}
        
        return {
            "is_playing": state["is_playing"],
            "progress_ms": state["progress_ms"],
            "item": {
                "id": state["item"]["id"],
                "name": state["item"]["name"],
                "artists": [{"name": artist["name"]} for artist in state["item"]["artists"]],
                "duration_ms": state["item"]["duration_ms"]
            } if state["item"] else None
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Playback state error: {str(e)}")

@router.get("/spotify/devices")
async def get_spotify_devices(access_token: str):
    try:
        sp = spotipy.Spotify(auth=access_token)
        devices = sp.devices()
        return {"devices": devices["devices"]}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Devices error: {str(e)}")

@router.get("/spotify/wellness-playlists")
async def get_wellness_playlists(access_token: str):
    """Get recommended wellness and meditation playlists"""
    try:
        sp = spotipy.Spotify(auth=access_token)
        
        # Search for wellness-related playlists
        wellness_queries = [
            "meditation music",
            "relaxing music",
            "spa music",
            "zen music",
            "wellness",
            "calm music"
        ]
        
        all_playlists = []
        for query in wellness_queries:
            results = sp.search(query, type='playlist', limit=5)
            for playlist in results['playlists']['items']:
                all_playlists.append({
                    "id": playlist["id"],
                    "name": playlist["name"],
                    "description": playlist["description"],
                    "uri": playlist["uri"],
                    "images": playlist["images"],
                    "tracks_count": playlist["tracks"]["total"]
                })
        
        # Remove duplicates and limit to 15
        unique_playlists = []
        seen_ids = set()
        for playlist in all_playlists:
            if playlist["id"] not in seen_ids:
                unique_playlists.append(playlist)
                seen_ids.add(playlist["id"])
                if len(unique_playlists) >= 15:
                    break
        
        return {"playlists": unique_playlists}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Wellness playlists error: {str(e)}")