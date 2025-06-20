import React, { useState, useCallback } from "react";
import { CircularProgress, Card, CardContent, Typography, TextField, Snackbar } from '@mui/material';
import { Alert } from '@mui/lab';
import axios from 'axios';
import debounce from 'lodash.debounce';

const debouncedSearchFn = debounce((query, searchRepos) => {
  searchRepos(query);
}, 500);

function RepoSearch() {
  const [searchTerm, setSearchTerm] = useState('');
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const searchRepos = useCallback(async (query) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`https://api.github.com/search/repositories?q=${query}`);
      setRepos(response.data.items);
    } catch (err) {
      setError('Gagal mengambil repositori. Silakan coba lagi.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []); // searchRepos is now stable

  const handleSearchChange = useCallback((event) => {
    const query = event.target.value;
    setSearchTerm(query);
    debouncedSearchFn(query, searchRepos); // Pass searchRepos as an argument
  }, [searchRepos]); // debouncedSearchFn is stable, searchRepos is stable

  const handleCloseSnackbar = () => {
    setError(null);
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
