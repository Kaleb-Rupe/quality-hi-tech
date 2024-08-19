import React, { useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import emailjs from "@emailjs/browser";
import { services } from "../Home/services-list";
import "../../css/contact.css";

const Form = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm({
    defaultValues: {
      "footer-name": "",
      "footer-email": "",
      "footer-phone": "",
      "footer-service": "",
      "footer-message": "",
    },
  });

  const watchEmail = watch("footer-email");
  const watchPhone = watch("footer-phone");

  const validateContactInfo = (value, type) => {
    if (!watchEmail && !watchPhone) {
      return "Phone number or email is required.";
    }
    if (type === "email" && value) {
      return validateEmail(value);
    }
    if (type === "phone" && value) {
      return value.match(/^[0-9]{6,15}$/) ? true : "Please enter a valid phone number.";
    }
    return true;
  };

  const validateEmail = useCallback((value) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(value) || "Invalid email address";
  }, []);

  const sendEmail = useCallback((data) => {
    const serviceID = "service_rv66zp1";
    const templateID = "template_o0s4yot";

    emailjs.init({
      publicKey: "hohx4dG5zc1Gehn9H",
      blockHeadless: false,
      limitRate: {
        id: "app",
        throttle: 10000,
      },
    });

    emailjs
      .send(serviceID, templateID, data)
      .then((response) => {
        console.log("Email sent successfully!", response.status, response.text);
        setSubmissionStatus("success");
      })
      .catch((error) => {
        console.error("Failed to send email:", error);
        setSubmissionStatus("error");
      });
  }, []);

  const onSubmit = useCallback(
    (data) => {
      sendEmail(data);
      reset();
    },
    [reset, sendEmail]
  );

  const [submissionStatus, setSubmissionStatus] = useState("");

  if (submissionStatus === "success") {
    return (
      <div className="success-message" role="alert">
        <h2>Thank you!</h2>
        <p>Your message has been sent successfully.</p>
        <p>We will get back to you shortly.</p>
        <button onClick={() => setSubmissionStatus("")} className="reset-button">
          Send Another Message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="form-wrapper">
      <h2>Contact Us</h2>
      <div className="form-group">
        <div className="form-label">
          <label htmlFor="footer-name">Name:</label>
          {errors["footer-name"] && (
            <p id="footer-name-error" role="alert" className="error-message">
              {errors["footer-name"].message}
            </p>
          )}
        </div>
        <input
          id="footer-name"
          {...register("footer-name", {
            required: "Name is required.",
            minLength: {
              value: 2,
              message: "Name must be at least 2 characters long.",
            },
            maxLength: {
              value: 50,
              message: "Name cannot exceed 50 characters.",
            },
          })}
          aria-invalid={errors["footer-name"] ? "true" : "false"}
          aria-describedby="footer-name-error"
          placeholder="Full Name"
        />
      </div>

      <div className="form-group">
        <div className="form-label">
          <label htmlFor="footer-email">Email:</label>
          {errors["footer-email"] && (
            <p id="footer-email-error" role="alert" className="error-message">
              {errors["footer-email"].message}
            </p>
          )}
        </div>
        <input
          id="footer-email"
          type="email"
          {...register("footer-email", {
            validate: (value) => validateContactInfo(value, "email"),
          })}
          aria-invalid={errors["footer-email"] ? "true" : "false"}
          aria-describedby="footer-email-error"
          placeholder="Email"
        />
      </div>

      <div className="form-group">
        <div className="form-label">
          <label htmlFor="footer-phone">Phone Number:</label>
          {errors["footer-phone"] && (
            <p id="footer-phone-error" role="alert" className="error-message">
              {errors["footer-phone"].message}
            </p>
          )}
        </div>
        <input
          id="footer-phone"
          type="tel"
          {...register("footer-phone", {
            validate: (value) => validateContactInfo(value, "phone"),
          })}
          aria-invalid={errors["footer-phone"] ? "true" : "false"}
          aria-describedby="footer-phone-error"
          placeholder="Phone Number"
        />
      </div>

      <div className="form-group">
        <div className="form-label">
          <label htmlFor="service">Service:</label>
          {errors.service && (
            <p id="service-error" role="alert" className="error-message">
              {errors.service.message}
            </p>
          )}
        </div>
        <select
          id="service"
          {...register("service", {
            required: "Please select a service.",
          })}
        >
          <option value="" className="select-service">
            Select a service
          </option>
          {services.map((service) => (
            <option key={service.id} value={service.title}>
              {service.title}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <div className="form-label">
          <label htmlFor="footer-message">Message:</label>
          {errors["footer-message"] && (
            <p id="footer-message-error" role="alert" className="error-message">
              {errors["footer-message"].message}
            </p>
          )}
        </div>
        <textarea
          className="message-input"
          id="footer-message"
          {...register("footer-message", {
            required: "Message is required.",
            maxLength: {
              value: 500,
              message: "Message cannot exceed 500 characters.",
            },
          })}
          aria-invalid={errors["footer-message"] ? "true" : "false"}
          aria-describedby="footer-message-error"
          placeholder="Your message..."
        />
      </div>

      <button type="submit" className="submit-button">
        Submit
      </button>
    </form>
  );
};

export default React.memo(Form);