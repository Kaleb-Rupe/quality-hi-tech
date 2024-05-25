import React from 'react';
import logo from '../../images/logo.JPG'

const Header = () => {
    return (
        <>
            <header>
                <img src={logo} alt='Logo'/>
                <h1>
                    Santa Cruz Sun Construction
                </h1>
            </header>
        </>
    );
};

export default Header;