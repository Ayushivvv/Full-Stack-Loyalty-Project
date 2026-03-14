import { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
} from "@mui/material";
import { getAllTransactions, MarkTransactionSus } from "../../api/transaction";
import "../../assets/styles/global.scss"

export default function ManagerTransactionsPage() {
  const [filters, setFilters] = useState({
    name: "",
    type: "",
    suspicious: "",
    amount: "",
    operator: "",
  });

  const [transactions, setTransactions] = useState([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(0); // MUI is 0-indexed
  const [limit, setLimit] = useState(5);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const updateFilter = (field, value) => {
    setFilters({ ...filters, [field]: value });
  };

  const resetFilters = () => {
    setFilters({
      name: "",
      type: "",
      suspicious: "",
      amount: "",
      operator: "",
    });
    setPage(0);
  };

  const loadFiltered = async (p = page + 1, l = limit) => {
    setLoading(true);
    setError("");
    try {
      const data = await getAllTransactions({ ...filters, page: p, limit: l });
      setTransactions(data.results || []);
      setCount(data.count || 0);
    } catch (err) {
      setError(err.message || "Failed to load transactions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFiltered(1, limit);
  }, []);

  const handleApply = () => {
    setPage(0);
    loadFiltered(1, limit);
  };

  const handlePagination = (event, newPage) => {
    setPage(newPage);
    loadFiltered(newPage + 1, limit);
  };

  const handleLimitChange = (event) => {
    const newLimit = parseInt(event.target.value, 10);
    setLimit(newLimit);
    setPage(0);
    loadFiltered(1, newLimit);
  };

  const toggleSuspicious = async (id, current) => {
    try {
      await MarkTransactionSus(id, !current);
      loadFiltered(page + 1, limit);
    } catch {
      alert("Failed to update suspicious");
    }
  };

  return (
    <Box>
      <Typography variant="h4" fontWeight={600} mb={3}>
        Manage Transactions
      </Typography>

      <Box>
        {/* FILTER PANEL */}
        <Paper elevation={2} sx={{ mb: 4, borderRadius: 3 }}>
          <Box sx={{ p: 3}}>
            <Typography variant="h6" textAlign="center" mb={3}>
              Filter Transactions
            </Typography>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "repeat(2, minmax(0, 1fr))",
                  md: {
                xs: "1fr",
                sm: "repeat(2, minmax(0, 1fr))",
                md: "1.5fr 1fr 1fr 1fr 1fr auto auto",
                },
                },
              gap: 2,
              }}
            >
              <TextField
                fullWidth
              label="Name / UTORid"
                size="small"
                value={filters.name}
                onChange={(e) => updateFilter("name", e.target.value)}
              />
              <FormControl fullWidth size="small">
                <InputLabel>Type</InputLabel>
                <Select
                  label="Type"
                  value={filters.type}
                  onChange={(e) => updateFilter("type", e.target.value)}
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="purchase">Purchase</MenuItem>
                  <MenuItem value="redemption">Redemption</MenuItem>
                  <MenuItem value="adjustment">Adjustment</MenuItem>
                  <MenuItem value="transfer">Transfer</MenuItem>
                  <MenuItem value="event">Event</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth size="small">
                <InputLabel>Suspicious</InputLabel>
                <Select
                  label="Suspicious"
                  value={filters.suspicious}
                  onChange={(e) => updateFilter("suspicious", e.target.value)}
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="true">Yes</MenuItem>
                  <MenuItem value="false">No</MenuItem>
                </Select>
              </FormControl>
              <TextField
                fullWidth
              label="Amount"
                size="small"
                type="number"
                value={filters.amount}
                onChange={(e) => updateFilter("amount", e.target.value)}
              />
              <FormControl fullWidth size="small">
                <InputLabel>Op</InputLabel>
                <Select
                  label="Op"
                  value={filters.operator}
                  onChange={(e) => updateFilter("operator", e.target.value)}
                >
                  <MenuItem value="">Any</MenuItem>
                  <MenuItem value="gte">≥</MenuItem>
                  <MenuItem value="lte">≤</MenuItem>
                </Select>
              </FormControl>
              <Button className="pink-btn" variant="contained" onClick={handleApply} sx={{ height: 40 }}>
                Apply
              </Button>
              <Button className="secondary-pink-btn" variant="outlined" onClick={resetFilters} sx={{ height: 40 }}>
                Reset
              </Button>
            </Box>
          </Box>
        </Paper>
        {/* TRANSACTIONS TABLE */}
        {loading ? (
          <Box sx={{ textAlign: "center", py: 4 }}>
            <CircularProgress sx={{ color: "#d63384" }}/>
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        ) : (
          <TableContainer
            component={Paper}
            elevation={2}
            sx={{
              mx: "auto",           // centers horizontally
              borderRadius: 5,
              overflowX: "auto",
            }}
          >
            <Table sx={{ "& td, & th": { textAlign: "center" } }}>
             
              <TableHead>
                <TableRow>
                  <TableCell>Name / UTORid</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Suspicious</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>



              <TableBody>
                {transactions.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell>{tx.name || tx.utorid}</TableCell>
                    <TableCell>{tx.type}</TableCell>
                    <TableCell>{tx.amount}</TableCell>
                    <TableCell>{tx.suspicious ? "Yes" : "No"}</TableCell>
                    <TableCell>
                    {tx.type === "purchase" && (
                      <Button
                        className="pink-btn"
                        variant="contained"
                        size="small"
                        sx={{ m: 1 }}
                        onClick={() => toggleSuspicious(tx.id, tx.suspicious)}
                      >
                        Toggle Suspicious
                      </Button>
                    )}
                    <Button
                      className="secondary-pink-btn"
                      variant="outlined"
                      size="small"
                      onClick={() =>
                        (window.location.href = `/manager/transactions/${tx.id}`)
                      }
                    >
                      View
                    </Button>
                  </TableCell>

                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Box sx={{ display: "flex", justifyContent: "center" }}>
              <TablePagination
                component="div"
                count={count}
                page={page}
                rowsPerPage={limit}
                onPageChange={handlePagination}
                onRowsPerPageChange={handleLimitChange}
                rowsPerPageOptions={[5, 10, 20, 50]}
              />
            </Box>
          </TableContainer>
        )}
      </Box>
    </Box>
  );
}