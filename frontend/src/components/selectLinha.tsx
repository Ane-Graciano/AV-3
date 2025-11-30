import React, { Component } from "react";

type Op = {
    value: string
    label: string
}
interface PropsSelect{
    name: string
    label: string
    value?: string
    opcoes : Op[]
    onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void
    required?: boolean
    classNameSelect?: string
    classNameLabel?: string
    disabled?: boolean
    readonly?: boolean
}

interface StateSelect{}

export default class SelectLinha extends Component<PropsSelect,StateSelect>{

    constructor(props:PropsSelect){
        super(props)
    }

    render(){
        return(
            <>
                <section className="relative">
                    <label htmlFor={this.props.name} className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-4 z-10 start-2 peer-focus:text-[#3a6ea5] peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto">
                        {this.props.label}
                    </label>
                    <select name={this.props.name} value={this.props.value} id={this.props.name} onChange={this.props.onChange} required={this.props.required} disabled={this.props.disabled} className={`w-[300px] block px-2 pb-1 pt-5 text-sm text-gray-950 border-b-2 border-[#c0c0c0]  focus:outline-none focus:border-[#3a6ea5] peer  ${this.props.readonly ? "pointer-events-none bg-gray-100 text-gray-500" : "focus:border-[#3a6ea5]"} 
        ${this.props.classNameSelect}}`}>
                        {this.props.opcoes.map(op=> (
                            <option key={op.value} value={op.value}>
                                {op.label}
                            </option>
                        ))}
                    </select>
                </section>
            </>
        )
    }
}