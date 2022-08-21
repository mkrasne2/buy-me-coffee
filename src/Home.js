import React, { useEffect, useState } from "react";
import './App.css';
import polygonLogo from './assets/polygonlogo.png';
import ethLogo from './assets/ethlogo.png';
import { networks } from './utils/networks';
import { Helmet } from 'react-helmet';
import { useNavigate} from 'react-router-dom';
import {ethers} from "ethers";
import abi from "./components/abi.json";
import InlineSVG from 'svg-inline-react';
import LoadingSpin from "react-loading-spin";
import splash5 from './splash5.png'; // with import
import useWindowSize from "./utils/useWindowSize";

const initialState = '';


const Home = () => {
	const [currentAccount, setCurrentAccount] = useState(initialState);
	const [network, setNetwork] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [nameTitle, setNameTitle] = useState(initialState);
  const [description, setDescription] = useState(initialState);
  const [amount, setAmount] = useState(initialState);
  const [transaction, setTransactionProcess] = useState(initialState);
	const [success, setSuccess] = useState(initialState);
  const [records, setRecords] = useState([]);
  const { width } = useWindowSize();
	const navigate = useNavigate();
  
  
  const connectWallet = async () => {
    
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask -> https://metamask.io/");
        return;
      }
      const accounts = await ethereum.request({ method: "eth_requestAccounts" });
      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error)
    }
  }
	
	const checkIfWalletIsConnected = async () => {
    const { ethereum } = window;

    if (!ethereum) {
      console.log('Make sure you have metamask!');
      return;
    } else {
      console.log('We have the ethereum object', ethereum);
    }

    // Check if we're authorized to access the user's wallet
    const accounts = await ethereum.request({ method: 'eth_accounts' });
    // Users can have multiple authorized accounts, we grab the first one if its there!
    if (accounts.length !== 0) {
      const account = accounts[0];
      console.log('Found an authorized account:', account);
      setCurrentAccount(account);
    } else {
      console.log('No authorized account found');
    }

		const chainId = await ethereum.request({ method: 'eth_chainId' });
    setNetwork(networks[chainId]);
    ethereum.on('chainChanged', handleChainChanged);
    // Reload the page when they change networks
    function handleChainChanged(_chainId) {
      window.location.reload();
    }
  };

  // This runs our function when the page loads.
  useEffect(() => {
        
    checkIfWalletIsConnected();
    
}, [])

	const switchNetwork = async () => {
		if (window.ethereum) {
			try {
				// Try to switch to the Mumbai testnet
				await window.ethereum.request({
					method: 'wallet_switchEthereumChain',
					params: [{ chainId: '0x13881' }], // Check networks.js for hexadecimal network ids
				});
			} catch (error) {
				// This error code means that the chain we want has not been added to MetaMask
				// In this case we ask the user to add it to their MetaMask
				if (error.code === 4902) {
					try {
						await window.ethereum.request({
							method: 'wallet_addEthereumChain',
							params: [
								{	
									chainId: '8001',
									chainName: 'Polygon Mumbai Testnet',
									rpcUrls: ['https://rpc-mumbai.maticvigil.com/'],
									nativeCurrency: {
											name: "Mumbai Matic",
											symbol: "MATIC",
											decimals: 18
									},
									blockExplorerUrls: ["https://mumbai.polygonscan.com/"]
								},
							],
						});
					} catch (error) {
						console.log(error);
					}
				}
				console.log(error);
			}
		} else {
			// If window.ethereum is not found then MetaMask is not installed
			alert('MetaMask is not installed. Please install it to use this app: https://metamask.io/download.html');
		} 
	}

  const fetchContributions = async () => {
		try {
			const { ethereum } = window;
			if (ethereum) {
				// You know all this
				const provider = new ethers.providers.Web3Provider(ethereum);
				const signer = provider.getSigner();
        var base64 = require('base-64');
				const contract = new ethers.Contract('0xe44c0CF1B900Ca7Bc11a65D7510441fa0Dba9A7a', abi, signer);
				console.log(contract);
        const contributions = await contract.fetchContributions();
        console.log(contributions);
        console.log(contributions.length);
        const newRecords = [];
        
        for(let i = contributions.length - 1; i >= 0; i--){
          
            var name = await contributions[i].name;
            console.log(name);
            var message = await contributions[i].message;
            console.log(message);
            const timestamp = await contributions[i].timestamp._hex;
            console.log(timestamp);
            const time = await parseInt(timestamp, 16);
            console.log(time);
            const value = await contributions[i].value._hex;
            const val = await parseInt(value, 16)/1000000000000000000;
            var date = new Date(time*1000).toUTCString();
            if(name.length > 30){
              name = await name.slice(0,30).concat('...');
            }
            if(message.length > 30){
              message = await message.slice(0,30).concat('...');
            }
            
            console.log(typeof(date));
            
            
            const record = {
              name: name,
              message: message,
              timestamp: date,
              value: val + ' MATIC'
            }

            if(newRecords.length <= 2){
              newRecords.push(record);
            }
            
       
			}
      console.log(width);
    setRecords(newRecords);
    console.log(newRecords);
    
    }
		} catch(error){
			console.log(error);
		}
		
	}

  const buyCoffee = async () => {
		try {
			const { ethereum } = window;
			if (ethereum) {
				// You know all this
				const provider = new ethers.providers.Web3Provider(ethereum);
				const signer = provider.getSigner();
        
				const contract = new ethers.Contract('0xe44c0CF1B900Ca7Bc11a65D7510441fa0Dba9A7a', abi, signer);
				console.log(contract);
        const price = amount.toString();
        setTransactionProcess(true);
        let tx = await contract.buyCoffee(nameTitle, description, {value: ethers.utils.parseEther(price)});
        const receipt = await tx.wait();
        setNameTitle(initialState);
        setDescription(initialState);
        setAmount(initialState);
				// Check if the transaction was successfully completed
				if (receipt.status === 1) {
					console.log("Submitted! https://mumbai.polygonscan.com/tx/"+tx.hash);
          setTransactionProcess(false);
					console.log(tx);
					setSuccess(true);
				
					setTimeout(() => {
						
					}, 2000);
	
					
				} else {
					setTransactionProcess(false);
					alert("Transaction failed! Please try again");
				}
				}
			} catch(error) {
				console.log(error);
        setTransactionProcess(false);
        setNameTitle(initialState);
        setDescription(initialState);
        setAmount(initialState);
			}
	}

	// This will run any time currentAccount or network are changed
	useEffect(() => {
		if (network === 'Polygon Mumbai Testnet') {
			fetchContributions();
		}
	}, [currentAccount, network]);

  const clearView = async () => {
    
    setTransactionProcess(initialState);
    setSuccess(initialState);
    fetchContributions();
    
  }
  
  const renderBuys = () => {
    return(
      <div >
                <p className="subtitle"> Recent Contributions:</p>
                <div className="mint-list">
                  { records.length > 0 ? records.map((mint, index) => {
                    return (
                      <div className = "mint-items">
                      
                      <br></br>
                      
                      <div className="mint-item" key={index}>
                      <p>Contributor: <b>{mint.name}</b></p>
                      <p>Message: <b>{mint.message}</b></p>
                      <p>Timestamp: <b>{mint.timestamp}</b></p>
                      <p>Value: <b>{mint.value}</b></p>
									</div></div>)
                }) :  <div className="connect-wallet-container2">
                <h2>Loading Recent Coffees...</h2>
                
                <LoadingSpin className = 'centerspin'/> </div> }
              </div>
            </div>
    )
  }

  // Create a function to render if wallet is not connected yet
  const renderNotConnectedContainer = () => (
    <div className="connect-wallet-container">
      <img src={splash5} />
      <button onClick={connectWallet} className="cta-button">
        Connect Wallet to Buy me a Coffee
      </button>
      
    </div>
    );

		const renderNotConnectedTitle = () => (
			<div className="connected-container">
						<p className="title">Coffee, please!</p>
						<br></br>
            <p className="subtitle">Connect your wallet to buy me a coffee </p>
			</div>
			);


			const renderConnectedTitle = () => (
				<div className="connected-container">
							<p className="title">Coffee, please!</p>
							<br></br>
							<p className="subtitle">Feel free to write me a message or buy me a coffee anon!</p>
              
				</div>
				);

        const renderOptions = () =>{
      
      
          
            return (
              <div className="connect-wallet-container">
                <h2>Please switch to Polygon Mumbai Testnet</h2>
            <button className='cta-button' onClick={switchNetwork}>Click here to switch</button>
              </div>
            );
           

        }

        const renderBuyCoffeeContainer = () => {
        
            return (
              <div>
              
                        <p>Thanks for keeping me awake!</p>
                        <br></br>
                        <div className="form-container">
        
                          <input
                            type="text"
                            value={nameTitle}
                            placeholder='your name (optional)'
                            onChange={e => setNameTitle(e.target.value)}
                            className = "inputTextArea"
                          />
                          
                        <textarea rows = "10" cols = "20" name = "description" type="text"
                            value={description}
                            placeholder='your message (optional) '
                            onChange={e => setDescription(e.target.value)} className = "inputTextArea">
                              
                          </textarea>
                          <input
                            type="number"
                            value={amount}
                            placeholder='amount (in MATIC)'
                            onChange={e => setAmount(e.target.value)}
                            className = "inputTextArea"
                          />

                          <button className='cta-button' disabled={loading} onClick={buyCoffee}>
                                Buy Coffee
                              </button> 

                      </div>
                      <br></br>
                      <br></br>
                                        </div>
                
              
            ) 
        };
					
        const renderLoading = () => {
          return(<div className="connect-wallet-container">
            <p>Buying de lattes...</p>
            <br></br>
          <LoadingSpin className = 'centerspin'/>
          <br></br>
          </div>)
          
        }

        const renderSuccess = () => {
          return(<div className="connect-wallet-container"><p>Thank you for the coffee!</p>
          <button className='cta-button mint-button' onClick={clearView}>Go Back</button></div>)
          
          
        }
      
  

  return (
		<div className="App">
		<Helmet>
        <title>Buy Me a Coffee on Polygon Mumbai!</title>
        <meta name="description" content="A decentralized option for my community to pitch in and buy me coffee." />
        
      </Helmet>
      <div className="container">
        <div className="header-container">
        <header>
        {width > 650 && (
        <>
          <div className="right">
             <img alt="Network logo" className="logo" src={ network.includes("Polygon") ? polygonLogo : ethLogo} />
             { currentAccount ? <p> Wallet: {currentAccount.slice(0, 6)}...{currentAccount.slice(-4)} </p> : <p> Not connected </p> }
           </div>
        </>
      )}
           
         </header>
				<div >
            {!currentAccount && renderNotConnectedTitle()}
            {currentAccount && renderConnectedTitle()}
            </div>
        </div>
				{!currentAccount && renderNotConnectedContainer()}
        {currentAccount && (network !== 'Polygon Mumbai Testnet') && renderOptions()}
        {currentAccount && !transaction && !success && renderBuyCoffeeContainer()}
        {currentAccount && transaction && !success && renderLoading()}
        {currentAccount && !transaction && success && renderSuccess()}
        {currentAccount && renderBuys()}
        <div className="footer-container">
        </div>
      </div>
    </div>
  );
};

export default Home;