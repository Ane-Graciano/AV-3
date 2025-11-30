// Chaves para o Local Storage
const nivelAcessoKey = 'userNivelAcesso';
const tokenKey = 'jwt_token'; // Chave para armazenar o Token JWT

// Define a interface para os cabeçalhos HTTP
interface AuthHeaders {
    'Authorization': string;
    'Content-Type': 'application/json';
}

/**
 * Retorna o nível de acesso do usuário.
 */
export const getNivelAcesso = (): string => {
    const nivel = localStorage.getItem(nivelAcessoKey);
    return nivel || ''; 
};

/**
 * Salva o token JWT e o nível de acesso no Local Storage após o login.
 */
export const setTokenAndNivel = (token: string, nivelAcesso: string): void => {
    localStorage.setItem(tokenKey, token);
    localStorage.setItem(nivelAcessoKey, nivelAcesso);
};


/**
 * Obtém os cabeçalhos necessários para requisições autenticadas (inclui o JWT).
 */
export const getAuthHeaders = (): AuthHeaders => {
    const token = localStorage.getItem(tokenKey);

    // Se o token existir, retorna o cabeçalho de Autorização Bearer
    if (token) {
        return {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        };
    } 
    
    // Se não houver token, retorna apenas o Content-Type (útil para rotas abertas)
    return {
        'Authorization': '', // Ou você pode redirecionar para o login aqui
        'Content-Type': 'application/json',
    };
};


/**
 * Remove o token e o nível, e redireciona para a tela de login.
 */
export const logout = () => {
    localStorage.removeItem(nivelAcessoKey);
    localStorage.removeItem(tokenKey); // Remove o token
    window.location.href = '/login'; 
};