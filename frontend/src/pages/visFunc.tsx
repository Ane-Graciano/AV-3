import { Component } from "react";
import Tabela, { type Coluna } from "../components/tabela";
import BarraPesquisa from "../components/barraPesquisa";
import NavBar from "../components/navbar";
import CadFunc from "./cadFunc";
import Modal from "../components/modal";
import { getNivelAcesso, getAuthHeaders } from "../utils/autenticacao";


const url = "http://localhost:3000/api"

type funcionarios = {
    nome: string
    telefone: string
    endereco: string
    usuario: string
    nivel: string
    id: number
}


interface PropsTeste { }

interface StateTeste {
    func: funcionarios[]
    pesquisa: string
    erro: string | null
    modalAberto: boolean
    conteudoModal: React.ReactNode
    nivelAcesso: string
}

export default class VisFunc extends Component<PropsTeste, StateTeste> {
    private readonly colunasFuncionarios: Coluna[] = [
        { header: "Nome Completo", accessor: "nome" },
        { header: "Telefone", accessor: "telefone" },
        { header: "Endereco", accessor: "endereco" },
        { header: "Usuario", accessor: "usuario" },
       { header: "Nível de Acesso", accessor: "nivelPermissao" },
        { header: "Editar", accessor: "editar" }
    ];

    constructor(props: PropsTeste) {
        super(props),
            this.state = {
                func: [],
                pesquisa: "",
                erro: null,
                modalAberto: false,
                conteudoModal: null,
                nivelAcesso: getNivelAcesso()
            }
        this.PegaFunc = this.PegaFunc.bind(this)
        this.HandlePesquisa = this.HandlePesquisa.bind(this)
        this.abreCadFunc = this.abreCadFunc.bind(this)
        this.abreEditaFunc = this.abreEditaFunc.bind(this)
    }
    componentDidMount(): void {
        this.PegaFunc()
        this.setState({ nivelAcesso: getNivelAcesso() })
    }

    abreCadFunc(e: React.MouseEvent) {
        e.preventDefault()
        this.setState({
            conteudoModal: <CadFunc />,
            modalAberto: true
        })
    }

    abreEditaFunc(funcParaEditar: funcionarios) {
        this.setState({
            conteudoModal: (
                <CadFunc funcId={funcParaEditar.id} />
            ),
            modalAberto: true
        })
    }

    async PegaFunc() {
        this.setState({ erro: null })
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

            const dados_func: funcionarios[] = await res.json()
            this.setState({
                func: dados_func
            })
        } catch (err) {
            this.setState({
                erro: "Falha ao carregar os dados dos funcionários. " + (err as Error).message,
            });
        }
    }

    HandlePesquisa(texto: string) {
        this.setState({ pesquisa: texto })
    }

    pegaFuncFiltrado(): funcionarios[] {
        const { func, pesquisa } = this.state;

        if (!pesquisa) {
            return func;
        }

        const pesqMinusculo = pesquisa.toLowerCase();

        return func.filter(f => {
            return (
                f.nome.toLowerCase().includes(pesqMinusculo) ||
                f.usuario.toLowerCase().includes(pesqMinusculo) ||
                f.nivel.toLowerCase().includes(pesqMinusculo)
            );
        });
    }

    FormataDadosEtapas() {
        const dados = this.pegaFuncFiltrado();
        const { nivelAcesso } = this.state
        const podeModificar = nivelAcesso === 'ADMINISTRADOR'

        return dados.map(f => {
            let colunaEditar
            if(podeModificar){
                colunaEditar = (
                    <button
                        onClick={() => this.abreEditaFunc(f)}
                        className="p-2 bg-[#3a6ea5] text-white rounded text-xs hover:bg-blue-600 transition"
                    >
                        Editar
                    </button>
                )
            }else {
                colunaEditar = <span className="text-gray-500 text-xs">N/A</span>
            }
            
            return {
                ...f,
                editar: colunaEditar
            }
        });
    }

    render() {
        const { func, erro, modalAberto, conteudoModal, nivelAcesso } = this.state
        const dadosFiltrados = this.FormataDadosEtapas();
        const podeModificar = nivelAcesso === 'ADMINISTRADOR' 
        return (
            <>
                <section className="w-screen h-screen grid grid-cols-[5%_95%] overflow-x-hidden">
                    <section>
                        {window.location.pathname !== '/login' && (
                            <NavBar nivel={nivelAcesso} />
                        )}
                    </section>
                    <section className="">
                        <section className="mt-[15%] ml-[5%] mb-[10%] sm:mt[5%] sm:mb-[4%] md:mt-[5%] md:mb-[5%] lg:mt-[2%] lg:mb-[5%]">
                            <BarraPesquisa
                                onPesquisa={this.HandlePesquisa}
                                placeholder="Buscar por nome, usuário ou nível"
                            />
                        </section>
                        <section className="flex justify-between w-[90%] m-auto mt-[3%]">
                            <h1 className="text-black font-medium text-2xl md:font-bold md:text-3xl lg:font-bold lg:text-4xl font-nunito">Funcionários</h1>
                            {podeModificar && (
                                <button className="bg-[#3a6ea5] text-white font-nunito font-semibold text-sm md:text-lg  p-1 md:p-2 lg:p-2 rounded-3xl pl-10 pr-10 md:pl-14 md:pr-14 lg:pl-14 lg:pr-14 border-2 border-[#24679a] cursor-pointer hover:border-[#184e77]" onClick={this.abreCadFunc}>+ Funcionário</button>
                            )}
                        </section>
                        {erro && (
                            <div className="p-3 bg-red-100 text-red-700 border border-red-400 rounded">
                                Erro: {erro}
                            </div>
                        )}
                        {!erro && func.length > 0 && (
                            <section className="w-[90%] m-auto mt-[3%] mb-[5%]">
                                <Tabela
                                    dados={dadosFiltrados}
                                    colunas={this.colunasFuncionarios}>

                                </Tabela>
                            </section>
                        )}
                    </section>
                </section>
                <Modal aberto={modalAberto} onFechar={() => this.setState({ modalAberto: false, conteudoModal: null })}>
                    {conteudoModal}
                </Modal>
            </>
        )
    }
}