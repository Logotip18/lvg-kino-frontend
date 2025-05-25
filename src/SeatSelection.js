import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

function SeatSelection() {
    const [sessions, setSessions] = useState([]);
    const [selectedSessionId, setSelectedSessionId] = useState(null);
    const [hall, setHall] = useState(null);
    const [selectedSeat, setSelectedSeat] = useState(null);
    const [people, setPeople] = useState(1);
    const [showModal, setShowModal] = useState(false);
    const [bookingResult, setBookingResult] = useState(null);

    useEffect(() => {
        fetch('http://localhost:3000/api/sessions')
            .then(response => response.json())
            .then(data => {
                const sortedSessions = data.sort((a, b) => new Date(a.time) - new Date(b.time));
                console.log('Sorted sessions:', sortedSessions);
                setSessions(sortedSessions);
                if (sortedSessions.length > 0) {
                    setSelectedSessionId(sortedSessions[0].id);
                }
            })
            .catch(error => console.error('Ошибка:', error));
    }, []);

    useEffect(() => {
        if (selectedSessionId) {
            setBookingResult(null);
            fetch(`http://localhost:3000/api/hall/${selectedSessionId}`)
                .then(response => response.json())
                .then(data => {
                    console.log('Received hall data:', JSON.stringify(data, null, 2));
                    setHall(data);
                })
                .catch(error => console.error('Ошибка:', error));
        }
    }, [selectedSessionId]);

    const handleSeatClick = (row, seat) => {
        if (hall.seats[row][seat].status === 'booked') return;
        setSelectedSeat({ row, seat, type: hall.seats[row][seat].type });
        setPeople(hall.seats[row][seat].type === 'pouf' ? 1 : hall.seats[row][seat].type === 'double' ? 2 : 4);
        setShowModal(true);
    };

    const handleBooking = () => {
        if (!selectedSeat) return;
        const bookingData = {
            sessionId: selectedSessionId,
            row: selectedSeat.row,
            seat: selectedSeat.seat,
            people,
        };
        console.log('Sending booking request:', bookingData);
        fetch(`http://localhost:3000/api/book`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bookingData),
        })
            .then(response => response.json())
            .then(data => {
                console.log('Booking response:', data);
                setBookingResult(data);
                setHall(prev => {
                    const newSeats = prev.seats.map((row, rIndex) =>
                        rIndex === selectedSeat.row
                            ? row.map((seat, sIndex) =>
                                  sIndex === selectedSeat.seat
                                      ? { ...seat, status: 'booked', people }
                                      : seat
                            )
                            : row
                    );
                    console.log('Updated seats:', JSON.stringify(newSeats, null, 2));
                    return { ...prev, seats: newSeats };
                });
                setShowModal(false);
                setSelectedSeat(null);
                setPeople(1);
            })
            .catch(error => {
                console.error('Error:', error);
                setBookingResult({ error: error.message });
                setShowModal(false);
            });
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedSeat(null);
        setPeople(1);
    };

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
        return grouped;
    };

    const groupedSessions = groupSessionsByDate();

    if (!hall || !sessions.length) return <div className="text-center">Загрузка...</div>;

    return (
        <div className="container mt-4 text-center">
            <h2 className="booking-header">Бронирование в LVG-KINO</h2>
            <div className="row">
                <div className="col-md-4 session-block">
                    <h4 className="session-title">Выберите сеанс</h4>
                    {Object.keys(groupedSessions).length > 0 ? (
                        Object.keys(groupedSessions).map(date => (
                            <div key={date} className="mb-3">
                                <h5 className="date-header">{date}</h5>
                                <ul className="list-group">
                                    {groupedSessions[date].map(session => (
                                        <li
                                            key={session.id}
                                            className={`list-group-item ${selectedSessionId === session.id ? 'active' : ''}`}
                                            onClick={() => setSelectedSessionId(session.id)}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            {session.movieTitle} - {new Date(session.time).toLocaleTimeString('ru-RU', {
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))
                    ) : (
                        <p>Нет доступных сеансов.</p>
                    )}
                </div>
                <div className="col-md-8 hall-block">
                    <h4 className="hall-title">Схема зала</h4>
                    <div className="screen mb-4">Экран</div>
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
                                                onClick={() => handleSeatClick(rowIndex, seatIndex)}
                                                title={seatData.status === 'booked' 
                                                    ? `Забронировано` 
                                                    : `${isPouf ? 'Пуфик (1 чел.)' : isDouble ? 'Двухместный диван (2–3 чел.)' : 'Четырёхместный диван (4–6 чел.)'}`}
                                            >
                                                {seatIndex + 1}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="legend mt-3">
                        <div><span className="seat seat-pouf"></span> Пуфик (1 чел.)</div>
                        <div><span className="seat seat-double"></span> Двухместный диван (2–3 чел.)</div>
                        <div><span className="seat seat-quad"></span> Четырёхместный диван (4–6 чел.)</div>
                        <div><span className="legend-booked"></span> Забронировано</div>
                    </div>
                    {bookingResult && (
                        <div className="alert alert-success mt-3">
                            {bookingResult.message} {bookingResult.totalCost && `Сумма: ${bookingResult.totalCost} руб.`}
                        </div>
                    )}
                </div>
            </div>

            <Modal show={showModal} onHide={handleCloseModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Бронирование места</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group>
                            <Form.Label>
                                Количество человек ({selectedSeat?.type === 'pouf' ? '1' : selectedSeat?.type === 'double' ? '2–3' : '4–6'})
                            </Form.Label>
                            <div className="d-flex gap-2 mt-2">
                                {selectedSeat?.type === 'pouf' && (
                                    <Button
                                        variant={people === 1 ? 'primary' : 'outline-secondary'}
                                        onClick={() => setPeople(1)}
                                    >
                                        1
                                    </Button>
                                )}
                                {selectedSeat?.type === 'double' && (
                                    <>
                                        <Button
                                            variant={people === 2 ? 'primary' : 'outline-secondary'}
                                            onClick={() => setPeople(2)}
                                        >
                                            2
                                        </Button>
                                        <Button
                                            variant={people === 3 ? 'primary' : 'outline-secondary'}
                                            onClick={() => setPeople(3)}
                                        >
                                            3
                                        </Button>
                                    </>
                                )}
                                {selectedSeat?.type === 'quad' && (
                                    <>
                                        <Button
                                            variant={people === 4 ? 'primary' : 'outline-secondary'}
                                            onClick={() => setPeople(4)}
                                        >
                                            4
                                        </Button>
                                        <Button
                                            variant={people === 5 ? 'primary' : 'outline-secondary'}
                                            onClick={() => setPeople(5)}
                                        >
                                            5
                                        </Button>
                                        <Button
                                            variant={people === 6 ? 'primary' : 'outline-secondary'}
                                            onClick={() => setPeople(6)}
                                        >
                                            6
                                        </Button>
                                    </>
                                )}
                            </div>
                        </Form.Group>
                        <p className="mt-3">Стоимость: {people * 400} руб. (400 руб./чел.)</p>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseModal}>Отмена</Button>
                    <Button variant="primary" onClick={handleBooking}>Забронировать</Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}

export default SeatSelection;