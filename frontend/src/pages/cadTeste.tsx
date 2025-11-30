import { Component } from "react";
import InputLinha from "../components/input";
import SelectLinha from "../components/selectLinha";

const url = import.meta.env.VITE_API_URL;

// type op_aeronave = {
//     modelo: string
//     tipo: string
//     capacidade: number
//     alcance: number
//     id?: number
// }

type op_func = {
    nome: string
    telefone: string
    endereco: string
    usuario: string
    senha: string
    nivelPermissao: string
    id?: number
}

type op = {
    value: string 
    label: string
    id?: number
}

interface PropsTeste { }

interface StateTeste {
    aeronave: string
    tipo: string
    resultado: string
    data: string
    observacao: string
    funcResp: string
    opAeronave: op[]
    opTeste: op[]
    opResult: op[]
    opFunc: op[]
    opAeronaves: { value: string, label: string, id?: number }[]
    aeronaveId: string
    resp: any
}



export default class CadTeste extends Component<PropsTeste, StateTeste> {
    constructor(props: PropsTeste) {
        super(props),
            this.state = {
                aeronave: "",
                tipo: "",
                resultado: "",
                data: "",
                observacao: "",
                funcResp: "",
                opAeronave: [],
                opTeste: [],
                opResult: [],
                opFunc: [],
                opAeronaves: [],
                aeronaveId: "",
                resp: null
            }
        this.Enviar = this.Enviar.bind(this)
        this.PegaTipoTeste = this.PegaTipoTeste.bind(this)
        // this.PegaAeronave = this.PegaAeronave.bind(this)
        this.PegaResultado = this.PegaResultado.bind(this)
        this.PegaFunc = this.PegaFunc.bind(this)
    }

    componentDidMount(): void {
        this.PegaTipoTeste()
        this.PegaAeronaves()
        this.PegaResultado()
        this.PegaFunc()
    }

    async PegaTipoTeste() {
        try {
            const res = await fetch(`${url}/tiposTeste`)

            if (!res.ok) {
                throw new Error(`Erro ao buscar os tipos de teste: ${res.status}`)
            }

            const dado_tipo: op[] = await res.json()
            this.setState({
                opTeste: dado_tipo,
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
                value: String(aero.codigo),
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


    async PegaResultado() {
        try {
            const res = await fetch(`${url}/tiposResultTeste`)

            if (!res.ok) {
                throw new Error(`Erro ao buscar os tipos de resultado dos teste: ${res.status}`)
            }

            const dado_tipo: op[] = await res.json()
            this.setState({
                opResult: dado_tipo,
                resultado: dado_tipo.length > 0 ? dado_tipo[0].value : ""
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
                value:String(func.id),
                label: `${func.nome} (${func.nivelPermissao})`,
                id: func.id
            }));

            this.setState({
                opFunc: opcoesFormatadas,
                funcResp: opcoesFormatadas.length > 0 ? opcoesFormatadas[0].value : ""
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
            [name as keyof StateTeste]: value
        }) as Pick<StateTeste, keyof StateTeste>)

        this.setState({ resp: null });
    }

    async Enviar(e: React.FormEvent) {
        e.preventDefault();
        const token = localStorage.getItem("token");

        const { aeronaveId, tipo, resultado, data, observacao, funcResp } = this.state;

        const novoTeste = {
            aeronaveId,
            tipo,
            resultado,
            data,
            observacao,
            funcionarioId: Number(funcResp)
        };

        try {
            console.log("Enviando para o backend:", novoTeste);

            const response = await fetch(`${url}/aeronaves/${aeronaveId}/testes`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(novoTeste)
            });

            if (!response.ok) {
                throw new Error(`Erro no cadastro! Status: ${response.status}`);
            }

            this.setState({
                aeronaveId: this.state.opAeronaves.length > 0 ? this.state.opAeronaves[0].value : "",
                tipo: this.state.opTeste[0]?.value || "",
                resultado: this.state.opResult[0]?.value || "",
                data: "",
                observacao: "",
                funcResp: this.state.opFunc[0]?.value || "",
                resp: {
                    message: "Funcionário cadastrado com sucesso!",
                    type: 'success'
                }
            });
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
        const { tipo, resultado, data, observacao, funcResp, opAeronaves, opFunc, opResult, opTeste, resp } = this.state
        return (
            <>
                <section className="w-full h-full flex justify-center items-center overflow-y-auto md:overflow-hidden">
                    <section className="h-full p-3">
                        <h1 className="text-[#3a6ea5] font-medium text-2xl md:font-bold md:text-3xl lg:font-bold lg:text-4xl text-center mt-0">Cadastro de Teste</h1>
                        {resp && (
                            <div className={`p-2 my-3 font-semibold ${resp.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                                {resp.message}
                            </div>
                        )}
                        <form onSubmit={this.Enviar} className="flex flex-col space-y-5 mt-3 md:mt-5 lg:mt-12">
                            <section className="space-y-5 md:flex md:flex-row md:space-x-10">
                                <SelectLinha
                                    name="aeronaveId"
                                    value={this.state.aeronaveId}
                                    label="Aeronave do Teste"
                                    opcoes={opAeronaves}
                                    onChange={this.Inputs}
                                    required                                    
                                    classNameSelect="w-full sm:w-[300px] md:w-[200px] lg:w-[300px] "
                                />
                                <SelectLinha
                                    name="tipo"
                                    value={tipo}
                                    label="Tipo de Teste"
                                    opcoes={opTeste}
                                    onChange={this.Inputs}
                                    required
                                    classNameSelect="w-full sm:w-[300px] md:w-[200px] lg:w-[300px] "
                                />
                            </section>
                            <section className="space-y-5 md:flex md:flex-row md:space-x-10">
                                <SelectLinha
                                    name="resultado"
                                    value={resultado}
                                    label="Ressultado do Teste"
                                    opcoes={opResult}
                                    onChange={this.Inputs}
                                    required
                                    classNameSelect="w-full sm:w-[300px] md:w-[200px] lg:w-[300px]"
                                />
                                <InputLinha
                                    type="datetime-local"
                                    value={data}
                                    name="data"
                                    htmlfor="dataTeste"
                                    placeholder=""
                                    onChange={this.Inputs}
                                    required
                                    classNameInput="w-full sm:w-[300px] md:w-[200px] lg:w-[300px]"
                                >
                                    data do Teste
                                </InputLinha>
                            </section>
                            <section className="space-y-5 md:space-y-0 lg:space-y-5 md:flex md:flex-row md:space-x-10">
                                <InputLinha
                                    type="text"
                                    name="observacao"
                                    value={observacao}
                                    htmlfor="observacao"
                                    placeholder=""
                                    onChange={this.Inputs}
                                    classNameInput="w-full sm:w-w-[300px] md:w-[200px] lg:w-[300px]"
                                >
                                    Observação
                                </InputLinha>
                                <SelectLinha
                                    name="funcResp"
                                    value={funcResp}
                                    label="Funcionario Responsável"
                                    opcoes={opFunc}
                                    onChange={this.Inputs}
                                    required
                                    classNameSelect="w-full sm:w-w-[300px] md:w-[200px] lg:w-[300px]"
                                />
                            </section>
                            <section className="col-span-2 flex justify-center p-2 mt-5">
                                <button id="botao-cad" className="w-[40%] p-1 md:p-2 lg:p-3 bg-[#3a6ea5] rounded-[20px] text-white font-medium text-sm md:font-semibold md:text-lg cursor-pointer border-2 border-transparent transition duration-250 hover:border-[#184e77]">
                                    Enviar
                                </button>
                            </section>
                        </form>
                    </section>
                </section>
            </>
        )
    }
}