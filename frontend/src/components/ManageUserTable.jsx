import React, { useState } from "react";
import {
  Box, Typography, Paper, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow,
  Select, MenuItem, TablePagination, Dialog,
  DialogTitle, DialogContent, DialogActions,
  Button, Alert, CircularProgress
} from "@mui/material";
import { useAuth } from "../context/AuthContext";

export default function ManageUserTable({
  users,
  total,
  page,
  rowsPerPage,
  setPage,
  setRowsPerPage,
  loading,
  error,
  onChangeUserField,
  currentMode,
}) {

  const [confirm, setConfirm] = useState({
    open: false,
    user: null,
    field: null,
    value: null
  });
  const [saving, setSaving] = useState(false);

  const openConfirm = (user, field, rawValue) => {
    const value = rawValue === "true" ? true : rawValue === "false" ? false : rawValue;
    setConfirm({ open: true, user, field, value });
  };

  const applyUpdate = async () => {
    if (!confirm.user) return;
    setSaving(true);

    await onChangeUserField(confirm.user, confirm.field, confirm.value);

    setSaving(false);
    setConfirm({ open: false, user: null, field: null, value: null });
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", py: 6 }}>
        <CircularProgress sx={{ color: "#d63384" }}/>
      </Box>
    );
  }

  
  return (
    <Box sx={{ width: "100%", maxWidth: "100%"}}>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      
      <TableContainer component={Paper} elevation={2} sx={{overflowX:"auto", width:"100%", boxSizing: "border-box",}}>
        <Table 
          sx={{ "& th": { color: "text.secondary"},
            minWidth: "800px",
            width: "max-content",
            tableLayout: "auto",
            "& td, & th": { textAlign: "center", whiteSpace: "nowrap" }           
          }}
        >
          <TableHead>
            <TableRow>
              <TableCell>UTORid</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Verified</TableCell>
              <TableCell>Suspicious</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.utorid}</TableCell>
                <TableCell>{user.name || "—"}</TableCell>
                <TableCell>{user.email || "—"}</TableCell>

                {/* ROLE */}
                <TableCell>
                  {
                    currentMode === "superuser" ? (
                      <Select
                        size="small"
                        value={user.role}
                        onChange={(e) => openConfirm(user, "role", e.target.value)}
                      >
                        <MenuItem value="regular">regular</MenuItem>
                        <MenuItem value="cashier">cashier</MenuItem>
                        <MenuItem value="manager">manager</MenuItem>
                        <MenuItem value="superuser">superuser</MenuItem>
                      </Select>
                    ) : user.role === "regular" || user.role === "cashier" ? (
                      <Select
                        size="small"
                        value={user.role}
                        onChange={(e) => openConfirm(user, "role", e.target.value)}
                      >
                        <MenuItem value="regular">regular</MenuItem>
                        <MenuItem value="cashier">cashier</MenuItem>
                      </Select>
                    ) : (
                      user.role
                    )
                  }
                </TableCell>

                {/* VERIFIED */}
                <TableCell>
                  <Select
                    size="small"
                    value={user.verified ? "true" : "false"}
                    onChange={(e) => openConfirm(user, "verified", e.target.value)}
                  >
                    <MenuItem value="true">Verified</MenuItem>
                    <MenuItem value="false">Unverified</MenuItem>
                  </Select>
                </TableCell>

                {/* SUSPICIOUS */}
                <TableCell>
                  {user.role === "cashier" ? (
                    <Select
                      size="small"
                      value={(user.suspicious ?? false) ? "true" : "false"}
                      onChange={(e) =>
                        openConfirm(user, "suspicious", e.target.value)
                      }
                    >
                      <MenuItem value="true">Yes</MenuItem>
                      <MenuItem value="false">No</MenuItem>
                    </Select>
                  ) : "—"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Pagination */}
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <TablePagination
            component="div"
            count={total}
            page={page}
            rowsPerPage={rowsPerPage}
            onPageChange={(_, p) => setPage(p)}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            rowsPerPageOptions={[5, 10, 25, 50]}
          />
        </Box>
      </TableContainer>

      <Dialog
        open={confirm.open}
        onClose={() => setConfirm({ open: false, user: null, field: null, value: null })}
      >
        <DialogTitle>Confirm Change</DialogTitle>
        <DialogContent>
          Set <strong>{confirm.field}</strong> for <strong>{confirm.user?.utorid}</strong> to{" "}
          <strong>{String(confirm.value)}</strong>?
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setConfirm({ open: false, user: null, field: null, value: null })}
            disabled={saving}
            className="secondary-pink-btn"
          >
            Cancel
          </Button>
          <Button disabled={saving} onClick={applyUpdate} variant="contained" className="pink-btn">
            {saving ? "Saving..." : "Confirm"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
