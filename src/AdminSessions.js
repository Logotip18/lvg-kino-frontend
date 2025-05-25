import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

function AdminSessions() {
    const [sessions, setSessions] = useState([]);
    const [newSession, setNewSession] = useState({
        movieTitle: '',
        time: '',
    });
    const [showAddModal, setShowAddModal] = useState(false);
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showHallModal, setShowHallModal] = useState(false);
    const [updateSession, setUpdateSession] = useState({ id: null, movieTitle: '', time: '' });
    const [deleteSessionId, setDeleteSessionId] = useState(null);
    const [selectedSessionId, setSelectedSessionId] = useState(null);
    const [hall, setHall] = useState(null);

    useEffect(() => {
        fetch('https://lvg-kino-backend.onrender.com/api/sessions')
            .then(response => response.json())
            .then(data => {
                const sortedSessions = data.sort((a, b) => new Date(a.time) - new Date(b.time));
                setSessions(sortedSessions);
            })
            .catch(error => console.error('Ошибка:', error));
    }, []);

    useEffect(() => {
        if (selectedSessionId) {
            fetch(`https://lvg-kino-backend.onrender.com/api/hall/${selectedSessionId}`)
                .then(response => response.json())
                .then(data => {
                    console.log('Admin hall data:', JSON.stringify(data, null, 2));
                    setHall(data);
                })
                .catch(error => console.error('Ошибка:', error));
        }
    }, [selectedSessionId]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewSession({ ...newSession, [name]: value });
    };

    const handleUpdateInputChange = (e) => {
        const { name, value } = e.target;
        setUpdateSession({ ...updateSession, [name]: value });
    };

    const handleAddSession = () => {
        fetch('https://lvg-kino-backend.onrender.com/api/sessions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newSession),
        })
            .then(response => response.json())
            .then(data => {
                setSessions([...sessions, data].sort((a, b) => new Date(a.time) - new Date(b.time)));
                setNewSession({ movieTitle: '', time: '' });
                setShowAddModal(false);
            })
            .catch(error => console.error('Ошибка:', error));
    };

    const handleUpdateSession = () => {
        fetch(`https://lvg-kino-backend.onrender.com/api/sessions/${updateSession.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ movieTitle: updateSession.movieTitle, time: updateSession.time }),
        })
            .then(response => response.json())
            .then(data => {
                setSessions(sessions.map(s => s.id === updateSession.id ? data : s).sort((a, b) => new Date(a.time) - new Date(b.time)));
                setShowUpdateModal(false);
            })
            .catch(error => console.error('Ошибка:', error));
    };

    const handleDeleteSession = () => {
        fetch(`https://lvg-kino-backend.onrender.com/api/sessions/${deleteSessionId}`, {
            method: 'DELETE',
        })
            .then(response => response.json())
            .then(data => {
                setSessions(sessions.filter(s => s.id !== deleteSessionId).sort((a, b) => new Date(a.time) - new Date(b.time)));
                setShowDeleteModal(false);
                if (selectedSessionId === deleteSessionId) {
                    setSelectedSessionId(null);
                    setHall(null);
                }
            })
            .catch(error => console.error('Ошибка:', error));
    };

    const handleShowHall = (sessionId) => {
        setSelectedSessionId(sessionId);
        setShowHallModal(true);
    };

    return (
        <div className="container mt-4">
            <h2>Админ-панель LVG-KINO</h2>
            <Button variant="success" onClick={() => setShowAddModal(true)} className="mb-4">
                Добавить сеанс
            </Button>
            <h3>Список сеансов</h3>
            <table className="table table-striped">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Фильм</th>
                        <th>Время</th>
                        <th>Действия</th>
                    </tr>
                </thead>
                <tbody>
                    {sessions.map(session => (
                        <tr key={session.id}>
                            <td>{session.id}</td>
                            <td>
                                <span
                                    style={{ cursor: 'pointer', color: '#90CAF9' }}
                                    onClick={() => handleShowHall(session.id)}
                                >
                                    {session.movieTitle}
                                </span>
                            </td>
                            <td>{new Date(session.time).toLocaleString('ru-RU')}</td>
                            <td>
                                <Button
                                    variant="warning"
                                    size="sm"
                                    className="me-2"
                                    onClick={() => {
                                        setUpdateSession({ id: session.id, movieTitle: session.movieTitle, time: session.time.slice(0, 16) });
                                        setShowUpdateModal(true);
                                    }}
                                >
                                    Обновить
                                </Button>
                                <Button
                                    variant="danger"
                                    size="sm"
                                    onClick={() => {
                                        setDeleteSessionId(session.id);
                                        setShowDeleteModal(true);
                                    }}
                                >
                                    Удалить
                                </Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <Modal show={showHallModal} onHide={() => setShowHallModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>
                        Забронированные места: {sessions.find(s => s.id === selectedSessionId)?.movieTitle}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {hall ? (
                        <div className="hall-container">
                            {hall.seats.map((row, rowIndex) => (
                                <div key={rowIndex} className="seat-row d-flex align-items-center mb-4">
                                    <span className="row-label me-3">Ряд {rowIndex + 1}</span>
                                    <div className="d-flex justify-content-center flex-grow-1">
                                        {row.map((seatData, seatIndex) => {
                                            const isPouf = seatData.type === 'pouf';
                                            const isDouble = seatData.type === 'double';
                                            const seatClass = `seat ${
                                                isPouf ? 'seat-pouf' : isDouble ? 'seat-double' : 'seat-quad'
                                            } ${seatData.status === 'booked' ? 'booked' : ''}`;
                                            return (
                                                <div
                                                    key={seatIndex}
                                                    className={seatClass}
                                                    title={seatData.status === 'booked' 
                                                        ? `Забронировано (${seatData.people} чел.)` 
                                                        : `${isPouf ? 'Пуфик (1 чел.)' : isDouble ? 'Двухместный диван (2–3 чел.)' : 'Четырёхместный диван (4–6 чел.)'}`}
                                                >
                                                    {seatData.status === 'booked' ? seatData.people : seatIndex + 1}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                            <div className="legend mt-3">
                                <div><span className="seat seat-pouf"></span> Пуфик (1 чел.)</div>
                                <div><span className="seat seat-double"></span> Двухместный диван (2–3 чел.)</div>
                                <div><span className="seat seat-quad"></span> Четырёхместный диван (4–6 чел.)</div>
                                <div><span className="legend-booked"></span> Забронировано</div>
                            </div>
                        </div>
                    ) : (
                        <p>Загрузка схемы зала...</p>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowHallModal(false)}>
                        Закрыть
                    </Button>
                </Modal.Footer>
            </Modal>

            <Modal show={showAddModal} onHide={() => setShowAddModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Добавить сеанс</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Название фильма</Form.Label>
                            <Form.Control
                                type="text"
                                name="movieTitle"
                                value={newSession.movieTitle}
                                onChange={handleInputChange}
                                placeholder="Введите название фильма"
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Время</Form.Label>
                            <Form.Control
                                type="datetime-local"
                                name="time"
                                value={newSession.time}
                                onChange={handleInputChange}
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowAddModal(false)}>
                        Отмена
                    </Button>
                    <Button variant="primary" onClick={handleAddSession}>
                        Добавить
                    </Button>
                </Modal.Footer>
            </Modal>

            <Modal show={showUpdateModal} onHide={() => setShowUpdateModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Обновить сеанс</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Название фильма</Form.Label>
                            <Form.Control
                                type="text"
                                name="movieTitle"
                                value={updateSession.movieTitle}
                                onChange={handleUpdateInputChange}
                                placeholder="Введите новое название"
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Время</Form.Label>
                            <Form.Control
                                type="datetime-local"
                                name="time"
                                value={updateSession.time}
                                onChange={handleUpdateInputChange}
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowUpdateModal(false)}>
                        Отмена
                    </Button>
                    <Button variant="primary" onClick={handleUpdateSession}>
                        Обновить
                    </Button>
                </Modal.Footer>
            </Modal>

            <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Подтверждение удаления</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Вы уверены, что хотите удалить этот сеанс?
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
                        Отмена
                    </Button>
                    <Button variant="danger" onClick={handleDeleteSession}>
                        Удалить
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}

export default AdminSessions;