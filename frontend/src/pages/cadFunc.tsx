import { Component } from "react";
import InputLinha from "../components/input";
import SelectLinha from "../components/selectLinha";
import InputMask from "../components/inputMask";

const url = import.meta.env.VITE_API_URL;
const tokenKey = 'jwtToken';

type op_nivelAcesso = {
    value: string
    label: string
    id?: number
}

interface PropsFunc {
    funcId?: number
}

interface StateFunc {
    nome: string
    telefone: string
    endereco: string
    usuario: string
    senha: string
    nivel: string
    resp: { message: string, type: 'success' | 'error' } | null
    opNivel: op_nivelAcesso[]
}

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
}

export default class CadFunc extends Component<PropsFunc, StateFunc> {
    constructor(props: PropsFunc) {
        super(props)
        this.state = {
            nome: "",
            telefone: "",
            endereco: "",
            usuario: "",
            senha: "",
            nivel: "",
            resp: null,
            opNivel: []
        }
        this.Enviar = this.Enviar.bind(this)
        this.PegaNivel = this.PegaNivel.bind(this)
    }

    componentDidMount(): void {
        this.PegaNivel();
        if (this.props.funcId) {
            this.pegaFunc();
        }
    }

    pegaFunc = async () => {
        const { funcId } = this.props;
        if (!url) {
            this.setState({ resp: { message: "Erro: URL da API não configurada.", type: 'error' } });
            return;
        }

        try {
            const response = await fetch(`${url}/funcionarios/${funcId}`, {
                headers: getAuthHeaders()
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: `Erro: ${response.status}` }));
                throw new Error(errorData.message || `Erro: ${response.status}`);
            }

            const func = await response.json()

            this.setState({
                nome: func.nome,
                telefone: func.telefone,
                endereco: func.endereco,
                usuario: func.usuario,
                // Nota: Geralmente não se retorna a senha do backend
                senha: '', // Limpar senha ou usar campo separado para edição de senha
                nivel: func.nivel,
                resp: null
            });
        } catch (error) {
            this.setState({ resp: { message: "Falha ao carregar dados do funcionário. " + (error as Error).message, type: 'error' } });
            console.error("Erro ao carregar funcionário:", error);
        }
    }

    componentDidUpdate(prevProps: PropsFunc) {
        if (this.props.funcId !== prevProps.funcId && this.props.funcId) {
            this.pegaFunc();
        }
    }


    async PegaNivel() {
        if (!url) return;

        try {
            // CORREÇÃO: Usando url e rota correta do backend
            const respost = await fetch(`${url}/nivelAcesso`, {
                headers: getAuthHeaders() // Inclui o Token JWT
            });

            if (!respost.ok) {
                const errorData = await respost.json().catch(() => ({ message: `Erro ao buscar níveis de acesso! Status: ${respost.status}` }));
                throw new Error(errorData.message || `Erro ao buscar níveis de acesso! Status: ${respost.status}`);
            }

            const dado: op_nivelAcesso[] = await respost.json()

            this.setState({
                opNivel: dado,
                nivel: dado.length > 0 ? dado[0].value : ""
            })
        } catch (error) {
            this.setState({
                resp: {
                    message: "Erro ao carregar níveis de acesso: " + (error as Error).message,
                    type: 'error'
                }
            });
        }
    }


    Inputs = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        this.setState((prevState) => ({
            ...prevState,
            [name as keyof StateFunc]: value
        }) as Pick<StateFunc, keyof StateFunc>)

        this.setState({ resp: null });
    }

    Cancelar = () => {
        this.setState({
            resp: null
        });
        this.pegaFunc();
    }

    async Enviar(e: React.FormEvent) {
        e.preventDefault();

        const { nome, telefone, endereco, usuario, senha, nivel } = this.state;
        const { funcId } = this.props

        if (!url) {
            this.setState({ resp: { message: "Erro: URL da API não configurada.", type: 'error' } });
            return;
        }


        const edicao = !!funcId;

        const edit_cad = edicao ? `${url}/funcionarios/${funcId}` : `${url}/funcionarios/cadastrar`;
        const metodo = edicao ? 'PUT' : 'POST';

        const novoFuncionario = {
            nome,
            telefone,
            endereco,
            usuario,
            // Incluir senha apenas se não for edição ou se o campo foi alterado
            senha: senha,
            nivelPermissao: nivel,
        };

        try {
            const response = await fetch(edit_cad, {
                method: metodo,
                headers: getAuthHeaders(),
                body: JSON.stringify(novoFuncionario)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: `Erro no ${edicao ? 'edição' : 'cadastro'}. Status: ${response.status}` }));
                throw new Error(errorData.message || `Erro no ${edicao ? 'edição' : 'cadastro'}. Status: ${response.status}`);
            }

            if (!edicao) {
                // Limpa e exibe sucesso no cadastro
                this.setState({
                    nome: "",
                    telefone: "",
                    endereco: "",
                    usuario: "",
                    senha: "",
                    nivel: this.state.opNivel.length > 0 ? this.state.opNivel[0].value : "",
                    resp: {
                        message: "Funcionário cadastrado com sucesso!",
                        type: 'success'
                    }
                });
            } else {
                // Exibe sucesso na edição
                this.setState({
                    senha: "", // Limpa o campo senha após edição
                    resp: {
                        message: "Funcionário atualizado com sucesso!",
                        type: 'success'
                    }
                });
            }

        } catch (error) {
            console.error('Falha no POST/PUT:', error);
            this.setState({
                resp: {
                    message: "Erro ao processar: " + (error as Error).message,
                    type: 'error'
                }
            });
        }
    }

    render() {
        const { nome, telefone, endereco, usuario, senha, nivel, resp, opNivel } = this.state;
        const edicao = !!this.props.funcId
        return (
            <>
                <section className="w-full h-full flex justify-center items-center overflow-y-auto md:overflow-hidden">
                    <section className="h-full p-3">
                        <h1 className="text-[#3a6ea5] font-medium text-2xl md:font-bold md:text-3xl lg:font-bold lg:text-4xl text-center mt-0">{`${!edicao ? 'Cadastrar Funcionário' : 'Editar Funcionário'} `}</h1>
                        {resp && (
                            <div className={`p-2 my-3 font-semibold ${resp.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                                {resp.message}
                            </div>
                        )}
                        <form onSubmit={this.Enviar} className="flex flex-col space-y-5 mt-3 md:mt-5 lg:mt-12">
                            <section className="space-y-5 md:flex md:flex-row md:space-x-10">
                                <InputLinha
                                    type="text"
                                    name="nome"
                                    value={nome}
                                    htmlfor="nome"
                                    placeholder=""
                                    required
                                    onChange={this.Inputs}
                                    classNameInput="w-full sm:w-[300px] md:w-[200px] lg:w-[300px]"
                                >
                                    Nome
                                </InputLinha>
                                <InputMask
                                    label="Telefone"
                                    name="telefone"
                                    value={telefone}
                                    htmlor="telefone"
                                    id="telefone"
                                    mask="(00) 00000-0000"
                                    placeholder=""
                                    required
                                    maxLength={15}
                                    onChange={this.Inputs}
                                    classNameInput="w-full sm:w-[300px] md:w-[200px] lg:w-[300px]"
                                />
                            </section>
                            <section className="space-y-5 md:flex md:flex-row md:space-x-10">
                                <InputLinha
                                    type="text"
                                    name="endereco"
                                    value={endereco}
                                    htmlfor="endereco"
                                    placeholder=""
                                    required
                                    onChange={this.Inputs}
                                    classNameInput="w-full sm:w-[300px] md:w-[200px] lg:w-[300px]"
                                >
                                    Endereço
                                </InputLinha>
                                <InputLinha
                                    type="text"
                                    name="usuario"
                                    value={usuario}
                                    htmlfor="usuario"
                                    placeholder=""
                                    onChange={this.Inputs}
                                    required
                                    classNameInput="w-full sm:w-[300px] md:w-[200px] lg:w-[300px]"
                                >
                                    Usuário
                                </InputLinha>
                            </section>
                            <section className="space-y-5 md:space-y-0 lg:space-y-5 md:flex md:flex-row md:space-x-10">
                                <InputLinha
                                    type="password"
                                    name="senha"
                                    value={senha}
                                    htmlfor="senha"
                                    placeholder=""
                                    required
                                    onChange={this.Inputs}
                                    classNameInput="w-full sm:w-[300px] md:w-[200px] lg:w-[300px]"
                                >
                                    Senha
                                </InputLinha>
                                <SelectLinha
                                    name="nivel"
                                    value={nivel}
                                    label="Nível de Acesso"
                                    opcoes={opNivel}
                                    onChange={this.Inputs}
                                    required
                                    classNameSelect="w-full sm:w-[300px] md:w-[200px] lg:w-[300px]"
                                />
                            </section>
                            <section className="col-span-2 flex flex-row-reverse justify-center gap-x-8 p-2 mt-5">
                                <button id="botao-cad" className="w-[40%] p-1 md:p-2 lg:p-3 bg-[#3a6ea5] rounded-[20px] text-white font-medium text-sm md:font-semibold md:text-lg cursor-pointer border-2 border-transparent transition duration-250 hover:bg-[#184e77] hover:border-[#3a6ea59b]">
                                    {`${edicao ? 'Alterar' : 'Salvar'}`}
                                </button>
                                {edicao && (
                                    <button
                                        type="button"
                                        onClick={this.Cancelar}
                                        className="w-[40%] p-1 md:p-2 lg:p-3 bg-[#3a6ea59b] rounded-[20px] text-white font-medium text-sm md:font-semibold md:text-lg cursor-pointer border-2 border-transparent transition duration-250 hover:bg-[#184e77] hover:border-[#3a6ea59b] focus:outline-none focus:ring-4 focus:ring-gray-400 focus:ring-offset-2"
                                    >
                                        Cancelar
                                    </button>
                                )}
                            </section>
                        </form>
                    </section>
                </section>
            </>
        )
    }
}