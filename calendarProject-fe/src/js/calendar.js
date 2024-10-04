import { filteredScheduleData, showScheduleModal } from './modal_modulized';

// 전체 스케줄 가져오기
let schedules = [];

async function fetchData() {
  try {
    // fetch로 GET 요청을 보내고 응답을 기다림
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/schedules`);

    // 응답이 성공적(200~299)인지 확인
    if (!res.ok) {
      throw new Error('Network response was not ok');
    }

    // 응답 본문을 JSON으로 파싱
    schedules = await res.json();
    updateCalendar();

    // 데이터 출력
    console.log(schedules, '캘린더js에서 호출');
  } catch (error) {
    // 오류 처리
    console.error('Fetch error:', error);
  }
}

let currentDate = new Date();

const logoElement = document.querySelector('.sidebar-logo a');
const calendarMonthElement = document.querySelector('.calendar-month');
const calendarYearElement = document.querySelector('.calendar-year');
const previousMonth = document.querySelector('.arrow-left');
const nextMonth = document.querySelector('.arrow-right');
const calendarCont = document.querySelector('.calendar-date');
const yearSelectText = document.querySelector('.calendar-select-year-text');
const monthSelectText = document.querySelector('.calendar-select-month-text');
const yearSelectBox = document.querySelector('.calendar-select-year-box');
const monthSelectBox = document.querySelector('.calendar-select-month-box');
const yearSelectCont = document.querySelector('.calendar-select-year');
const monthSelectCont = document.querySelector('.calendar-select-month');
const yearList = document.querySelectorAll('.calendar-select-year-list li');
const monthList = document.querySelectorAll('.calendar-select-month-list li');

// 처음 화면에서 셀렉트 박스 닫힘
yearSelectBox.style.display = 'none';
monthSelectBox.style.display = 'none';

function updateCalendar(newSchedules) {
  if (newSchedules) {
    schedules = newSchedules;
  }
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;
  // 현재 연도, 월 표시
  calendarMonthElement.textContent = String(month).padStart(2, '0');
  calendarYearElement.textContent = year;

  yearSelectText.textContent = `${year} 년`;
  monthSelectText.textContent = `${calendarMonthElement.textContent} 월`;
  renderCalendarDays(year, month);
}

// 연도 선택 핸들러
yearList.forEach((item) => {
  item.addEventListener('click', function () {
    const selectedYear = parseInt(this.textContent, 10);
    currentDate.setFullYear(selectedYear);
    yearSelectText.textContent = `${selectedYear} 년`; // 셀렉트 박스 연도 바꾸기
    updateCalendar();
  });
});

// 월 선택 핸들러
monthList.forEach((item) => {
  item.addEventListener('click', function () {
    const selectedMonth = parseInt(this.textContent, 10);
    currentDate.setMonth(selectedMonth - 1);
    monthSelectText.textContent = `${selectedMonth} 월`; // 셀렉트 박스 월 바꾸기
    updateCalendar();
  });
});

// 셀렉트 박스 열고 닫기
function toggleSelectBox(selectBox, otherSelectBox) {
  if (selectBox.style.display === 'block') {
    yearSelectBox.style.display = 'none';
    monthSelectBox.style.display = 'none';
  } else {
    selectBox.style.display = 'block';
    otherSelectBox.style.display = 'none'; // 다른 셀렉트 박스는 닫기
  }
}

function initializeSelectBox() {
  yearSelectCont.addEventListener('click', function () {
    toggleSelectBox(yearSelectBox, monthSelectBox);
  });

  monthSelectCont.addEventListener('click', function () {
    toggleSelectBox(monthSelectBox, yearSelectBox);
  });

  updateCalendar();
}

function renderCalendarDays(year, month) {
  calendarCont.innerHTML = '';

  const daysOfWeek = ['일', '월', '화', '수', '목', '금', '토'];
  let table = document.createElement('table');
  let headerRow = document.createElement('tr');

  // 요일 별 클래스 추가 및 토요일, 일요일 클래스 추가
  daysOfWeek.forEach((day, index) => {
    let th = document.createElement('th');
    th.textContent = day;
    th.classList.add('day-header');
    if (index === 0) th.classList.add('sunday');
    if (index === 6) th.classList.add('saturday');
    headerRow.appendChild(th);
  });

  table.appendChild(headerRow);

  const firstDay = new Date(year, month - 1, 1).getDay();
  const lastDate = new Date(year, month, 0).getDate();
  const today = new Date();

  // 이전 달 마지막 날짜
  const prevLastDate = new Date(year, month - 1, 0).getDate();

  let row = document.createElement('tr');

  // 이전 달 날짜 채우기
  for (let i = 0; i < firstDay; i++) {
    let td = document.createElement('td');
    td.textContent = prevLastDate - firstDay + i + 1;
    td.classList.add('prev-month');
    row.appendChild(td);
  }

  // 현재 달 날짜 채우기
  for (let date = 1; date <= lastDate; date++) {
    if (row.children.length === 7) {
      table.appendChild(row);
      row = document.createElement('tr');
    }

    let td = document.createElement('td');
    let span = document.createElement('span');
    span.textContent = date;
    td.appendChild(span);
    td.classList.add('calendar-day');
    span.classList.add('calendar-day-date');

    // 오늘 날짜 클래스 추가 ==> 후에 css 작업
    if (
      year === today.getFullYear() &&
      month === today.getMonth() + 1 &&
      date === today.getDate()
    ) {
      td.classList.add('today');
      // today 셀의 숫자에 따로 div 태그, class
      let todaySpan = document.createElement('span');
      todaySpan.classList.add('calendar-day-date');
      let todayIndicator = document.createElement('div');
      todayIndicator.classList.add('today-indicator');
      todayIndicator.textContent = date;
      td.innerHTML = '';
      todaySpan.appendChild(todayIndicator);
      td.appendChild(todaySpan);
    }

    const scheduleForDate = schedules.filter((schedule) => {
      const scheduleStart = new Date(schedule.schedule_start);
      const scheduleEnd = new Date(schedule.schedule_end);

      // 기본 일정(반복 없음)
      if (
        scheduleStart.getFullYear() === year &&
        scheduleStart.getMonth() + 1 === month &&
        scheduleStart.getDate() <= date &&
        scheduleEnd.getFullYear() === year &&
        scheduleEnd.getMonth() + 1 === month &&
        scheduleEnd.getDate() >= date
      ) {
        return true;
      }
    });

    // 스케줄 바 추가
    scheduleForDate.forEach((schedule) => {
      const scheduleElement = document.createElement('div');
      scheduleElement.classList.add('schedule-bar');
      scheduleElement.textContent = schedule.schedule_title;
      td.appendChild(scheduleElement);
    });

    row.appendChild(td);
  }

  // 다음 달 날짜 채우기
  let nextMonthDay = 1;
  while (row.children.length < 7) {
    let td = document.createElement('td');
    td.textContent = nextMonthDay++;
    td.classList.add('next-month');
    row.appendChild(td);
  }

  table.appendChild(row);
  calendarCont.appendChild(table);
}

// 이전 달 이동
previousMonth.addEventListener('click', () => {
  currentDate.setMonth(currentDate.getMonth() - 1);
  updateCalendar();
});
// 다음 달 이동
nextMonth.addEventListener('click', () => {
  currentDate.setMonth(currentDate.getMonth() + 1);
  updateCalendar();
});
// 로고 클릭 시 오늘 날짜로 이동
logoElement.addEventListener('click', function (event) {
  event.preventDefault();
  currentDate = new Date();
  updateCalendar();
});

// 사이드바 js 코드
const scheduleList = document.querySelector('.sidebar-schedule-list');
const addButton = document.querySelector('.sidebar-schedule-add');
const newItem = document.querySelector('.sidebar-new-item');
const scheduleInput = newItem.querySelector('.sidebar-schedule-input');
const deleteModal = document.querySelector('.modal-schedule-delete');
const deleteConfirmBtn = deleteModal.querySelector('.delete-confirmation-btn');
const deleteCancelBtn = deleteModal.querySelector('.delete-cancel-btn');
const sidebarWeatherText = document.querySelector('.sidebar-weather-text');
const sidebarWeatherTemp = document.querySelector('.sidebar-weather-temp');
const sidebarWeatherIcon = document.querySelector('.sidebar-weather-icon');

let itemToDelete = null;
let scheduleIdToDelete = null;
let isAddingItem = false;
let todaySchedules = [];

const formatDateToKST = (dateString) => {
  const date = new Date(dateString);
  const kstOffset = 9 * 60;
  const kstDate = new Date(date.getTime() + kstOffset * 60000);
  return kstDate.toISOString().slice(0, 19).replace('T', ' ');
};

// 오늘 일정 업데이트
function updateTodaySchedules() {
  const today = new Date();
  todaySchedules = filteredScheduleData(schedules, today);
}

// 사이드바 일정 업데이트
function updateSidebarSchedules() {
  scheduleList.innerHTML = '';
  todaySchedules.forEach(addScheduleToUI);
}

// ******* 일정 추가 *******
// 일정 입력 필드 표시
addButton.addEventListener('click', () => {
  newItem.style.display = 'block';
  scheduleInput.focus();
});

// Enter -> 일정 추가 or 줄 변경 막기
scheduleInput.addEventListener('keydown', async (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    if (!isAddingItem) {
      await addNewItem();
    }
  }
});

// 일정 추가
async function addNewItem() {
  if (isAddingItem) return;
  isAddingItem = true;

  try {
    const scheduleTitle = scheduleInput.value.trim();
    if (!scheduleTitle) {
      return;
    }

    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/schedule`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_email: 'john.doe@example.com', // 나중에 알맞은 이메일 받아와야함
        schedule_title: scheduleInput.value,
        schedule_description: '',
        schedule_start: formatDateToKST(new Date()),
        schedule_end: formatDateToKST(new Date()),
        schedule_notification: false,
        schedule_recurring: false,
      }),
    });

    if (!res.ok) {
      throw new Error('Failed to add new schedule');
    }

    scheduleInput.value = '';
    await fetchData();
    updateTodaySchedules();
    updateSidebarSchedules();
    newItem.style.display = 'none';
    updateCalendar();
  } catch (error) {
    console.error('일정 추가 중 오류 발생:', error);
  } finally {
    isAddingItem = false;
  }
}

// UI 일정 추가
function addScheduleToUI(schedule) {
  const li = document.createElement('li');
  li.innerHTML = `
    <a href="#">
      <div class="sidebar-list-box" data-id="${schedule.schedule_id}">
        <div class="sidebar-list-cont">
          <img src="./src/assets/img/list-circle.svg" alt="" />
          <span>${schedule.schedule_title || ''}</span>
        </div>
        <div class="sidebar-list-close">
          <img src="./src/assets/img/close-btn.svg" alt="" />
        </div>
      </div>
    </a>
  `;
  scheduleList.appendChild(li);
}

// ******* 일정 삭제 *******
async function deleteSchedule(scheduleId) {
  try {
    const res = await fetch(
      `${import.meta.env.VITE_API_URL}/api/schedule/${scheduleId}`,
      {
        method: 'DELETE',
      }
    );

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || `HTTP error! status: ${res.status}`);
    }

    itemToDelete.remove();
    closeDeleteModal();
    await fetchData();
    updateTodaySchedules();
    updateSidebarSchedules();
    updateCalendar();
  } catch (error) {
    console.error('Error deleting schedule:', error);
    alert(`서버 통신 실패: ${error.message}`);
  }
}

// 일정 목록 클릭 이벤트 (삭제 또는 조회)
scheduleList.addEventListener('click', (e) => {
  const closeBtn = e.target.closest('.sidebar-list-close');
  if (closeBtn) {
    e.preventDefault();
    const scheduleBox = closeBtn.closest('.sidebar-list-box');
    if (scheduleBox) {
      itemToDelete = scheduleBox.closest('li');
      scheduleIdToDelete = scheduleBox.dataset.id;
      const scheduleTitle = scheduleBox.querySelector('span').textContent;
      showDeleteModal(scheduleTitle);
    }
  } else if (e.target.closest('.sidebar-list-box')) {
    e.preventDefault();
    openViewModal();
  }
});

// 삭제 모달 표시
function showDeleteModal(scheduleTitle) {
  deleteModal.querySelector('.delete-txt strong').textContent = scheduleTitle;
  deleteModal.style.display = 'block';
  document.addEventListener('keydown', handleDeleteModalKeydown);
}

// 삭제 모달 키보드 이벤트 처리
function handleDeleteModalKeydown(e) {
  if (e.key === 'Enter' && deleteModal.style.display === 'block') {
    e.preventDefault();
    if (itemToDelete && scheduleIdToDelete) {
      deleteSchedule(scheduleIdToDelete);
    }
  } else if (e.key === 'Escape' && deleteModal.style.display === 'block') {
    e.preventDefault();
    closeDeleteModal();
  }
}

// 삭제 모달 닫기
function closeDeleteModal() {
  itemToDelete = null;
  scheduleIdToDelete = null;
  deleteModal.style.display = 'none';
  document.removeEventListener('keydown', handleDeleteModalKeydown);
}

// 삭제 확인 버튼
deleteConfirmBtn.addEventListener('click', () => {
  if (itemToDelete && scheduleIdToDelete) {
    deleteSchedule(scheduleIdToDelete);
  } else {
    console.error(
      'Invalid delete attempt: itemToDelete or scheduleIdToDelete is null'
    );
    // alert("삭제할 일정을 선택해주세요.");
  }
});

// 삭제 취소 버튼
deleteCancelBtn.addEventListener('click', closeDeleteModal);

// ******* 일정 조회 모달 *******
async function openViewModal() {
  try {
    const today = new Date();
    await showScheduleModal(today);
  } catch (error) {
    console.error('Error fetching schedule details:', error);
    alert(`일정 정보를 가져오는데 실패했습니다: ${error.message}`);
  }
}

// ******* 날씨 정보 가져오기 *******
const weatherTranslations = {
  200: '천둥번개와 가벼운 비',
  201: '천둥번개와 비',
  202: '천둥번개와 폭우',
  210: '가벼운 천둥번개',
  211: '천둥번개',
  212: '강한 천둥번개',
  221: '불규칙한 천둥번개',
  230: '천둥번개와 가벼운 이슬비',
  231: '천둥번개와 이슬비',
  232: '천둥번개와 강한 이슬비',
  300: '약한 이슬비',
  301: '이슬비',
  302: '강한 이슬비',
  310: '약한 이슬비와 비',
  311: '이슬비와 비',
  312: '강한 이슬비와 비',
  313: '소나기와 이슬비',
  314: '강한 소나기와 이슬비',
  321: '소나기 이슬비',
  500: '가벼운 비',
  501: '보통 비',
  502: '강한 비',
  503: '매우 강한 비',
  504: '극심한 비',
  511: '어는 비',
  520: '가벼운 소나기 비',
  521: '소나기 비',
  522: '강한 소나기 비',
  531: '불규칙한 소나기 비',
  600: '가벼운 눈',
  601: '눈',
  602: '강한 눈',
  611: '진눈깨비',
  612: '가벼운 진눈깨비 소나기',
  613: '진눈깨비 소나기',
  615: '가벼운 비와 눈',
  616: '비와 눈',
  620: '가벼운 눈 소나기',
  621: '눈 소나기',
  622: '강한 눈 소나기',
  701: '엷은 안개',
  711: '연기',
  721: '연무',
  731: '모래/먼지 소용돌이',
  741: '안개',
  751: '모래',
  761: '먼지',
  762: '화산재',
  771: '돌풍',
  781: '토네이도',
  800: '맑은 하늘',
  801: '구름 조금',
  802: '드문드문 구름',
  803: '흐린 구름',
  804: '구름 많음',
};

function translateWeatherDescription(id) {
  return weatherTranslations[id] || id;
}

async function fetchWeatherData() {
  try {
    const res = await fetch(
      `${import.meta.env.VITE_API_URL}/api/weather?city=seoul`
    );
    if (!res.ok) {
      throw new Error('Failed to fetch weather data');
    }

    const data = await res.json();

    sidebarWeatherText.innerText = translateWeatherDescription(
      data.weather[0].id
    );
    sidebarWeatherTemp.innerText = `${Math.round(data.main.temp)}º`;
    sidebarWeatherIcon.src = `http://openweathermap.org/img/wn/${data.weather[0].icon}@4x.png`;
  } catch (error) {
    console.error(error);
  }
}
fetchWeatherData();
// });

// 초기화 함수

// 초기화 함수
async function init() {
  await fetchData();
  updateCalendar();
  initializeSelectBox();
  updateTodaySchedules();
  updateSidebarSchedules();
}

init();

export {
  updateCalendar,
  fetchData,
  currentDate,
  schedules,
  updateTodaySchedules,
  updateSidebarSchedules,
};
