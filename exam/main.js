const apiKey = "cf43badf-645c-488b-9363-39198ca1ce8d";
const defaultURL = "http://exam-2023-1-api.std-900.ist.mospolytech.ru/api"

const defaultURLDecodeAddress = "https://catalog.api.2gis.com/3.0/items/geocode"
const apiKeyDecodeAddress = "rulmsy3374";



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

let allDataRoutes;
let guidesData;

async function getAllRoutes(page = 1) {
    finalURL = new URL(defaultURL + "/routes");
    finalURL.searchParams.append("api_key", apiKey);
    try {
        let response = await fetch(finalURL);
        let data = await response.json();

        // showMessage("success","Данные успешно загружены!");
        addObjectsToSelect(data);

        return data.slice(page * 10 - 10, page * 10);
    }
    catch(error) {
        showMessage("warning", error.message);
    }
}

function addRoutesToMainTable(data) {
    let mainTable = document.querySelector("#mainRoutesTable");
    mainTable.innerHTML = "";

    for (let record of data) {
        let newRow = document.createElement('div');
        newRow.classList.add("row","p-0", "mb-3", "border-top");
        mainTable.appendChild(newRow);

        let name = document.createElement('div');
        name.classList.add("col-3", "p-0","mt-1", "border-end", "text-center");
        name.innerText = record.name;
        newRow.appendChild(name);
        
        let description = document.createElement('div');
        description.classList.add("col-3", "mt-1", "border-end");
        let descriptionText = document.createElement("p");
        descriptionText.classList.add("muted");
        if (record.description.length > 100) {
            let descriptionToolTip = document.createElement("a");
            descriptionToolTip.setAttribute("data-bs-toggle", "tooltip");
            descriptionToolTip.setAttribute("data-bs-title", record.description);
            descriptionToolTip.innerText = record.description.slice(0,100) + "...";
            descriptionText.appendChild(descriptionToolTip);
        } else {
            descriptionText.innerText = record.description;
        }
        description.appendChild(descriptionText);
        newRow.appendChild(description);

        let mainObjects = document.createElement('div');
        mainObjects.classList.add("col-3", "border-end");
        let mainObjectList = record.mainObject.split("-");
        for (let object of mainObjectList) {
            let oneObjectRecord = document.createElement("p");
            oneObjectRecord.innerText = object;
            mainObjects.appendChild(oneObjectRecord);
        }
        newRow.appendChild(mainObjects);

        let selectBtnDiv = document.createElement("div");
        selectBtnDiv.classList.add("col-3", "mt-5","text-center", "border-end","p-0");
        let selectBtn = document.createElement('button');
        selectBtn.classList.add("btn", "border-orange", "text-orange", "select-route", "p-1");
        selectBtn.innerText = "Выбрать";
        selectBtn.setAttribute("data-routeId", record.id);
        selectBtn.addEventListener("click", () => {
            getGuidesById(record.id).then(result => {
                guidesData = result;
                addGuidesToMainTable(result);
                createDefaultFilterLanguage("selectLangGuideForm", "Язык экскурсии");
                createDefaultFilterExp(result);
                addOptionsToLangSelect(result);
                setRouteIdToForm(record.id);
            })
            showAndGoGuides();
            setNameOfRoute(record.name);
            document.querySelector("#routeNameGuideSection").setAttribute("data-id", record.id);
            // showMapSection();
            setCorrectCoordsToMarker(record.coords);
        });
        selectBtnDiv.appendChild(selectBtn);
        newRow.appendChild(selectBtnDiv);
        
    }
    const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]')
    const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl))
}

function createPaginationBtn(currentPage) {
    let paginationBtnBlock = document.querySelector("#paginationBtnBlock");
    paginationBtnBlock.innerHTML = "";
    let start = currentPage - 1;
    if (currentPage == 1) {
        start = 1
    }

    for (i = start; i <= start + 2; i++) {
        let newPageBtn = document.createElement("button");
        newPageBtn.classList.add("btn", "pagination-btn", "border-5", "border-orange", "me-1");
        newPageBtn.classList.add("border-orange", "me-1", "text-orange");
        newPageBtn.setAttribute("data-page", i);
        newPageBtn.innerText = i;
        if (i == currentPage) {
            newPageBtn.classList.remove("text-orange");
            newPageBtn.classList.add("bg-orange", "text-white");
        }

        newPageBtn.addEventListener("click", () => {
            createPaginationBtn(newPageBtn.dataset.page);
            scrollTo(0,0);
        });

        paginationBtnBlock.appendChild(newPageBtn);
    }
}

function searchRoutesByName(searchName) {
    let object;
    if(document.querySelector("#selectRouteForm").value != "default" &&
    document.querySelector("#selectRouteForm").value != "notSelected") {
        object = document.querySelector("#selectRouteForm").value;
    } else {
        object = "";
    }
    let resultArray = [];
    for (let record of allDataRoutes) {
        if (record.name.includes(searchName) && record.mainObject.includes(object)) {
            resultArray.push(record);
        }
    }
    addRoutesToMainTable(resultArray);
    return resultArray;
}

function searchByNameInputHandler(event) {
    searchRoutesByName(document.querySelector("#searchByNameInput").value);
    createPaginationBtns(1);
}

function searchRoutesByObjects(objectName) {
    if (objectName == "notSelected") {
        addRoutesToMainTable(allDataRoutes);
        return;
    }
    let searchName;
    if(document.querySelector("#searchByNameInput").value != "notSelected") {
        searchName = document.querySelector("#searchByNameInput").value;
    } else {
        searchName = "";
    }
    let resultArray = [];
    for (let record of allDataRoutes) {
        if (record.mainObject.includes(objectName) && record.name.includes(searchName)) {
            resultArray.push(record);
        }
    }
    addRoutesToMainTable(resultArray);
    return resultArray;
}

function searchRoutesByObjectsHandler(event){
    searchRoutesByObjects(event.target.value);
}

function addObjectsToSelect(data) {
    let objectSelector = document.querySelector("#selectRouteForm");
    for (let record of data) {
        let objectList = record.mainObject.split("-");
        for (let object of objectList) {
            let newOption = document.createElement("option");
            newOption.innerText = object;
            objectSelector.appendChild(newOption);
        }
    }
}

//----------------------------

async function getGuidesById(id) {
    finalURL = new URL(`${defaultURL}/routes/${id}/guides`);
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

function searchGuidesByLangHandler(event) {
    searchGuidesByFiltersAndValidate();
}

function searchGuidesByExpHandler(event) {
    searchGuidesByFiltersAndValidate();
}

function searchGuidesByFiltersAndValidate() {
    let routeId = document.querySelector("#routeNameGuideSection").dataset.id;
    let language;
    let workExpMin = document.querySelector("#selectMinExpGuideForm");
    let workExpMax = document.querySelector("#selectMaxExpGuideForm");

    workExpMin.setAttribute("max", workExpMax.value);
    workExpMax.setAttribute("min", workExpMin.value);

    if(document.querySelector("#selectLangGuideForm").value != "default") {
        language = document.querySelector("#selectLangGuideForm").value;
    } else {
        language = "";
    }

    getGuidesById(routeId).then(result => {
        let resultArray = [];
        if (workExpMin.value == -1) {
            for (let record of result) {
                if (record.language.includes(language)) {
                    resultArray.push(record);
                }
            }
            addGuidesToMainTable(resultArray);
            return;
        }
        for (let record of result) {
            if (record.workExperience >= workExpMin.value &&
            record.workExperience <= workExpMax.value && 
            record.language.includes(language)) {
                resultArray.push(record);
            }
        }
        addGuidesToMainTable(resultArray);
    });
}

function createDefaultFilterExp(data) {
    let selectMinExpGuideForm = document.querySelector("#selectMinExpGuideForm");
    let selectMaxExpGuideForm = document.querySelector("#selectMaxExpGuideForm");

    let workExpArray = [];

    for (let record of data) {
        workExpArray.push(record.workExperience);
    }

    let minWorkExp = Math.min(...workExpArray);
    let maxWorkExp = Math.max(...workExpArray);

    selectMinExpGuideForm.setAttribute("min", minWorkExp);
    selectMinExpGuideForm.setAttribute("max", maxWorkExp);
    selectMinExpGuideForm.setAttribute("value", minWorkExp);

    selectMaxExpGuideForm.setAttribute("min", minWorkExp);
    selectMaxExpGuideForm.setAttribute("max", maxWorkExp);
    selectMaxExpGuideForm.setAttribute("value", maxWorkExp);

}

function createDefaultFilterLanguage() {
    let filterSelect = document.querySelector("#selectLangGuideForm");
    filterSelect.innerHTML = "";
    let defaultOption = document.createElement("option");
    defaultOption.setAttribute("selected", "selected");
    defaultOption.setAttribute("disabled", "disabled");
    defaultOption.setAttribute("value", "default");
    defaultOption.innerText = "Язык экскурсии";
    filterSelect.appendChild(defaultOption);
}

function setNameOfRoute(name) {
    document.querySelector("#routeNameGuideSection").innerText = name;
}

function addOptionsToLangSelect(data) {
    let selectLangGuideForm = document.querySelector("#selectLangGuideForm");
    let langArray = [];
    for (let record of data) {
        langArray.push(record.language);
    }

    let uniqueLangArray = [...new Set(langArray)];

    for (let record of uniqueLangArray) {
        let newOption = document.createElement("option");
        newOption.innerText = record;
        selectLangGuideForm.appendChild(newOption);
    }
}

function showAndGoGuides() {
    let tourGuideSection = document.getElementById("tourGuideSection");
    tourGuideSection.classList.remove("d-none");
    window.location.href = "#mapSection";
}

function addGuidesToMainTable(data) {
    let mainGiudeTable = document.querySelector("#mainGiudeTable");
    mainGiudeTable.innerHTML = "";
    for (let record of data) {
        // console.log(record);
        let newRow = document.createElement("div");
        newRow.classList.add("row", "text-center", "p-0", "pt-1", "pb-2", "border-top");

        let avatarDiv = document.createElement("div");
        avatarDiv.classList.add("col-1", "p-0", "d-flex","align-items-center", "text-center", "border-end");
        let avatar = document.createElement("img");
        avatar.classList.add("img-fluid", "w-50");
        avatar.src = "images/guides/avatar.png";
        avatarDiv.appendChild(avatar);
        newRow.appendChild(avatarDiv);

        let name = document.createElement("div");
        name.classList.add("col-2", "p-0", "border-end");
        name.innerText = record.name;
        newRow.appendChild(name);

        let language = document.createElement("div");
        language.classList.add("col-2", "p-0", "border-end");
        language.innerText = record.language;
        newRow.appendChild(language);

        let workExp = document.createElement("div");
        workExp.classList.add("col-2","p-0", "border-end");
        workExp.innerText = record.workExperience;
        newRow.appendChild(workExp);

        let pricePerHour = document.createElement("div");
        pricePerHour.classList.add("col-3", "p-0", "border-end");
        pricePerHour.innerText = record.pricePerHour;
        newRow.appendChild(pricePerHour);

        let chooseBtnDiv = document.createElement("div");
        chooseBtnDiv.classList.add("col-2", "p-0");

        let chooseBtn = document.createElement("input");
        chooseBtn.classList.add("form-check-input", "guideCheckbox");
        chooseBtn.setAttribute("type", "radio");
        chooseBtn.setAttribute("data-id", record.id);
        chooseBtn.setAttribute("data-name", record.name);
        chooseBtn.setAttribute("data-price", record.pricePerHour);

        chooseBtn.addEventListener("click", () => {
            let guideCheckboxList = document.querySelectorAll(".guideCheckbox");
            for (let guideChecked of guideCheckboxList) {
                guideChecked.checked = false;
            }
            chooseBtn.checked = true;
        })

        chooseBtnDiv.appendChild(chooseBtn);
        newRow.appendChild(chooseBtnDiv)

        mainGiudeTable.appendChild(newRow);
    }
}

function openAddOrderModalHandler(event) {

    if (!validateGuideSelection()) {
        showMessage("warning", "Требуется выбрать гида");
        return;
    } else {
        let myModal = new bootstrap.Modal(document.querySelector("#addOrderFormModal"))
        myModal.show();
    }

    setRouteNameToModal();
    setGuideNameToModal(getCheckedGuide());
    setTodayDate();
    calculatePrice();
}

function setTodayDate() {
    let today = new Date();
    let day = String(today.getDate() + 1);
    let month = String(today.getMonth() + 1);
    let year = today.getFullYear();

    today = year + '-' + month + '-' + day;
    
    let date = document.querySelector("#date");
    date.setAttribute("value", today);
    date.setAttribute("min", today);
}

function setRouteNameToModal() {
    let routeNameModal = document.querySelector("#routeNameModal");

    let routeNameGuideSection = document.querySelector("#routeNameGuideSection");

    routeNameModal.innerText = routeNameGuideSection.innerText;
}

function validateGuideSelection() {
    let guideCheckboxList = document.querySelectorAll(".guideCheckbox");
    let counter = 0;

    for (let guideChecked of guideCheckboxList) {
        if (guideChecked.checked) {
            counter++;
        }
    }

    if (counter == 0) {
        return false;
    } else return true;
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

function getCheckedGuide() {
    let guideCheckboxList = document.querySelectorAll(".guideCheckbox");

    let checkedGuide;

    for (let guide of guideCheckboxList) {
        if (guide.checked) {
            checkedGuide = guide.dataset.name;
            setGuideIdToForm(guide.dataset.id);
            setGuideServiceCost(guide.dataset.price);
        }
    }


    return checkedGuide;
}

function setGuideServiceCost(price) {
    let guideServiceCost = document.querySelector("#guideServiceCost");
    guideServiceCost.value = price;
}

function setGuideNameToModal(name) {
    document.querySelector("#guideNameModal").innerText = name;
}

function setGuideIdToForm(id) {
    let guideId = document.querySelector("#guideId");
    guideId.value = id;
}

function setRouteIdToForm(id) {
    let routeId = document.querySelector("#routeId");
    routeId.value = id;
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

async function addOrderBtnHandler(event) {
    let formCreateOrder = document.querySelector("#modalForm");
    formElements = formCreateOrder.elements;
    // console.log(formElements);

    let price = document.querySelector("#price").innerText;
    let optionFirst = formElements["optionFirst"].checked ? 1 : 0;
    let optionSecond = formElements["optionSecond"].checked ? 1 : 0;



    let form = document.createElement("form");
    let dataFromForm = new FormData(form);

    dataFromForm.append("guide_id", formElements["guideId"].value);
    dataFromForm.append("route_id", formElements["routeId"].value);
    dataFromForm.append("date", formElements["date"].value);
    dataFromForm.append("time", formElements["time"].value);
    dataFromForm.append("duration", formElements["duration"].value);
    dataFromForm.append("persons", formElements["persons"].value);
    dataFromForm.append("price", price);
    dataFromForm.append("optionFirst", optionFirst);
    dataFromForm.append("optionSecond", optionSecond);

    let finalURL = new URL(defaultURL + "/orders");
    finalURL.searchParams.append("api_key", apiKey);

    try {
        let res = await fetch(finalURL, {
            method: 'POST',
            body: dataFromForm
        });
        let data = await res.json();

        showMessage("success", "Заказ успешно оформлен");
    } catch(error) {
        showMessage("warning", error)
    }
}

function searchAddressBtnHandler(event) {
    let startAddress = document.querySelector("#startAddressInput").value;

    let tourGuideSection = document.querySelector("#tourGuideSection");
    if (tourGuideSection.classList.contains("d-none")) {
        showMessageMapDiv("Сначала выберите маршрут");
        return;
    }

    if (startAddress.length == 0) {
        showMessageMapDiv("Проверьте правильность введённого адреса");
        return;
    }

    getCoordinates(startAddress).then(data => {
        if (data.result.total != "1") {
            showMessageMapDiv("Проверьте правильность введённого адреса");
            return;
        }
        addCurrentAddressMarker(data.result.items[0].point)
    })

}

let markerCurrentAddress;

function addCurrentAddressMarker(point) {
    if (markerCurrentAddress) {
        markerCurrentAddress.destroy();
    }

    markerCurrentAddress = new mapgl.Marker(map, {
        coordinates: [point.lon, point.lat],
        label: {
            text: "Вы здесь",
            offset: [0, -75],
            image: {
                url: 'https://docs.2gis.com/img/mapgl/tooltip.svg',
                size: [100, 40],
                padding: [10, 10, 20, 10],
            },
        }
    });

    map.setCenter([point.lon, point.lat]);

    checkAndAddDirections();
}

let markerDestAddress;

function addDestAddressMarker(point) {
    if (markerDestAddress) {
        markerDestAddress.destroy();
    }

    markerDestAddress = new mapgl.Marker(map, {
        coordinates: [point[0], point[1]],
        label: {
            text: "Место назначения",
            offset: [0, -75],
            image: {
                url: 'https://docs.2gis.com/img/mapgl/tooltip.svg',
                size: [100, 40],
                padding: [10, 10, 20, 10],
            },
        }
    });

    map.setCenter([point.lon, point.lat]);

    checkAndAddDirections();
}

//вытаскивание координат из массива, массива с массивами,
//массива в массиве с массивом 
function setCorrectCoordsToMarker(pointList) {
    if (typeof(pointList[0]) === "number") {
        addDestAddressMarker(pointList); //coords[x,y]
        console.log(pointList + "2 numbers");
    } else if (pointList[0] instanceof Object) {
        if (typeof(pointList[0][0]) === "number") {
            addDestAddressMarker(pointList[0]); //coords[[x,y]]
            console.log(pointList[0] + "1x array");
        } else if (pointList[0][0] instanceof Object) {
            if (typeof(pointList[0][0][0]) === "number") {
                addDestAddressMarker(pointList[0][0]); //coords[[[x,y]]]
                console.log(pointList[0][0] + "2x array");
            };
        };
    };
}

function createDirections(firstPoint, secondPoint){
    const directions = new mapgl.Directions(map, {
        directionsApiKey: 'ffcb67d7-ac14-44b4-8302-ce9db35ca3b0',
    });

    console.log(firstPoint);
    console.log(secondPoint);

    directions.pedestrianRoute({
        points: [
            firstPoint, 
            secondPoint,
        ],
    });
}

function checkAndAddDirections() {
    if (markerDestAddress && markerCurrentAddress) {
        createDirections(markerCurrentAddress.getCoordinates(),
        markerDestAddress.getCoordinates());
    }


}

function showMessageMapDiv(messageText) {
    let messageDiv = document.createElement("div");
    messageDiv.classList.add("my-3", "p-2", "rounded-2", "bg-warning");

    let message = document.createElement("span");
    message.innerText = messageText;
    messageDiv.appendChild(message);

    startAddressDiv.appendChild(messageDiv);

    setTimeout(() => {
        messageDiv.remove();
    },3000);
}


async function getCoordinates(address) {

    let finalURL = new URL(defaultURLDecodeAddress);
    finalURL.searchParams.append("q", "Москва, " + address);
    finalURL.searchParams.append("fields", "items.point");
    finalURL.searchParams.append("key", apiKeyDecodeAddress);

    try {
        let response = await fetch(finalURL);
        let data = await response.json();
        
        return data;
    } catch(error) {
        showMessage("warning", error.message)
    }
}

function showMapSection() {
    let mapSection = document.querySelector("#mapSection");
    mapSection.classList.remove("d-none");
}

let map;

window.onload = function (){

    window.location.href = "#navbar";

    map = new mapgl.Map('containerMap', {
        center: [37.61938696289053, 55.75135224786582],
        zoom: 13,
        key: 'ffcb67d7-ac14-44b4-8302-ce9db35ca3b0',
        lang: "ru",
    });

    createPaginationBtn(1);

    getAllRoutes().then(result => {
        addRoutesToMainTable(result);
        allDataRoutes = result;
    });

    let btn = document.querySelector('#btn').addEventListener("click", ()=>{
        showMessage("success", Date.now());
    })

    let clearRoutesFiltersBtn = document.querySelector("#clearRoutesFiltersBtn");
    clearRoutesFiltersBtn.addEventListener("click", () => {
        document.querySelector("#searchRouteForm").reset();
        getAllRoutes();
    });

    let clearGuidesFiltersBtn = document.querySelector("#clearGuidesFiltersBtn");
    clearGuidesFiltersBtn.addEventListener("click", () => {
        document.querySelector("#searchGuideForm").reset();
        addGuidesToMainTable(guidesData);
    });

    document.querySelector("#searchByNameInput").oninput = searchByNameInputHandler;
    document.querySelector("#selectRouteForm").onchange = searchRoutesByObjectsHandler;
    document.querySelector("#selectLangGuideForm").onchange = searchGuidesByLangHandler;
    document.querySelector("#selectMinExpGuideForm").onchange = searchGuidesByExpHandler;
    document.querySelector("#selectMaxExpGuideForm").onchange = searchGuidesByExpHandler;


    // let modalCreateOrder = document.querySelector('#openAddOrderBtn');
    // modalCreateOrder.addEventListener('show.bs.modal', addOrder);

    let openAddOrderBtn = document.querySelector("#openAddOrderBtn");
    // openAddOrderBtn.addEventListener('show.bs.modal', openAddOrderModalHandler);
    openAddOrderBtn.addEventListener("click", openAddOrderModalHandler);

    let addOrderBtn = document.querySelector("#addOrderBtn");
    addOrderBtn.addEventListener("click", addOrderBtnHandler);


    let time = document.querySelector("#time");
    time.oninput = validateTime;

    let elementsModalForm = document.querySelectorAll(".add-order-extra-class");
    for (let element of elementsModalForm) {
        element.onchange = calculatePrice;
    }

    let searchAddressBtn = document.querySelector("#searchAddress");
    searchAddressBtn.onclick = searchAddressBtnHandler;
}