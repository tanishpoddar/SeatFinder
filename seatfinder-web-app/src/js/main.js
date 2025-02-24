document.addEventListener('DOMContentLoaded', () => {
    // Initialize Supabase
    const supabaseUrl = 'https://xtfdqugzquxighlzzclq.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh0ZmRxdWd6cXV4aWdobHp6Y2xxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk4Mjg2MjIsImV4cCI6MjA1NTQwNDYyMn0.EhUE0wOkf7BUlUmqzh6UzM8VRKI4plK_CPMhaMbAEts';
    const supabase = supabase.createClient(supabaseUrl, supabaseKey);

    const seatsContainer = document.getElementById('seats-container');
    const bookingSection = document.getElementById('booking-section');
    const qrPopup = document.getElementById('qr-popup');
    const qrPopupClose = document.getElementById('qr-popup-close');
    const qrPopupDetails = document.getElementById('qr-popup-details');
    const alertMessage = document.getElementById('alert-message');

    // Function to generate seat SVG
    const seatSVG = (index, status) => `
        <div class="seat-container">
            <svg class="seat ${status}" data-index="${index}" viewBox="0 0 100 100">
                <path d="M85,95H15c-5.5,0-10-4.5-10-10V35c0-5.5,4.5-10,10-10h70c5.5,0,10,4.5,10,10v50C95,90.5,90.5,95,85,95z M85,15H15c-2.8,0-5-2.2-5-5s2.2-5,5-5h70c2.8,0,5,2.2,5,5S87.8,15,85,15z"/>
            </svg>
            <div class="seat-number">${index + 1}</div>
        </div>
    `;

    // Fetch seats from Supabase
    async function fetchSeats() {
        const { data, error } = await supabase
            .from('seats')
            .select('*');

        if (error) {
            console.error('Error fetching seats:', error);
            alertMessage.textContent = 'Failed to fetch seats. Please try again.';
            alertMessage.style.display = 'block';
            return;
        }

        seatsContainer.innerHTML = ''; // Clear existing seats
        data.forEach((seat, index) => {
            seatsContainer.innerHTML += seatSVG(index, seat.status);
        });
    }

    // Subscribe to seat updates
    supabase
        .from('seats')
        .on('UPDATE', (payload) => {
            const { id, status } = payload.new;
            updateSeatStatus(id, status);
        })
        .subscribe();

    // Update seat status
    function updateSeatStatus(seatId, status) {
        const seat = document.querySelector(`.seat[data-index="${seatId}"]`);
        if (seat) {
            seat.className = `seat ${status}`;
        }
    }

    // Book seat and generate QR code
    document.getElementById('generate-qr').addEventListener('click', async () => {
        const selectedSeat = document.querySelector('.seat.selected');
        if (!selectedSeat) return;

        const seatId = selectedSeat.dataset.index;
        const startTime = document.getElementById('start-time').value;
        const duration = parseInt(document.getElementById('duration').value);

        try {
            const { data, error } = await supabase
                .from('seats')
                .update({
                    status: 'booked',
                    user_id: 'current-user-id', // Replace with actual user ID
                    booking_time: new Date().toISOString(),
                    expiry_time: new Date(Date.now() + duration * 60000).toISOString()
                })
                .eq('id', seatId);

            if (error) throw error;

            // Generate QR code
            const qrData = JSON.stringify({ seatId, startTime, duration });
            const qr = await QRCode.toDataURL(qrData);
            const qrImage = document.createElement('img');
            qrImage.src = qr;
            document.querySelector('#qr-popup div').innerHTML = '';
            document.querySelector('#qr-popup div').appendChild(qrImage);
            qrPopupDetails.innerHTML = `Start Time: ${startTime}<br>Duration: ${duration} minutes`;
            qrPopup.style.display = 'block';
        } catch (error) {
            console.error('Booking error:', error);
            alert('Failed to book seat. Please try again.');
        }
    });

    // Close QR popup
    qrPopupClose.addEventListener('click', () => {
        qrPopup.style.display = 'none';
    });

    // Fetch seats on page load
    fetchSeats();
});