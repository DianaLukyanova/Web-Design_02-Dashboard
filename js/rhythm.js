import { read, save } from "./utils.js";
export function initRhythm() {
	const clock = document.querySelector("#clock"),
		date = document.querySelector("#rhythm-date"),
		goal = document.querySelector("#daily-goal");
	const update = () => {
		const now = new Date();
		clock.textContent = now.toLocaleTimeString("ru-RU", {
			hour: "2-digit",
			minute: "2-digit",
		});
		date.textContent = now.toLocaleDateString("ru-RU", {
			weekday: "long",
			day: "numeric",
			month: "long",
		});

	};
	update();
	setInterval(update, 1000);
	const key = () => new Date().toLocaleDateString("sv-SE");
	let day = key();
	const stored = read("goal", {});
	goal.value = stored.date === day ? stored.text || "" : "";
	goal.oninput = () => {
		save("goal", { date: key(), text: goal.value });
		document.querySelector("#goal-state").textContent = "Сохранено на сегодня";
	};
	setInterval(() => {
		if (day !== key()) {
			day = key();
			goal.value = "";
			document.querySelector("#goal-state").textContent =
				"Новый день — новая маленькая цель";
		}
	}, 30000);
}
