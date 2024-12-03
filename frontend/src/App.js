import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import SportSelection from './pages/SportSelection';
import Quiz from './components/Quiz';
import Header from './components/Header/Header';


function App() {
    return (
        <Router>
            <Header />
            <Routes>
                <Route path="/" element={<SportSelection />} />
                <Route path="/quiz/:sport" element={<Quiz />} />
            </Routes>
        </Router>

        // <Quiz/>
      

    );
}

export default App;
