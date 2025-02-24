// Seat booking logic
import supabase from './supabase-client.js';

// Fetch seats from Supabase
async function fetchSeats() {
    const { data, error } = await supabase
        .from('seats')
        .select('*');

    if (error) {
        console.error('Error fetching seats:', error);
        return;
    }

    const seatsContainer = document.getElementById('seats-container');
    seatsContainer.innerHTML = ''; // Clear existing seats
    data.forEach((seat, index) => {
        seatsContainer.innerHTML += `<div class="seat" data-id="${seat.id}">Seat ${index + 1}</div>`;
    });
}

// Fetch seats on page load
fetchSeats();
