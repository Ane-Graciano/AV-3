import { Component } from "react";
import Tabela, { type Coluna } from "../components/tabela";
import BarraPesquisa from "../components/barraPesquisa";
import NavBar from "../components/navbar";
import CadAeronave from "./cadAeronave";
import Modal from "../components/modal";
import DetalhesAero from "../components/detalheAeronave";
import CadPeca from "./cadPeca";
import { getNivelAcesso } from "../utils/autenticacao";
import CadEtapa from "./cadEtapa";
import { type aeronaves, type etapa, type peca, type teste } from "../types";


const url = import.meta.env.VITE_API_URL;

interface PropsPeca {
}

interface StateAero {
    aeronave: aeronaves[]
    pesquisa: string
    erro: string | null
    modalAberto: boolean
    conteudoModal: React.ReactNode
    idAeroSelecionada: number | null
    etapas: etapa[]
    pecas: peca[]
    testes: teste[]
    etapasSelecionadas: number[]
    nivelAcesso: string
}

export default class VisAeronave extends Component<PropsPeca, StateAero> {
    private readonly colunasAero: Coluna[] = [
        { header: "Id", accessor: "id" },
        { header: "Codigo", accessor: "codigo" },
        { header: "Modelo", accessor: "modelo" },
        { header: "Tipo", accessor: "tipo" },
        { header: "Alcance", accessor: "alcance" },
        { header: "Capacidade", accessor: "capacidade" },
        { header: "Editar", accessor: "editar" }
    ];

    constructor(props: PropsPeca) {
        super(props),
            this.state = {
                aeronave: [],
                pesquisa: "",
                erro: null,
                modalAberto: false,
                conteudoModal: null,
                idAeroSelecionada: null,
                etapas: [],
                pecas: [],
                testes: [],
                etapasSelecionadas: [],
                nivelAcesso: getNivelAcesso()
            }
        this.PegaAeronave = this.PegaAeronave.bind(this)
        this.HandlePesquisa = this.HandlePesquisa.bind(this)
        this.abreCadAeronave = this.abreCadAeronave.bind(this)
        this.abreEditaAero = this.abreEditaAero.bind(this)
        this.abreDetalhesAero = this.abreDetalhesAero.bind(this)
        this.PegaDetalhesAero = this.PegaDetalhesAero.bind(this)
        this.voltarLista = this.voltarLista.bind(this)
        this.toggleEtapaSelecao = this.toggleEtapaSelecao.bind(this)
        this.atualizarStatusLote = this.atualizarStatusLote.bind(this)
        this.abreEditaPeca = this.abreEditaPeca.bind(this)
    }
    componentDidMount(): void {
        this.PegaAeronave()
        this.setState({ nivelAcesso: getNivelAcesso() })
    }

    async PegaDetalhesAero(idAero: number) {
        this.setState({ etapas: [], pecas: [], testes: [], erro: null });

        try {
            const token = localStorage.getItem("token");

            // CORREÇÃO: Faz uma única chamada para buscar todos os detalhes por ID
            // Assume que o tipo 'AeronaveDetalhada' (backend) corresponde ao que o estado espera
            const resp = await fetch(`${url}/aeronaves/id/${idAero}`, {
                headers: { "Authorization": `Bearer ${token}` }
            });

            if (!resp.ok) throw new Error(`Falha ao buscar detalhes da aeronave: ${resp.status}`);

            // A resposta contém pecas, etapas e testes
            const dados_detalhes = await resp.json();

            this.setState({
                etapas: dados_detalhes.etapas, // Atribui as etapas do objeto
                pecas: dados_detalhes.pecas,   // Atribui as peças do objeto
                testes: dados_detalhes.testes  // Atribui os testes do objeto
            });

        } catch (err) {
            this.setState({
                erro: "Falha ao carregar detalhes da aeronave: " + (err as Error).message,
            });
        }
    }

    abreDetalhesAero(idAero: number) {
        this.setState({ idAeroSelecionada: idAero }, () => {
            this.PegaDetalhesAero(idAero)
        })
    }

    voltarLista() {
        this.setState({ idAeroSelecionada: null, etapas: [], pecas: [], testes: [] });
    }

    abreCadAeronave(e: React.MouseEvent) {
        e.preventDefault()
        this.setState({
            conteudoModal: <CadAeronave />,
            modalAberto: true
        })
    }

    abreEditaAero(aeroParaEditar: aeronaves) {
        this.setState({
            conteudoModal: (
                <CadAeronave aeronaveId={aeroParaEditar.id} />
            ),
            modalAberto: true
        })
    }

    abreEditaPeca(pecaParaEditar: peca) {
        this.setState({
            conteudoModal: (
                <CadPeca pecaId={pecaParaEditar.id} />
            ),
            modalAberto: true
        })
    }

    async PegaAeronave() {
        this.setState({ erro: null })
        try {

            const token = localStorage.getItem("token");
            const res = await fetch(`${url}/aeronaves`, {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            })

            if (!res.ok) {
                throw new Error(`Erro ao buscar as aeronaves cadastrados: ${res.status}`)
            }

            const dados_aero: aeronaves[] = await res.json()
            this.setState({
                aeronave: dados_aero
            })
        } catch (err) {
            this.setState({
                erro: "Falha ao carregar os dados das aeronaves. " + (err as Error).message,
            });
        }
    }

    toggleEtapaSelecao(etapaId: number, isSelecionada: boolean) {
        this.setState(prevState => {
            const { etapasSelecionadas } = prevState;
            if (isSelecionada) {
                return { etapasSelecionadas: [...etapasSelecionadas, etapaId] };
            } else {
                return { etapasSelecionadas: etapasSelecionadas.filter(id => id !== etapaId) };
            }
        });
    }

    async atualizarStatusLote(novoStatus: 'ANDAMENTO' | 'CONCLUIDA') {
        const { etapasSelecionadas } = this.state;
        const acao = novoStatus === 'ANDAMENTO' ? 'iniciar' : 'finalizar';

        if (etapasSelecionadas.length === 0) {
            alert("Selecione pelo menos uma etapa.");
            return;
        }

        if (!window.confirm(`Tem certeza que deseja ${acao} ${etapasSelecionadas.length} etapa(s) selecionada(s)?`)) {
            return;
        }

        this.setState({ erro: null });
        try {
            for (const id of etapasSelecionadas) {
                const res = await fetch(`${url}/etapa/${id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ status: novoStatus }),
                });

                if (!res.ok) {
                    console.error(`Falha ao atualizar a etapa ${id}: ${res.status}`);
                }
            }

            alert(`Atualização de status em lote concluída.`);

            this.setState({ etapasSelecionadas: [] }, () => {
                if (this.state.idAeroSelecionada) {
                    this.PegaDetalhesAero(this.state.idAeroSelecionada);
                }
            });

        } catch (err) {
            this.setState({
                erro: `Falha na operação em lote. ` + (err as Error).message,
            });
        }
    }

    HandlePesquisa(texto: string) {
        this.setState({ pesquisa: texto })
    }

    PegaAeroFiltradas(): aeronaves[] {
        const { aeronave, pesquisa } = this.state;

        if (!pesquisa) {
            return aeronave;
        }

        const pesqMinusculo = pesquisa.toLowerCase();

        return aeronave.filter(a => {
            return (
                a.modelo.toLowerCase().includes(pesqMinusculo) ||
                a.tipo.toLowerCase().includes(pesqMinusculo)
            );
        });
    }

    PegaPecaFiltradas(): peca[] {
        const { pecas, pesquisa } = this.state;

        if (!pesquisa) {
            return pecas;
        }

        const pesqMinusculo = pesquisa.toLowerCase();

        return pecas.filter(p => {
            return (
                p.nome.toLowerCase().includes(pesqMinusculo) ||
                p.tipo.toLowerCase().includes(pesqMinusculo) ||
                p.status.toLowerCase().includes(pesqMinusculo)
            );
        });
    }


    FormataDadosAero() {
        const dados = this.PegaAeroFiltradas()
        const { nivelAcesso } = this.state
        const podeModificar = nivelAcesso === 'ADMINISTRADOR' || nivelAcesso === 'ENGENHEIRO'

        return dados.map(a => {
            let botaoEditar = <span className="text-gray-500 text-xs">N/A</span>

            if (podeModificar) {
                botaoEditar = (
                    <button
                        onClick={() => this.abreEditaAero(a)}
                        className="p-2 bg-[#3a6ea5] text-white rounded text-xs hover:bg-blue-600 transition"
                    >
                        Editar ✏️
                    </button>
                )
            }

            return {
                ...a,

                id: (
                    <span onClick={() => { this.abreDetalhesAero(a.id) }} className="font-bold cursor-pointer text-[#3a6ea5] hover:text-blue-600 transition">
                        {a.id}
                    </span>
                ),

                editar: botaoEditar
            }
        })
    }

    FormataDadosPeca() {
        const dados = this.PegaPecaFiltradas();
        const { nivelAcesso } = this.state
        const podeModificar = nivelAcesso === 'ADMINISTRADOR' || nivelAcesso === 'ENGENHEIRO'


        return dados.map(p => {
            let botaoEditar = <span className="text-gray-500 text-xs">N/A</span>;

            if (podeModificar) {
                botaoEditar = (
                    <button
                        onClick={() => this.abreEditaPeca(p)}
                        className="p-2 bg-[#3a6ea5] text-white rounded text-xs hover:bg-blue-600 transition"
                    >
                        Editar ✏️
                    </button>
                );
            }

            return {
                ...p,
                editar: botaoEditar
            };
        });
    }

    render() {
        const { aeronave, erro, modalAberto, conteudoModal, idAeroSelecionada, pecas, etapas, testes, etapasSelecionadas, nivelAcesso } = this.state
        const dadosFiltrados = this.FormataDadosAero()
        const dadosFiltradosPeca = this.FormataDadosPeca()
        const podeModificar = nivelAcesso === 'ADMINISTRADOR' || nivelAcesso === 'ENGENHEIRO'

        const aeroDetalhe = aeronave.find(a => a.id === idAeroSelecionada)
        const mostraDetalhe = idAeroSelecionada !== null && aeroDetalhe

        return (
            <>
                <section className="w-screen h-screen grid grid-cols-[5%_95%]  overflow-x-hidden">

                    <section>
                        {window.location.pathname !== '/login' && (
                            <NavBar nivel={nivelAcesso} />
                        )}
                    </section>
                    <section>
                        {!mostraDetalhe && (
                            <section className="mt-[15%] ml-[5%] mb-[10%] sm:mt[5%] sm:mb-[4%] md:mt-[5%] md:mb-[5%] lg:mt-[2%] lg:mb-[5%]">
                                <BarraPesquisa
                                    onPesquisa={this.HandlePesquisa}
                                    placeholder="🔍 Buscar por modelo, tipo"
                                />
                            </section>
                        )}
                        <section className="flex justify-between w-[90%] m-auto mt-[3%]">
                            <h1 className={`text-black font-medium text-2xl md:font-bold md:text-3xl lg:font-bold lg:text-4xl font-nunito ${mostraDetalhe ? ` mt-14 md:mt-5 ` : ``}`}>
                                {mostraDetalhe ? `Detalhes: ${aeroDetalhe?.modelo}` : 'Aeronaves'}
                            </h1>

                            {mostraDetalhe ? (
                                <button
                                    className="bg-gray-500 text-white font-nunito font-semibold text-sm md:text-lg mt-14 md:mt-5 p-1 md:p-2 lg:p-2 rounded-3xl pl-10 pr-10 md:pl-14 md:pr-14 lg:pl-14 lg:pr-14 border-2 border-gray-700 cursor-pointer hover:border-gray-900"
                                    onClick={this.voltarLista}
                                >
                                    Voltar à Lista
                                </button>
                            ) : (
                                podeModificar && (
                                    <button className="bg-[#3a6ea5] text-white font-nunito font-semibold text-sm md:text-lg p-1 md:p-2 lg:p-2 rounded-3xl pl-10 pr-10 md:pl-14 md:pr-14 lg:pl-14 lg:pr-14 border-2 border-[#24679a] cursor-pointer hover:border-[#184e77]" onClick={this.abreCadAeronave}>
                                        + aeronaves
                                    </button>
                                )
                            )}
                        </section>
                        {erro && (
                            <div className="p-3 bg-red-100 text-red-700 border border-red-400 rounded">
                                Erro: {erro}
                            </div>
                        )}
                        <section className={`flex ${mostraDetalhe ? 'flex-col md:flex-row' : 'flex-col'} mt-[3%] ml-[5%] mr-[5%]`}>
                            {(!mostraDetalhe || (mostraDetalhe)) && (
                                <div className={`w-full ${mostraDetalhe ? 'hidden md:block md:w-1/2 md:pr-2' : 'mb-[5%]'}`}>
                                    {!erro && aeronave.length > 0 && (
                                        <Tabela
                                            dados={dadosFiltrados}
                                            colunas={this.colunasAero}>
                                        </Tabela>
                                    )}
                                </div>
                            )}
                            {mostraDetalhe && (
                                <div className="w-full md:w-1/2 p-2 md:border-l border-gray-300 max-h-screen overflow-auto">
                                    <DetalhesAero
                                        aeronave={aeroDetalhe!}
                                        etapas={etapas}
                                        pecas={pecas}
                                        testes={testes}
                                        onAbreEditaPeca={this.abreEditaPeca}
                                        onRecarregarDetalhes={this.PegaDetalhesAero}
                                        nivelAcesso={nivelAcesso}
                                    />
                                </div>
                            )}

                        </section>
                    </section>
                </section>
                <Modal aberto={modalAberto} onFechar={() => this.setState({ modalAberto: false, conteudoModal: null })}>
                    {conteudoModal}
                </Modal>
            </>
        )
    }
}