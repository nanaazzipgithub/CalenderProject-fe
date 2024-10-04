import {
  updateCalendar,
  fetchData,
  currentDate,
  updateTodaySchedules,
  updateSidebarSchedules,
} from './calendar.js';

// 전역으로 데이터 관리
const state = {
  scheduleData: [],
  originalSchedule: null,
  selectedScheduleId: null,
  selectedDate: null,
};

// 돔 요소
const elements = {
  $modalScheduleView: document.querySelector('.modal-schedule-view'),
  $modalScheduleEdit: document.querySelector('.modal-schedule-edit'),
  $closeBtn: document.querySelector('.view-close-button'),
  $addBtn: document.querySelector('.view-add-button'),
  calendarMonthElement: document.querySelector('.calendar-month'),
  calendarYearElement: document.querySelector('.calendar-year'),
  $saveBtn: document.querySelector('#save-btn'),
  $clearBtn: document.querySelector('#clear-btn'),
  deleteModal: document.querySelector('.modal-schedule-delete'),
  $modalDeleteConfirmBtn: document.querySelector('.delete-confirmation-btn'),
  $modalDeleteCancelBtn: document.querySelector('.delete-cancel-btn'),
};

// func: 시간 포맷 설정
function formatDateTime(dateTimeString) {
  const match = dateTimeString.match(/\d{2}:\d{2}/);

  if (!match) {
    throw new Error('입력된 형식이 잘못되었습니다.');
  }

  return match[0];
}
// Calendar interaction functions
function handleCalendarDayClick(event) {
  const clickedDay = findClickedDay(event.target);
  if (clickedDay) {
    const date = extractDateFromClickedDay(clickedDay);
    state.selectedDate = date;
    showScheduleModal(date);
  }
}

// 클릭한 요소의 가장 가까운 td를 가져오기
function findClickedDay(td) {
  return td.closest('td.calendar-day, td.prev-month, td.next-month');
}

// func: 클릭한 날짜 추출하는 함수
function extractDateFromClickedDay(clickedDay) {
  let currentYear = parseInt(elements.calendarYearElement.textContent);
  let currentMonth = parseInt(elements.calendarMonthElement.textContent) - 1;
  let clickedDate;

  // clickedDay가 calendar-day-date span을 포함하고 있는지 확인
  const dateSpan = clickedDay.querySelector('.calendar-day-date');
  if (dateSpan) {
    clickedDate = parseInt(dateSpan.textContent, 10); // string에서 number로 변환
  } else {
    clickedDate = parseInt(clickedDay.textContent, 10);
  }

  if (clickedDay.classList.contains('prev-month')) {
    if (currentMonth === 0) {
      currentYear--;
      currentMonth = 11;
    } else {
      currentMonth--;
    }
  } else if (clickedDay.classList.contains('next-month')) {
    if (currentMonth === 11) {
      currentYear++;
      currentMonth = 0;
    } else {
      currentMonth++;
    }
  }

  return new Date(currentYear, currentMonth, clickedDate);
}

// Modal management functions
function showScheduleModal(date) {
  updateModalContent(date);
  fetchScheduleData(date);
  elements.$modalScheduleView.style.display = 'block';
}

function updateModalContent(date) {
  const $modalDateElement = elements.$modalScheduleView.querySelector(
    '.modal-date-display'
  );
  if ($modalDateElement) {
    $modalDateElement.innerHTML = `
      <p class="view-year">${date.getFullYear()}</p>
      <p class="view-month">${String(date.getMonth() + 1).padStart(2, '0')}</p>
      <span class="view-separator">/</span>
      <p class="view-day">${String(date.getDate()).padStart(2, '0')}</p>
    `;
  }
}

function closeModal() {
  elements.$modalScheduleView.style.display = 'none';
  elements.$modalScheduleEdit.style.display = 'none';
}

// 스케쥴 데이터 관리
async function fetchScheduleData(date) {
  const $modalViewCont = elements.$modalScheduleView.querySelector(
    '.modal-view-content'
  );
  if (!$modalViewCont) return;

  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/api/schedules`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    if (!Array.isArray(data)) {
      throw new Error('Received data is not an array');
    }

    state.scheduleData = data;

    const filteredData = filteredScheduleData(data, date);
    $modalViewCont.innerHTML = renderScheduleContent(filteredData);
  } catch (error) {
    console.error('Error fetching schedule data:', error);
    $modalViewCont.innerHTML = `<p>일정을 불러오는 중 오류가 발생했습니다: ${error.message}</p>`;
  }
}

function filteredScheduleData(data, date) {
  if (!data || !Array.isArray(data)) {
    console.error('Invalid data provided to filteredScheduleData');
    return [];
  }

  return data.filter((schedule) => {
    const scheduleStart = new Date(schedule.schedule_start);
    const scheduleEnd = new Date(schedule.schedule_end);

    // 날짜 비교를 위해 시간 정보를 제거
    const scheduleDate = new Date(
      scheduleStart.getFullYear(),
      scheduleStart.getMonth(),
      scheduleStart.getDate()
    );
    const clickedDate = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    );

    // 기본 일정(반복 없음)
    if (
      scheduleDate.getTime() === clickedDate.getTime() ||
      (clickedDate >= scheduleStart && clickedDate <= scheduleEnd)
    ) {
      return true;
    }

    return false;
  });
}

function renderScheduleContent(filteredData) {
  if (!filteredData || filteredData.length === 0) {
    return '<p>조회 가능한 일정이 없습니다</p>';
  }

  return filteredData
    .map(
      (schedule) => `
        <div class="modal-view-box" data-schedule-id="${schedule.schedule_id}">
          <h3 class="modal-view-title">${schedule.schedule_title}</h3>
          <div class="modal-view-time">
            <span class="view-time-start">${formatDateTime(
              schedule.schedule_start
            )}</span>
            <span class="view-time-separator">~</span>
            <span class="view-time-end">${formatDateTime(
              schedule.schedule_end
            )}</span>
          </div>
          <p class="view-description">${schedule.schedule_description || ''}</p>
        </div>
      `
    )
    .join('');
}

// 일정 수정 시 선택한 일정 세부 정보 설정
function populateEditModal(schedule) {
  const startDate = new Date(schedule.schedule_start);
  const endDate = new Date(schedule.schedule_end);

  document.querySelector('.modal-edit-container .modal-title').value =
    schedule.schedule_title;

  document.querySelector(
    '#selectedDate'
  ).textContent = `${startDate.getFullYear()}년 ${
    startDate.getMonth() + 1
  }월 ${startDate.getDate()}일`;

  document.querySelector('#selectedTime').textContent = formatDateTime(
    schedule.schedule_start
  );

  document.querySelector(
    '#completeDate'
  ).textContent = `${endDate.getFullYear()}년 ${
    endDate.getMonth() + 1
  }월 ${endDate.getDate()}일`;

  document.querySelector('#completeTime').textContent = formatDateTime(
    schedule.schedule_end
  );

  document.querySelector('.textarea-container textarea').value =
    schedule.schedule_description || '';
}
// 날짜, 시간 변환
function convertToStandardFormat(dateTimeString) {
  const match = dateTimeString.match(
    /(\d{4})년 (\d{1,2})월 (\d{1,2})일 (\d{1,2}):(\d{2})/
  );

  if (!match) {
    throw new Error('입력 형식이 잘못되었습니다.');
  }

  const [_, year, month, day, hour, minute] = match;

  const formattedDate = `${year}-${String(month).padStart(2, '0')}-${String(
    day
  ).padStart(2, '0')}`;
  const formattedTime = `${String(hour).padStart(2, '0')}:${String(
    minute
  ).padStart(2, '0')}:00`;

  return `${formattedDate} ${formattedTime}`;
}
// 일정 수정 시 데이터 설정
function getEditModalData() {
  const title = document.querySelector(
    '.modal-edit-container .modal-title'
  ).value;
  const startDateText = document.querySelector('#selectedDate').textContent;
  const startTime = document.querySelector('#selectedTime').textContent;
  const endDateText = document.querySelector('#completeDate').textContent;
  const endTime = document.querySelector('#completeTime').textContent;
  const description = document.querySelector(
    '.textarea-container textarea'
  ).value;

  const startDate = convertToStandardFormat(`${startDateText} ${startTime}`);
  const endDate = convertToStandardFormat(`${endDateText} ${endTime}`);

  return {
    schedule_title: title,
    schedule_start: startDate,
    schedule_end: endDate,
    schedule_description: description,
  };
}
// 일정 수정 요청
async function updateScheduleData(scheduleId, updatedData) {
  try {
    const updatedScheduleData = { ...state.originalSchedule, ...updatedData };

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/api/schedule/${scheduleId}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedScheduleData),
      }
    );

    if (!response.ok) {
      throw new Error(`error status: ${response.status}`);
    }

    const result = await response.json();
    console.log('Update response:', result);
    closeModal();
    await fetchData();
    updateCalendar();
    updateTodaySchedules();
    updateSidebarSchedules();
  } catch (error) {
    console.error('Error updating schedule data:', error);
    alert(`오류 발생: ${error.message}`);
  }
}

async function deleteSchedule() {
  if (!state.selectedScheduleId) {
    closeModal();
    return;
  }
  const scheduleId = state.selectedScheduleId;
  try {
    const res = await fetch(
      `${import.meta.env.VITE_API_URL}/api/schedule/${scheduleId}`,
      {
        method: 'DELETE',
      }
    );
    if (!res.ok) {
      throw new Error('Failed to delete the schedule');
    }

    const result = await res.json();
    console.log(result);
    closeModal();
    elements.deleteModal.style.display = 'none';
    await fetchData();
    updateCalendar();
    updateTodaySchedules();
    updateSidebarSchedules();
  } catch (error) {
    console.error('에러:', error);
  }
}

// 추가 버튼 클릭으로 나온 일정 생성 모달 날짜 데이터 변환
function formatAddBtnDate(dateString) {
  const date = new Date(dateString);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}년 ${month}월 ${day}일`;
}

// 추가 버튼 클릭 시 나오는 일정 생성 모달 설정
function handleAddButtonClick() {
  elements.$modalScheduleEdit.style.display = 'block';
  elements.$clearBtn.style.display = 'none';
  elements.$saveBtn.textContent = '저장';
  document.querySelector('.modal-edit-container .modal-title').value = '';
  document.querySelector('.textarea-container textarea').value = '';
  document.querySelector('#selectedDate').textContent = formatAddBtnDate(
    state.selectedDate
  );
  document.querySelector('#completeDate').textContent = formatAddBtnDate(
    state.selectedDate
  );
  document.querySelector('#selectedTime').textContent = '00:00';
  document.querySelector('#completeTime').textContent = '00:00';
}

// 이벤트에 따라 모달 내용 수정
function handleModalViewClick(event) {
  if (event.target === elements.$addBtn) {
    handleAddButtonClick();
  }
  if (
    event.target === elements.$modalScheduleView ||
    event.target === elements.$closeBtn
  ) {
    closeModal();
  } else if (event.target.closest('.modal-view-box')) {
    elements.$clearBtn.style.display = 'block';
    const scheduleId =
      event.target.closest('.modal-view-box').dataset.scheduleId;
    const schedule = state.scheduleData.find(
      (s) => s.schedule_id === parseInt(scheduleId)
    );
    if (schedule) {
      state.selectedScheduleId = schedule.schedule_id;
      state.originalSchedule = { ...schedule };
      populateEditModal(schedule);
      elements.$modalScheduleEdit.style.display = 'block';
    }
  }
}

// 저장 버튼 데이터 설정 및 날짜 비교
function handleSaveButtonClick() {
  if (elements.$saveBtn.textContent === '수정') {
    const updatedData = getEditModalData();
    const startDate = new Date(updatedData.schedule_start);
    const endDate = new Date(updatedData.schedule_end);

    if (startDate > endDate) {
      alert('시작 날짜와 시간이 종료 날짜와 시간보다 이후일 수 없습니다.');
      return;
    }

    updateScheduleData(state.selectedScheduleId, updatedData);
  }
}

function handleClearButtonClick() {
  elements.deleteModal.style.display = 'block';
}

function handleDeleteConfirmClick() {
  deleteSchedule();
}

function handleDeleteCancelClick() {
  elements.deleteModal.style.display = 'none';
}

// 초기화
function initializeEventListeners() {
  document.body.addEventListener('click', handleCalendarDayClick);
  elements.$addBtn.addEventListener('click', handleAddButtonClick);
  window.addEventListener('click', handleModalViewClick);
  elements.$saveBtn.addEventListener('click', handleSaveButtonClick);
  elements.$clearBtn.addEventListener('click', handleClearButtonClick);
  elements.$modalDeleteConfirmBtn.addEventListener(
    'click',
    handleDeleteConfirmClick
  );
  elements.$modalDeleteCancelBtn.addEventListener(
    'click',
    handleDeleteCancelClick
  );
}

document.addEventListener('DOMContentLoaded', initializeEventListeners);

export {
  showScheduleModal,
  fetchScheduleData,
  updateModalContent,
  filteredScheduleData,
  updateScheduleData,
};
