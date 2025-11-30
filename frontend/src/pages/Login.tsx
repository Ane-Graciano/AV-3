import { Component } from "react";
import InputLinha from "../components/input";
import imgLogin from "../assets/imgLogin.png"

interface PropsLogin { }

interface StateLogin {
    usuario: string;
    senha: string;
    erro: string;
}

const url = import.meta.env.VITE_API_URL
const tokenKey = 'token'; 
const nivelKey = 'userNivelAcesso'

export default class Login extends Component<PropsLogin, StateLogin> {
    constructor(props: PropsLogin) {
        super(props);
        this.state = {
            usuario: '',
            senha: '',
            erro: '',
        }
        this.handleChange = this.handleChange.bind(this);
        this.Enviar = this.Enviar.bind(this);
    }

    handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        const { name, value } = e.target
        this.setState({ [name]: value } as Pick<StateLogin, 'usuario' | 'senha'>)
    }

    async Enviar(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()

        const { usuario, senha } = this.state
        const rotaHome = '/home';

        try {
            // 2. Faz uma requisição POST para o endpoint de autenticação
            const resp = await fetch(`${url}/funcionarios/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ usuario, senha }),
            });

            const data = await resp.json();

            // 3. Verifica o status da resposta (200 OK do backend)
            if (resp.ok) {
                this.setState({ erro: '' });

                // 4. Armazena o Token JWT e o Nível de Acesso
                localStorage.setItem(tokenKey, data.token);
                const nivelRecebido = data.nivelAcesso || data.nivelPermissao;

                if (nivelRecebido) {
                    localStorage.setItem(nivelKey, nivelRecebido);
                    window.location.href = rotaHome;
                } else {
                    throw new Error('Resposta do servidor incompleta: nível de acesso ausente.');
                }
            } else {
                // 5. Trata erros como 401 Unauthorized ou 400 Bad Request
                const mensagemErro = data.message || 'Usuário ou senha inválidos. Tente novamente.';
                this.setState({ erro: mensagemErro });
            }
        } catch (error) {
            console.error("Erro no login:", error);
            this.setState({ erro: 'Ocorreu um erro na conexão com o servidor. Verifique a API.' });
        }
    }

    render() {
        const { erro, usuario, senha } = this.state
        const bgImageStyle = {
            backgroundImage: `url("${imgLogin}")`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
        }
        return (
            <>
                <section style={window.innerWidth >= 768 ? bgImageStyle : {}} className="w-screen h-screen bg-gray-100" >
                    <section className="flex flex-col justify-center items-center h-full">
                        <form onSubmit={this.Enviar} className="sm:w-[60%] sm:h-[90%] sm:p-5 md:w-[50%] md:h-[80%] md:p-4 lg:w-[40%] lg:h-[70%] lg:p-3 flex flex-col justify-center items-center m-auto bg-transparent backdrop-blur rounded-4xl shadow-2xl">
                            <h1 className="text-[#135b78] sm:font-medium sm:text-xl md:font-semibold md:text-2xl lg:font-bold lg:text-3xl mb-8">Seja Bem Vindo ao Aerocode</h1>
                            <section className="rounded-4xl p-5 w-[70%] h-[60%] flex flex-col justify-center items-center space-y-4">
                                {erro && (
                                    <p className="text-red-600 text-sm font-semibold p-2 border border-red-300 bg-red-50 rounded w-full text-center">
                                        {erro}
                                    </p>
                                )}
                                <InputLinha
                                    type="text"
                                    name="usuario"
                                    placeholder=""
                                    onChange={this.handleChange}
                                    value={usuario}
                                    classNameInput="sm:w-[250px] md:w-[300px] lg:w-[400px]"
                                >
                                    Usuário
                                </InputLinha>
                                <InputLinha
                                    type="password"
                                    name="senha"
                                    placeholder=""
                                    onChange={this.handleChange}
                                    value={senha}
                                    classNameInput="sm:w-[250px] md:w-[300px] lg:w-[400px]"
                                >
                                    Senha
                                </InputLinha>
                                <button type="submit" className="w-full mt-[10%] p-3 bg-[#3a6ea5] rounded-[20px] text-white font-semibold text-lg cursor-pointer border-2 border-transparent transition duration-250 hover:border-[#184e77]">Entrar</button>
                            </section>
                        </form>
                    </section>
                </section>
            </>
        )
    }
}