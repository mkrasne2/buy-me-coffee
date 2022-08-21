import React from 'react';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import './Nav.css';
import { Link } from  "react-router-dom";

export default function Header() {
  
  return (
    <div className="topnav">
  
    <div className = "leftist">
    <Link className="passive" to="/">Buy Me a Coffee</Link>
    </div>
    
  <div className="topnav-right">
    
  </div>
  
</div>
      )
      }