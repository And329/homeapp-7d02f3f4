import React from 'react';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import AdminChat from '../components/AdminChat';
import ContactAdminButton from '../components/ContactAdminButton';
import LiveSupportChat from '../components/messaging/LiveSupportChat';

const Contact = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Header */}
      <section className="uae-gradient text-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Contact HomeApp</h1>
            <p className="text-xl opacity-90 max-w-2xl mx-auto">
              Get in touch with our expert team for all your UAE real estate needs
            </p>
          </div>
        </div>
      </section>

      {/* Chat and Contact Information */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Admin Chat */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Instant Support</h2>
              <AdminChat />
            </div>

            {/* Contact Information */}
            <div className="space-y-8">
              {/* Contact Admin Button */}
              <ContactAdminButton />

              <div className="bg-white rounded-xl shadow-lg p-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">Get in Touch</h3>
                
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="bg-primary text-white p-3 rounded-lg">
                      <MapPin className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">Visit Our Office</h4>
                      <p className="text-gray-600">
                        Marina Plaza, Level 25<br />
                        Dubai Marina, Dubai, UAE
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="bg-primary text-white p-3 rounded-lg">
                      <Phone className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">Call Us</h4>
                      <p className="text-gray-600">
                        +971 4 123 4567<br />
                        +971 50 987 6543
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="bg-primary text-white p-3 rounded-lg">
                      <Mail className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">Email Us</h4>
                      <p className="text-gray-600">
                        info@homeapp.ae<br />
                        sales@homeapp.ae
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="bg-primary text-white p-3 rounded-lg">
                      <Clock className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">Business Hours</h4>
                      <p className="text-gray-600">
                        Monday - Friday: 9:00 AM - 7:00 PM<br />
                        Saturday: 9:00 AM - 5:00 PM<br />
                        Sunday: By Appointment
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-primary text-white rounded-xl p-8">
                <h3 className="text-xl font-semibold mb-4">Need Immediate Assistance?</h3>
                <p className="mb-6 opacity-90">
                  Our emergency hotline is available 24/7 for urgent property matters and emergency maintenance requests.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <Phone className="h-5 w-5 mr-3" />
                    <span className="font-semibold">Emergency: +971 50 000 0000</span>
                  </div>
                  <div className="flex items-center">
                    <Mail className="h-5 w-5 mr-3" />
                    <span>emergency@homeapp.ae</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Find Our Office</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Located in the heart of Dubai Marina, our office is easily accessible and offers stunning views of the marina.
            </p>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="bg-gray-100 h-96 rounded-lg flex items-center justify-center">
              <div>
                <MapPin className="h-16 w-16 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Interactive Map</h3>
                <p className="text-gray-600 mb-4">Coming Soon - Google Maps Integration</p>
                <p className="text-sm text-gray-500">
                  Marina Plaza, Level 25<br />
                  Dubai Marina, Dubai, UAE
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Live Support Chat Widget */}
      <LiveSupportChat />

      <Footer />
    </div>
  );
};

export default Contact;
