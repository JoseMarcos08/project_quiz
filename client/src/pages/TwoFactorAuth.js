import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import emailjs from 'emailjs-com';
import './TwoFactorAuth.css';

function TwoFactorAuth() {
    const [code, setCode] = useState('');
    const [error, setError] = useState('');
    const [emailSent, setEmailSent] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const email = location.state?.email;
    const twoFactorCode = location.state?.code;
    const previewUrl = location.state?.previewUrl;

    useEffect(() => {
        // Envia o email apenas uma vez ao montar o componente
        if (email && twoFactorCode && !emailSent) {
            emailjs.send(
                'service_p9a7j9b',
                'template_5vdduhh',
                {
                    to_email: email,
                    code: twoFactorCode,
                    from_name: 'Quiz App',
                    time: new Date().toLocaleString('pt-BR')
                },
                '1VEv5r7t58sWHCp7V'
            ).then((result) => {
                setEmailSent(true);
                console.log('Email enviado!', result.text);
            }, (error) => {
                setEmailSent(false);
                console.error('Erro ao enviar email:', error.text);
            });
        }
    }, [email, twoFactorCode, emailSent]);

    if (!email) {
        navigate('/');
        return null;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const response = await axios.post('http://localhost:3001/verify-2fa', {
                email,
                code
            });

            if (response.data.status === "SUCCESS") {
                // Salvar informações do usuário no localStorage
                localStorage.setItem('user', JSON.stringify(response.data.user));
                localStorage.setItem('userEmail', response.data.user.email);
                localStorage.setItem('token', response.data.token);
                // Redirecionar com base no tipo de usuário
                if (response.data.user.isAdmin) {
                    navigate('/admin');
                } else {
                    navigate('/dashboard');
                }
            }
        } catch (error) {
            console.error('Erro na verificação:', error);
            setError(error.response?.data?.message || 'Erro ao verificar código');
        }
    };

    return (
        <div className="two-factor-container">
            <div className="two-factor-box">
                <h2>Autenticação de Dois Fatores</h2>
                <p>Digite o código de 6 dígitos enviado para seu email</p>
                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        placeholder="Digite o código"
                        maxLength="6"
                        required
                    />
                    {error && <p className="error-message">{error}</p>}
                    <button type="submit">Verificar</button>
                </form>
            </div>
        </div>
    );
}

export default TwoFactorAuth; 