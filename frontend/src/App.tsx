// src/App.tsx
import Aside from "./components/Aside";
import redeDorLogo from "./assets/RDOR3.SA_BIG.png";

function App() {
  return (
    // 1. Div externa para o background completo da tela
    <div className="h-screen w-screen bg-gray-800">
      <div className="flex h-full items-stretch">
        <Aside>
          <nav className="space-y-2 ">
            <a
              href="#"
              className="transition-all duration-300 ease-in-out block p-2 rounded-xl mx-2 hover:bg-gray-700"
            >
              Dashboard
            </a>
            <a
              href="#"
              className="transition-all duration-300 ease-in-out block p-2 rounded-xl mx-2 hover:bg-gray-700"
            >
              Configurações
            </a>
            <a
              href="#"
              className="transition-all duration-300 ease-in-out block p-2 rounded-xl mx-2 hover:bg-gray-700"
            >
              Relatórios
            </a>
          </nav>
        </Aside>
        <main className="flex-1 p-8 text-white overflow-y-auto flex items-center justify-center">
          <img
            src={redeDorLogo}
            alt="Logo Rede D'Or São Luiz"
            className="max-w-full h-auto max-h-24"
          />
        </main>
      </div>
    </div>
  );
}

export default App;
