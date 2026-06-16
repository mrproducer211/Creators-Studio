import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Privacy Policy — NHP Bangkok",
  description: "Learn how New Home Property (NHP) Bangkok collects, utilizes, and secures your traveler and neighbourhood matching information.",
};

export default function PrivacyPage() {
  const sections = [
    {
      title: "1. Information We Collect",
      body: [
        "We collect personal information that you voluntarily provide to us when you sign up, bookmark properties, or make enquiries. This includes your name, email address, phone number, and preferred chat handles (such as Line or WhatsApp).",
        "We also track anonymous usage metrics—such as your selected neighbourhood preferences, transit search filters, and property likes—to refine our matching algorithms and improve your navigation experience in Bangkok."
      ]
    },
    {
      title: "2. How We Use Your Information",
      body: [
        "We utilize your information strictly to coordinate neighbourhood matching, calculate dynamic commute hubs, process property inquiries, and send you relevant listing updates.",
        "We do not sell, rent, or trade your contact information. Enquiries are shared directly and only with the NHP Bangkok relocation agents or verified landlords responsible for the specific condominiums or homes you select."
      ]
    },
    {
      title: "3. Cookies and Local Storage",
      body: [
        "We use cookies to secure your logged-in session (via NextAuth) and prevent unauthorized request spoofing.",
        "We also use your browser's Local Storage to remember your recently viewed listings, custom commute destinations, and liked properties, ensuring your travel preferences remain intact even if you browse anonymously."
      ]
    },
    {
      title: "4. Data Security",
      body: [
        "We apply standard SSL encryption and industry-standard hosting configurations to protect all user details, database tables, and communication records from unauthorized access or leakage."
      ]
    },
    {
      title: "5. Your Rights",
      body: [
        "You retain full control over your data. You may request access to, edit, or permanently delete your account, saved hubs, or lead details at any time by contacting our data team at the email below."
      ]
    }
  ];

  return (
    <>
      <Navbar />
      <main style={{ paddingTop: 56, background: "#F7F3EC", minHeight: "100vh" }}>
        
        {/* Banner */}
        <div className="px-4 py-16 text-center" style={{ background: "#1C3A2F" }}>
          <div className="max-w-3xl mx-auto">
            <h1 className="text-[28px] md:text-[38px] font-bold leading-tight mb-2 text-white" style={{ letterSpacing: "-0.5px" }}>
              Privacy Policy
            </h1>
            <p className="text-[12px] font-medium" style={{ color: "#C9A84C" }}>
              Last updated: June 2026
            </p>
          </div>
        </div>

        {/* Policy Content */}
        <div className="max-w-3xl mx-auto px-4 py-12">
          <div className="rounded-2xl p-6 md:p-8 border mb-8" style={{ background: "#FFFFFF", borderColor: "#E5E0D8" }}>
            <p className="text-[13px] leading-[1.7] text-gray-500 font-light mb-6">
              New Home Property (NHP) Bangkok is committed to safeguarding your privacy as you search for the neighbourhood that matches your lifestyle. This policy outlines how we handle, process, and secure user information across our platform and applications.
            </p>

            {sections.map((s) => (
              <div key={s.title} className="mb-6 pb-6" style={{ borderBottom: "1px solid #EDE8DF" }}>
                <h2 className="text-[15px] font-bold mb-2.5" style={{ color: "#1C3A2F" }}>
                  {s.title}
                </h2>
                {s.body.map((p, idx) => (
                  <p key={idx} className="text-[13px] leading-[1.8] text-gray-600 font-light mb-3 last:mb-0">
                    {p}
                  </p>
                ))}
              </div>
            ))}

            <div>
              <h2 className="text-[15px] font-bold mb-2" style={{ color: "#1C3A2F" }}>
                6. Contact Information
              </h2>
              <p className="text-[13px] leading-[1.8] text-gray-600 font-light">
                If you have any questions or concerns regarding our privacy policies or data retention, please email us directly at <a href="mailto:admin@nhpbangkok.com" className="font-semibold hover:underline" style={{ color: "#1C3A2F" }}>admin@nhpbangkok.com</a>.
              </p>
            </div>
          </div>
        </div>

        {/* Footer spacer */}
        <div className="h-6" />

      </main>
      <Footer />
    </>
  );
}
