import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Container, Paper, Typography, Button, Divider } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const ComoJogar = () => {
  const navigate = useNavigate();
  return (
    <Box sx={{ paddingTop: '90px' }}>
      <Container maxWidth="md">
        <Paper elevation={3} sx={{ p: 4, backgroundColor: 'var(--background-light)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}>
          <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} sx={{ mb: 3 }}>
            Voltar
          </Button>
          <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ color: 'var(--primary-light)', mb: 2 }}>
            Tutorial Completo: Como Jogar o Quiz DesenvolveAí
          </Typography>

          <Divider sx={{ my: 2 }} />

          <Typography variant="h5" sx={{ mb: 1, color: 'var(--primary-color)' }}>1. Bem-vindo ao Quiz DesenvolveAí!</Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            O Quiz DesenvolveAí é um jogo de perguntas e respostas para testar e aprimorar seus conhecimentos em tecnologia, programação, lógica, web e outros temas. Você pode jogar para aprender, se divertir e competir com outros usuários. O sistema é atualizado frequentemente com novas perguntas!
          </Typography>

          <Typography variant="h5" sx={{ mb: 1, color: 'var(--primary-color)' }}>2. O que é o Quiz?</Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            O quiz é composto por uma sequência de perguntas de múltipla escolha. Cada pergunta tem 4 alternativas (A, B, C, D) e apenas uma resposta correta. O objetivo é acertar o máximo possível no menor tempo. As perguntas abrangem temas variados, como HTML, CSS, JavaScript, lógica de programação, banco de dados, entre outros.
          </Typography>

          <Typography variant="h5" sx={{ mb: 1, color: 'var(--primary-color)' }}>3. Como acessar e criar sua conta</Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Você pode jogar como <b>convidado</b> (sem cadastro) ou criar uma conta para salvar seu progresso e competir no ranking. Para criar uma conta, clique em <b>Registrar</b> na tela inicial e preencha seus dados. Usuários logados têm acesso ao histórico, ranking e podem recuperar a conta caso esqueçam a senha.
          </Typography>

          <Typography variant="h5" sx={{ mb: 1, color: 'var(--primary-color)' }}>4. Painel Principal (Dashboard)</Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Após login, você verá o painel principal com opções para:
            <ul style={{ marginTop: 8, marginBottom: 8 }}>
              <li><b>Começar Jogo:</b> Inicia uma nova partida de quiz.</li>
              <li><b>Histórico:</b> Veja todas as suas partidas anteriores, com detalhes de desempenho, data, pontuação e evolução.</li>
              <li><b>Ranking:</b> Compare sua pontuação com outros jogadores logados.</li>
              <li><b>Perfil:</b> Veja e edite seus dados de usuário.</li>
              <li><b>Tutorial:</b> Consulte este guia sempre que quiser.</li>
            </ul>
            Dica: O painel mostra seu nome ou email no topo, e um menu para acessar configurações e sair da conta.
          </Typography>

          <Typography variant="h5" sx={{ mb: 1, color: 'var(--primary-color)' }}>5. Como iniciar um jogo</Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Clique em <b>"Começar Jogo"</b>. Você será guiado para escolher a dificuldade e a quantidade de perguntas. O quiz é iniciado imediatamente após a escolha. Se estiver como convidado, lembre-se: seu progresso não será salvo!
          </Typography>

          <Typography variant="h5" sx={{ mb: 1, color: 'var(--primary-color)' }}>6. Escolhendo dificuldade e quantidade de perguntas</Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            <b>Dificuldade:</b> Escolha entre Fácil, Médio, Difícil ou Aleatório. Quanto maior a dificuldade, mais desafiadoras as perguntas.<br/>
            <b>Quantidade:</b> Selecione 10, 25, 50, 75 ou 100 perguntas por partida. Partidas mais longas podem render mais pontos, mas exigem mais atenção!
          </Typography>

          <Typography variant="h5" sx={{ mb: 1, color: 'var(--primary-color)' }}>7. Como funciona o quiz</Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            - Cada pergunta aparece com 4 alternativas.<br/>
            - Clique na alternativa desejada para responder.<br/>
            - Você tem um tempo limite para cada pergunta (fique atento ao cronômetro no topo da tela).<br/>
            - Não é possível voltar para perguntas anteriores.<br/>
            - Após responder, a próxima pergunta aparece automaticamente.<br/>
            <b>Exemplo:</b> <i>Qual é a extensão padrão de um arquivo HTML?</i><br/>A) .txt &nbsp; B) .html &nbsp; C) .web &nbsp; D) .page
          </Typography>

          <Typography variant="h5" sx={{ mb: 1, color: 'var(--primary-color)' }}>8. Pontuação: como funciona</Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            - Cada acerto vale pontos.<br/>
            - Responder rapidamente pode dar bônus de tempo.<br/>
            - Erros não descontam pontos, mas não pontuam.<br/>
            - O tempo total da partida pode influenciar sua posição no ranking.<br/>
            <b>Dica:</b> Tente responder corretamente e rapidamente para maximizar sua pontuação!
          </Typography>

          <Typography variant="h5" sx={{ mb: 1, color: 'var(--primary-color)' }}>9. Resultados e feedback</Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Após terminar o quiz, você verá:
            <ul style={{ marginTop: 8, marginBottom: 8 }}>
              <li><b>Total de acertos e erros:</b> Veja seu desempenho geral.</li>
              <li><b>Pontuação final:</b> Soma dos pontos obtidos.</li>
              <li><b>Tempo total gasto:</b> Quanto tempo levou para concluir o quiz.</li>
              <li><b>Detalhamento:</b> Quais perguntas você acertou ou errou, e as respostas corretas para aprendizado.</li>
            </ul>
            Use esse feedback para aprender e melhorar nas próximas partidas!
          </Typography>

          <Typography variant="h5" sx={{ mb: 1, color: 'var(--primary-color)' }}>10. Histórico de partidas</Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            No menu <b>Histórico</b>, veja todas as suas partidas anteriores, com detalhes de desempenho, data, pontuação, tempo e evolução. Você pode acompanhar seu progresso ao longo do tempo e identificar pontos a melhorar.
          </Typography>

          <Typography variant="h5" sx={{ mb: 1, color: 'var(--primary-color)' }}>11. Ranking: como subir e aparecer</Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            O ranking mostra os melhores jogadores do sistema. Para aparecer nele, jogue logado! Quanto mais acertos, partidas e rapidez, maior sua posição. O ranking é atualizado automaticamente após cada partida.
            <br/><b>Dica:</b> Tente jogar partidas com mais perguntas e dificuldade maior para subir mais rápido!
          </Typography>

          <Typography variant="h5" sx={{ mb: 1, color: 'var(--primary-color)' }}>12. Modo convidado vs. usuário logado</Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            <b>Convidado:</b> pode jogar normalmente, mas não salva histórico nem aparece no ranking. Ideal para testar o sistema ou jogar casualmente.<br/>
            <b>Logado:</b> salva progresso, histórico, compete no ranking e pode recuperar a conta. Recomendado para quem quer evoluir e competir!
          </Typography>

          <Typography variant="h5" sx={{ mb: 1, color: 'var(--primary-color)' }}>13. Dicas para se sair melhor</Typography>
          <ul style={{ fontSize: '1.1rem', marginBottom: 24 }}>
            <li>Leia cada pergunta com atenção antes de responder. Às vezes, detalhes fazem a diferença!</li>
            <li>Gerencie seu tempo: não fique preso em uma só questão, mas também não responda sem pensar.</li>
            <li>Pratique! Jogue várias vezes para aprender e melhorar. O sistema tem perguntas variadas.</li>
            <li>Confira o feedback ao final para aprender com os erros e revisar as respostas corretas.</li>
            <li>Jogue logado para guardar seu progresso, competir e aparecer no ranking.</li>
            <li>Se errar, não desanime! Use o erro como aprendizado para a próxima rodada.</li>
            <li>Experimente diferentes dificuldades e quantidades de perguntas para se desafiar.</li>
          </ul>

          <Typography variant="h5" sx={{ mb: 1, color: 'var(--primary-color)' }}>14. FAQ (Perguntas Frequentes)</Typography>
          <ul style={{ fontSize: '1.05rem', marginBottom: 24 }}>
            <li><b>Posso jogar sem criar conta?</b> Sim, mas seu progresso não será salvo e você não aparecerá no ranking.</li>
            <li><b>Como faço para aparecer no ranking?</b> Jogue logado e busque boas pontuações!</li>
            <li><b>O que acontece se eu fechar o quiz no meio?</b> A partida não será salva e não contará para o ranking.</li>
            <li><b>Posso jogar quantas vezes quiser?</b> Sim! Jogue à vontade para aprender e se divertir.</li>
            <li><b>Tem limite de tempo para responder?</b> Sim, cada pergunta tem um tempo limite. Fique atento ao cronômetro!</li>
            <li><b>O que é considerado uma resposta correta?</b> Apenas a alternativa exata marcada como correta pelo sistema.</li>
            <li><b>Posso revisar minhas respostas depois?</b> Sim, ao final do quiz você vê o detalhamento de cada pergunta.</li>
            <li><b>O sistema tem perguntas repetidas?</b> O banco de perguntas é grande, mas eventualmente pode haver repetições. Aproveite para fixar o conhecimento!</li>
          </ul>

          <Divider sx={{ my: 2 }} />
        </Paper>
      </Container>
    </Box>
  );
};

export default ComoJogar; 