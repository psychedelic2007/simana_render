import React from 'react';
import { motion } from 'framer-motion';
import { Mail, MapPin, Phone } from 'lucide-react';
import ContactForm from '@/components/ContactForm';
import Footer from '../components/Footer';

const Contact = () => {
  const contactInfo = [
    {
      icon: <Mail size={24} />,
      title: "Email",
      details: "compobelisk1@gmail.com",
      link: "mailto:compobelisk1@gmail.com"
    },
    {
      icon: <Phone size={24} />,
      title: "Phone",
      details: "+91-xxxxxxxxxx",
      link: "tel:+91xxxxxxxxxx"
    },
    {
      icon: <MapPin size={24} />,
      title: "Location",
      details: "CompObelisk",
      link: "https://www.compobelisk.com/",
    }
  ];
  
  return (
    <div className="min-h-screen pt-32 pb-20">
      <div className="container px-4 mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto text-center mb-16"
        >
          <span className="pill bg-simana-lightBlue text-simana-blue mb-4">
            Get in Touch
          </span>
          <h1 className="mb-6">Contact Us</h1>
          <p className="text-lg text-muted-foreground">
            Have questions or feedback? We'd love to hear from you.
          </p>
        </motion.div>
        
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
            {contactInfo.map((info, index) => (
              <motion.a
                key={index}
                href={info.link}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="glass rounded-xl p-6 text-center flex flex-col items-center hover:shadow-hover transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-full bg-simana-lightBlue flex items-center justify-center text-simana-blue mb-4">
                  {info.icon}
                </div>
                <h3 className="text-xl font-medium mb-2">{info.title}</h3>
                <p className="text-muted-foreground">{info.details}</p>
              </motion.a>
            ))}
          </div>
          
          <div className="max-w-2xl mx-auto">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-2xl font-semibold mb-8 text-center"
            >
              Send us a Message
            </motion.h2>
            
            <ContactForm />
          </div>
        </div>
      </div>
      <div className="mb-32"></div>
      <Footer />
    </div>
  );
};

export default Contact;
