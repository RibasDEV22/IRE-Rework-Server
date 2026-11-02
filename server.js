const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Configuração robusta de CORS para aceitar conexões da Unity (PC / Android)
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie', 'X-Requested-With', 'payload']
}));

// Captura payloads como Buffer cru (essencial para pacotes binários e criptografados da Unity)
app.use(express.raw({ type: '*/*', limit: '10mb' }));

// Middleware global de logs detalhados para investigação de pacotes
app.use((req, res, next) => {
    console.log(`\n[${new Date().toLocaleTimeString()}] ${req.method} -> ${req.url}`);
    console.log('Headers:', JSON.stringify(req.headers, null, 2));
    if (req.body && req.body.length > 0) {
        console.log(`Payload Recebido: ${req.body.length} bytes`);
    }
    next();
});

// ==========================================
// 1. ROTAS DE INFRAESTRUTURA E VERSÃO (2.5.1)
// ==========================================

// Rota para atender a checagem dinâmica de versão do cliente
app.get('/svr_info/Android/:versionFile', (req, res) => {
    const requestedFile = req.params.versionFile;
    console.log(`[Versão] Cliente solicitou arquivo de versão: ${requestedFile}`);
    
    // Força o aceite da versão 2.5.1 informando que o cliente está atualizado
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.send("STATUS=OK\nVERSION=2.5.1\nMAINTENANCE=0\nURL=http://localhost:" + PORT + "/game/proxy");
});

// Rota genérica de checagem de servidores globais (PVP / Proxy list)
app.get('/game/pvp_list', (req, res) => {
    res.json({
        status: "success",
        servers: [
            { region: "local", ip: "127.0.0.1", port: PORT, status: "online" }
        ]
    });
});

// ==========================================
// 2. ENDPOINT DE PROXY / COMUNICAÇÃO DE JOGO
// ==========================================

app.post('/game/proxy', (req, res) => {
    try {
        console.log('[Proxy] Processando pacote POST do jogo...');
        
        // Se houver um payload em texto ou binário, podemos inspecionar
        let rawData = req.body;
        
        // Simulação de resposta bem-sucedida estruturada para o cliente (PurePacket / JSON / Binário)
        // Aqui você pode injetar respostas mockadas para login, inventário ou dados de save do jogador.
        
        res.setHeader('Content-Type', 'application/json');
        res.status(200).send(JSON.stringify({
            code: 200,
            message: "Success",
            data: {
                status: "active",
                version: "2.5.1",
                timestamp: Date.now()
            }
        }));
    } catch (error) {
        console.error('[Erro no Proxy]:', error.message);
        res.status(500).send(error.message);
    }
});

// Rota coringa GET para rotas de proxy caso o cliente faça requisições de teste
app.get('/game/proxy', (req, res) => {
    res.send("Server 2.5.1 Proxy Active and Running.");
});

// ==========================================
// 3. CDN LOCAL SIMULADA (Para assets e dados estáticos)
// ==========================================
app.use('/cdn', express.static('public_cdn'));

// Rota de Health Check para plataformas de hospedagem (Render / Heroku)
app.get('/', (req, res) => {
    res.send('Servidor Ire 2.5.1 Backend Online & Rodando Perfeitamente!');
});

// Inicialização do Servidor
app.listen(PORT, '0.0.0.0', () => {
    console.log(`==================================================`);
    console.log(` Servidor do Ire (v2.5.1) iniciado com sucesso!`);
    console.log(` Porta ativa: ${PORT}`);
    console.log(` Pronto para conexões locais e remotas.`);
    console.log(`==================================================`);
});
