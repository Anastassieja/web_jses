'use strict';

let habbits = [];
const HABBIT_KEY = 'HABBIT_KEY';
let globalActiveHabbitId;

/* page */
const page = {
	menu: document.querySelector('.menu__list'),
	header: {
		h1: document.querySelector('.h1'),
		progressPercent: document.querySelector('.progress__percent'),
		progressCoverBar: document.querySelector('.progress__cover-bar'),
	},
	content: {
		daysContainer: document.getElementById('days'),
		nextDay: document.querySelector('.habbit__day'),
	},
	popup: {
		index: document.getElementById('add-habbit-popup'),
		iconField: document.querySelector('.popup__form input[name="icon"]'),
	},
};

/* utils */

function getData() {
	const habbitsString = localStorage.getItem(HABBIT_KEY);
	const habbitArray = JSON.parse(habbitsString);
	if (Array.isArray(habbitArray)) {
		habbits = habbitArray;
	}
}

function setData() {
	localStorage.setItem(HABBIT_KEY, JSON.stringify(habbits));
}

function getFormData(form, fields) {
	const formData = new FormData(form);
	const res = {};

	for (const field of fields) {
		const fieldValue = formData.get(field);
		form[field].classList.remove('error');

		if (!fieldValue) {
			form[field].classList.add('error');
		}
		res[field] = fieldValue;
	}
	let isValid = true;
	for (const field of fields) {
		if (!res[field]) {
			isValid = false;
		}
	}
	if (!isValid) return;
	return res;
}
function resetForm(form, fields) {
	for (const field of fields) {
		form[field].value = '';
	}
}

/* render */

function renderMenu(activeHabbit) {
	for (const habbit of habbits) {
		const existed = document.querySelector(`[menu-habbit-id="${habbit.id}"]`);

		if (!existed) {
			const element = document.createElement('button');
			element.setAttribute('menu-habbit-id', habbit.id);
			element.classList.add('menu__item');
			element.addEventListener('click', () => rerender(habbit.id));
			element.innerHTML = `<img src="./img/${habbit.icon}.svg" alt=${habbit.name}/>`;

			if (activeHabbit.id === habbit.id) {
				element.classList.add('menu__item_active');
			}
			page.menu.appendChild(element);

			continue;
		}
		if (activeHabbit.id === habbit.id) {
			existed.classList.add('menu__item_active');
		} else {
			existed.classList.remove('menu__item_active');
		}
	}
}

function renderHead(activeHabbit) {
	page.header.h1.innerText = activeHabbit.name;
	const progress =
		activeHabbit.days.length / activeHabbit.target > 1
			? 100
			: (activeHabbit.days.length / activeHabbit.target) * 100;
	page.header.progressPercent.innerText = progress.toFixed(0) + '%';
	page.header.progressCoverBar.setAttribute('style', `width: ${progress}%`);
}

function renderContent(activeHabbit) {
	page.content.daysContainer.innerHTML = '';

	for (const index in activeHabbit.days) {
		const element = document.createElement('div');
		element.classList.add('habbit');

		element.innerHTML = `<div class="habbit__day">День ${+index + 1}</div>
		<div class="habbit__comment">${activeHabbit.days[index].comment}</div>
		<button class="habbit__delete" onclick="removeDay(${index})">
			<img src="./img/delete.svg" alt="Удалить день ${index}" />
		</button>`;

		page.content.daysContainer.appendChild(element);
	}
	page.content.nextDay.innerHTML = `День ${activeHabbit.days.length + 1}`;
}

/* work on days */
function addDays(event) {
	event.preventDefault();
	const data = getFormData(event.target, ['comment']);
	if (!data) return;

	habbits = habbits.map((habbit) => {
		if (habbit.id === globalActiveHabbitId) {
			return {
				...habbit,
				days: habbit.days.concat([{ comment: data.comment }]),
			};
		}
		return habbit;
	});
	resetForm(event.target, ['comment']);
	rerender(globalActiveHabbitId);
	setData();
}

function removeDay(index) {
	habbits = habbits.map((habbit) => {
		if (habbit.id === globalActiveHabbitId) {
			habbit.days.splice(index, 1);
			return {
				...habbit,
				days: habbit.days,
			};
		}
		return habbit;
	});
	rerender(globalActiveHabbitId);
	setData();
}

function addHabbit(event) {
	event.preventDefault();

	const data = getFormData(event.target, ['name', 'icon', 'target']);
	if (!data) return;

	const maxId = habbits.reduce(
		(acc, habbit) => (acc > habbit.id ? acc : habbit.id),
		0
	);

	habbits.push({
		id: maxId + 1,
		name: data.name,
		target: data.target,
		icon: data.icon,
		days: [],
	});
	resetForm(event.target, ['name', 'target']);
	togglePopup();
	setData();
	rerender(maxId + 1);
}

function togglePopup() {
	if (page.popup.index.classList.contains('cover_hidden')) {
		page.popup.index.classList.remove('cover_hidden');
	} else {
		page.popup.index.classList.add('cover_hidden');
	}
}

/* working on habbits */
function setIcon(context, icon) {
	page.popup.iconField.value = icon;
	const activeIcon = document.querySelector('.icon.icon_active');
	activeIcon.classList.remove('icon_active');
	context.classList.add('icon_active');
}

function rerender(activeHabbitId) {
	globalActiveHabbitId = activeHabbitId;
	const activeHabbit = habbits.find((habbit) => habbit.id === activeHabbitId);
	if (!activeHabbit) {
		return;
	}
	document.location.replace(document.location.pathname + '#' + activeHabbitId);
	renderMenu(activeHabbit);
	renderHead(activeHabbit);
	renderContent(activeHabbit);
}

/* init */

(() => {
	getData();
	if (habbits.length <= 0) return;

	const hashId = +document.location.hash.replace('#', '');
	const urlHabbit = habbits.find((habbit) => habbit.id == hashId);
	if (urlHabbit) {
		rerender(urlHabbit.id);
	} else {
		rerender(habbits[0].id);
	}
})();