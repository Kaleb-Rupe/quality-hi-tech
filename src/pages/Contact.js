import React from "react";
import { useForm } from "react-hook-form";
import "../components/Home-Components/contact-form.css";

const ContactForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  const onSubmit = (data) => {
    // Handle form submission
    console.log(data);
    reset();
  };

  return (
    <section className="contact-form">
      <h2>Contact Us</h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="form-group">
          <label htmlFor="name">Name:</label>
          <input
            id="name"
            name="name"
            type="text"
            {...register("name", { required: "Name is required" })}
          />
          {errors.name && <p>{errors.name.message}</p>}
        </div>
        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input
            id="email"
            name="email"
            type="email"
            {...register("email", { required: "Email is required" })}
          />
          {errors.email && <p>{errors.email.message}</p>}
        </div>
        <div className="form-group">
          <label htmlFor="message">Message:</label>
          <textarea
            id="message"
            name="message"
            {...register("message", { required: "Message is required" })}
          ></textarea>
          {errors.message && <p>{errors.message.message}</p>}
        </div>
        <button type="submit">Send</button>
      </form>
    </section>
  );
};

export default ContactForm;
