import React from 'react';
import { Navbar, Nav } from 'react-bootstrap';
import { Link } from 'react-router-dom';

function CustomNavbar() {
    return (
        <Navbar bg="dark" variant="dark" expand="lg" className="mb-4">
            <div className="container">
                <Navbar.Brand as={Link} to="/">
                    <div className="logo">LVG-KINO</div>
                    <span className="city-subtitle">г. Новороссийск</span>
                </Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="ms-auto">
                        <Nav.Link as={Link} to="/" className="nav-link">Главная</Nav.Link>
                        <Nav.Link as={Link} to="/booking" className="nav-link">Бронирование</Nav.Link>
                        <Nav.Link as={Link} to="/admin" className="nav-link">Админ-панель</Nav.Link>
                    </Nav>
                </Navbar.Collapse>
            </div>
        </Navbar>
    );
}

export default CustomNavbar;