import { Component } from "react";
import Tabela, { type Coluna } from "../components/tabela";
import BarraPesquisa from "../components/barraPesquisa";
import NavBar from "../components/navbar";
import CadEtapa from "./cadEtapa";
import Modal from "../components/modal";
import { getNivelAcesso } from "../utils/autenticacao";


const url = import.meta.env.VITE_API_URL;

type etapas = {
    nome: string
    prazo: string
    statusEtapa: string
    funcionarios: string[]
    id: number
    idAeronave: number
    aeronave: string
}

interface PropsEtapa {
    aeronaveId?: number | null;
    etapaId?: number;
    onCadastroSucesso?: () => void;
}

interface StateEtapa {
    etapa: etapas[]
    pesquisa: string
    erro: string | null
    modalAberto: boolean
    conteudoModal: React.ReactNode
    nivelAcesso: string
}

export default class VisEtapa extends Component<PropsEtapa, StateEtapa> {
    private readonly colunasPecas: Coluna[] = [
        { header: "Aeronave", accessor: "aeronave" },
        { header: "Nome", accessor: "nome" },
        { header: "Prazo", accessor: "prazo" },
        { header: "Funcionários", accessor: "funcionarios" },
        { header: "Status Atual da Etapa", accessor: "statusEtapa" },
        { header: "Inicia", accessor: "inicia" },
        { header: "Finaliza", accessor: "finaliza" },
        { header: "Editar", accessor: "editar" }
    ];

    constructor(props: PropsEtapa) {
        super(props),
            this.state = {
                etapa: [],
                pesquisa: "",
                erro: null,
                modalAberto: false,
                conteudoModal: null,
                nivelAcesso: getNivelAcesso().toUpperCase()
            }
        this.PegaEtapas = this.PegaEtapas.bind(this)
        this.HandlePesquisa = this.HandlePesquisa.bind(this)
        this.abreCadEtapa = this.abreCadEtapa.bind(this)
        this.abreEditaEtapa = this.abreEditaEtapa.bind(this)
        this.alteraStatusEtapa = this.alteraStatusEtapa.bind(this)
    }
    componentDidMount(): void {
        this.PegaEtapas()
        this.setState({ nivelAcesso: getNivelAcesso().toUpperCase() })
    }

    async alteraStatusEtapa(etapaId: number, novoStatus: "ANDAMENTO" | "CONCLUIDA") {

        const acao = novoStatus === "ANDAMENTO" ? "iniciar" : "finalizar";

        if (!window.confirm(`Tem certeza que deseja ${acao} a etapa ${etapaId}?`)) {
            return;
        }

        this.setState({ erro: null });

        const endpoint = novoStatus === "ANDAMENTO" ? "iniciar" : "finalizar";
        const token = localStorage.getItem("token");

        try {
            const res = await fetch(`${url}/etapas/${etapaId}/${endpoint}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
            });

            if (!res.ok) {
                throw new Error(`Erro ao ${acao} a etapa: ${res.status}`);
            }

            alert(`Etapa ${etapaId} ${acao}da com sucesso!`);
            this.PegaEtapas();

        } catch (err) {
            this.setState({
                erro: `Falha ao ${acao} a etapa. ` + (err as Error).message,
            });
        }
    }


    async PegaEtapas() {
        this.setState({ erro: null })
        try {

            const token = localStorage.getItem("token");

            const res = await fetch(`${url}/etapas`, {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            })

            if (!res.ok) {
                throw new Error(`Erro ao buscar as etapas cadastrados: ${res.status}`)
            }

            const dados_etapa: etapas[] = await res.json()
            this.setState({
                etapa: dados_etapa
            })
        } catch (err) {
            this.setState({
                erro: "Falha ao carregar os dados das etapas. " + (err as Error).message,
            });
        }
    }

    HandlePesquisa(texto: string) {
        this.setState({ pesquisa: texto })
    }

    PegaEtapasFiltradas(): etapas[] {
        const { etapa, pesquisa } = this.state;

        if (!pesquisa) {
            return etapa;
        }

        const pesqMinusculo = pesquisa.toLowerCase();

        return etapa.filter(e => {
            return (
                e.nome.toLowerCase().includes(pesqMinusculo) ||
                e.statusEtapa.toLowerCase().includes(pesqMinusculo) ||
                e.prazo.toLowerCase().includes(pesqMinusculo) ||
                e.aeronave.toLowerCase().includes(pesqMinusculo)
            );
        });
    }

    abreCadEtapa(e: React.MouseEvent) {
        e.preventDefault()
        this.setState({
            conteudoModal: (
                <CadEtapa
                    aeronaveId={this.props.aeronaveId}
                    onCadastroSucesso={() => {
                        this.setState({ modalAberto: false, conteudoModal: null });
                        this.PegaEtapas();
                    }}
                />
            ),
            modalAberto: true
        })
    }

    abreEditaEtapa(etapaParaEditar: etapas) {
        this.setState({
            conteudoModal: (
                <CadEtapa
                    etapaId={etapaParaEditar.id}
                    aeronaveId={etapaParaEditar.idAeronave}
                />
            ),
            modalAberto: true
        })
    }

    FormataDadosEtapas() {
        const dados = this.PegaEtapasFiltradas();
        const etapasCompletas = this.state.etapa
        const { nivelAcesso } = this.state
        // Lógica de Permissão
        const podeModificar = nivelAcesso === 'ADMINISTRADOR' || nivelAcesso === 'ENGENHEIRO'

        etapasCompletas.sort((a, b) => a.id - b.id);

        return dados.map((etapaAtual, index) => {

            const statusAtual = (etapaAtual.statusEtapa || '').toUpperCase()
            const etapaAnterior = index > 0 ? etapasCompletas[index - 1] : null

            const podeIniciar =
                index === 0 ||
                (etapaAnterior && (etapaAnterior.statusEtapa || '').toUpperCase() === 'CONCLUIDA')

            const estaPendente = statusAtual === 'PENDENTE'
            const estaEmAndamento = statusAtual === 'ANDAMENTO'
            const podeFinalizar = estaEmAndamento

            // Recebe o array de funcionarios
            const funcionarios = Array.isArray(etapaAtual.funcionarios) ? etapaAtual.funcionarios : [];

            // Se o array não for vazio, junta os nomes. Senão, mostra "Nenhum funcionário".
            const funcFormatado = funcionarios.length > 0
                ? funcionarios.join(', ')
                : 'Nenhum funcionário';

            // Valores Padrão (Fallback ou Sem Permissão)
            let botaoInicia: React.ReactNode = <span className="text-gray-500 text-xs">N/A</span>
            let botaoFinaliza: React.ReactNode = <span className="text-green-700 font-semibold text-xs">Finalizada ✅</span>
            let botaoEditar: React.ReactNode = <span className="text-gray-500 text-xs">N/A</span>

            if (podeModificar) {
                // Usuário tem permissão de ADMIN ou ENGENHEIRO

                // Lógica para Iniciar Etapa
                if (estaPendente && podeIniciar) {
                    botaoInicia = (
                        <button
                            onClick={() => this.alteraStatusEtapa(etapaAtual.id, "ANDAMENTO")}
                            className="p-2 bg-green-600 text-white rounded text-xs hover:bg-green-700 transition font-semibold"
                        >
                            Inicia Etapa
                        </button>
                    );
                } else if (estaPendente && !podeIniciar) {
                    botaoInicia = (
                        <button
                            disabled
                            className="p-2 bg-gray-400 text-white rounded text-xs cursor-not-allowed"
                            title="A etapa anterior precisa ser finalizada antes de iniciar esta."
                        >
                            Inicia Etapa
                        </button>
                    );
                }
                // Se não é pendente, o N/A (padrão) já serve

                // Lógica para Finalizar Etapa
                if (podeFinalizar) {
                    botaoFinaliza = (
                        <button
                            onClick={() => this.alteraStatusEtapa(etapaAtual.id, "CONCLUIDA")}
                            className="p-2 bg-red-600 text-white rounded text-xs hover:bg-red-700 transition font-semibold"
                        >
                            Finaliza Etapa
                        </button>
                    );
                }
                else if (statusAtual === 'CONCLUIDA') {
                    botaoFinaliza = (
                        <span className="text-green-700 font-semibold text-xs">Finalizada ✅</span>
                    );
                }
                else {
                    // Não está em andamento e não está concluída (provavelmente pendente)
                    botaoFinaliza = (
                        <button
                            disabled
                            className="p-2 bg-gray-400 text-white rounded text-xs cursor-not-allowed"
                            title="Etapa precisa estar 'Em Andamento' para ser finalizada."
                        >
                            Finaliza Etapa
                        </button>
                    );
                }

                // Lógica para Editar Etapa
                botaoEditar = (
                    <button
                        onClick={() => this.abreEditaEtapa(etapaAtual)}
                        className="p-2 bg-[#3a6ea5] text-white rounded text-xs hover:bg-blue-600 transition"
                    >
                        Editar
                    </button>
                );

            } else {
                // Usuário NÃO tem permissão
                botaoInicia = <span className="text-gray-500 text-xs">N/A</span>
                botaoEditar = <span className="text-gray-500 text-xs">N/A</span>

                if (statusAtual === 'CONCLUIDA') {
                    botaoFinaliza = (
                        <span className="text-green-700 font-semibold text-xs">Finalizada ✅</span>
                    );
                } else {
                    botaoFinaliza = (
                        <span className="text-gray-500 text-xs">Sem Permissão</span>
                    );
                }
            }

            return {
                ...etapaAtual,
                funcionarios: funcFormatado,
                inicia: botaoInicia,
                finaliza: botaoFinaliza,
                editar: botaoEditar
            };
        });
    }

    render() {
        const { etapa, erro, modalAberto, conteudoModal, nivelAcesso } = this.state
        const dadosFiltrados = this.FormataDadosEtapas();
        const podeModifica = nivelAcesso === 'ADMINISTRADOR' || nivelAcesso === 'ENGENHEIRO'
        return (
            <>
                <section className="w-screen h-screen grid grid-cols-[5%_95%]  overflow-x-hidden">
                    <section>
                        {window.location.pathname !== '/login' && (
                            <NavBar nivel={nivelAcesso} />
                        )}
                    </section>
                    <section className="">
                        <section className="mt-[15%] ml-[5%] mb-[10%] sm:mt[5%] sm:mb-[4%] md:mt-[5%] md:mb-[5%] lg:mt-[2%] lg:mb-[5%]">
                            <BarraPesquisa
                                onPesquisa={this.HandlePesquisa}
                                placeholder="Buscar por nome, prazo ou status"
                            />
                        </section>
                        <section className="flex justify-between w-[90%] m-auto mt-[3%]">
                            <h1 className="text-black font-medium text-2xl md:font-bold md:text-3xl lg:font-bold lg:text-4xl font-nunito">Etapas</h1>
                            {podeModifica && (
                                <button className="bg-[#3a6ea5] text-white font-nunito font-semibold text-sm md:text-lg  p-1 md:p-2 lg:p-2 rounded-3xl pl-10 pr-10 md:pl-14 md:pr-14 lg:pl-14 lg:pr-14 border-2 border-[#24679a] cursor-pointer hover:border-[#184e77]" onClick={this.abreCadEtapa}>+ Etapa</button>
                            )}
                        </section>
                        {erro && (
                            <div className="p-3 bg-red-100 text-red-700 border border-red-400 rounded">
                                Erro: {erro}
                            </div>
                        )}
                        {!erro && etapa.length > 0 && (
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