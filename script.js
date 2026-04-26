document.addEventListener("DOMContentLoaded", () => {
	/* ── Demo form ──────────────────────────────────────────── */
	const form = document.getElementById("demoForm");
	if (form) {
		const message = document.getElementById("formMessage");
		const summary = document.getElementById("submissionSummary");
		const summaryList = summary ? summary.querySelector("dl") : null;
		const storageKey = "dentalco2DemoLead";

		const setMessage = (text, type) => {
			if (!message) return;
			message.textContent = text;
			message.className = "form-message";
			if (type) message.classList.add(type === "success" ? "is-success" : "is-error");
		};

		const renderSummary = (lead) => {
			if (!summary || !summaryList) return;
			const fields = [
				["Practice", lead.practiceName],
				["Contact", lead.contactName],
				["Email", lead.email],
				["Phone", lead.phone || "Not provided"],
				["Locations", lead.locations],
				["Goal", lead.priority],
				["Notes", lead.notes || "None provided"],
				["Saved", new Date(lead.savedAt).toLocaleString()]
			];
			summaryList.innerHTML = fields
				.map(([label, value]) => `<dt>${label}</dt><dd>${escapeHtml(String(value))}</dd>`)
				.join("");
			summary.hidden = false;
		};

		const escapeHtml = (str) =>
			str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#x27;");

		const storedLead = window.localStorage.getItem(storageKey);
		if (storedLead) {
			try { renderSummary(JSON.parse(storedLead)); } catch { window.localStorage.removeItem(storageKey); }
		}

		form.addEventListener("submit", (event) => {
			event.preventDefault();
			if (!form.reportValidity()) {
				setMessage("Please complete all required fields before scheduling a demo.", "error");
				return;
			}

			const formData = new FormData(form);
			const locationsEl = document.getElementById("locations");
			const priorityEl = document.getElementById("priority");

			const lead = {
				practiceName: String(formData.get("practiceName") || "").trim(),
				contactName: String(formData.get("contactName") || "").trim(),
				email: String(formData.get("email") || "").trim(),
				phone: String(formData.get("phone") || "").trim(),
				locations: locationsEl && locationsEl.selectedOptions.length > 0
					? locationsEl.selectedOptions[0].textContent || ""
					: String(formData.get("locations") || "").trim(),
				priority: priorityEl && priorityEl.selectedOptions.length > 0
					? priorityEl.selectedOptions[0].textContent || ""
					: String(formData.get("priority") || "").trim(),
				notes: String(formData.get("notes") || "").trim(),
				savedAt: new Date().toISOString()
			};

			window.localStorage.setItem(storageKey, JSON.stringify(lead));
			renderSummary(lead);
			setMessage("Demo request saved. Connect this form to your CRM or backend endpoint for live lead capture.", "success");
			form.reset();
		});
	}

	/* ── FAQ accordion ──────────────────────────────────────── */
	const faqItems = document.querySelectorAll(".faq-item");
	faqItems.forEach((item) => {
		const btn = item.querySelector(".faq-question");
		const answer = item.querySelector(".faq-answer");
		if (!btn || !answer) return;

		btn.addEventListener("click", () => {
			const isOpen = btn.getAttribute("aria-expanded") === "true";
			// Close all
			faqItems.forEach((other) => {
				const otherBtn = other.querySelector(".faq-question");
				const otherAnswer = other.querySelector(".faq-answer");
				if (otherBtn && otherAnswer) {
					otherBtn.setAttribute("aria-expanded", "false");
					otherAnswer.hidden = true;
					other.classList.remove("open");
				}
			});
			// Toggle clicked
			if (!isOpen) {
				btn.setAttribute("aria-expanded", "true");
				answer.hidden = false;
				item.classList.add("open");
			}
		});
	});
});
