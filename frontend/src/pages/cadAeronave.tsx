import { Component } from "react";
import InputLinha from "../components/input";
import SelectLinha from "../components/selectLinha";

const url = import.meta.env.VITE_API_URL;

type op_tipo = {
    value: string
    label: string
    id?: number
}


interface PropsAero {
    aeronaveId?: number
}

interface StateAero {
    codigo: string
    modelo: string
    tipo: string
    capacidade: string
    alcance: string
    opTipo: op_tipo[]
    resp: { message: string, type: 'success' | 'error' } | null
}


export default class CadAeronave extends Component<PropsAero, StateAero> {
    constructor(props: PropsAero) {
        super(props),
            this.state = {
                codigo: "",
                modelo: "",
                tipo: "",
                capacidade: "",
                alcance: "",
                opTipo: [],
                resp: null
            }
        this.Enviar = this.Enviar.bind(this)
        this.PegaTipo = this.PegaTipo.bind(this)
        this.PegaAeronave = this.PegaAeronave.bind(this)
    }

    componentDidMount(): void {
        this.PegaTipo()
        if (this.props.aeronaveId) {
            this.PegaAeronave();
        }
    }

    PegaAeronave = async () => {
        const { aeronaveId } = this.props;

        if (!url) {
            this.setState({ resp: { message: "Erro: URL da API não configurada.", type: 'error' } });
            return;
        }
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`${url}/aeronaves/id/${aeronaveId}`, {
                headers: { "Authorization": `Bearer ${token}` }
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: `Erro: ${response.status}` }));
                throw new Error(errorData.message || `Erro: ${response.status}`);
            }

            const aero = await response.json()

            this.setState({
                codigo: aero.codigo,
                modelo: aero.modelo,
                tipo: aero.tipo,
                capacidade: aero.capacidade,
                alcance: aero.alcance,
                resp: null
            });
            console.log('Aeronaves:', aero)

        } catch (error) {
            this.setState({ resp: { message: "Falha ao carregar dados das aeronaves. " + (error as Error).message, type: 'error' } });
            console.error("Erro ao carregar as aeronaves:", error);
        }
    }

    componentDidUpdate(prevProps: PropsAero) {
        if (this.props.aeronaveId !== prevProps.aeronaveId && this.props.aeronaveId) {
            this.PegaAeronave();
        }
    }


    async PegaTipo() {
        if (!url) return

        try {
            const res = await fetch(`${url}/tipoAeronave`)

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({ message: `Erro ao buscar tipos: ${res.status}` }));
                throw new Error(errorData.message || `Erro ao buscar os tipos de aeronave: ${res.status}`)
            }

            const dado_tipo: op_tipo[] = await res.json()
            this.setState({
                opTipo: dado_tipo,
                tipo: dado_tipo.length > 0 ? dado_tipo[0].value : ""
            })
        } catch (err) {
            this.setState({
                resp: {
                    message: "Erro ao buscar: " + (err as Error).message,
                    type: 'error'
                }
            });
        }
    }

    Inputs = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        this.setState((prevState) => ({
            ...prevState,
            [name as keyof StateAero]: value
        }) as Pick<StateAero, keyof StateAero>)

        this.setState({ resp: null });
    }

    Cancelar = () => {
        this.setState({
            resp: null
        });
        this.PegaAeronave();
    }

    async Enviar(e: React.FormEvent) {
        e.preventDefault();

        const token = localStorage.getItem("token");

        if (!token) {
            this.setState({ resp: { message: "Erro: Token não encontrado. Faça login novamente.", type: 'error' } });
            return;
        }

        const { codigo, modelo, tipo, capacidade, alcance } = this.state
        const { aeronaveId } = this.props

        if (!url) {
            this.setState({ resp: { message: "Erro: URL da API não configurada.", type: 'error' } });
            return;
        }

        const edicao = !!aeronaveId;
        const edit_cad = edicao ? `${url}/aeronaves/id/${aeronaveId}` : `${url}/aeronaves/cadastrar`;
        const metodo = edicao ? 'PATCH' : 'POST';


        const novaPeca = {
            codigo,
            modelo,
            tipo,
            capacidade,
            alcance
        };

        try {
            const response = await fetch(edit_cad, {
                method: metodo,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(novaPeca)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: `Erro no ${edicao ? 'edição' : 'cadastro'} Status: ${response.status}` }));
                throw new Error(errorData.message || `Erro no ${edicao ? 'edição' : 'cadastro'} Status: ${response.status}`)
            }

            if (!edicao) {
                this.setState({
                    codigo: "",
                    modelo: "",
                    tipo: this.state.opTipo.length > 0 ? this.state.opTipo[0].value : "",
                    capacidade: "",
                    alcance: "",
                    resp: {
                        message: "Aeronave cadastrado com sucesso!",
                        type: 'success'
                    }
                })
            } else {
                this.setState({
                    resp: {
                        message: "Aeronave atualizado com sucesso!",
                        type: 'success'
                    }
                })
            }

        } catch (error) {
            console.error('Falha no POST:', error);
            this.setState({
                resp: {
                    message: "Erro ao cadastrar: " + (error as Error).message,
                    type: 'error'
                }
            });
        }
    }

    render() {
        const { codigo, modelo, tipo, alcance, capacidade, opTipo, resp } = this.state
        const edicao = !!this.props.aeronaveId

        return (
            <>
                <section className="w-full h-full flex justify-center items-center">
                    <section className="w-full flex flex-col justify-center items-center p-3">
                        <h1 className="text-[#3a6ea5] font-medium text-2xl md:font-bold md:text-3xl lg:font-bold lg:text-4xl text-center mb-[7%]">{`${!edicao ? 'Cadastrar Aeronave' : 'Edição'} `}</h1>
                        {resp && (
                            <div className={`p-2 my-3 font-semibold ${resp.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                                {resp.message}
                            </div>
                        )}
                        <form onSubmit={this.Enviar} className="flex flex-col space-y-5">
                            <InputLinha
                                type="text"
                                name="codigo"
                                value={codigo}
                                htmlfor="codigo"
                                placeholder=""
                                onChange={this.Inputs}
                                required
                                classNameInput="w-full sm:w-[300px] md:w-[400px] lg:w-[500px]"
                            >
                                Código
                            </InputLinha>
                            <InputLinha
                                type="text"
                                name="modelo"
                                value={modelo}
                                htmlfor="modelo"
                                placeholder=""
                                onChange={this.Inputs}
                                required
                                classNameInput="w-full sm:w-[300px] md:w-[400px] lg:w-[500px]"
                            >
                                Modelo
                            </InputLinha>
                            <SelectLinha
                                name="tipo"
                                value={tipo}
                                label="Tipo de Aeronave"
                                opcoes={opTipo}
                                onChange={this.Inputs}
                                required
                                classNameSelect="w-full sm:w-[300px] md:w-[400px] lg:w-[500px]"
                            />
                            <InputLinha
                                type="number"
                                name="alcance"
                                value={alcance}
                                htmlfor="alcance"
                                placeholder=""
                                onChange={this.Inputs}
                                required
                                classNameInput="w-full sm:w-[300px] md:w-[400px] lg:w-[500px]"
                            >
                                Alcance
                            </InputLinha>
                            <InputLinha
                                type="number"
                                name="capacidade"
                                value={capacidade}
                                htmlfor="capacidade"
                                placeholder=""
                                onChange={this.Inputs}
                                required
                                classNameInput="w-full sm:w-[300px] md:w-[400px] lg:w-[500px]"
                            >
                                Capacidade
                            </InputLinha>
                            <section className="col-span-2 flex flex-row-reverse justify-center gap-x-8 p-2 mt-5">
                                <button id="botao-cad" className="w-[40%] p-1 md:p-2 lg:p-3 bg-[#3a6ea5] rounded-[20px] text-white font-medium md:font-semibold text-sm md:text-lg cursor-pointer border-2 border-transparent transition duration-250 hover:border-[#184e77]">
                                    Enviar
                                </button>
                                {edicao && (
                                    <button
                                        type="button"
                                        onClick={this.Cancelar}
                                        className="w-[40%] p-1 md:p-2 lg:p-3 bg-[#3a6ea59b] rounded-[20px] text-white font-medium md:font-semibold text-sm md:text-lg cursor-pointer border-2 border-transparent transition duration-250 hover:bg-[#184e77] hover:border-[#3a6ea59b] focus:outline-none focus:ring-4 focus:ring-gray-400 focus:ring-offset-2"
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