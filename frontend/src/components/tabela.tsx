// src/components/tabela.tsx

import { Component } from "react"
import { IoChevronDown } from "react-icons/io5";
import { FaChevronUp } from "react-icons/fa6";

// A interface Coluna está CORRETA.
export type Coluna<T = any> = {
    header: string
    accessor?: keyof T | string // Opcional para permitir colunas de ação (render)
    render?: (item: T) => React.ReactNode
}

interface PropsTabelaLinha {
    d: any
    dIndex: number
    colunas: Coluna[]
    primeiraCol: (col: Coluna) => boolean
}

interface StateTabelaLinha {
    abreCard: boolean
}

class TabelaLinha extends Component<PropsTabelaLinha, StateTabelaLinha> {
    constructor(propsLinha: PropsTabelaLinha) {
        super(propsLinha)
        this.state = {
            abreCard: false
        }
        this.abreCard = this.abreCard.bind(this)
    }

    abreCard() {
        this.setState(abreAnterior => ({
            abreCard: !abreAnterior.abreCard
        }))
    }
    render() {
        const { d, dIndex, primeiraCol, colunas } = this.props
        const { abreCard } = this.state
        const IconeAbreCard = abreCard ? FaChevronUp : IoChevronDown

        return (
            <>
                <tr key={dIndex} className={`${dIndex % 2 === 0 ? 'bg-[#f9f9f9]' : 'bg-[#e3f2fd]'} relative block md:table-row border border-gray-300 md:border-none rounded-lg md:rounded-none mb-4 p-4 md:p-0 shadow-sm md:shadow-none`}>
                    {colunas.map((col) => {

                        // 🚀 CORREÇÃO PRINCIPAL: Prioriza o 'render'. Se não existir, usa o 'accessor'.
                        const conteudoDaCelula = col.render
                            ? col.render(d)
                            : (col.accessor ? d[col.accessor as keyof typeof d] : null);

                        // O seu código original usava 'valor' e depois renderizava '{valor}'.
                        // Para manter o mínimo de alteração, usarei 'conteudoDaCelula' no lugar de 'valor'.
                        // Se você quer manter 'valor' como variável:
                        const valor = conteudoDaCelula;

                        const colEditar = col.accessor === 'editar'
                        const col1 = primeiraCol(col)
                        const escondeCard = !col1 && !colEditar && !abreCard;

                        return (
                            <td key={col.header} className={`p-1 md:p-3 text-left md:text-center block md:table-cell last:border-b-0 space-x-3 ${colEditar ? `absolute top-2 right-2 md:static md:w-auto w-auto p-0 md:p-3 border-none` : `relative w-full md:w-auto`} ${escondeCard ? `hidden md:block` : ``}`}>
                                <span className="space-x-3 md:hidden ">
                                    {col1 && (
                                        <button onClick={this.abreCard}>
                                            <IconeAbreCard size={10} className="text-[#135b78]" />
                                        </button>
                                    )}
                                    {!colEditar && (
                                        <span className="inline-block md:hidden font-bold text-sm text-gray-700 ">
                                            {col.header}:
                                        </span>
                                    )}
                                </span>
                                <span className={`inline-block md:block w-2/3 md:w-auto ${!colEditar && !col1 ? 'w-2/3' : 'w-auto'}`}>
                                    {valor}
                                </span>
                            </td>
                        )
                    })}
                </tr>
            </>
        )
    }
}


interface PropsTabela {
    dados: any[]
    colunas: Coluna[]
    classname?: string
}

interface StateTabela { }

export default class Tabela extends Component<PropsTabela, StateTabela> {

    // Você usa 'col1' no seu código, que estava correto.
    col1 = (col: Coluna) => col.accessor === this.props.colunas[0].accessor;

    render() {
        return (
            <section className="md:overflow-x-auto">
                <table className={`w-full block md:table md:rounded-lg md:border-collapse ${this.props.classname}`}>
                    <thead className="bg-[#3a6ea5] text-white hidden md:table-header-group">
                        <tr>
                            {this.props.colunas.map((col, colIndex) => (
                                <th key={colIndex} className="p-3 text-center">
                                    {col.header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="block md:table-row-group">
                        {this.props.dados.map((d, dIndex) => (
                            <TabelaLinha
                                key={dIndex}
                                d={d}
                                dIndex={dIndex}
                                colunas={this.props.colunas}
                                primeiraCol={this.col1}
                            />
                        ))}
                    </tbody>
                </table>
            </section>
        )
    }
}