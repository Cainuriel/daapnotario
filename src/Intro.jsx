import React from "react";
import { useEffect } from "react";
import Swal from "sweetalert2";

const Intro = () => {
  useEffect(function () {
    changeAccounts();
  }, []);

  async function init() {
    if (typeof window.ethereum !== "undefined") {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      let accountConnection = accounts[0];
      let subint = accountConnection.substr(0, 4);
      let subfinal = accountConnection.substr(-4, 4);
      document.querySelector("#intro").innerHTML =
        "conectado con la cuenta: " + subint + "..." + subfinal;
    } else {
      Swal.fire({
        title: "No tiene metamask instalado",
        text: "Cambie de navegador o puede instalárselo apretando al botón",
        showCancelButton: true,
        confirmButtonText: "Instalar",
        imageUrl: "./assets/metamask-transparent.png",
        imageAlt: "Instalar metamask",
      }).then((result) => {
        /* Read more about isConfirmed, isDenied below */
        if (result.isConfirmed) {
          window.open(
            "https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn",
            "_blank",
            'rel="noreferrer"'
          );
        }
      });
    }
  }

  // funcion que detecta los cambios de cuenta
  async function changeAccounts() {
    if (typeof window.ethereum !== "undefined") {
      window.ethereum.on("accountsChanged", async function () {
        await init();
      });
    }
  }

  function faucet() {
    window.open(
      "https://testnet.binance.org/faucet-smart",
      "_blank",
      'rel="noreferrer"'
    );
  }

  return (
    <div className="App">
      <div className="b-example-divider"></div>
      <div className="bg-dark container col-xl-10 col-xxl-8 px-4 py-5">
        <div className="row align-items-center g-lg-5 py-5">
          <h1 className="display-4 fw-bold lh-1 mb-3 text-white">
            Notario Blockchain - Registro de Documentos Hasheados
          </h1>
        </div>
      </div>
      <div className="bg-dark container col-xl-10 col-xxl-8 px-4 py-5">
        <div className="row align-items-center g-lg-5 py-5">
          <div className="col-lg-7 text-center text-lg-start">
            <h1 className="display-4 fw-bold lh-1 mb-3 text-white">
              ¿Cómo notariar documentos en una blockchain?
            </h1>
            <p className="col-lg-10 fs-4 text-white">
              La tecnología blockchain nos permite validar de forma
              absolutamente veraz la propiedad o existencia de unos datos. Su
              hasta ahora invulnerable seguridad permite que todo dato
              registrado en la blockchain quede inviolable para siempre.
            </p>
            <p className="col-lg-10 fs-4 text-white">
              Ahora bien lo que hace a la blockchain idónea para el registro de
              lo que no se debe de alterar implica unos modernos problemas en la
              gestión legal de estos datos.
            </p>
            <p className="col-lg-10 fs-4 text-white">
              Ante la legislación vigente en España, año 2022, no podemos
              registrar datos personales ante la exigencia normativa de su
              posible borrado a petición del cliente.
            </p>
            <p className="col-lg-10 fs-4 text-white">
              El registro encriptado tampoco está permitido precisamente por su
              posible desencriptación. Por tanto, la única opción posible es el
              registro de datos en forma de hash, ya que es una encriptación
              irreversible.
            </p>
            <p className="col-lg-10 fs-4 text-white">
              Solo el creador del hash conoce el origen de los datos hasheados,
              que en éste caso será un notario que pretende verificar a quien lo
              solicite la veracidad de un documento existente, representado en
              la Blockchain con su único hash.
            </p>
          </div>
          <div className="col-md-10 mx-auto col-lg-5">
            <a
              href="./assets/dibujo.jpg"
              target={"_blank"}
              lang="logo de notarios de españa"
            >
              <img
                src="./assets/dibujo.jpg"
                width="300"
                alt="logo de notarios de españa"
              />
            </a>
          </div>
        </div>
      </div>
      <div className="bg-dark container col-xl-10 col-xxl-8 px-4 py-5">
        <div className="row align-items-center g-lg-5 py-5">
          <div className="col-lg-7 text-center text-lg-start">
            <h2 className="display-4 fw-bold lh-1 mb-3 text-white">
              Usaremos la red Binance Smart Chain
            </h2>
            <p className="col-lg-10 fs-4 text-white">
              Lo primero, deme su permiso para conectarme a su Metamask. La
              conexión automática de su metamask por parte de una dAPP es una
              mala práctica. Téngalo en cuenta a la hora de crear la suya.{" "}
            </p>
            <p className="col-lg-10 fs-4 text-white">
              Si no tiene BNBs de prueba para hacer el tutorial apriete el botón
              azul para poder reclamar tokens y así poder pagar las
              transacciones.
            </p>
          </div>
          <div className="col-md-10 mx-auto col-lg-5">
            <button
              id="btn-firma"
              onClick={() => init()}
              className="w-100 btn btn-lg btn-danger mb-4"
              type="button"
            >
              Conectar Metamask
            </button>
            <button
              id="faucet"
              onClick={() => faucet()}
              className="w-100 btn btn-lg btn-primary"
              type="button"
            >
              Faucet de Binance
            </button>
            <hr className="my-4" />
            <form className="p-4 p-md-5 border rounded-3 bg-light">
              <div className="form-floating mb-3"></div>
              <hr className="my-4" />
              <small id="intro" className="text-muted">
                No conectado
              </small>
            </form>
            <div></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Intro;
