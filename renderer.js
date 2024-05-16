let oneDayDate;
let oneDayStart, oneDayStartLocaleTimeString;
let oneDayEnd, oneDayEndLocaleTimeString;

oneDayDate = new Date();
const year = oneDayDate.getFullYear();
const month = String(oneDayDate.getMonth() + 1).padStart(2, '0'); // 补0
const day = String(oneDayDate.getDate()).padStart(2, '0'); // 补0

flushHistory()

function getOneDayWorkTime(start, end) {
    return Math.floor((end - start) / (1000 * 60 * 60));
}

function flushHistory() {
    window.electronAPI.getData().then(data => {
        // 在这里处理返回的数据
        let tableText = "<table>\n" +
            "    <tbody>\n";
        for (let i = 0; i < Math.min(4, data.length); i++) {
            tableText += "        <tr>\n" +
                "            <td>" + data[i].date + "</td>\n" +
                "            <td>" + data[i].startTime + "</td>\n" +
                "            <td>" + data[i].endTime + "</td>\n" +
                "            <td>" + data[i].workTime + "</td>\n" +
                "        </tr>\n";
        }
        tableText += "    </tbody>\n" +
            "</table>";
        document.getElementById('history').innerHTML = tableText;
    }).catch(error => {
        // 处理错误
        console.error('获取数据时出错：', error);
    });
}

function getHistory() {
    window.electronAPI.getData().then(data => {
        const index = data.findIndex(entry => entry.date === `${year}-${month}-${day}`);
        oneDayStartLocaleTimeString = data[index].startTime;
        oneDayEndLocaleTimeString = data[index].endTime;
        document.getElementById('startTime').innerText = "您戴上耕具的时间：\n" + oneDayStartLocaleTimeString;
        document.getElementById('endTime').innerText = "您回到棚子的时间：\n" + oneDayEndLocaleTimeString;
    }).catch(error => {
        // 处理错误
        console.error('获取数据时出错：', error);
    });
}

getHistory()
getSumTime()
document.querySelector('#timeButton').addEventListener('click', () => {
    if (!oneDayStartLocaleTimeString) {
        oneDayStart = new Date();
        document.getElementById('startTime').innerText = "您戴上耕具的时间：\n" + oneDayStart.toLocaleTimeString();
        window.electronAPI.generateData(`${year}-${month}-${day}`, oneDayStart.toLocaleTimeString(), '');
        oneDayStartLocaleTimeString = oneDayStart.toLocaleTimeString()
    } else {
        oneDayEnd = new Date();
        document.getElementById('endTime').innerText = "您回到棚子的时间：\n" + oneDayEnd.toLocaleTimeString();
        window.electronAPI.generateData(`${year}-${month}-${day}`, oneDayStartLocaleTimeString, oneDayEnd.toLocaleTimeString());
        flushHistory()
        getSumTime()
    }
});

function getSumTime() {
    // 假设现在是2024年5月
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1; // 月份从0开始，所以要加1

    window.electronAPI.getData().then(data => {
        // 计算本月的总工作时间
        let totalWorkTime = 0;
        data.forEach(entry => {
            const entryDate = new Date(entry.date);
            const entryYear = entryDate.getFullYear();
            const entryMonth = entryDate.getMonth() + 1;

            if (entryYear === currentYear && entryMonth === currentMonth) {
                totalWorkTime += parseFloat(entry.workTime);
            }
        });
        document.getElementById('sumTimeValue').innerText = totalWorkTime;
    }).catch(error => {
        // 处理错误
        console.error('获取数据时出错：', error);
    });
}