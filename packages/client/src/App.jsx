import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
// import HomePage from './pages/HomePage';
import CreateEventPage from './pages/CreateEventPage';
// import MyTicketsPage from './pages/MyTicketsPage';
import ConnectWalletButton from './components/ConnectWalletButton';

function App() {
  return (
    <Router>
      <div className='container'>
        <nav className='nav'>
          <div>
            <Link to='/'>Events</Link>
            <Link to='/create-event'>Create Event</Link>
            <Link to='/my-tickets'>My Tickets</Link>
          </div>
          <ConnectWalletButton />
        </nav>
        <Routes>
          {/* <Route path='/' element={<HomePage />} /> */}
          <Route path='/create-event' element={<CreateEventPage />} />
          {/* <Route path='/my-tickets' element={<MyTicketsPage />} /> */}
        </Routes>
      </div>
    </Router>
  );
}
export default App;
