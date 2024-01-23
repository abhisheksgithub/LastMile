import './App.css';
import EditUser from './components/EditUser';
import Users from './components/Users';
import { Route, BrowserRouter, Routes } from 'react-router-dom'
import { Reception4, ReceiptCutoff, Reception0, ArrowRepeat, Wifi2, WifiOff } from 'react-bootstrap-icons'
import { useEffect, useState } from 'react';

const style = {
  container: {
    margin: '20px',
    fontFamily: 'cursive',
    fontSize: '50px'
  },
  appLevel: {
    margin: '45px'
  },
  sup: {
    fontSize: '20px',
    top: '0.5em',
    color: 'darkred'
  },
  headerCont: {
    float: 'left',
    marginLeft: '34%'
  },
  networkCont: {
    fontSize: '20px',
    marginLeft: '80%',
    fontFamily: 'cursive',
  },
  syncIcon: {
    fontSize: '31px',
    marginLeft: '80%',
  },
  syncIconA: {
    fontSize: '31px',
    marginBottom: '15px',
    color: 'green' 
  },

  syncIconB: {
    fontSize: '31px',
    marginBottom: '15px',
    color: 'black' 
  },
  syncContainter: {
    marginBottom: '30px'
  },
  pointerSync: {
    cursor: 'pointer'
  }
}

function App() {
  const [networkStatus, setNetworkStatus] = useState(navigator.onLine)
  const [triggerPost, setTriggerPost] = useState(false)

  window.addEventListener("offline", (() => {
    return (e) => {
      setNetworkStatus(false)
    }
  })());

  window.addEventListener("online", (() => {
    return (e) => {
      setNetworkStatus(true)
    }
  })());

  return (

    <div className="App" style={style.appLevel}>
      <BrowserRouter>
        <div style={style.container}>
          <div style={style.headerCont}>Final Mile <sup style={style.sup}>Streamlining Your Last Mile</sup></div>
        </div>
        <div style={style.syncContainter}>
          <div style={style.networkCont}>Network Status: {networkStatus ? <Wifi2 style={style.syncIconA}/> : <WifiOff style={style.syncIconB}/>}</div>
          <div><span onClick={() => setTriggerPost(val => !val)} style={style.pointerSync}><ArrowRepeat style={style.syncIcon} /> <span>Sync to Server</span></span></div>
        </div>
        <Routes>
          <Route path="/" element={<Users networkStatus={networkStatus} triggerPost={triggerPost}/>}></Route>
          <Route path="/editUser/:id" element={<EditUser />}></Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
