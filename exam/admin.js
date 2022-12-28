const apiKey = "cf43badf-645c-488b-9363-39198ca1ce8d";
const defaultUrl = "http://exam-2023-1-api.std-900.ist.mospolytech.ru/api/orders";

const defaultUrlGuides = "http://exam-2023-1-api.std-900.ist.mospolytech.ru/api"

const defaultUrlRoutes = "http://exam-2023-1-api.std-900.ist.mospolytech.ru/api";

function showMessage(style, message) {
    let alerts = document.querySelector("#alertsContainer");
    let alert = document.createElement("div");

    alert.classList.add("alert", "alert-dismissible", `alert-${style}`, "w-100", "m-1" );
    alert.setAttribute("role", "alert");
    alert.innerText = message;

    let btn = document.createElement("button");
    btn.setAttribute("type", "button");
    btn.classList.add("btn-close");
    btn.setAttribute("data-bs-dismiss", "alert");
    btn.setAttribute("aria-label", "Close");
    alert.append(btn);
    alerts.append(alert);

    setTimeout(() => {
        alert.remove();
    },5000);
}

async function getAllOrders() {
    let finalURL = new URL(defaultUrl);
    finalURL.searchParams.append("api_key", apiKey);
    try {
        let response = await fetch(finalURL);
        let data = await response.json();

        return data;
    } catch(error) {
        showMessage("warning", error.message);
    }
}

function addToOrderTable(data) {
    let counter = 1;
    let ordersList = document.querySelector("#ordersList");
    ordersList.innerHTML = "";
    for (let record of data) {
        let newRow = document.createElement("div");
        newRow.classList.add("row", "text-center", "mb-3", "border-top");
        newRow.classList.add("pt-3")

        let orderNum = document.createElement("div");
        orderNum.classList.add("col-1", "p-0", "border-end");
        orderNum.innerText = counter;
        newRow.appendChild(orderNum);

        let nameOfRoute = document.createElement("div");
        nameOfRoute.classList.add("col-3", "p-0", "border-end");
        getNameOfRouteById(record.route_id).then(result => {
            nameOfRoute.innerText = result;
        })
        newRow.appendChild(nameOfRoute);

        let priceDiv = document.createElement("div");
        priceDiv.classList.add("col-3", "p-0", "border-end");
        priceDiv.innerText = record.price;
        newRow.appendChild(priceDiv);

        let detailsDiv = document.createElement("div");
        detailsDiv.classList.add("col-3", "text-center", "p-0", "border-end");

        let detailsBtn = document.createElement("button");
        detailsBtn.classList.add("btn", "border-orange", "text-orange");
        detailsBtn.classList.add("p-1", "fs-7");
        detailsBtn.setAttribute("data-orderid", record.id);
        detailsBtn.innerText = "Подробнее";

        detailsDiv.appendChild(detailsBtn);
        newRow.appendChild(detailsDiv);

        let controlDiv = document.createElement("div");
        controlDiv.classList.add("col-2", "d-flex", "justify-content-between");

        let editBtn = document.createElement("i");
        editBtn.classList.add("bi", "bi-pen");
        editBtn.setAttribute("data-orderid", record.id);
        editBtn.setAttribute("data-routeid", record.route_id);
        editBtn.setAttribute("data-guideid", record.guide_id);

        editBtn.onclick = editBtnHandler;

        let removeBtn = document.createElement("i");
        removeBtn.classList.add("bi", "bi-trash");
        removeBtn.setAttribute("data-orderid", record.id);
        removeBtn.onclick = removeBtnHandler;


        controlDiv.appendChild(editBtn);
        controlDiv.appendChild(removeBtn);
        newRow.appendChild(controlDiv);

        counter++;
        ordersList.appendChild(newRow);
    }
}

function editBtnHandler(event) {
    let routeId = event.target.dataset.routeid;
    let guideId = event.target.dataset.guideid;
    let orderId = event.target.dataset.orderid;
    setMinTodayDate();
    setValuesToModalEdit(routeId, guideId, orderId);

    let myModal = new bootstrap.Modal(document.querySelector("#modalEdit"))
    myModal.show();
}

function validateTime(event) {
    time = document.querySelector("#time").value;
    
    if ((time.slice(3,5) == "00" || time.slice(3,5) == "30") &&
    parseInt(time.slice(0,2), 10) >= 9 && parseInt(time.slice(0,2), 10) <= 23
    ) {
        return true;
    } else {
        invalidTimeMessage();
        event.target.value = "09:00"
        return false;
    };
}
function invalidTimeMessage() {
    let timeDivModal = document.querySelector("#timeDivModal");

    let messageDiv = document.createElement("div");
    messageDiv.classList.add("my-3", "p-1", "rounded-2", "bg-warning");

    let message = document.createElement("span");
    message.innerText = "Экскурсии возможны с 09:00 до 23:00 раз в 30 минут";
    messageDiv.appendChild(message);

    timeDivModal.appendChild(messageDiv);

    setTimeout(() => {
        messageDiv.remove();
    },3000);
}   

function setMinTodayDate() {
    let today = new Date();
    let day = String(today.getDate());
    let month = String(today.getMonth() + 1);
    let year = today.getFullYear();

    today = year + '-' + month + '-' + day;
    
    let date = document.querySelector("#date");
    date.setAttribute("min", today);
}

function setValuesToModalEdit(routeId, guideId, orderId) {
    let orderIdHiidenInput = document.querySelector("#orderId");
    orderIdHiidenInput.value = orderId;

    let guideNameModal = document.querySelector("#guideNameModal");
    let guideServiceCost = document.querySelector("#guideServiceCost");
    getGuidesById(routeId).then(data => {
        for (let record of data) {
            if (record.id == guideId) {
                guideServiceCost.value = record.pricePerHour;
                guideNameModal.innerText = record.name;
            }
        }
    });
    
    let routeNameModal = document.querySelector("#routeNameModal");
    getNameOfRouteById(routeId).then(result => {
        routeNameModal.innerText = result;
    });

    let date = document.querySelector("#date");
    let time = document.querySelector("#time");
    let duration = document.querySelector("#duration");
    let persons = document.querySelector("#persons");
    let optionFirst = document.querySelector("#optionFirst");
    let optionSecond = document.querySelector("#optionSecond");
    let price = document.querySelector("#price");

    let guideIdHiidenInput = document.querySelector("#guideId");
    guideIdHiidenInput.value = guideId;
    let routeIdHiidenInput = document.querySelector("#routeId");
    routeIdHiidenInput.value = routeId;

    getOrderById(orderId).then(output => {
        date.value = output.date;
        time.value = output.time;
        duration.value = output.duration;
        persons.value = output.persons;
        optionFirst.checked = output.optionFirst;
        optionSecond.checked = output.optionSecond;
        price.innerText = output.price;
    })
}


function calculatePrice() {
    let price = document.querySelector("#price");
    let form = document.querySelector("#modalForm");
    let formElements = form.elements;

    let guideServiceCost = formElements["guideServiceCost"].value;
    let hoursNumber = formElements["duration"].value;
    let date = formElements["date"].value;
    let time = formElements["time"].value;
    let persons = formElements["persons"].value;
    
    let dayOff = isThisDayOff(date);
    let morning = isItMorning(time);
    let evening = isItEvening(time);

    persons = numberOfVisitors(persons);

    let optionFirstStatus = formElements["optionFirst"].checked;

    let optionFirst = optionFirstStatus ? 1.3 : 1;

    let optionSecondStatus = formElements["optionSecond"].checked;
    let optionSecond = getMultiplyerSecondOption(optionSecondStatus,date);

    let totalPrice = guideServiceCost * hoursNumber * dayOff + morning;
    totalPrice = totalPrice + evening + persons;
    totalPrice = totalPrice * optionFirst * optionSecond
    price.innerText = Math.round(totalPrice);
}

function getMultiplyerSecondOption(checked, dateString) {
    let [year, month, day] = dateString.split('-');

    let date = new Date(year, month - 1, day);

    let monthAndDay = `${month}-${day}`;

    if (date.getDay() == 0 || date.getDay() == 6 && checked) {
        return 1.25;
    } else if (checked) {
        return 1.3;
    } else return 1;
}

function numberOfVisitors(persons) {
    if (persons < 5) {
        return 0;
    } else if (persons >= 5 && persons < 10) {
        return 1000;
    } else if (persons >= 10 && persons <= 20) {
        return 1500;
    }
}

function isItMorning(time) {
    let hour = time.slice(0,2);
    if (hour >= 9 && hour <= 12) {
        return 400;
    } else return 0;
}

function isItEvening(time) {
    let hour = time.slice(0,2);
    if (hour >= 20 && hour <= 23) {
        return 1000;
    } else return 0; 
}

const holidays = [
    '01-01',
    '01-02',
    '01-03',
    '03-08',
    '02-23',
    '05-09',
    '09-01',
    '06-12',
    '05-01',
]

function isThisDayOff(dateString) {
    let [year, month, day] = dateString.split('-');

    let date = new Date(year, month - 1, day);

    let monthAndDay = `${month}-${day}`;

    if (date.getDay() == 0 || date.getDay() == 6 || (holidays.includes(monthAndDay))) {
        return 1.5;
    } else return 1;
}

async function getOrderById(id) {
    let finalURL = new URL(defaultUrl + `/${id}`);
    finalURL.searchParams.append("api_key", apiKey);
    
    try {
        let response = await fetch(finalURL);
        let data = await response.json();

        return data;
    } catch(error) {
        showMessage("warning", error.message);
    }
}

async function getGuidesById(id) {
    finalURL = new URL(`${defaultUrlGuides}/routes/${id}/guides`);
    finalURL.searchParams.append("api_key", apiKey);
    try {
        let response = await fetch(finalURL);
        let data = await response.json();
        return data;
    }
    catch(error) {
        showMessage("warning", error.message);
    }
}

async function getNameOfRouteById(id) {
    finalURL = new URL(defaultUrlRoutes + "/routes");
    finalURL.searchParams.append("api_key", apiKey);
    try {
        let response = await fetch(finalURL);
        let data = await response.json();
        for (let record of data) {
            if (record.id == id) {
                console.log(record.name);
                return record.name;
            }
        }
    }
    catch(error) {
        showMessage("warning", error.message);
    }
}

async function editOrder() {
    let formCreateOrder = document.querySelector("#modalForm");
    formElements = formCreateOrder.elements;

    let price = document.querySelector("#price").innerText;
    let optionFirst = formElements["optionFirst"].checked ? 1 : 0;
    let optionSecond = formElements["optionSecond"].checked ? 1 : 0;

    let form = document.createElement("form");
    let dataFromForm = new FormData(form);

    dataFromForm.append("date", formElements["date"].value);
    dataFromForm.append("time", formElements["time"].value);
    dataFromForm.append("duration", formElements["duration"].value);
    dataFromForm.append("persons", formElements["persons"].value);
    dataFromForm.append("price", price);
    dataFromForm.append("optionFirst", optionFirst);
    dataFromForm.append("optionSecond", optionSecond);

    let finalURL = new URL(defaultUrl + `/${formElements["orderId"].value}`);
    finalURL.searchParams.append("api_key", apiKey);

    try {
        let res = await fetch(finalURL, {
            method: 'PUT',
            body: dataFromForm
        });
        let data = await res.json();

        getAllOrders().then(result => {
            addToOrderTable(result);
        })

        showMessage("success", "Заказ успешно изменён");
    } catch(error) {
        showMessage("warning", error.message)
    }
}

function removeBtnHandler(event) {
    let deleteOrderBtn = document.querySelector("#deleteOrderBtn");
    deleteOrderBtn.setAttribute("data-orderid", event.target.dataset.orderid);
    let myModal = new bootstrap.Modal(document.querySelector("#modalDelete"))
    myModal.show();
}

function deleteOrder(event) {
    let orderId = event.target.dataset.orderid;
    deleteOrderById(orderId);
}

async function deleteOrderById(id) {
    let finalURL = new URL(defaultUrl + `/${id}`);
    finalURL.searchParams.append("api_key", apiKey);

    try {
        let res = await fetch(finalURL, {
            method: 'DELETE',
        });

        getAllOrders().then(result => {
            addToOrderTable(result);
        })

        showMessage("success", "Заказ успешно изменён");

    } catch(error) {
        showMessage("warning", error.message)
    }
}

window.onload = function() {
    getAllOrders().then(result => {
        addToOrderTable(result);
    })

    let elementsModalForm = document.querySelectorAll(".add-order-extra-class");
    for (let element of elementsModalForm) {
        element.onchange = calculatePrice;
    }

    let time = document.querySelector("#time");
    time.oninput = validateTime;

    let editOrderBtn = document.querySelector("#editOrderBtn");
    editOrderBtn.onclick = editOrder;

    let deleteOrderBtn = document.querySelector("#deleteOrderBtn");
    deleteOrderBtn.onclick = deleteOrder;

}