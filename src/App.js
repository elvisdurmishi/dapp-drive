import React, { Component } from "react";
import DappDriveContract from "./contracts/DappDrive.json";
import getWeb3 from "./getWeb3";
import { StyledDropZone } from 'react-drop-zone';
import 'react-drop-zone/dist/styles.css';
import "bootstrap/dist/css/bootstrap.css";
import {FileIcon, defaultStyles} from 'react-file-icon';
import logo from "./assets/logo.png";
import paperClipPng from "./assets/PaperClip.png";
import paperClipGif from "./assets/PaperCliipp.gif";
import cross from "./assets/cross.svg";
import tick from "./assets/tick-1.svg";
import metamaskConfigBanner from "./assets/ConfigMetamask.png";
import setupMetamask from "./assets/No_Metamask.png";
import banner from "./assets/banner.png";
import { Table } from 'reactstrap';
import "./App.css";
import { create } from 'ipfs-http-client'

const client = create('https://ipfs.infura.io:5001/api/v0')

class App extends Component {  
  state = { dappDrive: [], web3: null, accounts: null, contract: null, display: "image", state: "normal", tableState: null };

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();

      // Get the contract instance.
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = DappDriveContract.networks[networkId];
      const instance = new web3.eth.Contract(
        DappDriveContract.abi,
        deployedNetwork && deployedNetwork.address,
      );

      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.setState({ web3, accounts, contract: instance }, this.getFiles);
      window.ethereum.on('chainChanged', async () => {
        window.location.reload();
        const changedAccounts = await web3.eth.getAccounts();
        this.setState({accounts: changedAccounts});
        this.getFiles();
      });
      window.ethereum.on('accountsChanged', async () => {
        const changedAccounts = await web3.eth.getAccounts();
        this.setState({accounts: changedAccounts});
        this.getFiles();
      })
    } catch (error) {
      // Catch any errors for any of the above operations.
      this.setState({state: "failed-account"})
    }
  };

  getFiles = async () => {
    try {
      const {accounts, contract} = this.state;
      let filesLength = await contract.methods.getLength().call({from: accounts[0]});
      let files = [];
      for(let i = 0; i < filesLength; i++){
        let file = await contract.methods.getFile(i).call({from: accounts[0]})
        files.push(file);
      }
      this.setState({dappDrive: files});
    } catch (err){
      this.setState({tableState: "failed-files"})
    }
  }

  onDrop = async (file) => {
    const { accounts, contract } = this.state;
    try {
      const added = await client.add(file);
      this.setState({display: "gif"});
      const timestamp = Math.round(+new Date() / 1000);
      const type = file.name.substr(file.name.lastIndexOf(".") + 1);
      let uploaded = await contract.methods.add(added.path, file.name, type, timestamp).send({from: accounts[0], gas: 6721975});
      if(uploaded){
        this.setState({display: "tick"});
      }
      setTimeout(() => {
        this.setState({display: "image"});
      }, 2000)      
      this.getFiles();
    } catch (error) {
      this.setState({display: "cross"});
      setTimeout(() => {
        this.setState({display: "image"});
      }, 3000)
    }  
  }

  renderErrorAccount() {
    return (
      <div className="d-flex">
        <img src={setupMetamask} className="w-50" alt="banner"></img>
        <div className="d-flex flex-column align-items-center justify-content-center w-50">
          <h1>Shkarkoni Metamask</h1>
          <p>Ju duhet qe te keni shkarkuar Metamask patjeter per te perdorur kete aplikacion te deceltralizuar. Ju mund te shkarkoni Metamask <a target="_blank" rel="noopener noreferrer" href="https://metamask.io/">ketu.</a></p>
          <p>Pasi te shkarkoni dhe instaloni Metamask, rifreskoni dritaren.</p>
        </div>
      </div>
    )
  }

  renderNoFiles() {
    return (
      <tr key={"no-files"}>
        <td colSpan="3">Ju akoma nuk keni ngarkuar ndonje skedar...</td>
      </tr>
    )
  }

  renderErrorLoadingFiles() {
    return (
      <tr key={"error-loading-files"}>
        <td colSpan="3">Ndodhi nje gabim gjate ngarkimit te skedareve! Provoni perseri...</td>
      </tr>
    )
  }

  renderFiles(){
    const {dappDrive} = this.state;
    let files = [];
    if(dappDrive) {
      dappDrive.forEach(item => {
        var fileDate = new Date(item[3] * 1000).toUTCString();
        files.push(
          <tr key={`file-${item[3]}-${item[1]}`}>
            <td className="file">
              <FileIcon extension={item[2]} {...defaultStyles[item[2]]} />
            </td>
            <td style={{textAlign: "left"}}>
              <a target="_blank" rel="noopener noreferrer" href={"https://ipfs.io/ipfs/"+item[0]}>{item[1]}</a>
            </td>
            <td style={{textAlign: "right"}}>
              {fileDate}
            </td>
          </tr>
        )
      });
    }
    return files;
  }

  render() {
    const {dappDrive, display, state, tableState} = this.state;
    if (!this.state.web3) {
      return (
        <div className="overflow-hidden viewport-height">
          <div className="d-flex">
            <img src={metamaskConfigBanner} className="w-50" alt="banner"></img>
            <div className="d-flex flex-column align-items-center justify-content-center w-50">
              <h1>Konfigurimi i Metamask</h1>
              <p>Ju lutem konfiguroni Metamask me nje nga portofolet tuaja ne rrjetin "Rinkeby Test Network"</p>
            </div>
          </div>
        </div>
      )
    }
    return (
      <div className="App">
        <div className="overflow-hidden viewport-height">
          {state === "failed-account" && this.renderErrorAccount()}
        </div>
        {state === "normal" &&
        (<div className="mb-5">
          <div className="position-relative">
            <div className="logo-container">
              <img className="logo" src={logo} width="100px" alt="logo"></img>
            </div>
            <img className="banner-img" src={banner} alt="banner"></img>
            <StyledDropZone className="file-input" onDrop={this.onDrop}>
                <div className="min-width-100">
                  {display === "image" && <img src={paperClipPng} alt="link" width="100px" />}
                  {display === "gif" && <img src={paperClipGif} alt="link" width="100px" />}
                  {display === "tick" && <object data={tick} aria-label="" width="100px" />}
                  {display === "cross" && <object data={cross} aria-label="" width="100px" />}
                </div>
              </StyledDropZone>
          </div>
          <div className="container mt-6">
            <Table>
              <thead>
                <tr>
                  <th style={{width: "15%"}} scope="row">
                    Tipi i skedarit
                  </th>
                  <th style={{textAlign: "left"}}>
                    Emri
                  </th>
                  <th style={{textAlign: "right"}}>
                    Data
                  </th>
                </tr>
              </thead>
              <tbody>
                {tableState === "failed-files" && this.renderErrorLoadingFiles()}
                {dappDrive.length === 0 && tableState !== "failed-files" && this.renderNoFiles()}
                {this.renderFiles()}
              </tbody>
            </Table>
          </div>
        </div>)}
      </div>
    );
  }
}

export default App;
