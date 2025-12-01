import { Request, Response, NextFunction } from 'express';

export function metricaMiddleware(req: Request, res: Response, next: NextFunction) {
    
    const startProcessingTime = process.hrtime();

    const originalSend = res.send.bind(res);
    res.send = (body) => {
        
        const diff = process.hrtime(startProcessingTime);
        const processingTimeMs = (diff[0] * 1e3) + (diff[1] * 1e-6); 
        
        console.log(`[METRICS] ${req.method} ${req.originalUrl}`);
        console.log(`[METRICS] Tempo de Processamento: ${processingTimeMs.toFixed(3)} ms`);
        

        res.set('X-Processing-Time', `${processingTimeMs.toFixed(3)}ms`);

        originalSend(body);
        return res; 
    };

    next();
}