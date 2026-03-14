import React, { useState } from "react";
import { TextField, Button, Typography, Box, Paper } from "@mui/material";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { authService } from "../../api/authService";

export default function ResetPasswordPage() {

  const navigate = useNavigate();
  const { resetToken } = useParams();
  const [searchParams] = useSearchParams();

  // read utorid from URL
  const initialUtorid = searchParams.get("utorid") || "";
  const [utorid, setUtorid] = useState(initialUtorid);
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await authService.resetPassword(utorid, password, resetToken);
      alert("Password reset!");
    } catch (err) {
      console.error(err.message);
      alert(err.message);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
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
        <Typography
          variant="h4"
          sx={{
            textAlign: "center",
            mb: 3,
            fontWeight: 700,
          }}
        >
          Reset Your Password
        </Typography>

        <form onSubmit={handleSubmit}>

          <TextField
            fullWidth
            label="New Password"
            name="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            sx={{ mb: 2 }}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            className="pink-btn"
            sx={{ py: 1.3 }}
          >
            Reset Password
          </Button>
        </form>

        <Typography
          sx={{
            marginTop: "20px",
            textAlign: "center",
            fontSize: "14px",
          }}
        >
          Return to{" "}
          <Typography
            component="span"
            onClick={() => navigate("/")}
            sx={{cursor: "pointer", fontSize: "14px"}}
            className="pink-link"
          >
            Log in
          </Typography>
        </Typography>
      </Paper>
    </Box>
  );
}