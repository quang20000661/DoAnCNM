/* các dòng const khai báo các biến tương tác với các tên id bên html bằng cú pháp
 documet.getElementById("tên id bên html")*/
const timeEl = document.getElementById('time');
const dateEl = document.getElementById('date');
const currentWeatherItemsEl = document.getElementById('current-weather-items');
const nhietdoto = document.getElementById('nhietdo');
const timezone = document.getElementById('time-zone');
const countryEl = document.getElementById('country');
const weatherForecastEl = document.getElementById('weather-forecast');
const currentTempEl = document.getElementById('current-temp');
const btn_find_cityname = document.getElementById('btn_find_city_name')
const inputnamecity = document.getElementById('input_city_name');
const matchlist = document.getElementById('match-list');
const btngetitem = document.getElementById("btnitemsearch");
const xemchitiet = document.getElementById("btnxemchitiet");
const chitietscroll = document.getElementById("scrollmenuchitiet");
const thongtinchitiet = document.getElementById("exampleModalCenterTitle");
const days = ['Chủ Nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7']
const months = ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'];

/* const API_KEY này là key được đăng ký trên website openweathermap để sử dụng các dữ liệu thời tiết trả về
thông qua key này*/
const API_KEY = '1779ca818b59557aa48558aec376d6db';


var long, lat, times;

/*hàm setInterval này lấy ngày giờ tháng năm thực*/
setInterval(() => {
    const time = new Date();
    const month = time.getMonth();
    const date = time.getDate();
    const day = time.getDay();
    const hour = time.getHours();
    const hoursIn12HrFormat = hour >= 13 ? hour % 12 : hour
    const minutes = time.getMinutes();
    const ampm = hour >= 12 ? 'PM' : 'AM'

    timeEl.innerHTML = (hoursIn12HrFormat < 10 ? '0' + hoursIn12HrFormat : hoursIn12HrFormat) + ':' + (minutes < 10 ? '0' + minutes : minutes) + ' ' + `<span id="am-pm">${ampm}</span>`

    dateEl.innerHTML = days[day] + ', ' + date + ' ' + months[month]
    times = days[day] + ', ' + date + ' ' + months[month];
}, 1000);

// khi chương trình được load chạy thì nó gọi đén hàm getWeatherData()
// window.addEventListener("load", () => {
//     getWeatherData();
// });
window.addEventListener("load", () => {
    getWeatherData();

    // Thêm sự kiện cho sự kiện beforeunload
    window.addEventListener("beforeunload", () => {
        // Gọi lại hàm khi trang sắp tải lại hoặc đóng
        getWeatherData();
    });
});


// trạng thái của thanh tìm kiếm khi gõ các ký tự được khái báo là một hàm bất đồng bộ với cú pháp là async
const searchStates = async searchText => {

    // lấy các dữ liệu trong file json (trong data/citylist.json)
    const res = await fetch('./data/citylist.json');

    /* res.json Nó trả về một lời hứa sẽ giải quyết bằng kết quả phân tích cú pháp văn bản nội dung dưới dạng JSON.
    từ biến res mà nó đã xử lý ở trên,từ đó nó lấy ra đươc 1 mảng dữ liệu được lưu vào viến states*/
    const states = await res.json();

    /* filter nó giống như vòng lặp for với 1 cái if để lấy ra những phần tử đạt điều kiện (if) 
    nó sẽ lọc ra các giá trị tên thầnh phố gần giống với cú pháp mình input vào form tìm kiếm từ 
    mảng states ở trên */
    let matches = states.filter(state => {
        /*
        RegExp ở đây là biểu thức chính quy với cú pháp ^${giá trị truyền vào} dấu ^ là bắt đầu của từ khoá nhập vào
        với thông số 'gi' ở đây là:
        i là so khớp không quan tâm đến chữ hoa chữ thường
        còn g là so khớp toàn bộ chuỗi cần tìm
         */
        const regex = new RegExp(`^${searchText}`, 'gi');

        /* state.name.match(regex) ở đây là gọi name trong file json thông qua biến lưu mảng json là 
         state còn match là sẽ tìm kiếm các chuỗi con phù hợp với biểu thức chính quy ( là biến regex) được cung cấp
         tương tự state.country.match(regex) sẽ lấy country
        */
        return state.name.match(regex) || state.country.match(regex);
    });

    // nếu không gõ ký tự nào thì matchlist sẽ ko hiện các dữ liệu gợi ý
    if (searchText.length === 0) {
        matches = [];
        // với matchlist ở đây là một tên biến id ở bên html được khai báo ở dòng 14 phía trên 
        matchlist.innerHTML = '';
    }
    // truyền các tên thành phố tương ứng được gợi ý vào hàm outputhtml
    outputHtml(matches);
}

// hàm này đưa các dữ liệu tìm kiếm được gợi ý từ hàm phía trên qua bên html cho nó hiễn thị
const outputHtml = matches => {
        /* nếu dữ liệu tự matches có được gợi ý tên thành phố thì từng tên thành phố sẽ được add như một button để khi bấm vào
          dữ liệu thời tiết sẽ nhảy đến đó */
        if (matches.length > 0) {
            const html = matches.map(match =>
                // mỗi cái tên gợi ý được nằm trong 1 button
                `<button onclick="getnamecitybybutton(this)" id="btnitemsearch" type="button" class="list-group-item list-group-item-action" value="${match.name}">
             ${match.name} <span>(${match.country})</span>
         </button>
         `
            ).join('');
            matchlist.innerHTML = html;
        }
    }
    // nếu thanh tìm kiếm được input ký tự thì gọi đến searchStates và truyền ký tự mình gõ vào để nó gợi ý
input_city_name.addEventListener('input', () => searchStates(input_city_name.value));

/* nếu bấm vào nút xem chi tiết thì nó sẽ thử gọi hàm getchitiet với 2 tham số long lat ở đây là kinh tuyến và vĩ tuyến
nhằm trả về vị trí vệ tinh để lấy dữ liệu thời tiết tại vị trí đó */
xemchitiet.addEventListener('click', () => {
    try {
        getchitiet(long, lat);
    } catch (error) {

    }
});
// nút tìm kiếm tên thành phố
btn_find_cityname.addEventListener('click', () => {
    if (inputnamecity.value === '') {
        alert("Không để trống")
    } else {
        getWeatherDataByCityName(inputnamecity.value);
        searchStates('');
        inputnamecity.value = '';
    }
});

function getnamecitybybutton(city) {
    getWeatherDataByCityName(city.value);

    // 2 dòng này sẽ xoá các dữ liệu gợi ý khi mình đã nhấn nút tìm kiếm tên 
    inputnamecity.value = "";
    matchlist.innerHTML = "";
}

// lấy dữ liệu thông qua tên thành phố được input từ khung tìm kiếm
function getWeatherDataByCityName(city) {
    /*
     fetch ni trỏ tới ... còn https://api.open.... ni là cú pháp mà website đăng ký dữ liệu api cũng cấp
     bắt buộc phải gõ đúng như nó yêu cầu link đọc dữ liệu https://openweathermap.org/forecast5
    */
    fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&lang=vi&appid=${API_KEY}`).then(res => res.json()).then(data => {

        showWeatherData(data);
        // lấy giá trị kinh tuyến vĩ tuyến lại tí dùng cho hàm khác
        long = data.city.coord.lon;
        lat = data.city.coord.lat;
    })
}

function getWeatherData() {
    // navigator.geolocation.getCurrentPosition này hiểu đơn giản là dùng để định vị vị trí
    navigator.geolocation.getCurrentPosition((success) => {
        let { latitude, longitude } = success.coords; //Xác định một tập hợp các tọa độ của vùng (.coords)
        fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&lang=vi&appid=${API_KEY}`).then(res => res.json()).then(data => {

            console.log(data)

            long = longitude;
            lat = latitude;

            showWeatherData(data);
        })
    })
}

/* hàm này sẽ lấy background mưa hay nắng hay gió hay tuyết rơi ... tuỳ vào "main" với main ở đây là trạng thái thời
tiết chính được trả về từ API với description ví dụ như trời nắng,trời quang đảng, hay trời mưa.... */
function getbackground(main) {
    var backgroundImage;
    if (main === "Clear") { backgroundImage = document.body.style.backgroundImage = "url('./imgbackground/sun.jpg')" } else if (main === "Clouds") { backgroundImage = document.body.style.backgroundImage = "url('./imgbackground/cloud.jpg')" } else if (main === "Rain") { backgroundImage = document.body.style.backgroundImage = "url('./imgbackground/rain.jpg')" } else if (main === "Snow") { backgroundImage = document.body.style.backgroundImage = "url('./imgbackground/snow.jpg')" } else if (main === "Thunderstorm") { backgroundImage = document.body.style.backgroundImage = "url('./imgbackground/thunder.jpg')" } else {}
    return backgroundImage;
}

function showWeatherData(data) {
    /* các biến như sunrise,sunset feels_like này ko được đặc ngẫu nhiên theo sỡ thích mà nó được lấy từ
     object muốn biết rõ thêm thì chạy web lên rồi bấm f12 ta sẽ thấy như này {cod: '200', message: 0, cnt: 40, list: Array(40), city: {…}
     xổ đoạn này ra thì t sẽ thấy các tên biến trong đó t gọi nó ra để lấy dữ liệu link ảnh minh hoạ
     https://scontent.fsgn2-7.fna.fbcdn.net/v/t1.15752-9/323841135_1731231480605204_6729238803081255878_n.png?_nc_cat=100&ccb=1-7&_nc_sid=ae9488&_nc_ohc=nXyH5IkuoGAAX-DjySf&_nc_ht=scontent.fsgn2-7.fna&oh=03_AdQ3wbs-y5YtyNkTkKPbQo1stam3vpa_hHJGmqh1QmiH7g&oe=63E46046
    */
    let { sunrise, sunset } = data.city;
    let { feels_like, humidity, sea_level, pressure } = data.list[0].main;
    let { main, description, icon } = data.list[0].weather[0];
    let { speed } = data.list[0].wind;
    var nhietdo = Math.floor(feels_like - 273);
    var Numbertempmax, Numbertempmin;
    Numbertempmax = Math.floor(data.list[0].main.feels_like - 273);
    Numbertempmin = Math.floor(data.list[0].main.feels_like - 273);
    var nhietdocaonhat;
    var nhietdothapnhat;
    var rains = 0;
    timezone.innerHTML = data.city.country + " / " + data.city.name;
    countryEl.innerHTML = data.city.coord.lat + 'N  - ' + data.city.coord.lon + 'E';
    /* tại vì không phải lúc nào trời cũng mưa nên API sẽ ko trả dữ liệu lượng mưa 3h trước cho ta
     nên t phải kiểm tra xem hiện tại thời tiết có đang mưa ("rain") không ? nếu có mưa thì t mới 
     lấy dữ liệu từ biến x gán cho rain với x là lượng mưa tính bằng milimet 
    */
    if (main === "Rain") {
        /* vì giá trị data.list[0].rain nằm trong một object nên t phải gán nó nằm trong một object
        nếu khi main không tồn tại "Rain" thì biến x lúc này sẽ bị lỗi , không rỏ lắm đại khái v
         */
        const x = Object.values(data.list[0].rain);
        rains = x[0]; // lấy giá trị đầu tiên cũng là giá trị lượng mưa nếu có mưa
    }

    let otherDayForcast = ''

    /* duyệt qua từng object trong list đễ hiển thị dự báo  trong 5 ngày tiếp theo */
    data.list.forEach((day, idx) => {

        var checktimday = window.moment(day.dt_txt).format('HH:mm:ss');
        var descriptiondubao = day.weather[0].description;
        var nhietdotrungbinh = Math.floor(day.main.feels_like - 273);

        // duyệt qua 12 object ban đầu xem thử hôm nay nhiệt độ cao nhất,nhỏ nhất là bao nhiều
        // hàm if ni để lấy giá trị nhiệt độ cao nhất và thấp nhất ngày hôm nay
        if (idx <= 12) {

            if (nhietdotrungbinh >= Numbertempmax) {
                Numbertempmax = nhietdotrungbinh;
                nhietdocaonhat = Numbertempmax;
            }
            if (nhietdotrungbinh <= Numbertempmin) {
                Numbertempmin = nhietdotrungbinh;
                nhietdothapnhat = Numbertempmin;
            }
        }
        // qua 00 giờ là tính ngày khác nên đều kiện đẽ hiển thị cho dữ báo 5 ngày tới là qua 0h là tính một ngày 
        if (idx != 0 && checktimday === "00:00:00") {
            otherDayForcast += `
                     <div class="weather-forecast-item">
                         <div class="day">${window.moment(day.dt * 1000).format('ddd DD/MM')}</div>
                         <img src="http://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png" alt="weather icon" class="w-icon">
                         <div class="templ">${nhietdotrungbinh}&#176;C</div>
                         <div class="templ">${descriptiondubao}</div>
                     </div>
                  `
        }
    })
    getbackground(main);

    // phần này để add dữ liệu vào html rồi cho html hiển thị
    currentTempEl.innerHTML = `
     <img src="http://openweathermap.org/img/wn/${icon}.png" alt="weather icon" class="w-icon">
     <div class="other">
         <div class="day" >Hôm nay</div>
         <div class="templ">Cao nhất - ${nhietdocaonhat}&#176;C</div>
         <div class="templ">Thấp nhất - ${nhietdothapnhat}&#176;C</div>
     </div>
     `
    nhietdoto.innerHTML =
        `<div class="temp">
         <div class="textnhiet">${nhietdo}</div>
         <div class="textdoc">°C</div>
     </div>
     <div class="iconstemp"><img src="http://openweathermap.org/img/wn/${icon}@2x.png"></div>
     <div class="description row">
         <div class="contentdes ">${description}</div>
     </div>
     <div class="temp_min_max">
         Nhiệt độ cao nhất :${nhietdocaonhat}°C  -  Nhiệt độ thấp nhất :${nhietdothapnhat}°C
     </div>
     `;
    currentWeatherItemsEl.innerHTML =
        `<div class="weather-item">
         <div>Độ ẩm</div>
         <div>${humidity} %</div>
     </div>
     <div class="weather-item">
         <div>Áp suất </div>
         <div>${pressure} hPa</div>
     </div>
     <div class="weather-item">
         <div>Tốc độ gió</div>
         <div>${speed} m/s</div>
     </div>
 
     <div class="weather-item">
         <div>Bình Minh</div>
         <div>${window.moment(sunrise * 1000).format('HH:mm a')}</div>
     </div>
     <div class="weather-item">
         <div>Hoàng Hôn</div>
         <div>${window.moment(sunset * 1000).format('HH:mm a')}</div>
     </div>
     <div class="weather-item">
         <div>Mực nước biển</div>
         <div>${sea_level} hPa</div>
     </div>
     <div class="weather-item">
         <div>Lượng mưa 3h qua</div>
         <div>${rains} mm</div>
     </div>
     
     `;
    weatherForecastEl.innerHTML = otherDayForcast;


}

function getchitiet(long, lat) {
    /* lấy thông tin chi tiết này nó sẽ dùng lại hai biến kinh tuyến và vĩ tuyến của vị trí hiện tại
    qua hai biến long và lat*/

    fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${long}&lang=vi&appid=${API_KEY}`).then(res => res.json()).then(data => {
        thongtinchitiet.innerHTML = `
                   <div class="datec" id="date">${times}  -</div>
                   <div id="country" class="countryc">-  ${data.city.name}</div>
                   <div class="time-zonec" id="time-zone">/(${data.city.country})</div>
     `
        let listchitietscroll = ''
        data.list.forEach((day, idx) => {
            var checktime = window.moment(day.dt_txt).format('HH:mm');
            var nhietdotrungbinh = Math.floor(day.main.feels_like - 273);
            var descriptiondubao = day.weather[0].description;
            if (idx <= 12) {
                listchitietscroll += `
             <div class="nav-item col-xl-2">
                         <div class="card " >
                           <div class="card-body">
                             <h5 class="card-title">${checktime}</h5>
                             <img class="card-img-top" src="https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png" alt="icon ${descriptiondubao}">
                             <p class="card-text">${descriptiondubao}<br>${nhietdotrungbinh}&#176;C</p>
                           </div>
                         </div>
                       </div>
             `
            }
        })
        chitietscroll.innerHTML = listchitietscroll;
    })
}