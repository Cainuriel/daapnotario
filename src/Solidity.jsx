import { useEffect, useState } from "react";
import React from "react";
import { ethers } from "ethers";
import Notario from "./artifacts/contracts/Notario.json";
import Swal from "sweetalert2";

const Solidity = () => {
  const [inputData, setInputData] = useState("");
  const [inputSign, setInputSign] = useState("");
  const [sign, setSign] = useState("");
  const [accountNotarizer, setAccountNotarizer] = useState("");
  const [rootHook, setRootHook] = useState("");
  const [buyNFTOk, setBuyNFTOk] = useState(false);
  const [hashHook, setHashHook] = useState("");
  const nftContract = "0x52a485b2888fD9bb22a454A25130Da103F0E0a43"; // bsc testnet 25/10/22
  // const nftContract = "0xE140a7f86A964f107e407B8464E73065cCa5d8DA"; // bsc testnet 21/10/24
  // const BINANCENETWORK = "bnbt";
  const [doubleCheck, setDoubleChek] = useState(false);
  const provider = new ethers.BrowserProvider(window.ethereum);
  
  async function setDataToHash() {
    const hashFromEthers = ethers.keccak256(ethers.toUtf8Bytes(inputData));
    // const hashFromEthers = ethers.id(inputData);
    setHashHook(hashFromEthers);
  }

  async function setNotarizer() {
    
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(nftContract, Notario, signer);

    
    try {
      await contract.setNotarizedAddress.staticCall(accountNotarizer);
      const tx = await contract.setNotarizedAddress(accountNotarizer);
      Swal.fire({
        title: "Procesando el registro de su cuenta Notario",
        text: "Espere, y no actualice la página",
        // icon: 'info',
        showConfirmButton: false,
        imageUrl:
          "./processing.gif",
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

  async function signHash() {

      try {
        // Solicitar acceso a MetaMask
        // await window.ethereum.request({ method: "eth_requestAccounts" });
        
       
    
        // Obtener la cuenta del usuario
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
     

        // const hash = ethers.hashMessage(inputData);
        // Firma directamente el string (dato en bruto)
        // const signature = await signer.signMessage(hashHook);
      const signature = await window.ethereum.request({
        method: "personal_sign",
        params: [hashHook, address],
      });

        // Verificar la firma (obtener la dirección del firmante) sobre el string original
        // const recoveredAddress = ethers.verifyMessage(hashHook, signature);

        // console.log("La dirección: ", address);
        // // console.log("Ha firmado el inputData: ", inputData);
        // console.log("Hash generado para enviar al contrato: ", hashHook);
        // console.log("La firma resultante es:", signature);
        // console.log("La dirección recuperada de la firma es:", recoveredAddress);

        // Comparar la dirección recuperada con la dirección original
        // if (recoveredAddress.toLowerCase() === address.toLowerCase()) {
        //     console.log("La firma es válida y la dirección coincide.");
        // } else {
        //     console.log("La firma no es válida o la dirección no coincide.");
            
        // }
  
        setInputSign(signature);
      } catch (error) {
        console.error("Error al firmar el hash:", error);
        throw error;
      }
 
  }


  // async function checkingNetwork(networkFromMetamask) {
  //   if (networkFromMetamask.name !== BINANCENETWORK) {
  //     Swal.fire({
  //       title: "¡Cuidado!",
  //       text: "Estás en la red " + networkFromMetamask.name,
  //       showCancelButton: true,
  //       confirmButtonText: "Cambiate o instalate " + BINANCENETWORK,
  //       imageUrl:
  //       "./processing.gif",
  //       imageWidth: 300,

  //       imageAlt: "Network BSC",
  //     }).then((result) => {
  //       /* Read more about isConfirmed, isDenied below */
  //       if (result.isConfirmed) {
  //         addNetwork();
  //         return false;
  //       } else {
  //         window.location.reload();
  //       }
  //     });
  //   } else {
  //     return true;
  //   }
  // }


  // async function addNetwork() {
  //   let networkData = [
  //     {
  //       chainId: "0x61",
  //       chainName: "BSCTESTNET",
  //       rpcUrls: ["https://data-seed-prebsc-1-s1.binance.org:8545"],
  //       nativeCurrency: {
  //         name: "BINANCE COIN",
  //         symbol: "BNB",
  //         decimals: 18,
  //       },
  //       blockExplorerUrls: ["https://testnet.bscscan.com/"],
  //     },
  //   ];

  //   // agregar red o cambiar red
  //   return window.ethereum.request({
  //     method: "wallet_addEthereumChain",
  //     params: networkData,
  //   });
  // }

  async function notarizeWithoutSign() {
    
    if (!doubleCheck) {
      setDoubleChek(true);
 
      // const networkFromMetamask = await provider.getNetwork();
      // if (! await checkingNetwork(networkFromMetamask)) {
      //   return;
      // }
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(nftContract, Notario, signer);
      console.log("el hook hash ", hashHook);
      try {
        await contract.notarizeWithoutSign.staticCall(hashHook);
        const tx = await contract.notarizeWithoutSign(hashHook);
        Swal.fire({
          title: "Procesando el registro de su documento",
          text: "Espere, y no actualice la página",
          // icon: 'info',
          showConfirmButton: false,
          imageUrl:
          "./processing.gif",
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

    async function notarizeWithSign() {
      if (!doubleCheck) {
        setDoubleChek(true);

        // const networkFromMetamask = await provider.getNetwork();
        // if (!(await checkingNetwork(networkFromMetamask))) {
        //   return;
        // }
        const signer = await provider.getSigner();
        const contract = new ethers.Contract(nftContract, Notario, signer);
        console.log("el hash ", hashHook, "la firma ", inputSign);
        try {
          await contract.notarizeWithSign.staticCall(hashHook, inputSign);
          const tx = await contract.notarizeWithSign(hashHook, inputSign);
          Swal.fire({
            title: "Procesando el registro de su documento",
            text: "Espere, y no actualice la página",
            // icon: 'info',
            showConfirmButton: false,
            imageUrl:
            "./processing.gif",
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
              para todo el mundo y cualquiera puede ser notario en mi contrato.
            </p>
            <p className="col-lg-12 fs-4 text-white">
              Se comprenderá que esto no ha de ser así para proyectos personales.
            </p>
            <p className="col-lg-12 fs-4 text-white">
              Introduzca en el formulario "Registo de Notario" la cuenta que
              será la notarial y que podrá registrar documentos hasheados.
            </p>
            <p className="col-lg-12 fs-4 text-white">
              A continuación simule el registro de un documento introduciendo
              cualquier dato para que sea hasheado. Su resultado aparecerá en el
              campo inferior del botón "Crear Hash". Ésta acción no consume gas y 
              no necesita ser firmada por ninguna cuenta.
            </p>
            <p className="col-lg-12 fs-4 text-white">
              Finalmente registraremos el Hash con la cuenta que usted haya
              determinado que sea la notaria clickando "Registrar Hash". Rechazará todo intento de registro
              por parte de cualquier otra cuenta.
            </p>
            <h2 className="display-4 fw-bold lh-1 mb-3 text-white">
              La firma del notario
            </h2>
            <p className="col-lg-12 fs-4 text-white">
              Se podría considerar que registrando hashes desde una cuenta determinada como notario
              es suficiente. Pero esto obliga al notario a realizar todos los registros.
            </p>
            <p className="col-lg-12 fs-4 text-white">
              En principio, el notario solo tendría que firmar los documentos y disponer de otros empleados
              para el registro, como se suele hacer en la vida real. 
              Es decir, al igual que un notario real dispone de su
              poder mediante una firma en un documento, nosotros podemos
              emular ese comportamiento con una firma fuera de red por parte del notario.
            </p>
            <p className="col-lg-12 fs-4 text-white">
              En el formulario "Firmar como Notario" usted podrá firmar el hash que cree en el formulario anterior con la cuenta notario y la verá en la parte inferior.
              Seguidamente, <strong style={{color: "orange"}}>cambiase a otra cuenta que llamaremos
              administradora</strong> y registre ése hash en el formulario "Registro con Firma" <strong style={{color: "orange"}}> con la firma generada anteriormente.</strong> Rechazará todo registro de firma y hash que no se haya hecho con la cuenta notario.</p> 
              <p className="col-lg-12 fs-4 text-white">            
               ¿No le parece fantástico?
              En un caso real el notario le enviaría a la cuenta administradora la firma y el hash para que lo registrase sin que el 
              el empleado, la cuenta administradora, <strong style={{color: "orange"}}> conociese el origen de los datos que han generado el hash.</strong>
              </p>
     
            <p className="col-lg-12 fs-4 text-white">
              Para finalizar éste tutorial,{" "}
              <a
                href="https://testnet.bscscan.com/address/0x52a485b2888fd9bb22a454a25130da103f0e0a43#readContract"
                target="_blank"
                rel="noreferrer"
              >
                acuda a la dapp del etherscan de mi contrato verificado
              </a>{" "}
              para que pueda hacer todas las comprobaciones que considere. 
              Podrá conmprobar si el hash está registrado, con que
              cuenta notaria se ha hecho y el tiempo de tal registro.
              Último consejo: <strong>Conecte su metamask al scanner para realizar las comprobaciones. </strong>
              Aunque los getters no consumen gas puede que le devuelva un error la aplicación por no haberse conectado.
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
                  id="createHash"
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
            <div style={{ height: "100px" }}></div>
            <form className="p-4 p-md-5 border rounded-3 bg-light">
              <h2>Firmar como Notario</h2>
              <div className="form-floating mb-3">

                <button
                  id="dataToHashButton"
                  onClick={() => signHash()}
                  className="btn-success w-100 btn btn-lg"
                  type="button"
                >
                  Firmar
                </button>
                <hr className="my-4" />
                <input
                  value={inputSign}
                  readOnly
                  type="text"
                  className="form-control"
                  id="signHash"
                />
              </div>

              <hr className="my-4" />
            </form>
            <form className="my-4 p-4 p-md-5 border rounded-3 bg-light">
              <h2>Registro con firma</h2>
              <div className="form-floating mb-3">
                <small>Hash:</small>
              <input
                  readOnly
                  value={hashHook}
                  type="text"
                  className="form-control"
                  id="hash"
                />
                <small>Firma:</small>
                <input
                  readOnly
                  value={inputSign}
                  type="text"
                  className="form-control"
                  id="firma"
                />
         
              </div>
              <hr className="my-4" />
              <button
                id="btn-buy-nft"
                onClick={() => notarizeWithSign()}
                className="w-100 btn btn-lg btn-warning"
                type="button"
              >
                Registrar Hash con firma
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
