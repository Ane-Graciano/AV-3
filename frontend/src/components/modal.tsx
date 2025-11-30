import React from "react";
import { createPortal } from "react-dom";
import { Component } from "react";

type PropsModal = {
    aberto: boolean
    onFechar: () => void
    children: React.ReactNode
    modalClassName?: string
}

export default class Modal extends Component<PropsModal, {}> {
    constructor(props: PropsModal) {
        super(props)
    }

    private clicouFora = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            console.log('clicou fora')
            this.props.onFechar()
        }
    }


    render() {
        const { aberto, children, modalClassName } = this.props
        if (!aberto) return null

        const modalRoot = document.getElementById('modal-root')
        if (!modalRoot) return null

        return createPortal(
            <section
                className={`fixed inset-0 flex items-center justify-center overflow-y-auto bg-black/20 ${modalClassName}`}
                onClick={this.clicouFora}
                role="dialog"
                aria-modal="true">
                <div className="bg-white p-6 rounded-xl shadow-2xl max-w-[60%] w-full h-[80%] border-2 border-gray-100" onClick={(e) => e.stopPropagation()}>
                    {children}
                </div>
            </section>,
            modalRoot!
        )
    }
}