import { useEffect, useState } from "react";
import React from "react";
import { ethers } from "ethers";
import Notario from "./artifacts/contracts/Notario.json";
import Swal from "sweetalert2";

const Solidity = () => {
  const [inputData, setInputData] = useState("");
  const [accountNotarizer, setAccountNotarizer] = useState("");
  const [rootHook, setRootHook] = useState("");
  const [buyNFTOk, setBuyNFTOk] = useState(false);
  const [hashHook, setHashHook] = useState("");
  const [network, setNetwork] = useState("no-net");
  const [register, setRegister] = useState(null);
  const nftContract = "0x9DD80a68E1332Bd0cA7302785093AF11C065Aa27"; // bsc testnet 25/10/22
  const BINANCENETWORK = "bnbt";
  const [doubleCheck, setDoubleChek] = useState(false);

  async function setDataToHash() {
    const hashFromEthers = await ethers.utils.keccak256(
      ethers.utils.toUtf8Bytes("hello world")
    );
    setHashHook(hashFromEthers);
  }

  async function setNotarizer() {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(nftContract, Notario.abi, signer);

    try {
      await contract.callStatic.setNotarizedAddress(accountNotarizer);
      const tx = await contract.setNotarizedAddress(accountNotarizer);
      Swal.fire({
        title: "Procesando el registro de su cuenta Notario",
        text: "Espere, y no actualice la página",
        // icon: 'info',
        showConfirmButton: false,
        imageUrl:
          "https://thumbs.gfycat.com/ConventionalOblongFairybluebird-size_restricted.gif",
        imageWidth: 100,
        imageHeight: 100,
        imageAlt: "Procesando su registro",
      });
      const Ok = await tx.wait();
      if (Ok) {
        Swal.fire({
          title: `Se ha procesado el registro`,
          html: `<a href="https://testnet.bscscan.com/tx/${tx.hash}" target="_blank" rel="noreferrer">Hash de la transacción</a>`,
          icon: "success",
          confirmButtonText: "Cerrar",
        });
      }
    } catch (err) {
      let mensajeError = err.reason;
      Swal.fire({
        title: "Ooops!",
        text: `${mensajeError}`,
        icon: "error",
        confirmButtonText: "Cerrar",
      });
      console.log("Error: ", err);
    }
  }

  //captura la blockchain del usuario
  async function checkingNetwork(networkFromMetamask) {
    if (networkFromMetamask.name !== BINANCENETWORK) {
      Swal.fire({
        title: "¡Cuidado!",
        text: "Estás en la red " + networkFromMetamask.name,
        showCancelButton: true,
        confirmButtonText: "Cambiate o instalate " + BINANCENETWORK,
        imageUrl:
          "https://img.capital.com/imgs/articles/1200x627x1/shutterstock_2007471221_2.png",
        imageWidth: 300,

        imageAlt: "Network BSC",
      }).then((result) => {
        /* Read more about isConfirmed, isDenied below */
        if (result.isConfirmed) {
          addNetwork();
          return false;
        } else {
          window.location.reload();
        }
      });
    } else {
      return true;
    }
  }

  // funcion que cambia hacia o instala la red en uso
  async function addNetwork() {
    let networkData = [
      {
        chainId: "0x61",
        chainName: "BSCTESTNET",
        rpcUrls: ["https://data-seed-prebsc-1-s1.binance.org:8545"],
        nativeCurrency: {
          name: "BINANCE COIN",
          symbol: "BNB",
          decimals: 18,
        },
        blockExplorerUrls: ["https://testnet.bscscan.com/"],
      },
    ];

    // agregar red o cambiar red
    return window.ethereum.request({
      method: "wallet_addEthereumChain",
      params: networkData,
    });
  }

  async function notarizeWithoutSign() {
    
    if (!doubleCheck) {
      setDoubleChek(true);
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const networkFromMetamask = await provider.getNetwork();
      if (! await checkingNetwork(networkFromMetamask)) {
        return;
      }
      const signer = provider.getSigner();
      const contract = new ethers.Contract(nftContract, Notario.abi, signer);
      console.log("el hook hash ", hashHook);
      try {
        await contract.callStatic.notarizeWithoutSign(hashHook);
        const tx = await contract.notarizeWithoutSign(hashHook);
        Swal.fire({
          title: "Procesando el registro de su documento",
          text: "Espere, y no actualice la página",
          // icon: 'info',
          showConfirmButton: false,
          imageUrl:
            "https://thumbs.gfycat.com/ConventionalOblongFairybluebird-size_restricted.gif",
          imageWidth: 100,
          imageHeight: 100,
          imageAlt: "Procesando su registro",
        });
        const Ok = await tx.wait();
        if (Ok) {
          Swal.fire({
            title: `Se ha procesado el registro de su documento`,
            html: `<a href="https://testnet.bscscan.com/tx/${tx.hash}" target="_blank" rel="noreferrer">Hash de la transacción</a>`,
            icon: "success",
            confirmButtonText: "Cerrar",
          });
          setDoubleChek(false);
        }
      } catch (err) {
        let mensajeError = err.reason;
        Swal.fire({
          title: "Ooops!",
          text: `${mensajeError}`,
          icon: "error",
          confirmButtonText: "Cerrar",
        });
        console.log("Error: ", err);
        setDoubleChek(false);
      }
    }
  }

  return (
    <div className="">
      <div className="bg-dark container col-xl-10 col-xxl-8 px-4 py-5">
        <div className="row">
          <div className="col-lg-7 text-center text-lg-start">
            <h2 className="display-4 fw-bold lh-1 mb-3 text-white">
              ¿Qué vamos hacer?
            </h2>
            <p className="col-lg-12 fs-4 text-white">
              Lo primero que tendrá que hacer es convertirse en Notario. Como
              esta dApp dispone de un fin divulgativo éste registro está abierto
              para todo el mundo.
            </p>
            <p className="col-lg-12 fs-4 text-white">
              Se comprenderá que esto no ha de ser así en otro tipo de daap.
            </p>
            <p className="col-lg-12 fs-4 text-white">
              Introduzca en el formulario "Registo de Notario" la cuenta que
              será la notarial.
            </p>
            <p className="col-lg-12 fs-4 text-white">
              A continuación simule el registro de un documento introduciendo
              cualquier dato para que sea hasheado. Su resultado aparecerá en el
              campo inferior del botón "Crear Hash".
            </p>
            <p className="col-lg-12 fs-4 text-white">
              Finalmente registraremos el Hash con la cuenta que usted haya
              determinado que sea la notaria. Rechazará todo intento de registro
              por parte de cualquier otra cuenta.
            </p>
          </div>
          <div className="col-md-10 mx-auto col-lg-5">
            <form className="p-4 p-md-5 border rounded-3 bg-light">
              <h2>Registro de Notario</h2>
              <hr className="my-4" />
              <div className="form-floating mb-3">
                <input
                  onChange={(e) => setAccountNotarizer(e.target.value)}
                  type="text"
                  className="form-control"
                  id="dataSearch"
                />
                <label htmlFor="dataSearch">Introduzca dirección</label>
                <button
                  id="registerNotarizer"
                  onClick={() => {
                    setNotarizer();
                  }}
                  className="btn-success w-100 btn btn-lg"
                  type="button"
                >
                  Registrar Notario
                </button>
              </div>
            </form>
            <div style={{ height: "300px" }}></div>
            <form className="p-4 p-md-5 border rounded-3 bg-light">
              <h2>Registro Documento</h2>
              <div className="form-floating mb-3">
                <input
                  onChange={(e) => setInputData(e.target.value)}
                  type="text"
                  className="form-control"
                  id="inputData"
                />
                <label htmlFor="inputData">Data</label>
                <button
                  id="dataToHashButton"
                  onClick={() => setDataToHash()}
                  className="btn-success w-100 btn btn-lg"
                  type="button"
                >
                  Crear Hash
                </button>
                <hr className="my-4" />
                <input
                  value={hashHook}
                  readOnly
                  type="text"
                  className="form-control"
                  id="hash"
                />
              </div>
              <hr className="my-4" />
              <button
                id="btn-buy-nft"
                onClick={() => notarizeWithoutSign()}
                className="w-100 btn btn-lg btn-danger"
                type="button"
              >
                Registrar Hash
              </button>
              <hr className="my-4" />
            </form>
          </div>{" "}
        </div>
      </div>
    </div>
  );
};

export default Solidity;
