import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Line, Doughnut, Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import Modal from "../components/Modal";
import LoadingScreen from "../components/LoadingScreen";
import "../css/AdminStats.css";

// Registrar componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const AdminStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalState, setModalState] = useState({ isOpen: false, title: "", message: "" });
  const navigate = useNavigate();
  const API_BASE = process.env.REACT_APP_API_BASE_URL || "http://127.0.0.1:8000";

  useEffect(() => {
    // Verificar que es admin
    const role = sessionStorage.getItem("role");
    if (role !== "Admin" && role !== "admin") {
      navigate("/");
      return;
    }

    fetchStats();

    // Configurar intervalo de actualización automática (cada 10 segundos, sin pantalla de carga)
    const intervalId = setInterval(() => {
      fetchStats(false);
    }, 10000);

    // Limpiar intervalo al desmontar componente
    return () => clearInterval(intervalId);
  }, [navigate]);

  const fetchStats = async (showLoading = true) => {
    if (showLoading) {
      setLoading(true);
    }
    try {
      const response = await fetch(`${API_BASE}/api/admin/stats`);
      if (!response.ok) {
        throw new Error("Error al cargar estadísticas");
      }
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error("Error:", error);
      if (showLoading) {
        setModalState({
          isOpen: true,
          title: "Error",
          message: "Error al cargar las estadísticas",
        });
      }
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  };

  if (loading) {
    return <LoadingScreen />;
  }

  if (!stats) {
    return (
      <div className="admin-stats-page">
        <p>No hay datos disponibles</p>
      </div>
    );
  }

  // Datos para GMV (Gross Merchandise Value) - Gráfica de línea
  const gmvData = {
    labels: stats.gmv_timeline.map((item) => item.date),
    datasets: [
      {
        label: "GMV (Yameats)",
        data: stats.gmv_timeline.map((item) => item.value),
        borderColor: "rgb(30, 58, 95)",
        backgroundColor: "rgba(30, 58, 95, 0.1)",
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const gmvOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "GMV - Gross Merchandise Value (Tiempo real)",
        font: {
          size: 16,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  // Datos para Tasa de Conversión (Funnel)
  const funnelData = {
    labels: ["Total Usuarios", "Añadieron al Carrito", "Pagaron", "Entregado"],
    datasets: [
      {
        label: "Usuarios",
        data: [
          stats.funnel.total_users,
          stats.funnel.added_to_cart,
          stats.funnel.paid,
          stats.funnel.delivered,
        ],
        backgroundColor: [
          "rgba(30, 58, 95, 0.9)",
          "rgba(44, 82, 130, 0.9)",
          "rgba(66, 153, 225, 0.9)",
          "rgba(255, 140, 0, 0.9)",
        ],
      },
    ],
  };

  const funnelOptions = {
    indexAxis: "y",
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: "Tasa de Conversión - Funnel de Ventas",
        font: {
          size: 16,
        },
      },
    },
    scales: {
      x: {
        beginAtZero: true,
      },
    },
  };

  // Datos para Top Restaurantes vs Bottom
  const topRestaurants = stats.top_restaurants.slice(0, 5);
  const bottomRestaurants = stats.bottom_restaurants.slice(0, 5);

  const restaurantsData = {
    labels: [
      ...topRestaurants.map((r) => r.name),
      ...bottomRestaurants.map((r) => r.name),
    ],
    datasets: [
      {
        label: "Pedidos Completados",
        data: [
          ...topRestaurants.map((r) => r.completed_orders),
          ...bottomRestaurants.map((r) => r.completed_orders),
        ],
        backgroundColor: [
          ...topRestaurants.map(() => "rgba(34, 197, 94, 0.8)"),
          ...bottomRestaurants.map(() => "rgba(239, 68, 68, 0.8)"),
        ],
      },
    ],
  };

  const restaurantsOptions = {
    indexAxis: "y",
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: "Top 5 vs Bottom 5 Restaurantes",
        font: {
          size: 16,
        },
      },
    },
    scales: {
      x: {
        beginAtZero: true,
      },
    },
  };

  // Datos para Pedidos Cancelados vs Completados (Donut Chart)
  const ordersStatusData = {
    labels: ["Completados", "Cancelados", "En Progreso"],
    datasets: [
      {
        data: [
          stats.orders_status.completed,
          stats.orders_status.cancelled,
          stats.orders_status.in_progress,
        ],
        backgroundColor: [
          "rgba(34, 197, 94, 0.8)",
          "rgba(239, 68, 68, 0.8)",
          "rgba(30, 58, 95, 0.8)",
        ],
        borderWidth: 2,
        borderColor: "#fff",
      },
    ],
  };

  const ordersStatusOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
      },
      title: {
        display: true,
        text: "Estado de Pedidos",
        font: {
          size: 16,
        },
      },
    },
  };

  const cancellationRate = (
    (stats.orders_status.cancelled /
      (stats.orders_status.completed + stats.orders_status.cancelled + stats.orders_status.in_progress)) *
    100
  ).toFixed(2);

  // Datos para Tipos de Platos (Pie Chart)
  const dishTypesData = {
    labels: ["Entrantes", "Principales", "Postres", "Bebidas"],
    datasets: [
      {
        data: [
          stats.dish_types.Entrante,
          stats.dish_types.Principal,
          stats.dish_types.Postre,
          stats.dish_types.Bebida,
        ],
        backgroundColor: [
          "rgba(255, 140, 0, 0.8)",
          "rgba(30, 58, 95, 0.8)",
          "rgba(34, 197, 94, 0.8)",
          "rgba(147, 51, 234, 0.8)",
        ],
        borderWidth: 2,
        borderColor: "#fff",
      },
    ],
  };

  const dishTypesOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
      },
      title: {
        display: true,
        text: "Distribución de Tipos de Platos Pedidos",
        font: {
          size: 16,
        },
      },
    },
  };

  return (
    <div className="admin-stats-page">
      <Modal
        isOpen={modalState.isOpen}
        onClose={() => setModalState({ isOpen: false, title: "", message: "" })}
        title={modalState.title}
        actions={[
          {
            label: "Cerrar",
            onClick: () => setModalState({ isOpen: false, title: "", message: "" }),
          },
        ]}
      >
        <p>{modalState.message}</p>
      </Modal>

      <div className="stats-container">
        <header className="stats-header">
          <h1>📊 Estadísticas de la Plataforma</h1>
          <button className="btn-back" onClick={() => navigate("/admin")}>
            ← Volver al Panel
          </button>
        </header>

        {/* KPIs principales */}
        <div className="kpis-grid">
          <div className="kpi-card">
            <div className="kpi-icon">💰</div>
            <div className="kpi-content">
              <h3>GMV Total</h3>
              <p className="kpi-value">{stats.total_gmv.toLocaleString()} Yameats</p>
              <span className="kpi-label">Gross Merchandise Value</span>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-icon">🎯</div>
            <div className="kpi-content">
              <h3>Tasa de Conversión</h3>
              <p className="kpi-value">{stats.conversion_rate}%</p>
              <span className="kpi-label">Usuarios que completan pedidos</span>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-icon">🍽️</div>
            <div className="kpi-content">
              <h3>Ticket Medio (AOV)</h3>
              <p className="kpi-value">{stats.average_order_value.toFixed(2)} Yameats</p>
              <span className="kpi-label">Average Order Value</span>
            </div>
          </div>

          <div className={`kpi-card ${parseFloat(cancellationRate) > 5 ? "kpi-alert" : ""}`}>
            <div className="kpi-icon">❌</div>
            <div className="kpi-content">
              <h3>Tasa de Cancelación</h3>
              <p className="kpi-value">{cancellationRate}%</p>
              <span className="kpi-label">
                {parseFloat(cancellationRate) > 5 ? "⚠️ Por encima del 5%" : "✓ Dentro del rango"}
              </span>
            </div>
          </div>
        </div>

        {/* Gráficas */}
        <div className="charts-grid">
          {/* GMV Timeline */}
          <div className="chart-card chart-large">
            <div className="chart-wrapper">
              <Line data={gmvData} options={gmvOptions} />
            </div>
            <div className="chart-info">
              <p>
                Muestra el valor total de Yameats que fluyen por la plataforma antes de descontar gastos. Es
                la métrica de crecimiento principal.
              </p>
            </div>
          </div>

          {/* Funnel de Conversión */}
          <div className="chart-card chart-large">
            <div className="chart-wrapper">
              <Bar data={funnelData} options={funnelOptions} />
            </div>
            <div className="chart-info">
              <p>
                Muestra el recorrido del usuario: desde que visita la app hasta que recibe su pedido. Ayuda a
                detectar dónde se pierden ventas.
              </p>
            </div>
          </div>

          {/* Top vs Bottom Restaurantes */}
          <div className="chart-card chart-large">
            <div className="chart-wrapper">
              <Bar data={restaurantsData} options={restaurantsOptions} />
            </div>
            <div className="chart-info">
              <p>
                Identifica qué restaurantes generan más ingresos (verde) y cuáles tienen menor rendimiento
                (rojo). Los top 5 son los que sostienen la plataforma.
              </p>
            </div>
          </div>

          {/* Estado de Pedidos */}
          <div className="chart-card">
            <div className="chart-wrapper chart-donut">
              <Doughnut data={ordersStatusData} options={ordersStatusOptions} />
            </div>
            <div className="chart-info">
              <p>
                Si las cancelaciones superan el 3-5%, existe un problema grave de operativa o técnico que debe
                resolverse inmediatamente.
              </p>
            </div>
          </div>

          {/* Distribución de Tipos de Platos */}
          <div className="chart-card">
            <div className="chart-wrapper chart-donut">
              <Pie data={dishTypesData} options={dishTypesOptions} />
            </div>
            <div className="chart-info">
              <p>
                Muestra qué tipo de alimentos prefieren los clientes. Ayuda a identificar tendencias de
                consumo y optimizar el menú de los restaurantes en la plataforma.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminStats;
