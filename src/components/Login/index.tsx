import "./styles.scss";
import { FaSpotify } from "react-icons/fa";
import { clientId, redirectUri } from "../../utils/constants";
import { generateCodeChallenge, generateCodeVerifier } from "../../utils/pkce";

const scopes = ["user-read-private", "user-read-email"];

const Login = () => {
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

  return (
    <div className="login-container">
      <div className="spotify-login-widget">
        <h1>Log in to Spotify</h1>
        <p>Please log in to continue.</p>
        <button className="spotify-login-button" onClick={handleLogin}>
          <FaSpotify className="spotify-icon" />
          Log in with Spotify
        </button>
      </div>
    </div>
  );
};

export default Login;
