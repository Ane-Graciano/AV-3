import { Component } from "react";
import InputLinha from "../components/input";
import SelectLinha from "../components/selectLinha";
import DropBox from "../components/dropBox";


const url = import.meta.env.VITE_API_URL;


type op = {
    value: string
    label: string
    id?: number
}

type op_func = {
    nome: string
    telefone: string
    endereco: string
    usuario: string
    senha: string
    nivel: string
    id?: number
}

type EtapaPayload = {
    nome: string;
    prazo: string;
    statusEtapa: string;
    funcSelecionado: string[];
    aeronaveId?: number | null; // Torna a propriedade conhecida, mas opcional
}

interface PropsEtapa {
    etapaId?: number
    aeronaveId?: number | null
    onCadastroSucesso?: () => void;
}

interface StateEtapa {
    nome: string
    prazo: string
    statusEtapa: string
    funcSelecionado: string[]
    opEtapa: op[]
    opFunc: op[]
    opAeronaves: { value: string, label: string, id?: number }[]
    aeronaveId: string
    resp: any
}

export default class CadEtapa extends Component<PropsEtapa, StateEtapa> {
    constructor(props: PropsEtapa) {
        super(props),
            this.state = {
                nome: "",
                prazo: "",
                statusEtapa: "",
                funcSelecionado: [],
                opEtapa: [],
                opFunc: [],
                opAeronaves: [],
                aeronaveId: "",
                resp: null
            }
        this.Enviar = this.Enviar.bind(this)
        this.handleFuncionarioChange = this.handleFuncionarioChange.bind(this)
        this.PegaStatus = this.PegaStatus.bind(this)
        this.PegaFunc = this.PegaFunc.bind(this)
        this.PegaAeronaves = this.PegaAeronaves.bind(this)
        this.carregarDadosIniciais = this.carregarDadosIniciais.bind(this)
    }

    componentDidMount(): void {
        this.carregarDadosIniciais();
    }

    async carregarDadosIniciais() {
        // Carrega todas as dependências (Status, Funcionários e Aeronaves) em paralelo
        await Promise.all([
            this.PegaStatus(),
            this.PegaFunc(),
            this.PegaAeronaves()
        ]);

        // Após o carregamento, se for modo de edição, tentamos pegar os dados
        if (this.props.etapaId) {
            this.pegaEtapa();
        } else {
            // Se for cadastro, define o status inicial
            this.setState({ statusEtapa: "PENDENTE" });
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

    pegaEtapa = async () => {
        const { etapaId } = this.props;
        const token = localStorage.getItem("token"); // Adicione a leitura do token aqui

        try {
            const response = await fetch(`${url}/etapas/${etapaId}`, {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error(`Erro: ${response.status}`);
            }

            const et = await response.json()

            const funcionariosIds = et.funcionarios.map((f: { nome: string }) => {
                const funcOp = this.state.opFunc.find(op => op.label === f.nome);
                return funcOp ? funcOp.value : '';
            }).filter((id: string) => id !== '');

            const aeronaveOp = this.state.opAeronaves.find(op => op.label.startsWith(et.aeronave));
            const aeronaveId = aeronaveOp ? aeronaveOp.value : '';


            this.setState({
                nome: et.nome,
                prazo: et.prazo,
                statusEtapa: et.statusEtapa,
                funcSelecionado: funcionariosIds,
                aeronaveId: aeronaveId,
                resp: null
            });
            console.log('Etapa carregada para edição:', et);
            console.log('IDs de Funcionários mapeados:', funcionariosIds);

        } catch (error) {
            this.setState({ resp: { message: "Falha ao carregar dados da etapa. Verifique a rota GET. " + (error as Error).message, type: 'error' } });
            console.error("Erro ao carregar a etapa:", error);
        }
    }

    componentDidUpdate(prevProps: PropsEtapa) {
        if (this.props.etapaId !== prevProps.etapaId && this.props.etapaId) {
            this.pegaEtapa();
        }
    }

    async PegaStatus() {
        try {
            const res = await fetch(`${url}/statusEtapa`)
            const { etapaId } = this.props
            const edicao = !!etapaId;

            if (!res.ok) {
                throw new Error(`Erro ao buscar os status das etapas: ${res.status}`)
            }

            const dado_tipo: op[] = await res.json()

            if (!edicao) {
                this.setState({
                    opEtapa: dado_tipo,
                    statusEtapa: "PENDENTE"
                })
            } else {
                this.setState({
                    opEtapa: dado_tipo,
                    statusEtapa: dado_tipo.length > 0 ? dado_tipo[0].value : ""
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

    async PegaFunc() {
        try {
            const token = localStorage.getItem("token");

            const res = await fetch(`${url}/funcionarios/`, {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            })

            if (!res.ok) {
                throw new Error(`Erro ao buscar os funcionários cadastrados: ${res.status}`)
            }

            const dado_bruto: op_func[] = await res.json()

            const opcoesFormatadas: op[] = dado_bruto.map(func => ({
                value: String(func.id),
                label: func.nome,
                id: func.id
            }))
            this.setState({
                opFunc: opcoesFormatadas,
                funcSelecionado: this.props.etapaId ? this.state.funcSelecionado : []
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

    handleFuncionarioChange(values: string[]) {
        this.setState({ funcSelecionado: values });
        console.log("Funcionários Selecionados:", values);
    }

    Inputs = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        this.setState((prevState) => ({
            ...prevState,
            [name as keyof StateEtapa]: value
        }) as Pick<StateEtapa, keyof StateEtapa>)

        this.setState({ resp: null });
    }

    Cancelar = () => {
        this.setState({
            resp: null
        });
        this.pegaEtapa();
    }

    async Enviar(e: React.FormEvent) {
        e.preventDefault();

        const token = localStorage.getItem("token");

        const { nome, prazo, statusEtapa, funcSelecionado, aeronaveId } = this.state;
        const { etapaId } = this.props;

        const edicao = !!etapaId;

        const urlReq = edicao
            ? `${url}/etapas/${etapaId}`
            : `${url}/aeronaves/${aeronaveId}/etapas`;

        const metodo = edicao ? "PUT" : "POST";

        const funcionariosIds = funcSelecionado
            .map(idStr => Number(idStr))
            .filter(idNum => !isNaN(idNum) && idNum > 0);

        const novaEtapa = {
            nome,
            prazo,
            statusEtapa: statusEtapa.toUpperCase(),
            funcionariosIds
        };


        console.log("Body enviado:", novaEtapa);

        try {
            const response = await fetch(urlReq, {
                method: metodo,
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(novaEtapa)
            });

            if (!response.ok) {
                throw new Error(`Erro ao enviar — status: ${response.status}`);
            }

            this.setState({
                resp: {
                    message: edicao
                        ? "Etapa atualizada com sucesso!"
                        : "Etapa cadastrada com sucesso!",
                    type: "success"
                }
            });

            if (!edicao) {
                this.setState({
                    nome: "",
                    prazo: "",
                    statusEtapa: "PENDENTE",
                    funcSelecionado: []
                });
            }

            if (this.props.onCadastroSucesso) {
                this.props.onCadastroSucesso();
            }

        } catch (error) {
            this.setState({
                resp: {
                    message: "Erro: " + (error as Error).message,
                    type: "error"
                }
            });
        }
    }


    render() {
        const { nome, prazo, statusEtapa, opEtapa, funcSelecionado, opFunc, resp } = this.state
        const edicao = !!this.props.etapaId

        return (
            <>
                <section className="w-full h-full flex justify-center items-center">
                    <section className="w-full flex flex-col justify-center items-center p-3">
                        <h1 className="text-[#3a6ea5] font-medium text-2xl md:font-bold md:text-3xl lg:font-bold lg:text-4xl text-center mb-[7%]">{`${!edicao ? 'Cadastrar Etapa' : 'Editar Etapa'} `}</h1>
                        {resp && (
                            <div className={`p-2 my-3 font-semibold ${resp.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                                {resp.message}
                            </div>
                        )}
                        <form onSubmit={this.Enviar} className="flex flex-col space-y-5">
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
                            <InputLinha
                                type="text"
                                name="prazo"
                                value={prazo}
                                htmlfor="prazo"
                                placeholder=""
                                onChange={this.Inputs}
                                required
                                classNameInput="w-full sm:w-[300px] md:w-[400px] lg:w-[500px]"
                            >
                                Prazo
                            </InputLinha>
                            <SelectLinha
                                name="statusEtapa"
                                value={statusEtapa}
                                label="Status da etapa"
                                opcoes={opEtapa}
                                onChange={this.Inputs}
                                required
                                classNameSelect="w-full sm:w-[300px] md:w-[400px] lg:w-[500px]"
                                readonly={!edicao}
                            />
                            <DropBox
                                name="Funcionarios"
                                value={funcSelecionado}
                                label="Funcionários Responsáveis"
                                opcoes={opFunc}
                                required
                                onChange={this.handleFuncionarioChange}
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
                            <section className="col-span-2 flex flex-row-reverse justify-center gap-x-8 p-2 mt-5">
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