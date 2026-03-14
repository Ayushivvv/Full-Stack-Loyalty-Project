import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../../api/authService";
import { useAuth } from "../../context/AuthContext";

export default function AuthTokens() {
  const navigate = useNavigate();
  const { supabase } = useAuth();

  useEffect(() => {

    async function handleAuth() {
      // get supabase google session
      const { data } = await supabase.auth.getSession();
      const session = data.session;

      if (!session) {
        alert("Google login failed.");
        return navigate("/");
      }

      const email = session.user.email;

      // send email to backend to link user
      try {
        const { token } = await authService.googleLogin(email);
        localStorage.setItem("token", token);
        navigate("/profile");
        window.location.reload();
      }
      catch (err) {
        alert(err.message, "Account not found or not allowed.");
        await supabase.auth.signOut();
        return navigate("/");
      }
    }

    handleAuth();
  }, []);

  return <p>Signing in with Google...</p>;
}
