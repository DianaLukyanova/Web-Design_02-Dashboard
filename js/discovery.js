import { el, json, apiState } from "./utils.js";
const topics = [
	"Типографика",
	"Цветовой круг",
	"Золотое сечение",
	"Гештальтпсихология",
	"Биомиметика",
	"Каллиграфия",
	"Баухаус",
];
export function initDiscovery() {
	const body = document.querySelector("#discovery-body"),
		button = document.querySelector("#discovery-next");
	let index = Math.floor(Math.random() * topics.length),
		busy = false;
	async function load() {
		if (busy) return;
		busy = true;
		button.disabled = true;
		body.dataset.loaded = "false";
		apiState(body, "Открываем что-то интересное…");
		try {
			const data = await json(
				"https://ru.wikipedia.org/w/api.php?" +
					new URLSearchParams({
						action: "query",
						prop: "extracts",
						exintro: "1",
						explaintext: "1",
						exchars: "380",
						titles: topics[index],
						redirects: "1",
						format: "json",
						origin: "*",
					}),
			);
			const page = Object.values(data.query?.pages || {}).find(
				(p) => p.extract,
			);
			if (!page) throw Error("data");
			body.replaceChildren(
				el("h3", "discovery-title", page.title),
				el("p", "discovery-text", page.extract),
			);
			const link = el("a", "text-button", "Читать в Википедии ↗");
			link.href = "https://ru.wikipedia.org/?curid=" + Number(page.pageid);
			link.target = "_blank";
			link.rel = "noopener noreferrer";
			body.append(link);
			body.dataset.loaded = "true";
		} catch {
			apiState(body, "Не удалось загрузить статью. Попробуй снова.", load);
		} finally {
			busy = false;
			button.disabled = false;
		}
	}
	button.onclick = () => {
		index = (index + 1) % topics.length;
		load();
	};
	load();
}
