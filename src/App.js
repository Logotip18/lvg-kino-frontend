import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Navbar from './Navbar';
import SeatSelection from './SeatSelection';
import AdminSessions from './AdminSessions';
import './App.css';

function Home() {
    const [error, setError] = useState(null);
    const [sessions, setSessions] = useState([]);

    useEffect(() => {
        fetch('http://localhost:3000/api/sessions')
            .then(response => response.json())
            .then(data => {
                const sortedSessions = data.sort((a, b) => new Date(a.time) - new Date(b.time));
                console.log('Home sessions:', sortedSessions);
                setSessions(sortedSessions);
            })
            .catch(error => {
                console.error('Ошибка:', error);
                setError(error.message);
            });
    }, []);

    const groupSessionsByDate = () => {
        const grouped = {};
        sessions.forEach(session => {
            const date = new Date(session.time).toLocaleDateString('ru-RU', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            });
            if (!grouped[date]) {
                grouped[date] = [];
            }
            grouped[date].push(session);
        });
        console.log('Grouped sessions:', grouped);
        return grouped;
    };

    const groupedSessions = groupSessionsByDate();

    return (
        <div className="container mt-5 text-center">
            <h1 className="mb-4">Добро пожаловать в LVG-KINO</h1>
            {error && <p className="text-danger">Ошибка: {error}</p>}
            <h2 className="mt-5">Расписание сеансов</h2>
            {Object.keys(groupedSessions).length > 0 ? (
                Object.keys(groupedSessions).map(date => (
                    <div key={date} className="mb-4">
                        <h3 className="date-header">{date}</h3>
                        <ul className="list-group mx-auto" style={{ maxWidth: '600px' }}>
                            {groupedSessions[date].map(session => (
                                <Link
                                    key={session.id}
                                    to="/booking"
                                    className="list-group-item list-group-item-action d-flex justify-content-center align-items-center"
                                    style={{ cursor: 'pointer' }}
                                >
                                    <span className="session-title">
                                        {session.movieTitle} - {new Date(session.time).toLocaleTimeString('ru-RU', {
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })}
                                    </span>
                                </Link>
                            ))}
                        </ul>
                    </div>
                ))
            ) : (
                <p>Нет доступных сеансов.</p>
            )}
        </div>
    );
}

function App() {
    return (
        <Router>
            <Navbar />
            <div className="App">
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/booking" element={<SeatSelection />} />
                    <Route path="/admin" element={<AdminSessions />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;