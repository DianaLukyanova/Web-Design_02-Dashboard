import { initWidgets } from './js/widgets.js';
import { initTasks } from "./js/tasks.js";
import { initTimer } from "./js/timer.js";
import { initRhythm } from "./js/rhythm.js";
import { initBudget } from "./js/budget.js";
import { initBooks } from "./js/books.js";
import { initDiscovery } from "./js/discovery.js";
[
	initTasks,
	initTimer,
	initRhythm,
	initBudget,
	initBooks,
	initDiscovery,
].forEach((init) => init());
initWidgets();
const links = [...document.querySelectorAll(".nav-link")];
links.forEach((link) =>
	link.addEventListener("click", () => {
		links.forEach((x) => x.classList.toggle("active", x === link));
	}),
);
