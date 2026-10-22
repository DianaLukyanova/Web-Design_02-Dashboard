import { el, json, apiState } from "./utils.js";
export function initBooks() {
	const form = document.querySelector("#books-form"),
		body = document.querySelector("#books-body");
	let busy = false;
	async function load() {
		if (busy) return;
		busy = true;
		form.querySelector("button").disabled = true;
		body.dataset.loaded = "false";
		apiState(body, "Ищем твою следующую книгу…");
		try {
			const q = form.elements.query.value.trim();
			if (!q) return;
			const data = await json(
				`https://openlibrary.org/search.json?${new URLSearchParams({ q, limit: 3, fields: "key,title,author_name,cover_i,first_publish_year" })}`,
			);
			if (!Array.isArray(data.docs)) throw Error("data");
			body.replaceChildren();
			if (!data.docs.length)
				apiState(
					body,
					"Пока ничего не найдено. Попробуй автора или английское название.",
				);
			for (const book of data.docs) {
				if (!/^\/works\/OL\d+W$/.test(book.key)) continue;
				const a = el("a", "book");
				a.href = "https://openlibrary.org" + book.key;
				a.target = "_blank";
				a.rel = "noopener noreferrer";
				const cover = el("div", "book-cover", "Aa");
				if (Number.isInteger(book.cover_i)) {
					const img = document.createElement("img");
					img.src = `https://covers.openlibrary.org/b/id/${book.cover_i}-S.jpg?default=false`;
					img.alt = "";
					img.loading = "lazy";
					img.onerror = () => img.remove();
					cover.append(img);
				}
				const info = el("div", "book-info");
				info.append(
					el("strong", "", book.title),
					el(
						"span",
						"muted",
						(book.author_name || ["Автор не указан"]).slice(0, 2).join(", "),
					),
				);
				a.append(cover, info, el("span", "book-arrow", "↗"));
				body.append(a);
			}
			body.dataset.loaded = "true";
		} catch {
			apiState(
				body,
				"Библиотека сейчас недоступна. Попробуй еще раз чуть позже.",
				load,
			);
		} finally {
			busy = false;
			form.querySelector("button").disabled = false;
		}
	}
	form.onsubmit = (e) => {
		e.preventDefault();
		load();
	};
	load();
}
