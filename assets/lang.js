// assets/lang.js
(function () {
  const cfg = JSON.parse(localStorage.getItem("configAgroScan")) || {};
  const lang = (cfg.preferencias && cfg.preferencias.idioma) || "pt-BR";

  const textos = {
    "pt-BR": {
      titulo_dashboard: "Life Tech Pro — Dashboard",
      titulo: "Life Tech Pro",
      menu: {
        cadastrar: "Cadastrar",
        emprestimos: "Empréstimos",
        registro: "Registro Detalhado",
        relatorios: "Relatórios",
        graficos: "Gráficos",
        configuracoes: "Configurações"
      },
      cargo_admin: "Administrador",
      atalhos: "Atalhos",
      novo: "+ Novo",
      relatorio: "Relatório",
      atualizacoes_time: "Atualizações da Equipe",
      noticias_rapidas: "Últimas notícias e notas rápidas",
      registrar_emprestimo: "Registrar Empréstimo",
      desc_registrar_emprestimo: "Abra o formulário para cadastrar novo empréstimo",
      emprestimos_registrados: "Empréstimos Registrados",
      desc_emprestimos_registrados: "Ver resumo, editar ou excluir clientes",
      registro_detalhado: "Registro Detalhado",
      desc_registro_detalhado: "Editar múltiplos empréstimos por cliente",
      relatorios: "Relatórios",
      desc_relatorios: "Gerar PDF ou CSV de registros",
      graficos: "Gráficos",
      desc_graficos: "Visão gráfica por cliente",
      configuracoes: "Configurações",
      desc_configuracoes: "Preferências do sistema",
      rodape: "© 2025 — Life Tech Pro · Interface Futurista"
    },

    "en-US": {
      titulo_dashboard: "Life Tech Pro — Dashboard",
      titulo: "Life Tech Pro",
      menu: {
        cadastrar: "Register",
        emprestimos: "Loans",
        registro: "Detailed Record",
        relatorios: "Reports",
        graficos: "Charts",
        configuracoes: "Settings"
      },
      cargo_admin: "Administrator",
      atalhos: "Shortcuts",
      novo: "+ New",
      relatorio: "Report",
      atualizacoes_time: "Team Updates",
      noticias_rapidas: "Latest news and quick notes",
      registrar_emprestimo: "Register Loan",
      desc_registrar_emprestimo: "Open the form to register a new loan",
      emprestimos_registrados: "Registered Loans",
      desc_emprestimos_registrados: "View summary, edit or delete clients",
      registro_detalhado: "Detailed Record",
      desc_registro_detalhado: "Edit multiple loans per client",
      relatorios: "Reports",
      desc_relatorios: "Generate PDF or CSV records",
      graficos: "Charts",
      desc_graficos: "Graphical view by client",
      configuracoes: "Settings",
      desc_configuracoes: "System preferences",
      rodape: "© 2025 — Life Tech Pro · Futuristic Interface"
    },

    "es-ES": {
      titulo_dashboard: "Life Tech Pro — Panel",
      titulo: "Life Tech Pro",
      menu: {
        cadastrar: "Registrar",
        emprestimos: "Préstamos",
        registro: "Registro Detallado",
        relatorios: "Informes",
        graficos: "Gráficos",
        configuracoes: "Configuraciones"
      },
      cargo_admin: "Administrador",
      atalhos: "Atajos",
      novo: "+ Nuevo",
      relatorio: "Informe",
      atualizacoes_time: "Actualizaciones del Equipo",
      noticias_rapidas: "Últimas noticias y notas rápidas",
      registrar_emprestimo: "Registrar Préstamo",
      desc_registrar_emprestimo: "Abre el formulario para registrar un nuevo préstamo",
      emprestimos_registrados: "Préstamos Registrados",
      desc_emprestimos_registrados: "Ver resumen, editar o eliminar clientes",
      registro_detalhado: "Registro Detallado",
      desc_registro_detalhado: "Editar múltiples préstamos por cliente",
      relatorios: "Informes",
      desc_relatorios: "Generar registros PDF o CSV",
      graficos: "Gráficos",
      desc_graficos: "Vista gráfica por cliente",
      configuracoes: "Configuraciones",
      desc_configuracoes: "Preferencias del sistema",
      rodape: "© 2025 — Life Tech Pro · Interfaz Futurista"
    }
  };

  // === Função de tradução ===
  function applyTranslation(langCode) {
    const t = textos[langCode] || textos["pt-BR"];

    document.querySelectorAll("[data-i18n]").forEach(el => {
      const key = el.dataset.i18n;
      const parts = key.split(".");
      let value = t;
      for (const p of parts) value = value?.[p];
      if (typeof value === "string") {
        if (el.placeholder !== undefined && el.tagName === "INPUT")
          el.placeholder = value;
        else
          el.textContent = value;
      }
    });

    // Atualiza título da aba
    const titleEl = document.querySelector("title[data-i18n]");
    if (titleEl) titleEl.textContent = t.titulo_dashboard || document.title;
  }

  // Aplica idioma atual
  applyTranslation(lang);

  // Disponibiliza função global
  window.setLanguage = function(langCode) {
    const config = JSON.parse(localStorage.getItem("configAgroScan")) || {};
    if (!config.preferencias) config.preferencias = {};
    config.preferencias.idioma = langCode;
    localStorage.setItem("configAgroScan", JSON.stringify(config));
    applyTranslation(langCode);
  };
})();
