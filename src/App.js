import React from 'react';
import Home from './Home.js';
import Header from './components/Navigation.js';
import {  BrowserRouter as Router, Routes, Route } from "react-router-dom";



function Homepage() {
return (
  <div>
  <Header />
  <Home />
  </div>
)
}



export default function App() {
  return (
    <div >
    <Routes>
      <Route  path='/' element={<Homepage />} />
    </Routes>
    
  </div>
  );
}