import { Component } from "react";
import Tabela, { type Coluna } from "../components/tabela";
import BarraPesquisa from "../components/barraPesquisa";
import NavBar from "../components/navbar";
import CadPeca from "./cadPeca";
import Modal from "../components/modal";
import { getNivelAcesso } from "../utils/autenticacao";


const url = import.meta.env.VITE_API_URL;


type pecas = {
    nome: string
    tipo: string
    fornecedor: string
    status: string
    id: number    
    aeronave: string
}


interface PropsPeca { }

interface StatePeca {
    peca: pecas[]
    pesquisa: string
    erro: string | null
    modalAberto: boolean
    conteudoModal: React.ReactNode
    statusPendente: { [key: number]: string }
    nivelAcesso: string
}

export default class VisPeca extends Component<PropsPeca, StatePeca> {
    private readonly colunasPecas: Coluna[] = [        
        { header: "Aeronave", accessor: "aeronave" },
        { header: "Nome", accessor: "nome" },
        { header: "Tipo", accessor: "tipo" },
        { header: "Fornecedor", accessor: "fornecedor" },
        { header: "Status Atual", accessor: "status" },
        { header: "Atualizar Status", accessor: "novoStatus" },
        { header: "Editar", accessor: "editar" }
    ];

    constructor(props: PropsPeca) {
        super(props),
            this.state = {
                peca: [],
                pesquisa: "",
                erro: null,
                modalAberto: false,
                conteudoModal: null,
                statusPendente: {},
                nivelAcesso: getNivelAcesso()
            }
        this.PegaPecas = this.PegaPecas.bind(this)
        this.HandlePesquisa = this.HandlePesquisa.bind(this)
        this.abreCadPeca = this.abreCadPeca.bind(this)
        this.abreEditaPeca = this.abreEditaPeca.bind(this)
        this.handleStatusChange = this.handleStatusChange.bind(this)
        this.salvarNovoStatus = this.salvarNovoStatus.bind(this)
    }
    componentDidMount(): void {
        this.PegaPecas()
        this.setState({ nivelAcesso: getNivelAcesso() })
    }

    abreCadPeca(e: React.MouseEvent) {
        e.preventDefault()
        this.setState({
            conteudoModal: <CadPeca />,
            modalAberto: true
        })
    }

    abreEditaPeca(pecaParaEditar: pecas) {
        this.setState({
            conteudoModal: (
                <CadPeca pecaId={pecaParaEditar.id} />
            ),
            modalAberto: true
        })
    }

    async PegaPecas() {
        this.setState({ erro: null })
        try {

            const token = localStorage.getItem("token");
            const res = await fetch(`${url}/pecas`, {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            })

            if (!res.ok) {
                throw new Error(`Erro ao buscar as peças cadastrados: ${res.status}`)
            }

            const dados_pecas: pecas[] = await res.json()
            this.setState({
                peca: dados_pecas
            })
        } catch (err) {
            this.setState({
                erro: "Falha ao carregar os dados das peças. " + (err as Error).message,
            });
        }
    }

    HandlePesquisa(texto: string) {
        this.setState({ pesquisa: texto })
    }

    PegaPecasFiltradas(): pecas[] {
        const { peca, pesquisa } = this.state;

        if (!pesquisa) {
            return peca;
        }

        const pesqMinusculo = pesquisa.toLowerCase();

        return peca.filter(p => {
            return (
                p.nome.toLowerCase().includes(pesqMinusculo) ||
                p.status.toLowerCase().includes(pesqMinusculo) ||
                p.tipo.toLowerCase().includes(pesqMinusculo) ||
                p.fornecedor.toLowerCase().includes(pesqMinusculo)||
                p.aeronave.toLowerCase().includes(pesqMinusculo)
            );
        });
    }

    handleStatusChange(pecaId: number, novoStatus: string) {
        this.setState(prevState => ({
            statusPendente: {
                ...prevState.statusPendente,
                [pecaId]: novoStatus,
            }
        }));
    }

    async salvarNovoStatus(pecaId: number, novoStatus: string) {
        if (!window.confirm(`Tem certeza que deseja atualizar o status da peça ${pecaId} para '${novoStatus}'?`)) {
            return;
        }

        this.setState({ erro: null });
        try {
            const token = localStorage.getItem("token");

            const res = await fetch(`${url}/pecas/${pecaId}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ novoStatus: novoStatus })
            });

            if (!res.ok) {
                throw new Error(`Erro ao atualizar o status: ${res.status}`);
            }

            alert(`Status da peça ${pecaId} atualizado com sucesso para: ${novoStatus}!`);

            const newStatusPendente = { ...this.state.statusPendente };
            delete newStatusPendente[pecaId];

            this.setState({ statusPendente: newStatusPendente });
            this.PegaPecas();

        } catch (err) {
            this.setState({
                erro: `Falha ao salvar o status da peça. ` + (err as Error).message,
            });
        }
    }

    FormataDadosPecas() {
        const dados = this.PegaPecasFiltradas()
        const { nivelAcesso, statusPendente } = this.state
        const podeModificar = nivelAcesso === 'ADMINISTRADOR' || nivelAcesso === 'ENGENHEIRO'

        return dados.map(p => {
            const statusSelecionado = statusPendente[p.id] || p.status
            const haMudancaPendente = statusSelecionado !== p.status

            let colunaNovoStatus
            let colunaEditar
            if (podeModificar) {
                colunaNovoStatus = (
                    <div className="flex items-center justify-center space-x-2">
                        <select
                            value={statusSelecionado}
                            onChange={(e) => this.handleStatusChange(p.id, e.target.value)}
                            className="p-1 border rounded text-sm min-w-[100px] border-gray-300 focus:border-[#3a6ea5] transition"
                        >
                            <option value="EM_PRODUCAO">EM PRODUCAO</option>
                            <option value="EM_TRANSPORTE">EM TRANSPORTE</option>
                            <option value="PRONTA">PRONTA</option>
                        </select>

                        <button
                            onClick={() => this.salvarNovoStatus(p.id, statusSelecionado)}
                            disabled={!haMudancaPendente}
                            className={`p-2 text-white rounded text-xs transition font-semibold 
                            ${haMudancaPendente
                                    ? 'bg-green-600 hover:bg-green-700'
                                    : 'bg-gray-400 cursor-not-allowed'}`}
                        >
                            Salvar
                        </button>
                    </div>
                )
                
                colunaEditar = (
                    <button
                        onClick={() => this.abreEditaPeca(p)}
                        className="w-20 md:w-auto p-2 bg-[#3a6ea5] text-white rounded text-xs hover:bg-blue-600 transition"
                    >
                        Editar ✏️
                    </button>
                )

            } else {
                colunaNovoStatus = <span className="text-gray-500 text-xs">Sem Permissão</span>
                colunaEditar = <span className="text-gray-500 text-xs">N/A</span>
            }

            return {
                ...p,
                novoStatus: colunaNovoStatus,
                editar: colunaEditar
            }
        });
    }

    render() {
        const { peca, erro, modalAberto, conteudoModal, nivelAcesso } = this.state
        const dadosFiltrados = this.FormataDadosPecas();
        const podeModificar = nivelAcesso === 'ADMINISTRADOR' || nivelAcesso === 'ENGENHEIRO'
        return (
            <>
                <section className="w-screen h-screen grid grid-cols-[5%_95%] overflow-x-hidden">
                    <section>
                        {window.location.pathname !== '/login' && (
                            <NavBar nivel={nivelAcesso} />
                        )}
                    </section>
                    <section>
                        <section className="mt-[15%] ml-[5%] mb-[10%] sm:mt[5%] sm:mb-[4%] md:mt-[5%] md:mb-[5%] lg:mt-[2%] lg:mb-[5%]">
                            <BarraPesquisa
                                onPesquisa={this.HandlePesquisa}
                                placeholder="Buscar por nome, status, tipo ou fornecedor"
                            />
                        </section>
                        <section className="flex justify-between w-[90%] m-auto mt-[2%]">
                            <h1 className="text-black font-medium text-2xl md:font-bold md:text-3xl lg:font-bold lg:text-4xl font-nunito">Peças</h1>
                            {podeModificar && (
                                <button className="bg-[#3a6ea5] text-white font-nunito font-semibold text-sm md:text-lg  p-1 md:p-2 lg:p-2 rounded-3xl pl-10 pr-10 md:pl-14 md:pr-14 lg:pl-14 lg:pr-14 border-2 border-[#24679a] cursor-pointer hover:border-[#184e77]" onClick={this.abreCadPeca}>+ Peças</button>
                            )}
                        </section>
                        {erro && (
                            <div className="p-3 bg-red-100 text-red-700 border border-red-400 rounded">
                                Erro: {erro}
                            </div>
                        )}
                        {!erro && peca.length > 0 && (
                            <section className="w-[90%] m-auto mt-[3%] mb-[5%]">
                                <Tabela
                                    dados={dadosFiltrados}
                                    colunas={this.colunasPecas}>
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