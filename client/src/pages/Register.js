import { Formik, Form, Field, ErrorMessage } from "formik";
import * as yup from "yup";
import axios from "axios";
import { Link, useNavigate } from 'react-router-dom';
import '../styles/Register.css';
import { useState } from 'react';
import ConfirmModal from '../components/ConfirmModal';

function Register() {
  const navigate = useNavigate();
  const [serverErrors, setServerErrors] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    general: ''
  });
  const [modal, setModal] = useState({ open: false, message: '' });

  const handleClickRegister = (values, { setSubmitting, setFieldError }) => {
    // Limpar erros anteriores
    setServerErrors({
      email: '',
      password: '',
      confirmPassword: '',
      general: ''
    });

    // Validar email antes de enviar
    if (!values.email.includes('@') || !values.email.includes('.')) {
      setFieldError('email', 'Digite um email válido (exemplo: usuario@dominio.com)');
      setSubmitting(false);
      return;
    }

    axios.post("http://localhost:3001/register", {
      email: values.email,
      password: values.password
    })
    .then((response) => {
      if (response.data.msg === "Cadastrado com sucesso") {
        navigate('/login');
      } else {
        setServerErrors(prev => ({
          ...prev,
          general: response.data.msg
        }));
      }
    })
    .catch((error) => {
      if (error.response) {
        // O servidor respondeu com um status de erro
        const errorMsg = error.response.data.msg || "Erro ao cadastrar";
        
        // Tentar identificar a qual campo o erro se refere
        if (errorMsg.toLowerCase().includes('email')) {
          setFieldError('email', errorMsg);
        } else if (errorMsg.toLowerCase().includes('senha')) {
          setFieldError('password', errorMsg);
        } else {
          setServerErrors(prev => ({
            ...prev,
            general: errorMsg
          }));
        }
      } else if (error.request) {
        setServerErrors(prev => ({
          ...prev,
          general: 'Erro de conexão com o servidor. Verifique se o servidor está rodando.'
        }));
      } else {
        setServerErrors(prev => ({
          ...prev,
          general: `Erro: ${error.message}`
        }));
      }
      setSubmitting(false);
    });
  };

  const validationRegister = yup.object().shape({
    email: yup
      .string()
      .email("Digite um email válido (exemplo: usuario@dominio.com)")
      .required("O email é obrigatório")
      .test('email-format', 'Digite um email válido (exemplo: usuario@dominio.com)', value => {
        if (!value) return false;
        const parts = value.split('@');
        if (parts.length !== 2) return false;
        const [localPart, domain] = parts;
        if (!localPart || !domain) return false;
        if (!domain.includes('.')) return false;
        return true;
      }),
    password: yup
      .string()
      .min(8, "A senha deve ter pelo menos 8 caracteres")
      .matches(/[A-Z]/, "A senha deve conter pelo menos uma letra maiúscula")
      .matches(/[a-z]/, "A senha deve conter pelo menos uma letra minúscula")
      .matches(/[0-9]/, "A senha deve conter pelo menos um número")
      .matches(/[!@#$%^&*]/, "A senha deve conter pelo menos um caractere especial (!@#$%^&*)")
      .required("A senha é obrigatória"),
    confirmPassword: yup
      .string()
      .oneOf([yup.ref("password"), null], "As senhas não coincidem")
      .required("A confirmação de senha é obrigatória"),
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
        <h1>Cadastro</h1>
        
        {/* Formulário com JavaScript desativado */}
        <noscript>
          <form 
            action="http://localhost:3001/register" 
            method="POST" 
            className='register-form'
            onSubmit={(e) => {
              const form = e.target;
              const password = form.password.value;
              const confirmPassword = form.confirmPassword.value;
              if (password !== confirmPassword) {
                e.preventDefault();
                setModal({ open: true, message: 'As senhas não coincidem' });
                return false;
              }
              if (password.length < 8) {
                e.preventDefault();
                setModal({ open: true, message: 'A senha deve ter pelo menos 8 caracteres' });
                return false;
              }
              if (!/[A-Z]/.test(password)) {
                e.preventDefault();
                setModal({ open: true, message: 'A senha deve conter pelo menos uma letra maiúscula' });
                return false;
              }
              if (!/[a-z]/.test(password)) {
                e.preventDefault();
                setModal({ open: true, message: 'A senha deve conter pelo menos uma letra minúscula' });
                return false;
              }
              if (!/[0-9]/.test(password)) {
                e.preventDefault();
                setModal({ open: true, message: 'A senha deve conter pelo menos um número' });
                return false;
              }
              if (!/[!@#$%^&*]/.test(password)) {
                e.preventDefault();
                setModal({ open: true, message: 'A senha deve conter pelo menos um caractere especial (!@#$%^&*)' });
                return false;
              }
              return true;
            }}
          >
            <div className='register-form-group'>
              <input 
                name="email" 
                className="form-field" 
                placeholder="Email" 
                type="email"
                required
                pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
                title="Digite um email válido (exemplo: usuario@dominio.com)"
              />
            </div>

            <div className="password-requirements">
              <p>A senha deve conter:</p>
              <ul>
                <li>Pelo menos 8 caracteres</li>
                <li>Uma letra maiúscula</li>
                <li>Uma letra minúscula</li>
                <li>Um número</li>
                <li>Um caractere especial (!@#$%^&*)</li>
              </ul>
            </div>

            <div className='register-form-group'>
              <input 
                name="password" 
                className="form-field" 
                placeholder="Senha" 
                type="password"
                required
                minLength="8"
                pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$"
                title="A senha deve conter pelo menos 8 caracteres, uma letra maiúscula, uma minúscula, um número e um caractere especial"
              />
            </div>

            <div className='register-form-group'>
              <input 
                name="confirmPassword" 
                className="form-field" 
                placeholder="Confirme sua senha" 
                type="password"
                required
                minLength="8"
              />
            </div>
            
            <button className='button' type='submit'>Cadastrar</button>
          </form>
          <ConfirmModal
            open={modal.open}
            title="Erro"
            message={modal.message}
            onConfirm={() => setModal({ open: false, message: '' })}
            onlyConfirm
            confirmText="Fechar"
          />
        </noscript>

        {/* Formulário com JavaScript ativado */}
        <Formik
          initialValues={{ email: "", password: "", confirmPassword: "" }}
          onSubmit={handleClickRegister}
          validationSchema={validationRegister}
          validateOnChange={true}
          validateOnBlur={true}
        >
          {({ isSubmitting, errors, touched }) => (
            <Form className='register-form'>
              {serverErrors.general && (
                <div className="form-error general-error">
                  {serverErrors.general}
                </div>
              )}
              
              <div className='register-form-group'>
                <Field 
                  name="email" 
                  className={`form-field ${(errors.email && touched.email) || serverErrors.email ? 'error-field' : ''}`}
                  placeholder="Email" 
                  type="email"
                />
                <ErrorMessage
                  component="span"
                  name="email"
                  className='form-error'
                />
                {serverErrors.email && (
                  <span className='form-error server-error'>
                    {serverErrors.email}
                  </span>
                )}
              </div>

              <div className="password-requirements">
                <p>A senha deve conter:</p>
                <ul>
                  <li>Pelo menos 8 caracteres</li>
                  <li>Uma letra maiúscula</li>
                  <li>Uma letra minúscula</li>
                  <li>Um número</li>
                  <li>Um caractere especial (!@#$%^&*)</li>
                </ul>
              </div>

              <div className='register-form-group'>
                <Field 
                  name="password" 
                  className={`form-field ${(errors.password && touched.password) || serverErrors.password ? 'error-field' : ''}`}
                  placeholder="Senha" 
                  type="password"
                />
                <ErrorMessage
                  component="span"
                  name="password"
                  className='form-error'
                />
                {serverErrors.password && (
                  <span className='form-error server-error'>
                    {serverErrors.password}
                  </span>
                )}
              </div>

              <div className='register-form-group'>
                <Field 
                  name="confirmPassword" 
                  className={`form-field ${(errors.confirmPassword && touched.confirmPassword) || serverErrors.confirmPassword ? 'error-field' : ''}`}
                  placeholder="Confirme sua senha" 
                  type="password"
                />
                <ErrorMessage
                  component="span"
                  name="confirmPassword"
                  className='form-error'
                />
                {serverErrors.confirmPassword && (
                  <span className='form-error server-error'>
                    {serverErrors.confirmPassword}
                  </span>
                )}
              </div>
              
              <button className='button' type='submit' disabled={isSubmitting}>
                {isSubmitting ? 'Cadastrando...' : 'Cadastrar'}
              </button>
            </Form>
          )}
        </Formik>
        <div className="link-container">
          <Link to="/login" className="link">Já tem uma conta? Faça login</Link>
        </div>
      </div>
    </div>
  );
}

export default Register; 