const pc = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] });
// test purposes:
function store(d, n = 's') {
    localStorage.setItem(n, JSON.stringify(d));
}

pc.onicecandidate = (e) => {
    if (e.candidate) {
        const key = pc.localDescription.type === 'offer' ? 'cand1' : 'cand2';
        store(e.candidate, key)
    }
};

document.getElementById('1').addEventListener('click', peer1);
document.getElementById('2').addEventListener('click', peer2);
document.getElementById('clear').addEventListener('click', clear);
document.getElementById('status').addEventListener('click', stat);

async function peer1() {
    const dc = pc.createDataChannel('demo');
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    console.log('p1 ready to pair')
    store(offer, 'offer')


}

async function peer2() {
    const remoteOffer = JSON.parse(localStorage.getItem('offer'));
    if (!remoteOffer) console.error('No valid offer found...');
    await pc.setRemoteDescription(remoteOffer);
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    store(answer, 'answer')
    console.log('p2 ready to pair')
    
}

function clear() {
    localStorage.clear();
}

function stat() {
    console.log(pc.iceConnectionState);
}

window.onstorage = async (e) => {
    if (e.key === 'answer') {
        console.log('got p2 answer')
        const remoteAnswer = JSON.parse(e.newValue);
        await pc.setRemoteDescription(remoteAnswer);
    } else if (e.key === 'cand1' || e.key === 'cand2')  {
        if (pc.remoteDescription) {
            await pc.addIceCandidate(JSON.parse(e.newValue)).catch(console.error);
        }
    }
}

pc.ondatachannel = (e) => {
    window.dc = e.channel;
    console.log('got channel');
}