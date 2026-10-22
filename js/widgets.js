import { el, read, save } from "./utils.js";

export function initWidgets() {
	const widgets = [...document.querySelectorAll(".dashboard-grid > .widget")];
	const panel = document.querySelector("#widget-options");
	const stored = read("hidden-widgets", []);
	const hidden = new Set(
		Array.isArray(stored)
			? stored.filter((id) => widgets.some((w) => w.id === id))
			: [],
	);
	const buttons = new Map();
	const status = document.querySelector("#widget-status");
	function update(persist = true) {
		widgets.forEach((widget) => {
			widget.hidden = hidden.has(widget.id);
			const button = buttons.get(widget.id);
			button.setAttribute("aria-expanded", String(!widget.hidden));
			button.querySelector(".sidebar-widget-state").textContent = widget.hidden
				? "+"
				: "↗";
			button.title = widget.hidden
				? "Открыть виджет"
				: "Перейти к открытому виджету";
		});
		document.querySelector("#widget-count").textContent =
			`${widgets.length - hidden.size} из ${widgets.length} открыто`;
		document.querySelector("#widgets-empty").hidden =
			hidden.size !== widgets.length;
		if (persist) save("hidden-widgets", [...hidden]);
	}
	function open(id, scroll = false) {
		const widget = widgets.find((w) => w.id === id);
		if (!widget) return;
		hidden.delete(id);
		update();
		if (scroll) {
			widget.scrollIntoView({
				behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
					? "instant"
					: "smooth",
				block: "center",
			});
			widget.querySelector(".widget-close").focus({ preventScroll: true });
		}
	}
	widgets.forEach((widget, index) => {
		const title = widget.querySelector("h2").textContent;
		const button = el("button", "sidebar-widget");
		button.type = "button";
		button.dataset.widget = widget.id;
		button.setAttribute("aria-controls", widget.id);
		button.append(
			el("span", "sidebar-widget-number", String(index + 1).padStart(2, "0")),
			el("span", "sidebar-widget-title", title),
			el("span", "sidebar-widget-state", "↗"),
		);
		button.onclick = () => {
			open(widget.id, true);
			status.textContent = `Открыт виджет «${title}»`;
		};
		buttons.set(widget.id, button);
		panel.append(button);
		const close = el("button", "widget-close", "×");
		close.type = "button";
		close.setAttribute("aria-label", `Закрыть виджет «${title}»`);
		close.onclick = () => {
			hidden.add(widget.id);
			update();
			status.textContent = `Виджет «${title}» закрыт`;
			button.focus({ preventScroll: true });
		};
		widget.querySelector(".widget-heading").append(close);
	});
	document.querySelectorAll("[data-open-all]").forEach(
		(button) =>
			(button.onclick = () => {
				hidden.clear();
				update();
				status.textContent = "Все шесть виджетов открыты";
			}),
	);
	const revealHash = () => open(location.hash.slice(1));
	window.addEventListener("hashchange", revealHash);
	update(false);
	if (location.hash) revealHash();
}
