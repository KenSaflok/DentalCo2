document.addEventListener("DOMContentLoaded", () => {
	initDemoForm();
	initExpandableFeaturePanels();
});

function initDemoForm() {
	const form = document.getElementById("demoForm");
	if (!form) {
		return;
	}

	const message = document.getElementById("formMessage");
	const summary = document.getElementById("submissionSummary");
	const summaryList = summary ? summary.querySelector("dl") : null;
	const storageKey = "dentalcoDemoLead";

	const setMessage = (text, type) => {
		if (!message) {
			return;
		}

		message.textContent = text;
		message.className = "form-message";
		if (type) {
			message.classList.add(type === "success" ? "is-success" : "is-error");
		}
	};

	const renderSummary = (lead) => {
		if (!summary || !summaryList) {
			return;
		}

		const fields = [
			["Practice", lead.practiceName],
			["Contact", lead.contactName],
			["Email", lead.email],
			["Phone", lead.phone || "Not provided"],
			["Locations", lead.locations],
			["Priority", lead.priority],
			["Notes", lead.notes || "No notes provided"],
			["Saved", new Date(lead.savedAt).toLocaleString()]
		];

		summaryList.innerHTML = fields
			.map(([label, value]) => `<dt>${label}</dt><dd>${value}</dd>`)
			.join("");
		summary.hidden = false;
	};

	const storedLead = window.localStorage.getItem(storageKey);
	if (storedLead) {
		try {
			renderSummary(JSON.parse(storedLead));
		} catch {
			window.localStorage.removeItem(storageKey);
		}
	}

	form.addEventListener("submit", (event) => {
		event.preventDefault();
		if (!form.reportValidity()) {
			setMessage("Complete the required fields before scheduling a demo.", "error");
			return;
		}

		const formData = new FormData(form);
		const locationsField = document.getElementById("locations");
		const priorityField = document.getElementById("priority");
		const lead = {
			practiceName: String(formData.get("practiceName") || "").trim(),
			contactName: String(formData.get("contactName") || "").trim(),
			email: String(formData.get("email") || "").trim(),
			phone: String(formData.get("phone") || "").trim(),
			locations: locationsField && locationsField.selectedOptions.length > 0
				? locationsField.selectedOptions[0].textContent || ""
				: String(formData.get("locations") || "").trim(),
			priority: priorityField && priorityField.selectedOptions.length > 0
				? priorityField.selectedOptions[0].textContent || ""
				: String(formData.get("priority") || "").trim(),
			notes: String(formData.get("notes") || "").trim(),
			savedAt: new Date().toISOString()
		};

		window.localStorage.setItem(storageKey, JSON.stringify(lead));
		renderSummary(lead);
		setMessage("Demo request saved locally. Connect this form to your backend or CRM endpoint for live lead capture.", "success");
		form.reset();
	});
}

function initExpandableFeaturePanels() {
	const panels = document.querySelectorAll(".ar-showcase-panel");
	if (panels.length === 0) {
		return;
	}

	const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

	panels.forEach((panel) => {
		const summary = panel.querySelector(".ar-showcase-summary");
		const content = panel.querySelector(".ar-showcase-content");

		if (!summary || !content) {
			return;
		}

		let isAnimating = false;

		summary.addEventListener("click", (event) => {
			if (isAnimating) {
				event.preventDefault();
				return;
			}

			if (prefersReducedMotion) {
				return;
			}

			event.preventDefault();
			isAnimating = true;

			if (panel.open) {
				animatePanelClose(panel, content, () => {
					isAnimating = false;
				});
				return;
			}

			animatePanelOpen(panel, content, () => {
				isAnimating = false;
			});
		});
	});
}

function animatePanelOpen(panel, content, onComplete) {
	panel.open = true;
	panel.classList.add("is-animating");
	content.style.height = "0px";
	content.style.opacity = "0";

	requestAnimationFrame(() => {
		content.style.height = `${content.scrollHeight}px`;
		content.style.opacity = "1";
	});

	const handleTransitionEnd = (event) => {
		if (event.propertyName !== "height") {
			return;
		}

		content.removeEventListener("transitionend", handleTransitionEnd);
		content.style.height = "auto";
		panel.classList.remove("is-animating");
		onComplete();
	};

	content.addEventListener("transitionend", handleTransitionEnd);
}

function animatePanelClose(panel, content, onComplete) {
	panel.classList.add("is-animating");
	content.style.height = `${content.scrollHeight}px`;
	content.style.opacity = "1";

	requestAnimationFrame(() => {
		content.style.height = "0px";
		content.style.opacity = "0";
	});

	const handleTransitionEnd = (event) => {
		if (event.propertyName !== "height") {
			return;
		}

		content.removeEventListener("transitionend", handleTransitionEnd);
		panel.open = false;
		panel.classList.remove("is-animating");
		content.style.height = "";
		content.style.opacity = "";
		onComplete();
	};

	content.addEventListener("transitionend", handleTransitionEnd);
}