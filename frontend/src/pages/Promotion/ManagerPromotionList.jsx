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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  CircularProgress,
} from "@mui/material";
import { getPromotions, deletePromotion } from "../../api/promotions";
import DeleteModal from "../../components/Promotion/DeleteCard";
import "../../assets/styles/global.scss"; //  Make sure this stays!

export default function ManagerPromotionList() {
  const [filters, setFilters] = useState({
    name: "",
    type: "",
    started: "",
    ended: "",
  });

  const [promotions, setPromotions] = useState([]);
  const [page, setPage] = useState(0); // MUI is 0-indexed
  const [limit, setLimit] = useState(5);
  const [totalCount, setTotalCount] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [promoToDelete, setPromoToDelete] = useState(null);
  const [loading, setLoading] = useState(false);

  const updateFilter = (field, value) => {
    setFilters({ ...filters, [field]: value });
  };

  const resetFilters = () => {
    setFilters({ name: "", type: "", started: "", ended: "" });
    setPage(0);
  };

  const loadFiltered = async (p = page + 1, l = limit) => {
    setLoading(true);
    try {
      const data = await getPromotions({ ...filters, page: p, limit: l });
      setPromotions(data.results || []);
      setTotalCount(data.count || 0);
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

  const openDeleteModal = (promo) => {
    setPromoToDelete(promo);
    setModalOpen(true);
  };

  const handleDelete = async () => {
    await deletePromotion(promoToDelete.id);
    setModalOpen(false);
    loadFiltered(page + 1, limit);
  };

  return (
    <Box >
      <Typography variant="h4" fontWeight={600} mb={3}>
        Manage Promotions
      </Typography>
      {/* 🔍 FILTER PANEL */}
      <Paper elevation={3} sx={{ p: 3, mb: 4, borderRadius: 3 }}>
        <Typography variant="h6" textAlign="center" mb={3}>
          Filter Promotions
        </Typography>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, minmax(0, 1fr))",
              md: "1.5fr 1fr 1fr 1fr auto auto",
            },
            gap: 2,
          }}
        >
          <TextField
            label="Search Name"
            size="small"
            value={filters.name}
            onChange={(e) => updateFilter("name", e.target.value)}
          />

          <FormControl size="small">
            <InputLabel>Type</InputLabel>
            <Select
              label="Type"
              value={filters.type}
              onChange={(e) => updateFilter("type", e.target.value)}
            >
              <MenuItem value="">Any</MenuItem>
              <MenuItem value="automatic">Automatic</MenuItem>
              <MenuItem value="one-time">One-Time</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small">
            <InputLabel>Started?</InputLabel>
            <Select
              label="Started?"
              value={filters.started}
              onChange={(e) => updateFilter("started", e.target.value)}
            >
              <MenuItem value="">Any</MenuItem>
              <MenuItem value="true">Started</MenuItem>
              <MenuItem value="false">Not Started</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small">
            <InputLabel>Ended?</InputLabel>
            <Select
              label="Ended?"
              value={filters.ended}
              onChange={(e) => updateFilter("ended", e.target.value)}
            >
              <MenuItem value="">Any</MenuItem>
              <MenuItem value="true">Ended</MenuItem>
              <MenuItem value="false">Not Ended</MenuItem>
            </Select>
          </FormControl>

          <Button
            className="pink-btn"
            variant="contained"
            sx={{ height: 40 }}
            onClick={handleApply}
          >
            Apply
          </Button>

          <Button
            className="secondary-pink-btn"
            variant="outlined"
            sx={{ height: 40 }}
            onClick={() => {
              resetFilters();
              loadFiltered(1, limit);
            }}
          >
            Reset
          </Button>
        </Box>
      </Paper>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
          <CircularProgress sx={{ color: "#d63384" }}/>
        </Box>
      ) : (
        <>
          {/*  TABLE */}
          <TableContainer component={Paper} elevation={2} sx={{ mx: "auto", borderRadius: 5 }}>
            <Table sx={{ "& td, & th": { textAlign: "center" } }}>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>

                  <TableCell>
                    Type
                  </TableCell>

                  <TableCell >
                    Start
                  </TableCell>

                  <TableCell>
                    End
                  </TableCell>

                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {promotions.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>{p.name}</TableCell>
                    <TableCell>{p.type}</TableCell>
                    <TableCell>{new Date(p.startTime).toLocaleString()}</TableCell>
                    <TableCell>{new Date(p.endTime).toLocaleString()}</TableCell>
                    <TableCell>
                      <Button
                        className="pink-btn"
                        variant="contained"
                        size="small"
                        sx={{ m: 1 }}
                        onClick={() => (window.location.href = `/manager/promotions/${p.id}/edit`)}
                      >
                        Edit
                      </Button>
                      <Button
                        className="secondary-pink-btn"
                        variant="outlined"
                        size="small"
                        
                        onClick={() => openDeleteModal(p)}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/*  PAGINATION */}
            <Box sx={{ display: "flex", justifyContent: "center" }}>
              <TablePagination 
                component="div"
                count={totalCount}
                page={page}
                rowsPerPage={limit}
                onPageChange={handlePagination}
                onRowsPerPageChange={handleLimitChange}
                rowsPerPageOptions={[5, 6, 10, 20]}
              />
            </Box>
          </TableContainer>
        </>
      )}

      {/* 🗑 DELETE MODAL */}
      <DeleteModal
        open={modalOpen}
        promoName={promoToDelete?.name}
        onConfirm={handleDelete}
        onCancel={() => setModalOpen(false)}
      />
    </Box>
  );
}
