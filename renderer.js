let oneDayStart;
let oneDayEnd;

function getOneDayWorkTime(start, end) {
    return Math.floor((end - start) / (1000 * 60 * 60));
}

document.querySelector('#timeButton').addEventListener('click', () => {
    if (!oneDayStart) {
        oneDayStart = new Date();
        document.getElementById('startTime').innerText = oneDayStart.toLocaleTimeString();
    } else {
        oneDayEnd = new Date();
        document.getElementById('endTime').innerText = oneDayEnd.toLocaleTimeString();
        document.getElementById('wortTime').innerText = ((oneDayEnd.getTime() - oneDayStart.getTime()) / (1000 * 60 * 60)).toFixed(3);
        window.electronAPI.generateData(oneDayStart, oneDayEnd)
    }
});
