import React, { useState } from "react";
import { TextField, Button, Typography, Box, Paper } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { authService } from "../../api/authService";

export default function ForgotPasswordPage() {

  const navigate = useNavigate();
  const [utorid, setUtorid] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await authService.getResetToken(utorid);
      alert("Reset email sent!");
    } catch (err) {
      console.error(err.message);
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
            label="UTORid"
            name="utorid"
            value={utorid}
            onChange={(e) => setUtorid(e.target.value)}
            sx={{ mb: 2 }}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            className="pink-btn"
            sx={{ py: 1.3 }}
          >
            Send Password Reset Email
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

};