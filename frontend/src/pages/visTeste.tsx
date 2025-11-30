import { Component } from "react";
import Tabela, { type Coluna } from "../components/tabela";
import BarraPesquisa from "../components/barraPesquisa";
import NavBar from "../components/navbar";
import CadTeste from "./cadTeste";
import Modal from "../components/modal";
import { getNivelAcesso } from "../utils/autenticacao";

const url = import.meta.env.VITE_API_URL;

type teste = {
    aeronave: string
    tipoTeste: string
    resultado: string
    data: string
    observacao: string
    funcResp: string
    id?: number
}

interface PropsTeste { }

interface StateTeste {
    testes: teste[]
    pesquisa: string
    erro: string | null
    modalAberto: boolean
    conteudoModal: React.ReactNode
    nivelAcesso: string
}

export default class VisTeste extends Component<PropsTeste, StateTeste> {
    private readonly colunasTestes: Coluna[] = [
        { header: "Aeronave", accessor: "aeronave" },
        { header: "Tipo de Teste", accessor: "tipoTeste" },
        { header: "Resultado", accessor: "resultado" },
        { header: "Data", accessor: "data" },
        { header: "Observação", accessor: "observacao" },
        { header: "Funcionário Responsável", accessor: "funcResp" }
    ];

    constructor(props: PropsTeste) {
        super(props),
            this.state = {
                testes: [],
                pesquisa: "",
                erro: null,
                modalAberto: false,
                conteudoModal: null,
                nivelAcesso: getNivelAcesso()
            }
        this.PegaTeste = this.PegaTeste.bind(this)
        this.HandlePesquisa = this.HandlePesquisa.bind(this)
        this.abreCadTeste = this.abreCadTeste.bind(this)
    }
    componentDidMount(): void {
        this.PegaTeste()
        this.setState({ nivelAcesso: getNivelAcesso() })
    }

    abreCadTeste(e: React.MouseEvent) {
        e.preventDefault()
        this.setState({
            conteudoModal: <CadTeste />,
            modalAberto: true
        })
    }

    async PegaTeste() {
        this.setState({ erro: null })
        try {

            const token = localStorage.getItem("token");
            const res = await fetch(`${url}/testes`, {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            })

            if (!res.ok) {
                throw new Error(`Erro ao buscar os testes cadastrados: ${res.status}`)
            }

            const dados_teste: teste[] = (await res.json()).map((t: any) => ({
                ...t,
                data: new Date(t.data).toLocaleString("pt-BR", {
                    dateStyle: "short",
                    timeStyle: "short"
                })
            }));

            this.setState({
                testes: dados_teste
            })
        } catch (err) {
            this.setState({
                erro: "Falha ao carregar os dados dos testes. " + (err as Error).message,
            });
        }
    }

    HandlePesquisa(texto: string) {
        this.setState({ pesquisa: texto })
    }

    PegaTesteFiltradas(): teste[] {
        const { testes, pesquisa } = this.state;

        if (!pesquisa) {
            return testes;
        }

        const pesqMinusculo = pesquisa.toLowerCase();

        return testes.filter(t => {
            return (
                t.aeronave.toLowerCase().includes(pesqMinusculo) ||
                t.tipoTeste.toLowerCase().includes(pesqMinusculo) ||
                t.resultado.toLowerCase().includes(pesqMinusculo) ||
                t.funcResp.toLowerCase().includes(pesqMinusculo) ||
                t.data.toLowerCase().includes(pesqMinusculo)
            );
        });
    }

    render() {
        const { testes, erro, modalAberto, conteudoModal, nivelAcesso } = this.state
        const dadosFiltrados = this.PegaTesteFiltradas();
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
                                placeholder="Buscar por aeronave, tipo de teste, resultado, funcionario ou data"
                            />
                        </section>
                        <section className="flex justify-between w-[90%] m-auto mt-[3%] overflow-y-auto">
                            <h1 className="text-black font-medium text-2xl md:font-bold md:text-3xl lg:font-bold lg:text-4xl font-nunito">Testes</h1>
                            <button className="bg-[#3a6ea5] text-white font-nunito font-semibold text-sm md:text-lg  p-1 md:p-2 lg:p-2 rounded-3xl pl-10 pr-10 md:pl-14 md:pr-14 lg:pl-14 lg:pr-14 border-2 border-[#24679a] cursor-pointer hover:border-[#184e77]" onClick={this.abreCadTeste}>+ Testes</button>
                        </section>
                        {erro && (
                            <div className="p-3 bg-red-100 text-red-700 border border-red-400 rounded">
                                Erro: {erro}
                            </div>
                        )}
                        {!erro && testes.length > 0 && (
                            <section className="w-[90%] m-auto mt-[3%] mb-[5%]">
                                <Tabela
                                    dados={dadosFiltrados}
                                    colunas={this.colunasTestes}>
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