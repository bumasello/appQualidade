import type React from "react";
import redeDorLogo from "../assets/RDOR3.SA_BIG.png";
import { useAuth } from "@/contexts/AuthContext";

const Home: React.FC = () => {
  const { auth } = useAuth();
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <img
        src={redeDorLogo}
        alt="Logo Rede D'Or São Luiz"
        className="max-w-full h-auto max-h-24 mb-4"
      />
      <h1 className="text-3xl font-bold text-white">
        Bem-vindo ao sistema, {auth.username}!
      </h1>
      <p className="text-gray-400">Selecione uma opção no menu lateral.</p>
    </div>
  );
};

export default Home;
