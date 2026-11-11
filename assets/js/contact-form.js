/* ==========================================================================
   Contact form: progressive enhancement
   --------------------------------------------------------------------------
   The form sends through FormSubmit (formsubmit.co), so no email app is
   needed. Without JavaScript it posts normally and FormSubmit returns the
   visitor to contact.html#sent, which shows the confirmation.
   With JavaScript:
   - fields are validated on submit
   - errors appear inline and in an error summary that receives focus
     (WCAG 3.3.1, 3.3.3, 4.1.3)
   - a valid message is sent in the background; the confirmation then
     replaces the form and receives focus
   - if sending fails, the error summary explains and offers an email link
   ========================================================================== */
(function () {
  "use strict";

  var form = document.getElementById("contact-form");
  var summary = document.getElementById("error-summary");
  if (!form || !summary) return;

  var summaryList = summary.querySelector(".error-summary__list");
  var summaryTitle = summary.querySelector(".error-summary__title");
  var summaryTitleText = summaryTitle.textContent;
  var sent = document.getElementById("sent");
  var button = form.querySelector('button[type="submit"]');
  var buttonText = button.textContent;
  var sending = false;
  var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  var rules = [
    {
      id: "name",
      check: function (v) { return v.length > 0; },
      message: "Enter your name"
    },
    {
      id: "email",
      check: function (v) { return v.length > 0; },
      message: "Enter your email address"
    },
    {
      id: "email",
      check: function (v) { return v.length === 0 || emailPattern.test(v); },
      message: "Enter an email address in the correct format, like name@example.com"
    },
    {
      id: "message",
      check: function (v) { return v.length > 0; },
      message: "Enter a message"
    }
  ];

  function setError(field, message) {
    var error = document.getElementById(field.id + "-error");
    error.innerHTML = '<span class="visually-hidden">Error: </span>' + message;
    error.hidden = false;
    field.setAttribute("aria-invalid", "true");
    field.setAttribute("aria-describedby", error.id);
  }

  function clearError(field) {
    var error = document.getElementById(field.id + "-error");
    error.textContent = "";
    error.hidden = true;
    field.removeAttribute("aria-invalid");
    field.removeAttribute("aria-describedby");
  }

  function validate() {
    var errors = [];
    var seen = {};

    ["name", "email", "message"].forEach(function (id) {
      clearError(document.getElementById(id));
    });

    rules.forEach(function (rule) {
      if (seen[rule.id]) return;
      var field = document.getElementById(rule.id);
      var value = field.value.trim();
      if (!rule.check(value)) {
        seen[rule.id] = true;
        setError(field, rule.message);
        errors.push({ id: rule.id, message: rule.message });
      }
    });

    return errors;
  }

  function showSummary(errors) {
    summaryList.innerHTML = "";
    errors.forEach(function (error) {
      var li = document.createElement("li");
      var a = document.createElement("a");
      a.href = "#" + error.id;
      a.textContent = error.message;
      a.addEventListener("click", function (event) {
        event.preventDefault();
        document.getElementById(error.id).focus();
      });
      li.appendChild(a);
      summaryList.appendChild(li);
    });
    summary.hidden = false;
    summary.focus();
  }

  function setSending(on) {
    sending = on;
    button.textContent = on ? "Sending…" : buttonText;
    if (on) button.setAttribute("aria-disabled", "true");
    else button.removeAttribute("aria-disabled");
  }

  function showSent() {
    form.reset();
    sent.classList.add("is-visible");
    sent.focus();
    document.title = "Message sent – " + document.title.replace(/^(Error|Message sent) – |^Error: /, "");
  }

  function showSendError() {
    var to = form.getAttribute("data-email");
    var name = form.elements.name.value.trim();
    var body = form.elements.message.value.trim() + "\n\n" + name + "\n" + form.elements.email.value.trim();
    summaryTitle.textContent = "Your message could not be sent";
    summaryList.innerHTML = "";
    var li = document.createElement("li");
    li.appendChild(document.createTextNode("Please try again in a moment, or "));
    var a = document.createElement("a");
    a.href = "mailto:" + to +
      "?subject=" + encodeURIComponent("Portfolio enquiry from " + name) +
      "&body=" + encodeURIComponent(body);
    a.textContent = "send it from your email app";
    li.appendChild(a);
    li.appendChild(document.createTextNode(" instead. Your message is still in the form."));
    summaryList.appendChild(li);
    summary.hidden = false;
    summary.focus();
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    if (sending) return;
    summaryTitle.textContent = summaryTitleText;
    var errors = validate();

    if (errors.length) {
      document.title = "Error: " + document.title.replace(/^Error: /, "");
      showSummary(errors);
      return;
    }

    summary.hidden = true;
    document.title = document.title.replace(/^Error: /, "");

    var data = {};
    Array.prototype.forEach.call(form.elements, function (el) {
      if (el.name && el.name !== "_next") data[el.name] = el.value.trim();
    });

    setSending(true);
    fetch(form.getAttribute("data-endpoint"), {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify(data)
    })
      .then(function (response) {
        return response.json().then(function (json) {
          if (!response.ok || String(json.success) !== "true") throw new Error(json.message || "Send failed");
        });
      })
      .then(function () { setSending(false); showSent(); })
      .catch(function () { setSending(false); showSendError(); });
  });
})();
