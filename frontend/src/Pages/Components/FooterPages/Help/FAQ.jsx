import { useState } from "react";
import { useLanguage } from "../../../translation/LanguageContext";

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);
  const { translate } = useLanguage();

  const faqs = [
    {
      question: translate("faqShippingTime"),
      answer: translate("faqShippingTimeAnswer"),
    },
    {
      question: translate("faqReturnProduct"),
      answer: translate("faqReturnProductAnswer"),
    },
    {
      question: translate("faqTrackOrder"),
      answer: translate("faqTrackOrderAnswer"),
    },
    {
      question: translate("faqInternationalShipping"),
      answer: translate("faqInternationalShippingAnswer"),
    },
    {
      question: translate("faqLoyaltyPoints"),
      answer: translate("faqLoyaltyPointsAnswer"),
    },
  ];

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">{translate("faqTitle")}</h2>
      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <div key={index} className="border rounded-lg overflow-hidden">
            <button
              className="w-full text-left p-4 font-medium bg-gray-50 hover:bg-gray-100 transition-colors flex justify-between items-center"
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
            >
              {faq.question}
              <span className="text-xl">{openIndex === index ? "−" : "+"}</span>
            </button>
            {openIndex === index && (
              <div className="p-4 text-gray-600 border-t">{faq.answer}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
