import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { clientId, redirectUri } from "../../utils/constants";

const Callback = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const code = urlParams.get("code");
    const codeVerifier = localStorage.getItem("spotify_code_verifier");

    if (!code || !codeVerifier) {
      console.error("Missing code or code verifier");
      navigate("/");
      return;
    }

    const fetchToken = async () => {
      const body = new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUri,
        client_id: clientId,
        code_verifier: codeVerifier,
      });

      try {
        const response = await fetch("https://accounts.spotify.com/api/token", {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: body.toString(),
        });

        if (!response.ok) {
          throw new Error("Token request failed");
        }

        const data = await response.json();

        localStorage.setItem("spotify_token", data.access_token);
        localStorage.removeItem("spotify_code_verifier");
        window.dispatchEvent(new Event("spotify-auth-changed"));

        // Let App.tsx detect token and fetch profile
        navigate("/profile");
      } catch (error) {
        console.error("Token exchange error:", error);
        navigate("/");
      }
    };

    fetchToken();
  }, [location.search, navigate]);

  return <p>Logging in and exchanging token...</p>;
};

export default Callback;
