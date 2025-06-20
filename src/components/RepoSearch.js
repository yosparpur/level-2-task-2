import React, { useState, useCallback } from "react";
import axios from "axios";
import debounce from "lodash.debounce";
import {
  TextField,
  CircularProgress,
  Card,
  CardContent,
  Typography,
  Grid,
  Container,
  Link,
  Snackbar,
  Alert,
} from "@mui/material";

const RepoSearch = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const searchRepos = async (query) => {
    if (!query) {
      setRepos([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(
        `https://api.github.com/search/repositories?q=${query}&sort=stars&order=desc`
      );
      setRepos(response.data.items);
    } catch (err) {
      setError("Failed to fetch repositories. Please try again.");
      setRepos([]);
    } finally {
      setLoading(false);
    }
  };

  // Debounce the search function to avoid making too many API calls
  const debouncedSearch = useCallback(
    (query) => {
      debounce((searchQuery) => searchRepos(searchQuery), 500)(query);
    },
    [searchRepos]
  );

  const handleSearchChange = (event) => {
    const { value } = event.target;
    setSearchTerm(value);
    debouncedSearch(value);
  };

  return (
    <Container maxWidth="md" style={{ marginTop: "2rem" }}>
      <Typography variant="h4" gutterBottom>
        GitHub Repository Search
      </Typography>

      <TextField
        fullWidth
        variant="outlined"
        label="Search repositories"
        value={searchTerm}
        onChange={handleSearchChange}
        style={{ marginBottom: "2rem" }}
      />

      {loading && (
        <div style={{ textAlign: "center", padding: "2rem" }}>
          <CircularProgress />
        </div>
      )}

      <Grid container spacing={3}>
        {repos.map((repo) => (
          <Grid item xs={12} key={repo.id}>
            <Card>
              <CardContent>
                <Typography variant="h6" component="h2">
                  <Link href={repo.html_url} target="_blank" rel="noopener">
                    {repo.full_name}
                  </Link>
                </Typography>
                <Typography color="textSecondary">
                  ⭐ {repo.stargazers_count.toLocaleString()} stars
                </Typography>
                <Typography variant="body2" component="p">
                  {repo.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
      >
        <Alert onClose={() => setError(null)} severity="error">
          {error}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default RepoSearch;
