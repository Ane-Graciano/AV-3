import React, { useState, useMemo, useEffect } from 'react';
import NavBar from '../components/navbar';
import { getNivelAcesso } from '../utils/autenticacao';

// NOTA: Assumindo que a URL correta do backend é http://localhost:3000/api
const url = import.meta.env.VITE_API_URL;

interface Funcionario {
  id: string
  nivel: string
}
interface Etapa {
  id: string
  statusEtapa: string
}
interface Aeronave { id: string }
interface Teste {
  id: string
  resultado: string
}
interface DadosDashboard {
  totalFuncionarios: number
  totalAeronaves: number
  etapasConcluidas: number
  etapasEmAndamento: number
  testesReprovados: number
}

const CardBlock: React.FC<{ title: string; value: number | string; metric: string; }> = ({ title, value, metric }) => (
  <section className="p-4 w-96 h-32 bg-white border border-gray-200 rounded-xl shadow-sm flex flex-col justify-center items-center hover:shadow-lg transition duration-300">
    <p className="text-gray-500 text-sm font-medium">{title}</p>
    <h3 className="text-4xl font-extrabold text-[#3a6ea5] mt-1">{value}</h3>
    <span className="text-xs text-gray-400 mt-1">{metric}</span>
  </section>
);


function App() {
  const nivelAcesso = useMemo(() => getNivelAcesso(), [])
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [dados, setDados] = useState<DadosDashboard | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchDashboardData = async () => {
    const token = localStorage.getItem("token"); // 🔑 Busca o token

    if (!token) {
      setError("Usuário não autenticado. Token não encontrado.");
      setLoading(false);
      return;
    }

    if (!url) {
      setError("Variável de ambiente url não está configurada.");
      setLoading(false);
      return;
    }

    try {
      // 1. Mapeamento dos endpoints para rotas completas (assumindo '/aeronaves' e '/etapas')
      const endpointMap: { [key: string]: string } = {
        funcionarios: `${url}/funcionarios`,
        // Ajustado de '/etapa' para '/etapas' (Mais comum para listar todos)
        etapa: `${url}/etapas`,
        testes: `${url}/testes`,
        // Ajustado de '/aeronave' para '/aeronaves' (Mais comum para listar todos)
        aeronave: `${url}/aeronaves`,
      };

      const endpoints = ['funcionarios', 'etapa', 'testes', 'aeronave'];

      // 2. Adiciona o Header de Autorização em TODAS as requisições
      const requests = endpoints.map(endpoint =>
        fetch(endpointMap[endpoint], {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
      );

      const responses = await Promise.all(requests)

      for (const res of responses) {
        if (!res.ok) {
          // 🛑 Captura o erro 401 ou 404
          throw new Error(`Falha ao carregar o endpoint: ${res.url} (Status: ${res.status})`)
        }
      }

      const [funcionarios, etapa, testes, aeronave] = await Promise.all(
        responses.map(res => res.json())
      )

      // O restante da lógica de processamento de dados permanece a mesma

      const totalFuncionarios = funcionarios.length
      const totalAeronaves = aeronave.length

      const etapas = etapa as Etapa[]

      const etapasEmAndamento = etapas.filter(e =>
        (e.statusEtapa || '').toLowerCase().includes('andamento')
      ).length

      const etapasConcluidas = etapas.filter(e =>
        (e.statusEtapa || '').toLowerCase().includes('concluida')
      ).length

      const testesArray = testes as Teste[]
      const testesReprovados = testesArray.filter(t =>
        (t.resultado || '').toLowerCase() === 'reprovado'
      ).length

      setDados({
        totalFuncionarios,
        totalAeronaves,
        etapasEmAndamento,
        etapasConcluidas,
        testesReprovados,
      });

    } catch (err) {
      console.error(err);
      // 🔑 Verifica se o erro é 401 para dar feedback correto ao usuário
      const errorMessage = err instanceof Error ? err.message : String(err);
      if (errorMessage.includes('Status: 401')) {
        setError("Acesso negado. Você precisa estar logado para ver o Dashboard.");
      } else if (errorMessage.includes('Status: 404')) {
        setError(`Erro de Rota (404). Verifique se os endpoints /etapas e /aeronaves estão configurados corretamente no Backend. Erro completo: ${errorMessage}`);
      } else {
        setError("Erro ao carregar dados do Dashboard. Verifique se o Backend está rodando.");
      }
    } finally {
      setLoading(false)
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // ... (O restante do componente render)
  if (loading) {
    return (
      <section className="flex justify-center items-center h-screen bg-gray-100">
        <p className="text-xl text-[#3a6ea5] font-semibold">Carregando dados do Dashboard...</p>
      </section>
    )
  }

  if (error) {
    return (
      <section className="flex justify-center items-center h-screen bg-red-100 p-4">
        <p className="text-xl text-red-700 font-semibold">Erro: {error}</p>
      </section>
    )
  }

  return (
    <section className="flex w-screen h-screen">
      <section className=''>
        <NavBar nivel={nivelAcesso} />
      </section>

      {isMenuOpen && (
        <section
          className="fixed inset-0 bg-black opacity-50 z-10 lg:hidden"
          onClick={() => setIsMenuOpen(false)}
        />
      )}
      <main className="p-4 md:p-8 md:ml-14 lg:ml-16 overflow-y-auto">
        <section>
          <h1 className="mt-20 mb-5 md:mt-0 text-3xl font-bold text-gray-800 lg:mb-24">Dashboard Home</h1>
        </section>
        <section>
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7 space-y-5 md:space-y-20">

            <CardBlock
              title="Total de Funcionários"
              value={dados?.totalFuncionarios || 0}
              metric="Cadastrados"
            />
            <CardBlock
              title="Total de Aeronaves"
              value={dados?.totalAeronaves || 0}
              metric="Modelos Únicos"
            />
            <CardBlock
              title="Etapas Concluídas"
              value={dados?.etapasConcluidas || 0}
              metric="Finalizadas no Sistema"
            />
            <CardBlock
              title="Etapas Em Andamento"
              value={dados?.etapasEmAndamento || 0}
              metric="Foco Prioritário"
            />
            <CardBlock
              title="Testes Reprovados"
              value={dados?.testesReprovados || 0}
              metric="Necessita Reavaliação"
            />
            <CardBlock
              title="Nível de Acesso"
              value={nivelAcesso.toUpperCase()}
              metric="Seu Perfil"
            />
          </section>
        </section>

      </main>
    </section>
  );
}

export default App;