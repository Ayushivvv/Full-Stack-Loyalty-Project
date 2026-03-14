import { useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";
import { userService } from "../api/userService";


export default function UserQR({ utorid }) {
  const [qr, setQr] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => { 
    async function fetchQR() {
      try {
        const data = await userService.getUserQrCode(utorid);
        setQr(data.qr);
      } catch (err) {
        console.error(err);
        setError("Failed to load QR code.");
      }
    }

    fetchQR();
  }, [utorid]);

  return (
    <Box sx={{ textAlign: { xs: "center", sm: "right" }}}>
      <Typography variant="subtitle2">Your QR Code</Typography>
      {error && <Typography color="error">{error}</Typography>}
      {qr && <img src={qr} alt="QR Code" style={{ width: "60%" }} />}
    </Box>
  );
}
