import { Component } from "react"
import { type aeronaves, type etapa, type peca, type teste } from "../types";
import Tabela, { type Coluna } from "../components/tabela";
import CadEtapa from "../pages/cadEtapa";
import Modal from "./modal";
import jsPDF from "jspdf";


interface PropsDetalhesAero {
    aeronave: aeronaves
    pecas: peca[]
    etapas: etapa[]
    testes: teste[]
    onAbreEditaPeca: (peca: peca) => void
    onRecarregarDetalhes: (idAero: number) => Promise<void>
    nivelAcesso: string
}

interface StateDetalhesAero {
    modalAberto: boolean
    conteudoModal: React.ReactNode
    etapaParaEditar: etapa | null
    statusPecaTemp: { [key: number]: string }
}

export default class DetalhesAero extends Component<PropsDetalhesAero, StateDetalhesAero> {
    constructor(props: PropsDetalhesAero) {
        super(props)
        this.state = {
            modalAberto: false,
            conteudoModal: null,
            etapaParaEditar: null,
            statusPecaTemp: {}
        }
        this.abreCadEtapa = this.abreCadEtapa.bind(this)
        this.abreEditaEtapa = this.abreEditaEtapa.bind(this)
        this.handleStatusChange = this.handleStatusChange.bind(this)
        this.salvarNovoStatus = this.salvarNovoStatus.bind(this)
        this.gerarEVisualizarRelatorio = this.gerarEVisualizarRelatorio.bind(this);
    }

    private readonly colunasPecas: Coluna[] = [
        { header: "Nome", accessor: "nome" },
        { header: "Tipo", accessor: "tipo" },
        { header: "Fornecedor", accessor: "fornecedor" },
        { header: "Status", accessor: "status" },
        { header: "Att Status", accessor: "novoStatus" },
        { header: "Editar", accessor: "editar" }
    ];
    private readonly colunasEtapas: Coluna[] = [
        // { header: "Sel", accessor: "selecionar" },
        { header: "Nome", accessor: "nome" },
        { header: "Prazo", accessor: "prazo" },
        { header: "Funcionários", accessor: "funcSelecionado" },
        { header: "Status", accessor: "status" },
        { header: "Editar", accessor: "editar" }
    ];
    private readonly colunasTestes: Coluna[] = [
        { header: "Aeronave", accessor: "aeronave" },
        { header: "Tipo de Teste", accessor: "tipoTeste" },
        { header: "Resultado", accessor: "resultado" },
        { header: "Data", accessor: "data" },
        { header: "Observação", accessor: "obs" },
        { header: "Funcionário", accessor: "funcResp" }
    ]

    abreCadEtapa(e: React.MouseEvent) {
        e.preventDefault()
        this.setState({
            conteudoModal: <CadEtapa aeronaveId={this.props.aeronave.id} />,
            modalAberto: true
        })
    }

    abreEditaEtapa(etapaParaEditar: etapa) {
        this.setState({
            conteudoModal: (
                <CadEtapa etapaId={etapaParaEditar.id} aeronaveId={this.props.aeronave.id} />
            ),
            modalAberto: true
        })
    }

    private readonly url = import.meta.env.VITE_API_URL;

    handleStatusChange(pecaId: number, novoStatus: string) {
        this.setState(prevState => ({
            statusPecaTemp: {
                ...prevState.statusPecaTemp,
                [pecaId]: novoStatus,
            },
        }));
    }

    async salvarNovoStatus(pecaId: number, novoStatus: string) {
        const pecaOriginal = this.props.pecas.find(p => p.id === pecaId);

        if (!pecaOriginal || pecaOriginal.status === novoStatus) {
            this.setState(prevState => {
                const newStatusTemp = { ...prevState.statusPecaTemp }
                delete newStatusTemp[pecaId]
                return { statusPecaTemp: newStatusTemp }
            });
            return
        }

        if (!window.confirm(`Tem certeza que deseja alterar o status da peça ID ${pecaId} para "${novoStatus}"?`)) {
            return;
        }

        try {

            const token = localStorage.getItem("token");
            const res = await fetch(`${this.url}/pecas/${pecaId}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ novoStatus: novoStatus }),
            });

            if (!res.ok) {
                throw new Error(`Erro ao atualizar o status da peça: ${res.status} ${res.statusText}`);
            }
            this.setState(prevState => {
                const newStatusTemp = { ...prevState.statusPecaTemp };
                delete newStatusTemp[pecaId];
                return { statusPecaTemp: newStatusTemp };
            });

            alert("Status da peça atualizado com sucesso!");

            await this.props.onRecarregarDetalhes(this.props.aeronave.id)


        } catch (error) {
            alert(`Falha ao salvar o novo status: ${(error as Error).message}. Verifique se a sua API (${this.url}) está rodando.`);
        }
    }

    FormataEtapa() {
        const { etapas, nivelAcesso } = this.props
        const podeModificar = nivelAcesso === 'ADMINISTRADOR' || nivelAcesso === 'ENGENHEIRO'

        return etapas.map(e => {
            let botaoEditar: React.ReactNode = <span className="text-gray-500 text-xs">N/A</span>

            if (podeModificar) {
                botaoEditar = (
                    <button
                        onClick={() => this.abreEditaEtapa(e)}
                        className="p-1 bg-gray-300 text-gray-800 rounded text-xs hover:bg-gray-400 transition"
                    >
                        ✏️
                    </button>
                )
            }

            return {
                ...e,
                funcSelecionado:
                    e.funcionarios && e.funcionarios.length > 0
                        ? e.funcionarios.map(f => f.nome).join(", ")
                        : "Não informado",
                editar: botaoEditar
            }
        })
    }

    FormataPecas() {
        const { pecas, onAbreEditaPeca, nivelAcesso } = this.props;
        const { statusPecaTemp } = this.state;
        const podeEditarPeca = nivelAcesso === 'ADMINISTRADOR' || nivelAcesso === 'ENGENHEIRO';

        return pecas.map(p => {
            const statusSelecionado = statusPecaTemp[p.id] || p.status;
            const haMudancaPendente = statusSelecionado !== p.status;

            let botaoEditar: React.ReactNode = <span className="text-gray-500 text-xs">N/A</span>;

            if (podeEditarPeca) {
                botaoEditar = (
                    <button
                        onClick={() => onAbreEditaPeca(p)}
                        className="p-1 bg-gray-300 text-gray-800 rounded text-xs hover:bg-gray-400 transition"
                    >
                        ✏️
                    </button>
                );
            }

            return {
                ...p,

                novoStatus: (
                    <div className="flex items-center space-x-2">
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
                ),

                editar: botaoEditar,
            }
        })
    }

    FormataTestes() {
        return this.props.testes.map(t => ({
            ...t,
            aeronave: this.props.aeronave.codigo,
            tipoTeste: t.tipo,
            data: t.data ? new Date(t.data).toLocaleString("pt-BR") : "",
            obs: t.observacao ?? "",
            funcResp: t.funcionario?.nome || "Não informado"
        }));
    }

    async gerarEVisualizarRelatorio(e: React.MouseEvent) {
        e.preventDefault();

        const { aeronave, pecas, etapas, testes, onRecarregarDetalhes } = this.props

        // if (aeronave.statusRelatorio === 'CONCLUIDA') {
        //     alert(`O relatório final para a aeronave ${aeronave.modelo} já foi gerado e está ${aeronave.statusRelatorio}.`);
        //     this.setState({
        //         conteudoModal: <VisRelatorio
        //             aeronave={aeronave}
        //             pecas={pecas}
        //             etapas={etapas}
        //             testes={testes}
        //             onFechar={() => this.setState({ modalAberto: false, conteudoModal: null })}
        //         />,
        //         modalAberto: true,
        //     });
        //     return;
        // }

        const etapasIncompletas = etapas.filter(etapa => etapa.status !== 'CONCLUIDA')
        if (etapasIncompletas.length > 0) {
            alert(`Não é possível gerar o relatório. ${etapasIncompletas.length} etapas ainda não foram CONCLUIDAS.`)
            return
        }

        const pecasIncompletas = pecas.filter(peca => peca.status !== 'PRONTA')
        if (pecasIncompletas.length > 0) {
            alert(`Não é possível gerar o relatório. ${pecasIncompletas.length} peças ainda não estão com o status 'PRONTA'.`)
            return
        }

        if (!window.confirm(`Todas as etapas e peças estão concluídas. Deseja finalizar o processo da aeronave ${aeronave.modelo} e gerar o relatório?`)) {
            return;
        }

        const novoStatusRelatorio = 'Concluído'

        try {
            const dadosRelatorio = {
                aeronave: aeronave,
                dataGeracao: new Date().toISOString(),
                statusFinal: novoStatusRelatorio,
                pecas: pecas.map(p => ({
                    id: p.id,
                    nome: p.nome,
                    tipo: p.tipo,
                    status: p.status,
                })),
                etapas: etapas.map(e => ({
                    id: e.id,
                    nome: e.nome,
                    prazo: e.prazo,
                    status: e.status,
                    funcionarios: e.funcSelecionado,
                })),
                testes: testes,
            }

            // 1. Defina a URL correta com o código da aeronave
            const urlRelatorio = `${this.url}/aeronaves/${aeronave.id}/relatorio`;

            const resRelatorio = await fetch(urlRelatorio, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    "Authorization": `Bearer ${localStorage.getItem("token")}`
                },
            });

            if (!resRelatorio.ok) {
                // A linha 314 na sua versão original era esta, 
                // mas a linha 324 é o que deve lançar o erro
                throw new Error(`Erro ao salvar o relatório: ${resRelatorio.status} ${resRelatorio.statusText}`);
            }

            if (!resRelatorio.ok) {
                throw new Error(`Erro ao salvar o relatório: ${resRelatorio.status} ${resRelatorio.statusText}`);
            }

            const token = localStorage.getItem("token"); // Buscar o token novamente
            const resAeronave = await fetch(`${this.url}/aeronaves/${aeronave.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    "Authorization": `Bearer ${token}` // ADICIONAR O TOKEN
                },
                body: JSON.stringify({
                    statusRelatorio: novoStatusRelatorio
                }),
            });

            this.gerarPDF(dadosRelatorio);

            if (!resAeronave.ok) {
                console.warn("Aviso: Falha ao atualizar o statusRelatorio da aeronave. O bloqueio pode não funcionar após o reload.");
            }

            // 3. Recarregar os detalhes para buscar o novo statusRelatorio
            await onRecarregarDetalhes(aeronave.id);

            console.log(`Relatório final para a aeronave ${aeronave.modelo} salvo com sucesso!`);
            alert("Relatório final gerado e salvo com sucesso!");

            // this.setState({
            //     conteudoModal: <VisRelatorio
            //         aeronave={aeronave}
            //         pecas={pecas}
            //         etapas={etapas}
            //         testes={testes}
            //         onFechar={() => this.setState({ modalAberto: false, conteudoModal: null })}
            //     />,
            //     modalAberto: true,
            // });

        } catch (error) {
            console.error('Erro ao gerar/salvar relatório:', error);
            alert(`Falha ao gerar e salvar o relatório final: ${(error as Error).message}.`);
        }
    }

    downloadRelatorioJSON(dadosRelatorio: any, nomeArquivo: string) {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(dadosRelatorio, null, 2));
        const link = document.createElement("a");
        link.setAttribute("href", dataStr);
        link.setAttribute("download", nomeArquivo);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    gerarPDF(dadosRelatorio: any) {
        const doc = new jsPDF();

        doc.setFontSize(16);
        doc.text(`Relatório da Aeronave: ${dadosRelatorio.aeronave.modelo}`, 10, 10);

        doc.setFontSize(12);
        doc.text(`Data de Geração: ${new Date(dadosRelatorio.dataGeracao).toLocaleString()}`, 10, 20);

        doc.text("Etapas:", 10, 30);
        dadosRelatorio.etapas.forEach((e: any, index: number) => {
            doc.text(`${index + 1}. ${e.nome} - ${e.status}`, 15, 40 + index * 10);
        });

        let yPecas = 40 + dadosRelatorio.etapas.length * 10 + 10;
        doc.text("Peças:", 10, yPecas);
        dadosRelatorio.pecas.forEach((p: any, index: number) => {
            doc.text(`${index + 1}. ${p.nome} (${p.tipo}) - ${p.status}`, 15, yPecas + 10 + index * 10);
        });

        doc.save(`relatorio_aeronave_${dadosRelatorio.aeronave.id}.pdf`);
    }

    render() {
        const { aeronave, etapas, pecas, testes, nivelAcesso } = this.props
        const { modalAberto, conteudoModal } = this.state
        const dadosEtapasFormatados = this.FormataEtapa()
        const dadosPecasFormatados = this.FormataPecas()
        const podeModificar = nivelAcesso === 'ADMINISTRADOR' || nivelAcesso === 'ENGENHEIRO'
        const tabelaMaxWidth = "w-full max-w-7xl mx-auto"
        const relatorioConcluido = aeronave.statusRelatorio === 'Concluído'
        const textoBotao = relatorioConcluido ? `Relatório Concluído (Visualizar)` : 'Gerar relatório final'
        return (
            <>
                <section className="p-5 w-full h-full overflow-y-auto border-b border-black shadow-2xl">
                    <section className="w-full mb-[2%]">
                        <h1 className="text-black font-bold text-lg md:text-2xl lg:text-3xl mb-[1%]">Dados Gerais</h1>
                        <section className="grid grid-cols-2">
                            <section>
                                <p className="text-black font-medium text-xs sm:text-sm  md:text-sm lg:text-xl">{aeronave.modelo}</p>
                                <p className="text-black font-medium text-xs sm:text-sm  md:text-sm lg:text-xl">{aeronave.tipo}</p>
                            </section>
                            <section>
                                <p className="text-black font-medium text-xs sm:text-sm  md:text-sm lg:text-xl">{aeronave.alcance}</p>
                                <p className="text-black font-medium text-xs sm:text-sm  md:text-sm lg:text-xl">{aeronave.capacidade}</p>
                            </section>
                        </section>
                    </section>
                    <section className="mt-[5%]">
                        <section className="flex justify-between items-center mb-4">
                            <h1 className="text-black font-bold text-lg md:text-2xl lg:text-3xl mb-[1%]">Etapas</h1>
                            {podeModificar && (
                                <button className="bg-[#3a6ea5] text-white font-nunito font-semibold text-sm p-2 rounded-lg hover:bg-[#24679a] transition" onClick={this.abreCadEtapa}>
                                    + vincula etapa
                                </button>
                            )}
                        </section>
                        <section>
                            {etapas.length > 0 ? (
                                <>
                                    <section className={`overflow-x-auto`}>
                                        <Tabela colunas={this.colunasEtapas} dados={dadosEtapasFormatados} classname={`${tabelaMaxWidth} overflow-auto`} />
                                    </section>
                                </>
                            ) : (
                                <p className="text-gray-500 p-4 border rounded">Nenhuma etapa cadastrada para esta aeronave.</p>
                            )}
                        </section>
                    </section>
                    <section className="mt-[5%]">
                        <h1 className="text-black font-bold text-lg md:text-2xl lg:text-3xl mb-[1%]">Peças</h1>
                        <section>
                            {pecas.length > 0 ? (
                                <Tabela colunas={this.colunasPecas} dados={dadosPecasFormatados} classname={`${tabelaMaxWidth} overflow-auto`} />
                            ) : (
                                <p>Nenhuma peça cadastrado</p>
                            )}
                        </section>
                    </section>
                    <section className="mt-[5%]">
                        <h1 className="text-black font-bold text-lg md:text-2xl lg:text-3xl mb-[1%]">Testes</h1>
                        <section>
                            {testes.length > 0 ? (
                                <Tabela colunas={this.colunasTestes} dados={this.FormataTestes()} classname={`${tabelaMaxWidth} overflow-auto`} />
                            ) : (
                                <p>Nenhum teste cadastrado</p>
                            )}
                        </section>
                    </section>
                    {podeModificar && (
                        <button
                            type="button"
                            onClick={this.gerarEVisualizarRelatorio}
                            disabled={relatorioConcluido}
                            className={`mt-[5%] text-white font-nunito font-semibold text-sm p-3 rounded-3xl pl-10 pr-10 border-2 transition
                                ${relatorioConcluido ? 'bg-gray-400 border-gray-500 cursor-not-allowed' : 'bg-[#3a6ea5] border-[#24679a] cursor-pointer hover:border-[#184e77]'}`}
                        >
                            {textoBotao}
                        </button>
                    )}
                </section>
                <Modal aberto={modalAberto} onFechar={() => this.setState({ modalAberto: false, conteudoModal: null })}>
                    {conteudoModal}
                </Modal>
            </>
        )
    }
}