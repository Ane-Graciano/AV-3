import { Request, Response, NextFunction } from 'express';

export function metricaMiddleware(req: Request, res: Response, next: NextFunction) {
    
    // Inicia a contagem do tempo de processamento
    const startProcessingTime = process.hrtime();

    // Sobrescreve o método 'send' para capturar o momento em que a resposta é enviada
    const originalSend = res.send.bind(res);
    res.send = (body) => {
        
        // Tempo de Processamento (Tempo gasto na lógica do servidor)
        const diff = process.hrtime(startProcessingTime);
        const processingTimeMs = (diff[0] * 1e3) + (diff[1] * 1e-6); // Convertido para milissegundos
        
        // 2. Calcula o Tempo de Resposta (Tempo total da requisição)
        // O Express pode já ter iniciado a contagem no momento da requisição (opcional, 
        // mas aqui usamos o tempo de processamento como parte da métrica)
        
        // --- LOG DAS MÉTRICAS ---
        // Você pode salvar estas métricas em um arquivo de log, banco de dados separado, ou
        // simplesmente imprimi-las para análise posterior (como requisitado na AV3)
        
        console.log(`[METRICS] ${req.method} ${req.originalUrl}`);
        console.log(`[METRICS] Tempo de Processamento: ${processingTimeMs.toFixed(3)} ms`);
        
        // O tempo de resposta final (cliente-servidor-cliente) é mais bem medido externamente,
        // mas este tempo de processamento é a maior parte da métrica de back-end.

        // Você pode adicionar um cabeçalho HTTP para expor o tempo
        res.set('X-Processing-Time', `${processingTimeMs.toFixed(3)}ms`);

        // Chama o método original 'send' para enviar a resposta ao cliente
        originalSend(body);
        return res; // Retorna res para manter a cadeia de métodos do Express
    };

    next();
}