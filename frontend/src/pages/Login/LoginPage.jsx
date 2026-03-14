import React from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
} from "@mui/material";


export default function LoginPage() {
  const navigate = useNavigate();
  const { login, loginWithGoogle } = useAuth();
  const [utorid, setUtorid] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [errorMsg, setErrorMsg] = React.useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const err = await login(utorid, password);
    if (err) {
      setErrorMsg(err);  
      return;
    }
    // navigate to whatever page we suppose to navigate too
    navigate("/home");
  };


  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Paper
        elevation={4}
        sx={{
          padding: 4,
          width: "350px",
          textAlign: "center",
          borderRadius: 2,
        }}
      >
        <Typography variant="h4" sx={{ mb: 3, fontWeight: 700, }}>
          Login
        </Typography>

        {errorMsg && (
          <p style={{ color: "red", marginBottom: "8px" }}>
            {errorMsg}
          </p>
        )}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="UTORid"
              value={utorid}
              onChange={(e) => setUtorid(e.target.value)}
              sx={{ mb: 2 }}
              required
            />

            <TextField
              fullWidth
              type="password"
              label="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <Typography
              sx={{
                mb: 3, mt: 1, textAlign: "left", fontSize: "14px",
              }}
            >
              Forgot your password? {" "}
              <Typography
                component="span"
                className="pink-link"
                sx={{ cursor: "pointer",  fontSize: "14px" }}
                onClick={() => navigate("/forgot-password")}
              >
                Reset
              </Typography>
            </Typography>

            <Button
              fullWidth
              className="pink-btn"
              variant="contained"
              type="submit"
              sx={{ py: 1.3 }}
            >
              Login
            </Button>
          </form>
          <Button
            className=""
            onClick={loginWithGoogle}
            sx={{ my: 1.3 }}
          >
            <img
              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
              alt="Google"
              style={{ width: "20px", height: "20px", marginRight: "7px" }}
            />
            Login with Google
          </Button>
      </Paper>
    </Box>
  );
}