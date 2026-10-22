export function el(tag, className = "", text = "") {
	const node = document.createElement(tag);
	node.className = className;
	node.textContent = String(text).replace(/ё/g, "е").replace(/Ё/g, "Е");
	return node;
}
export function read(key, fallback) {
	try {
		return JSON.parse(localStorage.getItem("campus:" + key)) ?? fallback;
	} catch {
		return fallback;
	}
}
export function save(key, value) {
	try {
		localStorage.setItem("campus:" + key, JSON.stringify(value));
	} catch {
		document.querySelector("#storage-note").hidden = false;
	}
}
export async function json(url) {
	const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
	if (!res.ok) throw new Error("HTTP " + res.status);
	return res.json();
}
export function apiState(container, text, retry) {
	container.replaceChildren(el("p", "state-message", text));
	if (retry) {
		const b = el("button", "text-button", "Попробовать снова ↗");
		b.type = "button";
		b.onclick = retry;
		container.append(b);
	}
}
export const formatTime = (seconds) =>
	`${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
export function weatherLabel(code) {
	return code === 0
		? "Ясно"
		: code <= 3
			? "Переменная облачность"
			: code <= 48
				? "Туман"
				: code <= 67
					? "Дождь"
					: code <= 77
						? "Снег"
						: code <= 82
							? "Ливень"
							: code <= 86
								? "Снегопад"
								: "Гроза";
}
