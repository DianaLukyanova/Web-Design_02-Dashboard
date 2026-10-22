import { el, read, save } from "./utils.js";
export function initTasks() {
	const list = document.querySelector("#task-list"),
		form = document.querySelector("#task-form"),
		input = form.elements.task;
	let tasks = read("tasks", []);
	if (!Array.isArray(tasks)) tasks = [];
	tasks = tasks.filter(
		(t) => t && typeof t.text === "string" && typeof t.id === "string",
	);
	function render() {
		list.replaceChildren();
		const done = tasks.filter((t) => t.done).length;
		document.querySelector("#task-count").textContent =
			`${done} из ${tasks.length} выполнено`;
		document.querySelector("#task-progress").value = tasks.length
			? done / tasks.length
			: 0;
		if (!tasks.length)
			list.append(el("p", "empty", "Пока чистый лист. С чего начнем?"));
		for (const task of tasks) {
			const row = el("li", "task-row"),
				label = el("label"),
				check = document.createElement("input");
			check.type = "checkbox";
			check.checked = !!task.done;
			const text = el("span", task.done ? "done" : "", task.text);
			check.onchange = () => {
				task.done = check.checked;
				save("tasks", tasks);
				render();
			};
			label.append(check, text);
			const remove = el("button", "delete-task", "×");
			remove.setAttribute("aria-label", `Удалить: ${task.text}`);
			remove.onclick = () => {
				tasks = tasks.filter((t) => t.id !== task.id);
				save("tasks", tasks);
				render();
			};
			row.append(label, remove);
			list.append(row);
		}
	}
	form.onsubmit = (e) => {
		e.preventDefault();
		const text = input.value.trim();
		if (!text) return;
		if (tasks.length >= 30) {
			input.setCustomValidity("Не больше 30 задач. Сначала завершим текущие.");
			input.reportValidity();
			return;
		}
		tasks.push({ id: crypto.randomUUID(), text, done: false });
		save("tasks", tasks);
		input.value = "";
		render();
	};
	input.oninput = () => input.setCustomValidity("");
	render();
}
