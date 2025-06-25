import React, { useState } from 'react';
import {
  Box,
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Grid,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Select,
  MenuItem,
  InputLabel,
  Alert,
  IconButton,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import '../styles/AddQuestion.css';

const AddQuestion = () => {
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ success: null, message: '' }); // Reset status

    try {
      const response = await fetch('http://localhost:3001/add-question', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Incluir token de autenticação se necessário
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus({ success: true, message: data.msg });
        // Limpar formulário após sucesso
        setFormData({
          enunciado: '',
          alternativa_a: '',
          alternativa_b: '',
          alternativa_c: '',
          alternativa_d: '',
          resposta_correta: '',
          nivel_dificuldade: '',
          categoria: '',
        });
      } else {
        setStatus({ success: false, message: data.msg });
      }
    } catch (error) {
      console.error('Erro ao enviar pergunta:', error);
      setStatus({ success: false, message: 'Erro ao conectar com o servidor.' });
    }
  };

  const handleGoBack = () => {
    navigate('/admin'); // Navega de volta para o painel do admin
  };

  return (
    <Box
      className="add-question-page-container"
      sx={{
        paddingTop: '90px',
      }}
    >
      <Container maxWidth="md">
        <Box sx={{ mb: 4 }}>
          <Paper
            elevation={3}
            sx={{
              p: 4,
              backgroundColor: 'var(--background-light)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-color)',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <IconButton onClick={handleGoBack} sx={{ color: 'var(--text-secondary)' }}>
                <ArrowBackIcon />
              </IconButton>
              <Typography
                variant="h4"
                component="h1"
                gutterBottom
                align="center"
                sx={{ flexGrow: 1, color: 'var(--primary-light)' }}
              >
                Adicionar Nova Pergunta
              </Typography>
              <Typography variant="subtitle1" align="center" sx={{ color: 'var(--text-secondary)', mb: 2 }}>
                O ID será gerado automaticamente
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
                sx={{
                  backgroundColor: 'var(--background-card)',
                  '& .MuiOutlinedInput-root': {
                    color: 'var(--text-primary)',
                    fieldset: { borderColor: 'var(--border-color)' },
                    '&:hover fieldset': { borderColor: 'var(--primary-color)' },
                    '&.Mui-focused fieldset': { borderColor: 'var(--primary-light)' },
                  },
                  '& .MuiInputLabel-root': {
                    color: 'var(--text-secondary)',
                  },
                   '& .Mui-focused .MuiInputLabel-root': {
                    color: 'var(--primary-light)',
                  },
                }}
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
                      sx={{
                        backgroundColor: 'var(--background-card)',
                        '& .MuiOutlinedInput-root': {
                          color: 'var(--text-primary)',
                          fieldset: { borderColor: 'var(--border-color)' },
                          '&:hover fieldset': { borderColor: 'var(--primary-color)' },
                          '&.Mui-focused fieldset': { borderColor: 'var(--primary-light)' },
                        },
                        '& .MuiInputLabel-root': {
                          color: 'var(--text-secondary)',
                        },
                         '& .Mui-focused .MuiInputLabel-root': {
                          color: 'var(--primary-light)',
                        },
                      }}
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

              <FormControl fullWidth margin="normal" required sx={{ mt: 2 }}>
                <InputLabel id="difficulty-label" sx={{ color: 'var(--text-secondary)' }}>Nível de Dificuldade</InputLabel>
                <Select
                  labelId="difficulty-label"
                  id="nivel_dificuldade"
                  name="nivel_dificuldade"
                  value={formData.nivel_dificuldade}
                  label="Nível de Dificuldade"
                  onChange={handleInputChange}
                  sx={{
                    backgroundColor: 'var(--background-card)',
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--border-color)' },
                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--primary-color)' },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--primary-light)' },
                    '& .MuiSelect-icon': { color: 'var(--text-secondary)' },
                    color: 'var(--text-primary)',
                  }}
                >
                  <MenuItem value="facil">Fácil</MenuItem>
                  <MenuItem value="medio">Médio</MenuItem>
                  <MenuItem value="dificil">Difícil</MenuItem>
                </Select>
              </FormControl>

               <TextField
                  margin="normal"
                  required
                  fullWidth
                  label="Categoria"
                  name="categoria"
                  value={formData.categoria}
                  onChange={handleInputChange}
                  sx={{
                    backgroundColor: 'var(--background-card)',
                    '& .MuiOutlinedInput-root': {
                      color: 'var(--text-primary)',
                      fieldset: { borderColor: 'var(--border-color)' },
                      '&:hover fieldset': { borderColor: 'var(--primary-color)' },
                      '&.Mui-focused fieldset': { borderColor: 'var(--primary-light)' },
                    },
                     '& .MuiInputLabel-root': {
                      color: 'var(--text-secondary)',
                    },
                     '& .Mui-focused .MuiInputLabel-root': {
                      color: 'var(--primary-light)',
                    },
                  }}
                />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{
                  mt: 3, mb: 2,
                  backgroundColor: 'var(--primary-color)',
                  '&:hover': { backgroundColor: 'var(--primary-hover)' },
                  color: 'white',
                }}
              >
                Adicionar Pergunta
              </Button>
            </form>
          </Paper>
        </Box>
      </Container>
    </Box>
  );
};

export default AddQuestion; 