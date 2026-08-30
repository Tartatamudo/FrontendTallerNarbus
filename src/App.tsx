import { useState } from "react";
import "./App.css";

export default function App() {
  const [chofer, setChofer] = useState("");
  const [maquina, setMaquina] = useState("");

  const [ruedasSeleccionadas, setRuedasSeleccionadas] = useState([]);

  const [motivo, setMotivo] = useState("");
  const [otroMotivo, setOtroMotivo] = useState("");

  const [precio, setPrecio] = useState("");
  const [foto, setFoto] = useState(null);
  const [marcaFuego, setMarcaFuego] = useState("");

  const [mensaje, setMensaje] = useState("");

  // =====================================================
  // SELECCIÓN DE RUEDA
  // =====================================================
  // Se usa un único diagrama (8 ruedas) que sirve tanto
  // para buses de 6 como de 8 ruedas: si el bus es de 6
  // ruedas, el chofer simplemente no selecciona las
  // posiciones 7 y 8.

  const seleccionarRueda = (numero) => {
    setMensaje("");

    const idRueda = `${numero}`;

    // Si se vuelve a presionar, se deselecciona
    if (ruedasSeleccionadas.includes(idRueda)) {
      setRuedasSeleccionadas(
        ruedasSeleccionadas.filter((rueda) => rueda !== idRueda)
      );
      return;
    }

    setRuedasSeleccionadas([...ruedasSeleccionadas, idRueda]);
  };

  // =====================================================
  // PRECIO
  // =====================================================

  const manejarPrecio = (event) => {
    const valor = event.target.value;

    const soloNumeros = valor.replace(/\D/g, "");

    if (soloNumeros === "") {
      setPrecio("");
      return;
    }

    const numeroFormateado = Number(
      soloNumeros
    ).toLocaleString("es-CL");

    setPrecio(numeroFormateado);
  };

  // =====================================================
  // MARCA DE FUEGO
  // =====================================================

  const manejarMarcaFuego = (event) => {
    const valor = event.target.value;

    setMarcaFuego(
      valor.replace(/\D/g, "")
    );
  };

  // =====================================================
  // FOTO
  // =====================================================

  const manejarFoto = (event) => {
    const archivo = event.target.files[0];

    if (!archivo) return;

    setFoto(archivo);
    setMensaje("");
  };

  // =====================================================
  // MOTIVO
  // =====================================================

  const seleccionarMotivo = (valor) => {
    setMotivo(valor);

    if (valor !== "Otro") {
      setOtroMotivo("");
    }

    setMensaje("");
  };

  // =====================================================
  // ENVIAR
  // =====================================================

  const enviarReporte = () => {
    setMensaje("");

    if (!chofer.trim()) {
      setMensaje("⚠️ Ingresa el nombre del chofer.");
      return;
    }

    if (!maquina.trim()) {
      setMensaje("⚠️ Ingresa el número de máquina.");
      return;
    }

    if (ruedasSeleccionadas.length === 0) {
      setMensaje("⚠️ Selecciona al menos una rueda.");
      return;
    }

    if (!motivo) {
      setMensaje("⚠️ Selecciona el motivo.");
      return;
    }

    if (motivo === "Otro" && !otroMotivo.trim()) {
      setMensaje("⚠️ Describe el motivo.");
      return;
    }

    // FOTO OBLIGATORIA
    if (!foto) {
      setMensaje(
        "⚠️ Debes adjuntar una fotografía de la boleta o comprobante."
      );
      return;
    }

    // El tipo de bus se infiere de las ruedas seleccionadas:
    // si se seleccionó la posición 7 u 8, es un bus de 8 ruedas.
    const tipoBus = ruedasSeleccionadas.some(
      (r) => r === "7" || r === "8"
    )
      ? "8 ruedas"
      : "6 ruedas";

    const reporte = {
      chofer,
      maquina,
      tipoBus,
      ruedas: ruedasSeleccionadas,
      motivo:
        motivo === "Otro"
          ? otroMotivo
          : motivo,
      precio,
      evidencia: foto,
      marcaFuego,
    };

    console.log("REPORTE:", reporte);

    setMensaje(
      "✅ Reporte enviado correctamente."
    );
  };

  // =====================================================
  // COMPONENTE RUEDA
  // =====================================================

  const Rueda = ({ numero, className }) => {
    const idRueda = `${numero}`;

    const seleccionada =
      ruedasSeleccionadas.includes(idRueda);

    return (
      <button
        type="button"
        className={`
          wheel
          ${className}
          ${seleccionada ? "wheel-selected" : ""}
        `}
        onClick={() => seleccionarRueda(numero)}
      >
        {numero}
      </button>
    );
  };

  return (
    <div className="app">

      {/* =================================================
          HEADER
      ================================================= */}

      <header className="header">
        <div className="header-content">

          <div className="header-icon">
            🚌
          </div>

          <div>
            <h1>
              Reporte de neumático
            </h1>

            <p>
              Registro de reparación
            </p>
          </div>

        </div>
      </header>


      <main className="container">

        {/* =================================================
            1. DATOS DEL CONDUCTOR
        ================================================= */}

        <section className="card">

          <div className="section-title">

            <span className="step">
              1
            </span>

            <div>
              <h2>
                Datos del conductor
              </h2>

              <p>
                Ingresa tus datos.
              </p>
            </div>

          </div>


          <div className="driver-fields">

            <div className="field">

              <label>
                Nombre del chofer *
              </label>

              <input
                type="text"
                placeholder="Ingresa tu nombre"
                value={chofer}
                onChange={(e) =>
                  setChofer(e.target.value)
                }
              />

            </div>


            <div className="field">

              <label>
                Número de máquina *
              </label>

              <input
                type="text"
                inputMode="numeric"
                placeholder="Ej: 398"
                value={maquina}
                onChange={(e) =>
                  setMaquina(
                    e.target.value.replace(
                      /\D/g,
                      ""
                    )
                  )
                }
              />

            </div>

          </div>

        </section>


        {/* =================================================
            2. RUEDAS
        ================================================= */}

        <section className="card">

          <div className="section-title">

            <span className="step">
              2
            </span>

            <div>

              <h2>
                Selecciona la rueda a cambiar
              </h2>

              <p>
                Toca el neumático con el problema.
              </p>

            </div>

          </div>


          {/* =================================================
              DIAGRAMA DE BUS
              Un solo diagrama (8 ruedas) sirve para buses
              de 6 y de 8 ruedas.
          ================================================= */}

          <div className="bus-section">

            <div className="bus-diagram">

              <div className="bus-body bus-eight">

                <span className="side-label side-copiloto">
                  LADO COPILOTO
                </span>

                <span className="side-label side-chofer">
                  LADO CHOFER
                </span>

                <span className="front-label">
                  DELANTERA
                </span>

                <span className="rear-label">
                  TRASERA
                </span>


                {/* =================================================
                    PRIMER EJE
                ================================================= */}

                <Rueda
                  numero={2}
                  className="eight-wheel-2"
                />

                <Rueda
                  numero={1}
                  className="eight-wheel-1"
                />


                {/* =================================================
                    EJE DE TRACCIÓN
                    6
                    5
                    4
                    3
                ================================================= */}

                <Rueda
                  numero={6}
                  className="eight-wheel-6"
                />

                <Rueda
                  numero={5}
                  className="eight-wheel-5"
                />

                <Rueda
                  numero={4}
                  className="eight-wheel-4"
                />

                <Rueda
                  numero={3}
                  className="eight-wheel-3"
                />


                {/* =================================================
                    ÚLTIMO EJE
                    8 arriba
                    7 abajo
                ================================================= */}

                <Rueda
                  numero={8}
                  className="eight-wheel-8"
                />

                <Rueda
                  numero={7}
                  className="eight-wheel-7"
                />

              </div>

            </div>

          </div>

        </section>


        {/* =================================================
            3. MOTIVO
        ================================================= */}

        <section className="card">

          <div className="section-title">

            <span className="step">
              3
            </span>

            <div>

              <h2>
                ¿Qué ocurrió?
                <span className="required">
                  *
                </span>
              </h2>

              <p>
                Selecciona una opción.
              </p>

            </div>

          </div>


          <div className="reason-options">

            <button
              type="button"
              className={`reason ${
                motivo === "Pinchazo"
                  ? "selected"
                  : ""
              }`}
              onClick={() =>
                seleccionarMotivo(
                  "Pinchazo"
                )
              }
            >
              <span>🔧</span>
              Pinchazo
            </button>


            <button
              type="button"
              className={`reason ${
                motivo === "Desinflado"
                  ? "selected"
                  : ""
              }`}
              onClick={() =>
                seleccionarMotivo(
                  "Desinflado"
                )
              }
            >
              <span>💨</span>
              Se desinfló
            </button>


            <button
              type="button"
              className={`reason ${
                motivo === "Reventón"
                  ? "selected"
                  : ""
              }`}
              onClick={() =>
                seleccionarMotivo(
                  "Reventón"
                )
              }
            >
              <span>💥</span>
              Reventó
            </button>


            <button
              type="button"
              className={`reason ${
                motivo === "Otro"
                  ? "selected"
                  : ""
              }`}
              onClick={() =>
                seleccionarMotivo(
                  "Otro"
                )
              }
            >
              <span>✏️</span>
              Otro motivo
            </button>

          </div>


          {motivo === "Otro" && (
            <div className="other-reason">

              <label>
                Describe lo ocurrido *
              </label>

              <textarea
                placeholder="Escribe brevemente qué ocurrió..."
                value={otroMotivo}
                onChange={(e) =>
                  setOtroMotivo(
                    e.target.value
                  )
                }
                rows="3"
              />

            </div>
          )}

        </section>


        {/* =================================================
            4 y 5. FOTO Y VALOR (misma línea)
        ================================================= */}

        <section className="card">

          <div className="combo-fields">

            {/* ---------------- 4. EVIDENCIA ---------------- */}

            <div className="combo-field">

              <div className="section-title">

                <span className="step">
                  4
                </span>

                <div>

                  <h2>
                    Boleta o comprobante
                    <span className="required">
                      *
                    </span>
                  </h2>

                  <p>
                    Foto de la boleta.
                  </p>

                </div>

              </div>


              <label className="photo-upload">

                <div className="camera">
                  📷
                </div>

                <div>

                  <strong>
                    Agregar fotografía
                  </strong>

                  <span>
                    Toca para tomar o subir una foto.
                  </span>

                </div>


                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={manejarFoto}
                />

              </label>


              {foto && (
                <div className="file-name">
                  ✓ {foto.name}
                </div>
              )}

            </div>


            {/* ---------------- 5. PRECIO ---------------- */}

            <div className="combo-field">

              <div className="section-title">

                <span className="step">
                  5
                </span>

                <div>

                  <h2>
                    Valor de la reparación
                    <span className="optional">
                      (opcional)
                    </span>
                  </h2>

                  <p>
                    Ingrese el valor pagado.
                  </p>

                </div>

              </div>


              <div className="price-input">

                <span>
                  $
                </span>

                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="Ej: 25.000"
                  value={precio}
                  onChange={manejarPrecio}
                />

              </div>

            </div>

          </div>

        </section>


        {/* =================================================
            6. MARCA DE FUEGO
        ================================================= */}

        <section className="card">

          <div className="section-title">

            <span className="step">
              6
            </span>

            <div>

              <h2>
                Marca de fuego
                <span className="optional">
                  (opcional)
                </span>
              </h2>

              <p>
                Ingresa la marca de fuego.
              </p>

            </div>

          </div>


          <input
            className="text-input"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            placeholder="Ej: 123456"
            value={marcaFuego}
            onChange={manejarMarcaFuego}
          />

        </section>


        {/* =================================================
            MENSAJE
        ================================================= */}

        {mensaje && (
          <div
            className={`message ${
              mensaje.includes("correctamente")
                ? "success"
                : "error"
            }`}
          >
            {mensaje}
          </div>
        )}


        {/* =================================================
            ENVIAR
        ================================================= */}

        <button
          type="button"
          className="submit-button"
          onClick={enviarReporte}
        >
          ✓ Enviar reporte
        </button>


        <p className="footer-help">
          Los campos marcados con * son obligatorios.
        </p>

      </main>
    </div>
  );
}
