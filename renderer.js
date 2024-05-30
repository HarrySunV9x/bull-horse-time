let today;
let todayStart;
let todayEnd;

function getTodayYMD(){
    let year = today.getFullYear();
    let month = today.getMonth() + 1;
    let day = today.getDate();
    return `${year}-${month}-${day}`
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

function getLastClick(){
    if (!today) {
        today = new Date();
    }
    window.electronAPI.getData().then(data => {
        // 在这里处理返回的数据
        let lastClick = data[0];
        if (lastClick.date === getTodayYMD()) {
            if(lastClick.startTime){
                todayStart = lastClick.startTime;
            }
            if(lastClick.endTime){
                todayEnd = lastClick.endTime;
            }
            if(todayStart){
                document.getElementById('startTime').innerText = "您戴上耕具的时间：\n" + todayStart;
            }
            if(todayEnd){
                document.getElementById('endTime').innerText = "您回到棚子的时间：\n" + todayEnd;
            }
        }
    }).catch(error => {
        // 处理错误
        console.error('获取数据时出错：', error);
    });
}

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

window.electronAPI.screenLock(()=>{
    clickFunction()
})

function istoday(){
    let tmpData = new Date();
    if( today &&
        today.getFullYear() === tmpData.getFullYear() &&
        today.getMonth() === tmpData.getMonth() &&
        today.getDate() === tmpData.getDate()){
    }
    else{
        today = tmpData;
        todayStart = null;
        todayEnd = null;
    }
}

async function clickFunction() {
    istoday();
    if (!todayStart) {
        todayStart = new Date();
        todayStart = todayStart.toLocaleTimeString();
        document.getElementById('startTime').innerText = "您戴上耕具的时间：\n" + todayStart;
        window.electronAPI.generateData(getTodayYMD(), todayStart, '');
    } else {
        todayEnd = new Date();
        todayEnd = todayEnd.toLocaleTimeString();
        document.getElementById('endTime').innerText = "您回到棚子的时间：\n" + todayEnd;
        window.electronAPI.generateData(getTodayYMD(), todayStart, todayEnd);
        flushHistory();
        getSumTime();
    }
}

flushHistory()
getLastClick()
getSumTime()
document.querySelector('#timeButton').addEventListener('click', clickFunction);