import { Component, type ChangeEvent } from "react"
import InputLinha from "./input";

type PropsBarraPesquisa = {
    onPesquisa: (texto: string) => void
    placeholder?: string
}

interface StateBarraPesquisa {
    pesquisa: string;
}

export default class BarraPesquisa extends Component<PropsBarraPesquisa,StateBarraPesquisa>{
    constructor(props: PropsBarraPesquisa){
        super(props)
        this.state = {
            pesquisa: ''
        }
        this.attPesquisa = this.attPesquisa.bind(this)
    }

    attPesquisa(e: ChangeEvent<HTMLInputElement>){
        const texto = e.target.value
        this.setState({pesquisa: texto}, () => {
            this.props.onPesquisa(texto)
        })
    }

    render(){
        return(
            <>
            <InputLinha type="text" name="barraPesquisa" placeholder={this.props.placeholder} value={this.state.pesquisa} onChange={this.attPesquisa}/>
            </>
        )
    }
}