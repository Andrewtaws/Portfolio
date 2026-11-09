/* ==========================================================================
   Contact form: progressive enhancement
   --------------------------------------------------------------------------
   Without JavaScript, the form posts to a mailto: address.
   With JavaScript:
   - fields are validated on submit
   - errors appear inline and in an error summary that receives focus
     (WCAG 3.3.1, 3.3.3, 4.1.3)
   - a valid message opens the visitor's email app with the subject and
     body filled in
   ========================================================================== */
(function () {
  "use strict";

  var form = document.getElementById("contact-form");
  var summary = document.getElementById("error-summary");
  if (!form || !summary) return;

  var summaryList = summary.querySelector(".error-summary__list");
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

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    var errors = validate();

    if (errors.length) {
      document.title = "Error: " + document.title.replace(/^Error: /, "");
      showSummary(errors);
      return;
    }

    summary.hidden = true;
    document.title = document.title.replace(/^Error: /, "");

    var name = form.elements.name.value.trim();
    var email = form.elements.email.value.trim();
    var message = form.elements.message.value.trim();
    var to = form.getAttribute("data-email");
    var subject = "Portfolio enquiry from " + name;
    var body = message + "\n\n" + name + "\n" + email;

    window.location.href =
      "mailto:" + to +
      "?subject=" + encodeURIComponent(subject) +
      "&body=" + encodeURIComponent(body);
  });
})();
