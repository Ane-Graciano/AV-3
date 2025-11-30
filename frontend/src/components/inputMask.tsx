import { Component } from "react";
import { IMaskInput } from 'react-imask';

interface PropsInputMask {
    label: string
    name: string
    value?: string
    htmlor?: string
    id?: string
    mask: string
    placeholder?: string
    required?: boolean
    maxLength?: number
    minLength?: number
    // onAccept: (value: string) => void
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
    classNameLabel?: string
    classNameInput?: string
}

interface StateInputMask { }

export default class InputMask extends Component<PropsInputMask, StateInputMask> {
    constructor(props: PropsInputMask) {
        super(props)
    }
    render() {

        return (
            <>
                <section className="relative">
                    <label
                        htmlFor={this.props.htmlor}
                        className={`absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-4 z-10 start-2 peer-focus:text-[#3a6ea5] peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto ${this.props.classNameLabel}`}
                    >
                        {this.props.label}
                    </label>
                    <IMaskInput
                        name={this.props.name}
                        value={this.props.value}
                        id={this.props.htmlor}
                        mask={this.props.mask}
                        placeholder={this.props.placeholder}
                        required={this.props.required}
                        maxLength={this.props.maxLength}
                        minLength={this.props.minLength}
                        // onAccept={(value: any) => this.props.onAccept(value)}
                        onChange={this.props.onChange}
                        className={`w-[300px] block px-2 pb-1 pt-5 text-sm text-gray-950 border-b-2 border-[#c0c0c0]  focus:outline-none focus:border-[#3a6ea5] peer  ${this.props.classNameInput}`}
                    />
                </section>
            </>
        )
    }
}
