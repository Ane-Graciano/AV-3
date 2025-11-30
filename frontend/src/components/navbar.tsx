import React, { Component } from "react";
import { NavLink } from "react-router-dom";
import { TiHomeOutline } from "react-icons/ti";
import { FaPlaneDeparture } from "react-icons/fa6";
import { IoAirplaneOutline } from "react-icons/io5";
import { BsPersonAdd } from "react-icons/bs";
import { BsListCheck } from "react-icons/bs";
import { FaClipboardList } from "react-icons/fa";
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { CiCircleList } from "react-icons/ci";
import { IoAddCircleOutline } from "react-icons/io5";
import Modal from "./modal";
import CadFunc from "../pages/cadFunc";
import CadEtapa from "../pages/cadEtapa";
import CadPeca from "../pages/cadPeca";
import CadAeronave from "../pages/cadAeronave";
import CadTeste from "../pages/cadTeste";
import VisAeronave from "../pages/visAeronave";
import VisEtapa from "../pages/visEtapa";
import VisPeca from "../pages/visPeca";
import VisFunc from "../pages/visFunc";


interface NavBarProps {
    nivel: string
}

interface NavBarState {
    navAberta: boolean
    modalAberto: boolean
    conteudoModal: React.ReactNode
    dropAberto: boolean
    dropAbertoLista: boolean
}

const NivelPermissao = {
    ADMINISTRADOR: 'ADMINISTRADOR',
    ENGENHEIRO: 'ENGENHEIRO',
    OPERADOR: 'OPERADOR'
}

export default class NavBar extends Component<NavBarProps, NavBarState> {
    constructor(props: NavBarProps) {
        super(props)
        this.state = {
            navAberta: false,
            modalAberto: false,
            conteudoModal: null,
            dropAberto: false,
            dropAbertoLista: false
        }
        this.attNav = this.attNav.bind(this)
        this.abreCadFunc = this.abreCadFunc.bind(this)
        this.abreCadEtapa = this.abreCadEtapa.bind(this)
        this.abreCadPeca = this.abreCadPeca.bind(this)
        this.abreCadAeronave = this.abreCadAeronave.bind(this)
        this.abreCadTeste = this.abreCadTeste.bind(this)
        this.abreVisAeronave = this.abreVisAeronave.bind(this)
        this.abreVisEtapa = this.abreVisEtapa.bind(this)
        this.abreVisPeca = this.abreVisPeca.bind(this)
        this.abreVisFunc = this.abreVisFunc.bind(this)
        this.abreDrop = this.abreDrop.bind(this)
        this.abreDropListar = this.abreDropListar.bind(this)
    }

    attNav() {
        this.setState(navAnterior => ({
            navAberta: !navAnterior.navAberta
        }))
    }

    abreDrop(e: React.MouseEvent) {
        e.preventDefault()
        this.setState(dropAnterior => ({
            dropAberto: !dropAnterior.dropAberto
        }))
        console.log('mudei')
    }

    abreDropListar(e: React.MouseEvent) {
        e.preventDefault()
        this.setState(dropAnterior => ({
            dropAbertoLista: !dropAnterior.dropAbertoLista
        }))
        console.log('mudei')
    }

    abreCadFunc(e: React.MouseEvent) {
        e.preventDefault()
        this.setState({
            conteudoModal: <CadFunc />,
            modalAberto: true
        })
    }
    abreVisFunc(e: React.MouseEvent) {
        e.preventDefault()
        this.setState({
            conteudoModal: <VisFunc />,
            modalAberto: true
        })
    }

    abreCadEtapa(e: React.MouseEvent) {
        e.preventDefault()
        this.setState({
            conteudoModal: <CadEtapa />,
            modalAberto: true
        })
    }
    abreVisEtapa(e: React.MouseEvent) {
        e.preventDefault()
        this.setState({
            conteudoModal: <VisEtapa />,
            modalAberto: true
        })
    }

    abreCadPeca(e: React.MouseEvent) {
        e.preventDefault()
        this.setState({
            conteudoModal: <CadPeca />,
            modalAberto: true
        })
    }
    abreVisPeca(e: React.MouseEvent) {
        e.preventDefault()
        this.setState({
            conteudoModal: <VisPeca />,
            modalAberto: true
        })
    }

    abreCadAeronave(e: React.MouseEvent) {
        e.preventDefault()
        this.setState({
            conteudoModal: <CadAeronave />,
            modalAberto: true
        })
    }
    abreVisAeronave(e: React.MouseEvent) {
        e.preventDefault()
        this.setState({
            conteudoModal: <VisAeronave />,
            modalAberto: true
        })
    }

    abreCadTeste(e: React.MouseEvent) {
        e.preventDefault()
        this.setState({
            conteudoModal: <CadTeste />,
            modalAberto: true
        })
    }

    logout = () => {
        // Remove token e nível do usuário
        localStorage.removeItem("token");
        localStorage.removeItem("nivelPermissao");

        // Redireciona para login
        window.location.href = "/";
    };

    render() {
        const { navAberta, modalAberto, conteudoModal, dropAberto, dropAbertoLista } = this.state
        const { nivel } = this.props

        const soAdmin = nivel === NivelPermissao.ADMINISTRADOR
        const todos = nivel === NivelPermissao.ADMINISTRADOR || nivel === NivelPermissao.ENGENHEIRO || nivel === NivelPermissao.OPERADOR
        const podeCad = nivel === NivelPermissao.ADMINISTRADOR || nivel === NivelPermissao.ENGENHEIRO

        const IconeNav = navAberta ? FaChevronLeft : FaChevronRight
        return (
            <>
                <nav className={`bg-[#e2eafc] flex flex-row items-center w-full h-auto text-white fixed top-0 z-10 py-4 gap-6 md:flex-col md:min-h-screen md:py-0 md:pt-4 md:justify-start md:items-start  ${navAberta ? 'md:w-[20%] lg:w-[15%]' : 'md:w-[8%] lg:w-[5%]'}`}>
                    <button onClick={this.attNav}
                        className="absolute right-[-15px] top-6 p-2 bg-white rounded-full shadow hidden md:block">
                        <IconeNav size={10} className="text-[#135b78]" />
                    </button>
                    <section className="flex flex-col space-y-4 m-auto md:mt-6 md:ml-4">
                        {todos && (
                            <section className="space-x-12 sm:space-x-20 flex flex-row md:flex-col md:space-y-5 md:relative ">
                                <NavLink to="/home" className={`flex items-center gap-5`}>
                                    <TiHomeOutline size={30} className="text-[#135b78]" />
                                    {navAberta ? <p>Home</p> : null}
                                </NavLink>
                                <section>
                                    <NavLink to="#" className={`flex items-center gap-5`} onClick={this.abreDrop} >
                                        <IoAddCircleOutline size={30} className="text-[#135b78]" />
                                        {navAberta ? <p>Cadastrar</p> : null}
                                    </NavLink>
                                    {dropAberto && (
                                        <section className="absolute p-2 rounded-md shadow-lg space-y-2 md:top-5 md:mb-auto md:z-20 md:static">
                                            {podeCad && (
                                                <>
                                                    <NavLink to="#" className={`flex items-center gap-5`} onClick={this.abreCadAeronave}>
                                                        <FaPlaneDeparture size={30} className="text-[#135b78]" />
                                                        {navAberta ? <p>Cadastra Aeronave</p> : null}
                                                    </NavLink>
                                                    <NavLink to="/#" className={`flex items-center gap-5`} onClick={this.abreCadPeca}>
                                                        <IoAirplaneOutline size={30} className="text-[#135b78]" />
                                                        {navAberta ? <p>Cadastra Peça</p> : null}
                                                    </NavLink>
                                                    <NavLink to="/#" className={`flex items-center gap-5`} onClick={this.abreCadEtapa}>
                                                        <FaClipboardList size={30} className="text-[#135b78]" />
                                                        {navAberta ? <p>Cadastra Etapa</p> : null}
                                                    </NavLink>
                                                </>
                                            )}
                                            {todos && (
                                                <>
                                                    <NavLink to="#" className={`flex items-center gap-5`} onClick={this.abreCadTeste}>
                                                        <BsListCheck size={30} className="text-[#135b78]" />
                                                        {navAberta ? <p>Registra Teste</p> : null}
                                                    </NavLink>
                                                </>
                                            )}
                                            {soAdmin && (
                                                <NavLink to="/#" className={`flex items-center gap-5`} onClick={this.abreCadFunc}>
                                                    <BsPersonAdd size={30} className="text-[#135b78]" />
                                                    {navAberta ? <p>Cadastrar Funcionário</p> : null}
                                                </NavLink>
                                            )}
                                        </section>
                                    )}
                                </section>
                                <section>
                                    <NavLink to="#" className={`flex items-center gap-5`} onClick={this.abreDropListar} >
                                        <CiCircleList size={30} className="text-[#135b78]" />
                                        {navAberta ? <p>Listar</p> : null}
                                    </NavLink>
                                    {dropAbertoLista && (
                                        <section className="absolute p-2 rounded-md shadow-lg space-y-2 md:top-5 md:mb-auto md:z-20 md:static">
                                            <NavLink to="/aeronaves" className={`flex items-center gap-5`}>
                                                <FaPlaneDeparture size={30} className="text-[#135b78]" />
                                                {navAberta ? <p>Lista Aeronave</p> : null}
                                            </NavLink>
                                            <NavLink to="/pecas" className={`flex items-center gap-5`}>
                                                <IoAirplaneOutline size={30} className="text-[#135b78]" />
                                                {navAberta ? <p>Lista Peça</p> : null}
                                            </NavLink>
                                            <NavLink to="/funcs" className={`flex items-center gap-5`}>
                                                <BsPersonAdd size={30} className="text-[#135b78]" />
                                                {navAberta ? <p>Lista Funcionário</p> : null}
                                            </NavLink>
                                            <NavLink to="/etapas" className={`flex items-center gap-5`}>
                                                <FaClipboardList size={30} className="text-[#135b78]" />
                                                {navAberta ? <p>Lista Etapa</p> : null}
                                            </NavLink>
                                            <NavLink to="/testes" className={`flex items-center gap-5`}>
                                                <FaClipboardList size={30} className="text-[#135b78]" />
                                                {navAberta ? <p>Lista Testes</p> : null}
                                            </NavLink>
                                            <NavLink to="/relatorios" className={`flex items-center gap-5`} >
                                                <FaClipboardList size={30} className="text-[#135b78]" />
                                                {navAberta ? <p>Lista Relatórios</p> : null}
                                            </NavLink>
                                        </section>
                                    )}
                                </section>
                                
                                    <NavLink to="#" onClick={this.logout} className="flex items-center gap-5 mt-6">
                                        <FaChevronLeft size={30} className="text-[#135b78]" />
                                        {navAberta ? <p className="text-[#135b78] font-semibold">Sair</p> : null}
                                    </NavLink>
                            </section>
                        )}
                    </section>
                </nav>
                <Modal aberto={modalAberto} onFechar={() => this.setState({ modalAberto: false, conteudoModal: null })} modalClassName="mt-5 md:mt-0">
                    {conteudoModal}
                </Modal>
            </>
        )
    }
}