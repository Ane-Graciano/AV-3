import type React from "react"
import { Component } from "react"

type PropsInput = {
    id?: string,
    htmlfor?: string,
    children?: React.ReactNode,
    type: string,
    name: string,
    value?: string,
    placeholder?: string,
    required?: boolean;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void,
    maxLength?: number,
    classNameInput?: string,
    classNameLabel?: string
}

export default class InputLinha extends Component<PropsInput,{}>{
    constructor(props:PropsInput){
        super(props)
    }
    render(){
        return(
            <section className="relative">
                <input 
                    type={this.props.type}
                    id={this.props.id}
                    name={this.props.name}
                    placeholder={this.props.placeholder}
                    value={this.props.value}
                    onChange={this.props.onChange}
                    maxLength={this.props.maxLength}
                    required={this.props.required}
                    className={`w-[300px] block px-2 pb-1 pt-5 text-sm text-gray-950 border-b-2 border-[#c0c0c0]  focus:outline-none focus:border-[#3a6ea5] peer ${this.props.classNameInput}`}
                />
                <label 
                    htmlFor={this.props.htmlfor}
                    className={`absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-4 z-10 start-2 peer-focus:text-[#3a6ea5] peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto ${this.props.classNameLabel}`}
                >
                    {this.props.children}
                </label>
            </section>
        )
    }
}