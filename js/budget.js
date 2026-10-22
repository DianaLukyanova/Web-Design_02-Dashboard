import { el, json, apiState } from "./utils.js";

const currencies = ["EUR", "USD", "GBP", "CHF", "JPY"];
export function convertedAmount(amount, rate) {
	return amount * rate;
}

export function initBudget() {
	const form = document.querySelector("#budget-form");
	const body = document.querySelector("#budget-body");
	const submit = form.querySelector('button[type="submit"]');
	const swap = document.querySelector("#budget-swap");
	let busy = false;
	let cached = null;
	async function load() {
		if (busy || !form.reportValidity()) return;
		const amount = Number(form.elements.amount.value);
		const base = form.elements.base.value;
		const target = form.elements.target.value;
		if (
			!Number.isFinite(amount) ||
			amount < 0 ||
			!currencies.includes(base) ||
			!currencies.includes(target)
		)
			return;
		busy = true;
		submit.disabled = swap.disabled = true;
		body.dataset.loaded = "false";
		apiState(body, "Получаем справочный курс…");
		try {
			if (
				!cached ||
				cached.base !== base ||
				Date.now() - cached.received > 15 * 60 * 1000
			) {
				const data = await json(
					"https://api.frankfurter.dev/v1/latest?" +
						new URLSearchParams({ base }),
				);
				if (
					data.base !== base ||
					!/^\d{4}-\d{2}-\d{2}$/.test(data.date) ||
					!data.rates
				)
					throw new Error("invalid");
				cached = { ...data, received: Date.now() };
			}
			const rate = base === target ? 1 : cached.rates[target];
			if (!Number.isFinite(rate) || rate <= 0) throw new Error("invalid");
			const format = (value, code) =>
				value.toLocaleString("ru-RU", {
					style: "currency",
					currency: code,
					maximumFractionDigits: 2,
				});
			body.replaceChildren(
				el("p", "budget-caption", `${format(amount, base)} — это примерно`),
				el(
					"strong",
					"budget-result",
					format(convertedAmount(amount, rate), target),
				),
				el(
					"p",
					"budget-rate",
					`1 ${base} = ${rate.toLocaleString("ru-RU", { maximumFractionDigits: 5 })} ${target}`,
				),
				el(
					"p",
					"budget-date",
					"Курс на " +
						new Date(cached.date + "T12:00:00").toLocaleDateString("ru-RU"),
				),
			);
			body.dataset.loaded = "true";
		} catch (error) {
			const message =
				error.message === "HTTP 429"
					? "Сервис ограничил число запросов. Попробуй чуть позже."
					: "Курсы сейчас недоступны. Повтори запрос позже.";
			apiState(body, message, load);
		} finally {
			busy = false;
			submit.disabled = swap.disabled = false;
		}
	}
	form.onsubmit = (event) => {
		event.preventDefault();
		load();
	};
	swap.onclick = () => {
		const base = form.elements.base.value;
		form.elements.base.value = form.elements.target.value;
		form.elements.target.value = base;
		load();
	};
	load();
}
