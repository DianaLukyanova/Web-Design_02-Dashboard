import { formatTime } from "./utils.js";
export function initTimer() {
	const display = document.querySelector("#timer-value"),
		toggle = document.querySelector("#timer-toggle"),
		ring = document.querySelector("#timer-ring");
	let duration = 25 * 60,
		remaining = duration,
		deadline = 0,
		running = false,
		audio;
	const sound = () => {
		if (!audio) return;
		const osc = audio.createOscillator(),
			gain = audio.createGain();
		osc.connect(gain);
		gain.connect(audio.destination);
		osc.frequency.value = 660;
		gain.gain.setValueAtTime(0.12, audio.currentTime);
		gain.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + 1);
		osc.start();
		osc.stop(audio.currentTime + 1);
	};
	function paint() {
		display.textContent = formatTime(remaining);
		ring.style.setProperty(
			"--progress",
			`${(1 - remaining / duration) * 360}deg`,
		);
		toggle.textContent = running ? "Пауза" : "Начать фокус";
		toggle.setAttribute("aria-pressed", String(running));
	}
	function tick() {
		if (running) {
			remaining = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
			if (!remaining) {
				running = false;
				document.querySelector("#timer-status").textContent =
					"Сессия завершена. Ты молодец!";
				sound();
			}
		}
		paint();
	}
	toggle.onclick = () => {
		if (!audio) {
			const Context = window.AudioContext || window.webkitAudioContext;
			if (Context) audio = new Context();
		}
		audio?.resume();
		if (running) {
			tick();
			running = false;
		} else {
			if (!remaining) remaining = duration;
			deadline = Date.now() + remaining * 1000;
			running = true;
		}
		paint();
	};
	document.querySelector("#timer-reset").onclick = () => {
		running = false;
		remaining = duration;
		document.querySelector("#timer-status").textContent =
			"Одна задача. Никакой спешки.";
		paint();
	};
	document.querySelectorAll("[data-minutes]").forEach(
		(b) =>
			(b.onclick = () => {
				running = false;
				duration = Number(b.dataset.minutes) * 60;
				remaining = duration;
				document
					.querySelectorAll("[data-minutes]")
					.forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
				document.querySelector("#timer-status").textContent =
					b.dataset.minutes === "5"
						? "Время выдохнуть и отдохнуть."
						: "Одна задача. Никакой спешки.";
				paint();
			}),
	);
	setInterval(tick, 250);
	paint();
}
