import { Formik, Form, Field, ErrorMessage } from "formik";
import * as yup from "yup";
import axios from "axios";
import { Link, useNavigate } from 'react-router-dom';
import '../styles/Login.css';
import { useState } from 'react';
import ConfirmModal from '../components/ConfirmModal';

function Login() {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState({ email: '', general: '' });
  const [modal, setModal] = useState({ open: false, message: '' });

  const handleClickLogin = (values, { setFieldError, setSubmitting }) => {
    setServerError({ email: '', general: '' });
    // Validação extra de e-mail antes de enviar
    if (!values.email.includes('@') || !values.email.includes('.')) {
      setFieldError('email', 'Digite um email válido (exemplo: usuario@dominio.com)');
      setSubmitting(false);
      return;
    }
    axios.post("http://localhost:3001/login", {
      email: values.email,
      password: values.password,
    }).then((response) => {
      if (response.data.status === "2FA_REQUIRED") {
        // Redirecionar para a página de autenticação de dois fatores
        navigate('/two-factor-auth', { 
          state: { 
            email: values.email,
            code: response.data.code, // Passar o código 2FA
            previewUrl: response.data.previewUrl // Passar a URL de visualização
          } 
        });
      } else if (response.data.status === "ERROR") {
        setModal({ open: true, message: response.data.message });
      }
    }).catch((error) => {
      if (error.response) {
        const msg = error.response.data.message || error.response.data;
        if (msg.toLowerCase().includes('email')) {
          setFieldError('email', msg);
        } else {
          setModal({ open: true, message: msg });
        }
      } else if (error.request) {
        setModal({ open: true, message: 'Erro de conexão com o servidor. Verifique se o servidor está rodando.' });
      } else {
        setModal({ open: true, message: `Erro: ${error.message}` });
      }
      setSubmitting(false);
    });
  };

  const validationLogin = yup.object().shape({
    email: yup
      .string()
      .email("Digite um email válido (exemplo: usuario@dominio.com)")
      .required("Este campo é obrigatório")
      .test('email-format', 'Digite um email válido (exemplo: usuario@dominio.com)', value => {
        if (!value) return false;
        const parts = value.split('@');
        if (parts.length !== 2) return false;
        const [localPart, domain] = parts;
        if (!localPart || !domain) return false;
        if (!domain.includes('.')) return false;
        return true;
      }),
    password: yup.string().min(8, "A senha deve conter 8 caracteres").required("Este campo é obrigatório"),
  });

  return (
    <div className="container">
      <button 
        className="voltar-button"
        onClick={() => navigate('/')}
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Voltar
      </button>
      <div className="form-container">
        <h1>Login</h1>
        <Formik
          initialValues={{ email: "", password: "" }}
          onSubmit={handleClickLogin}
          validationSchema={validationLogin}
        >
          <Form className='login-form'>
            <div className={`login-form-group${serverError.email ? ' error-field' : ''}`}>
              <Field name="email" className={`form-field${serverError.email ? ' error-field' : ''}`} placeholder="Email" />
              <ErrorMessage
                component="span"
                name="email"
                className='form-error'
              />
              {serverError.email && (
                <span className='form-error server-error'>{serverError.email}</span>
              )}
            </div>

            <div className='login-form-group'>
              <Field name="password" className="form-field" placeholder="Senha" />
              <ErrorMessage
                component="span"
                name="password"
                className='form-error'
              />
            </div>
            {serverError.general && (
              <span className='form-error server-error'>{serverError.general}</span>
            )}
            <button className='button' type='submit'>Entrar</button>
          </Form>
        </Formik>
        <div className="link-container">
          <Link to="/" className="link">Voltar para a página inicial</Link>
        </div>
      </div>
      <ConfirmModal
        open={modal.open}
        title="Erro"
        message={modal.message}
        onConfirm={() => setModal({ open: false, message: '' })}
        onlyConfirm
        confirmText="Fechar"
      />
    </div>
  );
}

export default Login; 