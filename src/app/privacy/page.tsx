import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Privacy Policy — NHP Bangkok",
  description: "Learn about how New Home Property (NHP) Bangkok collects, utilizes, and secures your personal and enquiry information.",
};

export default function PrivacyPage() {
  const sections = [
    {
      title: "1. Information We Collect",
      body: [
        "We collect personal information that you voluntarily provide to us when you register a user account, bookmark properties, or submit enquiries. This includes your name, email address, phone number, and preferred messaging handles (such as WhatsApp or Line).",
        "Additionally, we track anonymous usage metrics (such as page views, clicks, and saved property shortlists) to optimize search recommendations and understand platform traffic."
      ]
    },
    {
      title: "2. How We Use Your Information",
      body: [
        "Your details are utilized strictly to coordinate property viewings, process enquiries, and send platform alerts that you request.",
        "We never sell, rent, or lease your personal contact details to third-party marketing companies. Enquiries are shared only with the NHP Bangkok real estate team representing the specific condominium or house listing you ask about."
      ]
    },
    {
      title: "3. Cookies and Local Storage",
      body: [
        "We use cookies to maintain your signed-in session (via NextAuth) and security tokens.",
        "We also utilize browser Local Storage to preserve your recently viewed listings and property likes so your preferences remain intact across page reloads, even when browsing anonymously."
      ]
    },
    {
      title: "4. Data Security",
      body: [
        "We enforce industry-standard security protocols to protect your personal details. Database and JSON record stores are encrypted, and all client-to-server data transfers are secured using SSL (Secure Sockets Layer) channels."
      ]
    },
    {
      title: "5. Your Rights",
      body: [
        "You have the right to request access to the personal data we store, ask for corrections, or request complete deletion of your registered lead account at any time. Simply get in touch with our data controller using the contact email listed below."
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
              New Home Property (NHP) Bangkok is committed to safeguarding your online privacy. This policy outlines how we handle, process, and secure user information across our platform and applications.
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

      </main>
      <Footer />
    </>
  );
}
