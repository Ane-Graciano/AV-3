import { Component } from "react";
import InputLinha from "../components/input";
import SelectLinha from "../components/selectLinha";

const url = import.meta.env.VITE_API_URL;

type op_tipo = {
    value: string
    label: string
    id?: number
}

type op_status = {
    value: string
    label: string
    id?: number
}

interface PropsPeca {
    pecaId?: number
}

interface StatePeca {
    nome: string
    tipo: string
    fornecedor: string
    status: string
    opTipo: op_tipo[]
    opStatus: op_status[]
    opAeronaves: { value: string, label: string, id?: number }[]
    aeronaveId: string
    resp: any
}

export default class CadPeca extends Component<PropsPeca, StatePeca> {
    constructor(props: PropsPeca) {
        super(props),
            this.state = {
                nome: "",
                tipo: "",
                fornecedor: "",
                status: "",
                opTipo: [],
                opStatus: [],
                opAeronaves: [],
                aeronaveId: "",
                resp: null
            }
        this.Enviar = this.Enviar.bind(this)
        this.PegaStatus = this.PegaStatus.bind(this)
        this.PegaTipo = this.PegaTipo.bind(this)
        this.PegaPeca = this.PegaPeca.bind(this)
    }

    componentDidMount(): void {
        this.PegaStatus()
        this.PegaTipo()
        this.PegaPeca()
        this.PegaAeronaves()
        if (this.props.pecaId) {
            this.PegaPeca();
        }
    }

    async PegaAeronaves() {
        try {

            const token = localStorage.getItem("token");

            const res = await fetch(`${url}/aeronaves`, {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            if (!res.ok) throw new Error(`Erro ao buscar aeronaves: ${res.status}`);

            const dados: { id: number, codigo: string, modelo: string }[] = await res.json();
            const opcoes = dados.map(aero => ({
                value: String(aero.id),
                label: `${aero.codigo} - ${aero.modelo}`
            }));

            this.setState({
                opAeronaves: opcoes,
                aeronaveId: opcoes.length > 0 ? opcoes[0].value : ""
            });
        } catch (err) {
            this.setState({ resp: { message: "Erro ao carregar aeronaves: " + (err as Error).message, type: 'error' } });
        }
    }

    PegaPeca = async () => {
        const { pecaId } = this.props;
        try {
            const token = localStorage.getItem("token");

            const response = await fetch(`${url}/pecas/${pecaId}`, {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error(`Erro: ${response.status}`);
            }

            const p = await response.json()

            this.setState({
                nome: p.nome,
                tipo: p.tipo,
                fornecedor: p.fornecedor,
                status: p.status,
                resp: null
            });
            console.log('pecas:', p)

        } catch (error) {
            this.setState({ resp: "Falha ao carregar dados das peças, tente novamente mais tarde." });
            console.error("Erro ao carregar as peças:", error);
        }
    }

    componentDidUpdate(prevProps: PropsPeca) {
        if (this.props.pecaId !== prevProps.pecaId && this.props.pecaId) {
            this.PegaPeca();
        }
    }

    async PegaTipo() {
        try {
            const res = await fetch(`${url}/tiposPeca`)

            if (!res.ok) {
                throw new Error(`Erro ao buscar os tipos de peça: ${res.status}`)
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

    async PegaStatus() {
        try {
            const res = await fetch(`${url}/statusPeca`)
            const { pecaId } = this.props
            const edicao = !!pecaId;

            if (!res.ok) {
                throw new Error(`Erro ao buscar os status das peça: ${res.status}`)
            }

            const dado_status: op_status[] = await res.json()
            if (!edicao) {
                this.setState({
                    opStatus: dado_status,
                    status: "EM_PRODUCAO"
                })
            } else {
                this.setState({
                    opStatus: dado_status,
                    status: dado_status.length > 0 ? dado_status[0].value : ""
                })
            }

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
            [name as keyof StatePeca]: value
        }) as Pick<StatePeca, keyof StatePeca>)

        this.setState({ resp: null });
    }

    Cancelar = () => {
        this.setState({
            resp: null
        });
        this.PegaPeca();
    }

    async Enviar(e: React.FormEvent) {
        e.preventDefault();

        const token = localStorage.getItem("token");

        const { nome, tipo, fornecedor, status, aeronaveId } = this.state
        const { pecaId } = this.props

        const edicao = !!pecaId;
        const edit_cad = edicao ? `${url}/pecas/${pecaId}` : `${url}/aeronaves/${aeronaveId}/pecas`;
        const metodo = edicao ? 'PUT' : 'POST';

        const novaPeca = {
            nome,
            tipo,
            fornecedor,
            status,
            aeronaveId: aeronaveId
        };
        console.log("Body enviado:", novaPeca);

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
                throw new Error(`Erro no ${edicao ? 'edição' : 'cadastro'} Status: ${response.status}`)
            }

            if (!edicao) {
                this.setState({
                    nome: "",
                    tipo: this.state.opTipo.length > 0 ? this.state.opTipo[0].value : "",
                    fornecedor: "",
                    status: "EM_PRODUCAO",
                    aeronaveId: aeronaveId || "",
                    resp: {
                        message: "Funcionário cadastrado com sucesso!",
                        type: 'success'
                    }
                })
            } else {
                this.setState({
                    resp: {
                        message: "Etapa atualizado com sucesso!",
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
        const { nome, tipo, fornecedor, status, opTipo, opStatus, resp } = this.state
        const edicao = !!this.props.pecaId

        return (
            <>
                <section className="w-full h-full flex justify-center items-center">
                    <section className="w-full flex flex-col justify-center items-center p-5">
                        <h1 className="text-[#3a6ea5] mb-0 mt-2 font-medium text-2xl md:font-bold md:text-3xl lg:font-bold lg:text-4xl text-center">{`${!edicao ? 'Cadastrar Peça' : 'Editar Peça'} `}</h1>
                        {resp && (
                            <div className={`p-2 my-3 font-semibold ${resp.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                                {resp.message}
                            </div>
                        )}
                        <form onSubmit={this.Enviar} className="flex flex-col space-y-4 mt-0">
                            <InputLinha
                                type="text"
                                name="nome"
                                value={nome}
                                htmlfor="nome"
                                placeholder=""
                                onChange={this.Inputs}
                                required
                                classNameInput="w-full sm:w-[300px] md:w-[400px] lg:w-[500px]"
                            >
                                Nome
                            </InputLinha>
                            <SelectLinha
                                name="tipo"
                                value={tipo}
                                label="Tipo da Peça"
                                opcoes={opTipo}
                                onChange={this.Inputs}
                                required
                                classNameSelect="w-full sm:w-[300px] md:w-[400px] lg:w-[500px]"
                            />
                            <InputLinha
                                type="text"
                                value={fornecedor}
                                name="fornecedor"
                                htmlfor="fornecedor"
                                placeholder=""
                                onChange={this.Inputs}
                                required
                                classNameInput="w-full sm:w-[300px] md:w-[400px] lg:w-[500px]"
                            >
                                Fornecedor
                            </InputLinha>
                            <SelectLinha
                                name="status"
                                value={status}
                                label="Status da Peça"
                                onChange={this.Inputs}
                                opcoes={opStatus}
                                required
                                classNameSelect="w-full sm:w-[300px] md:w-[400px] lg:w-[500px]"
                                readonly={!edicao}
                            />
                            <SelectLinha
                                name="aeronaveId"
                                value={this.state.aeronaveId}
                                label="Selecione a Aeronave"
                                opcoes={this.state.opAeronaves}
                                onChange={this.Inputs}
                                required
                                classNameSelect="w-full sm:w-[300px] md:w-[400px] lg:w-[500px]"
                            />

                            <section className="col-span-2 flex flex-row-reverse justify-center gap-x-8 p-2 mt-3">
                                <button id="botao-cad" className="w-[40%] p-1 md:p-2 lg:p-3 bg-[#3a6ea5] rounded-[20px] text-white font-medium text-sm md:font-semibold md:text-lg cursor-pointer border-2 border-transparent transition duration-250 hover:border-[#184e77]">
                                    Enviar
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