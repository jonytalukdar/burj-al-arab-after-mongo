import React, { useContext, useEffect, useState } from 'react';
import { UserContext } from '../../App';

const Bookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loggedInUser, setLoggedInUser] = useContext(UserContext);
  useEffect(() => {
    fetch('http://localhost:5000/bookings?email=' + loggedInUser.email, {
      method: 'get',
      headers: {
        'Content-Type': 'application/json',
        authorization: `Bearer ${sessionStorage.getItem('token')}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setBookings(data);
      });
  }, []);
  return (
    <div>
      <h1>You Have Booked : {bookings.length}</h1>
      {bookings.map((book) => (
        <li>
          {book.name} from {new Date(book.checkIn).toDateString('dd/MM/yyyy')}{' '}
          to {new Date(book.checkOut).toTimeString('dd/MM/yyyy')}
        </li>
      ))}
    </div>
  );
};

export default Bookings;
