const express = require("express")
const app = express()
const mysql = require("mysql2")
const cors = require("cors")
const bcrypt = require("bcrypt")
const nodemailer = require("nodemailer")
const crypto = require("crypto")
const emailjs = require('@emailjs/nodejs')
const saltRounds = 10;
const jwt = require('jsonwebtoken');
const JWT_SECRET = 'SUA_CHAVE_SECRETA_FORTE_AQUI'; // Ideal: use variável de ambiente

// Armazenamento temporário dos códigos 2FA (em produção, use um banco de dados)
const twoFactorCodes = new Map();

// Função para gerar código 2FA
function generateTwoFactorCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// Função para enviar email com código 2FA
async function sendTwoFactorEmail(email, code) {
    console.log('Iniciando processo de envio de email...');
    console.log('Email de destino:', email);
    console.log('Código 2FA gerado:', code);

    try {
        const templateParams = {
            to_email: email,
            code: code,
            from_name: 'DesenvolveAí'
        };

        console.log('Enviando email com os seguintes parâmetros:', {
            serviceID: 'service_p9a7j9b',
            templateID: 'template_5vdduhh',
            templateParams: templateParams
        });

        // Verificar se o emailjs está configurado corretamente
        if (!emailjs) {
            throw new Error('EmailJS não está configurado corretamente');
        }

        console.log('Iniciando chamada ao EmailJS...');
        const result = await emailjs.send(
            'service_p9a7j9b',
            'template_5vdduhh',
            templateParams,
            {
                publicKey: '1VEv5r7t58sWHCp7V',
                privateKey: '3Ifl_ubOrb1fGt0sdQrh1'
            }
        );

        console.log('Email enviado com sucesso!');
        console.log('Result:', result);

        return {
            success: true,
            code: code,
            message: "Código de autenticação enviado com sucesso. Verifique seu email."
        };
    } catch (error) {
        console.error('Erro ao enviar email:', error);
        console.error('Detalhes do erro:', error);
        console.error('Stack trace:', error.stack);
        
        // Em caso de erro, vamos mostrar o código no console para desenvolvimento
        console.log('==========================================');
        console.log('CÓDIGO DE AUTENTICAÇÃO (MODO DESENVOLVIMENTO):');
        console.log(`Email: ${email}`);
        console.log(`Código: ${code}`);
        console.log('==========================================');
        return {
            success: true,
            code: code,
            message: "MODO DESENVOLVIMENTO: O código foi enviado para o administrador. Use o código mostrado na tela."
        };
    }
}

const db = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "Ze03061982123",
    database: "quiz_db",
})

// Testar conexão com o banco de dados
db.getConnection((err, connection) => {
    if (err) {
        console.error('Erro ao conectar ao banco de dados:', err);
    } else {
        console.log('Conectado ao banco de dados com sucesso!');
        
        // Adicionar coluna is_admin se não existir
        connection.query(`
            SELECT COUNT(*) as count 
            FROM information_schema.COLUMNS 
            WHERE TABLE_SCHEMA = 'quiz_db' 
            AND TABLE_NAME = 'usuarios' 
            AND COLUMN_NAME = 'is_admin'
        `, (err, result) => {
            if (err) {
                console.error('Erro ao verificar coluna is_admin:', err);
            } else if (result[0].count === 0) {
                // Adicionar coluna is_admin
                connection.query(`
                    ALTER TABLE usuarios 
                    ADD COLUMN is_admin BOOLEAN DEFAULT FALSE
                `, (err) => {
                    if (err) {
                        console.error('Erro ao adicionar coluna is_admin:', err);
                    } else {
                        console.log('Coluna is_admin adicionada com sucesso');
                        
                        // Definir usuário admin
                        connection.query(`
                            UPDATE usuarios 
                            SET is_admin = TRUE 
                            WHERE email = 'quiz.app0812@gmail.com'
                        `, (err) => {
                            if (err) {
                                console.error('Erro ao definir usuário admin:', err);
                            } else {
                                console.log('Usuário admin definido com sucesso');
                            }
                        });
                    }
                });
            }
        });
        
        connection.release();
    }
});

app.use(express.json())
app.use(cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}))
app.use(express.urlencoded({ extended: true })); // Para processar form-data

// Middleware para logar todas as solicitações
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    console.log('Headers:', req.headers);
    console.log('Body:', req.body);
    next();
});

// Função para validar email
const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

app.post("/register", (req, res) => {
    console.log('Recebida requisição de registro:', req.body);
    
    const email = req.body.email;
    const password = req.body.password;
    const confirmPassword = req.body.confirmPassword;

    // Validar se os campos necessários foram fornecidos
    if (!email || !password) {
        console.log('Campos obrigatórios faltando:', { email: !!email, password: !!password });
        return res.status(400).json({ msg: "Email e senha são obrigatórios" });
    }

    // Validar email
    if (!validateEmail(email)) {
        console.log('Email inválido:', email);
        return res.status(400).json({ msg: "Email inválido. Use um formato como usuario@dominio.com" });
    }

    // Validar senha
    if (password.length < 8) {
        console.log('Senha muito curta');
        return res.status(400).json({ msg: "A senha deve ter pelo menos 8 caracteres" });
    }

    // Verificar se as senhas coincidem (quando confirmPassword é fornecido)
    if (confirmPassword && password !== confirmPassword) {
        console.log('Senhas não coincidem');
        return res.status(400).json({ msg: "As senhas não coincidem" });
    }

    db.query("SELECT * FROM usuarios WHERE email = ?", [email], 
    (err, result) => {
        if(err) {
            console.error('Erro ao verificar email:', err);
            res.status(500).json({ msg: "Erro ao verificar email" });
            return;
        }
        if(result.length == 0) {
            bcrypt.hash(password, saltRounds, (erro, hash) => {
                if (erro) {
                    console.error('Erro ao gerar hash da senha:', erro);
                    res.status(500).json({ msg: "Erro ao processar senha" });
                    return;
                }
                db.query(
                    `INSERT INTO usuarios (email, password) VALUES (?, ?)`, 
                    [email, hash],
                    (err, response) => {
                        if(err) {
                            console.error('Erro ao inserir usuário:', err);
                            res.status(500).json({ msg: "Erro ao cadastrar usuário" });
                            return;
                        }
                        console.log('Usuário cadastrado com sucesso:', email);
                        res.json({msg: "Cadastrado com sucesso"});
                    }
                )
            })
        } else {
            console.log('Email já cadastrado:', email);
            res.status(400).json({msg: "Usuário já cadastrado"});
        }
    })
})

app.post("/login", async (req, res) => {
    const email = req.body.email
    const password = req.body.password

    // Validação de formato de e-mail
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
        return res.status(400).json({
            status: "ERROR",
            message: "Digite um email válido (exemplo: usuario@dominio.com)"
        });
    }

    console.log('Tentativa de login para o email:', email);

    try {
        const loginResult = await new Promise((resolve, reject) => {
            db.query("SELECT * FROM usuarios WHERE email = ?", [email], async (err, result) => {
                if(err) {
                    console.error('Erro na consulta ao banco de dados:', err);
                    reject(err);
                    return;
                }
                if(result.length > 0) {
                    bcrypt.compare(password, result[0].password, async (erro, result) => {
                        if(result) {
                            // Gerar código 2FA
                            const twoFactorCode = generateTwoFactorCode();
                            twoFactorCodes.set(email, {
                                code: twoFactorCode,
                                timestamp: Date.now()
                            });

                            // Enviar email com o código
                            console.log('Iniciando envio do código 2FA...');
                            const emailResult = await sendTwoFactorEmail(email, twoFactorCode);
                            
                            if (emailResult.success) {
                                console.log('Código 2FA gerado com sucesso para:', email);
                                resolve({
                                    status: "2FA_REQUIRED",
                                    message: emailResult.message,
                                    code: emailResult.code,
                                    previewUrl: emailResult.code
                                });
                            } else {
                                console.error('Falha ao gerar código 2FA');
                                reject(new Error('Erro ao gerar código de autenticação'));
                            }
                        } else {
                            console.log('Senha incorreta para o email:', email);
                            reject(new Error('A senha está incorreta'));
                        }
                    });
                } else {
                    console.log('Usuário não encontrado para o email:', email);
                    reject(new Error('Conta não encontrada'));
                }
            });
        });

        res.json(loginResult);
    } catch (error) {
        console.error('Erro no processo de login:', error);
        res.status(500).json({
            status: "ERROR",
            message: error.message || "Erro ao processar login"
        });
    }
});

// Middleware para proteger rotas com JWT
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Token não fornecido' });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: 'Token inválido' });
        req.user = user;
        next();
    });
}

// Middleware para permitir apenas administradores
function onlyAdmin(req, res, next) {
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).json({ message: 'Apenas administradores podem acessar esta funcionalidade.' });
  }
  next();
}

// Nova rota para verificar o código 2FA
app.post("/verify-2fa", (req, res) => {
    const { email, code } = req.body;
    const storedData = twoFactorCodes.get(email);
    if (!storedData) {
        return res.status(400).json({
            status: "ERROR",
            message: "Código de autenticação não encontrado"
        });
    }
    // Verificar se o código expirou (5 minutos)
    if (Date.now() - storedData.timestamp > 5 * 60 * 1000) {
        twoFactorCodes.delete(email);
        return res.status(400).json({
            status: "ERROR",
            message: "Código de autenticação expirado"
        });
    }
    if (code === storedData.code) {
        db.query("SELECT idusuarios as id, email, is_admin FROM usuarios WHERE email = ?", [email], (err, result) => {
            if (err) {
                console.error('Erro ao buscar usuário:', err);
                return res.status(500).json({
                    status: "ERROR",
                    message: "Erro ao buscar informações do usuário"
                });
            }
            if (result.length === 0) {
                return res.status(404).json({
                    status: "ERROR",
                    message: "Usuário não encontrado"
                });
            }
            twoFactorCodes.delete(email);
            // Gera o token JWT
            const userPayload = {
                id: result[0].id,
                email: result[0].email,
                isAdmin: result[0].is_admin === 1
            };
            const token = jwt.sign(userPayload, JWT_SECRET, { expiresIn: '2h' });
            res.json({
                status: "SUCCESS",
                message: "Autenticação concluída com sucesso",
                user: userPayload,
                token // <-- Envia o token para o frontend
            });
        });
    } else {
        res.status(401).json({
            status: "ERROR",
            message: "Código de autenticação inválido"
        });
    }
});

// Rota para obter as perguntas do quiz
app.get("/perguntas", (req, res) => {
    const dificuldade = req.query.dificuldade;
    const quantidade = parseInt(req.query.quantidade) || 10;
    
    console.log('Buscando perguntas:', { dificuldade, quantidade });
    
    // Primeiro, vamos verificar as categorias disponíveis
    const categoriasQuery = "SELECT DISTINCT categoria FROM perguntas";
    
    db.query(categoriasQuery, (err, categoriasResult) => {
        if (err) {
            console.error('Erro ao buscar categorias:', err);
            return res.status(500).json({ error: 'Erro ao buscar categorias de perguntas' });
        }
        
        const categorias = categoriasResult.map(row => row.categoria);
        console.log('Categorias disponíveis:', categorias);
        
        // Agora vamos contar quantas perguntas existem na dificuldade selecionada
        const countQuery = dificuldade === 'aleatorio' 
            ? "SELECT COUNT(*) as total FROM perguntas" 
            : "SELECT COUNT(*) as total FROM perguntas WHERE nivel_dificuldade = ?";
        
        const countParams = dificuldade === 'aleatorio' ? [] : [dificuldade];
        
        db.query(countQuery, countParams, (err, countResult) => {
            if (err) {
                console.error('Erro ao contar perguntas:', err);
                return res.status(500).json({ error: 'Erro ao contar perguntas' });
            }
            
            const totalPerguntas = countResult[0].total;
            console.log(`Total de perguntas disponíveis: ${totalPerguntas}`);
            
            if (totalPerguntas === 0) {
                return res.status(404).json({ error: 'Nenhuma pergunta encontrada para a dificuldade selecionada' });
            }
            
            // Se temos menos perguntas do que a quantidade solicitada, ajustamos
            const quantidadeAjustada = Math.min(quantidade, totalPerguntas);
            
            // Abordagem completamente nova para seleção aleatória
            // Vamos usar uma query que seleciona IDs aleatórios de forma mais eficiente
            let query;
            let params;
            
            if (dificuldade === 'aleatorio') {
                // Para modo aleatório, selecionamos IDs aleatórios de todas as perguntas
                query = `
                    SELECT p.* FROM perguntas p
                    JOIN (
                        SELECT id FROM (
                            SELECT id, RAND() as rand_val 
                            FROM perguntas
                        ) AS random_ids 
                        ORDER BY rand_val 
                        LIMIT ?
                    ) AS selected_ids ON p.id = selected_ids.id
                `;
                params = [quantidadeAjustada];
            } else {
                // Para dificuldades específicas, selecionamos IDs aleatórios da dificuldade
                query = `
                    SELECT p.* FROM perguntas p
                    JOIN (
                        SELECT id FROM (
                            SELECT id, RAND() as rand_val 
                            FROM perguntas 
                            WHERE nivel_dificuldade = ?
                        ) AS random_ids 
                        ORDER BY rand_val 
                        LIMIT ?
                    ) AS selected_ids ON p.id = selected_ids.id
                `;
                params = [dificuldade, quantidadeAjustada];
            }
            
            console.log('Executando query de seleção aleatória:', query);
            console.log('Parâmetros:', params);
            
            db.query(query, params, (err, perguntasResult) => {
                if (err) {
                    console.error('Erro ao buscar perguntas:', err);
                    return res.status(500).json({ error: 'Erro ao buscar perguntas' });
                }
                
                console.log(`Encontradas ${perguntasResult.length} perguntas`);
                
                // Verificar a distribuição de categorias nas perguntas selecionadas
                const categoriasSelecionadas = {};
                perguntasResult.forEach(pergunta => {
                    if (!categoriasSelecionadas[pergunta.categoria]) {
                        categoriasSelecionadas[pergunta.categoria] = 0;
                    }
                    categoriasSelecionadas[pergunta.categoria]++;
                });
                console.log('Distribuição de categorias nas perguntas selecionadas:', categoriasSelecionadas);
                
                // Embaralhar as alternativas para cada pergunta
                const perguntasEmbaralhadas = perguntasResult.map(pergunta => {
                    // Criar array com as alternativas
                    const alternativas = [
                        { letra: 'A', texto: pergunta.alternativa_a },
                        { letra: 'B', texto: pergunta.alternativa_b },
                        { letra: 'C', texto: pergunta.alternativa_c },
                        { letra: 'D', texto: pergunta.alternativa_d }
                    ];
                    
                    // Embaralhar as alternativas usando Fisher-Yates
                    for (let i = alternativas.length - 1; i > 0; i--) {
                        const j = Math.floor(Math.random() * (i + 1));
                        [alternativas[i], alternativas[j]] = [alternativas[j], alternativas[i]];
                    }
                    
                    // Atualizar a resposta correta com base no embaralhamento
                    const respostaOriginal = pergunta.resposta_correta;
                    const novaResposta = alternativas.findIndex(alt => alt.letra === respostaOriginal);
                    
                    // Retornar a pergunta com as alternativas embaralhadas
                    return {
                        ...pergunta,
                        alternativa_a: alternativas[0].texto,
                        alternativa_b: alternativas[1].texto,
                        alternativa_c: alternativas[2].texto,
                        alternativa_d: alternativas[3].texto,
                        resposta_correta: String.fromCharCode(65 + novaResposta) // Converte 0,1,2,3 para A,B,C,D
                    };
                });
                
                // Embaralhar a ordem das perguntas também
                for (let i = perguntasEmbaralhadas.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [perguntasEmbaralhadas[i], perguntasEmbaralhadas[j]] = [perguntasEmbaralhadas[j], perguntasEmbaralhadas[i]];
                }
                
                res.status(200).json(perguntasEmbaralhadas);
            });
        });
    });
});

app.post("/salvar-partida", (req, res) => {
    const {
        id_usuario,
        quantidade_perguntas,
        pontuacao,
        acertos,
        erros,
        tempo_total,
        dificuldade
    } = req.body;

    // Validar dados recebidos
    if (!id_usuario || !quantidade_perguntas || pontuacao === undefined) {
        return res.status(400).json({ message: "Dados incompletos" });
    }

    const query = `
        INSERT INTO partidas (
            id_usuario, 
            quantidade_perguntas, 
            pontuacao, 
            acertos, 
            erros, 
            tempo_total, 
            dificuldade
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
        id_usuario,
        quantidade_perguntas,
        pontuacao,
        acertos,
        erros,
        tempo_total,
        dificuldade
    ];

    db.query(query, values, (err, result) => {
        if(err) {
            console.error('Erro ao salvar partida:', err);
            res.status(500).json({ message: "Erro ao salvar partida", error: err });
        } else {
            res.status(200).json({ 
                message: "Partida salva com sucesso",
                id: result.insertId 
            });
        }
    });
});

// Rota para obter histórico de partidas do usuário
app.get("/partidas/:userId", (req, res) => {
    const userId = req.params.userId;

    db.query(
        `SELECT * FROM partidas 
         WHERE id_usuario = ? 
         ORDER BY data_partida DESC`,
        [userId],
        (err, result) => {
            if(err) {
                res.status(500).send(err);
            } else {
                res.status(200).send(result);
            }
        }
    );
});

app.get("/usuario-id", (req, res) => {
    const email = req.query.email;
    
    db.query(
        "SELECT idusuarios as id FROM usuarios WHERE email = ?",
        [email],
        (err, result) => {
            if(err) {
                res.status(500).send(err);
            } else if (result.length > 0) {
                res.status(200).send(result[0]);
            } else {
                res.status(404).send({ msg: "Usuário não encontrado" });
            }
        }
    );
});

// Rota para buscar usuário por email
app.get("/usuarios/buscar", (req, res) => {
    const email = req.query.email;
    
    db.query(
        "SELECT idusuarios as id, email FROM usuarios WHERE email = ?",
        [email],
        (err, result) => {
            if(err) {
                console.error('Erro na consulta:', err);
                res.status(500).send(err);
            } else if (result.length > 0) {
                res.status(200).json(result[0]);
            } else {
                res.status(404).json({ message: "Usuário não encontrado" });
            }
        }
    );
});

// Rota para buscar usuário por ID
app.get("/usuarios/:id", (req, res) => {
    const id = req.params.id;
    
    db.query(
        "SELECT idusuarios as id, email FROM usuarios WHERE idusuarios = ?",
        [id],
        (err, result) => {
            if(err) {
                console.error('Erro na consulta:', err);
                res.status(500).json({ message: "Erro ao buscar usuário" });
            } else if (result.length > 0) {
                res.status(200).json(result[0]);
            } else {
                res.status(404).json({ message: "Usuário não encontrado" });
            }
        }
    );
});

// Rota para obter o ranking global
app.get("/ranking", (req, res) => {
    console.log('Iniciando busca do ranking global...');
    
    // Parâmetros de consulta
    const tipoRanking = req.query.tipo || 'geral';
    const dificuldade = req.query.dificuldade;
    const quantidade = req.query.quantidade;
    
    console.log('Parâmetros de consulta:', { tipoRanking, dificuldade, quantidade });
    
    // Primeiro, verificar se há dados na tabela partidas
    db.query(
        `SELECT COUNT(*) as total FROM partidas`,
        (err, countResult) => {
            if(err) {
                console.error('Erro ao verificar dados da tabela partidas:', err);
                return res.status(500).json({ 
                    error: 'Erro ao verificar dados da tabela partidas',
                    details: err.message 
                });
            }
            
            if(countResult[0].total === 0) {
                console.log('Nenhuma partida encontrada na tabela');
                return res.status(200).json([]);
            }
   
            let query;
            let params = [];
            
            if (tipoRanking === 'geral') {
                // Ranking geral - soma das pontuações de todas as partidas
                query = `
                    SELECT 
                        u.idusuarios as id_usuario,
                        COALESCE(u.email, 'Usuário desconhecido') as nome_usuario,
                        SUM(p.pontuacao) as pontuacao_total,
                        SUM(p.acertos) as acertos_total,
                        SUM(p.erros) as erros_total,
                        COUNT(p.id) as total_partidas,
                        SUM(p.tempo_total) as tempo_total
                    FROM usuarios u
                    INNER JOIN partidas p ON u.idusuarios = p.id_usuario
                `;
                
                // Adicionar filtros se fornecidos
                let whereConditions = [];
                if (dificuldade && dificuldade !== 'todas') {
                    whereConditions.push('p.dificuldade = ?');
                    params.push(dificuldade);
                }
                
                if (quantidade && quantidade !== 'todas') {
                    whereConditions.push('p.quantidade_perguntas = ?');
                    params.push(parseInt(quantidade));
                }
                
                if (whereConditions.length > 0) {
                    query += ' WHERE ' + whereConditions.join(' AND ');
                }
                
                query += ` GROUP BY u.idusuarios, u.email
                          ORDER BY pontuacao_total DESC`;
            } else {
                // Ranking de melhor partida
                query = `
                    WITH RankedPartidas AS (
                        SELECT 
                            p.*,
                            ROW_NUMBER() OVER (
                                PARTITION BY p.id_usuario 
                                ORDER BY p.pontuacao DESC, p.data_partida DESC
                            ) as rn
                        FROM partidas p
                        WHERE 1=1
                `;
                
                // Adicionar filtros para a melhor partida
                if (dificuldade && dificuldade !== 'todas') {
                    query += ` AND p.dificuldade = ?`;
                    params.push(dificuldade);
                }
                
                if (quantidade && quantidade !== 'todas') {
                    query += ` AND p.quantidade_perguntas = ?`;
                    params.push(parseInt(quantidade));
                }
                
                query += `
                    )
                    SELECT 
                        rp.id,
                        rp.id_usuario,
                        rp.quantidade_perguntas,
                        rp.pontuacao,
                        rp.acertos,
                        rp.erros,
                        rp.tempo_total,
                        rp.dificuldade,
                        rp.data_partida,
                        COALESCE(u.email, 'Usuário desconhecido') as nome_usuario
                    FROM RankedPartidas rp
                    INNER JOIN usuarios u ON rp.id_usuario = u.idusuarios
                    WHERE rp.rn = 1
                    ORDER BY rp.pontuacao DESC, rp.data_partida DESC
                `;
            }
            
            // Limitar a 100 resultados
            query += ` LIMIT 100`;
            
            console.log('Executando query de ranking:', query);
            console.log('Parâmetros:', params);
            
            db.query(query, params, (err, result) => {
                if(err) {
                    console.error('Erro ao buscar ranking:', err);
                    return res.status(500).json({ 
                        error: 'Erro ao buscar ranking',
                        details: err.message 
                    });
                }
                
                if (!result) {
                    console.error('Nenhum resultado retornado da query');
                    return res.status(500).json({ 
                        error: 'Erro ao buscar ranking',
                        details: 'Nenhum resultado retornado da query' 
                    });
                }
                
                console.log('Ranking encontrado:', result.length, 'registros');
                
                // Garantir que todos os campos necessários estão presentes
                const dadosProcessados = result.map(r => {
                    if (tipoRanking === 'geral') {
                        return {
                            ...r,
                            id_usuario: r.id_usuario || 0,
                            nome_usuario: r.nome_usuario || 'Usuário desconhecido',
                            pontuacao_total: r.pontuacao_total || 0,
                            acertos_total: r.acertos_total || 0,
                            erros_total: r.erros_total || 0,
                            total_partidas: r.total_partidas || 0,
                            tempo_total: r.tempo_total || 0
                        };
                    } else {
                        return {
                            ...r,
                            id: r.id || 0,
                            id_usuario: r.id_usuario || 0,
                            nome_usuario: r.nome_usuario || 'Usuário desconhecido',
                            pontuacao: r.pontuacao || 0,
                            acertos: r.acertos || 0,
                            erros: r.erros || 0,
                            quantidade_perguntas: r.quantidade_perguntas || 0,
                            dificuldade: r.dificuldade || 'não especificada',
                            data_partida: r.data_partida || new Date(),
                            tempo_total: r.tempo_total || 0
                        };
                    }
                });
                
                res.status(200).json(dadosProcessados);
            });
        }
    );
});

// Rota de teste para verificar a estrutura da tabela usuarios
app.get("/teste-usuarios", (req, res) => {
    db.query(
        `DESCRIBE usuarios`,
        (err, result) => {
            if(err) {
                console.error('Erro ao verificar estrutura da tabela usuarios:', err);
                res.status(500).send(err);
            } else {
                console.log('Estrutura da tabela usuarios:', result);
                res.status(200).send(result);
            }
        }
    );
});

// Rota de teste para verificar se há dados na tabela partidas
app.get("/teste-partidas", (req, res) => {
    db.query(
        `SELECT COUNT(*) as total FROM partidas`,
        (err, result) => {
            if(err) {
                console.error('Erro ao verificar dados da tabela partidas:', err);
                res.status(500).send(err);
            } else {
                console.log('Total de partidas:', result[0].total);
                res.status(200).send(result);
            }
        }
    );
});

// Exemplo de rota protegida
app.get("/user/profile", authenticateToken, (req, res) => {
    const email = req.user.email;
    db.query("SELECT idusuarios as id, email FROM usuarios WHERE email = ?", [email], (err, result) => {
        if (err) {
            console.error('Erro ao buscar perfil:', err);
            return res.status(500).json({ message: "Erro ao buscar perfil" });
        }
        if (result.length > 0) {
            res.json({
                id: result[0].id,
                email: result[0].email,
                username: result[0].email.split('@')[0]
            });
        } else {
            res.status(404).json({ message: "Usuário não encontrado" });
        }
    });
});

// Rota para alterar a senha do usuário
app.post("/user/change-password", (req, res) => {
    console.log('Recebida solicitação de alteração de senha');
    const email = req.headers['user-email'];
    console.log('Email do usuário:', email);
    
    if (!email) {
        console.log('Email não fornecido');
        return res.status(401).json({ message: "Email do usuário não fornecido" });
    }

    const { currentPassword, newPassword } = req.body;
    console.log('Dados recebidos:', { currentPassword: currentPassword ? 'fornecido' : 'não fornecido', newPassword: newPassword ? 'fornecido' : 'não fornecido' });
    
    if (!currentPassword || !newPassword) {
        console.log('Dados incompletos');
        return res.status(400).json({ message: "Dados incompletos" });
    }

    // Primeiro, verificar a senha atual
    db.query("SELECT * FROM usuarios WHERE email = ?", [email], (err, result) => {
        if (err) {
            console.error('Erro ao buscar usuário:', err);
            return res.status(500).json({ message: "Erro ao verificar senha atual" });
        }
        if (result.length === 0) {
            console.log('Usuário não encontrado');
            return res.status(404).json({ message: "Usuário não encontrado" });
        }
        console.log('Usuário encontrado, verificando senha');

        bcrypt.compare(currentPassword, result[0].password, (erro, match) => {
            if (erro) {
                console.error('Erro ao comparar senhas:', erro);
                return res.status(500).json({ message: "Erro ao verificar senha" });
            }
            if (!match) {
                console.log('Senha atual incorreta');
                return res.status(400).json({ message: "Senha atual incorreta" });
            }
            console.log('Senha atual correta, gerando hash para nova senha');

            // Se a senha atual estiver correta, fazer o hash da nova senha
            bcrypt.hash(newPassword, saltRounds, (erro, hash) => {
                if (erro) {
                    console.error('Erro ao gerar hash da nova senha:', erro);
                    return res.status(500).json({ message: "Erro ao gerar nova senha" });
                }
                console.log('Hash gerado, atualizando senha no banco');

                // Atualizar a senha no banco
                db.query(
                    "UPDATE usuarios SET password = ? WHERE email = ?",
                    [hash, email],
                    (err, updateResult) => {
                        if (err) {
                            console.error('Erro ao atualizar senha:', err);
                            return res.status(500).json({ message: "Erro ao atualizar senha" });
                        }
                        console.log('Senha atualizada com sucesso');
                        res.json({ message: "Senha alterada com sucesso" });
                    }
                );
            });
        });
    });
});

// Rota para buscar estatísticas do usuário
app.get("/user/stats", (req, res) => {
    const email = req.headers['user-email'];
    if (!email) {
        return res.status(401).json({ message: "Email do usuário não fornecido" });
    }

    // Primeiro, buscar o ID do usuário
    db.query("SELECT id FROM usuarios WHERE email = ?", [email], (err, userResult) => {
        if (err) {
            console.error('Erro ao buscar usuário:', err);
            return res.status(500).json({ message: "Erro ao buscar estatísticas" });
        }
        if (userResult.length === 0) {
            return res.status(404).json({ message: "Usuário não encontrado" });
        }

        const userId = userResult[0].id;

        // Buscar estatísticas das partidas
        const query = `
            SELECT 
                COUNT(*) as totalGames,
                SUM(CASE WHEN pontuacao >= 7 THEN 1 ELSE 0 END) as victories,
                ROUND(AVG(pontuacao), 2) as averageScore
            FROM partidas 
            WHERE id_usuario = ?
        `;

        db.query(query, [userId], (err, statsResult) => {
            if (err) {
                console.error('Erro ao buscar estatísticas:', err);
                return res.status(500).json({ message: "Erro ao buscar estatísticas" });
            }

            res.json({
                totalGames: statsResult[0].totalGames || 0,
                victories: statsResult[0].victories || 0,
                averageScore: statsResult[0].averageScore || 0
            });
        });
    });
});

// Endpoint para login de convidado
app.post('/guest-login', (req, res) => {
  const guestPayload = {
    isGuest: true,
    guestId: 'guest_' + Date.now() + '_' + Math.floor(Math.random() * 10000)
  };
  const token = jwt.sign(guestPayload, JWT_SECRET, { expiresIn: '2h' });
  res.json({ token, user: guestPayload });
});

// Listar/buscar usuários (admin)
app.get('/admin/users', authenticateToken, onlyAdmin, (req, res) => {
  const search = req.query.search;
  let query = 'SELECT idusuarios as id, email FROM usuarios';
  let params = [];
  if (search) {
    if (!isNaN(Number(search))) {
      query += ' WHERE idusuarios = ?';
      params.push(Number(search));
    } else {
      query += ' WHERE email LIKE ?';
      params.push(`%${search}%`);
    }
  }
  db.query(query, params, (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Erro ao buscar usuários.' });
    }
    res.json(result);
  });
});

// Excluir usuário (admin)
app.delete('/admin/users/:id', authenticateToken, onlyAdmin, (req, res) => {
  const id = req.params.id;
  db.query('DELETE FROM usuarios WHERE idusuarios = ?', [id], (err, result) => {
    if (err) {
      if (err.errno === 1451) {
        return res.status(400).json({ message: 'Não é possível excluir usuário: existem partidas ou dados vinculados a este usuário.' });
      }
      return res.status(500).json({ message: 'Erro ao excluir usuário.' });
    }
    res.json({ message: 'Usuário excluído com sucesso.' });
  });
});

// Listar perguntas (admin)
app.get('/admin/questions', authenticateToken, onlyAdmin, (req, res) => {
  const search = req.query.search;
  let dificuldade = req.query.dificuldade;
  let query = 'SELECT id, enunciado, alternativa_a, alternativa_b, alternativa_c, alternativa_d, resposta_correta, nivel_dificuldade FROM perguntas';
  let conditions = [];
  let params = [];

  if (search) {
    if (!isNaN(Number(search))) {
      conditions.push('id = ?');
      params.push(Number(search));
    } else {
      conditions.push('enunciado LIKE ?');
      params.push(`%${search}%`);
    }
  }
  if (dificuldade) {
    // Aceita múltiplas dificuldades separadas por vírgula
    const difs = dificuldade.split(',').map(d => d.trim()).filter(Boolean);
    if (difs.length > 1) {
      conditions.push(`nivel_dificuldade IN (${difs.map(() => '?').join(',')})`);
      params.push(...difs);
    } else if (difs.length === 1) {
      conditions.push('nivel_dificuldade = ?');
      params.push(difs[0]);
    }
  }
  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }
  db.query(query, params, (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Erro ao buscar perguntas.' });
    }
    res.json(result);
  });
});

// Buscar pergunta específica (admin)
app.get('/admin/questions/:id', authenticateToken, onlyAdmin, (req, res) => {
  const id = req.params.id;
  db.query('SELECT id, enunciado, alternativa_a, alternativa_b, alternativa_c, alternativa_d, resposta_correta, nivel_dificuldade, categoria FROM perguntas WHERE id = ?', [id], (err, result) => {
    if (err) {
      return res.status(500).json({ msg: 'Erro ao buscar pergunta.' });
    }
    if (!result || result.length === 0) {
      return res.status(404).json({ msg: 'Pergunta não encontrada.' });
    }
    res.json(result[0]);
  });
});

// Atualizar pergunta (admin)
app.put('/admin/questions/:id', authenticateToken, onlyAdmin, (req, res) => {
  const id = req.params.id;
  const { enunciado, alternativa_a, alternativa_b, alternativa_c, alternativa_d, resposta_correta, nivel_dificuldade, categoria } = req.body;

  // Validar se todos os campos obrigatórios estão presentes
  if (!enunciado || !alternativa_a || !alternativa_b || !alternativa_c || !alternativa_d || !resposta_correta || !nivel_dificuldade || !categoria) {
    return res.status(400).json({ msg: "Todos os campos são obrigatórios." });
  }

  // Validar resposta_correta (deve ser A, B, C ou D)
  const respostasValidas = ['A', 'B', 'C', 'D'];
  if (!respostasValidas.includes(resposta_correta.toUpperCase())) {
    return res.status(400).json({ msg: "Resposta correta inválida. Deve ser A, B, C ou D." });
  }

  // Validar nivel_dificuldade (deve ser facil, medio ou dificil)
  const dificuldadesValidas = ['facil', 'medio', 'dificil', 'aleatorio'];
  if (!dificuldadesValidas.includes(nivel_dificuldade.toLowerCase())) {
    return res.status(400).json({ msg: "Nível de dificuldade inválido. Deve ser facil, medio, dificil ou aleatorio." });
  }

  const sql = `UPDATE perguntas SET enunciado = ?, alternativa_a = ?, alternativa_b = ?, alternativa_c = ?, alternativa_d = ?, resposta_correta = ?, nivel_dificuldade = ?, categoria = ? WHERE id = ?`;
  const values = [enunciado, alternativa_a, alternativa_b, alternativa_c, alternativa_d, resposta_correta.toUpperCase(), nivel_dificuldade.toLowerCase(), categoria, id];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error('Erro ao atualizar pergunta:', err);
      return res.status(500).json({ msg: "Erro ao atualizar pergunta." });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ msg: "Pergunta não encontrada." });
    }
    res.json({ msg: "Pergunta atualizada com sucesso!" });
  });
});

// Excluir pergunta (admin)
app.delete('/admin/questions/:id', authenticateToken, onlyAdmin, (req, res) => {
  const id = req.params.id;
  db.query('DELETE FROM perguntas WHERE id = ?', [id], (err, result) => {
    if (err) {
      if (err.errno === 1451) {
        return res.status(400).json({ message: 'Não é possível excluir pergunta: ela está vinculada a partidas ou outros dados.' });
      }
      return res.status(500).json({ message: 'Erro ao excluir pergunta.' });
    }
    res.json({ message: 'Pergunta excluída com sucesso.' });
  });
});

// Novo endpoint para adicionar perguntas
app.post("/add-question", authenticateToken, onlyAdmin, (req, res) => {
    console.log('Recebida requisição para adicionar pergunta:', req.body);

    const { enunciado, alternativa_a, alternativa_b, alternativa_c, alternativa_d, resposta_correta, nivel_dificuldade, categoria } = req.body;

    // Validar se todos os campos obrigatórios estão presentes
    if (!enunciado || !alternativa_a || !alternativa_b || !alternativa_c || !alternativa_d || !resposta_correta || !nivel_dificuldade || !categoria) {
        console.log('Campos obrigatórios faltando.');
        return res.status(400).json({ msg: "Todos os campos são obrigatórios." });
    }

    // Validar resposta_correta (deve ser A, B, C ou D)
    const respostasValidas = ['A', 'B', 'C', 'D'];
    if (!respostasValidas.includes(resposta_correta.toUpperCase())) {
        console.log('Resposta correta inválida:', resposta_correta);
        return res.status(400).json({ msg: "Resposta correta inválida. Deve ser A, B, C ou D." });
    }
    
    // Validar nivel_dificuldade (deve ser facil, medio ou dificil)
    const dificuldadesValidas = ['facil', 'medio', 'dificil'];
    if (!dificuldadesValidas.includes(nivel_dificuldade.toLowerCase())) {
         console.log('Nível de dificuldade inválido:', nivel_dificuldade);
         return res.status(400).json({ msg: "Nível de dificuldade inválido. Deve ser facil, medio ou dificil." });
    }

    const sql = `INSERT INTO perguntas (enunciado, alternativa_a, alternativa_b, alternativa_c, alternativa_d, resposta_correta, nivel_dificuldade, categoria) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    const values = [enunciado, alternativa_a, alternativa_b, alternativa_c, alternativa_d, resposta_correta.toUpperCase(), nivel_dificuldade.toLowerCase(), categoria];

    db.query(sql, values, (err, result) => {
        if (err) {
            console.error('Erro ao inserir pergunta no banco de dados:', err);
            res.status(500).json({ msg: "Erro ao adicionar pergunta." });
            return;
        }
        console.log('Pergunta adicionada com sucesso:', result);
        res.status(201).json({ msg: "Pergunta adicionada com sucesso!", questionId: result.insertId });
    });
});

app.listen(3001, () => {
    console.log("rodando na porta 3001");
});
