import React, { useState } from "react";

const GoodToKnow = () => {
  const [faqs, setFaqs] = useState([{ question: "", answer: "" }]);
  const [errors, setErrors] = useState([]);

  // Handle adding a new FAQ
  const handleAddQuestion = () => {
    setFaqs([...faqs, { question: "", answer: "" }]);
    setErrors([...errors, false]);
  };

  // Handle input change for question and answer
  const handleInputChange = (index, field, value) => {
    const updatedFaqs = [...faqs];
    updatedFaqs[index][field] = value;
    setFaqs(updatedFaqs);

    // Clear error if question is filled
    if (field === "question" && value.trim() !== "") {
      const updatedErrors = [...errors];
      updatedErrors[index] = false;
      setErrors(updatedErrors);
    }
  };

  // Handle removing an FAQ
  const handleRemoveQuestion = (index) => {
    const updatedFaqs = faqs.filter((_, i) => i !== index);
    const updatedErrors = errors.filter((_, i) => i !== index);
    setFaqs(updatedFaqs);
    setErrors(updatedErrors);
  };

  // Validate and show error if question is empty
  const validateQuestion = (index) => {
    if (faqs[index].question.trim() === "") {
      const updatedErrors = [...errors];
      updatedErrors[index] = true;
      setErrors(updatedErrors);
    }
  };

  return (
    <div className="mx-auto max-w-2xl rounded-lg border border-gray-200 bg-white p-6 shadow-md">
      {/* Good to Know Section */}
      <h2 className="mb-2 text-2xl font-bold text-gray-800">Good to know</h2>
      <p className="mb-6 text-gray-600">
        Use this section to feature specific information about your event. Add
        highlights and frequently asked questions for attendees.
      </p>

      {/* Highlights Section */}
      <div className="mb-6">
        <h3 className="mb-2 text-lg font-semibold text-gray-800">Highlights</h3>
        <div className="flex space-x-4">
          <button className="flex items-center rounded-md border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-100">
            <span className="mr-2">+</span> Add Age info
          </button>
          <button className="flex items-center rounded-md border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-100">
            <span className="mr-2">+</span> Add Parking info
          </button>
        </div>
      </div>

      {/* Frequently Asked Questions Section */}
      <div>
        <h3 className="mb-2 text-lg font-semibold text-gray-800">
          Frequently asked questions
        </h3>
        <p className="mb-4 text-gray-600">
          Answer questions your attendees may have about the event, like
          accessibility and amenities.
        </p>

        {faqs.map((faq, index) => (
          <div
            key={index}
            className="relative mb-6 rounded-md border border-gray-200 p-4"
          >
            {/* Question Field */}
            <div className="mb-4">
              <label className="mb-1 block font-medium text-gray-700">
                Question <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={faq.question}
                onChange={(e) =>
                  handleInputChange(index, "question", e.target.value)
                }
                onBlur={() => validateQuestion(index)}
                className={`w-full rounded-md border p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                  errors[index] ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Enter your question"
              />
              {errors[index] && (
                <p className="mt-1 flex items-center text-sm text-red-500">
                  <span className="mr-1">!</span> A question is required for
                  this section
                </p>
              )}
            </div>

            {/* Answer Field */}
            <div className="mb-4">
              <label className="mb-1 block font-medium text-gray-700">
                Answer <span className="text-red-500">*</span>
              </label>
              <textarea
                value={faq.answer}
                onChange={(e) =>
                  handleInputChange(index, "answer", e.target.value)
                }
                className="w-full rounded-md border border-gray-300 p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                rows={4}
                placeholder="Enter your answer"
              />
              <p className="mt-1 text-right text-sm text-gray-500">0 / 300</p>
            </div>

            {/* Remove Button */}
            <button
              onClick={() => handleRemoveQuestion(index)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              🗑️
            </button>
          </div>
        ))}

        {/* Add Question Button */}
        <button
          onClick={handleAddQuestion}
          className="flex items-center text-blue-600 hover:underline"
        >
          <span className="mr-2">+</span> Add question
        </button>
      </div>
    </div>
  );
};

export default GoodToKnow;
