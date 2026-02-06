// Simulated data
let currentMode = 'visitor';
let myToken = null;
let selectedCounter = 1;
let tokenCounter = 42;

const services = {
    'quick-approval': { name: 'Quick Approval', prefix: 'A', time: 5 },
    'document-verification': { name: 'Document Verification', prefix: 'B', time: 10 },
    'consultation': { name: 'Consultation', prefix: 'C', time: 20 },
    'payment': { name: 'Payment Services', prefix: 'D', time: 7 }
};

let queue = [
    { token: 'A-039', service: 'Quick Approval', status: 'serving', counter: 1, wait: 0 },
    { token: 'B-018', service: 'Document Verification', status: 'next', counter: 2, wait: 2 },
    { token: 'C-007', service: 'Consultation', status: 'waiting', counter: null, wait: 5 },
    { token: 'A-040', service: 'Quick Approval', status: 'waiting', counter: null, wait: 8 },
    { token: 'D-025', service: 'Payment Services', status: 'waiting', counter: null, wait: 12 },
    { token: 'A-041', service: 'Quick Approval', status: 'waiting', counter: null, wait: 15 }
];

function switchMode(mode) {
    currentMode = mode;
    document.getElementById('visitorMode').classList.toggle('hidden', mode !== 'visitor');
    document.getElementById('staffMode').classList.toggle('hidden', mode !== 'staff');
    document.getElementById('visitorModeBtn').classList.toggle('active', mode === 'visitor');
    document.getElementById('staffModeBtn').classList.toggle('active', mode === 'staff');
    
    if (mode === 'visitor') {
        updateVisitorQueue();
    } else {
        updateStaffQueue();
    }
}

function getToken(serviceType) {
    const service = services[serviceType];
    tokenCounter++;
    const token = `${service.prefix}-${String(tokenCounter).padStart(3, '0')}`;
    
    myToken = {
        token: token,
        service: service.name,
        position: queue.filter(q => q.status === 'waiting').length + 1
    };

    queue.push({
        token: token,
        service: service.name,
        status: 'waiting',
        counter: null,
        wait: (queue.length + 1) * 5
    });

    document.getElementById('serviceSelectionCard').classList.add('hidden');
    document.getElementById('myTokenCard').classList.remove('hidden');
    document.getElementById('myTokenNumber').textContent = token;
    updateMyTokenStatus();
    updateVisitorQueue();
}

function updateMyTokenStatus() {
    if (!myToken) return;
    
    const position = queue.findIndex(q => q.token === myToken.token);
    const ahead = queue.slice(0, position).filter(q => q.status === 'waiting').length;
    
    document.getElementById('myTokenStatus').textContent = 
        ahead === 0 ? 'You are next in queue' : `${ahead} ${ahead === 1 ? 'visitor' : 'visitors'} ahead in queue`;
    document.getElementById('myWaitTime').textContent = `${ahead * 5} minutes`;
    
    const totalInQueue = queue.filter(q => q.status === 'waiting').length;
    const progress = ((totalInQueue - ahead) / totalInQueue) * 100;
    document.getElementById('myProgress').style.width = `${progress}%`;
}

function updateVisitorQueue() {
    const display = document.getElementById('queueDisplay');
    display.innerHTML = '';
    
    queue.slice(0, 6).forEach(item => {
        const div = document.createElement('div');
        div.className = `queue-item ${item.status === 'serving' ? 'now-serving' : ''} ${item.status === 'next' ? 'next-up' : ''}`;
        
        let statusText = '';
        if (item.status === 'serving') {
            statusText = `Now serving at Counter ${item.counter}`;
        } else if (item.status === 'next') {
            statusText = 'Next up!';
        } else {
            statusText = item.service;
        }
        
        div.innerHTML = `
            <div>
                <div class="token-number">${item.token}</div>
                <div class="queue-item-service">${statusText}</div>
            </div>
            <div class="wait-time">${item.wait === 0 ? 'NOW SERVING' : `${item.wait} MIN`}</div>
        `;
        display.appendChild(div);
    });

    // Update stats
    document.getElementById('totalWaiting').textContent = queue.filter(q => q.status === 'waiting').length;
    document.getElementById('avgWaitTime').textContent = Math.round(queue.reduce((sum, q) => sum + q.wait, 0) / queue.length);
    
    if (myToken) {
        updateMyTokenStatus();
    }
}

function updateStaffQueue() {
    const display = document.getElementById('staffQueueDisplay');
    display.innerHTML = '';
    
    Object.keys(services).forEach(serviceKey => {
        const service = services[serviceKey];
        const serviceQueue = queue.filter(q => q.service === service.name);
        
        if (serviceQueue.length > 0) {
            const div = document.createElement('div');
            div.className = 'queue-item';
            div.innerHTML = `
                <div>
                    <div style="font-weight: 700; color: var(--text-primary); font-size: 1.05em; margin-bottom: 8px;">${service.name}</div>
                    <div style="color: var(--text-secondary); font-size: 0.875em;">
                        In Queue: ${serviceQueue.filter(q => q.status === 'waiting').length} | 
                        Average Service Time: ${service.time} minutes
                    </div>
                </div>
                <div class="wait-time">${serviceQueue.length} Total</div>
            `;
            display.appendChild(div);
        }
    });
}

function selectCounter(num) {
    selectedCounter = num;
    document.querySelectorAll('.counter-btn').forEach((btn, index) => {
        btn.classList.toggle('active', index === num - 1);
    });
    document.getElementById('currentCounter').textContent = num;
}

function callNext() {
    const nextInQueue = queue.find(q => q.status === 'waiting');
    if (nextInQueue) {
        // Mark current as complete
        queue = queue.filter(q => q.status !== 'serving' || q.counter !== selectedCounter);
        
        // Set next as serving
        nextInQueue.status = 'serving';
        nextInQueue.counter = selectedCounter;
        nextInQueue.wait = 0;
        
        document.getElementById('currentToken').textContent = nextInQueue.token;
        
        // Update all waiting times
        queue.forEach((item, index) => {
            if (item.status === 'waiting') {
                item.wait = (index + 1) * 5;
            }
        });
        
        updateVisitorQueue();
        updateStaffQueue();
    }
}

function markNoShow() {
    queue = queue.filter(q => !(q.status === 'serving' && q.counter === selectedCounter));
    const noShows = document.getElementById('staffNoShows');
    noShows.textContent = parseInt(noShows.textContent) + 1;
    callNext();
}

function completeService() {
    queue = queue.filter(q => !(q.status === 'serving' && q.counter === selectedCounter));
    const served = document.getElementById('staffServedToday');
    served.textContent = parseInt(served.textContent) + 1;
    document.getElementById('servedToday').textContent = served.textContent;
    updateVisitorQueue();
    updateStaffQueue();
}

function pauseCounter() {
    alert(`Counter ${selectedCounter} paused. Click "Call Next Visitor" to resume.`);
}

function sendAnnouncement() {
    const message = prompt('Enter announcement message:');
    if (message) {
        alert(`Announcement sent: "${message}"`);
    }
}

function viewAnalytics() {
    alert('Analytics dashboard would open here with detailed reports and trends.');
}

function printQueue() {
    alert('Queue list sent to printer.');
}

// Simulate real-time updates
setInterval(() => {
    // Randomly update wait times to simulate movement
    queue.forEach(item => {
        if (item.status === 'waiting' && item.wait > 0) {
            item.wait = Math.max(0, item.wait - 1);
        }
    });
    
    if (currentMode === 'visitor') {
        updateVisitorQueue();
    }
}, 60000); // Update every minute

// Initialize
updateVisitorQueue();
