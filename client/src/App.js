import React, { Component } from "react";
import DappDriveContract from "./contracts/DappDrive.json";
import getWeb3 from "./getWeb3";
import { StyledDropZone } from 'react-drop-zone';
import 'react-drop-zone/dist/styles.css';
import "bootstrap/dist/css/bootstrap.css";
import {FileIcon, defaultStyles} from 'react-file-icon';
import { Table } from 'reactstrap';
import "./App.css";
import { create } from 'ipfs-http-client'

const client = create('https://ipfs.infura.io:5001/api/v0')

class App extends Component {
  state = { dappDrive: [], web3: null, accounts: null, contract: null };

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
      window.ethereum.on('accountsChanged', async () => {
        const changedAccounts = await web3.eth.getAccounts();
        this.setState({accounts: changedAccounts});
        this.getFiles();
      })
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
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
      console.error(err);
    }
  }

  onDrop = async (file) => {
    const { accounts, contract } = this.state;
    try {
      const added = await client.add(file)
      const url = `https://ipfs.infura.io/ipfs/${added.path}`;
      const timestamp = Math.round(+new Date() / 1000);
      const type = file.name.substr(file.name.lastIndexOf(".") + 1);
      let uploaded = await contract.methods.add(added.path, file.name, type, timestamp).send({from: accounts[0], gas: 300000});
      this.getFiles();
    } catch (error) {
      console.error('Error uploading file: ', error)
    }  
  }

  render() {
    const {dappDrive} = this.state;
    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (
      <div className="App">
        <div className="container pt-3">
          <StyledDropZone onDrop={this.onDrop} />
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
              {dappDrive !== [] ? dappDrive.map((item, key)=> {
                var fileDate = new Date(item[3] * 1000).toUTCString();
                return(
              <tr key="key">
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
              }) : null}
            </tbody>
          </Table>
        </div>
      </div>
    );
  }
}

export default App;
