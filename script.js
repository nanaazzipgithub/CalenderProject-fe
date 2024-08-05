document.addEventListener('DOMContentLoaded', function() {
  /************ 모달창 닫힘 기능 구현 ************/
  const closeBtn = document.getElementById('close-btn');
  const modal = document.querySelector('.modal');
  closeBtn.onclick = function() {
    modal.style.display = 'none';
  }

  /************** date-picker 구현 **************/
  const datePicker = document.getElementById('datePicker');
  const calendar = document.getElementById('calendar');
  const currentMonthSpan = document.getElementById('currentMonth');
  const prevMonthBtn = document.getElementById('prevMonth');
  const nextMonthBtn = document.getElementById('nextMonth');
  const confirmBtn = document.getElementById('confirm');
  const selectedDateSpan = document.getElementById('selectedDate');
  const selectedTimeSpan = document.getElementById('selectedTime');

  let currentDate = new Date();
  let selectedDate = null;

  function updateCalendar() {
    calendar.innerHTML = '';
    currentMonthSpan.textContent = `${currentDate.getFullYear()}.${String(currentDate.getMonth() + 1).padStart(2, '0')}`;

    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    const prevMonthLastDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0);
    for (let i = firstDay.getDay() - 1; i >= 0; i--) {
      const dayElement = createDayElement(new Date(prevMonthLastDay.getFullYear(), prevMonthLastDay.getMonth(), prevMonthLastDay.getDate() - i));
      dayElement.classList.add('other-month');
      calendar.appendChild(dayElement);
    }

    for (let i = 1; i <= lastDay.getDate(); i++) {
      const dayElement = createDayElement(new Date(currentDate.getFullYear(), currentDate.getMonth(), i));
      calendar.appendChild(dayElement);
    }

    const remainingDays = 42 - calendar.children.length;
    for (let i = 1; i <= remainingDays; i++) {
      const dayElement = createDayElement(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, i));
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
    updateCalendar();
  }

  prevMonthBtn.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    updateCalendar();
  });

  nextMonthBtn.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    updateCalendar();
  });

  confirmBtn.addEventListener('click', () => {
    const hour = document.getElementById('hour').value.padStart(2, '0');
    const minute = document.getElementById('minute').value.padStart(2, '0');
    selectedDateSpan.textContent = `${currentDate.getFullYear()}년 ${currentDate.getMonth() + 1}월 ${currentDate.getDate()}일`;
    selectedTimeSpan.textContent = `${hour}:${minute}`;
    datePicker.style.display = datePicker.style.display == 'none' ? 'block': 'none';
  });

  selectedDateSpan.addEventListener('click', () => {
    datePicker.style.display = datePicker.style.display == 'none' ? 'block': 'none';
    datePicker.style.display = datePicker.style.top = `${selectedDateSpan.getBoundingClientRect().bottom + window.scrollY}px`;
    datePicker.style.left = `${selectedDateSpan.getBoundingClientRect().left + window.scrollX}px`;
    updateCalendar();
  });

  selectedTimeSpan.addEventListener('click', () => {
    datePicker.style.display = datePicker.style.display == 'none' ? 'block': 'none';
    datePicker.style.top = `${selectedTimeSpan.getBoundingClientRect().bottom + window.scrollY}px`;
    datePicker.style.left = `${selectedTimeSpan.getBoundingClientRect().left + window.scrollX}px`;
    updateCalendar();
  });

  updateCalendar();
});