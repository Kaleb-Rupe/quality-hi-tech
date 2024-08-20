import React, { useState, useCallback, useMemo } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import emailjs from "@emailjs/browser";
import { services } from "../Home/services-list";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import "../../css/contact.css";

const Form = () => {
  const isMobile = useMediaQuery('(max-width: 768px)');

  const schema = useMemo(() => yup.object().shape({
    "name": yup
      .string()
      .required(isMobile ? "Name required." : "Name is required.")
      .min(5, "At least 5 characters.")
      .max(50, "Cannot exceed 50 characters."),
    "email": yup
      .string()
      .email("Invalid email address.")
      .max(50, "Cannot exceed 50 characters.")
      .test("email-or-phone", isMobile ? "Email or phone required." : "Email or phone number is required.", function (value) {
        return this.parent.phone || value;
      }),
    "phone": yup
      .string()
      .test("phone-or-email", isMobile ? "Phone or email required." : "Phone number or email is required.", function (value) {
        return this.parent.email || value;
      })
      .test("phone-format", "Valid number required.", function (value) {
        // Only check format if a value is provided
        if (value && value.length > 0) {
          return /^[0-9]{6,15}$/.test(value);
        }
        return true;
      }),
    "service": yup
      .string()
      .required(isMobile ? "Select a service." : "Please select a service."),
    "message": yup
      .string()
      .required(isMobile ? "Message required." : "Message is required.")
      .max(200, "Exceeds 200 characters."),
  }), [isMobile]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      service: "",
      message: "",
    },
  });

  const sendEmail = useCallback((data) => {
    const serviceID = "service_rv66zp1"
    const templateID = "template_o0s4yot"

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
          <label htmlFor="name">Name:</label>
          {errors["name"] && (
            <p id="name-error" role="alert" className="error-message">
              {errors["name"].message}
            </p>
          )}
        </div>
        <input
          id="name"
          {...register("name")}
          aria-invalid={errors["name"] ? "true" : "false"}
          aria-describedby="name-error"
          placeholder="Full Name"
        />
      </div>

      <div className="form-group">
        <div className="form-label">
          <label htmlFor="email">Email:</label>
          {errors["email"] && !watch("phone") && (
            <p id="email-error" role="alert" className="error-message">
              {errors["email"].message}
            </p>
          )}
        </div>
        <input
          id="email"
          type="email"
          {...register("email")}
          aria-invalid={errors["email"] && !watch("phone") ? "true" : "false"}
          aria-describedby="email-error"
          placeholder="Email"
        />
      </div>

      <div className="form-group">
        <div className="form-label">
          <label htmlFor="phone">Phone:</label>
          {errors["phone"] && !watch("email") && (
            <p id="phone-error" role="alert" className="error-message">
              {errors["phone"].message}
            </p>
          )}
        </div>
        <input
          id="phone"
          type="tel"
          {...register("phone")}
          aria-invalid={errors["phone"] && !watch("email") ? "true" : "false"}
          aria-describedby="phone-error"
          placeholder="Phone Number"
        />
      </div>

      <div className="form-group">
        <div className="form-label">
          <label htmlFor="service">Service:</label>
          {errors["service"] && (
            <p id="service-error" role="alert" className="error-message">
              {errors["service"].message}
            </p>
          )}
        </div>
        <select
          id="service"
          {...register("service")}
        >
          <option value="" className="service">
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
          <label htmlFor="message">Message:</label>
          {errors["message"] && (
            <p id="message-error" role="alert" className="error-message">
              {errors["message"].message}
            </p>
          )}
        </div>
        <textarea
          className="message-input"
          id="message"
          {...register("message")}
          aria-invalid={errors["message"] ? "true" : "false"}
          aria-describedby="message-error"
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