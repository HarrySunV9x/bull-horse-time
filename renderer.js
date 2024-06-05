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

    // 获取当月的第一天
    const firstDayOfMonth = new Date(currentYear, currentMonth - 1, 1);
    let totalWorkingHours = 0;

    // 遍历从当月第一天到当前日期
    for (let day = firstDayOfMonth; day <= currentDate; day.setDate(day.getDate() + 1)) {
        const weekDay = day.getDay();
        // 0 - 周日, 1 - 周一, 2 - 周二, 3 - 周三, 4 - 周四, 5 - 周五, 6 - 周六
        if (weekDay !== 0 && weekDay !== 6) { // 过滤掉周末
            totalWorkingHours += 8; // 每个工作日8小时
        }
    }

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
        document.getElementById('shouldTimeValue').innerText = totalWorkingHours.toFixed(3);
        document.getElementById('sumTimeValue').innerText = totalWorkTime.toFixed(3);
        document.getElementById('overTimeValue').innerText = (totalWorkTime - totalWorkingHours).toFixed(3);
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

function editTime(event) {
    const element = event.target;
    const currentTime = element.textContent;

    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'input-field';
    input.value = currentTime;

    element.replaceWith(input);
    input.focus();

    input.onblur = function() {
        saveTime(input, element);
    };

    input.onkeydown = function(event) {
        if (event.key === 'Enter') {
            saveTime(input, element);
        }
    };
}

function saveTime(input, originalElement) {
    const newTime = input.value;
    const isValid = validateTime(newTime);

    if (isValid) {
        const newButton = document.createElement('button');
        newButton.className = 'restTime';
        newButton.textContent = newTime;
        newButton.addEventListener('click', editTime);

        input.replaceWith(newButton);
    } else {
        alert('请输入正确的时间格式（hh:mm:ss）')
        const newButton = document.createElement('button');
        newButton.className = 'restTime';
        newButton.textContent = originalElement.textContent;
        newButton.addEventListener('click', editTime);

        input.replaceWith(newButton);
    }
}

function validateTime(time) {
    // Check the format hh:mm:ss
    const timeFormat = /^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/;
    return timeFormat.test(time);
}

flushHistory()
getLastClick()
getSumTime()
document.querySelector('#timeButton').addEventListener('click', clickFunction);
document.querySelectorAll('.restTime').forEach(function(element) {
    element.addEventListener('click', editTime);
});

