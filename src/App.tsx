import { useEffect, useState } from "react";
import {
  generateCodeVerifier,
  generateCodeChallenge,
  fetchAccessToken,
} from "./pkce";
const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
const redirectUri = import.meta.env.VITE_REDIRECT_URI;
const scopes = "user-read-private user-read-email";

function App() {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Handle the redirect callback with ?code= from Spotify
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");
    const state = urlParams.get("state");

    if (code) {
      const savedState = localStorage.getItem("spotify_auth_state");
      if (state !== savedState) {
        console.error("State mismatch");
        return;
      }

      fetchAccessToken(code)
        .then((res: any) => {
          setAccessToken(res.access_token);
          localStorage.setItem("spotify_access_token", res.access_token);
          // Optional: remove query params from URL
          window.history.replaceState({}, document.title, "/");
        })
        .catch((err: any) => {
          console.error("Error getting token:", err);
        })
        .finally(() => setLoading(false));
    } else {
      const storedToken = localStorage.getItem("spotify_access_token");
      if (storedToken) {
        setAccessToken(storedToken);
      }
      setLoading(false);
    }
  }, []);

  async function login() {
    const codeVerifier = generateCodeVerifier();
    const codeChallenge = await generateCodeChallenge(codeVerifier);
    const state = Math.random().toString(36).substring(2, 15);

    localStorage.setItem("spotify_code_verifier", codeVerifier);
    localStorage.setItem("spotify_auth_state", state);

    const args = new URLSearchParams({
      response_type: "code",
      client_id: clientId,
      scope: scopes,
      redirect_uri: redirectUri,
      state: state,
      code_challenge_method: "S256",
      code_challenge: codeChallenge,
    });

    window.location.href = `https://accounts.spotify.com/authorize?${args.toString()}`;
  }

  if (loading) return <div>Loading...</div>;

  return (
    <div style={{ padding: 20 }}>
      <h1>Spotify PKCE Auth Demo</h1>

      {!accessToken ? (
        <button onClick={login}>Log in with Spotify</button>
      ) : (
        <div>
          <p>You're logged in! ✅</p>
          <p>
            Access Token: <code>{accessToken}</code>
          </p>
        </div>
      )}
    </div>
  );
}

export default App;
