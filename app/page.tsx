"use client";

import { useState, useEffect } from "react";
import { LoginScreen } from "@/components/login-screen";
import { RegisterScreen } from "@/components/register-screen";
import { TaskDashboard } from "@/components/task-dashboard";
import { authService } from "@/lib/api";

type Screen = "login" | "register" | "dashboard";

export default function Home() {
  const [screen, setScreen] = useState<Screen>("login");
  const [userName, setUserName] = useState<string>("");

  // Verifica se o usuário já está logado ao carregar a página
  useEffect(() => {
    const storedUser = localStorage.getItem('@Revelatio:user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setUserName(user.name);
        setScreen("dashboard");
      } catch (e) {
        console.error("Erro ao ler usuário do localStorage");
      }
    }
  }, []);

  // Lembre-se de atualizar o LoginScreen para passar a senha (password)
  const handleLogin = async (email: string, password?: string) => {
    try {
      if (!password) {
        alert("A senha é obrigatória para conectar à API.");
        return;
      }

      const { user } = await authService.login(email, password);

      setUserName(user.name);
      setScreen("dashboard");
    } catch (error) {
      console.error("Erro no login:", error);
      alert("Falha ao fazer login. Verifique suas credenciais.");
    }
  };

  // Lembre-se de atualizar o RegisterScreen para passar a senha (password)
  const handleRegister = async (name: string, email: string, password?: string) => {
    try {
      if (!password) {
        alert("A senha é obrigatória para criar a conta.");
        return;
      }

      await authService.register(name, email, password);

      alert("Conta criada com sucesso! Por favor, faça login.");
      setScreen("login");
    } catch (error) {
      console.error("Erro no cadastro:", error);
      alert("Falha ao registrar. Tente novamente.");
    }
  };

  const handleLogout = () => {
    authService.logout();
    setUserName("");
    setScreen("login");
  };

  if (screen === "register") {
    return (
      <RegisterScreen
        onRegister={handleRegister}
        onBackToLogin={() => setScreen("login")}
      />
    );
  }

  if (screen === "dashboard") {
    return <TaskDashboard userEmail={userName} onLogout={handleLogout} />;
  }

  return (
    <LoginScreen
      onLogin={handleLogin}
      onCreateAccount={() => setScreen("register")}
    />
  );
}