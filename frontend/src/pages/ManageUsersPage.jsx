import React, { useEffect, useState } from 'react';
import { Navigate } from "react-router-dom";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Select,
  MenuItem,
  TablePagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
  Alert,
  TextField,
  Tooltip,
  InputAdornment,
} from "@mui/material";
import InfoOutlined from "@mui/icons-material/InfoOutlined";
import { useAuth } from "../context/AuthContext";
import { userService } from '../api/userService';
import ManageUserTable from '../components/ManageUserTable';
import sanitize from '../../utils/sanitize';

export default function ManageUsers() {
  const { token } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [total, setTotal] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  const [newUser, setNewUser] = useState({ utorid: "", name: "", email: "" });
  const [registering, setRegistering] = useState(false);
  const [registerError, setRegisterError] = useState("");

  const currentMode = localStorage.getItem("currentMode");

  const sanitizeRegistrationInputs = (rawUser) => {
    return {
      utorid: sanitize(rawUser.utorid),
      name: sanitize(rawUser.name),
      email: sanitize(rawUser.email),
    };
  };

  useEffect(() => {
    if (!token) {
      setError("No token found");
      setLoading(false);
      return;
    }

    const fetchUsers = async () => {
      setLoading(true);
      try {
        const data = await userService.getUsers(page, rowsPerPage, searchTerm, roleFilter);
        setUsers(data.results || []);
        setTotal(data.count || 0);
        setError("");
      } catch (err) {
        setError(err.message || "Failed to load users");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [token, page, rowsPerPage, searchTerm, roleFilter]);

  const handleRegister = async () => {
    let sanitizedUser;
    try {
      sanitizedUser = sanitizeRegistrationInputs(newUser);
    } catch (err) {
      setRegisterError(err);
      return;
    }

    if (!sanitizedUser.utorid || !sanitizedUser.email) {
      setRegisterError("UTORid and email are required");
      return;
    }
    setRegisterError("");
    setRegistering(true);
    try {
      const created = await userService.registerUser(sanitizedUser.utorid, sanitizedUser.name, sanitizedUser.email);
      setUsers((prev) => [created, ...prev]);
      setTotal((prev) => prev + 1);
      setNewUser({ utorid: "", name: "", email: "" });
    } catch (err) {
      setRegisterError(err || "Failed to register user");
    } finally {
      setRegistering(false);
    }
  };

  return (
    <Box sx={{ maxWidth: "100%"}}>
      <Typography variant="h4" fontWeight={600} mb={2}>
        Register User
      </Typography>
      <Paper elevation={2} sx={{ p: 2, mb: 3, display: "flex", gap: 2, justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", flexDirection: {xs: "column", sm: "row"} }}>
        <Box sx={{display: "flex", gap: "1rem", flexDirection: {xs: "column", sm: "row"}}}>
          <TextField
            label="UTORid"
            size="small"
            value={newUser.utorid}
            onChange={(e) => setNewUser({ ...newUser, utorid: e.target.value })}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <Tooltip title="UTORid must be 7-8 alphanumeric characters.">
                      <InfoOutlined fontSize="small" color="action" />
                    </Tooltip>
                  </InputAdornment>
                ),
              },
            }}
          />
          <TextField
            label="Name"
            size="small"
            value={newUser.name}
            onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <Tooltip title="Name is required; 1-50 characters.">
                      <InfoOutlined fontSize="small" color="action" />
                    </Tooltip>
                  </InputAdornment>
                ),
              },
            }}
          />
          <TextField
            label="Email"
            size="small"
            type="email"
            value={newUser.email}
            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <Tooltip title="Use a @mail.utoronto.ca or @gmail.com email address.">
                      <InfoOutlined fontSize="small" color="action" />
                    </Tooltip>
                  </InputAdornment>
                ),
              },
            }}
          />
        </Box>
        <Button
          variant="contained"
          className='pink-btn'
          onClick={handleRegister}
          disabled={registering}
        >
          {registering ? "Registering..." : "Register User"}
        </Button>
        {registerError && 
          <Alert severity="error" sx={{ flex: 1, minWidth: 240 }}>
            <strong>{registerError.message || "Could not register user"}</strong>
            <ul style={{ marginTop: 8 }}>
              {registerError.errors?.map((e, idx) => (
                <li key={idx}>{e}</li>
              ))}
            </ul>
          </Alert>}
      </Paper>


      {/* Manage User Section --> for managers and above */}
      
      {currentMode !== "cashier" ? 
        <Box sx={{ maxWidth: "100%"}}>
          <Typography variant="h4" fontWeight={600} mb={2}>
            Manage Users
          </Typography>
          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", alignItems: "center", mb: 2 }}>
            <TextField
              size="small"
              label="Search"
              placeholder="Search by name or UTORid"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(0);
              }}
              sx={{ flex: 1 }}
            />
            <Select
              size="small"
              value={roleFilter}
              displayEmpty
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setPage(0);
              }}
            >
              <MenuItem value="">All roles</MenuItem>
              <MenuItem value="regular">regular</MenuItem>
              <MenuItem value="cashier">cashier</MenuItem>
              <MenuItem value="manager">manager</MenuItem>
              <MenuItem value="superuser">superuser</MenuItem>
            </Select>
          </Box>
          <ManageUserTable
            users={users}
            total={total}
            page={page}
            rowsPerPage={rowsPerPage}
            setPage={setPage}
            setRowsPerPage={setRowsPerPage}
            loading={loading}
            error={error}
            onChangeUserField={async (user, field, value) => {
              const mapping = new Map([[field, value]]);
              await userService.updateUserById(user.id, mapping);
              // update frontend state
              setUsers(prev =>
                prev.map(u =>
                  u.id === user.id ? { ...u, [field]: value } : u
                )
              );
            }}
            currentMode={currentMode}
          />
        </Box>
        : ""
      }
    </Box>
  );
}
