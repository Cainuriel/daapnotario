import './App.css'
import Intro from './Intro';
import Solidity from './Solidity';

function App() {


  return (
    <div className="App">
      <Intro />
      <Solidity />
      {/* Footer */}
      <footer className="text-center text-white my-3 container">
        <div className="p-4 pb-0">
          <section className="">
            <a
              className="text-decoration-none app-link"
              href="https://github.com/Cainuriel/daapnotario"
              target="_blank"
              rel="noreferrer"
            >
              {" "}
              <p className="d-flex justify-content-center align-items-center">
                <span className="me-3">Código en Github </span>
                <i className="fab fa-github"></i>
              </p>
            </a>
          </section>
        </div>
        <div
          className="text-center p-3 container"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.2)" }}
        >
          2022{" "}
          <a
            className="text-white text-decoration-none"
            href="https://cainuriel.github.io/"
          >
            {" "}
            <img src="./favicon.ico" alt="logo developez" />
            Developer Superloper
          </a>
          <div>
            <a
              className="text-decoration-none app-link"
              href="https://testnet.bscscan.com/address/0x52a485b2888fd9bb22a454a25130da103f0e0a43#code"
              target="_blank"
            >
              Contrato verificado
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App
