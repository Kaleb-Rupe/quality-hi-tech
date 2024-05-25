import React from 'react';
import logo from '../images/logo.JPG'
import Home from '../Home.js'
import './Header.css'

const Header = () => {
    return (
        <>
            <header>
                <img src={logo} alt='Logo' onClick={Home}/>
                <h1>
                    Santa Cruz Sun Construction
                </h1>
            </header>
        </>
    );
};

export default Header;