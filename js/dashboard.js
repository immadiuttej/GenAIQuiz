const API_BASE = 'https://epam-genai-junglequest-dashboard.azurewebsites.net';

let currentSlot = null;

async function fetchSlots() {
    try {
        const res = await fetch(`${API_BASE}/api/slots`);
        return await res.json();
    } catch (err) {
        console.error('Error fetching slots', err);
        return [];
    }
}

async function refreshSlotInfo() {
    const slotInfo = document.getElementById('slot-info');
    const startBtn = document.getElementById('start-slot-btn');
    const stopBtn = document.getElementById('stop-slot-btn');
    const slots = await fetchSlots();
    currentSlot = slots.find(s => s.status === 'active' || s.active) || null;

    if (currentSlot) {
        slotInfo.textContent = `Active Slot: ${currentSlot.name} (${currentSlot.id})`;
        startBtn.style.display = 'none';
        stopBtn.style.display = 'inline-block';
    } else {
        slotInfo.textContent = 'No active slot.';
        startBtn.style.display = 'inline-block';
        stopBtn.style.display = 'none';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const loginBtn = document.getElementById('login-btn');
    const loginMsg = document.getElementById('login-message');
    const loginForm = document.getElementById('login-form');
    const dashboard = document.getElementById('dashboard');

    const adminUser = 'admin';
    const adminPass = 'genai';

    loginBtn.addEventListener('click', () => {
        const u = document.getElementById('admin-user').value;
        const p = document.getElementById('admin-pass').value;
        if (u === adminUser && p === adminPass) {
            loginForm.style.display = 'none';
            dashboard.style.display = 'block';
            refreshSlotInfo();
        } else {
            loginMsg.textContent = 'Invalid credentials';
        }
    });

    document.getElementById('start-slot-btn').addEventListener('click', async () => {
        const name = prompt('Enter slot name');
        if (!name) return;
        await fetch(`${API_BASE}/api/slots/start`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ slotName: name })
        });
        refreshSlotInfo();
    });

    document.getElementById('stop-slot-btn').addEventListener('click', async () => {
        if (!currentSlot) return;
        await fetch(`${API_BASE}/api/slots/${currentSlot.id}/stop`, { method: 'POST' });
        refreshSlotInfo();
    });
});
