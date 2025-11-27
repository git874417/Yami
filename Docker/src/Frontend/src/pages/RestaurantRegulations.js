import React, { useEffect } from 'react';
import '../css/RestaurantRegulations.css';
import { useScrollToTop } from '../hooks/useScrollToTop';

const RestaurantRegulations = () => {
  useScrollToTop();

  return (
    <div className="regulations-container">
      <div className="regulations-header">
        <h1>Normativa para Restaurantes</h1>
        <p>Guía de buenas prácticas y condiciones de servicio para colaboradores de Yami</p>
      </div>

      <div className="regulation-section">
        <h2>1. Registro y Verificación</h2>
        <p>Para garantizar la seguridad y calidad de nuestra plataforma, todos los restaurantes deben cumplir con los siguientes requisitos de registro:</p>
        <ul>
          <li>Proporcionar información veraz y actualizada sobre el establecimiento (CIF, dirección, teléfono).</li>
          <li>Mantener actualizada la información de contacto para la gestión de incidencias.</li>
          <li>Subir un logotipo o imagen representativa de alta calidad que identifique claramente al restaurante.</li>
        </ul>
      </div>

      <div className="regulation-section">
        <h2>2. Gestión de Platos y Menú</h2>
        <p>La transparencia es fundamental para nuestros clientes. Al dar de alta platos en la plataforma:</p>
        <ul>
          <li><strong>Información de Alérgenos:</strong> Es obligatorio indicar correctamente los alérgenos de cada plato para garantizar la seguridad alimentaria de los clientes.</li>
          <li><strong>Fotografías:</strong> Las imágenes de los platos deben ser reales y corresponderse con el producto final entregado.</li>
          <li><strong>Categorización:</strong> Los platos deben clasificarse correctamente (Entrante, Principal, Postre, Bebida) para el correcto funcionamiento de los filtros de búsqueda.</li>
          <li><strong>Descripción:</strong> Se debe incluir una descripción detallada de los ingredientes y método de preparación.</li>
        </ul>
      </div>

      <div className="regulation-section">
        <h2>3. Sistema de Créditos (Yameats)</h2>
        <p>Yami opera bajo un sistema de créditos digital. Como restaurante colaborador:</p>
        <ul>
          <li>Los precios de los platos se establecen en Yameats.</li>
          <li>El restaurante recibirá la compensación correspondiente a los Yameats generados por sus ventas según el acuerdo comercial vigente.</li>
        </ul>
      </div>

      <div className="regulation-section">
        <h2>4. Gestión de Pedidos y Tiempos</h2>
        <p>La puntualidad y la comunicación son clave para una buena experiencia de usuario:</p>
        <ul>
          <li><strong>Actualización de Estado:</strong> El restaurante debe actualizar el estado del pedido en tiempo real (Encargado → En preparación → En reparto).</li>
          <li><strong>Tiempos de Preparación:</strong> Se deben respetar los tiempos estimados de preparación para evitar esperas innecesarias a los repartidores o clientes.</li>
          <li><strong>Cancelaciones:</strong> Las cancelaciones injustificadas de pedidos aceptados pueden conllevar penalizaciones en la visibilidad del restaurante.</li>
        </ul>
        <div className="important-note">
          Nota: Un alto índice de cancelaciones o retrasos puede afectar negativamente al posicionamiento de su restaurante en la plataforma.
        </div>
      </div>

      <div className="regulation-section">
        <h2>5. Calidad y Valoraciones</h2>
        <p>Nuestros clientes valoran su experiencia después de cada pedido:</p>
        <ul>
          <li>Las valoraciones se basan en la calidad de la comida, la presentación y la puntualidad.</li>
          <li>Yami se reserva el derecho de suspender temporalmente cuentas con valoraciones consistentemente bajas para investigar las causas.</li>
        </ul>
      </div>

      <div className="regulation-section">
        <h2>6. Sanciones y Cumplimiento</h2>
        <p>El incumplimiento de estas normas puede resultar en:</p>
        <ul>
          <li>Avisos formales por parte de la administración.</li>
          <li>Suspensión temporal de la cuenta del restaurante.</li>
          <li>Baja definitiva de la plataforma en casos graves o reincidentes.</li>
        </ul>
      </div>
    </div>
  );
};

export default RestaurantRegulations;
