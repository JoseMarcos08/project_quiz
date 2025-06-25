import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Container, Paper, TextField, Button, Typography, Grid, FormControl, FormLabel, RadioGroup, FormControlLabel, Radio, Alert, IconButton, InputLabel, Select, MenuItem
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import '../styles/AddQuestion.css';

const EditQuestion = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    enunciado: '',
    alternativa_a: '',
    alternativa_b: '',
    alternativa_c: '',
    alternativa_d: '',
    resposta_correta: '',
    nivel_dificuldade: '',
    categoria: '',
  });
  const [status, setStatus] = useState({ success: null, message: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchQuestion() {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:3001/admin/questions/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (response.ok) {
          setFormData({
            enunciado: data.enunciado || '',
            alternativa_a: data.alternativa_a || '',
            alternativa_b: data.alternativa_b || '',
            alternativa_c: data.alternativa_c || '',
            alternativa_d: data.alternativa_d || '',
            resposta_correta: data.resposta_correta || '',
            nivel_dificuldade: data.nivel_dificuldade || '',
            categoria: data.categoria || '',
          });
        } else {
          setStatus({ success: false, message: data.msg || 'Erro ao carregar pergunta.' });
        }
      } catch (error) {
        setStatus({ success: false, message: 'Erro ao conectar com o servidor.' });
      }
      setLoading(false);
    }
    fetchQuestion();
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ success: null, message: '' });
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/admin/questions/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (response.ok) {
        setStatus({ success: true, message: 'Pergunta atualizada com sucesso!' });
        setTimeout(() => navigate('/admin/questions'), 1200);
      } else {
        setStatus({ success: false, message: data.msg || 'Erro ao atualizar pergunta.' });
      }
    } catch (error) {
      setStatus({ success: false, message: 'Erro ao conectar com o servidor.' });
    }
  };

  const handleGoBack = () => {
    navigate('/admin/questions');
  };

  if (loading) return <Box sx={{ paddingTop: '90px', textAlign: 'center' }}>Carregando...</Box>;

  return (
    <Box className="add-question-page-container" sx={{ paddingTop: '90px' }}>
      <Container maxWidth="md">
        <Box sx={{ mb: 4 }}>
          <Paper elevation={3} sx={{ p: 4, backgroundColor: 'var(--background-light)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <IconButton onClick={handleGoBack} sx={{ color: 'var(--text-secondary)' }}>
                <ArrowBackIcon />
              </IconButton>
              <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ flexGrow: 1, color: 'var(--primary-light)' }}>
                Editar Pergunta
              </Typography>
              <Typography variant="subtitle1" align="center" sx={{ color: 'var(--text-secondary)', mb: 2 }}>
                ID da Pergunta: {id}
              </Typography>
              <Box sx={{ width: 48 }} />
            </Box>
            {status.message && (
              <Alert severity={status.success ? 'success' : 'error'} sx={{ mb: 2 }}>
                {status.message}
              </Alert>
            )}
            <form onSubmit={handleSubmit}>
              <TextField
                margin="normal"
                required
                fullWidth
                label="Enunciado"
                name="enunciado"
                value={formData.enunciado}
                onChange={handleInputChange}
                multiline
                rows={4}
                sx={{ backgroundColor: 'var(--background-card)', '& .MuiOutlinedInput-root': { color: 'var(--text-primary)', fieldset: { borderColor: 'var(--border-color)' }, '&:hover fieldset': { borderColor: 'var(--primary-color)' }, '&.Mui-focused fieldset': { borderColor: 'var(--primary-light)' }, }, '& .MuiInputLabel-root': { color: 'var(--text-secondary)' }, '& .Mui-focused .MuiInputLabel-root': { color: 'var(--primary-light)' }, }}
              />
              <Grid container spacing={2} sx={{ mt: 2 }}>
                {['a', 'b', 'c', 'd'].map((alt) => (
                  <Grid item xs={12} sm={6} key={alt}>
                    <TextField
                      margin="normal"
                      required
                      fullWidth
                      label={`Alternativa ${alt.toUpperCase()}`}
                      name={`alternativa_${alt}`}
                      value={formData[`alternativa_${alt}`]}
                      onChange={handleInputChange}
                      sx={{ backgroundColor: 'var(--background-card)', '& .MuiOutlinedInput-root': { color: 'var(--text-primary)', fieldset: { borderColor: 'var(--border-color)' }, '&:hover fieldset': { borderColor: 'var(--primary-color)' }, '&.Mui-focused fieldset': { borderColor: 'var(--primary-light)' }, }, '& .MuiInputLabel-root': { color: 'var(--text-secondary)' }, '& .Mui-focused .MuiInputLabel-root': { color: 'var(--primary-light)' }, }}
                    />
                  </Grid>
                ))}
              </Grid>
              <FormControl component="fieldset" margin="normal" required sx={{ mt: 2 }}>
                <FormLabel component="legend" sx={{ color: 'var(--text-secondary)' }}>Resposta Correta</FormLabel>
                <RadioGroup
                  row
                  name="resposta_correta"
                  value={formData.resposta_correta}
                  onChange={handleInputChange}
                >
                  {['A', 'B', 'C', 'D'].map((option) => (
                    <FormControlLabel
                      key={option}
                      value={option}
                      control={<Radio required sx={{ color: 'var(--primary-color)' }} />}
                      label={option}
                      sx={{ '& .MuiTypography-root': { color: 'var(--text-primary)' } }}
                    />
                  ))}
                </RadioGroup>
              </FormControl>
              <FormControl fullWidth margin="normal" required>
                <InputLabel id="nivel-dificuldade-label" sx={{ color: 'var(--text-secondary)' }}>Nível de Dificuldade</InputLabel>
                <Select
                  labelId="nivel-dificuldade-label"
                  name="nivel_dificuldade"
                  value={formData.nivel_dificuldade}
                  label="Nível de Dificuldade"
                  onChange={handleInputChange}
                  sx={{ backgroundColor: 'var(--background-card)', color: 'var(--text-primary)' }}
                >
                  <MenuItem value="facil">Fácil</MenuItem>
                  <MenuItem value="medio">Médio</MenuItem>
                  <MenuItem value="dificil">Difícil</MenuItem>
                  <MenuItem value="aleatorio">Aleatório</MenuItem>
                </Select>
              </FormControl>
              <TextField
                margin="normal"
                fullWidth
                label="Categoria"
                name="categoria"
                value={formData.categoria}
                onChange={handleInputChange}
                sx={{ backgroundColor: 'var(--background-card)', '& .MuiOutlinedInput-root': { color: 'var(--text-primary)', fieldset: { borderColor: 'var(--border-color)' }, '&:hover fieldset': { borderColor: 'var(--primary-color)' }, '&.Mui-focused fieldset': { borderColor: 'var(--primary-light)' }, }, '& .MuiInputLabel-root': { color: 'var(--text-secondary)' }, '& .Mui-focused .MuiInputLabel-root': { color: 'var(--primary-light)' }, }}
              />
              <Button type="submit" variant="contained" color="primary" sx={{ mt: 3 }}>
                Salvar Alterações
              </Button>
            </form>
          </Paper>
        </Box>
      </Container>
    </Box>
  );
};

export default EditQuestion; 