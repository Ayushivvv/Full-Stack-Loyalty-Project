import React from 'react';
import {
  Avatar,
  Box,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Grid,
  Stack,
  TextField,
  Typography,
  Paper,
} from "@mui/material";
import { useAuth } from "../context/AuthContext";
import defaultAvatar from "../assets/default-profile.png";
import { userService } from "../api/userService";
import { authService } from "../api/authService";
import sanitize from '../../utils/sanitize';
import UserQR from "../components/UserQR";


const formatDate = (value) => {
  if (!value) return "—";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString(undefined, { timeZone: "UTC" });
};

const sanitizeFormInputs = (rawForm) => {
  return {
    name: sanitize(rawForm.name),
    email: sanitize(rawForm.email),
    birthday: sanitize(rawForm.birthday),
    avatarUrl: rawForm.avatarUrl,
  };
};

export default function Profile() {
  const [open, setOpen] = React.useState(false);
  const [form, setForm] = React.useState({
    name: "",
    email: "",
    birthday: "",
    avatarUrl: "",
  });
  const [updateError, setUpdateError] = React.useState("");
  const [sendingReset, setSendingReset] = React.useState(false);
  const [resetMessage, setResetMessage] = React.useState("");
  const [resetError, setResetError] = React.useState("");

  const { user, loading } = useAuth();
  if (loading) return <p>Loading user...</p>;

  const {
    utorid,
    name,
    email,
    birthday,
    role,
    points,
    createdAt,
    lastLogin,
    verified,
    avatarUrl,
    promotions,
  } = user;

  const openDialog = () => {
    setOpen(true);
    setForm({
      name: name ?? "",
      email: email ?? "",
      birthday: birthday ?? "",
      avatarUrl: null 
    });
  }

  return (
    <Box sx={{ }}>
      <Typography variant="h4" fontWeight={600} mb={3}>
        Account Information
      </Typography>

      <Paper elevation={2} sx={{ borderRadius: 3, width: "100%", maxWidth: 600 }}>

        <Box sx={{ p: 4 }}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={3}
            alignItems={{ xs: "center", sm: "flex-start" }}
          >
            <Avatar
              src={`${import.meta.env.VITE_BACKEND_URL}${avatarUrl}`|| defaultAvatar}
              sx={{ width: 90, height: 90, fontSize: 32 }}
            >
            </Avatar>
            <Stack
              spacing={1}
              sx={{
                textAlign: { xs: "center", sm: "left" },
                alignItems: { xs: "center", sm: "flex-start" },
              }}
            >
              <Typography variant="h5" fontWeight={600}>
                {name || utorid}
              </Typography>
              <Typography variant="body1">{email}</Typography>
              <Stack direction="row" spacing={1} mt={1}>
                <Chip
                  label={verified ? "Verified" : "Unverified"}
                  color={verified ? "success" : "default"}
                  variant={verified ? "filled" : "outlined"}
                />
                {role && (
                  <Chip
                    label={role}
                    variant="outlined"
                    sx={{ color: "#d63384", border: "1px solid #d63384" }}
                  />
                )}
              </Stack>
            </Stack>
            <UserQR utorid={utorid} />
          </Stack>
          <Divider sx={{ my: 3 }} />
          <Grid container spacing={3} sx={{ textAlign: { xs: "center", sm: "left" } }}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="body2" color="text.secondary">
                UTORid
              </Typography>
              <Typography variant="body1">{utorid}</Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="body2" color="text.secondary">
                Birthday
              </Typography>
              <Typography variant="body1">{formatDate(birthday)}</Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="body2" color="text.secondary">
                Points
              </Typography>
              <Typography variant="body1">{points ?? 0}</Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="body2" color="text.secondary">
                Promotions
              </Typography>
              <Typography variant="body1">
                {Array.isArray(promotions)
                  ? `${promotions.length} promotion${
                      promotions.length === 1 ? "" : "s"
                    }`
                  : "—"}
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="body2" color="text.secondary">
                Account Created
              </Typography>
              <Typography variant="body1">{formatDate(createdAt)}</Typography>
            </Grid>
          </Grid>
        </Box>
      </Paper>
      <Button
        className="pink-btn"
        variant="contained"
        sx={{ mt: 3}}
        onClick={openDialog}
      >
        Edit Profile
      </Button>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Profile</DialogTitle>

        <DialogContent sx={{ pt: 3 }}>
          <Stack spacing={2} sx={{ pt: 3}}>
            <TextField
              label="Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              fullWidth
            />

            <TextField
              label="Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              fullWidth
            />

            <TextField
              label="Birthday"
              type="date"
              value={form.birthday}
              onChange={(e) => setForm({ ...form, birthday: e.target.value })}
              fullWidth
              slotProps={{
                inputLabel: { shrink: true }, 
              }}
            />

            <Button variant="outlined" component="label" className='secondary-pink-btn'>
              Upload Avatar
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={(e) => setForm({ ...form, avatarUrl: e.target.files[0] })}
              />
            </Button>

            {form.avatarUrl && (
              <Typography variant="body2" mt={1}>
                Selected: {form.avatarUrl.name}
              </Typography>
            )}
            {updateError && (
              <Typography variant="body2" color="error" mt={1}>
                {updateError}
              </Typography>
            )}
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpen(false)} className='secondary-pink-btn'>Cancel</Button>

          <Button
            variant="contained"
            className="pink-btn"
            onClick={async () => {
              const token = localStorage.getItem("token");
              setUpdateError("");
              try {
                const sanitizedForm = sanitizeFormInputs(form);
                await userService.updateCurrUser(sanitizedForm, token);
                console.log("Updated profile:", form);
                setOpen(false);
                window.location.reload();
              } catch (err) {
                console.error(err);
                setUpdateError(err.message || "Failed to update profile");
              }
            }}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      <Paper
        elevation={1}
        sx={{
          borderRadius: 3,
          width: "100%",
          maxWidth: 600,
          mt: 3,
        }}
      >
        <Box sx={{ p: 3}}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
            <Box>
              <Typography variant="h6" fontWeight={600}>
                Reset Password
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Send a password reset link to {email}.
              </Typography>
              {resetMessage && (
                <Typography variant="body2" color="success.main" mt={1}>
                  {resetMessage}
                </Typography>
              )}
              {resetError && (
                <Typography variant="body2" color="error.main" mt={1}>
                  {resetError}
                </Typography>
              )}
            </Box>
            <Button
              variant="contained"
              className="pink-btn"
              disabled={sendingReset}
              onClick={async () => {
                setSendingReset(true);
                setResetMessage("");
                setResetError("");
                try {
                  await authService.getResetToken(utorid);
                  setResetMessage("Reset email sent. Check your inbox.");
                } catch (err) {
                  console.error(err);
                  setResetError(err.error|| "Failed to send reset email");
                } finally {
                  setSendingReset(false);
                }
              }}
            >
              {sendingReset ? "Sending..." : "Request Reset"}
            </Button>
          </Stack>
        </Box>
      </Paper>
    </Box>

  );
  
}
