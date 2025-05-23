import { generateCodeChallenge, generateCodeVerifier } from "../../utils/pkce";

const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
const redirectUri = import.meta.env.VITE_SPOTIFY_REDIRECT_URI;
const scopes = ["user-read-private", "user-read-email"];

const Login = () => {
  //TODO - add logic for valid token on refresh
  const handleLogin = async () => {
    const codeVerifier = generateCodeVerifier();
    const codeChallenge = await generateCodeChallenge(codeVerifier);

    // Save the verifier to localStorage to use later during token exchange
    localStorage.setItem("spotify_code_verifier", codeVerifier);

    const authUrl = `https://accounts.spotify.com/authorize?${new URLSearchParams(
      {
        response_type: "code",
        client_id: clientId,
        scope: scopes.join(" "),
        redirect_uri: redirectUri,
        code_challenge_method: "S256",
        code_challenge: codeChallenge,
      }
    ).toString()}`;

    window.location.href = authUrl;
  };

  return <button onClick={handleLogin}>Login with Spotify</button>;
};

export default Login;
