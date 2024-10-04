import {
  updateCalendar,
  fetchData,
  updateTodaySchedules,
  updateSidebarSchedules,
} from './calendar.js';

document.addEventListener('DOMContentLoaded', function () {
  /************************ DOM 요소 불러오기 ************************/
  const $modalScheduleEdit = document.querySelector('.modal-schedule-edit');
  const $modalScheduleView = document.querySelector('.modal-schedule-view');
  const closeBtn = document.getElementById('close-btn');
  const exitBtn = document.getElementById('exit-btn');
  const saveBtn = document.getElementById('save-btn');
  const clearBtn = document.getElementById('clear-btn');
  const selectedDateSpan = document.getElementById('selectedDate');
  const selectedTimeSpan = document.getElementById('selectedTime');
  const completeDateSpan = document.getElementById('completeDate');
  const completeTimeSpan = document.getElementById('completeTime');
  const startDateInput = document.querySelector('.start-date-input');
  const startTimeInput = document.querySelector('.start-time-input');
  const endDateInput = document.querySelector('.end-date-input');
  const endTimeInput = document.querySelector('.end-time-input');
  const datePicker = document.getElementById('datePicker');
  const calendar = document.getElementById('calendar');
  const currentMonthSpan = document.getElementById('currentMonth');
  const prevMonthBtn = document.getElementById('prevMonth');
  const nextMonthBtn = document.getElementById('nextMonth');
  const startConfirmBtn = document.getElementById('start-confirm');
  const endConfirmBtn = document.getElementById('end-confirm');

  /************************ 모달창 닫힘 기능 구현 ************************/

  closeBtn.onclick = function () {
    $modalScheduleEdit.style.display = 'none';
  };
  exitBtn.onclick = function () {
    $modalScheduleEdit.style.display = 'none';
  };

  /************************ 모달창 내부 삭제버튼 숨김 ************************/

  clearBtn.style.display = 'none';

  /************************ 날짜 기능 구현 함수 ************************/

  let currentDate = new Date();
  let currentTime = new Date();
  let selectedDate = null;
  let isAddingItem = false;

  function updateSchedule() {
    calendar.innerHTML = '';
    currentMonthSpan.textContent = `${currentDate.getFullYear()}.${String(
      currentDate.getMonth() + 1
    ).padStart(2, '0')}`;

    const firstDay = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1
    );
    const lastDay = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0
    );

    const prevMonthLastDay = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      0
    );
    for (let i = firstDay.getDay() - 1; i >= 0; i--) {
      const dayElement = createDayElement(
        new Date(
          prevMonthLastDay.getFullYear(),
          prevMonthLastDay.getMonth(),
          prevMonthLastDay.getDate() - i
        )
      );
      dayElement.classList.add('other-month');
      calendar.appendChild(dayElement);
    }

    for (let i = 1; i <= lastDay.getDate(); i++) {
      const dayElement = createDayElement(
        new Date(currentDate.getFullYear(), currentDate.getMonth(), i)
      );
      calendar.appendChild(dayElement);
    }

    const remainingDays = 42 - calendar.children.length;
    for (let i = 1; i <= remainingDays; i++) {
      const dayElement = createDayElement(
        new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, i)
      );
      dayElement.classList.add('other-month');
      calendar.appendChild(dayElement);
    }
  }

  function createDayElement(date) {
    const dayElement = document.createElement('div');
    dayElement.textContent = date.getDate();
    dayElement.classList.add('day');

    if (date.getDay() === 0) dayElement.classList.add('sun');
    if (date.getDay() === 6) dayElement.classList.add('sat');

    if (date.toDateString() === new Date().toDateString()) {
      dayElement.classList.add('today');
    }

    if (selectedDate && date.toDateString() === selectedDate.toDateString()) {
      dayElement.classList.add('selected');
    }

    dayElement.addEventListener('click', () => selectDate(date));
    return dayElement;
  }

  function selectDate(date) {
    selectedDate = date;
    currentDate = new Date(date);
    updateSchedule();
  }

  /************************ 버튼 클릭시 실행될 이벤트값 설정 ************************/

  /******** 작은달력 Month 부분 이동버튼 ********/
  prevMonthBtn.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    updateSchedule();
  });

  nextMonthBtn.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    updateSchedule();
  });

  /******** 작은달력 날짜, 시간 확인버튼 ********/
  startConfirmBtn.addEventListener('click', function () {
    const startHour = document.getElementById('start-hour');
    const startMinute = document.getElementById('start-minute');
    startHour.addEventListener('input', function () {
      const maxLength = this.dataset.maxLength;
      const min = this.dataset.min;
      const max = this.dataset.max;
      let value = parseInt(this.value, 10);
      if (this.value.length > maxLength) {
        this.value = this.value.slice(0, maxLength);
      }
      if (!isNaN(value) && value >= 0 && value <= 9) {
        this.value = value.toString().padStart(2, '0');
      }
      if (parseInt(startHour.value) < min) {
        startHour.value = min;
      }
      if (parseInt(startHour.value) > max) {
        startHour.value = max;
      }
    });
    if (startHour.value >= 0 && startHour.value <= 9) {
      startHour.value.toString().padStart(2, '0');
    }
    startMinute.addEventListener('input', function () {
      const maxLength = this.dataset.maxLength;
      const min = this.dataset.min;
      const max = this.dataset.max;
      let value = parseInt(this.value, 10);
      if (this.value.length > maxLength) {
        this.value = this.value.slice(0, maxLength);
      }
      if (!isNaN(value) && value >= 0 && value <= 9) {
        this.value = value.toString().padStart(2, '0');
      }
      if (parseInt(this.value) < min) {
        this.value = min;
      }
      if (parseInt(this.value) > max) {
        this.value = max;
      }
    });
    if (startMinute.value >= 0 && startMinute.value <= 9) {
      startMinute.value.toString().padStart(2, '0');
    }

    selectedDateSpan.textContent = `${currentDate.getFullYear()}년 ${
      currentDate.getMonth() + 1
    }월 ${currentDate.getDate()}일`;
    console.log(selectedDateSpan.textContent);
    selectedTimeSpan.textContent = `${startHour.value.slice(
      0,
      '2'
    )}:${startMinute.value.slice(0, '2')}`;
    console.log(selectedTimeSpan.textContent);
    datePicker.style.display =
      datePicker.style.display == 'none' ? 'block' : 'none';
  });

  endConfirmBtn.addEventListener('click', function () {
    const endHour = document.getElementById('end-hour');
    const endMinute = document.getElementById('end-minute');
    endHour.addEventListener('input', function () {
      const maxLength = this.dataset.maxLength;
      const min = this.dataset.min;
      const max = this.dataset.max;
      let value = parseInt(this.value, 10);
      if (this.value.length > maxLength) {
        this.value = this.value.slice(0, maxLength);
      }
      if (!isNaN(value) && value >= 0 && value <= 9) {
        this.value = value.toString().padStart(2, '0');
      }
      if (parseInt(this.value) < min) {
        this.value = min;
      }
      if (parseInt(this.value) > max) {
        this.value = max;
      }
    });
    endMinute.addEventListener('input', function () {
      const maxLength = this.dataset.maxLength;
      const min = this.dataset.min;
      const max = this.dataset.max;
      let value = parseInt(this.value, 10);
      if (this.value.length > maxLength) {
        this.value = this.value.slice(0, maxLength);
      }
      if (!isNaN(value) && value >= 0 && value <= 9) {
        this.value = value.toString().padStart(2, '0');
      }
      if (parseInt(this.value) < min) {
        this.value = min;
      }
      if (parseInt(this.value) > max) {
        this.value = max;
      }
    });

    completeDateSpan.textContent = `${currentDate.getFullYear()}년 ${
      currentDate.getMonth() + 1
    }월 ${currentDate.getDate()}일`;
    console.log(completeDateSpan.textContent);
    completeTimeSpan.textContent = `${endHour.value.slice(
      0,
      '2'
    )}:${endMinute.value.slice(0, '2')}`;
    console.log(completeTimeSpan.textContent);
    datePicker.style.display =
      datePicker.style.display == 'none' ? 'block' : 'none';
  });

  /************************ 현재 일정 나타내기 ************************/
  function timeState() {
    const selectDay = `${currentDate.getFullYear()}년 ${
      currentDate.getMonth() + 1
    }월 ${currentDate.getDate()}일`;
    selectedDateSpan.textContent = selectDay;
    const completeDay = `${currentDate.getFullYear()}년 ${
      currentDate.getMonth() + 1
    }월 ${currentDate.getDate()}일`;
    completeDateSpan.textContent = completeDay;
    const selectedTime = `${String(currentTime.getHours()).padStart(
      2,
      '0'
    )}:${String(currentTime.getMinutes()).padStart(2, '0')}`;
    selectedTimeSpan.textContent = selectedTime;
    const completeTime = `${String(currentTime.getHours()).padStart(
      2,
      '0'
    )}:${String(currentTime.getMinutes()).padStart(2, '0')}`;
    completeTimeSpan.textContent = completeTime;
  }
  timeState();

  /******** 작은달력 날짜, 시간 입력input ********/
  startDateInput.addEventListener('click', () => {
    const isStarting = document.querySelector('.start-time');
    const isEnding = document.querySelector('.end-time');
    isEnding.style.display = 'none';
    isStarting.style.display = 'block';
  });

  startTimeInput.addEventListener('click', () => {
    const isStarting = document.querySelector('.start-time');
    const isEnding = document.querySelector('.end-time');
    isEnding.style.display = 'none';
    isStarting.style.display = 'block';
  });

  endDateInput.addEventListener('click', () => {
    const isStarting = document.querySelector('.start-time');
    const isEnding = document.querySelector('.end-time');
    isStarting.style.display = 'none';
    isEnding.style.display = 'block';
  });

  endTimeInput.addEventListener('click', () => {
    const isStarting = document.querySelector('.start-time');
    const isEnding = document.querySelector('.end-time');
    isStarting.style.display = 'none';
    isEnding.style.display = 'block';
  });

  /******** 일정 모달을 벗어난 다른 곳 클릭시 ********/
  window.addEventListener('click', function (event) {
    const closeModal = () => {
      $modalScheduleEdit.style.display = 'none';
      datePicker.style.display = 'none';
    };
    if (event.target === $modalScheduleEdit || event.target === datePicker) {
      closeModal();
    }
  });

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

  /************************ 일정 저장하기 ************************/
  const createSchedule = async function () {
    const scheduleTitle = document.querySelector('.modal-title').value;
    const startDateText = document.querySelector('#selectedDate').textContent;
    const startTimeText = document.querySelector('#selectedTime').textContent;
    const endDateText = document.querySelector('#completeDate').textContent;
    const endTimeText = document.querySelector('#completeTime').textContent;
    const scheduleMemo = document.querySelector('.schedule-memo').value;

    const startText = convertToStandardFormat(
      `${startDateText} ${startTimeText}`
    );
    const endText = convertToStandardFormat(`${endDateText} ${endTimeText}`);

    if (isAddingItem) return;
    isAddingItem = true;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/schedule`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_email: 'john.doe@example.com',
          schedule_title: scheduleTitle,
          schedule_description: scheduleMemo,
          schedule_start: startText,
          schedule_end: endText,
        }),
      });
      if (!res.ok) {
        throw new Error('Failed to add new schedule');
      }
      function closeModal() {
        $modalScheduleView.style.display = 'none';
        $modalScheduleEdit.style.display = 'none';
      }
      closeModal();
      await fetchData();
      updateCalendar();
      updateTodaySchedules();
      updateSidebarSchedules();
    } catch (error) {
      console.error('일정 추가 중 오류 발생:', error);
    } finally {
      isAddingItem = false;
    }
  };
  // 저장 버튼 클릭 시 생성 요청
  saveBtn.addEventListener('click', () => {
    const saveBtnText = saveBtn.textContent.trim();

    if (saveBtnText === '저장') {
      createSchedule(); // 생성 요청
    }
    $modalScheduleEdit.style.display = 'none';
  });

  // 일정 모달에서 일정 클릭 시 저장 버튼 텍스트 수정
  document.body.addEventListener('click', function (event) {
    if (event.target.closest('.modal-view-box')) {
      saveBtn.textContent = '수정';
    }
  });

  /************************ 작은달력 위치 값 조정 ************************/

  selectedDateSpan.addEventListener('click', function () {
    this.value = '';
    datePicker.style.display =
      datePicker.style.display == 'none' ? 'block' : 'none';
    datePicker.style.display = datePicker.style.top = `${
      selectedDateSpan.getBoundingClientRect().bottom + window.scrollY
    }px`;
    datePicker.style.left = `${
      selectedDateSpan.getBoundingClientRect().left + window.scrollX
    }px`;
    updateSchedule();
  });

  selectedTimeSpan.addEventListener('click', function () {
    this.value = '';
    datePicker.style.display =
      datePicker.style.display == 'none' ? 'block' : 'none';
    datePicker.style.top = `${
      selectedTimeSpan.getBoundingClientRect().bottom + window.scrollY
    }px`;
    datePicker.style.left = `${
      selectedTimeSpan.getBoundingClientRect().left + window.scrollX
    }px`;
    updateSchedule();
  });

  completeDateSpan.addEventListener('click', function () {
    this.value = '';
    datePicker.style.display =
      datePicker.style.display == 'none' ? 'block' : 'none';
    datePicker.style.display = datePicker.style.top = `${
      completeDateSpan.getBoundingClientRect().bottom + window.scrollY
    }px`;
    datePicker.style.left = `${
      completeDateSpan.getBoundingClientRect().left + window.scrollX
    }px`;
    updateSchedule();
  });

  completeTimeSpan.addEventListener('click', function () {
    this.value = '';
    datePicker.style.display =
      datePicker.style.display == 'none' ? 'block' : 'none';
    datePicker.style.top = `${
      completeTimeSpan.getBoundingClientRect().bottom + window.scrollY
    }px`;
    datePicker.style.left = `${
      completeTimeSpan.getBoundingClientRect().left + window.scrollX
    }px`;
    updateSchedule();
  });

  updateSchedule();
});
//
